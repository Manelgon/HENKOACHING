'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function uploadAdminAvatar(
  formData: FormData
): Promise<{ ok?: boolean; url?: string; error?: string }> {
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

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: urlWithCache })
    .eq('id', user.id)

  if (updateError) return { error: updateError.message }

  revalidatePath('/dashboard/mi-cuenta')
  return { ok: true, url: urlWithCache }
}
