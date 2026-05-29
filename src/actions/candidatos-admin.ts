'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { CandidatoRow, CandidatoPerfil } from '@/features/candidatos/types'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' as const }
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (!profile || profile.role !== 'admin') return { error: 'Sin permisos' as const }
  return { user, profile }
}

export async function getCandidatos(): Promise<CandidatoRow[]> {
  const admin = createAdminClient()

  const { data: profiles } = await admin
    .from('profiles')
    .select('id, nombre, apellidos, email, telefono, created_at')
    .eq('role', 'candidato')
    .is('deleted_at', null)
    .order('created_at', { ascending: false }) as { data: Array<{
      id: string; nombre: string | null; apellidos: string | null
      email: string; telefono: string | null; created_at: string | null
    }> | null }

  if (!profiles) return []

  const { data: candidatoProfiles } = await admin
    .from('candidato_profiles')
    .select('user_id, cargo_actual, ubicacion') as { data: Array<{
      user_id: string; cargo_actual: string | null; ubicacion: string | null
    }> | null }

  const { data: solicitudes } = await admin
    .from('solicitudes')
    .select('candidato_id') as { data: Array<{ candidato_id: string }> | null }

  const cpMap = new Map((candidatoProfiles ?? []).map((cp) => [cp.user_id, cp]))
  const countMap = new Map<string, number>()
  for (const s of solicitudes ?? []) {
    countMap.set(s.candidato_id, (countMap.get(s.candidato_id) ?? 0) + 1)
  }

  return profiles.map((p) => {
    const cp = cpMap.get(p.id)
    return {
      id: p.id,
      nombre: p.nombre,
      apellidos: p.apellidos,
      email: p.email,
      telefono: p.telefono,
      cargo_actual: cp?.cargo_actual ?? null,
      ubicacion: cp?.ubicacion ?? null,
      created_at: p.created_at,
      solicitudes_count: countMap.get(p.id) ?? 0,
    }
  })
}

export async function getCandidatoPerfil(userId: string): Promise<CandidatoPerfil | null> {
  const auth = await requireAdmin()
  if ('error' in auth) return null

  const admin = createAdminClient()

  const [
    { data: profile },
    { data: cp },
    { data: experiencias },
    { data: educacion },
    { data: idiomas },
    { data: cvs },
    { data: solicitudes },
  ] = await Promise.all([
    admin.from('profiles').select('id,nombre,apellidos,email,telefono,created_at').eq('id', userId).maybeSingle(),
    admin.from('candidato_profiles').select('*').eq('user_id', userId).maybeSingle(),
    admin.from('candidato_experiencias').select('*').eq('candidato_id', userId).order('orden'),
    admin.from('candidato_educacion').select('*').eq('candidato_id', userId).order('orden'),
    admin.from('candidato_idiomas').select('*').eq('candidato_id', userId),
    admin.from('cvs').select('*').eq('candidato_id', userId).is('deleted_at', null).order('es_principal', { ascending: false }),
    admin.from('solicitudes').select('id,estado,mensaje,created_at,oferta_id,ofertas(titulo)').eq('candidato_id', userId).order('created_at', { ascending: false }),
  ])

  if (!profile) return null

  type ProfileRow = { id: string; nombre: string | null; apellidos: string | null; email: string; telefono: string | null }
  type CpRow = { cargo_actual: string | null; ubicacion: string | null; resumen: string | null; linkedin_url: string | null; web_url: string | null; disponibilidad: string | null; pretension_salarial: string | null }
  type ExpRow = { id: string; empresa: string; cargo: string; desde: string | null; hasta: string | null; descripcion: string | null }
  type EduRow = { id: string; centro: string; titulo: string; ano_fin: string | null }
  type IdiomaRow = { id: string; idioma: string; nivel: string }
  type CvRow = { id: string; nombre_archivo: string; storage_path: string; es_principal: boolean | null }
  type SolRow = { id: string; estado: string; mensaje: string | null; created_at: string | null; oferta_id: string; ofertas: { titulo: string } | null }

  const p = profile as unknown as ProfileRow
  const c = cp as unknown as CpRow | null

  return {
    id: p.id,
    nombre: p.nombre,
    apellidos: p.apellidos,
    email: p.email,
    telefono: p.telefono,
    cargo_actual: c?.cargo_actual ?? null,
    ubicacion: c?.ubicacion ?? null,
    resumen: c?.resumen ?? null,
    linkedin_url: c?.linkedin_url ?? null,
    web_url: c?.web_url ?? null,
    disponibilidad: c?.disponibilidad ?? null,
    pretension_salarial: c?.pretension_salarial ?? null,
    experiencias: ((experiencias ?? []) as unknown as ExpRow[]).map((e) => ({
      id: e.id, empresa: e.empresa, cargo: e.cargo, desde: e.desde, hasta: e.hasta, descripcion: e.descripcion,
    })),
    educacion: ((educacion ?? []) as unknown as EduRow[]).map((e) => ({
      id: e.id, centro: e.centro, titulo: e.titulo, ano_fin: e.ano_fin,
    })),
    idiomas: ((idiomas ?? []) as unknown as IdiomaRow[]).map((i) => ({
      id: i.id, idioma: i.idioma, nivel: i.nivel,
    })),
    cvs: ((cvs ?? []) as unknown as CvRow[]).map((cv) => ({
      id: cv.id, nombre_archivo: cv.nombre_archivo, storage_path: cv.storage_path, es_principal: cv.es_principal,
    })),
    solicitudes: ((solicitudes ?? []) as unknown as SolRow[]).map((s) => ({
      id: s.id,
      estado: s.estado as never,
      mensaje: s.mensaje,
      created_at: s.created_at,
      oferta_id: s.oferta_id,
      oferta_titulo: s.ofertas?.titulo ?? '(oferta eliminada)',
    })),
  }
}

export async function getCvSignedUrl(storagePath: string): Promise<string | null> {
  const auth = await requireAdmin()
  if ('error' in auth) return null
  const admin = createAdminClient()
  const { data } = await admin.storage.from('cvs').createSignedUrl(storagePath, 600)
  return data?.signedUrl ?? null
}
