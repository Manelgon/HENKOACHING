'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
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

  revalidatePath('/candidato/dashboard')
  return { ok: true }
}

export async function loginCandidato(email: string, password: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user) return { error: error?.message || 'Email o contraseña incorrectos' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  if (profile?.role !== 'candidato') {
    await supabase.auth.signOut()
    return { error: 'Esta cuenta no es de candidato' }
  }

  revalidatePath('/', 'layout')
  redirect('/candidato/dashboard')
}
