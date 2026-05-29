import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PREFIXES = ['/dashboard', '/candidato/dashboard']
const AUTH_ROUTES = ['/login', '/signup', '/forgot-password', '/check-email', '/update-password', '/candidato/login', '/candidato/signup']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresca la sesión — no usar getSession() aquí (no valida JWT)
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p))
  const isAuthRoute = AUTH_ROUTES.some(r => pathname === r)

  if (isProtected && !user) {
    const loginUrl = pathname.startsWith('/candidato')
      ? '/candidato/login'
      : '/login'
    return NextResponse.redirect(new URL(loginUrl, request.url))
  }

  if (isAuthRoute && user) {
    const homeUrl = pathname.startsWith('/candidato')
      ? '/candidato/dashboard'
      : '/dashboard'
    return NextResponse.redirect(new URL(homeUrl, request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}