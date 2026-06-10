'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/require-admin'
import { logAction } from '@/lib/audit/log-action'
import { createCalendarEvent } from '@/actions/google-calendar'
import { getTaskLists, createTask } from '@/actions/google-tasks'

// ─── Fechas ──────────────────────────────────────────────────────────────────
// La UI trabaja con fechas naive Europe/Madrid ("YYYY-MM-DDTHH:mm:ss"), igual
// que createCalendarEvent (que las envía con timeZone: 'Europe/Madrid').
// Para persistir en citas (timestamptz) hay que convertirlas a UTC con el
// offset de Madrid vigente en esa fecha (CET/CEST).
function tzOffsetMs(timeZone: string, at: Date): number {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
  const p = Object.fromEntries(fmt.formatToParts(at).map(x => [x.type, x.value]))
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second)
  return asUtc - at.getTime()
}

function madridToUtcIso(naive: string): string {
  const [datePart, timePart = '00:00:00'] = naive.split('T')
  const [y, m, d] = datePart.split('-').map(Number)
  const [hh = 0, mm = 0, ss = 0] = timePart.split(':').map(Number)
  const guess = Date.UTC(y, m - 1, d, hh, mm, ss)
  return new Date(guess - tzOffsetMs('Europe/Madrid', new Date(guess))).toISOString()
}

// ─── Agendar cita (genérico) ─────────────────────────────────────────────────
// Crea un evento en Google Calendar (entrevista, llamada, sesión, reunión…) y,
// opcionalmente, una tarea de seguimiento en Google Tasks. Sirve para cualquier
// recurso (solicitud, lead, cliente). NO cambia el estado del recurso: agendar
// es independiente del estado. Cada cita se registra además en la tabla `citas`
// (historial por recurso, mostrado en las fichas).
const AgendarCitaSchema = z.object({
  recursoTipo: z.enum(['solicitud', 'lead', 'cliente', 'candidato']),
  recursoId: z.string().uuid(),
  tipo: z.string().max(100).optional(), // 'Sesión de coaching', 'Entrevista', … (undefined si "Otro")
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
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error }

  const parsed = AgendarCitaSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  const d = parsed.data

  const puedeInvitar = d.invitar && !!d.contactoEmail

  let evento
  try {
    evento = await createCalendarEvent({
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
  const eventoId = evento.id || null

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

  // Historial: registro en `citas` (no abortamos si falla: el evento ya existe)
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('citas').insert({
      recurso_tipo: d.recursoTipo,
      recurso_id: d.recursoId,
      clase: 'cita',
      tipo: d.tipo ?? null,
      titulo: d.titulo,
      contacto_nombre: d.contactoNombre,
      contacto_email: d.contactoEmail ?? null,
      start_at: madridToUtcIso(d.start),
      end_at: madridToUtcIso(d.end),
      invitado: puedeInvitar,
      google_event_id: eventoId,
      calendar_id: d.calendarId ?? 'primary',
      created_by: auth.user.id,
    })
    if (error) console.error('[agendarCita] historial:', error.message)
  } catch (e) {
    console.error('[agendarCita] historial:', e instanceof Error ? e.message : String(e))
  }

  await logAction({
    accion: `${d.recursoTipo}.agendar_cita`,
    recursoTipo: d.recursoTipo,
    recursoId: d.recursoId,
    recursoLabel: d.contactoNombre,
    metadata: { titulo: d.titulo, start: d.start, invitado: puedeInvitar, tarea: tareaCreada },
  })

  // `evento` permite al calendario refrescar su vista optimista sin refetch
  return { ok: true, tareaCreada, evento }
}

// ─── Tarea vinculada (desde el calendario) ───────────────────────────────────
// Crea una tarea en Google Tasks asociada a un recurso del CRM y la registra
// en `citas` con clase 'tarea'. Google Tasks no admite invitados: la
// vinculación es interna (historial de la ficha).
const CrearTareaVinculadaSchema = z.object({
  recursoTipo: z.enum(['solicitud', 'lead', 'cliente', 'candidato']),
  recursoId: z.string().uuid(),
  tipo: z.string().max(100).optional(),
  titulo: z.string().min(1, 'El título es requerido').max(200),
  contactoNombre: z.string().min(1),
  contactoEmail: z.string().email().optional(),
  fecha: z.string().min(1), // "YYYY-MM-DD"
  notas: z.string().max(2000).optional(),
  taskListId: z.string().optional(),
})

export type CrearTareaVinculadaInput = z.infer<typeof CrearTareaVinculadaSchema>

export async function crearTareaVinculada(input: CrearTareaVinculadaInput) {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error }

  const parsed = CrearTareaVinculadaSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  const d = parsed.data

  let taskId: string | null = null
  let listIdUsada: string | null = null
  try {
    const lists = await getTaskLists()
    const listId = (d.taskListId && lists.some(l => l.id === d.taskListId)) ? d.taskListId : lists[0]?.id
    if (!listId) return { error: 'No se encontró ninguna lista de Google Tasks' }
    const task = await createTask(listId, {
      title: d.titulo,
      notes: d.notas || undefined,
      due: d.fecha,
    })
    taskId = task.id || null
    listIdUsada = listId
  } catch (e) {
    return { error: `No se pudo crear la tarea: ${e instanceof Error ? e.message : 'error desconocido'}` }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.from('citas').insert({
      recurso_tipo: d.recursoTipo,
      recurso_id: d.recursoId,
      clase: 'tarea',
      tipo: d.tipo ?? null,
      titulo: d.titulo,
      contacto_nombre: d.contactoNombre,
      contacto_email: d.contactoEmail ?? null,
      start_at: madridToUtcIso(d.fecha),
      end_at: null,
      invitado: false,
      google_task_id: taskId,
      task_list_id: listIdUsada,
      created_by: auth.user.id,
    })
    if (error) console.error('[crearTareaVinculada] historial:', error.message)
  } catch (e) {
    console.error('[crearTareaVinculada] historial:', e instanceof Error ? e.message : String(e))
  }

  await logAction({
    accion: `${d.recursoTipo}.crear_tarea`,
    recursoTipo: d.recursoTipo,
    recursoId: d.recursoId,
    recursoLabel: d.contactoNombre,
    metadata: { titulo: d.titulo, fecha: d.fecha },
  })

  return { ok: true }
}

// ─── Historial de citas por recurso ──────────────────────────────────────────
export type CitaHistorial = {
  id: string
  clase: 'cita' | 'tarea'
  tipo: string | null
  titulo: string
  contacto_email: string | null
  start_at: string
  end_at: string | null
  invitado: boolean
  created_at: string | null
}

const GetCitasSchema = z.object({
  recursoTipo: z.enum(['solicitud', 'lead', 'cliente', 'candidato']),
  recursoId: z.string().uuid(),
})

export async function getCitasByRecurso(recursoTipo: string, recursoId: string): Promise<CitaHistorial[]> {
  const auth = await requireAdmin()
  if (!auth.ok) return []

  const parsed = GetCitasSchema.safeParse({ recursoTipo, recursoId })
  if (!parsed.success) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('citas')
    .select('id, clase, tipo, titulo, contacto_email, start_at, end_at, invitado, created_at')
    .eq('recurso_tipo', parsed.data.recursoTipo)
    .eq('recurso_id', parsed.data.recursoId)
    .order('start_at', { ascending: false })

  if (error) {
    console.error('[getCitasByRecurso]:', error.message)
    return []
  }
  return (data ?? []) as CitaHistorial[]
}

// ─── Buscar contactos (leads ∪ clientes ∪ candidatos) ────────────────────────
// Para el selector "Vincular contacto" del calendario. Devuelve el mismo shape
// que AgendarCitaRecurso. El email del candidato vive en `profiles`.
export type ContactoEncontrado = {
  tipo: 'lead' | 'cliente' | 'candidato'
  id: string
  nombre: string
  email: string | null
  contexto?: string
}

const BuscarContactosSchema = z.string().trim().min(2).max(100)

export async function buscarContactos(query: string): Promise<ContactoEncontrado[]> {
  const auth = await requireAdmin()
  if (!auth.ok) return []

  const parsed = BuscarContactosSchema.safeParse(query)
  if (!parsed.success) return []
  // % y , rompen los filtros .or() de PostgREST: los quitamos del patrón
  const q = parsed.data.replace(/[%,()]/g, '')
  if (q.length < 2) return []

  const admin = createAdminClient()
  const patron = `%${q}%`

  const [leadsRes, clientesRes, candidatosRes] = await Promise.all([
    admin
      .from('leads')
      .select('id, nombre, email, asunto, servicio_interes')
      .eq('archivado', false)
      .or(`nombre.ilike.${patron},email.ilike.${patron}`)
      .order('created_at', { ascending: false })
      .limit(5),
    admin
      .from('clientes')
      .select('id, nombre, email, empresa')
      .is('deleted_at', null)
      .or(`nombre.ilike.${patron},email.ilike.${patron},empresa.ilike.${patron}`)
      .order('created_at', { ascending: false })
      .limit(5),
    admin
      .from('profiles')
      .select('id, nombre, apellidos, email, candidato_profiles(cargo_actual)')
      .eq('role', 'candidato')
      .is('deleted_at', null)
      .or(`nombre.ilike.${patron},apellidos.ilike.${patron},email.ilike.${patron}`)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const leads = (leadsRes.data ?? []).map((l): ContactoEncontrado => ({
    tipo: 'lead',
    id: l.id,
    nombre: l.nombre,
    email: l.email,
    contexto: l.asunto ?? l.servicio_interes ?? undefined,
  }))

  const clientes = (clientesRes.data ?? []).map((c): ContactoEncontrado => ({
    tipo: 'cliente',
    id: c.id,
    nombre: c.nombre,
    email: c.email,
    contexto: c.empresa ?? undefined,
  }))

  type CandRow = {
    id: string; nombre: string | null; apellidos: string | null; email: string
    candidato_profiles: { cargo_actual: string | null } | null
  }
  const candidatos = ((candidatosRes.data ?? []) as unknown as CandRow[]).map((p): ContactoEncontrado => ({
    tipo: 'candidato',
    id: p.id,
    nombre: [p.nombre, p.apellidos].filter(Boolean).join(' ') || p.email,
    email: p.email,
    contexto: p.candidato_profiles?.cargo_actual ?? undefined,
  }))

  return [...leads, ...clientes, ...candidatos]
}
