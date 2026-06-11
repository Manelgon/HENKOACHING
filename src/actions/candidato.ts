'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAction } from '@/lib/audit/log-action'
import { requireAdmin } from '@/lib/auth/require-admin'
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
  localidad: string
  cp: string
  cargo: string
  tipoJornada: string
  modalidad: string
  tipoContrato: string
  sectores: string[]
  disponibilidad: string
  pretensionSalarial: string
  experiencias: ExperienciaInput[]
  educacion: EducacionInput[]
  idiomas: IdiomaInput[]
  consentText?: string
}

const NIVELES_VALIDOS: NivelIdioma[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Nativo']

export async function uploadAvatar(formData: FormData): Promise<{ ok?: boolean; url?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const file = formData.get('avatar') as File | null
  if (!file || file.size === 0) return { error: 'Sin archivo' }
  if (!file.type.startsWith('image/')) return { error: 'Solo se permiten imágenes' }
  if (file.size > 2 * 1024 * 1024) return { error: 'Máximo 2MB' }

  const ext = file.type === 'image/png' ? 'png' : 'jpg'
  const path = `${user.id}/avatar.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { contentType: file.type, upsert: true })

  if (uploadError) return { error: uploadError.message }

  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
  const urlWithCache = `${publicUrl}?t=${Date.now()}`

  const { error: updateError } = await supabase.from('profiles')
    .update({ avatar_url: urlWithCache })
    .eq('id', user.id)

  if (updateError) return { error: updateError.message }

  revalidatePath('/candidato/dashboard')
  return { ok: true, url: urlWithCache }
}

// Pre-check de UX en el alta (paso 1) para ofrecer el flujo de "ya tienes cuenta".
// Es necesariamente pre-autenticación; la información que expone (si un email tiene
// cuenta) es equivalente a la que ya revela el formulario de login. Validamos el
// formato para que no pueda usarse como sonda arbitraria de la tabla profiles y
// solo devolvemos un booleano (nunca datos del perfil).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function checkEmailCandidatoExiste(email: string): Promise<{ exists: boolean }> {
  const normalizado = email.toLowerCase().trim()
  if (!EMAIL_RE.test(normalizado) || normalizado.length > 254) return { exists: false }

  const admin = createAdminClient()
  const { data } = await admin
    .from('profiles')
    .select('id')
    .eq('email', normalizado)
    .eq('role', 'candidato')
    .maybeSingle()
  return { exists: !!data }
}

export async function solicitarResetCandidato(email: string): Promise<{ ok?: boolean; error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/update-password`,
  })
  if (error) return { error: error.message }
  await logAction({
    accion: 'auth.reset_password_solicitado',
    recursoTipo: 'auth',
    recursoLabel: email,
    actorEmail: email,
  })
  return { ok: true }
}

export async function signupCandidato(input: CandidatoSignupInput) {
  const supabase = await createClient()

  // 1. Crear usuario en auth (el trigger crea profile + candidato_profile)
  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/candidato/login`,
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

  const admin = createAdminClient()

  // Compensación: si cualquier paso posterior al signUp falla, borramos el usuario
  // recién creado para que el alta sea todo-o-nada y no queden cuentas a medias
  // (sin consentimiento RGPD registrado, sin experiencias, etc.). El usuario puede
  // reintentar desde cero.
  const abortarConRollback = async (mensaje: string) => {
    await admin.auth.admin.deleteUser(userId).catch(() => {})
    return { error: mensaje }
  }

  // Filtramos las colecciones antes de empezar a escribir
  const experienciasValidas = input.experiencias.filter((e) => e.empresa.trim() && e.cargo.trim())
  const educacionValida = input.educacion.filter((e) => e.centro.trim() && e.titulo.trim())
  const idiomasValidos = input.idiomas.filter(
    (i) => i.idioma.trim() && NIVELES_VALIDOS.includes(i.nivel as NivelIdioma),
  )

  // 2. Actualizar candidato_profiles con datos extra (admin para evitar RLS en sesión no confirmada)
  const { error: profileError } = await admin
    .from('candidato_profiles')
    .update({
      ubicacion: input.ubicacion || null,
      localidad: input.localidad || null,
      cp: input.cp || null,
      cargo_actual: input.cargo || null,
      tipo_jornada: input.tipoJornada || null,
      modalidad_trabajo: input.modalidad || null,
      tipo_contrato: input.tipoContrato || null,
      sectores_interes: input.sectores.length > 0 ? input.sectores : null,
      disponibilidad: input.disponibilidad || null,
      pretension_salarial: input.pretensionSalarial || null,
      acepto_privacidad_at: new Date().toISOString(),
      consent_text: input.consentText ?? null,
    })
    .eq('user_id', userId)

  if (profileError) {
    return abortarConRollback('Error guardando perfil: ' + profileError.message)
  }

  // 3. Actualizar telefono en profiles (admin para evitar RLS en sesión no confirmada)
  if (input.telefono) {
    const { error: telefonoError } = await admin
      .from('profiles')
      .update({ telefono: input.telefono })
      .eq('id', userId)
    if (telefonoError) {
      return abortarConRollback('Error guardando teléfono: ' + telefonoError.message)
    }
  }

  // 4. Insertar experiencias (admin: sin sesión confirmada durante signup)
  if (experienciasValidas.length > 0) {
    const { error: expError } = await admin.from('candidato_experiencias').insert(
      experienciasValidas.map((e, i) => ({
        candidato_id: userId,
        empresa: e.empresa,
        cargo: e.cargo,
        desde: e.desde || null,
        hasta: e.hasta || null,
        orden: i,
      })),
    )
    if (expError) return abortarConRollback('Error guardando experiencias: ' + expError.message)
  }

  // 5. Insertar educación
  if (educacionValida.length > 0) {
    const { error: eduError } = await admin.from('candidato_educacion').insert(
      educacionValida.map((e, i) => ({
        candidato_id: userId,
        centro: e.centro,
        titulo: e.titulo,
        ano_fin: e.ano || null,
        orden: i,
      })),
    )
    if (eduError) return abortarConRollback('Error guardando educación: ' + eduError.message)
  }

  // 6. Insertar idiomas
  if (idiomasValidos.length > 0) {
    const { error: idiomaError } = await admin.from('candidato_idiomas').insert(
      idiomasValidos.map((i, idx) => ({
        candidato_id: userId,
        idioma: i.idioma,
        nivel: i.nivel as NivelIdioma,
        orden: idx,
      })),
    )
    if (idiomaError) return abortarConRollback('Error guardando idiomas: ' + idiomaError.message)
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

export async function uploadCvPorAdmin(userId: string, formData: FormData): Promise<{ ok?: boolean; error?: string }> {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error }

  const admin = createAdminClient()

  const file = formData.get('cv') as File | null
  if (!file || file.size === 0) return { error: 'Sin archivo' }
  if (file.type !== 'application/pdf') return { error: 'Solo se permite PDF' }
  if (file.size > 5 * 1024 * 1024) return { error: 'Máximo 5MB' }

  const cvId = crypto.randomUUID()
  const path = `${userId}/${cvId}.pdf`

  const { error: uploadError } = await admin.storage
    .from('cvs')
    .upload(path, file, { contentType: 'application/pdf', upsert: false })

  if (uploadError) return { error: uploadError.message }

  const { error: insertError } = await admin.from('cvs').insert({
    id: cvId,
    candidato_id: userId,
    nombre_archivo: file.name,
    storage_path: path,
    tamano_bytes: file.size,
    es_principal: true,
  })

  if (insertError) {
    await admin.storage.from('cvs').remove([path])
    return { error: insertError.message }
  }

  await logAction({
    accion: 'candidato.subir_cv_admin',
    recursoTipo: 'candidato',
    recursoId: userId,
    metadata: { archivo: file.name },
  })

  return { ok: true }
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

  // Insertar primero el nuevo CV como principal. Solo si ese insert tiene éxito
  // desmarcamos los anteriores: así un fallo nunca deja al candidato sin ningún
  // CV principal (antes se desmarcaba primero y un insert fallido rompía el estado).
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

  // Desmarcar los CVs principales anteriores (todos menos el recién creado)
  const { error: desmarcaError } = await supabase
    .from('cvs')
    .update({ es_principal: false })
    .eq('candidato_id', user.id)
    .eq('es_principal', true)
    .neq('id', cvId)
  if (desmarcaError) return { error: 'Error actualizando CV principal: ' + desmarcaError.message }

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
  const telefonoPrefijo = (formData.get('telefono_prefijo') as string) || '+34'
  const telefonoNumero = ((formData.get('telefono_numero') as string) || '').trim()
  const telefono = telefonoNumero ? `${telefonoPrefijo} ${telefonoNumero}` : ''
  const ubicacion = formData.get('ubicacion') as string
  const localidad = formData.get('localidad') as string | null
  const cp = formData.get('cp') as string | null
  const cargo = formData.get('cargo') as string
  const resumen = formData.get('resumen') as string | null
  const linkedin_url = formData.get('linkedin_url') as string | null

  const { error: e1 } = await supabase
    .from('profiles')
    .update({ nombre, apellidos, telefono })
    .eq('id', user.id)

  if (e1) return { error: e1.message }

  const { error: e2 } = await supabase
    .from('candidato_profiles')
    .update({ ubicacion, localidad: localidad || null, cp: cp || null, cargo_actual: cargo, resumen: resumen || null, linkedin_url: linkedin_url || null })
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

// Paso 1: envía un OTP de 6 dígitos al email del usuario autenticado
export async function solicitarCodigoExportacion() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { error: 'No autenticado' }

  const { error } = await supabase.auth.signInWithOtp({
    email: user.email,
    options: { shouldCreateUser: false },
  })

  if (error) return { error: 'No se pudo enviar el código. Inténtalo de nuevo.' }

  return { ok: true as const, email: user.email }
}

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
      .select('id, estado, mensaje, created_at, updated_at, ofertas(slug, titulo, clientes(nombre))')
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
    // El avatar_url lleva un cache-buster (?t=...); hay que quitar la query string
    // o el path no casaría con la clave real del objeto y no se borraría nunca.
    const avatarPath = profileRow.avatar_url.split('/avatars/')[1]?.split('?')[0]
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

// =============================================================================
// EXPERIENCIAS
// =============================================================================

export async function crearExperiencia(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const empresa = (formData.get('empresa') as string)?.trim()
  const cargo = (formData.get('cargo') as string)?.trim()
  if (!empresa) return { error: 'La empresa es obligatoria' }
  if (!cargo) return { error: 'El cargo es obligatorio' }

  const { error } = await supabase.from('candidato_experiencias').insert({
    candidato_id: user.id,
    empresa,
    cargo,
    desde: (formData.get('desde') as string) || null,
    hasta: (formData.get('hasta') as string) || null,
    descripcion: (formData.get('descripcion') as string) || null,
    orden: 0,
  })

  if (error) return { error: error.message }

  await logAction({
    accion: 'candidato.crear_experiencia',
    recursoTipo: 'candidato',
    recursoId: user.id,
    metadata: { empresa },
  })

  revalidatePath('/candidato/dashboard')
  return { ok: true }
}

export async function actualizarExperiencia(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const empresa = (formData.get('empresa') as string)?.trim()
  const cargo = (formData.get('cargo') as string)?.trim()
  if (!empresa) return { error: 'La empresa es obligatoria' }
  if (!cargo) return { error: 'El cargo es obligatorio' }

  const { error } = await supabase.from('candidato_experiencias')
    .update({
      empresa,
      cargo,
      desde: (formData.get('desde') as string) || null,
      hasta: (formData.get('hasta') as string) || null,
      descripcion: (formData.get('descripcion') as string) || null,
    })
    .eq('id', id)
    .eq('candidato_id', user.id)

  if (error) return { error: error.message }

  await logAction({
    accion: 'candidato.editar_experiencia',
    recursoTipo: 'candidato',
    recursoId: user.id,
    metadata: { empresa },
  })

  revalidatePath('/candidato/dashboard')
  return { ok: true }
}

export async function eliminarExperiencia(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('candidato_experiencias')
    .delete()
    .eq('id', id)
    .eq('candidato_id', user.id)

  if (error) return { error: error.message }

  await logAction({
    accion: 'candidato.eliminar_experiencia',
    recursoTipo: 'candidato',
    recursoId: user.id,
  })

  revalidatePath('/candidato/dashboard')
  return { ok: true }
}

// =============================================================================
// EDUCACIÓN
// =============================================================================

export async function crearEducacion(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const centro = (formData.get('centro') as string)?.trim()
  const titulo = (formData.get('titulo') as string)?.trim()
  if (!centro) return { error: 'El centro es obligatorio' }
  if (!titulo) return { error: 'El título es obligatorio' }

  const { error } = await supabase.from('candidato_educacion').insert({
    candidato_id: user.id,
    centro,
    titulo,
    ano_fin: (formData.get('ano_fin') as string) || null,
    orden: 0,
  })

  if (error) return { error: error.message }

  await logAction({
    accion: 'candidato.crear_educacion',
    recursoTipo: 'candidato',
    recursoId: user.id,
    metadata: { centro },
  })

  revalidatePath('/candidato/dashboard')
  return { ok: true }
}

export async function actualizarEducacion(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const centro = (formData.get('centro') as string)?.trim()
  const titulo = (formData.get('titulo') as string)?.trim()
  if (!centro) return { error: 'El centro es obligatorio' }
  if (!titulo) return { error: 'El título es obligatorio' }

  const { error } = await supabase.from('candidato_educacion')
    .update({
      centro,
      titulo,
      ano_fin: (formData.get('ano_fin') as string) || null,
    })
    .eq('id', id)
    .eq('candidato_id', user.id)

  if (error) return { error: error.message }

  await logAction({
    accion: 'candidato.editar_educacion',
    recursoTipo: 'candidato',
    recursoId: user.id,
    metadata: { centro },
  })

  revalidatePath('/candidato/dashboard')
  return { ok: true }
}

export async function eliminarEducacion(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('candidato_educacion')
    .delete()
    .eq('id', id)
    .eq('candidato_id', user.id)

  if (error) return { error: error.message }

  await logAction({
    accion: 'candidato.eliminar_educacion',
    recursoTipo: 'candidato',
    recursoId: user.id,
  })

  revalidatePath('/candidato/dashboard')
  return { ok: true }
}

// =============================================================================
// IDIOMAS
// =============================================================================

export async function crearIdioma(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const idioma = (formData.get('idioma') as string)?.trim()
  const nivel = formData.get('nivel') as string
  if (!idioma) return { error: 'El idioma es obligatorio' }
  if (!NIVELES_VALIDOS.includes(nivel as NivelIdioma)) return { error: 'Selecciona un nivel válido' }

  const { error } = await supabase.from('candidato_idiomas').insert({
    candidato_id: user.id,
    idioma,
    nivel: nivel as NivelIdioma,
    orden: 0,
  })

  if (error) return { error: error.message }

  await logAction({
    accion: 'candidato.crear_idioma',
    recursoTipo: 'candidato',
    recursoId: user.id,
    metadata: { idioma },
  })

  revalidatePath('/candidato/dashboard')
  return { ok: true }
}

export async function actualizarIdioma(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const idioma = (formData.get('idioma') as string)?.trim()
  const nivel = formData.get('nivel') as string
  if (!idioma) return { error: 'El idioma es obligatorio' }
  if (!NIVELES_VALIDOS.includes(nivel as NivelIdioma)) return { error: 'Selecciona un nivel válido' }

  const { error } = await supabase.from('candidato_idiomas')
    .update({
      idioma,
      nivel: nivel as NivelIdioma,
    })
    .eq('id', id)
    .eq('candidato_id', user.id)

  if (error) return { error: error.message }

  await logAction({
    accion: 'candidato.editar_idioma',
    recursoTipo: 'candidato',
    recursoId: user.id,
    metadata: { idioma },
  })

  revalidatePath('/candidato/dashboard')
  return { ok: true }
}

export async function eliminarIdioma(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('candidato_idiomas')
    .delete()
    .eq('id', id)
    .eq('candidato_id', user.id)

  if (error) return { error: error.message }

  await logAction({
    accion: 'candidato.eliminar_idioma',
    recursoTipo: 'candidato',
    recursoId: user.id,
  })

  revalidatePath('/candidato/dashboard')
  return { ok: true }
}

// =============================================================================
// PREFERENCIAS LABORALES
// =============================================================================

export async function actualizarPreferencias(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const sectores = formData.getAll('sectores') as string[]

  const { error } = await supabase.from('candidato_profiles')
    .update({
      cargo_actual: (formData.get('cargo') as string) || null,
      tipo_jornada: (formData.get('tipo_jornada') as string) || null,
      modalidad_trabajo: (formData.get('modalidad_trabajo') as string) || null,
      tipo_contrato: (formData.get('tipo_contrato') as string) || null,
      sectores_interes: sectores.length > 0 ? sectores : null,
      disponibilidad: (formData.get('disponibilidad') as string) || null,
      pretension_salarial: (formData.get('pretension_salarial') as string) || null,
    })
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  // Metadata mínima a propósito: no volcamos preferencias (datos personales) al log
  await logAction({
    accion: 'candidato.editar_preferencias',
    recursoTipo: 'candidato',
    recursoId: user.id,
  })

  revalidatePath('/candidato/dashboard')
  return { ok: true }
}
