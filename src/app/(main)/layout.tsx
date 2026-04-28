import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signout } from '@/actions/auth'
import Image from 'next/image'
import Link from 'next/link'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full z-10">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image src="/hk.png" alt="Henkoaching" width={40} height={40} />
            <span className="font-roxborough text-lg text-gray-900">Henkoaching</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 py-2 font-raleway">Gestión</p>
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-henko-turquoise transition-all font-raleway text-sm font-medium group">
            <svg className="w-5 h-5 text-gray-400 group-hover:text-henko-turquoise transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Inicio
          </Link>
          <Link href="/dashboard/contactos" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-henko-turquoise transition-all font-raleway text-sm font-medium group">
            <svg className="w-5 h-5 text-gray-400 group-hover:text-henko-turquoise transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Formularios de contacto
          </Link>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 pt-5 pb-2 font-raleway">Portal de empleo</p>
          <Link href="/dashboard/ofertas" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-henko-turquoise transition-all font-raleway text-sm font-medium group">
            <svg className="w-5 h-5 text-gray-400 group-hover:text-henko-turquoise transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Ofertas de empleo
          </Link>
          <Link href="/dashboard/solicitudes" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-henko-turquoise transition-all font-raleway text-sm font-medium group">
            <svg className="w-5 h-5 text-gray-400 group-hover:text-henko-turquoise transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Solicitudes
          </Link>

          {isAdmin && (
            <>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 pt-5 pb-2 font-raleway">Administración</p>
              <Link href="/dashboard/profiles" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-henko-turquoise transition-all font-raleway text-sm font-medium group">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-henko-turquoise transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profiles
              </Link>
              <Link href="/dashboard/logs" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-henko-turquoise transition-all font-raleway text-sm font-medium group">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-henko-turquoise transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Logs del sistema
              </Link>
            </>
          )}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-henko-turquoise/20 flex items-center justify-center text-henko-turquoise font-bold text-sm">
              {user.email?.[0].toUpperCase()}
            </div>
            <span className="text-xs text-gray-500 font-raleway truncate">{user.email}</span>
          </div>
          <form action={signout}>
            <button type="submit" className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all font-raleway text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 px-6 py-4">
        {children}
      </main>
    </div>
  )
}
