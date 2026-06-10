// Tipos de cita y tarea por recurso del CRM. Módulo client-safe (sin imports
// server): lo consumen tablas, detalles, drawers y el modal del calendario.

export type RecursoTipo = 'lead' | 'cliente' | 'candidato' | 'solicitud'

const CITA_LEAD = ['Llamada', 'Videollamada', 'Reunión inicial', 'Sesión informativa', 'Seguimiento']
const CITA_CLIENTE = ['Sesión de coaching', 'Reunión de seguimiento', 'Llamada', 'Videollamada', 'Revisión de progreso']
const CITA_CANDIDATO = ['Entrevista', '2ª entrevista', 'Llamada', 'Videollamada', 'Contratación', 'Reunión']

const TAREA_LEAD = ['Llamar al lead', 'Enviar información', 'Enviar propuesta', 'Hacer seguimiento']
const TAREA_CLIENTE = ['Preparar sesión', 'Enviar materiales', 'Hacer seguimiento', 'Revisar progreso']
const TAREA_CANDIDATO = ['Preparar entrevista', 'Revisar CV', 'Llamar al candidato', 'Enviar propuesta', 'Seguimiento']

export const TIPOS_CITA: Record<RecursoTipo, string[]> = {
  lead: CITA_LEAD,
  cliente: CITA_CLIENTE,
  candidato: CITA_CANDIDATO,
  solicitud: CITA_CANDIDATO,
}

export const TIPOS_TAREA: Record<RecursoTipo, string[]> = {
  lead: TAREA_LEAD,
  cliente: TAREA_CLIENTE,
  candidato: TAREA_CANDIDATO,
  solicitud: TAREA_CANDIDATO,
}
