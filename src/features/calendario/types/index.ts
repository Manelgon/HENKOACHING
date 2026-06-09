import type { CalendarEvent, CreateEventInput, UpdateEventInput } from '@/actions/google-calendar'

export type { CalendarEvent, CreateEventInput, UpdateEventInput }

export type ModalState =
  | { mode: 'closed' }
  | { mode: 'create'; start: string; end: string; isAllDay: boolean; defaultTab?: 'evento' | 'tarea' }
  | { mode: 'edit'; event: CalendarEvent }
