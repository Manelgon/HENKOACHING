'use client'

import type { SortDir } from '@/shared/hooks/useSortable'

type Props = {
  label: string
  sortKey: string
  activeSortKey: string
  sortDir: SortDir
  onSort: (key: string) => void
  className?: string
}

export default function SortHeader({ label, sortKey, activeSortKey, sortDir, onSort, className = '' }: Props) {
  const isActive = sortKey === activeSortKey
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={`inline-flex items-center gap-1 font-raleway text-[10px] font-bold uppercase tracking-widest transition-colors group ${isActive ? 'text-henko-turquoise' : 'text-gray-400 hover:text-henko-turquoise'} ${className}`}
    >
      {label}
      <span className={`flex flex-col leading-none transition-colors ${isActive ? 'text-henko-turquoise' : 'text-gray-300 group-hover:text-gray-400'}`}>
        <svg className={`w-2 h-2 -mb-px ${isActive && sortDir === 'asc' ? 'text-henko-turquoise' : ''}`} viewBox="0 0 8 5" fill="currentColor">
          <path d="M4 0L7.46 4.5H0.54L4 0Z" />
        </svg>
        <svg className={`w-2 h-2 ${isActive && sortDir === 'desc' ? 'text-henko-turquoise' : ''}`} viewBox="0 0 8 5" fill="currentColor">
          <path d="M4 5L0.54 0.5H7.46L4 5Z" />
        </svg>
      </span>
    </button>
  )
}
