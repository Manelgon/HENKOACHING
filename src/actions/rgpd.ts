'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logAction } from '@/lib/audit/log-action'
import { sendTransactional } from '@/lib/email/send'
import { templateDerechoArcoConfirmacion } from '@/lib/email/templates/rgpd'
import type { RgpdDocId, RgpdDocumento, DerechoArco } from '@/features/rgpd/types'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')
  return { supabase, user }
}

export async function getRgpdDocumentos(): Promise<RgpdDocumento[]> {
  const { supabase } = await requireAdmin()
  const { data } = await supabase
    .from('rgpd_documentos' as never)
    .select('*')
    .order('created_at') as { data: RgpdDocumento[] | null }
  return data ?? []
}

export async function guardarDocumento(
  id: RgpdDocId,
  contenido: Record<string, unknown>,
): Promise<{ ok: boolean; error?: string }> {
  const { supabase, user } = await requireAdmin()

  const { error } = await supabase
    .from('rgpd_documentos' as never)
    .update({
      contenido,
      actualizado_at: new Date().toISOString(),
      actualizado_por: user.email ?? '',
    } as never)
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
  const { supabase } = await requireAdmin()
  const { data } = await supabase
    .from('derechos_arco' as never)
    .select('*')
    .order('created_at', { ascending: false }) as { data: DerechoArco[] | null }
  return data ?? []
}

export async function cambiarEstadoDerecho(
  id: string,
  estado: 'pendiente' | 'en_proceso' | 'resuelta',
  notas?: string,
): Promise<{ ok: boolean; error?: string }> {
  const { supabase } = await requireAdmin()

  const updates: Record<string, unknown> = { estado }
  if (estado === 'resuelta') updates.resolucion_at = new Date().toISOString()
  if (notas !== undefined) updates.notas_admin = notas || null

  const { error } = await supabase
    .from('derechos_arco' as never)
    .update(updates as never)
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
  tipo_derecho: string
  descripcion: string
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('derechos_arco' as never)
    .insert(input as never)

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
  const { supabase } = await requireAdmin()
  const { createAdminClient } = await import('@/lib/supabase/admin')
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
      .from('candidato_profiles' as never)
      .select('acepto_privacidad_at, consent_text, profiles!inner(nombre, apellidos, email)')
      .not('acepto_privacidad_at' as never, 'is', null)
      .order('acepto_privacidad_at' as never, { ascending: false }),
    supabase
      .from('leads')
      .select('nombre, email, acepto_privacidad_at, consent_text')
      .not('acepto_privacidad_at' as never, 'is', null)
      .order('acepto_privacidad_at' as never, { ascending: false }),
  ])

  const candidatosData = ((candidatosRes.data ?? []) as unknown as CandidatoConsent[])
  const leadsData = ((leadsRes.data ?? []) as unknown as LeadConsent[])

  const candidatos: ConsentimientoRow[] = candidatosData.map(c => ({
    tipo: 'candidato',
    nombre: [c.profiles.nombre, c.profiles.apellidos].filter(Boolean).join(' ') || c.profiles.email,
    email: c.profiles.email,
    fecha: c.acepto_privacidad_at,
    consent_text: c.consent_text,
  }))

  const leads: ConsentimientoRow[] = leadsData.map(l => ({
    tipo: 'lead',
    nombre: l.nombre,
    email: l.email,
    fecha: l.acepto_privacidad_at,
    consent_text: l.consent_text,
  }))

  return [...candidatos, ...leads].sort((a, b) => b.fecha.localeCompare(a.fecha))
}
