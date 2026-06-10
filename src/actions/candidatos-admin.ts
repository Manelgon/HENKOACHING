'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { logAction } from '@/lib/audit/log-action'
import type { CandidatoRow, CandidatoPerfil } from '@/features/candidatos/types'
import { requireAdmin } from '@/lib/auth/require-admin'

export async function getCandidatos(): Promise<CandidatoRow[]> {
  const auth = await requireAdmin()
  if (!auth.ok) return []

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

  const [
    cpResult,
    solResult,
    cvsResult,
    expResult,
    eduResult,
  ] = await Promise.all([
    admin.from('candidato_profiles').select('user_id, cargo_actual, ubicacion, tipo_jornada, modalidad_trabajo, sectores_interes'),
    admin.from('solicitudes').select('candidato_id'),
    admin.from('cvs').select('candidato_id, storage_path').eq('es_principal', true).is('deleted_at', null),
    admin.from('candidato_experiencias').select('candidato_id, cargo, empresa, hasta').order('desde', { ascending: false }),
    admin.from('candidato_educacion').select('candidato_id'),
  ])

  type CpRow = { user_id: string; cargo_actual: string | null; ubicacion: string | null; tipo_jornada: string | null; modalidad_trabajo: string | null; sectores_interes: string[] | null }
  type CvRow = { candidato_id: string; storage_path: string }
  type IdRow = { candidato_id: string }
  type ExpRow = { candidato_id: string; cargo: string; empresa: string; hasta: string | null }

  const candidatoProfiles = cpResult.data as CpRow[] | null
  const solicitudes = solResult.data as IdRow[] | null
  const cvs = cvsResult.data as CvRow[] | null
  const experiencias = expResult.data as ExpRow[] | null
  const educacion = eduResult.data as IdRow[] | null

  const cpMap = new Map((candidatoProfiles ?? []).map((cp) => [cp.user_id, cp]))
  const countMap = new Map<string, number>()
  for (const s of solicitudes ?? []) {
    countMap.set(s.candidato_id, (countMap.get(s.candidato_id) ?? 0) + 1)
  }
  const cvMap = new Map((cvs ?? []).map((cv) => [cv.candidato_id, cv.storage_path]))
  const eduSet = new Set((educacion ?? []).map((e) => e.candidato_id))

  // cargo_experiencia: empleo actual (hasta null) o el más reciente
  const expByCandidate = new Map<string, ExpRow[]>()
  for (const e of experiencias ?? []) {
    const arr = expByCandidate.get(e.candidato_id) ?? []
    arr.push(e)
    expByCandidate.set(e.candidato_id, arr)
  }
  function getCargoExp(candidatoId: string): { cargo: string; empresa: string; actual: boolean } | null {
    const exps = expByCandidate.get(candidatoId) ?? []
    if (exps.length === 0) return null
    const exp = exps.find(e => !e.hasta) ?? exps[0]
    return { cargo: exp.cargo, empresa: exp.empresa, actual: !exp.hasta }
  }
  const expSet = new Set(expByCandidate.keys())

  return profiles.map((p) => {
    const cp = cpMap.get(p.id)
    return {
      id: p.id,
      nombre: p.nombre,
      apellidos: p.apellidos,
      email: p.email,
      telefono: p.telefono,
      cargo_actual: cp?.cargo_actual ?? null,
      cargo_experiencia: getCargoExp(p.id)?.cargo ?? null,
      empresa_experiencia: getCargoExp(p.id)?.empresa ?? null,
      exp_es_actual: getCargoExp(p.id)?.actual ?? false,
      ubicacion: cp?.ubicacion ?? null,
      created_at: p.created_at,
      solicitudes_count: countMap.get(p.id) ?? 0,
      es_nuevo: p.created_at
        ? new Date(p.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        : false,
      tipo_jornada: cp?.tipo_jornada ?? null,
      modalidad_trabajo: cp?.modalidad_trabajo ?? null,
      sectores_interes: cp?.sectores_interes ?? null,
      tiene_cv: cvMap.has(p.id),
      cv_storage_path: cvMap.get(p.id) ?? null,
      tiene_experiencia: expSet.has(p.id),
      tiene_educacion: eduSet.has(p.id),
    }
  })
}

export async function getCandidatoPerfil(userId: string): Promise<CandidatoPerfil | null> {
  const auth = await requireAdmin()
  if (!auth.ok) return null

  const admin = createAdminClient()

  const [
    { data: profile },
    { data: cp },
    { data: experiencias },
    { data: educacion },
    { data: idiomas },
    { data: cvs },
    { data: solicitudes },
    { data: notas },
  ] = await Promise.all([
    admin.from('profiles').select('id,nombre,apellidos,email,telefono,created_at,deleted_at').eq('id', userId).maybeSingle(),
    admin.from('candidato_profiles').select('*').eq('user_id', userId).maybeSingle(),
    admin.from('candidato_experiencias').select('*').eq('candidato_id', userId).order('orden'),
    admin.from('candidato_educacion').select('*').eq('candidato_id', userId).order('orden'),
    admin.from('candidato_idiomas').select('*').eq('candidato_id', userId),
    admin.from('cvs').select('*').eq('candidato_id', userId).is('deleted_at', null).order('es_principal', { ascending: false }),
    admin.from('solicitudes').select('id,estado,mensaje,created_at,oferta_id,ofertas(titulo)').eq('candidato_id', userId).order('created_at', { ascending: false }),
    admin.from('candidato_notas').select('id,contenido,created_at,autor_id,profiles!candidato_notas_autor_id_fkey(nombre,apellidos)').eq('candidato_id', userId).order('created_at', { ascending: false }),
  ])

  if (!profile) return null

  type ProfileRow = { id: string; nombre: string | null; apellidos: string | null; email: string; telefono: string | null; deleted_at: string | null }
  type CpRow = { cargo_actual: string | null; ubicacion: string | null; localidad: string | null; cp: string | null; resumen: string | null; linkedin_url: string | null; web_url: string | null; disponibilidad: string | null; pretension_salarial: string | null; tipo_jornada: string | null; modalidad_trabajo: string | null; tipo_contrato: string | null; sectores_interes: string[] | null; fecha_nacimiento: string | null; acepto_privacidad_at: string | null; consent_text: string | null }
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
    localidad: c?.localidad ?? null,
    cp: c?.cp ?? null,
    resumen: c?.resumen ?? null,
    linkedin_url: c?.linkedin_url ?? null,
    web_url: c?.web_url ?? null,
    disponibilidad: c?.disponibilidad ?? null,
    pretension_salarial: c?.pretension_salarial ?? null,
    tipo_jornada: c?.tipo_jornada ?? null,
    modalidad_trabajo: c?.modalidad_trabajo ?? null,
    tipo_contrato: c?.tipo_contrato ?? null,
    sectores_interes: c?.sectores_interes ?? null,
    fecha_nacimiento: c?.fecha_nacimiento ?? null,
    acepto_privacidad_at: c?.acepto_privacidad_at ?? null,
    consent_text: c?.consent_text ?? null,
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
    archivado: !!(p as unknown as ProfileRow).deleted_at,
    solicitudes: ((solicitudes ?? []) as unknown as SolRow[]).map((s) => ({
      id: s.id,
      estado: s.estado as never,
      mensaje: s.mensaje,
      created_at: s.created_at,
      oferta_id: s.oferta_id,
      oferta_titulo: s.ofertas?.titulo ?? '(oferta eliminada)',
    })),
    notas: ((notas ?? []) as unknown as Array<{
      id: string; contenido: string; created_at: string; autor_id: string | null
      profiles: { nombre: string | null; apellidos: string | null } | null
    }>).map((n) => ({
      id: n.id,
      contenido: n.contenido,
      created_at: n.created_at,
      autor_id: n.autor_id,
      autor_nombre: [n.profiles?.nombre, n.profiles?.apellidos].filter(Boolean).join(' ') || 'Admin',
    })),
  }
}

export async function contarCandidatosNuevos(): Promise<number> {
  const auth = await requireAdmin()
  if (!auth.ok) return 0
  const admin = createAdminClient()
  const { count } = await admin
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'candidato')
    .is('deleted_at', null)
    .gt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
  return count ?? 0
}

export async function getCvSignedUrl(storagePath: string): Promise<string | null> {
  const auth = await requireAdmin()
  if (!auth.ok) return null
  const admin = createAdminClient()
  const { data } = await admin.storage.from('cvs').createSignedUrl(storagePath, 600)
  return data?.signedUrl ?? null
}

// ─── Resetear contraseña ─────────────────────────────────────────────────────

export async function resetearPasswordCandidato(candidatoId: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error }

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles').select('email').eq('id', candidatoId).maybeSingle()
  if (!profile?.email) return { error: 'Candidato no encontrado' }

  const { error } = await admin.auth.resetPasswordForEmail(profile.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/update-password`,
  })
  if (error) return { error: error.message }

  await logAction({
    accion: 'candidato.reset_password',
    recursoTipo: 'candidato',
    recursoId: candidatoId,
    recursoLabel: profile.email,
  })

  return { ok: true, email: profile.email }
}

// ─── Notas internas ──────────────────────────────────────────────────────────

export async function getNotasCandidato(candidatoId: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return []

  const admin = createAdminClient()
  const { data } = await admin
    .from('candidato_notas')
    .select('id, contenido, created_at, autor_id, profiles!candidato_notas_autor_id_fkey(nombre, apellidos)')
    .eq('candidato_id', candidatoId)
    .order('created_at', { ascending: false })

  return (data ?? []) as Array<{
    id: string
    contenido: string
    created_at: string
    autor_id: string | null
    profiles: { nombre: string | null; apellidos: string | null } | null
  }>
}

export async function crearNotaCandidato(candidatoId: string, contenido: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error }

  const admin = createAdminClient()
  const { data: nota, error } = await admin.from('candidato_notas').insert({
    candidato_id: candidatoId,
    autor_id: auth.user.id,
    contenido: contenido.trim(),
  }).select('id').single()
  if (error) return { error: error.message }

  await logAction({
    accion: 'candidato.nota_crear',
    recursoTipo: 'candidato',
    recursoId: candidatoId,
    metadata: { nota_id: nota?.id },
  })

  return { ok: true }
}

export async function eliminarNotaCandidato(notaId: string, candidatoId?: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error }

  const admin = createAdminClient()
  const { error } = await admin.from('candidato_notas').delete().eq('id', notaId)
  if (error) return { error: error.message }

  await logAction({
    accion: 'candidato.nota_eliminar',
    recursoTipo: 'candidato',
    recursoId: candidatoId ?? null,
    metadata: { nota_id: notaId },
  })

  return { ok: true }
}

// ─── Vincular candidato a oferta ─────────────────────────────────────────────

export async function vincularCandidatoAOferta(candidatoId: string, ofertaId: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error }

  const admin = createAdminClient()

  const { data: existe } = await admin
    .from('solicitudes')
    .select('id')
    .eq('candidato_id', candidatoId)
    .eq('oferta_id', ofertaId)
    .maybeSingle()
  if (existe) return { error: 'Este candidato ya está vinculado a esa oferta' }

  const { data: sol, error } = await admin.from('solicitudes').insert({
    candidato_id: candidatoId,
    oferta_id: ofertaId,
    estado: 'revisando',
    mensaje: null,
  }).select('id').single()
  if (error) return { error: error.message }

  await logAction({
    accion: 'solicitud.crear_admin',
    recursoTipo: 'solicitud',
    recursoId: sol?.id ?? null,
    metadata: { candidato_id: candidatoId, oferta_id: ofertaId },
  })

  return { ok: true }
}

// ─── Archivar / restaurar candidato ─────────────────────────────────────────

export async function archivarCandidato(candidatoId: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error }

  const admin = createAdminClient()
  const { data: profile } = await admin.from('profiles').select('email').eq('id', candidatoId).maybeSingle()
  const { error } = await admin
    .from('profiles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', candidatoId)
  if (error) return { error: error.message }

  await logAction({
    accion: 'candidato.archivar',
    recursoTipo: 'candidato',
    recursoId: candidatoId,
    recursoLabel: (profile as { email?: string } | null)?.email ?? null,
  })

  return { ok: true }
}

export async function restaurarCandidato(candidatoId: string) {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error }

  const admin = createAdminClient()
  const { data: profile } = await admin.from('profiles').select('email').eq('id', candidatoId).maybeSingle()
  const { error } = await admin
    .from('profiles')
    .update({ deleted_at: null })
    .eq('id', candidatoId)
  if (error) return { error: error.message }

  await logAction({
    accion: 'candidato.restaurar',
    recursoTipo: 'candidato',
    recursoId: candidatoId,
    recursoLabel: (profile as { email?: string } | null)?.email ?? null,
  })

  return { ok: true }
}
