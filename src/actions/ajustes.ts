'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAction } from '@/lib/audit/log-action'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' as const }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || profile.role !== 'admin') return { error: 'Sin permisos' as const }
  return { user, profile }
}

export type AjustesInput = {
  emisor_nombre: string
  emisor_nif: string
  emisor_direccion: string
  emisor_cp: string
  emisor_ciudad: string
  emisor_provincia: string
  emisor_pais: string
  emisor_email: string
  emisor_telefono: string
  emisor_web: string
  emisor_iban: string
  prefijo_anio: boolean
}

export async function guardarAjustes(input: AjustesInput) {
  const auth = await requireAdmin()
  if ('error' in auth) return { error: auth.error }

  const admin = createAdminClient()
  const { error } = await admin
    .from('company_settings' as never)
    .update({
      emisor_nombre: input.emisor_nombre.trim(),
      emisor_nif: input.emisor_nif.trim(),
      emisor_direccion: input.emisor_direccion.trim(),
      emisor_cp: input.emisor_cp.trim(),
      emisor_ciudad: input.emisor_ciudad.trim(),
      emisor_provincia: input.emisor_provincia.trim(),
      emisor_pais: input.emisor_pais.trim() || 'España',
      emisor_email: input.emisor_email.trim(),
      emisor_telefono: input.emisor_telefono.trim(),
      emisor_web: input.emisor_web.trim(),
      emisor_iban: input.emisor_iban.trim(),
      prefijo_anio: input.prefijo_anio,
    } as never)
    .eq('id', 1)

  if (error) return { error: error.message }

  await logAction({
    accion: 'ajustes.actualizar',
    recursoTipo: 'company_settings',
    recursoId: '1',
  })

  revalidatePath('/dashboard/ajustes')
  return { ok: true }
}

export async function subirImagenEmisor(formData: FormData) {
  const auth = await requireAdmin()
  if ('error' in auth) return { error: auth.error }

  const file = formData.get('file') as File | null
  const tipo = formData.get('tipo') as string | null

  if (!file || !tipo || !['logo', 'firma', 'header', 'footer', 'sobre_mi'].includes(tipo)) {
    return { error: 'Falta archivo o tipo (logo|firma|header|footer|sobre_mi)' }
  }

  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']
  if (!ALLOWED.includes(file.type)) {
    return { error: 'Solo PNG, JPG o WebP' }
  }
  if (file.size > 5 * 1024 * 1024) {
    return { error: 'La imagen no puede superar 5MB' }
  }

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const storagePath = `company/${tipo}.${ext}`
  const buffer = await file.arrayBuffer()

  const admin = createAdminClient()

  // Borrar versiones anteriores con otras extensiones para no dejar huérfanos
  for (const oldExt of ['png', 'jpg', 'webp']) {
    if (oldExt === ext) continue
    await admin.storage.from('doc-assets').remove([`company/${tipo}.${oldExt}`])
  }

  const { error: uploadError } = await admin.storage
    .from('doc-assets')
    .upload(storagePath, buffer, { contentType: file.type, upsert: true })

  if (uploadError) return { error: uploadError.message }

  const column = `${tipo}_path` as 'logo_path' | 'firma_path' | 'header_path' | 'footer_path' | 'sobre_mi_path'
  const { error: dbError } = await admin
    .from('company_settings' as never)
    .update({ [column]: storagePath } as never)
    .eq('id', 1)

  if (dbError) return { error: dbError.message }

  const { data: signed } = await admin.storage
    .from('doc-assets')
    .createSignedUrl(storagePath, 3600)

  await logAction({
    accion: 'ajustes.subir_imagen',
    recursoTipo: 'company_settings',
    recursoId: '1',
    metadata: { tipo, path: storagePath },
  })

  revalidatePath('/dashboard/ajustes')
  if (tipo === 'sobre_mi') revalidatePath('/sobre-mi')
  return { ok: true, url: signed?.signedUrl ?? null, path: storagePath }
}

export async function quitarImagenEmisor(tipo: 'logo' | 'firma' | 'header' | 'footer' | 'sobre_mi') {
  const auth = await requireAdmin()
  if ('error' in auth) return { error: auth.error }

  const admin = createAdminClient()
  const column = `${tipo}_path` as 'logo_path' | 'firma_path' | 'header_path' | 'footer_path' | 'sobre_mi_path'

  const { data: row } = await admin
    .from('company_settings' as never)
    .select(column)
    .eq('id', 1)
    .maybeSingle()

  const path = (row as Record<string, string | null> | null)?.[column] ?? null
  if (path) {
    await admin.storage.from('doc-assets').remove([path])
  }

  await admin
    .from('company_settings' as never)
    .update({ [column]: null } as never)
    .eq('id', 1)

  await logAction({
    accion: 'ajustes.quitar_imagen',
    recursoTipo: 'company_settings',
    recursoId: '1',
    metadata: { tipo },
  })

  revalidatePath('/dashboard/ajustes')
  if (tipo === 'sobre_mi') revalidatePath('/sobre-mi')
  return { ok: true }
}
