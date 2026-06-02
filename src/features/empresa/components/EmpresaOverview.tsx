import Image from 'next/image'
import Link from 'next/link'

type Props = {
  nombre: string
  descripcion: string | null
  logoUrl: string | null
  ubicacion: string | null
  stats: {
    totalOfertas: number
    ofertasActivas: number
    totalCandidatos: number
    totalFacturas: number
  }
}

export default function EmpresaOverview({ nombre, descripcion, logoUrl, ubicacion, stats }: Props) {
  return (
    <div className="space-y-8">
      {/* Cabecera */}
      <div className="flex items-center gap-4">
        {logoUrl ? (
          <Image src={logoUrl} alt={nombre} width={64} height={64} className="w-16 h-16 rounded-xl object-contain bg-gray-50 border border-gray-100 p-1" />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-henko-turquoise/10 flex items-center justify-center text-henko-turquoise font-bold text-2xl font-roxborough">
            {nombre[0]}
          </div>
        )}
        <div>
          <h1 className="font-roxborough text-2xl text-gray-900">{nombre}</h1>
          {ubicacion && <p className="font-raleway text-sm text-gray-400 mt-0.5">{ubicacion}</p>}
        </div>
      </div>

      {descripcion && (
        <p className="font-raleway text-gray-600 text-sm leading-relaxed max-w-2xl">{descripcion}</p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Ofertas publicadas" value={stats.ofertasActivas} href="/empresa/ofertas" />
        <StatCard label="Total ofertas" value={stats.totalOfertas} href="/empresa/ofertas" />
        <StatCard label="Candidatos recibidos" value={stats.totalCandidatos} href="/empresa/candidatos" />
        <StatCard label="Facturas" value={stats.totalFacturas} href="/empresa/facturas" />
      </div>

      {/* Accesos rápidos */}
      <div>
        <h2 className="font-raleway text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Accesos rápidos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <QuickLink href="/empresa/ofertas" label="Ver mis ofertas" />
          <QuickLink href="/empresa/candidatos" label="Ver candidatos" />
          <QuickLink href="/empresa/perfil" label="Editar mi perfil" />
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="bg-white border border-gray-100 rounded-xl p-4 hover:border-henko-turquoise/30 hover:shadow-sm transition-all group">
      <p className="font-roxborough text-3xl text-gray-900 group-hover:text-henko-turquoise transition-colors">{value}</p>
      <p className="font-raleway text-xs text-gray-400 mt-1">{label}</p>
    </Link>
  )
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-4 py-3 bg-white border border-gray-100 rounded-xl font-raleway text-sm text-gray-700 hover:border-henko-turquoise/30 hover:text-henko-turquoise hover:shadow-sm transition-all"
    >
      {label}
      <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}
