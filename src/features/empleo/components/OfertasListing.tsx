'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { OFERTAS, SECTORES, MODALIDADES, type Oferta } from '@/features/empleo/data'

export default function OfertasListing() {
  const [sector, setSector] = useState<string>('Todos')
  const [modalidad, setModalidad] = useState<string>('Todas')
  const [busqueda, setBusqueda] = useState('')

  const filtradas = useMemo(() => OFERTAS.filter(o => {
    if (!o.activa) return false
    if (sector !== 'Todos' && o.sector !== sector) return false
    if (modalidad !== 'Todas' && o.modalidad !== modalidad) return false
    const q = busqueda.toLowerCase()
    if (q && !o.titulo.toLowerCase().includes(q) && !o.empresa.toLowerCase().includes(q)) return false
    return true
  }), [sector, modalidad, busqueda])

  return (
    <div className="bg-henko-white pt-24 pb-24 font-raleway">
      {/* Header */}
      <section className="relative overflow-hidden px-6 md:px-12 pt-16 pb-20 bg-henko-turquoise rounded-b-[3rem]">
        <div
          className="absolute pointer-events-none"
          style={{
            width: 320, height: 416, top: -80, right: -60,
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '60% 40% 70% 30% / 50% 60% 40% 60%',
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            width: 200, height: 260, bottom: -40, left: 40,
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '60% 40% 70% 30% / 50% 60% 40% 60%',
          }}
        />
        <div className="relative z-10 max-w-4xl">
          <p className="font-raleway font-bold text-white/60 tracking-[0.18em] uppercase text-[11px] mb-4">Portal de empleo</p>
          <h1 className="font-roxborough text-4xl md:text-5xl text-white leading-tight mb-5">Oportunidades de trabajo</h1>
          <p className="text-white/75 text-lg leading-relaxed max-w-2xl">
            Posiciones seleccionadas por Henkoaching para empresas en transformación.
          </p>
        </div>
      </section>

      {/* Filtros + listing */}
      <section className="px-6 md:px-12 pt-14 max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center gap-3 mb-10">
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por cargo o empresa..."
            className="flex-1 min-w-[260px] px-5 py-3 rounded-full text-sm border-[1.5px] border-black/10 bg-white outline-none focus:border-henko-turquoise transition-colors"
          />
          <div className="flex flex-wrap gap-2">
            {SECTORES.map(s => (
              <button
                key={s}
                onClick={() => setSector(s)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  sector === s
                    ? 'bg-henko-turquoise text-white'
                    : 'bg-white text-gray-500 shadow-sm hover:text-gray-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {MODALIDADES.map(m => (
              <button
                key={m}
                onClick={() => setModalidad(m)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  modalidad === m
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-500 shadow-sm hover:text-gray-800'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400 tracking-wider mb-6">
          {filtradas.length} oferta{filtradas.length !== 1 ? 's' : ''} disponible{filtradas.length !== 1 ? 's' : ''}
        </p>

        <div className="flex flex-col gap-3.5">
          {filtradas.map(o => (
            <OfertaRow key={o.id} o={o} />
          ))}
          {filtradas.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p className="font-roxborough text-2xl mb-2">No hay resultados</p>
              <p className="text-sm">Prueba con otros filtros</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA candidatos */}
      <section className="mt-24 px-6 md:px-12 py-20 text-center" style={{ background: '#f2ebe5' }}>
        <div className="max-w-xl mx-auto">
          <h2 className="font-roxborough text-3xl md:text-4xl text-gray-900 mb-4">¿Eres candidato?</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Crea tu perfil, sube tu CV y aplica a las ofertas con un solo clic.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/candidato/signup"
              className="inline-flex items-center gap-2 bg-henko-turquoise text-white px-7 py-3 rounded-full text-sm font-semibold hover:bg-henko-turquoise-light hover:shadow-lg transition-all"
            >
              Crear perfil de candidato
            </Link>
            <Link
              href="/candidato/login"
              className="inline-flex items-center gap-2 bg-transparent border-2 border-henko-turquoise text-henko-turquoise px-7 py-3 rounded-full text-sm font-semibold hover:bg-henko-turquoise hover:text-white transition-all"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function OfertaRow({ o }: { o: Oferta }) {
  return (
    <Link
      href={`/empleo/${o.id}`}
      className="group bg-white rounded-3xl px-9 py-7 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border border-black/5 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)] transition-all"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
          <h3 className="font-roxborough text-xl text-gray-900">{o.titulo}</h3>
          {o.activa && (
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-henko-greenblue text-henko-turquoise tracking-wider">
              ACTIVA
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-3">{o.empresa} · {o.ubicacion}</p>
        <div className="flex gap-2 flex-wrap">
          {[o.modalidad, o.jornada, o.sector].map((tag, i) => (
            <span key={i} className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: '#f2ebe5', color: '#777' }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="text-left md:text-right flex-shrink-0">
        <p className="text-sm font-semibold text-henko-turquoise mb-1">{o.salario}</p>
        <p className="text-xs text-gray-400">{o.fecha}</p>
        <p className="text-xs text-henko-turquoise mt-2 font-semibold group-hover:translate-x-1 transition-transform">Ver oferta →</p>
      </div>
    </Link>
  )
}
