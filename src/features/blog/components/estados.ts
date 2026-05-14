import type { EstadoPost } from '../types'

export type EstadoMeta = {
  value: EstadoPost
  label: string
  bg: string
  color: string
  dot: string
}

export const ESTADOS_BLOG: EstadoMeta[] = [
  { value: 'borrador', label: 'Borrador', bg: 'bg-amber-50', color: 'text-amber-700', dot: 'bg-amber-400' },
  { value: 'publicado', label: 'Publicado', bg: 'bg-emerald-50', color: 'text-emerald-700', dot: 'bg-emerald-500' },
  { value: 'archivado', label: 'Archivado', bg: 'bg-gray-100', color: 'text-gray-500', dot: 'bg-gray-400' },
]

export function getEstadoMeta(estado: EstadoPost): EstadoMeta {
  return ESTADOS_BLOG.find((e) => e.value === estado) ?? ESTADOS_BLOG[0]
}
