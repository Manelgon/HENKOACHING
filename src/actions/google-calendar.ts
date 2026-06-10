'use server'

import { google } from 'googleapis'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/require-admin'
import { logAction } from '@/lib/audit/log-action'

export type CalendarMeta = {
  id: string
  title: string
  color: string
  primary: boolean
}

export type CalendarEvent = {
  id: string
  title: string
  start: string
  end: string
  isAllDay: boolean
  location?: string
  description?: string
  calendarId: string
  color?: string
}

const CreateEventSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200),
  start: z.string(),
  end: z.string(),
  description: z.string().max(2000).optional(),
  location: z.string().max(300).optional(),
  isAllDay: z.boolean().optional(),
  attendees: z.array(z.string().email()).optional(),
  addMeet: z.boolean().optional(),
  calendarId: z.string().optional(),
})

const UpdateEventSchema = CreateEventSchema.partial()

export type CreateEventInput = z.infer<typeof CreateEventSchema>
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>

function createAuth() {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  )
  auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })
  return auth
}

export async function getCalendars(): Promise<CalendarMeta[]> {
  try {
    const calendar = google.calendar({ version: 'v3', auth: createAuth() })
    const res = await calendar.calendarList.list({ minAccessRole: 'reader' })
    return (res.data.items ?? []).map(c => ({
      id: c.id ?? '',
      title: c.summary ?? 'Sin nombre',
      color: c.backgroundColor ?? '#1f8f9b',
      primary: c.primary ?? false,
    }))
  } catch {
    return [{ id: 'primary', title: 'Jennifer Cervera', color: '#1f8f9b', primary: true }]
  }
}

function mapEvent(ev: Record<string, unknown>, calendarId: string, color: string): CalendarEvent {
  const start = ev.start as { dateTime?: string; date?: string } | undefined
  const end = ev.end as { dateTime?: string; date?: string } | undefined
  return {
    id: (ev.id as string) ?? '',
    title: (ev.summary as string) ?? 'Sin título',
    start: start?.dateTime ?? start?.date ?? '',
    end: end?.dateTime ?? end?.date ?? '',
    isAllDay: !start?.dateTime,
    location: (ev.location as string) ?? undefined,
    description: (ev.description as string) ?? undefined,
    calendarId,
    color,
  }
}

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  try {
    const calendars = await getCalendars()
    const cal = google.calendar({ version: 'v3', auth: createAuth() })
    const results = await Promise.allSettled(
      calendars.map(c =>
        cal.events.list({
          calendarId: c.id,
          timeMin: new Date().toISOString(),
          maxResults: 10,
          singleEvents: true,
          orderBy: 'startTime',
        }).then(res => (res.data.items ?? []).map(ev => mapEvent(ev as Record<string, unknown>, c.id, c.color)))
      )
    )
    const all = results.flatMap(r => r.status === 'fulfilled' ? r.value : [])
    return all.sort((a, b) => a.start.localeCompare(b.start)).slice(0, 10)
  } catch {
    return []
  }
}

export async function getCalendarEventsRange(from: Date, to: Date): Promise<CalendarEvent[]> {
  const calendars = await getCalendars()
  const cal = google.calendar({ version: 'v3', auth: createAuth() })
  const results = await Promise.allSettled(
    calendars.map(c =>
      cal.events.list({
        calendarId: c.id,
        timeMin: from.toISOString(),
        timeMax: to.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 250,
      }).then(res => (res.data.items ?? []).map(ev => mapEvent(ev as Record<string, unknown>, c.id, c.color)))
    )
  )
  return results.flatMap(r => r.status === 'fulfilled' ? r.value : [])
}

// opts.skipLog: las acciones de citas.ts ya escriben su propio log
// ({recurso}.agendar_cita) y evitan así una entrada duplicada.
export async function createCalendarEvent(data: CreateEventInput, opts?: { skipLog?: boolean }): Promise<CalendarEvent> {
  const auth = await requireAdmin()
  if (!auth.ok) throw new Error(auth.error)

  const parsed = CreateEventSchema.parse(data)
  const calendar = google.calendar({ version: 'v3', auth: createAuth() })
  const calId = parsed.calendarId ?? 'primary'

  const resource: Record<string, unknown> = parsed.isAllDay
    ? {
        summary: parsed.title,
        description: parsed.description,
        location: parsed.location,
        start: { date: parsed.start.split('T')[0] },
        end: { date: parsed.end.split('T')[0] },
      }
    : {
        summary: parsed.title,
        description: parsed.description,
        location: parsed.location,
        start: { dateTime: parsed.start, timeZone: 'Europe/Madrid' },
        end: { dateTime: parsed.end, timeZone: 'Europe/Madrid' },
      }

  if (parsed.attendees?.length) {
    resource.attendees = parsed.attendees.map(email => ({ email }))
  }
  if (parsed.addMeet) {
    resource.conferenceData = {
      createRequest: {
        requestId: `meet-${parsed.start}-${parsed.title}`.replace(/[^a-z0-9]/gi, '').slice(0, 32),
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    }
  }

  const res = await calendar.events.insert({
    calendarId: calId,
    requestBody: resource,
    conferenceDataVersion: parsed.addMeet ? 1 : 0,
  })
  const evento = mapEvent(res.data as Record<string, unknown>, calId, '#1f8f9b')

  if (!opts?.skipLog) {
    await logAction({
      accion: 'calendario.crear_evento',
      recursoTipo: 'calendario',
      recursoId: evento.id,
      recursoLabel: evento.title,
      metadata: { start: evento.start, calendarId: calId, invitados: parsed.attendees ?? [] },
    })
  }

  return evento
}

export async function updateCalendarEvent(id: string, calendarId: string, data: UpdateEventInput): Promise<CalendarEvent> {
  const auth = await requireAdmin()
  if (!auth.ok) throw new Error(auth.error)

  const parsed = UpdateEventSchema.parse(data)
  const calendar = google.calendar({ version: 'v3', auth: createAuth() })

  const resource: Record<string, unknown> = {}
  if (parsed.title !== undefined) resource.summary = parsed.title
  if (parsed.description !== undefined) resource.description = parsed.description
  if (parsed.location !== undefined) resource.location = parsed.location
  if (parsed.start !== undefined || parsed.end !== undefined) {
    if (parsed.isAllDay) {
      if (parsed.start) resource.start = { date: parsed.start.split('T')[0] }
      if (parsed.end) resource.end = { date: parsed.end.split('T')[0] }
    } else {
      if (parsed.start) resource.start = { dateTime: parsed.start, timeZone: 'Europe/Madrid' }
      if (parsed.end) resource.end = { dateTime: parsed.end, timeZone: 'Europe/Madrid' }
    }
  }

  const res = await calendar.events.patch({ calendarId, eventId: id, requestBody: resource })
  const evento = mapEvent(res.data as Record<string, unknown>, calendarId, '#1f8f9b')

  await logAction({
    accion: 'calendario.editar_evento',
    recursoTipo: 'calendario',
    recursoId: evento.id,
    recursoLabel: evento.title,
    metadata: { start: evento.start, calendarId, cambios: Object.keys(resource) },
  })

  return evento
}

// `titulo` es solo para el log: Google borra el evento por id y no devuelve datos
export async function deleteCalendarEvent(id: string, calendarId: string, titulo?: string): Promise<void> {
  const auth = await requireAdmin()
  if (!auth.ok) throw new Error(auth.error)

  const calendar = google.calendar({ version: 'v3', auth: createAuth() })
  await calendar.events.delete({ calendarId, eventId: id })

  await logAction({
    accion: 'calendario.eliminar_evento',
    recursoTipo: 'calendario',
    recursoId: id,
    recursoLabel: titulo ?? null,
    metadata: { calendarId },
  })
}

export type AppointmentSchedule = {
  id: string
  title: string
  description?: string
  bookingUrl: string
  duration?: string
}

export async function getAppointmentSchedules(): Promise<AppointmentSchedule[]> {
  try {
    const auth = createAuth()
    const { token } = await auth.getAccessToken()
    if (!token) return []

    const res = await fetch(
      'https://www.googleapis.com/calendar/v3/users/me/appointmentSchedules?maxResults=50',
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!res.ok) return []

    const data = await res.json() as { appointmentSchedules?: Record<string, unknown>[] }
    return (data.appointmentSchedules ?? []).map(s => ({
      id: String(s.id ?? ''),
      title: String(s.title ?? 'Agenda sin título'),
      description: s.description ? String(s.description) : undefined,
      bookingUrl: `https://calendar.google.com/calendar/u/0/appointments/schedules/${s.id}`,
      duration: s.appointmentDuration
        ? String((s.appointmentDuration as Record<string, unknown>).minutes ?? '') + ' min'
        : undefined,
    }))
  } catch {
    return []
  }
}
