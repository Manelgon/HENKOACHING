'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cambiarEstadoSolicitud, getCvUrl } from '@/actions/solicitudes'
import type { EstadoSolicitud } from '@/lib/supabase/database.types'
import { useAction } from '@/shared/feedback/FeedbackContext'
import { TablePagination, usePagination } from '@/components/TablePagination'
import { createClient } from '@/lib/supabase/client'
import CustomSelect from '@/shared/components/CustomSelect'

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
  candidatoId: string
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
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // Overrides optimistas de estado (como leads) para no esperar al refresh
  const [overrides, setOverrides] = useState<Record<string, EstadoSolicitud>>({})

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

  // Limpia overrides cuando el servidor confirma el cambio
  useEffect(() => {
    setOverrides(prev => {
      const next: Record<string, EstadoSolicitud> = {}
      let changed = false
      for (const [id, estado] of Object.entries(prev)) {
        const sol = solicitudes.find(s => s.id === id)
        if (sol?.estado !== estado) { next[id] = estado } else { changed = true }
      }
      return changed ? next : prev
    })
  }, [solicitudes])

  const solicitudesConOverrides = useMemo(() =>
    Object.keys(overrides).length === 0
      ? solicitudes
      : solicitudes.map(s => overrides[s.id] ? { ...s, estado: overrides[s.id] } : s),
    [solicitudes, overrides],
  )

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return solicitudesConOverrides.filter(s => {
      if (filtroOferta !== 'todas' && s.ofertaId !== filtroOferta) return false
      if (q) {
        const hay = `${s.candidato} ${s.email} ${s.telefono} ${s.mensaje}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [solicitudesConOverrides, filtroOferta, busqueda])

  const pagination = usePagination(filtradas, 20)

  const selected = useMemo(
    () => selectedId ? solicitudesConOverrides.find(s => s.id === selectedId) ?? null : null,
    [selectedId, solicitudesConOverrides],
  )

  const stats = [
    { label: 'Total',         val: solicitudes.length,                                          bg: 'bg-white border border-black/5' },
    { label: 'Nuevas',        val: solicitudesConOverrides.filter(s => s.estado === 'nuevo').length,    bg: 'bg-henko-greenblue' },
    { label: 'En entrevista', val: solicitudesConOverrides.filter(s => s.estado === 'entrevista').length, bg: 'bg-henko-purple', light: true },
    { label: 'Descartadas',   val: solicitudesConOverrides.filter(s => s.estado === 'descartado').length, bg: 'bg-[#f2ebe5]' },
  ]

  async function abrirDetalle(s: SolicitudView) {
    setSelectedId(s.id)
    // Auto-cambio: nuevo → revisando al abrir
    if (s.estado === 'nuevo') {
      setOverrides(prev => ({ ...prev, [s.id]: 'revisando' }))
      await cambiarEstadoSolicitud(s.id, 'revisando')
      router.refresh()
    }
  }

  async function cambiarEstado(id: string, estado: EstadoSolicitud) {
    setOverrides(prev => ({ ...prev, [id]: estado }))
    const result = await runAction(
      `Actualizando estado a "${ESTADO_META[estado].label}"`,
      () => cambiarEstadoSolicitud(id, estado),
      { successMessage: 'Estado actualizado' },
    )
    if (result.ok) router.refresh()
  }

  async function descargarCv(path: string) {
    const result = await runAction('Generando enlace del CV', () => getCvUrl(path), { silentSuccess: true })
    if (result.ok && result.data.url) window.open(result.data.url, '_blank')
  }

  useEffect(() => {
    if (!selectedId) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedId(null) }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [selectedId])

  return (
    <div>
      <p className="font-raleway font-bold text-henko-turquoise tracking-[0.14em] uppercase text-[11px] mb-1.5">Portal empleo</p>
      <h2 className="font-roxborough text-2xl text-gray-900 mb-7">Solicitudes recibidas</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-7">
        {stats.map((s, i) => (
          <div key={i} className={`${s.bg} rounded-2xl px-6 py-5`}>
            <p className={`text-3xl font-roxborough ${(s as { light?: boolean }).light ? 'text-white' : 'text-gray-900'}`}>{s.val}</p>
            <p className={`text-xs mt-0.5 ${(s as { light?: boolean }).light ? 'text-white/75' : 'text-gray-500'}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm px-4 md:px-6 py-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Buscar por candidato, email, mensaje…"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white transition-colors"
          />
          <CustomSelect
            value={filtroOferta}
            onChange={(v) => setFiltroOferta(v)}
            options={[
              { value: 'todas', label: 'Todas las ofertas' },
              ...ofertas.map(o => ({ value: o.id, label: o.titulo })),
            ]}
            className="w-full"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-3xl border border-black/5 overflow-hidden">
        <div className="hidden md:grid px-5 lg:px-7 py-3.5 border-b border-black/5 grid-cols-[2fr_2fr_1.5fr_1fr] text-[10px] tracking-widest text-gray-400 font-bold">
          <span>CANDIDATO</span><span>OFERTA</span><span>CV</span><span>ESTADO</span>
        </div>
        {filtradas.length === 0 && (
          <div className="px-5 md:px-7 py-12 text-center text-gray-400 text-sm">No hay solicitudes para mostrar.</div>
        )}
        {pagination.paginated.map((s) => {
          const meta = ESTADO_META[s.estado]
          const esNueva = s.estado === 'nuevo'
          return (
            <div
              key={s.id}
              className={`border-b border-black/5 last:border-0 hover:bg-henko-white/40 transition-colors cursor-pointer ${esNueva ? 'bg-henko-greenblue/10' : ''}`}
              onClick={() => abrirDetalle(s)}
            >
              {/* Desktop */}
              <div className="hidden md:grid px-5 lg:px-7 py-4 grid-cols-[2fr_2fr_1.5fr_1fr] items-center gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  {esNueva && <span className="w-2 h-2 rounded-full bg-henko-turquoise flex-shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{s.candidato}</p>
                    <p className="text-[11px] text-gray-400">{s.email} · {s.fecha}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 truncate">{s.ofertaTitulo}</p>
                <p className="text-xs text-henko-turquoise font-medium truncate">{s.cvNombre || (s.cvPath ? 'Ver CV' : '—')}</p>
                <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold whitespace-nowrap inline-block ${meta.badge}`}>
                  {meta.label}
                </span>
              </div>
              {/* Móvil */}
              <div className="md:hidden px-4 py-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex items-center gap-2">
                    {esNueva && <span className="w-2 h-2 rounded-full bg-henko-turquoise flex-shrink-0 mt-1" />}
                    <div>
                      <p className="text-sm font-semibold truncate">{s.candidato}</p>
                      <p className="text-[11px] text-gray-400 truncate">{s.email} · {s.fecha}</p>
                    </div>
                  </div>
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold whitespace-nowrap flex-shrink-0 ${meta.badge}`}>
                    {meta.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">{s.ofertaTitulo}</p>
              </div>
            </div>
          )
        })}
        <TablePagination
          page={pagination.page} pageSize={pagination.pageSize} total={pagination.total}
          totalPages={pagination.totalPages} from={pagination.from} to={pagination.to}
          onPageChange={pagination.setPage} onPageSizeChange={pagination.setPageSize}
        />
      </div>

      {/* Drawer detalle */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" onClick={() => setSelectedId(null)}>
          <div className="relative h-full w-full max-w-lg bg-white flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-black/5 sticky top-0 bg-white z-10">
              <div>
                <p className="font-roxborough text-xl text-gray-900">{selected.candidato}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{selected.ofertaTitulo} · {selected.fecha}</p>
              </div>
              <button type="button" onClick={() => setSelectedId(null)} className="w-9 h-9 rounded-full hover:bg-black/5 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              {/* Estado */}
              <div>
                <p className="text-[10px] tracking-[0.14em] text-henko-turquoise font-bold mb-2">ESTADO</p>
                <CustomSelect
                  value={selected.estado}
                  onChange={(v) => cambiarEstado(selected.id, v as EstadoSolicitud)}
                  options={Object.entries(ESTADO_META).map(([k, v]) => ({ value: k, label: v.label }))}
                />
              </div>

              {/* Contacto */}
              <div className="grid grid-cols-2 gap-4">
                <InfoField label="EMAIL" value={selected.email} />
                {selected.telefono && <InfoField label="TELÉFONO" value={selected.telefono} />}
              </div>

              {/* CV */}
              {selected.cvPath && (
                <div>
                  <p className="text-[10px] tracking-[0.14em] text-henko-turquoise font-bold mb-2">CURRÍCULUM</p>
                  <button
                    type="button"
                    onClick={() => descargarCv(selected.cvPath!)}
                    className="inline-flex items-center gap-2 text-sm text-henko-turquoise font-semibold hover:underline"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    {selected.cvNombre || 'Descargar CV'}
                  </button>
                </div>
              )}

              {/* Mensaje */}
              {selected.mensaje && (
                <div>
                  <p className="text-[10px] tracking-[0.14em] text-henko-turquoise font-bold mb-2">MENSAJE DEL CANDIDATO</p>
                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl px-4 py-3 whitespace-pre-wrap">{selected.mensaje}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-black/5 bg-white">
              <Link
                href={`/dashboard/candidatos/${selected.candidatoId}`}
                className="w-full inline-flex items-center justify-center gap-2 bg-henko-turquoise text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-henko-turquoise-light hover:shadow-lg transition-all"
              >
                Ver perfil completo →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.14em] text-henko-turquoise font-bold mb-1">{label}</p>
      <p className="text-sm text-gray-800">{value}</p>
    </div>
  )
}
