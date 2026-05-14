export type EstadoFactura = 'pendiente' | 'pagada' | 'vencida' | 'devuelta' | 'anulada'

export const ESTADOS_FACTURA: Array<{
  value: EstadoFactura
  label: string
  dot: string
  bg: string
  color: string
}> = [
  { value: 'pendiente', label: 'Pendiente', dot: 'bg-henko-turquoise', bg: 'bg-henko-greenblue/30', color: 'text-henko-turquoise' },
  { value: 'pagada', label: 'Pagada', dot: 'bg-emerald-500', bg: 'bg-emerald-50', color: 'text-emerald-700' },
  { value: 'vencida', label: 'Vencida', dot: 'bg-henko-orange', bg: 'bg-orange-50', color: 'text-henko-orange' },
  { value: 'devuelta', label: 'Devuelta', dot: 'bg-henko-coral', bg: 'bg-red-50', color: 'text-henko-coral' },
  { value: 'anulada', label: 'Anulada', dot: 'bg-gray-400', bg: 'bg-gray-100', color: 'text-gray-500' },
]

export function getEstadoMeta(estado: EstadoFactura) {
  return ESTADOS_FACTURA.find((e) => e.value === estado) ?? ESTADOS_FACTURA[0]
}

export function isVencida(fechaVencimiento: string | null, estado: EstadoFactura): boolean {
  if (estado !== 'pendiente') return false
  if (!fechaVencimiento) return false
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  return new Date(fechaVencimiento) < hoy
}

export const FORMAS_PAGO: Array<{ value: string; label: string }> = [
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'bizum', label: 'Bizum' },
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'domiciliacion', label: 'Domiciliación' },
]
