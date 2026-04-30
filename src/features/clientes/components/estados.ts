import type {
  EstadoCliente,
  ServicioContratado,
  TarifaTipo,
} from '@/lib/supabase/database.types'

export const ESTADOS_CLIENTE: { value: EstadoCliente; label: string; color: string; bg: string; dot: string }[] = [
  { value: 'activo', label: 'Activo', color: 'text-henko-turquoise', bg: 'bg-henko-turquoise/10', dot: 'bg-henko-turquoise' },
  { value: 'pausado', label: 'Pausado', color: 'text-henko-orange', bg: 'bg-henko-orange/10', dot: 'bg-henko-orange' },
  { value: 'finalizado', label: 'Finalizado', color: 'text-gray-500', bg: 'bg-gray-100', dot: 'bg-gray-400' },
]

export function getEstadoClienteMeta(estado: EstadoCliente) {
  return ESTADOS_CLIENTE.find((e) => e.value === estado) ?? ESTADOS_CLIENTE[0]
}

export const SERVICIOS: { value: ServicioContratado; label: string }[] = [
  { value: 'operaciones', label: 'Operaciones' },
  { value: 'reclutamiento', label: 'Reclutamiento' },
  { value: 'liderazgo', label: 'Liderazgo' },
  { value: 'integral', label: 'Integral (3 servicios)' },
]

export function getServicioLabel(s: ServicioContratado | null | undefined): string {
  if (!s) return '—'
  return SERVICIOS.find((x) => x.value === s)?.label ?? s
}

export const TARIFAS: { value: TarifaTipo; label: string }[] = [
  { value: 'mensual', label: 'Mensual' },
  { value: 'proyecto', label: 'Por proyecto' },
  { value: 'sesion', label: 'Por sesión' },
]

export function getTarifaLabel(t: TarifaTipo | null | undefined): string {
  if (!t) return ''
  return TARIFAS.find((x) => x.value === t)?.label ?? t
}

export function formatImporte(importe: number | null | undefined, tarifa: TarifaTipo | null | undefined): string {
  if (importe == null) return '—'
  const num = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(importe)
  if (!tarifa) return num
  const sufijo = tarifa === 'mensual' ? '/mes' : tarifa === 'sesion' ? '/sesión' : ' (proyecto)'
  return `${num}${sufijo}`
}
