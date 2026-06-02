'use client'

import { useState, useMemo } from 'react'

export type SortDir = 'asc' | 'desc'

export function useSortable<T>(items: T[], defaultKey: keyof T, defaultDir: SortDir = 'asc') {
  const [sortKey, setSortKey] = useState<keyof T>(defaultKey)
  const [sortDir, setSortDir] = useState<SortDir>(defaultDir)

  function toggleSort(key: keyof T) {
    if (key === sortKey) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      const va = a[sortKey]
      const vb = b[sortKey]
      if (va === null || va === undefined) return 1
      if (vb === null || vb === undefined) return -1
      let cmp = 0
      if (typeof va === 'string' && typeof vb === 'string') {
        cmp = va.localeCompare(vb, 'es', { sensitivity: 'base' })
      } else {
        cmp = va < vb ? -1 : va > vb ? 1 : 0
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [items, sortKey, sortDir])

  return { sorted, sortKey, sortDir, toggleSort }
}
