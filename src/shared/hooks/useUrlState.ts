'use client'

import { useCallback, useState } from 'react'
import { useSearchParams } from 'next/navigation'

/**
 * Estado sincronizado con un query param de la URL: al refrescar la pagina
 * se restaura el valor (pestaña activa, filtro, busqueda...).
 * Usa history.replaceState, asi que no provoca navegacion ni refetch.
 */
export function useUrlState<T extends string>(
  key: string,
  defaultValue: T,
  validValues?: readonly string[],
): [T, (v: T) => void] {
  const searchParams = useSearchParams()
  const raw = searchParams.get(key)
  const initial = raw !== null && (!validValues || validValues.includes(raw)) ? (raw as T) : defaultValue
  const [value, setValue] = useState<T>(initial)

  const set = useCallback((v: T) => {
    setValue(v)
    const params = new URLSearchParams(window.location.search)
    if (v === defaultValue || v === '') params.delete(key)
    else params.set(key, v)
    const qs = params.toString()
    window.history.replaceState(null, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname)
  }, [key, defaultValue])

  return [value, set]
}

/**
 * Variante para ids opcionales (drawer/panel de detalle abierto):
 * null = cerrado (el param desaparece de la URL).
 */
export function useUrlIdState(key: string): [string | null, (v: string | null) => void] {
  const [value, setValue] = useUrlState<string>(key, '')
  const set = useCallback((v: string | null) => setValue(v ?? ''), [setValue])
  return [value || null, set]
}

/**
 * Variante booleana (seccion desplegada, panel abierto):
 * false = el param desaparece de la URL.
 */
export function useUrlFlagState(key: string): [boolean, (v: boolean | ((prev: boolean) => boolean)) => void] {
  const [value, setValue] = useUrlState<string>(key, '')
  const flag = value === '1'
  const set = useCallback((v: boolean | ((prev: boolean) => boolean)) => {
    const next = typeof v === 'function' ? v(new URLSearchParams(window.location.search).get(key) === '1') : v
    setValue(next ? '1' : '')
  }, [key, setValue])
  return [flag, set]
}
