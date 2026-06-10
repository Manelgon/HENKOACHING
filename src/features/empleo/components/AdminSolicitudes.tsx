'use client'

import { useState, useMemo, useEffect, useRef, forwardRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cambiarEstadoSolicitud, getCvUrl } from '@/actions/solicitudes'
import type { EstadoSolicitud } from '@/lib/supabase/database.types'
import { useAction } from '@/shared/feedback/FeedbackContext'
import { TablePagination, usePagination } from '@/components/TablePagination'
import { createClient } from '@/lib/supabase/client'
import CustomSelect from '@/shared/components/CustomSelect'
import { useSortable } from '@/shared/hooks/useSortable'
import SortHeader from '@/shared/components/SortHeader'
import AccionesDropdown from './AccionesDropdown'
import AgendarCitaModal from '@/shared/components/AgendarCitaModal'

const TIPOS_CITA_EMPLEO = ['Entrevista', '2ª entrevista', 'Llamada', 'Videollamada', 'Contratación', 'Reunión']
const TIPOS_TAREA_EMPLEO = ['Preparar entrevista', 'Revisar CV', 'Llamar al candidato', 'Enviar propuesta', 'Seguimiento']

const ESTADO_META: Record<EstadoSolicitud, { label: string; badge: string; dot: string }> = {
  nuevo:      { label: 'Nueva',       badge: 'bg-henko-greenblue text-henko-turquoise', dot: 'bg-henko-turquoise' },
  revisando:  { label: 'Revisando',   badge: 'bg-henko-yellow text-yellow-900',         dot: 'bg-yellow-400' },
  entrevista: { label: 'Entrevista',  badge: 'bg-henko-purple text-white',              dot: 'bg-henko-purple' },
  descartado: { label: 'Descartado',  badge: 'bg-black/5 text-gray-500',                dot: 'bg-gray-400' },
  contratado: { label: 'Contratado',  badge: 'bg-henko-turquoise text-white',           dot: 'bg-henko-turquoise' },
}

type TabEstado = 'todas' | EstadoSolicitud

const TABS: { value: TabEstado; label: string; dot?: string }[] = [
  { value: 'todas',      label: 'Todas' },
  { value: 'nuevo',      label: 'Nueva',      dot: 'bg-henko-turquoise' },
  { value: 'revisando',  label: 'Revisando',  dot: 'bg-yellow-400' },
  { value: 'entrevista', label: 'Entrevista', dot: 'bg-henko-purple' },
  { value: 'descartado', label: 'Descartado', dot: 'bg-gray-400' },
  { value: 'contratado', label: 'Contratado', dot: 'bg-henko-turquoise' },
]

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
  cargo: string
  tieneTrayectoria: boolean
}

type Props = {
  solicitudes: SolicitudView[]
  ofertas: { id: string; titulo: string }[]
}

// ─── Dropdown de estado en tabla ─────────────────────────────────────────────
const ESTADO_OPCIONES = Object.entries(ESTADO_META).map(([value, meta]) => ({
  value: value as EstadoSolicitud,
  label: meta.label,
  badge: meta.badge,
}))

function EstadoDropdown({ estado, onChange }: { estado: EstadoSolicitud; onChange: (v: EstadoSolicitud) => void }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const actual = ESTADO_META[estado]

  function handleOpen(e: React.MouseEvent) {
    e.stopPropagation()
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + window.scrollY + 4, left: r.left + window.scrollX })
    }
    setOpen(v => !v)
  }

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const t = e.target as Node
      if (!btnRef.current?.contains(t) && !menuRef.current?.contains(t)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-bold cursor-pointer hover:opacity-80 transition-opacity ${actual.badge}`}
      >
        {actual.label}
        <svg className="w-2.5 h-2.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-[130px]"
          style={{ top: pos.top, left: pos.left }}
        >
          {ESTADO_OPCIONES.map(op => (
            <button
              key={op.value}
              type="button"
              onClick={(e) => { e.stopPropagation(); setOpen(false); if (op.value !== estado) onChange(op.value) }}
              className={`w-full text-left px-3 py-2 text-[11px] font-semibold flex items-center gap-2 transition-colors ${op.value === estado ? 'opacity-40 cursor-default' : 'hover:bg-gray-50'}`}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${op.badge.split(' ')[0]}`} />
              {op.label}
            </button>
          ))}
        </div>
      )}
    </>
  )
}

export default function AdminSolicitudes({ solicitudes, ofertas }: Props) {
  const router = useRouter()
  const runAction = useAction()
  const [tabEstado, setTabEstado] = useState<TabEstado>('todas')
  const [filtroOferta, setFiltroOferta] = useState<string>('todas')
  const [busqueda, setBusqueda] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [agendarSol, setAgendarSol] = useState<SolicitudView | null>(null)
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

  const counts = useMemo(() => {
    const c: Record<TabEstado, number> = { todas: solicitudesConOverrides.length, nuevo: 0, revisando: 0, entrevista: 0, descartado: 0, contratado: 0 }
    for (const s of solicitudesConOverrides) c[s.estado as EstadoSolicitud]++
    return c
  }, [solicitudesConOverrides])

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return solicitudesConOverrides.filter(s => {
      if (tabEstado !== 'todas' && s.estado !== tabEstado) return false
      if (filtroOferta !== 'todas' && s.ofertaId !== filtroOferta) return false
      if (q) {
        const hay = `${s.candidato} ${s.email} ${s.telefono} ${s.mensaje}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [solicitudesConOverrides, tabEstado, filtroOferta, busqueda])

  const { sorted, sortKey, sortDir, toggleSort } = useSortable<SolicitudView>(filtradas, 'fecha', 'desc')
  const pagination = usePagination(sorted, 20)

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

  function abrirDetalle(s: SolicitudView) {
    setSelectedId(s.id)
  }

  async function handleNombreClick(s: SolicitudView) {
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
      <div className="mb-8 md:mb-10">
        <h1 className="font-roxborough text-2xl md:text-3xl text-gray-900 mb-2">Solicitudes</h1>
        <p className="font-raleway text-gray-500 font-light">
          Gestiona las candidaturas recibidas en las ofertas del portal de empleo.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-7">
        {stats.map((s, i) => (
          <div key={i} className={`${s.bg} rounded-2xl px-6 py-5`}>
            <p className={`text-3xl font-roxborough ${(s as { light?: boolean }).light ? 'text-white' : 'text-gray-900'}`}>{s.val}</p>
            <p className={`text-xs mt-0.5 ${(s as { light?: boolean }).light ? 'text-white/75' : 'text-gray-500'}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs estado */}
      <div className="flex items-center gap-1 overflow-x-auto mb-6 border-b border-gray-200" style={{ scrollSnapType: 'x proximity' }}>
        {TABS.map(t => (
          <TabButton
            key={t.value}
            active={tabEstado === t.value}
            onClick={() => setTabEstado(t.value)}
            label={t.label}
            count={counts[t.value]}
            dotColor={t.dot}
          />
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
        <div className="hidden md:grid px-5 lg:px-7 py-3.5 border-b border-black/5 grid-cols-[2fr_1.5fr_1.5fr_1fr_1fr_1fr] text-[10px] tracking-widest text-gray-400 font-bold">
          <SortHeader label="CANDIDATO" sortKey="candidato" activeSortKey={sortKey} sortDir={sortDir} onSort={k => toggleSort(k as keyof SolicitudView)} />
          <SortHeader label="CARGO" sortKey="cargo" activeSortKey={sortKey} sortDir={sortDir} onSort={k => toggleSort(k as keyof SolicitudView)} />
          <SortHeader label="OFERTA" sortKey="ofertaTitulo" activeSortKey={sortKey} sortDir={sortDir} onSort={k => toggleSort(k as keyof SolicitudView)} />
          <SortHeader label="FECHA" sortKey="fecha" activeSortKey={sortKey} sortDir={sortDir} onSort={k => toggleSort(k as keyof SolicitudView)} />
          <span>ESTADO</span>
          <span className="text-right pr-1">ACCIONES</span>
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
              className={`border-b border-black/5 last:border-0 transition-colors ${esNueva ? 'bg-henko-greenblue/10' : ''}`}
            >
              {/* Desktop */}
              <div className="hidden md:grid px-5 lg:px-7 py-4 grid-cols-[2fr_1.5fr_1.5fr_1fr_1fr_1fr] items-center gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  {esNueva && <span className="w-2 h-2 rounded-full bg-henko-turquoise flex-shrink-0" />}
                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/candidatos/${s.candidatoId}`}
                      onClick={e => { e.stopPropagation(); handleNombreClick(s) }}
                      className="text-sm font-semibold truncate block hover:text-henko-turquoise hover:underline transition-colors"
                    >
                      {s.candidato}
                    </Link>
                    <p className="text-[11px] text-gray-400">{s.email}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 truncate">{s.cargo || '—'}</p>
                <p className="text-sm text-gray-600 truncate">{s.ofertaTitulo}</p>
                <p className="text-xs text-gray-400">{s.fecha}</p>
                <div onClick={e => e.stopPropagation()}>
                  <EstadoDropdown estado={s.estado} onChange={v => cambiarEstado(s.id, v)} />
                </div>
                <div className="flex justify-end" onClick={e => e.stopPropagation()}>
                  <AccionesDropdown
                    onAgendar={() => setAgendarSol(s)}
                    onDescargarCv={s.cvPath ? () => descargarCv(s.cvPath!) : undefined}
                    trayectoriaUrl={`/api/dashboard/candidatos/${s.candidatoId}/pdf`}
                    tieneTrayectoria={s.tieneTrayectoria}
                    perfilUrl={`/dashboard/candidatos/${s.candidatoId}`}
                  />
                </div>
              </div>
              {/* Móvil */}
              <div className="md:hidden px-4 py-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex items-center gap-2">
                    {esNueva && <span className="w-2 h-2 rounded-full bg-henko-turquoise flex-shrink-0 mt-1" />}
                    <div>
                      <Link
                        href={`/dashboard/candidatos/${s.candidatoId}`}
                        onClick={e => { e.stopPropagation(); handleNombreClick(s) }}
                        className="text-sm font-semibold truncate block hover:text-henko-turquoise transition-colors"
                      >
                        {s.candidato}
                      </Link>
                      <p className="text-[11px] text-gray-400 truncate">{s.email} · {s.fecha}</p>
                    </div>
                  </div>
                  <div onClick={e => e.stopPropagation()} className="flex-shrink-0 flex items-center gap-1">
                    <EstadoDropdown estado={s.estado} onChange={v => cambiarEstado(s.id, v)} />
                    <AccionesDropdown
                      onAgendar={() => setAgendarSol(s)}
                      onDescargarCv={s.cvPath ? () => descargarCv(s.cvPath!) : undefined}
                      trayectoriaUrl={`/api/dashboard/candidatos/${s.candidatoId}/pdf`}
                      tieneTrayectoria={s.tieneTrayectoria}
                      perfilUrl={`/dashboard/candidatos/${s.candidatoId}`}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 truncate mb-1">{s.ofertaTitulo}</p>
                <p className="text-[11px] text-gray-400">{s.fecha}</p>
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

              {/* Trayectoria */}
              <div>
                <p className="text-[10px] tracking-[0.14em] text-henko-turquoise font-bold mb-2">TRAYECTORIA</p>
                {selected.tieneTrayectoria ? (
                  <a
                    href={`/api/dashboard/candidatos/${selected.candidatoId}/pdf`}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-2 text-sm text-henko-turquoise font-semibold hover:underline"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    Descargar trayectoria (PDF)
                  </a>
                ) : (
                  <p className="inline-flex items-center gap-1.5 text-sm text-gray-300 cursor-not-allowed" title="El candidato aún no ha rellenado su trayectoria">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75M3.75 21.75h16.5a1.5 1.5 0 001.5-1.5v-8.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v8.25a1.5 1.5 0 001.5 1.5z" />
                    </svg>
                    Trayectoria sin rellenar
                  </p>
                )}
              </div>

              {/* Mensaje */}
              {selected.mensaje && (
                <div>
                  <p className="text-[10px] tracking-[0.14em] text-henko-turquoise font-bold mb-2">MENSAJE DEL CANDIDATO</p>
                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl px-4 py-3 whitespace-pre-wrap">{selected.mensaje}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-black/5 bg-white flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAgendarSol(selected)}
                className="flex-1 inline-flex items-center justify-center gap-2 border border-henko-turquoise text-henko-turquoise px-5 py-3 rounded-full text-sm font-semibold hover:bg-henko-turquoise/5 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                Agendar
              </button>
              <Link
                href={`/dashboard/candidatos/${selected.candidatoId}`}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-henko-turquoise text-white px-5 py-3 rounded-full text-sm font-semibold hover:bg-henko-turquoise-light hover:shadow-lg transition-all"
              >
                Ver perfil →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Modal agendar cita */}
      {agendarSol && (
        <AgendarCitaModal
          recurso={{ tipo: 'solicitud', id: agendarSol.id, nombre: agendarSol.candidato, email: agendarSol.email, contexto: agendarSol.ofertaTitulo }}
          tiposCita={TIPOS_CITA_EMPLEO}
          tiposTarea={TIPOS_TAREA_EMPLEO}
          onClose={() => setAgendarSol(null)}
          onDone={() => setAgendarSol(null)}
        />
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

const TabButton = forwardRef<HTMLButtonElement, { active: boolean; onClick: () => void; label: string; count: number; dotColor?: string }>(
  function TabButton({ active, onClick, label, count, dotColor }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        style={{ scrollSnapAlign: 'start' }}
        className={`relative px-3 md:px-4 py-3 font-raleway text-sm font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 flex-shrink-0 ${
          active ? 'text-henko-turquoise' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        {dotColor && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
        {label}
        <span className={`text-xs font-normal px-1.5 py-0.5 rounded-full ${
          active ? 'bg-henko-turquoise/10 text-henko-turquoise' : 'bg-gray-100 text-gray-400'
        }`}>
          {count}
        </span>
        {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-henko-turquoise rounded-full" />}
      </button>
    )
  }
)
