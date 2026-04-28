'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { EstadoSolicitud } from '@/lib/supabase/database.types'

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

  const { error } = await supabase.from('solicitudes').insert({
    candidato_id: user.id,
    oferta_id: ofertaId,
    cv_id: cv?.id ?? null,
    mensaje: mensaje || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/candidato/dashboard')
  revalidatePath(`/empleo/${ofertaId}`)
  revalidatePath('/dashboard/solicitudes')
  return { ok: true }
}

export async function cambiarEstadoSolicitud(solicitudId: string, estado: EstadoSolicitud) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('solicitudes')
    .update({ estado })
    .eq('id', solicitudId)

  if (error) return { error: error.message }

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
