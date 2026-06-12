'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Inicio' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/empleo', label: 'Empleo' },
  { href: '/sobre-mi', label: 'Sobre mí' },
  { href: '/contacto', label: 'Contacto' },
  { href: '/blog', label: 'Blog' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <header
      className={`fixed top-0 md:top-4 left-0 md:left-1/2 md:-translate-x-1/2 w-full md:w-[95%] max-w-6xl z-50 transition-all duration-500 ${scrolled
          ? 'bg-henko-card/90 backdrop-blur-md shadow-soft border-b md:border border-henko-hairline md:rounded-full py-1 md:py-0'
          : 'bg-transparent md:bg-henko-card/50 md:backdrop-blur-sm md:border md:border-henko-card/70 md:rounded-full py-3 md:py-0'
        }`}
    >
      <nav className="px-6 py-3 flex items-center justify-between">
        {/* Logo imagen */}
        <Link href="/" className="flex items-center group">
          <Image
            src="/hk.png"
            alt="Henkoaching"
            width={120}
            height={75}
            className="object-contain w-[64px] h-auto transition-transform duration-300 group-hover:scale-105"
            priority
          />
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-7">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`relative font-raleway text-sm tracking-wide transition-all duration-300 px-1 py-2 ${pathname === link.href
                    ? 'text-henko-ink font-semibold after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-px after:bg-henko-turquoise'
                    : 'text-henko-ink-soft hover:text-henko-ink'
                  }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA desktop */}
        <Link
          href="/candidato/login"
          aria-label="Acceder"
          title="Acceder"
          className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-full text-henko-ink-soft hover:text-henko-ink hover:bg-henko-ink/5 transition-all duration-300"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </Link>

        {/* Hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú"
        >
          <span className={`block w-6 h-0.5 bg-henko-ink transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-henko-ink transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-henko-ink transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </nav>

      {/* Mobile menu */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-henko-card/95 backdrop-blur-md border-b border-henko-hairline transition-all duration-300 overflow-hidden shadow-lift ${menuOpen ? 'max-h-96 opacity-100 py-4' : 'max-h-0 opacity-0 py-0'}`}>
        <ul className="px-6 flex flex-col gap-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`font-raleway text-sm font-semibold tracking-wide block py-3 px-4 rounded-2xl transition-colors ${pathname === link.href ? 'bg-henko-turquoise/10 text-henko-turquoise' : 'text-henko-ink hover:bg-henko-ink/5'
                  }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="pt-4 pb-2">
            <Link
              href="/candidato/login"
              aria-label="Acceder"
              className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-henko-hairline text-henko-ink transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </Link>
          </li>
        </ul>
      </div>
    </header>
  )
}
