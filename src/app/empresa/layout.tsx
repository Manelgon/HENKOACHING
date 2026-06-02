import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardShell, { type NavSection } from '@/components/DashboardShell'

function Icon({ path, path2 }: { path: string; path2?: string }) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path} />
      {path2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path2} />}
    </svg>
  )
}

export default async function EmpresaLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'empresa') redirect('/dashboard')

  const sections: NavSection[] = [
    {
      title: 'Panel empresa',
      items: [
        {
          href: '/empresa/dashboard',
          label: 'Inicio',
          icon: <Icon path="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
        },
        {
          href: '/empresa/ofertas',
          label: 'Mis ofertas',
          icon: <Icon path="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
        },
        {
          href: '/empresa/candidatos',
          label: 'Candidatos',
          icon: <Icon path="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
        },
        {
          href: '/empresa/facturas',
          label: 'Facturas',
          icon: <Icon path="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />,
        },
        {
          href: '/empresa/archivos',
          label: 'Archivos',
          icon: <Icon path="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />,
        },
        {
          href: '/empresa/perfil',
          label: 'Mi perfil',
          icon: <Icon path="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />,
        },
      ],
    },
  ]

  const userInitial = user.email?.[0]?.toUpperCase() ?? '·'

  return (
    <DashboardShell
      sections={sections}
      userEmail={user.email ?? ''}
      userInitial={userInitial}
      homeHref="/empresa/dashboard"
    >
      {children}
    </DashboardShell>
  )
}
