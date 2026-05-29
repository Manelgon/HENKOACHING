'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { TablePagination, usePagination } from '@/components/TablePagination'
import type { CandidatoRow } from '../types'

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function CandidatosTable({ candidatos }: { candidatos: CandidatoRow[] }) {
  const [busqueda, setBusqueda] = useState('')
  const [filtroSolicitudes, setFiltroSolicitudes] = useState<'todos' | 'con' | 'sin'>('todos')

  const filtered = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return candidatos.filter((c) => {
      if (filtroSolicitudes === 'con' && c.solicitudes_count === 0) return false
      if (filtroSolicitudes === 'sin' && c.solicitudes_count > 0) return false
      if (q) {
        const hay = `${c.nombre ?? ''} ${c.apellidos ?? ''} ${c.email} ${c.cargo_actual ?? ''} ${c.ubicacion ?? ''} ${c.telefono ?? ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [candidatos, busqueda, filtroSolicitudes])

  const pagination = usePagination(filtered, 20)

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre, email, cargo, ubicación…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white font-raleway text-sm outline-none focus:border-henko-turquoise transition-colors"
          />
        </div>
        <select
          value={filtroSolicitudes}
          onChange={(e) => setFiltroSolicitudes(e.target.value as typeof filtroSolicitudes)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white font-raleway text-sm outline-none focus:border-henko-turquoise transition-colors"
        >
          <option value="todos">Todas las solicitudes</option>
          <option value="con">Con solicitudes</option>
          <option value="sin">Sin solicitudes</option>
        </select>
        <span className="self-center font-raleway text-sm text-gray-400 whitespace-nowrap">
          {filtered.length} candidato{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tabla */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm px-8 py-16 text-center">
          <p className="font-roxborough text-xl text-gray-400 mb-2">Sin resultados</p>
          <p className="font-raleway text-gray-400 text-sm">Prueba a cambiar los filtros de búsqueda.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          {/* Cabecera desktop */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50/80">
            <span className="col-span-3 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Candidato</span>
            <span className="col-span-3 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Email</span>
            <span className="col-span-2 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Cargo actual</span>
            <span className="col-span-2 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Ubicación</span>
            <span className="col-span-1 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Solicitudes</span>
            <span className="col-span-1 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Registro</span>
          </div>

          {pagination.paginated.map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/candidatos/${c.id}`}
              className="border-b border-gray-100 last:border-0 block hover:bg-gray-50 transition-colors"
            >
              {/* Fila desktop */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 items-center">
                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-henko-turquoise/20 flex items-center justify-center text-henko-turquoise font-bold text-sm flex-shrink-0">
                    {(c.nombre?.[0] ?? c.email[0]).toUpperCase()}
                  </div>
                  <span className="font-raleway font-semibold text-gray-900 text-sm truncate">
                    {[c.nombre, c.apellidos].filter(Boolean).join(' ') || c.email}
                  </span>
                </div>
                <span className="col-span-3 font-raleway text-sm text-gray-500 truncate">{c.email}</span>
                <span className="col-span-2 font-raleway text-sm text-gray-500 truncate">{c.cargo_actual ?? '—'}</span>
                <span className="col-span-2 font-raleway text-sm text-gray-500 truncate">{c.ubicacion ?? '—'}</span>
                <div className="col-span-1 flex justify-center">
                  {c.solicitudes_count > 0 ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-henko-turquoise/10 text-henko-turquoise font-raleway font-bold text-xs">
                      {c.solicitudes_count}
                    </span>
                  ) : (
                    <span className="font-raleway text-xs text-gray-300">—</span>
                  )}
                </div>
                <span className="col-span-1 font-raleway text-xs text-gray-400">{formatDate(c.created_at)}</span>
              </div>

              {/* Tarjeta móvil */}
              <div className="md:hidden px-5 py-4">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 rounded-full bg-henko-turquoise/20 flex items-center justify-center text-henko-turquoise font-bold text-sm flex-shrink-0">
                    {(c.nombre?.[0] ?? c.email[0]).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-raleway font-semibold text-gray-900 text-sm truncate">
                      {[c.nombre, c.apellidos].filter(Boolean).join(' ') || c.email}
                    </p>
                    <p className="font-raleway text-xs text-gray-500 truncate">{c.email}</p>
                  </div>
                  {c.solicitudes_count > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-henko-turquoise/10 text-henko-turquoise font-bold text-xs font-raleway">
                      {c.solicitudes_count} sol.
                    </span>
                  )}
                </div>
                {c.cargo_actual && <p className="font-raleway text-xs text-gray-400 ml-11">{c.cargo_actual}</p>}
              </div>
            </Link>
          ))}

          <TablePagination
            page={pagination.page} pageSize={pagination.pageSize}
            total={pagination.total} totalPages={pagination.totalPages}
            from={pagination.from} to={pagination.to}
            onPageChange={pagination.setPage} onPageSizeChange={pagination.setPageSize}
          />
        </div>
      )}
    </div>
  )
}
