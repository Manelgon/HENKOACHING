'use client'

import { useEffect, useState, isValidElement, cloneElement } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { signout } from '@/actions/auth'
import { useEmailStore } from '@/features/email/store/emailStore'
import { useCandidatosStore } from '@/features/candidatos/store/candidatosStore'

export type NavItem = {
  href: string
  label: string
  icon: React.ReactNode
  badge?: number
}

export type NavSection = {
  title: string
  items: NavItem[]
}

type Props = {
  sections: NavSection[]
  userEmail: string
  userInitial: string
  homeHref?: string
  children: React.ReactNode
}

export default function DashboardShell({ sections, userEmail, userInitial, homeHref = '/dashboard', children }: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const unreadCount = useEmailStore((s) => s.unreadCount)
  const failedCount = useEmailStore((s) => s.failedCount)
  const candidatosNuevos = useCandidatosStore((s) => s.nuevosCount)

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const sectionHasActive = (section: NavSection) =>
    section.items.some((item) => isActive(item.href))

  // Estado de cada sección: abierta si contiene la ruta activa
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(sections.map((s) => [s.title, sectionHasActive(s)]))
  )

  // Abrir la sección activa cuando cambia la ruta
  useEffect(() => {
    setExpanded((prev) => {
      const next = { ...prev }
      for (const s of sections) {
        if (sectionHasActive(s)) next[s.title] = true
      }
      return next
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  function toggleSection(title: string) {
    setExpanded((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {open && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 flex flex-col transform transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-gray-100">
          <Link href={homeHref} className="flex items-center gap-3">
            <Image src="/hk.png" alt="Henkoaching" width={80} height={50} className="object-contain w-10 h-auto" />
            <span className="font-roxborough text-lg text-gray-900">Henkoaching</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto space-y-0.5">
          {sections.map((section) => {
            const isOpen = expanded[section.title] ?? false
            return (
              <div key={section.title}>
                {/* Título colapsable */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center justify-between px-3 pt-4 pb-1.5 group"
                >
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest font-raleway group-hover:text-gray-600 transition-colors">
                    {section.title}
                  </span>
                  <svg
                    className={`w-3 h-3 text-gray-300 group-hover:text-gray-500 transition-all duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Items con animación */}
                <div
                  className="overflow-hidden transition-all duration-200 ease-in-out"
                  style={{ maxHeight: isOpen ? `${section.items.length * 52}px` : '0px', opacity: isOpen ? 1 : 0 }}
                >
                  {section.items.map((item) => {
                    const active = isActive(item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-raleway text-sm font-medium group ${
                          active
                            ? 'bg-henko-greenblue/30 text-henko-turquoise'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-henko-turquoise'
                        }`}
                      >
                        <span className={`relative w-5 h-5 flex-shrink-0 ${active ? 'text-henko-turquoise' : 'text-gray-400 group-hover:text-henko-turquoise transition-colors'}`}>
                          {isValidElement(item.icon) ? cloneElement(item.icon as React.ReactElement, { key: `icon-${item.href}` }) : item.icon}
                          {item.href === '/dashboard/email' && unreadCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 rounded-full bg-henko-turquoise text-white text-[10px] font-bold flex items-center justify-center leading-none">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                          )}
                          {item.href === '/dashboard/email' && failedCount > 0 && (
                            <span className="absolute -bottom-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                              {failedCount > 9 ? '9+' : failedCount}
                            </span>
                          )}
                          {item.href === '/dashboard/candidatos' && candidatosNuevos > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 rounded-full bg-henko-turquoise text-white text-[10px] font-bold flex items-center justify-center leading-none">
                              {candidatosNuevos > 99 ? '99+' : candidatosNuevos}
                            </span>
                          )}
                          {item.href !== '/dashboard/candidatos' && item.badge && item.badge > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 rounded-full bg-henko-turquoise text-white text-[10px] font-bold flex items-center justify-center leading-none">
                              {item.badge > 99 ? '99+' : item.badge}
                            </span>
                          )}
                        </span>
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-henko-turquoise/20 flex items-center justify-center text-henko-turquoise font-bold text-sm">
              {userInitial}
            </div>
            <span className="text-xs text-gray-500 font-raleway truncate">{userEmail}</span>
          </div>
          <form action={signout}>
            <button
              type="submit"
              className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all font-raleway text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <div className="sticky top-0 z-20 lg:hidden flex items-center gap-3 px-4 h-14 bg-white/90 backdrop-blur border-b border-gray-100">
          <Link href={homeHref} className="flex items-center gap-2">
            <Image src="/hk.png" alt="Henkoaching" width={60} height={38} className="object-contain w-7 h-auto" />
            <span className="font-roxborough text-base text-gray-900">Henkoaching</span>
          </Link>
          <div className="flex-1" />
          <div className="w-8 h-8 rounded-full bg-henko-turquoise/20 flex items-center justify-center text-henko-turquoise font-bold text-xs">
            {userInitial}
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            className="w-9 h-9 rounded-lg flex flex-col items-center justify-center gap-[5px] hover:bg-gray-100 transition-colors"
          >
            <span className={`block w-5 h-[2px] rounded bg-gray-900 transition-transform ${open ? 'translate-y-[7px] rotate-45' : ''}`} />
            <span className={`block w-5 h-[2px] rounded bg-gray-900 transition-opacity ${open ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-[2px] rounded bg-gray-900 transition-transform ${open ? '-translate-y-[7px] -rotate-45' : ''}`} />
          </button>
        </div>

        <main className="flex-1 px-4 pt-8 pb-5 lg:px-6 lg:pt-10 lg:pb-6">
          {children}
        </main>
      </div>
    </div>
  )
}
