'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAction } from '@/lib/audit/log-action'
import { sendTransactional } from '@/lib/email/send'
import { templateDerechoArcoConfirmacion } from '@/lib/email/templates/rgpd'
import type { RgpdDocId, RgpdDocumento, DerechoArco } from '@/features/rgpd/types'
import type { Json } from '@/lib/supabase/database.types'
import { requireAdmin } from '@/lib/auth/require-admin'

async function requireAdminOrRedirect() {
  const result = await requireAdmin()
  if (!result.ok) redirect('/login')
  return result
}

export async function getRgpdDocumentos(): Promise<RgpdDocumento[]> {
  await requireAdminOrRedirect()
  const supabase = await createClient()
  const { data } = await supabase
    .from('rgpd_documentos')
    .select('*')
    .order('created_at') as { data: RgpdDocumento[] | null }
  return data ?? []
}

export async function guardarDocumento(
  id: RgpdDocId,
  contenido: Record<string, unknown>,
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdminOrRedirect()
  const supabase = await createClient()

  const { error } = await supabase
    .from('rgpd_documentos')
    .update({
      contenido: contenido as Json,
      actualizado_at: new Date().toISOString(),
      actualizado_por: auth.user.email ?? '',
    })
    .eq('id', id)

  if (error) return { ok: false, error: (error as { message: string }).message }

  await logAction({
    accion: 'rgpd.documento.guardar',
    recursoTipo: 'rgpd_documentos',
    recursoId: id,
    recursoLabel: id,
  })

  return { ok: true }
}

export async function getDerechosArco(): Promise<DerechoArco[]> {
  await requireAdminOrRedirect()
  const supabase = await createClient()
  const { data } = await supabase
    .from('derechos_arco')
    .select('*')
    .order('created_at', { ascending: false }) as { data: DerechoArco[] | null }
  return data ?? []
}

export async function cambiarEstadoDerecho(
  id: string,
  estado: 'pendiente' | 'en_proceso' | 'resuelta',
  notas?: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdminOrRedirect()
  const supabase = await createClient()

  const { error } = await supabase
    .from('derechos_arco')
    .update({
      estado,
      ...(estado === 'resuelta' && { resolucion_at: new Date().toISOString() }),
      ...(notas !== undefined && { notas_admin: notas || null }),
    })
    .eq('id', id)

  if (error) return { ok: false, error: (error as { message: string }).message }

  await logAction({
    accion: 'rgpd.derecho_arco.cambiar_estado',
    recursoTipo: 'derechos_arco',
    recursoId: id,
    metadata: { estado },
  })

  return { ok: true }
}

export async function crearDerechoArco(input: {
  nombre: string
  email: string
  tipo_derecho: 'acceso' | 'rectificacion' | 'supresion' | 'portabilidad' | 'oposicion' | 'limitacion'
  descripcion: string
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('derechos_arco')
    .insert(input)

  if (error) return { ok: false, error: (error as { message: string }).message }

  await logAction({
    accion: 'rgpd.derecho_arco.solicitud',
    recursoTipo: 'derechos_arco',
    metadata: { tipo: input.tipo_derecho },
  })

  // Email de confirmación al solicitante (fire-and-forget)
  sendTransactional({
    to: input.email,
    subject: 'Hemos recibido tu solicitud de derechos RGPD — HenKoaching',
    html: templateDerechoArcoConfirmacion({ nombre: input.nombre, tipo_derecho: input.tipo_derecho }),
    tipo: 'rgpd.confirmacion_derecho',
    metadata: { tipo_derecho: input.tipo_derecho },
  }).catch(() => undefined)

  return { ok: true }
}

export type ConsentimientoRow = {
  tipo: 'candidato' | 'lead'
  nombre: string
  email: string
  fecha: string
  consent_text: string | null
}

export async function getConsentimientos(): Promise<ConsentimientoRow[]> {
  await requireAdminOrRedirect()
  const admin = createAdminClient()

  type CandidatoConsent = {
    acepto_privacidad_at: string
    consent_text: string | null
    profiles: { nombre: string | null; apellidos: string | null; email: string }
  }
  type LeadConsent = {
    nombre: string
    email: string
    acepto_privacidad_at: string
    consent_text: string | null
  }

  const [candidatosRes, leadsRes] = await Promise.all([
    admin
      .from('candidato_profiles')
      .select('acepto_privacidad_at, consent_text, profiles!inner(nombre, apellidos, email)')
      .not('acepto_privacidad_at', 'is', null)
      .order('acepto_privacidad_at', { ascending: false }),
    admin
      .from('leads')
      .select('nombre, email, acepto_privacidad_at, consent_text')
      .not('acepto_privacidad_at', 'is', null)
      .order('acepto_privacidad_at', { ascending: false }),
  ])

  if (candidatosRes.error) throw new Error('Error cargando consentimientos de candidatos: ' + candidatosRes.error.message)
  if (leadsRes.error) throw new Error('Error cargando consentimientos de leads: ' + leadsRes.error.message)

  const candidatos: ConsentimientoRow[] = ((candidatosRes.data ?? []) as unknown as CandidatoConsent[]).map(c => ({
    tipo: 'candidato',
    nombre: [c.profiles.nombre, c.profiles.apellidos].filter(Boolean).join(' ') || c.profiles.email,
    email: c.profiles.email,
    fecha: c.acepto_privacidad_at,
    consent_text: c.consent_text,
  }))

  const leads: ConsentimientoRow[] = ((leadsRes.data ?? []) as unknown as LeadConsent[]).map(l => ({
    tipo: 'lead',
    nombre: l.nombre,
    email: l.email,
    fecha: l.acepto_privacidad_at,
    consent_text: l.consent_text,
  }))

  return [...candidatos, ...leads].sort((a, b) => b.fecha.localeCompare(a.fecha))
}
