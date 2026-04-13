import Link from 'next/link'

export default function Footer() {
  return (
    <div className="px-4 pb-4 md:px-8 md:pb-8 w-full max-w-[1400px] mx-auto">
      <footer className="bg-white border border-gray-100 text-gray-900 rounded-[3rem] p-8 md:p-10 flex flex-col gap-8 shadow-sm relative overflow-hidden">

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
                { href: '/trabaja-conmigo', label: 'Trabaja conmigo' },
                { href: '/sobre-mi', label: 'Sobre mí' },
                { href: '/contacto', label: 'Contacto' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-600 hover:text-henko-greenblue hover:translate-x-1 inline-block text-sm font-raleway transition-all duration-300">
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
            <Link href="/contacto" className="inline-flex items-center justify-center border border-gray-200 bg-gray-50 rounded-full text-gray-900 text-xs font-bold tracking-widest uppercase px-6 py-2.5 hover:bg-henko-greenblue hover:text-white transition-all duration-300">
              Escribir ahora
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-2 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
          <p className="text-gray-400 text-xs font-raleway">
            © {new Date().getFullYear()} Henkoaching. Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            {/* Aquí podrían ir iconos sociales en el futuro si hiciera falta */}
          </div>
        </div>
      </footer>
    </div>
  )
}
