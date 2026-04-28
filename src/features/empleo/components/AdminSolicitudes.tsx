'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { cambiarEstadoSolicitud, getCvUrl } from '@/actions/solicitudes'
import type { EstadoSolicitud } from '@/lib/supabase/database.types'

const ESTADO_META: Record<EstadoSolicitud, { label: string; badge: string }> = {
  nuevo:      { label: 'Nueva',       badge: 'bg-henko-greenblue text-henko-turquoise' },
  revisando:  { label: 'Revisando',   badge: 'bg-henko-yellow text-yellow-900' },
  entrevista: { label: 'Entrevista',  badge: 'bg-henko-purple text-white' },
  descartado: { label: 'Descartado',  badge: 'bg-black/5 text-gray-500' },
  contratado: { label: 'Contratado',  badge: 'bg-henko-turquoise text-white' },
}

type SolicitudView = {
  id: string
  estado: EstadoSolicitud
  fecha: string
  candidato: string
  email: string
  telefono: string
  mensaje: string
  ofertaId: string
  ofertaTitulo: string
  cvNombre: string | null
  cvPath: string | null
}

type Props = {
  solicitudes: SolicitudView[]
  ofertas: { id: string; titulo: string }[]
}

export default function AdminSolicitudes({ solicitudes, ofertas }: Props) {
  const router = useRouter()
  const [filtroOferta, setFiltroOferta] = useState<string>('todas')

  const filtradas = useMemo(() =>
    filtroOferta === 'todas' ? solicitudes : solicitudes.filter(s => s.ofertaId === filtroOferta),
    [solicitudes, filtroOferta],
  )

  const stats = [
    { label: 'Total',        val: solicitudes.length,                                            bg: 'bg-white border border-black/5' },
    { label: 'Nuevas',       val: solicitudes.filter(s => s.estado === 'nuevo').length,         bg: 'bg-henko-greenblue' },
    { label: 'En entrevista', val: solicitudes.filter(s => s.estado === 'entrevista').length,    bg: 'bg-henko-purple', light: true },
    { label: 'Descartadas',  val: solicitudes.filter(s => s.estado === 'descartado').length,    bg: 'bg-[#f2ebe5]' },
  ]

  async function descargarCv(path: string) {
    const result = await getCvUrl(path)
    if (result.url) window.open(result.url, '_blank')
    else alert('No se pudo abrir el CV: ' + result.error)
  }

  async function cambiarEstado(id: string, estado: EstadoSolicitud) {
    await cambiarEstadoSolicitud(id, estado)
    router.refresh()
  }

  return (
    <div>
      <p className="font-raleway font-bold text-henko-turquoise tracking-[0.14em] uppercase text-[11px] mb-1.5">Portal empleo</p>
      <h2 className="font-roxborough text-3xl text-gray-900 mb-7">Solicitudes recibidas</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-7">
        {stats.map((s, i) => (
          <div key={i} className={`${s.bg} rounded-2xl px-6 py-5`}>
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
        {ofertas.map(o => (
          <button
            key={o.id}
            type="button"
            onClick={() => setFiltroOferta(o.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all ${
              filtroOferta === o.id ? 'bg-henko-turquoise text-white' : 'bg-white text-gray-500 hover:text-gray-800'
            }`}
          >
            {o.titulo}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-3xl border border-black/5 overflow-hidden overflow-x-auto">
        <div className="px-7 py-3.5 border-b border-black/5 grid grid-cols-[2fr_2fr_1.5fr_1fr_140px] text-[10px] tracking-widest text-gray-400 font-bold min-w-[800px]">
          <span>CANDIDATO</span><span>OFERTA</span><span>CV</span><span>ESTADO</span><span>GESTIONAR</span>
        </div>
        {filtradas.length === 0 && (
          <div className="px-7 py-12 text-center text-gray-400 text-sm">
            No hay solicitudes para mostrar.
          </div>
        )}
        {filtradas.map((s) => {
          const meta = ESTADO_META[s.estado]
          return (
            <div
              key={s.id}
              className="px-7 py-4 border-b border-black/5 last:border-0 grid grid-cols-[2fr_2fr_1.5fr_1fr_140px] items-center min-w-[800px] hover:bg-henko-white/40 transition-colors"
            >
              <div>
                <p className="text-sm font-semibold">{s.candidato}</p>
                <p className="text-[11px] text-gray-400">{s.email} · {s.fecha}</p>
              </div>
              <p className="text-sm text-gray-600">{s.ofertaTitulo}</p>
              {s.cvPath ? (
                <button
                  type="button"
                  onClick={() => descargarCv(s.cvPath!)}
                  className="text-xs text-henko-turquoise font-semibold text-left hover:underline truncate pr-2"
                >
                  {s.cvNombre || 'Ver CV'}
                </button>
              ) : (
                <span className="text-xs text-gray-300">Sin CV</span>
              )}
              <span>
                <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold whitespace-nowrap ${meta.badge}`}>
                  {meta.label}
                </span>
              </span>
              <select
                value={s.estado}
                onChange={(e) => cambiarEstado(s.id, e.target.value as EstadoSolicitud)}
                className="px-3 py-1.5 rounded-lg text-xs border border-black/10 bg-henko-white outline-none cursor-pointer focus:border-henko-turquoise"
              >
                {Object.entries(ESTADO_META).map(([k, v]) => (
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
