import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

type RecruiterError = { ok: false; error: string }
type RecruiterOk = { ok: true; user: User; profile: { role: string } }

export type RequireRecruiterResult = RecruiterError | RecruiterOk

/**
 * Validates that the current session belongs to an admin or recruiter user.
 * Mirrors the DB-side public.is_recruiter() used by RLS policies.
 * Returns { ok: true, user, profile } on success, or { ok: false, error } on failure.
 */
export async function requireRecruiter(): Promise<RequireRecruiterResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No autenticado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'recruiter')) {
    return { ok: false, error: 'Sin permisos' }
  }
  return { ok: true, user, profile: { role: profile.role as string } }
}
