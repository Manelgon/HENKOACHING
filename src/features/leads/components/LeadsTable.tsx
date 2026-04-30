'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAction } from '@/shared/feedback/FeedbackContext'
import { TablePagination, usePagination } from '@/components/TablePagination'
import { abrirLead, archivarLead, cambiarEstadoLead } from '@/actions/leads'
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
  estado: EstadoLead | 'todos'
  origen: string | 'todos'
  busqueda: string
}

export default function LeadsTable({ leads }: { leads: LeadRow[] }) {
  const router = useRouter()
  const runAction = useAction()
  const [filtros, setFiltros] = useState<Filtros>({ estado: 'todos', origen: 'todos', busqueda: '' })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [convertirId, setConvertirId] = useState<string | null>(null)
  // Overrides optimistas mientras la server action está en vuelo
  const [overrides, setOverrides] = useState<Record<string, Partial<LeadRow>>>({})

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
      if (filtros.estado !== 'todos' && l.estado !== filtros.estado) return false
      if (filtros.origen !== 'todos' && (l.origen ?? '') !== filtros.origen) return false
      if (q) {
        const hay = `${l.nombre} ${l.email} ${l.telefono ?? ''} ${l.asunto ?? ''} ${l.mensaje}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [leadsConOverrides, filtros])

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

  return (
    <>
      {/* Toolbar: filtros + acción nuevo lead */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm px-4 md:px-6 py-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Buscar por nombre, email, mensaje…"
              value={filtros.busqueda}
              onChange={(e) => setFiltros((f) => ({ ...f, busqueda: e.target.value }))}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white"
            />
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros((f) => ({ ...f, estado: e.target.value as EstadoLead | 'todos' }))}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white"
            >
              <option value="todos">Todos los estados</option>
              {ESTADOS_LEAD.map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
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
          <button
            type="button"
            onClick={() => setShowNew(true)}
            className="px-5 py-2.5 rounded-xl bg-henko-turquoise text-white font-raleway font-semibold text-sm hover:bg-henko-turquoise-light transition-colors whitespace-nowrap"
          >
            + Nuevo lead manual
          </button>
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
                  <span className="col-span-2 font-raleway text-xs text-gray-400">{fecha}</span>
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
