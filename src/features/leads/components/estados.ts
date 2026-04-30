import type { EstadoLead } from '@/lib/supabase/database.types'

export const ESTADOS_LEAD: { value: EstadoLead; label: string; color: string; bg: string; dot: string }[] = [
  { value: 'nuevo', label: 'Nuevo', color: 'text-henko-turquoise', bg: 'bg-henko-turquoise/10', dot: 'bg-henko-turquoise' },
  { value: 'pendiente', label: 'Pendiente', color: 'text-henko-orange', bg: 'bg-henko-orange/10', dot: 'bg-henko-orange' },
  { value: 'contactado', label: 'Contactado', color: 'text-henko-purple', bg: 'bg-henko-purple/10', dot: 'bg-henko-purple' },
  { value: 'en_conversacion', label: 'En conversación', color: 'text-henko-coral', bg: 'bg-henko-coral/10', dot: 'bg-henko-coral' },
  { value: 'descartado', label: 'Descartado', color: 'text-gray-500', bg: 'bg-gray-100', dot: 'bg-gray-400' },
]

export function getEstadoMeta(estado: EstadoLead) {
  return ESTADOS_LEAD.find((e) => e.value === estado) ?? ESTADOS_LEAD[0]
}

export const ORIGENES_LEAD = [
  { value: 'web', label: 'Formulario web' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'referido', label: 'Referido' },
  { value: 'llamada', label: 'Llamada' },
  { value: 'email', label: 'Email directo' },
  { value: 'evento', label: 'Evento / Networking' },
  { value: 'otro', label: 'Otro' },
]

export function getOrigenLabel(origen: string | null | undefined): string {
  if (!origen) return 'Sin origen'
  return ORIGENES_LEAD.find((o) => o.value === origen)?.label ?? origen
}
