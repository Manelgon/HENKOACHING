'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import type { Json } from '@/lib/supabase/database.types'
import { PAGE_SIZE_OPTIONS, type PageSize } from '@/components/TablePagination'

type LogRow = {
  id: string
  actor_email: string | null
  actor_id: string | null
  accion: string
  recurso_tipo: string
  recurso_id: string | null
  recurso_label: string | null
  metadata: Json | null
  created_at: string | null
}

type Props = {
  logs: LogRow[]
  total: number
  page: number
  pageSize: number
  acciones: string[]
  recursos: string[]
  currentFilters: { accion: string; recurso: string; actor: string; q: string }
}

function fmtDateTime(d: string | null) {
  if (!d) return '—'
  const date = new Date(d)
  return date.toLocaleString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

function actionColor(accion: string): string {
  if (accion.includes('eliminar') || accion.includes('desactivar') || accion.includes('fallido')) return 'bg-red-50 text-red-700'
  if (accion.includes('crear') || accion.includes('reactivar')) return 'bg-green-50 text-green-700'
  if (accion.includes('editar') || accion.includes('cambiar') || accion.includes('actualiz')) return 'bg-blue-50 text-blue-700'
  if (accion.startsWith('auth.')) return 'bg-purple-50 text-purple-700'
  return 'bg-gray-100 text-gray-700'
}

export default function LogsView({ logs, total, page, pageSize, acciones, recursos, currentFilters }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [detail, setDetail] = useState<LogRow | null>(null)
  const [filters, setFilters] = useState(currentFilters)

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(total, page * pageSize)

  function applyFilters(next: typeof filters, nextPage = 1, nextSize = pageSize) {
    const sp = new URLSearchParams()
    if (next.accion) sp.set('accion', next.accion)
    if (next.recurso) sp.set('recurso', next.recurso)
    if (next.actor) sp.set('actor', next.actor)
    if (next.q) sp.set('q', next.q)
    if (nextPage > 1) sp.set('page', String(nextPage))
    if (nextSize !== 20) sp.set('size', String(nextSize))
    router.push(`${pathname}?${sp.toString()}`)
  }

  function clearFilters() {
    setFilters({ accion: '', recurso: '', actor: '', q: '' })
    router.push(pathname)
  }

  function changePageSize(newSize: PageSize) {
    applyFilters(filters, 1, newSize)
  }

  const hasFilters = filters.accion || filters.recurso || filters.actor || filters.q

  return (
    <div>
      {/* Filtros */}
      <div className="bg-white rounded-2xl p-4 border border-black/5 mb-5 grid grid-cols-1 md:grid-cols-5 gap-3">
        <input
          type="search"
          placeholder="Buscar (label/id/email)…"
          value={filters.q}
          onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters(filters)}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm font-raleway md:col-span-2"
        />
        <select
          value={filters.accion}
          onChange={(e) => setFilters({ ...filters, accion: e.target.value })}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm font-raleway"
        >
          <option value="">Todas las acciones</option>
          {acciones.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <select
          value={filters.recurso}
          onChange={(e) => setFilters({ ...filters, recurso: e.target.value })}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm font-raleway"
        >
          <option value="">Todos los recursos</option>
          {recursos.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <input
          type="text"
          placeholder="Actor (email)…"
          value={filters.actor}
          onChange={(e) => setFilters({ ...filters, actor: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters(filters)}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm font-raleway"
        />
        <div className="md:col-span-5 flex gap-2 justify-end">
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 rounded-xl text-sm font-raleway text-gray-500 hover:text-gray-700"
            >
              Limpiar
            </button>
          )}
          <button
            type="button"
            onClick={() => applyFilters(filters)}
            className="px-4 py-2 rounded-xl bg-henko-turquoise text-white text-sm font-raleway font-medium"
          >
            Aplicar filtros
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
        <table className="w-full text-sm font-raleway">
          <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
            <tr>
              <th className="text-left px-4 py-3">Fecha</th>
              <th className="text-left px-4 py-3">Actor</th>
              <th className="text-left px-4 py-3">Acción</th>
              <th className="text-left px-4 py-3">Recurso</th>
              <th className="text-right px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-10">Sin registros</td>
              </tr>
            ) : logs.map((log) => (
              <tr key={log.id} className="border-t border-black/5 hover:bg-gray-50/50">
                <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{fmtDateTime(log.created_at)}</td>
                <td className="px-4 py-3 text-xs">
                  <span className="text-gray-700">{log.actor_email ?? <em className="text-gray-400">anónimo</em>}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${actionColor(log.accion)}`}>
                    {log.accion}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">
                  <span className="text-gray-500">{log.recurso_tipo}</span>
                  {log.recurso_label && <span className="text-gray-700"> · {log.recurso_label}</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setDetail(log)}
                    className="text-henko-turquoise hover:underline text-xs"
                  >
                    Detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {total > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-black/5 bg-gray-50/50 text-xs font-raleway text-gray-500">
            <div className="flex items-center gap-2">
              <span>Mostrar</span>
              <select
                value={pageSize}
                onChange={(e) => changePageSize(Number(e.target.value) as PageSize)}
                className="px-2 py-1 rounded-lg border border-gray-200 bg-white text-gray-700 outline-none focus:border-henko-turquoise"
                aria-label="Resultados por página"
              >
                {PAGE_SIZE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <span>por página</span>
            </div>

            <div className="flex items-center gap-3">
              <span>{from}-{to} de {total}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => applyFilters(filters, Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="w-7 h-7 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                  aria-label="Página anterior"
                >
                  ←
                </button>
                <span className="px-2 text-gray-700 font-medium">{page} / {totalPages}</span>
                <button
                  type="button"
                  onClick={() => applyFilters(filters, Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="w-7 h-7 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                  aria-label="Página siguiente"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Drawer detalle */}
      {detail && (
        <div className="fixed inset-0 bg-black/40 flex justify-end z-50">
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto p-7 font-raleway">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">Log entry</p>
                <h3 className="font-roxborough text-2xl">{detail.accion}</h3>
              </div>
              <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>

            <DetailRow label="Fecha" value={fmtDateTime(detail.created_at)} />
            <DetailRow label="Actor" value={detail.actor_email ?? '—'} />
            <DetailRow label="Actor ID" value={detail.actor_id ?? '—'} mono />
            <DetailRow label="Recurso tipo" value={detail.recurso_tipo} />
            <DetailRow label="Recurso ID" value={detail.recurso_id ?? '—'} mono />
            <DetailRow label="Recurso label" value={detail.recurso_label ?? '—'} />

            <div className="mt-5">
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">Metadata</p>
              <pre className="bg-gray-50 rounded-xl p-3 text-xs overflow-x-auto whitespace-pre-wrap break-all">
                {JSON.stringify(detail.metadata ?? {}, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="mb-3">
      <p className="text-xs uppercase tracking-wider text-gray-400 mb-0.5">{label}</p>
      <p className={`text-sm text-gray-900 ${mono ? 'font-mono text-xs' : ''}`}>{value}</p>
    </div>
  )
}
