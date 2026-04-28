'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logAction } from '@/lib/audit/log-action'

async function getRedirectForRole(userId: string): Promise<string> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (data?.role === 'candidato') return '/candidato/dashboard'
  return '/dashboard'
}

export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: formData.get('password') as string,
  })

  if (error || !data.user) {
    await logAction({
      accion: 'auth.login_fallido',
      recursoTipo: 'auth',
      recursoLabel: email,
      metadata: { motivo: error?.message ?? 'desconocido' },
      actorEmail: email,
    })
    return { error: error?.message || 'Error al iniciar sesión' }
  }

  await logAction({
    accion: 'auth.login',
    recursoTipo: 'auth',
    recursoId: data.user.id,
    recursoLabel: data.user.email ?? email,
    actorId: data.user.id,
    actorEmail: data.user.email ?? email,
  })

  const target = await getRedirectForRole(data.user.id)
  revalidatePath('/', 'layout')
  redirect(target)
}

export async function signout() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    await logAction({
      accion: 'auth.logout',
      recursoTipo: 'auth',
      recursoId: user.id,
      recursoLabel: user.email ?? null,
      actorId: user.id,
      actorEmail: user.email ?? null,
    })
  }

  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/update-password`,
  })

  if (error) {
    return { error: error.message }
  }

  await logAction({
    accion: 'auth.reset_password_solicitado',
    recursoTipo: 'auth',
    recursoLabel: email,
    actorEmail: email,
  })

  return { success: true }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: error.message }
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    await logAction({
      accion: 'auth.password_actualizada',
      recursoTipo: 'auth',
      recursoId: user.id,
      recursoLabel: user.email ?? null,
      actorId: user.id,
      actorEmail: user.email ?? null,
    })
  }

  const target = user ? await getRedirectForRole(user.id) : '/login'

  revalidatePath('/', 'layout')
  redirect(target)
}
