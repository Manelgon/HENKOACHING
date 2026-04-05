'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Inicio' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/trabaja-conmigo', label: 'Trabaja conmigo' },
  { href: '/sobre-mi', label: 'Sobre mí' },
  { href: '/contacto', label: 'Contacto' },
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-henko-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo text */}
        <Link href="/" className="flex flex-col leading-none">
          <span className="text-henko-turquoise font-semibold tracking-widest uppercase text-sm font-raleway">
            HENKOACHING
          </span>
          <span className="text-gray-400 text-xs tracking-wider font-raleway">
            coaching & mindfullness
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`font-raleway text-sm tracking-wide transition-colors duration-200 ${
                  pathname === link.href
                    ? 'text-henko-turquoise font-semibold'
                    : 'text-gray-600 hover:text-henko-turquoise'
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA desktop */}
        <Link href="/contacto" className="hidden md:inline-block btn-primary text-xs">
          Hablemos
        </Link>

        {/* Hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú"
        >
          <span className={`block w-6 h-0.5 bg-henko-turquoise transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-henko-turquoise transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-henko-turquoise transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </nav>

      {/* Mobile menu */}
      <div className={`md:hidden bg-henko-white border-t border-henko-greenblue/30 transition-all duration-300 overflow-hidden ${menuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
        <ul className="px-6 py-4 flex flex-col gap-4">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`font-raleway text-sm tracking-wide block py-1 transition-colors ${
                  pathname === link.href ? 'text-henko-turquoise font-semibold' : 'text-gray-600'
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="pt-2">
            <Link href="/contacto" className="btn-primary text-xs inline-block text-center w-full">
              Hablemos
            </Link>
          </li>
        </ul>
      </div>
    </header>
  )
}
