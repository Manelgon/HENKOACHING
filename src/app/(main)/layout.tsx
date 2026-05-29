import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardShell, { type NavSection } from '@/components/DashboardShell'
import EmailPoller from '@/features/email/components/EmailPoller'
import { getEmailConfig } from '@/actions/email'

// Iconos fuera del componente para evitar el warning de key de React 19
// (JSX creado dentro de arrays de props necesita keys; renderizar desde función lo evita)
function Icon({ path, path2 }: { path: string; path2?: string }) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path} />
      {path2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path2} />}
    </svg>
  )
}

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'candidato') redirect('/candidato/dashboard')

  const isAdmin = profile?.role === 'admin'

  const sections: NavSection[] = [
    {
      title: 'Gestión',
      items: [
        { href: '/dashboard', label: 'Inicio', icon: <Icon path="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
        { href: '/dashboard/leads', label: 'Leads', icon: <Icon path="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /> },
        { href: '/dashboard/clientes', label: 'Clientes', icon: <Icon path="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /> },
      ],
    },
    {
      title: 'Contenido',
      items: [
        { href: '/dashboard/blog', label: 'Blog', icon: <Icon path="M4 6h16M4 12h10M4 18h7M17 14l4 4-4 4M21 18h-7" /> },
        { href: '/dashboard/testimonios', label: 'Testimonios', icon: <Icon path="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /> },
      ],
    },
    {
      title: 'Facturación',
      items: [
        { href: '/dashboard/facturas', label: 'Facturas', icon: <Icon path="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /> },
      ],
    },
    {
      title: 'Portal de empleo',
      items: [
        { href: '/dashboard/ofertas', label: 'Ofertas de empleo', icon: <Icon path="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /> },
        { href: '/dashboard/solicitudes', label: 'Solicitudes', icon: <Icon path="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /> },
      ],
    },
  ]

  if (isAdmin) {
    sections.push({
      title: 'Administración',
      items: [
        { href: '/dashboard/email', label: 'Email', icon: <Icon path="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /> },
        { href: '/dashboard/email/configuracion', label: 'Configuración Email', icon: <Icon path="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" path2="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /> },
        { href: '/dashboard/ajustes', label: 'Ajustes del emisor', icon: <Icon path="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" path2="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /> },
        { href: '/dashboard/verifactu', label: 'Veri*factu', icon: <Icon path="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /> },
        { href: '/dashboard/profiles', label: 'Profiles', icon: <Icon path="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> },
        { href: '/dashboard/logs', label: 'Logs del sistema', icon: <Icon path="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /> },
      ],
    })
  }

  const userInitial = user.email?.[0]?.toUpperCase() ?? '·'

  const emailConfig = isAdmin ? await getEmailConfig() : null
  const hasImapConfig = !!(emailConfig?.imap_host && emailConfig?.hasImapPassword)

  return (
    <>
      {isAdmin && <EmailPoller hasImapConfig={hasImapConfig} />}
      <DashboardShell
        sections={sections}
        userEmail={user.email ?? ''}
        userInitial={userInitial}
      >
        {children}
      </DashboardShell>
    </>
  )
}
