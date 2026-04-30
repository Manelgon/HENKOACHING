'use client'

import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAction } from '@/shared/feedback/FeedbackContext'
import { TablePagination, usePagination } from '@/components/TablePagination'
import { abrirLead, archivarLead, cambiarEstadoLead, desarchivarLead, eliminarLead } from '@/actions/leads'
import type { EstadoLead } from '@/lib/supabase/database.types'
import { ESTADOS_LEAD, getEstadoMeta, getOrigenLabel } from './estados'
import LeadDrawer from './LeadDrawer'
import NewLeadModal from './NewLeadModal'
import ConvertirClienteModal from './ConvertirClienteModal'

export type LeadRow = {
  id: string
  nombre: string
  email: string
  telefono: string | null
  asunto: string | null
  mensaje: string
  servicio_interes: string | null
  origen: string | null
  estado: EstadoLead
  leido: boolean | null
  archivado: boolean | null
  creado_manualmente: boolean | null
  created_at: string | null
}

type Filtros = {
  origen: string | 'todos'
  busqueda: string
}

type Tab = EstadoLead | 'archivados'

export default function LeadsTable({ leads }: { leads: LeadRow[] }) {
  const router = useRouter()
  const runAction = useAction()
  const [tab, setTab] = useState<Tab>('nuevo')
  const [filtros, setFiltros] = useState<Filtros>({ origen: 'todos', busqueda: '' })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [convertirId, setConvertirId] = useState<string | null>(null)
  // Overrides optimistas mientras la server action está en vuelo
  const [overrides, setOverrides] = useState<Record<string, Partial<LeadRow>>>({})

  // Refs para scroll automático a la pestaña activa en móvil
  const tabsContainerRef = useRef<HTMLDivElement>(null)
  const activeTabRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (activeTabRef.current && tabsContainerRef.current) {
      activeTabRef.current.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
    }
  }, [tab])

  // Contadores por pestaña
  const counts = useMemo(() => {
    const c: Record<Tab, number> = {
      nuevo: 0,
      pendiente: 0,
      contactado: 0,
      en_conversacion: 0,
      descartado: 0,
      archivados: 0,
    }
    for (const l of leads) {
      if (l.archivado) c.archivados++
      else c[l.estado]++
    }
    return c
  }, [leads])

  // Limpiar overrides cuando los datos del servidor llegan con el cambio aplicado
  useEffect(() => {
    setOverrides((prev) => {
      const next: Record<string, Partial<LeadRow>> = {}
      let changed = false
      for (const [id, ov] of Object.entries(prev)) {
        const lead = leads.find((l) => l.id === id)
        if (!lead) { changed = true; continue }
        const stillNeeded: Partial<LeadRow> = {}
        let hasAny = false
        for (const key of Object.keys(ov) as (keyof LeadRow)[]) {
          if (lead[key] !== ov[key]) {
            (stillNeeded as Record<string, unknown>)[key as string] = ov[key]
            hasAny = true
          } else {
            changed = true
          }
        }
        if (hasAny) next[id] = stillNeeded
      }
      return changed ? next : prev
    })
  }, [leads])

  // Aplicar overrides a la lista
  const leadsConOverrides = useMemo(() => {
    if (Object.keys(overrides).length === 0) return leads
    return leads.map((l) => overrides[l.id] ? { ...l, ...overrides[l.id] } : l)
  }, [leads, overrides])

  const filtered = useMemo(() => {
    const q = filtros.busqueda.trim().toLowerCase()
    return leadsConOverrides.filter((l) => {
      // Tab: archivados o estado específico
      if (tab === 'archivados') {
        if (!l.archivado) return false
      } else {
        if (l.archivado) return false
        if (l.estado !== tab) return false
      }

      if (filtros.origen !== 'todos' && (l.origen ?? '') !== filtros.origen) return false
      if (q) {
        const hay = `${l.nombre} ${l.email} ${l.telefono ?? ''} ${l.asunto ?? ''} ${l.mensaje}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [leadsConOverrides, filtros, tab])

  const pagination = usePagination(filtered, 20)

  const origenesPresentes = useMemo(() => {
    const set = new Set<string>()
    leads.forEach((l) => l.origen && set.add(l.origen))
    return Array.from(set)
  }, [leads])

  // Lead actualmente abierto en drawer/modal — buscamos sobre TODA la lista (no filtrada)
  // para que cambiar el estado a uno fuera del filtro no cierre el drawer.
  const selected = useMemo(
    () => (selectedId ? leadsConOverrides.find((l) => l.id === selectedId) ?? null : null),
    [selectedId, leadsConOverrides],
  )
  const convertir = useMemo(
    () => (convertirId ? leadsConOverrides.find((l) => l.id === convertirId) ?? null : null),
    [convertirId, leadsConOverrides],
  )

  function applyOverride(id: string, patch: Partial<LeadRow>) {
    setOverrides((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))
  }

  async function abrirDetalle(lead: LeadRow) {
    setSelectedId(lead.id)
    if (lead.estado === 'nuevo' || !lead.leido) {
      // Optimista: marcar como leído + pasar a pendiente
      const patch: Partial<LeadRow> = { leido: true }
      if (lead.estado === 'nuevo') patch.estado = 'pendiente'
      applyOverride(lead.id, patch)

      const result = await runAction(
        'Abriendo lead',
        () => abrirLead(lead.id),
        { silentSuccess: true },
      )
      if (result.ok) router.refresh()
    }
  }

  async function cambiarEstado(id: string, estado: EstadoLead) {
    // Optimista: aplicar inmediato
    applyOverride(id, { estado })

    const result = await runAction(
      'Actualizando estado',
      () => cambiarEstadoLead(id, estado),
      { silentSuccess: true },
    )
    if (result.ok) router.refresh()
  }

  async function archivar(id: string) {
    if (!confirm('¿Archivar este lead?')) return
    const result = await runAction(
      'Archivando lead',
      () => archivarLead(id),
      { successMessage: 'Lead archivado' },
    )
    if (result.ok) {
      setSelectedId(null)
      router.refresh()
    }
  }

  async function desarchivar(id: string) {
    const result = await runAction(
      'Recuperando lead',
      () => desarchivarLead(id),
      { successMessage: 'Lead recuperado' },
    )
    if (result.ok) router.refresh()
  }

  async function eliminarDef(id: string) {
    if (!confirm('¿Eliminar este lead definitivamente? Esta acción no se puede deshacer.')) return
    const result = await runAction(
      'Eliminando lead',
      () => eliminarLead(id),
      { successMessage: 'Lead eliminado' },
    )
    if (result.ok) {
      setSelectedId(null)
      router.refresh()
    }
  }

  return (
    <>
      {/* Botón "+ Nuevo lead" — encima en móvil, integrado con tabs en desktop */}
      {tab !== 'archivados' && (
        <div className="md:hidden mb-3 flex justify-end">
          <button
            type="button"
            onClick={() => setShowNew(true)}
            className="px-4 py-2 rounded-xl bg-henko-turquoise text-white font-raleway font-semibold text-sm hover:bg-henko-turquoise-light transition-colors"
          >
            + Nuevo lead
          </button>
        </div>
      )}

      {/* Tabs por estado + botón nuevo (desktop) */}
      <div className="flex items-end justify-between gap-4 mb-6 border-b border-gray-200">
        <div
          ref={tabsContainerRef}
          className="flex items-center gap-1 overflow-x-auto flex-1 min-w-0 scrollbar-thin scroll-smooth"
          style={{ scrollSnapType: 'x proximity', WebkitOverflowScrolling: 'touch' }}
        >
          {ESTADOS_LEAD.map((e) => (
            <TabButton
              key={e.value}
              ref={tab === e.value ? activeTabRef : undefined}
              active={tab === e.value}
              onClick={() => setTab(e.value)}
              label={e.label}
              count={counts[e.value]}
              dotColor={e.dot}
            />
          ))}
          <TabButton
            ref={tab === 'archivados' ? activeTabRef : undefined}
            active={tab === 'archivados'}
            onClick={() => setTab('archivados')}
            label="Archivados"
            count={counts.archivados}
          />
        </div>
        {tab !== 'archivados' && (
          <button
            type="button"
            onClick={() => setShowNew(true)}
            className="hidden md:inline-flex mb-2 flex-shrink-0 px-5 py-2.5 rounded-xl bg-henko-turquoise text-white font-raleway font-semibold text-sm hover:bg-henko-turquoise-light transition-colors whitespace-nowrap"
          >
            + Nuevo lead manual
          </button>
        )}
      </div>

      {/* Toolbar: filtros */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm px-4 md:px-6 py-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Buscar por nombre, email, mensaje…"
            value={filtros.busqueda}
            onChange={(e) => setFiltros((f) => ({ ...f, busqueda: e.target.value }))}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white"
          />
          <select
            value={filtros.origen}
            onChange={(e) => setFiltros((f) => ({ ...f, origen: e.target.value }))}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white"
          >
            <option value="todos">Todos los orígenes</option>
            {origenesPresentes.map((o) => (
              <option key={o} value={o}>{getOrigenLabel(o)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm px-6 md:px-8 py-16 md:py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="font-roxborough text-xl text-gray-400 mb-2">
            {leads.length === 0 ? 'Sin leads todavía' : 'Ningún lead coincide con los filtros'}
          </p>
          <p className="font-raleway text-gray-400 text-sm font-light">
            {leads.length === 0 ? 'Cuando alguien rellene el formulario, aparecerá aquí.' : 'Prueba a cambiar o quitar filtros.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          {/* Cabecera desktop */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 lg:px-8 py-4 border-b border-gray-100 bg-gray-50">
            <span className="col-span-3 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Nombre</span>
            <span className="col-span-3 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Email</span>
            <span className="col-span-2 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Estado</span>
            <span className="col-span-2 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Origen</span>
            <span className="col-span-2 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Fecha</span>
          </div>

          {pagination.paginated.map((l) => {
            const fecha = l.created_at
              ? new Date(l.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
              : ''
            const estado = getEstadoMeta(l.estado)

            return (
              <div key={l.id} className={`border-b border-gray-100 last:border-0 ${!l.leido ? 'bg-henko-greenblue/10' : ''}`}>
                {/* Fila desktop */}
                <div
                  className="hidden md:grid grid-cols-12 gap-4 px-6 lg:px-8 py-4 items-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => abrirDetalle(l)}
                >
                  <span className="col-span-3 font-raleway font-semibold text-gray-900 truncate">
                    {!l.leido && <span className="inline-block w-2 h-2 rounded-full bg-henko-turquoise mr-2" />}
                    {l.nombre}
                  </span>
                  <span className="col-span-3 font-raleway text-sm text-gray-600 truncate">{l.email}</span>
                  <span className="col-span-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-raleway font-semibold ${estado.bg} ${estado.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${estado.dot}`} />
                      {estado.label}
                    </span>
                  </span>
                  <span className="col-span-2 font-raleway text-xs text-gray-500 truncate">{getOrigenLabel(l.origen)}</span>
                  {tab !== 'archivados' ? (
                    <span className="col-span-2 font-raleway text-xs text-gray-400">{fecha}</span>
                  ) : (
                    <span className="col-span-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); desarchivar(l.id) }}
                        className="px-2.5 py-1 rounded-lg bg-henko-turquoise/10 text-henko-turquoise text-xs font-raleway font-semibold hover:bg-henko-turquoise/20 transition-colors"
                      >
                        Recuperar
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); eliminarDef(l.id) }}
                        className="px-2.5 py-1 rounded-lg bg-red-50 text-red-500 text-xs font-raleway font-semibold hover:bg-red-100 transition-colors"
                      >
                        Eliminar
                      </button>
                    </span>
                  )}
                </div>

                {/* Tarjeta móvil */}
                <div
                  className="md:hidden px-4 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => abrirDetalle(l)}
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <p className="font-raleway font-semibold text-gray-900 text-sm flex items-center min-w-0 truncate">
                      {!l.leido && <span className="inline-block w-2 h-2 rounded-full bg-henko-turquoise mr-2 flex-shrink-0" />}
                      <span className="truncate">{l.nombre}</span>
                    </p>
                    <span className="font-raleway text-xs text-gray-400 flex-shrink-0">{fecha}</span>
                  </div>
                  <p className="font-raleway text-xs text-gray-500 truncate mb-2">{l.email}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-raleway font-semibold ${estado.bg} ${estado.color}`}>
                      <span className={`w-1 h-1 rounded-full ${estado.dot}`} />
                      {estado.label}
                    </span>
                    <span className="text-[10px] text-gray-400 font-raleway">{getOrigenLabel(l.origen)}</span>
                  </div>
                  {tab === 'archivados' && (
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); desarchivar(l.id) }}
                        className="px-3 py-1.5 rounded-lg bg-henko-turquoise/10 text-henko-turquoise text-xs font-raleway font-semibold hover:bg-henko-turquoise/20 transition-colors"
                      >
                        Recuperar
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); eliminarDef(l.id) }}
                        className="px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-raleway font-semibold hover:bg-red-100 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
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
      )}

      {/* Drawer detalle */}
      {selected && (
        <LeadDrawer
          lead={selected}
          onClose={() => setSelectedId(null)}
          onCambiarEstado={(estado) => cambiarEstado(selected.id, estado)}
          onArchivar={() => archivar(selected.id)}
          onConvertir={() => {
            setConvertirId(selected.id)
            setSelectedId(null)
          }}
          onDesarchivar={() => desarchivar(selected.id)}
          onEliminar={() => eliminarDef(selected.id)}
        />
      )}

      {/* Modal nuevo lead manual */}
      {showNew && (
        <NewLeadModal onClose={() => setShowNew(false)} onCreated={() => { setShowNew(false); router.refresh() }} />
      )}

      {/* Modal convertir a cliente */}
      {convertir && (
        <ConvertirClienteModal
          lead={convertir}
          onClose={() => setConvertirId(null)}
          onConverted={() => { setConvertirId(null); router.refresh() }}
        />
      )}
    </>
  )
}

type TabButtonProps = {
  active: boolean
  onClick: () => void
  label: string
  count: number
  dotColor?: string
}

const TabButton = forwardRef<HTMLButtonElement, TabButtonProps>(function TabButton(
  { active, onClick, label, count, dotColor },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      style={{ scrollSnapAlign: 'start' }}
      className={`relative px-3 md:px-4 py-3 font-raleway text-sm font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 flex-shrink-0 ${
        active
          ? 'text-henko-turquoise'
          : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      {dotColor && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      {label}
      <span className={`text-xs font-normal px-1.5 py-0.5 rounded-full ${
        active ? 'bg-henko-turquoise/10 text-henko-turquoise' : 'bg-gray-100 text-gray-400'
      }`}>
        {count}
      </span>
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-henko-turquoise rounded-full" />
      )}
    </button>
  )
})
