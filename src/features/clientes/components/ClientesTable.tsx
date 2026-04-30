'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TablePagination, usePagination } from '@/components/TablePagination'
import type { EstadoCliente, ServicioContratado } from '@/lib/supabase/database.types'
import { ESTADOS_CLIENTE, SERVICIOS, formatImporte, getEstadoClienteMeta, getServicioLabel } from './estados'
import NewClienteModal from './NewClienteModal'

export type ClienteRow = {
  id: string
  nombre: string
  email: string
  telefono: string | null
  empresa: string | null
  servicio_contratado: ServicioContratado | null
  importe: number | null
  tarifa: 'mensual' | 'proyecto' | 'sesion' | null
  estado: EstadoCliente
  proxima_sesion: string | null
  fecha_inicio: string | null
  fecha_conversion: string | null
  origen: string | null
}

type Filtros = {
  estado: EstadoCliente | 'todos'
  servicio: ServicioContratado | 'todos'
  busqueda: string
}

export default function ClientesTable({ clientes }: { clientes: ClienteRow[] }) {
  const router = useRouter()
  const [filtros, setFiltros] = useState<Filtros>({ estado: 'todos', servicio: 'todos', busqueda: '' })
  const [showNew, setShowNew] = useState(false)

  const filtered = useMemo(() => {
    const q = filtros.busqueda.trim().toLowerCase()
    return clientes.filter((c) => {
      if (filtros.estado !== 'todos' && c.estado !== filtros.estado) return false
      if (filtros.servicio !== 'todos' && c.servicio_contratado !== filtros.servicio) return false
      if (q) {
        const hay = `${c.nombre} ${c.email} ${c.empresa ?? ''} ${c.telefono ?? ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [clientes, filtros])

  const pagination = usePagination(filtered, 20)

  return (
    <>
      {/* Toolbar */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm px-4 md:px-6 py-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Buscar por nombre, email, empresa…"
              value={filtros.busqueda}
              onChange={(e) => setFiltros((f) => ({ ...f, busqueda: e.target.value }))}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white"
            />
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros((f) => ({ ...f, estado: e.target.value as EstadoCliente | 'todos' }))}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white"
            >
              <option value="todos">Todos los estados</option>
              {ESTADOS_CLIENTE.map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
            <select
              value={filtros.servicio}
              onChange={(e) => setFiltros((f) => ({ ...f, servicio: e.target.value as ServicioContratado | 'todos' }))}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white"
            >
              <option value="todos">Todos los servicios</option>
              {SERVICIOS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => setShowNew(true)}
            className="px-5 py-2.5 rounded-xl bg-henko-turquoise text-white font-raleway font-semibold text-sm hover:bg-henko-turquoise-light transition-colors whitespace-nowrap"
          >
            + Nuevo cliente manual
          </button>
        </div>
      </div>

      {/* Tabla */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm px-6 md:px-8 py-16 md:py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="font-roxborough text-xl text-gray-400 mb-2">
            {clientes.length === 0 ? 'Aún no tienes clientes' : 'Ningún cliente coincide con los filtros'}
          </p>
          <p className="font-raleway text-gray-400 text-sm font-light">
            {clientes.length === 0 ? 'Convierte un lead o crea un cliente manual.' : 'Prueba a cambiar o quitar filtros.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          {/* Cabecera desktop */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 lg:px-8 py-4 border-b border-gray-100 bg-gray-50">
            <span className="col-span-3 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Nombre</span>
            <span className="col-span-2 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Empresa</span>
            <span className="col-span-2 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Servicio</span>
            <span className="col-span-2 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Importe</span>
            <span className="col-span-2 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Estado</span>
            <span className="col-span-1 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Próx.</span>
          </div>

          {pagination.paginated.map((c) => {
            const estado = getEstadoClienteMeta(c.estado)
            const proxFecha = c.proxima_sesion
              ? new Date(c.proxima_sesion).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
              : null

            return (
              <Link
                key={c.id}
                href={`/dashboard/clientes/${c.id}`}
                className="block border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
              >
                {/* Desktop */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 lg:px-8 py-4 items-center">
                  <span className="col-span-3 font-raleway font-semibold text-gray-900 truncate">{c.nombre}</span>
                  <span className="col-span-2 font-raleway text-sm text-gray-600 truncate">{c.empresa ?? '—'}</span>
                  <span className="col-span-2 font-raleway text-sm text-gray-600 truncate">{getServicioLabel(c.servicio_contratado)}</span>
                  <span className="col-span-2 font-raleway text-sm text-gray-700">{formatImporte(c.importe, c.tarifa)}</span>
                  <span className="col-span-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-raleway font-semibold ${estado.bg} ${estado.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${estado.dot}`} />
                      {estado.label}
                    </span>
                  </span>
                  <span className="col-span-1 font-raleway text-xs text-gray-400">{proxFecha ?? '—'}</span>
                </div>

                {/* Móvil */}
                <div className="md:hidden px-4 py-4">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <p className="font-raleway font-semibold text-gray-900 text-sm truncate">{c.nombre}</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-raleway font-semibold flex-shrink-0 ${estado.bg} ${estado.color}`}>
                      <span className={`w-1 h-1 rounded-full ${estado.dot}`} />
                      {estado.label}
                    </span>
                  </div>
                  {c.empresa && <p className="font-raleway text-xs text-gray-500 truncate mb-1">{c.empresa}</p>}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-400 font-raleway">{getServicioLabel(c.servicio_contratado)}</span>
                    <span className="text-[11px] text-gray-700 font-raleway font-semibold">{formatImporte(c.importe, c.tarifa)}</span>
                  </div>
                </div>
              </Link>
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

      {showNew && (
        <NewClienteModal onClose={() => setShowNew(false)} onCreated={() => { setShowNew(false); router.refresh() }} />
      )}
    </>
  )
}
