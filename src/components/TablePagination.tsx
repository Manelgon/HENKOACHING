'use client'

import { useEffect, useMemo, useState } from 'react'

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number]

export function usePagination<T>(items: T[], initialPageSize: PageSize = 20) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<PageSize>(initialPageSize)

  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [page, totalPages])

  const paginated = useMemo(() => {
    const from = (page - 1) * pageSize
    return items.slice(from, from + pageSize)
  }, [items, page, pageSize])

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(total, page * pageSize)

  return {
    paginated,
    page,
    setPage,
    pageSize,
    setPageSize: (size: PageSize) => {
      setPageSize(size)
      setPage(1)
    },
    total,
    totalPages,
    from,
    to,
  }
}

type Props = {
  page: number
  pageSize: PageSize
  total: number
  totalPages: number
  from: number
  to: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: PageSize) => void
  className?: string
}

export function TablePagination({
  page,
  pageSize,
  total,
  totalPages,
  from,
  to,
  onPageChange,
  onPageSizeChange,
  className = '',
}: Props) {
  if (total === 0) return null

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-black/5 bg-gray-50/50 text-xs font-raleway text-gray-500 ${className}`}>
      <div className="flex items-center gap-2">
        <span>Mostrar</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value) as PageSize)}
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
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="w-7 h-7 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
            aria-label="Página anterior"
          >
            ←
          </button>
          <span className="px-2 text-gray-700 font-medium">{page} / {totalPages}</span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="w-7 h-7 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
            aria-label="Página siguiente"
          >
            →
          </button>
        </div>
      </div>
    </div>
  )
}
