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
