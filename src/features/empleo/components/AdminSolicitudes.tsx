'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { cambiarEstadoSolicitud, getCvUrl } from '@/actions/solicitudes'
import type { EstadoSolicitud } from '@/lib/supabase/database.types'
import { useAction } from '@/shared/feedback/FeedbackContext'
import { TablePagination, usePagination } from '@/components/TablePagination'
import { createClient } from '@/lib/supabase/client'

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
  const runAction = useAction()
  const [filtroOferta, setFiltroOferta] = useState<string>('todas')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('admin-solicitudes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'solicitudes' }, () => {
        router.refresh()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [router])

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return solicitudes.filter(s => {
      if (filtroOferta !== 'todas' && s.ofertaId !== filtroOferta) return false
      if (q) {
        const hay = `${s.candidato} ${s.email} ${s.telefono} ${s.mensaje}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [solicitudes, filtroOferta, busqueda])
  const pagination = usePagination(filtradas, 20)

  const stats = [
    { label: 'Total',        val: solicitudes.length,                                            bg: 'bg-white border border-black/5' },
    { label: 'Nuevas',       val: solicitudes.filter(s => s.estado === 'nuevo').length,         bg: 'bg-henko-greenblue' },
    { label: 'En entrevista', val: solicitudes.filter(s => s.estado === 'entrevista').length,    bg: 'bg-henko-purple', light: true },
    { label: 'Descartadas',  val: solicitudes.filter(s => s.estado === 'descartado').length,    bg: 'bg-[#f2ebe5]' },
  ]

  async function descargarCv(path: string) {
    const result = await runAction(
      'Generando enlace del CV',
      () => getCvUrl(path),
      { silentSuccess: true },
    )
    if (result.ok && result.data.url) {
      window.open(result.data.url, '_blank')
    }
  }

  async function cambiarEstado(id: string, estado: EstadoSolicitud) {
    const result = await runAction(
      `Actualizando estado a "${ESTADO_META[estado].label}"`,
      () => cambiarEstadoSolicitud(id, estado),
      { successMessage: 'Estado actualizado' },
    )
    if (result.ok) router.refresh()
  }

  return (
    <div>
      <p className="font-raleway font-bold text-henko-turquoise tracking-[0.14em] uppercase text-[11px] mb-1.5">Portal empleo</p>
      <h2 className="font-roxborough text-2xl text-gray-900 mb-7">Solicitudes recibidas</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-7">
        {stats.map((s, i) => (
          <div key={i} className={`${s.bg} rounded-2xl px-6 py-5`}>
            <p className={`text-3xl font-roxborough ${s.light ? 'text-white' : 'text-gray-900'}`}>{s.val}</p>
            <p className={`text-xs mt-0.5 ${s.light ? 'text-white/75' : 'text-gray-500'}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar: buscador + filtro por oferta */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm px-4 md:px-6 py-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Buscar por candidato, email, mensaje…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white transition-colors"
          />
          <select
            value={filtroOferta}
            onChange={(e) => setFiltroOferta(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white transition-colors"
          >
            <option value="todas">Todas las ofertas</option>
            {ofertas.map(o => (
              <option key={o.id} value={o.id}>{o.titulo}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-3xl border border-black/5 overflow-hidden">
        <div className="hidden md:grid px-5 lg:px-7 py-3.5 border-b border-black/5 grid-cols-[2fr_2fr_1.5fr_1fr_140px] text-[10px] tracking-widest text-gray-400 font-bold">
          <span>CANDIDATO</span><span>OFERTA</span><span>CV</span><span>ESTADO</span><span>GESTIONAR</span>
        </div>
        {filtradas.length === 0 && (
          <div className="px-5 md:px-7 py-12 text-center text-gray-400 text-sm">
            No hay solicitudes para mostrar.
          </div>
        )}
        {pagination.paginated.map((s) => {
          const meta = ESTADO_META[s.estado]
          const cvNode = s.cvPath ? (
            <button
              type="button"
              onClick={() => descargarCv(s.cvPath!)}
              className="text-xs text-henko-turquoise font-semibold text-left hover:underline truncate pr-2"
            >
              {s.cvNombre || 'Ver CV'}
            </button>
          ) : (
            <span className="text-xs text-gray-300">Sin CV</span>
          )
          const estadoSelect = (
            <select
              value={s.estado}
              onChange={(e) => cambiarEstado(s.id, e.target.value as EstadoSolicitud)}
              className="px-3 py-1.5 rounded-lg text-xs border border-black/10 bg-henko-white outline-none cursor-pointer focus:border-henko-turquoise"
            >
              {Object.entries(ESTADO_META).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          )
          return (
            <div key={s.id} className="border-b border-black/5 last:border-0 hover:bg-henko-white/40 transition-colors">
              {/* Tabla (desktop/tablet) */}
              <div className="hidden md:grid px-5 lg:px-7 py-4 grid-cols-[2fr_2fr_1.5fr_1fr_140px] items-center">
                <div>
                  <p className="text-sm font-semibold">{s.candidato}</p>
                  <p className="text-[11px] text-gray-400">{s.email} · {s.fecha}</p>
                </div>
                <p className="text-sm text-gray-600">{s.ofertaTitulo}</p>
                {cvNode}
                <span>
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold whitespace-nowrap ${meta.badge}`}>
                    {meta.label}
                  </span>
                </span>
                {estadoSelect}
              </div>

              {/* Tarjeta (móvil) */}
              <div className="md:hidden px-4 py-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{s.candidato}</p>
                    <p className="text-[11px] text-gray-400 truncate">{s.email} · {s.fecha}</p>
                  </div>
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold whitespace-nowrap flex-shrink-0 ${meta.badge}`}>
                    {meta.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3 truncate">{s.ofertaTitulo}</p>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">{cvNode}</div>
                  {estadoSelect}
                </div>
              </div>
            </div>
          )
        })}

        <TablePagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          totalPages={pagination.totalPages}
          from={pagination.from}
          to={pagination.to}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
        />
      </div>
    </div>
  )
}
