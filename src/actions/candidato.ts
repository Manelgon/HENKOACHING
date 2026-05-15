'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAction } from '@/lib/audit/log-action'
import type { NivelIdioma } from '@/lib/supabase/database.types'

type ExperienciaInput = { empresa: string; cargo: string; desde: string; hasta: string }
type EducacionInput = { centro: string; titulo: string; ano: string }
type IdiomaInput = { idioma: string; nivel: string }

export type CandidatoSignupInput = {
  nombre: string
  apellidos: string
  email: string
  password: string
  telefono: string
  ubicacion: string
  cargo: string
  experiencias: ExperienciaInput[]
  educacion: EducacionInput[]
  idiomas: IdiomaInput[]
}

const NIVELES_VALIDOS: NivelIdioma[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Nativo']

export async function signupCandidato(input: CandidatoSignupInput) {
  const supabase = await createClient()

  // 1. Crear usuario en auth (el trigger crea profile + candidato_profile)
  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        nombre: input.nombre,
        apellidos: input.apellidos,
        role: 'candidato',
      },
    },
  })

  if (signupError || !signupData.user) {
    return { error: signupError?.message || 'No se pudo crear la cuenta' }
  }

  const userId = signupData.user.id

  // 2. Actualizar candidato_profiles con datos extra
  const { error: profileError } = await supabase
    .from('candidato_profiles')
    .update({
      ubicacion: input.ubicacion || null,
      cargo_actual: input.cargo || null,
    })
    .eq('user_id', userId)

  if (profileError) {
    return { error: 'Error guardando perfil: ' + profileError.message }
  }

  // 3. Actualizar telefono en profiles
  if (input.telefono) {
    await supabase
      .from('profiles')
      .update({ telefono: input.telefono })
      .eq('id', userId)
  }

  // 4. Insertar experiencias
  const experienciasValidas = input.experiencias.filter((e) => e.empresa.trim() && e.cargo.trim())
  if (experienciasValidas.length > 0) {
    await supabase.from('candidato_experiencias').insert(
      experienciasValidas.map((e, i) => ({
        candidato_id: userId,
        empresa: e.empresa,
        cargo: e.cargo,
        desde: e.desde || null,
        hasta: e.hasta || null,
        orden: i,
      })),
    )
  }

  // 5. Insertar educación
  const educacionValida = input.educacion.filter((e) => e.centro.trim() && e.titulo.trim())
  if (educacionValida.length > 0) {
    await supabase.from('candidato_educacion').insert(
      educacionValida.map((e, i) => ({
        candidato_id: userId,
        centro: e.centro,
        titulo: e.titulo,
        ano_fin: e.ano || null,
        orden: i,
      })),
    )
  }

  // 6. Insertar idiomas
  const idiomasValidos = input.idiomas.filter(
    (i) => i.idioma.trim() && NIVELES_VALIDOS.includes(i.nivel as NivelIdioma),
  )
  if (idiomasValidos.length > 0) {
    await supabase.from('candidato_idiomas').insert(
      idiomasValidos.map((i, idx) => ({
        candidato_id: userId,
        idioma: i.idioma,
        nivel: i.nivel as NivelIdioma,
        orden: idx,
      })),
    )
  }

  await logAction({
    accion: 'profile.signup_candidato',
    recursoTipo: 'profile',
    recursoId: userId,
    recursoLabel: input.email,
    metadata: {
      experiencias: experienciasValidas.length,
      educacion: educacionValida.length,
      idiomas: idiomasValidos.length,
    },
    actorId: userId,
    actorEmail: input.email,
  })

  return { ok: true, userId }
}

export async function uploadCv(formData: FormData): Promise<{ error?: string; cvId?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  const file = formData.get('cv') as File | null
  if (!file || file.size === 0) return { error: 'Sin archivo' }
  if (file.type !== 'application/pdf') return { error: 'Solo se permite PDF' }
  if (file.size > 5 * 1024 * 1024) return { error: 'Máximo 5MB' }

  const cvId = crypto.randomUUID()
  const path = `${user.id}/${cvId}.pdf`

  const { error: uploadError } = await supabase.storage
    .from('cvs')
    .upload(path, file, { contentType: 'application/pdf', upsert: false })

  if (uploadError) return { error: 'Error subiendo: ' + uploadError.message }

  // Marcar como principal y desmarcar los anteriores
  await supabase
    .from('cvs')
    .update({ es_principal: false })
    .eq('candidato_id', user.id)
    .eq('es_principal', true)

  const { error: insertError } = await supabase.from('cvs').insert({
    id: cvId,
    candidato_id: user.id,
    nombre_archivo: file.name,
    storage_path: path,
    tamano_bytes: file.size,
    es_principal: true,
  })

  if (insertError) {
    await supabase.storage.from('cvs').remove([path])
    return { error: 'Error guardando: ' + insertError.message }
  }

  await logAction({
    accion: 'cv.subir',
    recursoTipo: 'cv',
    recursoId: cvId,
    recursoLabel: file.name,
    metadata: { tamano_bytes: file.size },
  })

  revalidatePath('/candidato/dashboard')
  return { cvId }
}

export async function actualizarPerfilCandidato(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const nombre = formData.get('nombre') as string
  const apellidos = formData.get('apellidos') as string
  const telefono = formData.get('telefono') as string
  const ubicacion = formData.get('ubicacion') as string
  const cargo = formData.get('cargo') as string

  const { error: e1 } = await supabase
    .from('profiles')
    .update({ nombre, apellidos, telefono })
    .eq('id', user.id)

  if (e1) return { error: e1.message }

  const { error: e2 } = await supabase
    .from('candidato_profiles')
    .update({ ubicacion, cargo_actual: cargo })
    .eq('user_id', user.id)

  if (e2) return { error: e2.message }

  await logAction({
    accion: 'profile.editar_propio',
    recursoTipo: 'profile',
    recursoId: user.id,
    recursoLabel: user.email ?? null,
    metadata: { campos: ['nombre', 'apellidos', 'telefono', 'ubicacion', 'cargo_actual'] },
  })

  revalidatePath('/candidato/dashboard')
  return { ok: true }
}

export async function loginCandidato(email: string, password: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user) {
    await logAction({
      accion: 'auth.login_fallido',
      recursoTipo: 'auth',
      recursoLabel: email,
      metadata: { motivo: error?.message ?? 'desconocido', portal: 'candidato' },
      actorEmail: email,
    })
    return { error: error?.message || 'Email o contraseña incorrectos' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  if (profile?.role !== 'candidato') {
    await supabase.auth.signOut()
    return { error: 'Esta cuenta no es de candidato' }
  }

  await logAction({
    accion: 'auth.login',
    recursoTipo: 'auth',
    recursoId: data.user.id,
    recursoLabel: data.user.email ?? email,
    metadata: { portal: 'candidato' },
    actorId: data.user.id,
    actorEmail: data.user.email ?? email,
  })

  revalidatePath('/', 'layout')
  return { redirectTo: '/candidato/dashboard' }
}

// =============================================================================
// RGPD: derecho de acceso/portabilidad (art. 15 y 20 RGPD)
// =============================================================================
export async function exportarMisDatos() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const [
    { data: profile },
    { data: candProfile },
    { data: experiencias },
    { data: educacion },
    { data: idiomas },
    { data: cvs },
    { data: solicitudes },
  ] = await Promise.all([
    supabase.from('profiles')
      .select('id, email, role, nombre, apellidos, telefono, avatar_url, created_at, updated_at')
      .eq('id', user.id).single(),
    supabase.from('candidato_profiles')
      .select('ubicacion, cargo_actual, resumen, linkedin_url, web_url, disponibilidad, pretension_salarial, created_at, updated_at')
      .eq('user_id', user.id).single(),
    supabase.from('candidato_experiencias')
      .select('empresa, cargo, desde, hasta, descripcion, orden, created_at')
      .eq('candidato_id', user.id).order('orden'),
    supabase.from('candidato_educacion')
      .select('centro, titulo, ano_fin, orden, created_at')
      .eq('candidato_id', user.id).order('orden'),
    supabase.from('candidato_idiomas')
      .select('idioma, nivel, orden, created_at')
      .eq('candidato_id', user.id).order('orden'),
    supabase.from('cvs')
      .select('id, nombre_archivo, storage_path, tamano_bytes, es_principal, created_at')
      .eq('candidato_id', user.id).is('deleted_at', null),
    supabase.from('solicitudes')
      .select('id, estado, mensaje, created_at, updated_at, ofertas(slug, titulo, empresas(nombre))')
      .eq('candidato_id', user.id),
  ])

  await logAction({
    accion: 'rgpd.exportar_datos',
    recursoTipo: 'profile',
    recursoId: user.id,
    recursoLabel: user.email ?? null,
    metadata: {
      experiencias: experiencias?.length ?? 0,
      educacion: educacion?.length ?? 0,
      idiomas: idiomas?.length ?? 0,
      cvs: cvs?.length ?? 0,
      solicitudes: solicitudes?.length ?? 0,
    },
  })

  return {
    ok: true,
    data: {
      _meta: {
        formato: 'json',
        version: 1,
        exportado_en: new Date().toISOString(),
        responsable: {
          nombre: 'Jennifer Cervera Alzate',
          nif: '43209692Y',
          email: 'info@henkoaching.com',
        },
        nota: 'Exportación de datos personales realizada en cumplimiento de los artículos 15 y 20 del Reglamento (UE) 2016/679 (RGPD). Los archivos PDF de CVs no se incluyen en este JSON; puedes descargarlos individualmente desde tu área privada.',
      },
      cuenta: profile,
      perfil_candidato: candProfile,
      experiencia_laboral: experiencias ?? [],
      educacion: educacion ?? [],
      idiomas: idiomas ?? [],
      cvs: cvs ?? [],
      solicitudes: solicitudes ?? [],
    },
  }
}

// =============================================================================
// RGPD: derecho de supresión (art. 17 RGPD) — hard delete con cascada
// =============================================================================
export async function eliminarMiCuenta() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const admin = createAdminClient()
  const userId = user.id
  const userEmail = user.email ?? null

  // 1. Recoger paths de CVs en Storage para borrar tras el cascade
  const { data: cvsList } = await admin
    .from('cvs')
    .select('storage_path')
    .eq('candidato_id', userId)
  const storagePaths = (cvsList ?? []).map((c) => c.storage_path).filter(Boolean)

  // 2. Borrar el avatar si existe
  const { data: profileRow } = await admin
    .from('profiles')
    .select('avatar_url')
    .eq('id', userId)
    .single()

  // 3. Borrar el usuario de auth.users → cascade elimina:
  //    profiles → candidato_profiles → experiencias, educacion, idiomas, cvs, solicitudes
  const { error: deleteError } = await admin.auth.admin.deleteUser(userId)
  if (deleteError) {
    return { error: 'No se pudo eliminar la cuenta: ' + deleteError.message }
  }

  // 4. Purga física de archivos en Storage (no cascadea automáticamente)
  if (storagePaths.length > 0) {
    await admin.storage.from('cvs').remove(storagePaths)
  }
  if (profileRow?.avatar_url) {
    const avatarPath = profileRow.avatar_url.split('/avatars/')[1]
    if (avatarPath) {
      await admin.storage.from('avatars').remove([avatarPath])
    }
  }

  await logAction({
    accion: 'rgpd.eliminar_cuenta',
    recursoTipo: 'profile',
    recursoId: userId,
    recursoLabel: userEmail,
    metadata: { cvs_purgados: storagePaths.length },
    actorId: userId,
    actorEmail: userEmail,
  })

  // 5. Cerrar la sesión local (las cookies)
  await supabase.auth.signOut()

  return { ok: true }
}
