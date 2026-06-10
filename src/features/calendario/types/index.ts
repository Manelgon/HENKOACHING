import type { CalendarEvent, CreateEventInput, UpdateEventInput } from '@/actions/google-calendar'
import type { ContactoEncontrado } from '@/actions/citas'

export type { CalendarEvent, CreateEventInput, UpdateEventInput }

// Vínculo opcional de un evento/tarea del calendario con un contacto del CRM.
// Si está presente, la creación se enruta por agendarCita/crearTareaVinculada
// (invitación con el email de la BD + registro en el historial `citas`).
export type EventoVinculo = {
  contacto: ContactoEncontrado
  tipo?: string
  invitar: boolean
}

export type ModalState =
  | { mode: 'closed' }
  | { mode: 'create'; start: string; end: string; isAllDay: boolean; defaultTab?: 'evento' | 'tarea' }
  | { mode: 'edit'; event: CalendarEvent }
