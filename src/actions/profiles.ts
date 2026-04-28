'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAction } from '@/lib/audit/log-action'
import type { UserRole } from '@/lib/supabase/database.types'

async function ensureAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' as const }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Solo admins pueden gestionar profiles' as const }
  return { user }
}

export async function crearProfile(input: {
  email: string
  password: string
  nombre: string
  apellidos: string
  role: UserRole
  telefono?: string
}) {
  const guard = await ensureAdmin()
  if ('error' in guard) return guard

  const admin = createAdminClient()

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      nombre: input.nombre,
      apellidos: input.apellidos,
      role: input.role,
    },
  })

  if (createErr || !created.user) {
    return { error: createErr?.message ?? 'No se pudo crear el usuario' }
  }

  // El trigger handle_new_user crea el profile. Forzamos el rol y datos extra.
  const { error: updateErr } = await admin
    .from('profiles')
    .update({
      role: input.role,
      nombre: input.nombre,
      apellidos: input.apellidos,
      telefono: input.telefono ?? null,
    })
    .eq('id', created.user.id)

  if (updateErr) return { error: 'Usuario creado pero perfil incompleto: ' + updateErr.message }

  await logAction({
    accion: 'profile.crear',
    recursoTipo: 'profile',
    recursoId: created.user.id,
    recursoLabel: input.email,
    metadata: { role: input.role, nombre: input.nombre, apellidos: input.apellidos },
  })

  revalidatePath('/dashboard/profiles')
  return { ok: true, userId: created.user.id }
}

export async function actualizarProfile(userId: string, input: {
  nombre?: string
  apellidos?: string
  telefono?: string
  role?: UserRole
}) {
  const guard = await ensureAdmin()
  if ('error' in guard) return guard

  const admin = createAdminClient()

  const { data: anterior } = await admin
    .from('profiles')
    .select('email, nombre, apellidos, telefono, role')
    .eq('id', userId)
    .single()

  const { error } = await admin
    .from('profiles')
    .update({
      nombre: input.nombre,
      apellidos: input.apellidos,
      telefono: input.telefono,
      role: input.role,
    })
    .eq('id', userId)

  if (error) return { error: error.message }

  if (input.role && anterior && input.role !== anterior.role) {
    await logAction({
      accion: 'profile.cambiar_rol',
      recursoTipo: 'profile',
      recursoId: userId,
      recursoLabel: anterior.email,
      metadata: { rol_anterior: anterior.role, rol_nuevo: input.role },
    })
  }

  await logAction({
    accion: 'profile.editar',
    recursoTipo: 'profile',
    recursoId: userId,
    recursoLabel: anterior?.email ?? null,
    metadata: {
      antes: anterior,
      despues: input,
    },
  })

  revalidatePath('/dashboard/profiles')
  return { ok: true }
}

export async function cambiarEmailProfile(userId: string, nuevoEmail: string) {
  const guard = await ensureAdmin()
  if ('error' in guard) return guard

  const admin = createAdminClient()

  const { data: anterior } = await admin
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single()

  const { error: authErr } = await admin.auth.admin.updateUserById(userId, {
    email: nuevoEmail,
    email_confirm: true,
  })

  if (authErr) return { error: authErr.message }

  const { error: profErr } = await admin
    .from('profiles')
    .update({ email: nuevoEmail })
    .eq('id', userId)

  if (profErr) return { error: profErr.message }

  await logAction({
    accion: 'profile.cambiar_email',
    recursoTipo: 'profile',
    recursoId: userId,
    recursoLabel: nuevoEmail,
    metadata: { email_anterior: anterior?.email ?? null, email_nuevo: nuevoEmail },
  })

  revalidatePath('/dashboard/profiles')
  return { ok: true }
}

export async function resetPasswordProfile(userId: string) {
  const guard = await ensureAdmin()
  if ('error' in guard) return guard

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single()

  if (!profile?.email) return { error: 'No se encontró email del usuario' }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/update-password`,
  })

  if (error) return { error: error.message }

  await logAction({
    accion: 'profile.reset_password',
    recursoTipo: 'profile',
    recursoId: userId,
    recursoLabel: profile.email,
  })

  return { ok: true }
}

export async function reenviarVerificacion(userId: string) {
  const guard = await ensureAdmin()
  if ('error' in guard) return guard

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single()

  if (!profile?.email) return { error: 'No se encontró email' }

  const { error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: profile.email,
  })

  if (error) return { error: error.message }

  await logAction({
    accion: 'profile.reenviar_verificacion',
    recursoTipo: 'profile',
    recursoId: userId,
    recursoLabel: profile.email,
  })

  return { ok: true }
}

export async function desactivarProfile(userId: string) {
  const guard = await ensureAdmin()
  if ('error' in guard) return guard

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single()

  // Banear: desactiva el login en auth (ban_duration: '876000h' ≈ 100 años)
  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: '876000h',
  })

  if (error) return { error: error.message }

  await logAction({
    accion: 'profile.desactivar',
    recursoTipo: 'profile',
    recursoId: userId,
    recursoLabel: profile?.email ?? null,
  })

  revalidatePath('/dashboard/profiles')
  return { ok: true }
}

export async function reactivarProfile(userId: string) {
  const guard = await ensureAdmin()
  if ('error' in guard) return guard

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single()

  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: 'none',
  })

  if (error) return { error: error.message }

  await logAction({
    accion: 'profile.reactivar',
    recursoTipo: 'profile',
    recursoId: userId,
    recursoLabel: profile?.email ?? null,
  })

  revalidatePath('/dashboard/profiles')
  return { ok: true }
}

export async function eliminarProfile(userId: string) {
  const guard = await ensureAdmin()
  if ('error' in guard) return guard

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single()

  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) return { error: error.message }

  await logAction({
    accion: 'profile.eliminar',
    recursoTipo: 'profile',
    recursoId: userId,
    recursoLabel: profile?.email ?? null,
  })

  revalidatePath('/dashboard/profiles')
  return { ok: true }
}
