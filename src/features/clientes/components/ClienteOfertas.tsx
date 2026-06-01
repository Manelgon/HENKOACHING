'use client'

import { useState } from 'react'
import Link from 'next/link'

type SolicitudRow = {
  id: string
  estado: string
  created_at: string | null
  candidato_profiles: {
    profiles: { nombre: string | null; apellidos: string | null; email: string } | null
  } | null
}

type OfertaRow = {
  id: string
  titulo: string
  estado: string
  fecha_publicacion: string | null
  solicitudes: SolicitudRow[]
}

const ESTADO_OFERTA: Record<string, string> = {
  publicada: 'bg-henko-greenblue text-henko-turquoise',
  borrador:  'bg-henko-yellow text-yellow-900',
  pausada:   'bg-orange-100 text-orange-700',
  cerrada:   'bg-black/5 text-gray-500',
}
const LABEL_OFERTA: Record<string, string> = {
  publicada: 'Activa', borrador: 'Borrador', pausada: 'Pausada', cerrada: 'Cerrada',
}

const ESTADO_SOL: Record<string, string> = {
  nuevo:      'bg-henko-greenblue text-henko-turquoise',
  revisando:  'bg-henko-yellow text-yellow-900',
  entrevista: 'bg-henko-purple text-white',
  descartado: 'bg-black/5 text-gray-500',
  contratado: 'bg-henko-turquoise text-white',
}
const LABEL_SOL: Record<string, string> = {
  nuevo: 'Nueva', revisando: 'Revisando', entrevista: 'Entrevista',
  descartado: 'Descartado', contratado: 'Contratado',
}

export default function ClienteOfertas({ ofertas }: { ofertas: OfertaRow[] }) {
  const [abiertaId, setAbiertaId] = useState<string | null>(null)

  const totalSolicitudes = ofertas.reduce((acc, o) => acc + (o.solicitudes?.length ?? 0), 0)

  return (
    <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-8">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-roxborough text-lg text-gray-900">
          Ofertas de empleo
          {ofertas.length > 0 && (
            <span className="ml-2 font-raleway text-base font-normal text-gray-400">
              ({ofertas.length} {ofertas.length === 1 ? 'oferta' : 'ofertas'} · {totalSolicitudes} {totalSolicitudes === 1 ? 'solicitud' : 'solicitudes'})
            </span>
          )}
        </h3>
        <Link
          href="/dashboard/ofertas"
          className="text-xs font-raleway font-semibold text-henko-turquoise hover:underline"
        >
          Ver todas →
        </Link>
      </div>

      {ofertas.length === 0 ? (
        <p className="font-raleway text-sm text-gray-400 italic">No hay ofertas asociadas a este cliente.</p>
      ) : (
        <div className="space-y-3">
          {ofertas.map(o => {
            const solic = o.solicitudes ?? []
            const abierta = abiertaId === o.id
            return (
              <div key={o.id} className="border border-gray-100 rounded-2xl overflow-hidden">
                {/* Cabecera oferta */}
                <button
                  type="button"
                  onClick={() => setAbiertaId(abierta ? null : o.id)}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-raleway font-semibold text-sm text-gray-900 truncate">{o.titulo}</p>
                    {o.fecha_publicacion && (
                      <p className="font-raleway text-[11px] text-gray-400">
                        {new Date(o.fecha_publicacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5 flex-shrink-0 ml-3">
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${ESTADO_OFERTA[o.estado] ?? 'bg-gray-100 text-gray-500'}`}>
                      {LABEL_OFERTA[o.estado] ?? o.estado}
                    </span>
                    {solic.length > 0 && (
                      <span className="font-raleway text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {solic.length} {solic.length === 1 ? 'solicitud' : 'solicitudes'}
                      </span>
                    )}
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${abierta ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Solicitudes expandidas */}
                {abierta && (
                  <div className="border-t border-gray-100 px-5 py-3 space-y-2 bg-gray-50/50">
                    {solic.length === 0 ? (
                      <p className="font-raleway text-xs text-gray-400 italic py-1">Sin solicitudes para esta oferta.</p>
                    ) : solic.map(s => {
                      const cp = s.candidato_profiles as unknown as { profiles: { nombre: string | null; apellidos: string | null; email: string } | null } | null
                      const p = cp?.profiles
                      const nombre = [p?.nombre, p?.apellidos].filter(Boolean).join(' ') || p?.email || '—'
                      return (
                        <div key={s.id} className="flex items-center justify-between py-1.5">
                          <div>
                            <p className="font-raleway text-sm font-medium text-gray-800">{nombre}</p>
                            {s.created_at && (
                              <p className="font-raleway text-[10px] text-gray-400">
                                {new Date(s.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                              </p>
                            )}
                          </div>
                          <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${ESTADO_SOL[s.estado] ?? 'bg-gray-100 text-gray-500'}`}>
                            {LABEL_SOL[s.estado] ?? s.estado}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
