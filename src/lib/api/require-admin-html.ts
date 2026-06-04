import { createClient } from '@/lib/supabase/server'

type AdminHtmlResult =
  | { ok: true }
  | { ok: false; response: Response }

export async function requireAdminHtml(request: Request): Promise<AdminHtmlResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = new URL('/login', new URL(request.url).origin)
    return { ok: false, response: Response.redirect(loginUrl.toString(), 302) }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    console.error('[requireAdminHtml] Error al leer profile:', profileError.message)
    return { ok: false, response: new Response('Error interno', { status: 500 }) }
  }

  if (profile?.role !== 'admin') {
    return { ok: false, response: new Response('Sin permisos', { status: 403 }) }
  }

  return { ok: true }
}
