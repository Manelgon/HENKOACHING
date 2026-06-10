'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { logAction } from '@/lib/audit/log-action'
import { createCalendarEvent } from '@/actions/google-calendar'
import { getTaskLists, createTask } from '@/actions/google-tasks'

// ─── Agendar cita (genérico) ─────────────────────────────────────────────────
// Crea un evento en Google Calendar (entrevista, llamada, sesión, reunión…) y,
// opcionalmente, una tarea de seguimiento en Google Tasks. Sirve para cualquier
// recurso (solicitud, lead, cliente). NO cambia el estado del recurso: agendar
// es independiente del estado.
const AgendarCitaSchema = z.object({
  recursoTipo: z.enum(['solicitud', 'lead', 'cliente']),
  recursoId: z.string().uuid(),
  titulo: z.string().min(1, 'El asunto es requerido').max(200),
  contactoNombre: z.string().min(1),
  contactoEmail: z.string().email().optional(),
  contexto: z.string().max(300).optional(), // oferta, servicio, asunto…
  start: z.string().min(1), // local naive "YYYY-MM-DDTHH:mm:ss" (Europe/Madrid)
  end: z.string().min(1),
  calendarId: z.string().optional(), // calendario destino (por defecto 'primary')
  invitar: z.boolean(),
  crearTarea: z.boolean(),
  taskListId: z.string().optional(),
  tareaTitulo: z.string().max(200).optional(),
  tareaFecha: z.string().optional(), // "YYYY-MM-DD"; por defecto la fecha de la cita
})

export type AgendarCitaInput = z.infer<typeof AgendarCitaSchema>

export async function agendarCita(input: AgendarCitaInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'admin') return { error: 'Sin permisos' }

  const parsed = AgendarCitaSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  const d = parsed.data

  const puedeInvitar = d.invitar && !!d.contactoEmail

  try {
    await createCalendarEvent({
      title: d.titulo,
      start: d.start,
      end: d.end,
      calendarId: d.calendarId,
      description: d.contexto ? `${d.contactoNombre}\n${d.contexto}` : d.contactoNombre,
      attendees: puedeInvitar ? [d.contactoEmail!] : undefined,
      addMeet: puedeInvitar,
    })
  } catch (e) {
    return { error: `No se pudo crear el evento en el calendario: ${e instanceof Error ? e.message : 'error desconocido'}` }
  }

  // Tarea de seguimiento (no abortamos si falla: el evento ya está creado)
  let tareaCreada = false
  if (d.crearTarea) {
    try {
      const lists = await getTaskLists()
      const listId = (d.taskListId && lists.some(l => l.id === d.taskListId)) ? d.taskListId : lists[0]?.id
      if (listId) {
        await createTask(listId, {
          title: d.tareaTitulo?.trim() || `Preparar: ${d.titulo}`,
          notes: d.contexto || undefined,
          due: d.tareaFecha || d.start.split('T')[0],
        })
        tareaCreada = true
      }
    } catch (e) {
      console.error('[agendarCita] tarea:', e instanceof Error ? e.message : String(e))
    }
  }

  await logAction({
    accion: `${d.recursoTipo}.agendar_cita`,
    recursoTipo: d.recursoTipo,
    recursoId: d.recursoId,
    recursoLabel: d.contactoNombre,
    metadata: { titulo: d.titulo, start: d.start, invitado: puedeInvitar, tarea: tareaCreada },
  })

  return { ok: true, tareaCreada }
}
