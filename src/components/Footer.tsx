import Link from 'next/link'

export default function Footer() {
  return (
    <div className="px-4 pb-4 pt-10 md:px-8 md:pb-8 md:pt-10 w-full max-w-[1400px] mx-auto">
      <footer className="bg-white border border-henko-turquoise/15 text-gray-900 rounded-[3rem] p-8 md:p-10 flex flex-col gap-8 shadow-sm relative overflow-hidden">

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">
          {/* Brand */}
          <div className="md:col-span-5">
            <p className="font-raleway tracking-widest uppercase text-sm font-bold mb-2">HENKOACHING</p>
            <p className="text-henko-turquoise text-xs tracking-[0.2em] font-raleway mb-4 uppercase">Orden · Liderazgo · Equipos</p>
          </div>

          {/* Links */}
          <div className="md:col-span-3">
            <p className="font-raleway uppercase tracking-widest text-xs font-bold mb-4 text-gray-400">Explorar</p>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Inicio' },
                { href: '/servicios', label: 'Servicios' },
                { href: '/empleo', label: 'Empleo' },
                { href: '/sobre-mi', label: 'Sobre mí' },
                { href: '/contacto', label: 'Contacto' },
                { href: '/blog', label: 'Blog' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-600 hover:text-henko-turquoise hover:translate-x-1 inline-block text-sm font-raleway transition-all duration-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <p className="font-raleway uppercase tracking-widest text-xs font-bold mb-4 text-gray-400">Contacto</p>
            <ul className="space-y-2 mb-5">
              <li>
                <span className="group inline-flex items-center gap-2.5 text-sm text-gray-700 font-raleway">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-henko-turquoise/10 text-henko-turquoise flex-shrink-0">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </span>
                  Palma de Mallorca, Illes Balears
                </span>
              </li>
              <li>
                <a
                  href="mailto:info@henkoaching.com"
                  className="group inline-flex items-center gap-2.5 text-sm text-gray-700 hover:text-henko-turquoise transition-colors font-raleway"
                >
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-henko-turquoise/10 text-henko-turquoise group-hover:bg-henko-turquoise group-hover:text-white transition-colors flex-shrink-0">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
                      <polyline points="22,8 12,14 2,8" />
                    </svg>
                  </span>
                  info@henkoaching.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+34633657665"
                  className="group inline-flex items-center gap-2.5 text-sm text-gray-700 hover:text-henko-turquoise transition-colors font-raleway"
                >
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-henko-turquoise/10 text-henko-turquoise group-hover:bg-henko-turquoise group-hover:text-white transition-colors flex-shrink-0">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </span>
                  633 65 76 65
                </a>
              </li>
            </ul>
            <div className="flex items-center gap-3 mb-4">
              <a
                href="https://www.instagram.com/henkoaching/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 bg-gray-50 text-gray-700 hover:bg-henko-turquoise hover:text-white hover:border-henko-turquoise transition-all duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://es.linkedin.com/in/jennifer-cervera-3b66a2136"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 bg-gray-50 text-gray-700 hover:bg-henko-turquoise hover:text-white hover:border-henko-turquoise transition-all duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
            <Link href="/contacto" className="inline-flex items-center justify-center border border-gray-200 bg-gray-50 rounded-full text-gray-900 text-xs font-bold tracking-widest uppercase px-6 py-2.5 hover:bg-henko-turquoise hover:text-white transition-all duration-300">
              Escribir ahora
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-2 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
          <p className="text-gray-400 text-xs font-raleway">
            © {new Date().getFullYear()} Henkoaching. Todos los derechos reservados.
          </p>
          <div className="flex gap-4 md:gap-6">
            <Link href="/legal" className="text-gray-400 hover:text-henko-turquoise text-xs font-raleway transition-colors duration-300">
              Legal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
