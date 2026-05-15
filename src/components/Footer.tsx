import Link from 'next/link'

export default function Footer() {
  return (
    <div className="px-4 pb-4 md:px-8 md:pb-8 w-full max-w-[1400px] mx-auto">
      <footer className="bg-white border border-henko-turquoise/15 text-gray-900 rounded-[3rem] p-8 md:p-10 flex flex-col gap-8 shadow-sm relative overflow-hidden">

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">
          {/* Brand */}
          <div className="md:col-span-5">
            <p className="font-raleway tracking-widest uppercase text-sm font-bold mb-2">HENKOACHING</p>
            <p className="text-gray-500 text-xs tracking-[0.2em] font-raleway mb-4 uppercase">coaching & mindfullness</p>
            <p className="text-gray-700 text-sm font-raleway leading-relaxed max-w-xs">
              Orden para tu empresa, tu liderazgo y tu mente.
            </p>
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
            <p className="text-gray-600 text-sm font-raleway mb-4">Basado en Mallorca, operando en todo el mundo.</p>
            <div className="flex items-center gap-3 flex-wrap">
              <Link href="/contacto" className="inline-flex items-center justify-center border border-gray-200 bg-gray-50 rounded-full text-gray-900 text-xs font-bold tracking-widest uppercase px-6 py-2.5 hover:bg-henko-turquoise hover:text-white transition-all duration-300">
                Escribir ahora
              </Link>
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
