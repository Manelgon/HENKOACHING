'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { TablePagination, usePagination } from '@/components/TablePagination'
import { getCvSignedUrl } from '@/actions/candidatos-admin'
import type { CandidatoRow } from '../types'
import CustomSelect from '@/shared/components/CustomSelect'
import { useSortable } from '@/shared/hooks/useSortable'
import SortHeader from '@/shared/components/SortHeader'

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

function CvButton({ storagePath }: { storagePath: string }) {
  const [loading, setLoading] = useState(false)

  async function download(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setLoading(true)
    const r = await getCvSignedUrl(storagePath)
    setLoading(false)
    if (r) window.open(r, '_blank')
  }

  return (
    <button
      type="button"
      onClick={download}
      disabled={loading}
      title="Descargar CV"
      className="inline-flex items-center gap-1 text-xs text-henko-turquoise hover:text-henko-turquoise-light font-semibold font-raleway disabled:opacity-50 transition-colors"
    >
      {loading ? (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      )}
      CV
    </button>
  )
}

const JORNADAS = ['Jornada completa', 'Media jornada', 'Por horas', 'Indiferente']
const MODALIDADES = ['Presencial', 'Híbrido', 'Remoto', 'Indiferente']

export default function CandidatosTable({ candidatos }: { candidatos: CandidatoRow[] }) {
  const [busqueda, setBusqueda] = useState('')
  const [filtroSolicitudes, setFiltroSolicitudes] = useState<'todos' | 'con' | 'sin' | 'nuevos'>('todos')
  const [filtroJornada, setFiltroJornada] = useState('')
  const [filtroModalidad, setFiltroModalidad] = useState('')
  const [filtroCv, setFiltroCv] = useState<'todos' | 'con' | 'sin'>('todos')
  const [filtroExp, setFiltroExp] = useState<'todos' | 'con' | 'sin'>('todos')

  const activeFilters = [filtroJornada, filtroModalidad, filtroCv !== 'todos', filtroExp !== 'todos'].filter(Boolean).length

  const filtered = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return candidatos.filter((c) => {
      if (filtroSolicitudes === 'con' && c.solicitudes_count === 0) return false
      if (filtroSolicitudes === 'sin' && c.solicitudes_count > 0) return false
      if (filtroSolicitudes === 'nuevos' && !c.es_nuevo) return false
      if (filtroJornada && c.tipo_jornada !== filtroJornada) return false
      if (filtroModalidad && c.modalidad_trabajo !== filtroModalidad) return false
      if (filtroCv === 'con' && !c.tiene_cv) return false
      if (filtroCv === 'sin' && c.tiene_cv) return false
      if (filtroExp === 'con' && !c.tiene_experiencia) return false
      if (filtroExp === 'sin' && c.tiene_experiencia) return false
      if (q) {
        const sectores = (c.sectores_interes ?? []).join(' ').toLowerCase()
        const hay = `${c.nombre ?? ''} ${c.apellidos ?? ''} ${c.email} ${c.cargo_actual ?? ''} ${c.ubicacion ?? ''} ${c.telefono ?? ''} ${sectores}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [candidatos, busqueda, filtroSolicitudes, filtroJornada, filtroModalidad, filtroCv, filtroExp])

  const { sorted, sortKey, sortDir, toggleSort } = useSortable<CandidatoRow>(filtered, 'created_at', 'desc')
  const pagination = usePagination(sorted, 20)

  function resetFiltros() {
    setFiltroJornada('')
    setFiltroModalidad('')
    setFiltroCv('todos')
    setFiltroExp('todos')
    setFiltroSolicitudes('todos')
    setBusqueda('')
  }

  return (
    <div className="space-y-4">
      {/* Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre, email, cargo, ubicación, sector…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white font-raleway text-sm outline-none focus:border-henko-turquoise transition-colors"
          />
        </div>
        <span className="self-center font-raleway text-sm text-gray-400 whitespace-nowrap">
          {filtered.length} candidato{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 items-center">
        <CustomSelect
          value={filtroSolicitudes}
          onChange={(v) => setFiltroSolicitudes(v as typeof filtroSolicitudes)}
          options={[
            { value: 'todos', label: 'Solicitudes: todas' },
            { value: 'nuevos', label: 'Nuevos (7 días)' },
            { value: 'con', label: 'Con solicitudes' },
            { value: 'sin', label: 'Sin solicitudes' },
          ]}
        />

        <CustomSelect
          value={filtroJornada}
          onChange={(v) => setFiltroJornada(v)}
          options={[
            { value: '', label: 'Jornada: todas' },
            ...JORNADAS.map(j => ({ value: j, label: j })),
          ]}
        />

        <CustomSelect
          value={filtroModalidad}
          onChange={(v) => setFiltroModalidad(v)}
          options={[
            { value: '', label: 'Modalidad: todas' },
            ...MODALIDADES.map(m => ({ value: m, label: m })),
          ]}
        />

        <CustomSelect
          value={filtroCv}
          onChange={(v) => setFiltroCv(v as typeof filtroCv)}
          options={[
            { value: 'todos', label: 'CV: todos' },
            { value: 'con', label: 'Con CV' },
            { value: 'sin', label: 'Sin CV' },
          ]}
        />

        <CustomSelect
          value={filtroExp}
          onChange={(v) => setFiltroExp(v as typeof filtroExp)}
          options={[
            { value: 'todos', label: 'Experiencia: todas' },
            { value: 'con', label: 'Con experiencia' },
            { value: 'sin', label: 'Sin experiencia' },
          ]}
        />

        {activeFilters > 0 && (
          <button type="button" onClick={resetFiltros}
            className="text-xs text-gray-400 hover:text-gray-700 font-raleway underline transition-colors">
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Tabla */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm px-8 py-16 text-center">
          <p className="font-roxborough text-xl text-gray-400 mb-2">Sin resultados</p>
          <p className="font-raleway text-gray-400 text-sm">Prueba a cambiar los filtros de búsqueda.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          {/* Cabecera */}
          <div className="hidden lg:grid grid-cols-12 gap-3 px-6 py-3 border-b border-gray-100 bg-gray-50/80">
            <SortHeader label="Candidato" sortKey="nombre" activeSortKey={sortKey} sortDir={sortDir} onSort={k => toggleSort(k as keyof CandidatoRow)} className="col-span-3" />
            <span className="col-span-2 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Contacto</span>
            <span className="col-span-2 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Cargo / Ubicación</span>
            <span className="col-span-2 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Preferencias</span>
            <span className="col-span-1 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest text-center">CV</span>
            <SortHeader label="Sol." sortKey="solicitudes_count" activeSortKey={sortKey} sortDir={sortDir} onSort={k => toggleSort(k as keyof CandidatoRow)} className="col-span-1 justify-center" />
            <SortHeader label="Registro" sortKey="created_at" activeSortKey={sortKey} sortDir={sortDir} onSort={k => toggleSort(k as keyof CandidatoRow)} className="col-span-1" />
          </div>

          {pagination.paginated.map((c) => (
            <Link key={c.id} href={`/dashboard/candidatos/${c.id}`}
              className="border-b border-gray-100 last:border-0 block hover:bg-gray-50 transition-colors">

              {/* Fila desktop */}
              <div className="hidden lg:grid grid-cols-12 gap-3 px-6 py-4 items-center">
                {/* Candidato */}
                <div className="col-span-3 flex items-center gap-3 min-w-0">
                  <div className="relative w-8 h-8 flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-henko-turquoise/20 flex items-center justify-center text-henko-turquoise font-bold text-sm">
                      {(c.nombre?.[0] ?? c.email[0]).toUpperCase()}
                    </div>
                    {c.es_nuevo && (
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-raleway font-semibold text-gray-900 text-sm truncate">
                      {[c.nombre, c.apellidos].filter(Boolean).join(' ') || c.email}
                    </p>
                    <div className="flex gap-1 mt-0.5">
                      {c.tiene_experiencia && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-raleway font-medium">Exp</span>}
                      {c.tiene_educacion && <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded font-raleway font-medium">Edu</span>}
                    </div>
                  </div>
                </div>

                {/* Contacto */}
                <div className="col-span-2 min-w-0">
                  <p className="font-raleway text-xs text-gray-500 truncate">{c.email}</p>
                  {c.telefono && <p className="font-raleway text-xs text-gray-400 truncate mt-0.5">{c.telefono}</p>}
                </div>

                {/* Cargo / Ubicación */}
                <div className="col-span-2 min-w-0">
                  {c.cargo_experiencia ? (
                    <div className="flex items-center gap-1.5 min-w-0">
                      <p className="font-raleway text-xs text-gray-700 truncate">{c.cargo_experiencia}</p>
                      {c.exp_es_actual && <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-raleway font-medium shrink-0">Actual</span>}
                    </div>
                  ) : (
                    <p className="font-raleway text-xs text-gray-300">—</p>
                  )}
                  {c.empresa_experiencia && <p className="font-raleway text-xs text-gray-400 truncate mt-0.5">{c.empresa_experiencia}</p>}
                  {c.ubicacion && <p className="font-raleway text-xs text-gray-400 truncate mt-0.5">{c.ubicacion}</p>}
                </div>

                {/* Preferencias */}
                <div className="col-span-2 flex flex-col gap-1">
                  {c.cargo_actual && (
                    <p className="font-raleway text-xs text-gray-700 truncate">{c.cargo_actual}</p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {c.tipo_jornada && (
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-raleway">{c.tipo_jornada}</span>
                    )}
                    {c.modalidad_trabajo && (
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-raleway">{c.modalidad_trabajo}</span>
                    )}
                    {!c.cargo_actual && !c.tipo_jornada && !c.modalidad_trabajo && <span className="font-raleway text-xs text-gray-300">—</span>}
                  </div>
                </div>

                {/* CV */}
                <div className="col-span-1 flex justify-center" onClick={(e) => e.preventDefault()}>
                  {c.tiene_cv && c.cv_storage_path ? (
                    <CvButton storagePath={c.cv_storage_path} />
                  ) : (
                    <span className="font-raleway text-xs text-gray-300">—</span>
                  )}
                </div>

                {/* Solicitudes */}
                <div className="col-span-1 flex justify-center">
                  {c.solicitudes_count > 0 ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-henko-turquoise/10 text-henko-turquoise font-raleway font-bold text-xs">
                      {c.solicitudes_count}
                    </span>
                  ) : (
                    <span className="font-raleway text-xs text-gray-300">—</span>
                  )}
                </div>

                {/* Registro */}
                <span className="col-span-1 font-raleway text-xs text-gray-400">{formatDate(c.created_at)}</span>
              </div>

              {/* Tarjeta móvil */}
              <div className="lg:hidden px-5 py-4">
                <div className="flex items-center gap-3 mb-1">
                  <div className="relative w-8 h-8 flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-henko-turquoise/20 flex items-center justify-center text-henko-turquoise font-bold text-sm">
                      {(c.nombre?.[0] ?? c.email[0]).toUpperCase()}
                    </div>
                    {c.es_nuevo && <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />}
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
                <div className="ml-11 flex flex-wrap gap-1">
                  {c.cargo_experiencia && <span className="font-raleway text-xs text-gray-500">{c.cargo_experiencia}</span>}
                  {c.tiene_cv && c.cv_storage_path && <CvButton storagePath={c.cv_storage_path} />}
                </div>
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
