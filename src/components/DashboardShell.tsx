'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { signout } from '@/actions/auth'

export type NavItem = {
  href: string
  label: string
  icon: React.ReactNode
}

export type NavSection = {
  title: string
  items: NavItem[]
}

type Props = {
  sections: NavSection[]
  userEmail: string
  userInitial: string
  children: React.ReactNode
}

export default function DashboardShell({ sections, userEmail, userInitial, children }: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Backdrop (mobile/tablet) */}
      {open && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 flex flex-col transform transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image src="/hk.png" alt="Henkoaching" width={40} height={40} />
            <span className="font-roxborough text-lg text-gray-900">Henkoaching</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 pt-3 pb-2 font-raleway">
                {section.title}
              </p>
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
                    <span className={`w-5 h-5 ${active ? 'text-henko-turquoise' : 'text-gray-400 group-hover:text-henko-turquoise transition-colors'}`}>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                )
              })}
            </div>
          ))}
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

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Top bar (mobile/tablet) */}
        <div className="sticky top-0 z-20 lg:hidden flex items-center gap-3 px-4 h-14 bg-white/90 backdrop-blur border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/hk.png" alt="Henkoaching" width={28} height={28} />
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

        <main className="flex-1 px-4 py-5 lg:px-6 lg:py-4">
          {children}
        </main>
      </div>
    </div>
  )
}
