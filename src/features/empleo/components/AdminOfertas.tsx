'use client'

import { useEffect, useMemo, useRef, useState, forwardRef } from 'react'
import { useRouter } from 'next/navigation'
import { cambiarEstadoOferta } from '@/actions/ofertas'
import { useAction, useConfirm } from '@/shared/feedback/FeedbackContext'
import { TablePagination, usePagination } from '@/components/TablePagination'
import { useSortable } from '@/shared/hooks/useSortable'
import { useUrlState } from '@/shared/hooks/useUrlState'
import SortHeader from '@/shared/components/SortHeader'
import NuevaOfertaDrawer, { type Catalogo, type EmpresaOption } from './NuevaOfertaDrawer'

type OfertaView = {
  id: string
  titulo: string
  empresa: string
  empresa_oculta: boolean
  ubicacion: string
  salario_texto: string
  reporta_a: string
  contrato: string
  descripcion: string
  funciones: string[]
  requisitos: string[]
  competencias: string[]
  ofrecemos: string[]
  estado: 'borrador' | 'publicada' | 'pausada' | 'cerrada'
  fecha: string
  fecha_expiracion: string
  sector_id: number | null
  modalidad_id: number | null
  jornada_id: number | null
  sector_nombre: string
  modalidad_nombre: string
  jornada_nombre: string
  candidatos_count: number
}

type Props = {
  ofertas: OfertaView[]
  sectores: Catalogo[]
  modalidades: Catalogo[]
  jornadas: Catalogo[]
  empresas: EmpresaOption[]
}

// ─── Estado dropdown (tabla) ─────────────────────────────────────────────────
const ESTADO_OPCIONES: { value: OfertaView['estado']; label: string; badge: string }[] = [
  { value: 'publicada', label: 'Activa',    badge: 'bg-henko-greenblue text-henko-turquoise' },
  { value: 'borrador',  label: 'Borrador',  badge: 'bg-henko-yellow text-yellow-900' },
  { value: 'pausada',   label: 'Pausada',   badge: 'bg-orange-100 text-orange-700' },
  { value: 'cerrada',   label: 'Cerrada',   badge: 'bg-black/5 text-gray-500' },
]

function EstadoDropdown({ estado, onChange }: { estado: OfertaView['estado']; onChange: (v: OfertaView['estado']) => void }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const actual = ESTADO_OPCIONES.find(o => o.value === estado)!

  // Borrador solo disponible si la oferta está actualmente en borrador
  const opciones = ESTADO_OPCIONES.filter(o => o.value !== 'borrador' || estado === 'borrador')

  function handleOpen() {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + window.scrollY + 4, left: r.left + window.scrollX })
    }
    setOpen(v => !v)
  }

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) setOpen(false)
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
        className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-bold cursor-pointer transition-opacity hover:opacity-80 ${actual.badge}`}
      >
        {actual.label}
        <svg className="w-2.5 h-2.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div
          className="fixed z-50 bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-[120px]"
          style={{ top: pos.top, left: pos.left }}
        >
          {opciones.map(op => (
            <button
              key={op.value}
              type="button"
              onClick={() => { setOpen(false); if (op.value !== estado) onChange(op.value) }}
              className={`w-full text-left px-3 py-2 text-[11px] font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2 ${op.value === estado ? 'opacity-40 cursor-default' : ''}`}
            >
              <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${op.badge.split(' ')[0]}`} />
              {op.label}
            </button>
          ))}
        </div>
      )}
    </>
  )
}

type TabOferta = 'todos' | OfertaView['estado']

const TABS_OFERTA: { value: TabOferta; label: string; dot?: string }[] = [
  { value: 'todos',     label: 'Todas' },
  { value: 'publicada', label: 'Activa',   dot: 'bg-henko-turquoise' },
  { value: 'borrador',  label: 'Borrador', dot: 'bg-yellow-400' },
  { value: 'pausada',   label: 'Pausada',  dot: 'bg-orange-400' },
  { value: 'cerrada',   label: 'Cerrada',  dot: 'bg-gray-400' },
]

export default function AdminOfertas({ ofertas, sectores, modalidades, jornadas, empresas }: Props) {
  const router = useRouter()
  const runAction = useAction()
  const confirm = useConfirm()

  // ── Filtros ──────────────────────────────────────────────────────────────
  const [tabEstado, setTabEstado] = useUrlState<TabOferta>('estado', 'todos', TABS_OFERTA.map(t => t.value))
  const [busqueda, setBusqueda] = useUrlState<string>('q', '')

  const counts = useMemo(() => {
    const c: Record<TabOferta, number> = { todos: ofertas.length, publicada: 0, borrador: 0, pausada: 0, cerrada: 0 }
    for (const o of ofertas) c[o.estado]++
    return c
  }, [ofertas])

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return ofertas.filter(o => {
      if (tabEstado !== 'todos' && o.estado !== tabEstado) return false
      if (q && !o.titulo.toLowerCase().includes(q) && !o.empresa.toLowerCase().includes(q)) return false
      return true
    })
  }, [ofertas, busqueda, tabEstado])

  const { sorted, sortKey, sortDir, toggleSort } = useSortable<OfertaView>(filtradas, 'fecha', 'desc')
  const pagination = usePagination(sorted, 20)

  // ── Drawer crear nueva oferta ──────────────────────────────────────────────
  const [showNueva, setShowNueva] = useState(false)

  const cambiarEstadoConConfirm = async (o: OfertaView, nuevoEstado: OfertaView['estado']) => {
    if (nuevoEstado === o.estado) return
    const labels: Record<OfertaView['estado'], string> = {
      publicada: 'Activa', borrador: 'Borrador', pausada: 'Pausada', cerrada: 'Cerrada',
    }
    const ok = await confirm({
      title: `Cambiar estado a "${labels[nuevoEstado]}"`,
      description: `¿Confirmas cambiar el estado de "${o.titulo}" de ${labels[o.estado]} a ${labels[nuevoEstado]}?`,
      confirmLabel: 'Confirmar',
    })
    if (!ok) return
    const result = await runAction(
      `Cambiando estado a ${labels[nuevoEstado]}`,
      () => cambiarEstadoOferta(o.id, nuevoEstado),
      { successMessage: `Estado cambiado a ${labels[nuevoEstado]}` },
    )
    if (result.ok) router.refresh()
  }

  return (
    <div>
      {/* Tabs estado */}
      <div className="flex items-center gap-1 overflow-x-auto mb-6 border-b border-gray-200" style={{ scrollSnapType: 'x proximity' }}>
        {TABS_OFERTA.map(t => (
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

      {/* Toolbar: búsqueda + botón nueva oferta */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm px-4 md:px-6 py-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Buscar por título o empresa…"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="flex-1 min-w-[180px] px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowNueva(true)}
            className="inline-flex items-center gap-2 bg-henko-turquoise text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-henko-turquoise-light hover:shadow-lg transition-all whitespace-nowrap"
          >
            + Nueva oferta
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-3xl border border-black/5 overflow-hidden">
        <div className="hidden md:grid px-5 lg:px-7 py-3.5 border-b border-black/5 grid-cols-[2fr_1.5fr_1fr_0.7fr_70px_100px_110px] text-[10px] tracking-widest text-gray-400 font-bold">
          <SortHeader label="OFERTA" sortKey="titulo" activeSortKey={sortKey} sortDir={sortDir} onSort={k => toggleSort(k as keyof OfertaView)} />
          <SortHeader label="EMPRESA" sortKey="empresa" activeSortKey={sortKey} sortDir={sortDir} onSort={k => toggleSort(k as keyof OfertaView)} />
          <SortHeader label="SECTOR" sortKey="sector_nombre" activeSortKey={sortKey} sortDir={sortDir} onSort={k => toggleSort(k as keyof OfertaView)} />
          <span>MODALIDAD</span>
          <SortHeader label="CAND." sortKey="candidatos_count" activeSortKey={sortKey} sortDir={sortDir} onSort={k => toggleSort(k as keyof OfertaView)} />
          <SortHeader label="EXPIRA" sortKey="fecha_expiracion" activeSortKey={sortKey} sortDir={sortDir} onSort={k => toggleSort(k as keyof OfertaView)} />
          <span>ESTADO</span>
        </div>
        {filtradas.length === 0 && (
          <div className="px-5 md:px-7 py-12 text-center text-gray-400 text-sm">
            {ofertas.length === 0 ? 'Aún no hay ofertas.' : 'Ninguna oferta coincide con los filtros.'}
          </div>
        )}
        {pagination.paginated.map((o) => (
          <div
            key={o.id}
            className="border-b border-black/5 last:border-0 hover:bg-henko-white/40 transition-colors cursor-pointer"
            onClick={() => router.push(`/dashboard/ofertas/${o.id}`)}
          >
            {/* Desktop */}
            <div className="hidden md:grid px-5 lg:px-7 py-4 grid-cols-[2fr_1.5fr_1fr_0.7fr_70px_100px_110px] items-center gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{o.titulo}</p>
                <p className="text-[11px] text-gray-400">{o.fecha}{o.ubicacion ? ` · ${o.ubicacion}` : ''}</p>
              </div>
              <div className="min-w-0">
                <span className="text-sm text-gray-600 inline-flex items-center gap-1.5 truncate">
                  {o.empresa}
                  {o.empresa_oculta && (
                    <span className="text-[9px] font-bold tracking-wider text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded flex-shrink-0">OCULTA</span>
                  )}
                </span>
              </div>
              <span className="text-xs text-gray-500 truncate">{o.sector_nombre || '—'}</span>
              <span className="text-xs text-gray-500 truncate">{o.modalidad_nombre || '—'}</span>
              <span className={`text-xs font-semibold text-center ${o.candidatos_count > 0 ? 'text-henko-turquoise' : 'text-gray-300'}`}>
                {o.candidatos_count}
              </span>
              <span className="text-xs text-gray-400">
                {o.fecha_expiracion
                  ? (() => {
                      const dias = Math.ceil((new Date(o.fecha_expiracion).getTime() - Date.now()) / 86400000)
                      return dias < 0
                        ? <span className="text-red-400">Expirada</span>
                        : dias <= 7
                        ? <span className="text-orange-400">{o.fecha_expiracion}</span>
                        : o.fecha_expiracion
                    })()
                  : '—'}
              </span>
              <div onClick={e => e.stopPropagation()}>
                <EstadoDropdown estado={o.estado} onChange={nuevoEstado => cambiarEstadoConConfirm(o, nuevoEstado)} />
              </div>
            </div>
            {/* Móvil */}
            <div className="md:hidden px-4 py-4">
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{o.titulo}</p>
                  <p className="text-[11px] text-gray-400">{o.empresa}{o.ubicacion ? ` · ${o.ubicacion}` : ''}</p>
                </div>
                <div onClick={e => e.stopPropagation()}>
                  <EstadoDropdown estado={o.estado} onChange={nuevoEstado => cambiarEstadoConConfirm(o, nuevoEstado)} />
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {o.sector_nombre && <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{o.sector_nombre}</span>}
                {o.modalidad_nombre && <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{o.modalidad_nombre}</span>}
                {o.candidatos_count > 0 && <span className="text-[10px] text-henko-turquoise font-semibold">{o.candidatos_count} candidato{o.candidatos_count !== 1 ? 's' : ''}</span>}
              </div>
            </div>
          </div>
        ))}
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

      {/* Drawer — solo crear nueva oferta */}
      {showNueva && (
        <NuevaOfertaDrawer
          sectores={sectores}
          modalidades={modalidades}
          jornadas={jornadas}
          empresas={empresas}
          onClose={() => setShowNueva(false)}
        />
      )}
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
