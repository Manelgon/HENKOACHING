import Link from 'next/link'
import type { CandidatoPerfil } from '../types'

function formatFechaNacimiento(fecha: string | null): string | null {
  if (!fecha) return null
  const d = new Date(fecha + 'T00:00:00')
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const age = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
  return `${dd}/${mm}/${yyyy} (${age} años)`
}

export default function CandidatoHeader({ perfil }: { perfil: CandidatoPerfil }) {
  const nombre = [perfil.nombre, perfil.apellidos].filter(Boolean).join(' ') || perfil.email
  const inicial = (perfil.nombre?.[0] ?? perfil.email[0]).toUpperCase()
  const fechaNac = formatFechaNacimiento(perfil.fecha_nacimiento)

  // Cargo a mostrar: empleo actual (hasta null) o el más reciente de experiencias
  const expActual = perfil.experiencias.find(e => !e.hasta) ?? perfil.experiencias[0] ?? null
  const cargoDisplay = expActual ? `${expActual.cargo} · ${expActual.empresa}` : null

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-8">
      <div className="flex items-start gap-5">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-2xl bg-henko-turquoise/20 flex items-center justify-center text-henko-turquoise font-roxborough text-2xl flex-shrink-0">
          {inicial}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-roxborough text-2xl text-gray-900 mb-0.5">{nombre}</h2>
          {cargoDisplay && (
            <p className="font-raleway text-henko-turquoise font-medium text-sm mb-1">{cargoDisplay}</p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            <span className="font-raleway text-sm text-gray-500 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {perfil.email}
            </span>
            {perfil.telefono && (
              <span className="font-raleway text-sm text-gray-500 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {perfil.telefono}
              </span>
            )}
            {(perfil.ubicacion || perfil.localidad) && (
              <span className="font-raleway text-sm text-gray-500 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {[perfil.localidad, perfil.ubicacion, perfil.cp].filter(Boolean).join(', ')}
              </span>
            )}
            {fechaNac && (
              <span className="font-raleway text-sm text-gray-500 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {fechaNac}
              </span>
            )}
          </div>
          <div className="flex gap-3 mt-3">
            {perfil.linkedin_url && (
              <Link href={perfil.linkedin_url} target="_blank" className="font-raleway text-xs text-henko-turquoise hover:underline flex items-center gap-1">
                LinkedIn ↗
              </Link>
            )}
            {perfil.web_url && (
              <Link href={perfil.web_url} target="_blank" className="font-raleway text-xs text-henko-turquoise hover:underline flex items-center gap-1">
                Web ↗
              </Link>
            )}
            {perfil.disponibilidad && (
              <span className="font-raleway text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {perfil.disponibilidad}
              </span>
            )}
            {perfil.pretension_salarial && (
              <span className="font-raleway text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {perfil.pretension_salarial}
              </span>
            )}
          </div>
        </div>
      </div>

      {perfil.resumen && (
        <p className="font-raleway text-sm text-gray-600 leading-relaxed mt-5 pt-5 border-t border-gray-100">
          {perfil.resumen}
        </p>
      )}
    </div>
  )
}
