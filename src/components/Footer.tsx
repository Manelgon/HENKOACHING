import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-henko-turquoise text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <p className="font-raleway tracking-widest uppercase text-sm font-semibold mb-1">HENKOACHING</p>
            <p className="text-white/60 text-xs tracking-wider font-raleway mb-4">coaching & mindfullness</p>
            <p className="text-white/80 text-sm font-raleway leading-relaxed">
              Orden para tu empresa, tu liderazgo y tu mente.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="font-raleway uppercase tracking-widest text-xs font-semibold mb-4 text-white/60">Páginas</p>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Inicio' },
                { href: '/servicios', label: 'Servicios' },
                { href: '/trabaja-conmigo', label: 'Trabaja conmigo' },
                { href: '/sobre-mi', label: 'Sobre mí' },
                { href: '/contacto', label: 'Contacto' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/80 hover:text-white text-sm font-raleway transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="font-raleway uppercase tracking-widest text-xs font-semibold mb-4 text-white/60">Contacto</p>
            <p className="text-white/80 text-sm font-raleway mb-2">Mallorca, España</p>
            <Link href="/contacto" className="inline-block mt-2 border border-white/40 text-white text-xs font-raleway tracking-wide uppercase px-5 py-2 hover:bg-white hover:text-henko-turquoise transition-all duration-200">
              Escribir ahora
            </Link>
          </div>
        </div>

        <div className="border-t border-white/20 mt-10 pt-6 text-center">
          <p className="text-white/40 text-xs font-raleway">
            © {new Date().getFullYear()} Henkoaching. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
