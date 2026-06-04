import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

type AdminError = { ok: false; error: string }
type AdminOk = { ok: true; user: User; profile: { role: string } }

export type RequireAdminResult = AdminError | AdminOk

/**
 * Validates that the current session belongs to an admin user.
 * Returns { ok: true, user, profile } on success, or { ok: false, error } on failure.
 * Use in Server Actions to avoid repeating this pattern.
 */
export async function requireAdmin(): Promise<RequireAdminResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No autenticado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || profile.role !== 'admin') return { ok: false, error: 'Sin permisos' }
  return { ok: true, user, profile: { role: profile.role as string } }
}
