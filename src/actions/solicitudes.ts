'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAction } from '@/lib/audit/log-action'
import { sendTransactional } from '@/lib/email/send'
import { templateCandidaturaCandidato, templateCandidaturaAdmin } from '@/lib/email/templates/candidatura'
import { templateEstadoSolicitud } from '@/lib/email/templates/estado-solicitud'
import { createCalendarEvent } from '@/actions/google-calendar'
import { getTaskLists, createTask } from '@/actions/google-tasks'
import type { EstadoSolicitud } from '@/lib/supabase/database.types'

const ESTADOS_CON_EMAIL: EstadoSolicitud[] = ['revisando', 'entrevista', 'contratado', 'descartado']

const ESTADO_LABEL: Record<string, string> = {
  revisando: 'En revisión',
  entrevista: 'Entrevista',
  contratado: 'Seleccionado',
  descartado: 'Proceso cerrado',
}

function interpolate(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce((t, [k, v]) => t.replaceAll(`{{${k}}}`, v), template)
}

export async function aplicarAOferta(ofertaId: string, mensaje?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Necesitas iniciar sesión para aplicar' }

  // Verificar que es candidato
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'candidato') {
    return { error: 'Solo los candidatos pueden aplicar a ofertas' }
  }

  // Obtener CV principal
  const { data: cv } = await supabase
    .from('cvs')
    .select('id')
    .eq('candidato_id', user.id)
    .eq('es_principal', true)
    .is('deleted_at', null)
    .maybeSingle()

  // Verificar si ya aplicó
  const { data: existing } = await supabase
    .from('solicitudes')
    .select('id')
    .eq('candidato_id', user.id)
    .eq('oferta_id', ofertaId)
    .maybeSingle()

  if (existing) return { error: 'Ya has aplicado a esta oferta' }

  const { data: nueva, error } = await supabase.from('solicitudes').insert({
    candidato_id: user.id,
    oferta_id: ofertaId,
    cv_id: cv?.id ?? null,
    mensaje: mensaje || null,
  }).select('id').single()

  if (error) return { error: error.message }

  await logAction({
    accion: 'solicitud.crear',
    recursoTipo: 'solicitud',
    recursoId: nueva?.id ?? null,
    recursoLabel: user.email ?? null,
    metadata: { oferta_id: ofertaId, cv_id: cv?.id ?? null },
  })

  // Fire-and-forget: emails de confirmación al candidato y a Jennifer
  ;(async () => {
    try {
      const admin = createAdminClient()
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://henkoaching.com'

      const [{ data: perfil }, { data: oferta }, { data: tmpl }] = await Promise.all([
        admin.from('profiles').select('email, nombre, apellidos').eq('id', user.id).single(),
        admin.from('ofertas').select('titulo, empresa_oculta, clientes(nombre)').eq('id', ofertaId).single(),
        admin.from('email_settings' as never).select(
          'subject_candidatura_candidato, template_candidatura_candidato, subject_candidatura_admin, template_candidatura_admin'
        ).eq('id', 1).maybeSingle() as unknown as Promise<{ data: Record<string, string | null> | null }>,
      ])

      const nombreCandidato = [perfil?.nombre, perfil?.apellidos].filter(Boolean).join(' ') || 'Candidato'
      const clienteData = oferta?.clientes as { nombre: string } | null
      const nombreEmpresa = oferta?.empresa_oculta ? 'empresa confidencial' : (clienteData?.nombre ?? '')

      if (perfil?.email) {
        const vars = { candidatoNombre: nombreCandidato, ofertaTitulo: oferta?.titulo ?? '', empresaNombre: nombreEmpresa }
        const subject = tmpl?.subject_candidatura_candidato
          ? interpolate(tmpl.subject_candidatura_candidato, vars)
          : `Tu candidatura ha sido recibida — ${oferta?.titulo ?? ''}`
        const html = tmpl?.template_candidatura_candidato
          ? interpolate(tmpl.template_candidatura_candidato, vars)
          : templateCandidaturaCandidato({ ...vars, siteUrl })
        await sendTransactional({ to: perfil.email, subject, html, tipo: 'candidatura.candidato', metadata: { solicitud_id: nueva?.id, oferta_id: ofertaId, candidato_id: user.id } })
      }

      const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL
      if (adminEmail && perfil?.email) {
        const perfilUrl = `${siteUrl}/dashboard/candidatos/${user.id}`
        const vars = { candidatoNombre: nombreCandidato, candidatoEmail: perfil.email, ofertaTitulo: oferta?.titulo ?? '', perfilUrl }
        const subject = tmpl?.subject_candidatura_admin
          ? interpolate(tmpl.subject_candidatura_admin, vars)
          : `Nueva candidatura — ${nombreCandidato}`
        const html = tmpl?.template_candidatura_admin
          ? interpolate(tmpl.template_candidatura_admin, vars)
          : templateCandidaturaAdmin({ ...vars, siteUrl })
        await sendTransactional({ to: adminEmail, subject, html, tipo: 'candidatura.admin', metadata: { solicitud_id: nueva?.id, oferta_id: ofertaId, candidato_id: user.id } })
      }
    } catch (e) {
      console.error('[email] hook aplicarAOferta:', e instanceof Error ? e.message : String(e))
    }
  })()

  revalidatePath('/candidato/dashboard')
  revalidatePath(`/empleo/${ofertaId}`)
  revalidatePath('/dashboard/solicitudes')
  return { ok: true }
}

export async function cambiarEstadoSolicitud(solicitudId: string, estado: EstadoSolicitud) {
  const supabase = await createClient()

  const { data: anterior } = await supabase
    .from('solicitudes')
    .select('estado, candidato_id, oferta_id')
    .eq('id', solicitudId)
    .maybeSingle()

  const { error } = await supabase
    .from('solicitudes')
    .update({ estado, updated_at: new Date().toISOString() })
    .eq('id', solicitudId)

  if (error) return { error: error.message }

  await logAction({
    accion: 'solicitud.cambiar_estado',
    recursoTipo: 'solicitud',
    recursoId: solicitudId,
    metadata: { estado_anterior: anterior?.estado ?? null, estado_nuevo: estado },
  })

  // Fire-and-forget: email al candidato cuando el estado es relevante
  if (ESTADOS_CON_EMAIL.includes(estado) && anterior?.candidato_id) {
    const candidatoId = anterior.candidato_id
    const ofertaId = anterior.oferta_id as string | null
    ;(async () => {
      try {
        const admin = createAdminClient()
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://henkoaching.com'

        const [{ data: perfil }, { data: oferta }, { data: tmpl }] = await Promise.all([
          admin.from('profiles').select('email, nombre, apellidos').eq('id', candidatoId).single(),
          ofertaId
            ? admin.from('ofertas').select('titulo').eq('id', ofertaId).single()
            : Promise.resolve({ data: null }),
          admin.from('email_settings' as never).select(
            'subject_cambio_estado, template_cambio_estado'
          ).eq('id', 1).maybeSingle() as unknown as Promise<{ data: Record<string, string | null> | null }>,
        ])

        if (!perfil?.email) return

        const nombreCandidato = [perfil.nombre, perfil.apellidos].filter(Boolean).join(' ') || 'Candidato'
        const estadoLabel = ESTADO_LABEL[estado] ?? estado

        const vars = { candidatoNombre: nombreCandidato, ofertaTitulo: oferta?.titulo ?? '', estadoLabel }
        const subject = tmpl?.subject_cambio_estado
          ? interpolate(tmpl.subject_cambio_estado, vars)
          : `Actualización de tu candidatura — ${oferta?.titulo ?? ''}`
        const html = tmpl?.template_cambio_estado
          ? interpolate(tmpl.template_cambio_estado, vars)
          : templateEstadoSolicitud({ candidatoNombre: nombreCandidato, ofertaTitulo: oferta?.titulo ?? '', estado, siteUrl })

        await sendTransactional({
          to: perfil.email,
          subject,
          html,
          tipo: 'cambio_estado',
          metadata: { solicitud_id: solicitudId, candidato_id: candidatoId, estado },
        })
      } catch (e) {
        console.error('[email] hook cambiarEstadoSolicitud:', e instanceof Error ? e.message : String(e))
      }
    })()
  }

  revalidatePath('/dashboard/solicitudes')
  revalidatePath('/candidato/dashboard')
  return { ok: true }
}

export async function getCvUrl(storagePath: string): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase.storage
    .from('cvs')
    .createSignedUrl(storagePath, 60 * 10) // 10 minutos

  if (error || !data) return { error: error?.message || 'No se pudo generar URL' }
  return { url: data.signedUrl }
}

// ─── Agendar entrevista ──────────────────────────────────────────────────────
// Crea el evento en Google Calendar, opcionalmente una tarea de seguimiento en
// Google Tasks, y pasa la solicitud a estado "entrevista".
const AgendarEntrevistaSchema = z.object({
  solicitudId: z.string().uuid(),
  candidatoNombre: z.string().min(1),
  candidatoEmail: z.string().email(),
  ofertaTitulo: z.string().default(''),
  start: z.string().min(1), // local naive "YYYY-MM-DDTHH:mm:ss" (Europe/Madrid)
  end: z.string().min(1),
  invitarCandidato: z.boolean(),
  crearTarea: z.boolean(),
})

export type AgendarEntrevistaInput = z.infer<typeof AgendarEntrevistaSchema>

export async function agendarEntrevista(input: AgendarEntrevistaInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'admin') return { error: 'Sin permisos' }

  const parsed = AgendarEntrevistaSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  const d = parsed.data

  try {
    await createCalendarEvent({
      title: `Entrevista — ${d.candidatoNombre}`,
      start: d.start,
      end: d.end,
      description: d.ofertaTitulo ? `Entrevista para la oferta: ${d.ofertaTitulo}` : undefined,
      attendees: d.invitarCandidato ? [d.candidatoEmail] : undefined,
      addMeet: d.invitarCandidato,
    })
  } catch (e) {
    return { error: `No se pudo crear el evento en el calendario: ${e instanceof Error ? e.message : 'error desconocido'}` }
  }

  // Tarea de seguimiento (no abortamos si falla: el evento ya está creado)
  let tareaCreada = false
  if (d.crearTarea) {
    try {
      const lists = await getTaskLists()
      if (lists[0]) {
        await createTask(lists[0].id, {
          title: `Preparar entrevista con ${d.candidatoNombre}`,
          notes: d.ofertaTitulo || undefined,
          due: d.start.split('T')[0],
        })
        tareaCreada = true
      }
    } catch (e) {
      console.error('[agendarEntrevista] tarea:', e instanceof Error ? e.message : String(e))
    }
  }

  await logAction({
    accion: 'solicitud.agendar_entrevista',
    recursoTipo: 'solicitud',
    recursoId: d.solicitudId,
    recursoLabel: d.candidatoNombre,
    metadata: { start: d.start, invitado: d.invitarCandidato, tarea: tareaCreada },
  })

  // Pasar a estado "entrevista" (reutiliza email al candidato + audit + revalidate)
  await cambiarEstadoSolicitud(d.solicitudId, 'entrevista')

  revalidatePath('/dashboard/solicitudes')
  return { ok: true, tareaCreada }
}
