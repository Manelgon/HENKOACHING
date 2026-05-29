'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAction } from '@/lib/audit/log-action'
import { sendTransactional } from '@/lib/email/send'
import { templateCandidaturaCandidato, templateCandidaturaAdmin } from '@/lib/email/templates/candidatura'
import { templateEstadoSolicitud } from '@/lib/email/templates/estado-solicitud'
import type { EstadoSolicitud } from '@/lib/supabase/database.types'

const ESTADOS_CON_EMAIL: EstadoSolicitud[] = ['revisando', 'entrevista', 'contratado', 'descartado']

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

      const [{ data: perfil }, { data: oferta }] = await Promise.all([
        admin.from('profiles').select('email, nombre, apellidos').eq('id', user.id).single(),
        admin.from('ofertas').select('titulo, empresa_oculta, clientes(nombre)').eq('id', ofertaId).single(),
      ])

      const nombreCandidato = [perfil?.nombre, perfil?.apellidos].filter(Boolean).join(' ') || 'Candidato'
      const clienteData = oferta?.clientes as { nombre: string } | null
      const nombreEmpresa = oferta?.empresa_oculta ? 'empresa confidencial' : (clienteData?.nombre ?? '')

      if (perfil?.email) {
        await sendTransactional({
          to: perfil.email,
          subject: `Tu candidatura ha sido recibida — ${oferta?.titulo ?? ''}`,
          html: templateCandidaturaCandidato({
            candidatoNombre: nombreCandidato,
            ofertaTitulo: oferta?.titulo ?? '',
            empresaNombre: nombreEmpresa,
            siteUrl,
          }),
          tipo: 'candidatura.candidato',
          metadata: { solicitud_id: nueva?.id, oferta_id: ofertaId, candidato_id: user.id },
        })
      }

      const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL
      if (adminEmail && perfil?.email) {
        await sendTransactional({
          to: adminEmail,
          subject: `Nueva candidatura — ${nombreCandidato}`,
          html: templateCandidaturaAdmin({
            candidatoNombre: nombreCandidato,
            candidatoEmail: perfil.email,
            ofertaTitulo: oferta?.titulo ?? '',
            perfilUrl: `${siteUrl}/dashboard/candidatos/${user.id}`,
            siteUrl,
          }),
          tipo: 'candidatura.admin',
          metadata: { solicitud_id: nueva?.id, oferta_id: ofertaId, candidato_id: user.id },
        })
      }
    } catch (e) {
      console.error('[email] hook aplicarAOferta:', e)
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
    .update({ estado })
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

        const [{ data: perfil }, { data: oferta }] = await Promise.all([
          admin.from('profiles').select('email, nombre, apellidos').eq('id', candidatoId).single(),
          ofertaId
            ? admin.from('ofertas').select('titulo').eq('id', ofertaId).single()
            : Promise.resolve({ data: null }),
        ])

        if (!perfil?.email) return

        const nombreCandidato = [perfil.nombre, perfil.apellidos].filter(Boolean).join(' ') || 'Candidato'

        await sendTransactional({
          to: perfil.email,
          subject: `Actualización de tu candidatura — ${oferta?.titulo ?? ''}`,
          html: templateEstadoSolicitud({
            candidatoNombre: nombreCandidato,
            ofertaTitulo: oferta?.titulo ?? '',
            estado,
            siteUrl,
          }),
          tipo: 'cambio_estado',
          metadata: { solicitud_id: solicitudId, candidato_id: candidatoId, estado },
        })
      } catch (e) {
        console.error('[email] hook cambiarEstadoSolicitud:', e)
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
