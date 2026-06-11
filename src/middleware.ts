import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PREFIXES = ['/dashboard', '/candidato/dashboard', '/setup-mfa']
const ADMIN_PREFIXES = ['/dashboard'] // Solo admins/recruiters requieren MFA
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
  const isAdminRoute = ADMIN_PREFIXES.some(p => pathname.startsWith(p))
  const isSetupMfa = pathname === '/setup-mfa'

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

  // MFA obligatorio para rutas de admin — candidatos quedan exentos
  if (user && isAdminRoute && !isSetupMfa) {
    const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

    // Fail-closed: si la API MFA no responde, no dejar pasar
    if (aalError || !aalData) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const { currentLevel, nextLevel } = aalData

    // Invariante: las rutas de admin exigen una sesión verificada con MFA (aal2).
    // Cualquier sesión que no sea aal2 se redirige — verificar si ya hay un factor
    // verificado (nextLevel === 'aal2'), o forzar el enrolamiento si no lo hay.
    // nextLevel ya codifica "existe un factor verificado", por lo que cubre también
    // el caso degenerado de un factor borrado tras alcanzar aal2.
    if (currentLevel !== 'aal2') {
      const destino = nextLevel === 'aal2' ? '/setup-mfa' : '/setup-mfa?enroll=1'
      return NextResponse.redirect(new URL(destino, request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}