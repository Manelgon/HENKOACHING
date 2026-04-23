'use client'

import { useState, useMemo } from 'react'
import { OFERTAS, SOLICITUDES_MOCK, ESTADO_SOL, type Solicitud, type EstadoSolicitud } from '@/features/empleo/data'

export default function AdminSolicitudes() {
  const [filtroOferta, setFiltroOferta] = useState<string>('todas')
  const [sols, setSols] = useState<Solicitud[]>(SOLICITUDES_MOCK)

  const filtradas = useMemo(() =>
    filtroOferta === 'todas' ? sols : sols.filter(s => s.ofertaId === Number(filtroOferta)),
    [sols, filtroOferta],
  )

  const stats: { label: string; val: number; bg: string; light?: boolean }[] = [
    { label: 'Total',        val: sols.length,                                      bg: 'bg-white border border-black/5' },
    { label: 'Nuevas',       val: sols.filter(s => s.estado === 'nuevo').length,    bg: 'bg-henko-greenblue' },
    { label: 'En entrevista', val: sols.filter(s => s.estado === 'entrevista').length, bg: 'bg-henko-purple', light: true },
    { label: 'Descartadas',  val: sols.filter(s => s.estado === 'descartado').length, bg: 'bg-[#f2ebe5]' },
  ]

  return (
    <div>
      <p className="font-raleway font-bold text-henko-turquoise tracking-[0.14em] uppercase text-[11px] mb-1.5">Portal empleo</p>
      <h2 className="font-roxborough text-3xl text-gray-900 mb-7">Solicitudes recibidas</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-7">
        {stats.map((s, i) => (
          <div key={i} className={`${s.bg} rounded-2xl px-6 py-5.5`}>
            <p className={`text-3xl font-roxborough ${s.light ? 'text-white' : 'text-gray-900'}`}>{s.val}</p>
            <p className={`text-xs mt-0.5 ${s.light ? 'text-white/75' : 'text-gray-500'}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtro por oferta */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <button
          type="button"
          onClick={() => setFiltroOferta('todas')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all ${
            filtroOferta === 'todas' ? 'bg-henko-turquoise text-white' : 'bg-white text-gray-500 hover:text-gray-800'
          }`}
        >
          Todas
        </button>
        {OFERTAS.map(o => (
          <button
            key={o.id}
            type="button"
            onClick={() => setFiltroOferta(String(o.id))}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all ${
              filtroOferta === String(o.id) ? 'bg-henko-turquoise text-white' : 'bg-white text-gray-500 hover:text-gray-800'
            }`}
          >
            {o.titulo}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-3xl border border-black/5 overflow-hidden overflow-x-auto">
        <div className="px-7 py-3.5 border-b border-black/5 grid grid-cols-[2fr_2fr_1fr_1fr_140px] text-[10px] tracking-widest text-gray-400 font-bold min-w-[700px]">
          <span>CANDIDATO</span><span>OFERTA</span><span>CV</span><span>ESTADO</span><span>GESTIONAR</span>
        </div>
        {filtradas.map((s) => {
          const o = OFERTAS.find(x => x.id === s.ofertaId)
          const meta = ESTADO_SOL[s.estado]
          return (
            <div
              key={s.id}
              className="px-7 py-4 border-b border-black/5 last:border-0 grid grid-cols-[2fr_2fr_1fr_1fr_140px] items-center min-w-[700px] hover:bg-henko-white/40 transition-colors"
            >
              <div>
                <p className="text-sm font-semibold">{s.candidato}</p>
                <p className="text-[11px] text-gray-400">{s.fecha}</p>
              </div>
              <p className="text-sm text-gray-600">{o?.titulo}</p>
              <button type="button" className="text-xs text-henko-turquoise font-semibold text-left hover:underline">
                {s.cv}
              </button>
              <span>
                <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold whitespace-nowrap ${meta.badge}`}>
                  {meta.label}
                </span>
              </span>
              <select
                value={s.estado}
                onChange={(e) => setSols(arr => arr.map(x => x.id === s.id ? { ...x, estado: e.target.value as EstadoSolicitud } : x))}
                className="px-3 py-1.5 rounded-lg text-xs border border-black/10 bg-henko-white outline-none cursor-pointer focus:border-henko-turquoise"
              >
                {Object.entries(ESTADO_SOL).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          )
        })}
      </div>
    </div>
  )
}
