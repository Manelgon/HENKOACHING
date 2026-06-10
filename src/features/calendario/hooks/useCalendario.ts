'use client'

import { useState, useCallback } from 'react'
import type { CalendarEvent, CreateEventInput, UpdateEventInput, ModalState, EventoVinculo } from '../types'
import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from '@/actions/google-calendar'
import { agendarCita } from '@/actions/citas'

export function useCalendario(initialEvents: CalendarEvent[]) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)
  const [modal, setModal] = useState<ModalState>({ mode: 'closed' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openCreate = useCallback((start: string, end: string, isAllDay: boolean, defaultTab?: 'evento' | 'tarea') => {
    setModal({ mode: 'create', start, end, isAllDay, defaultTab })
  }, [])

  const openEdit = useCallback((event: CalendarEvent) => {
    setModal({ mode: 'edit', event })
  }, [])

  const closeModal = useCallback(() => setModal({ mode: 'closed' }), [])

  const handleCreate = useCallback(async (data: CreateEventInput & { attendees?: string[]; addMeet?: boolean; vinculo?: EventoVinculo }) => {
    setLoading(true)
    setError(null)
    const tempId = `temp-${Math.random()}`
    const optimistic: CalendarEvent = {
      id: tempId,
      title: data.title,
      start: data.start,
      end: data.end,
      isAllDay: data.isAllDay ?? false,
      description: data.description,
      location: data.location,
      calendarId: data.calendarId ?? 'primary',
    }
    setEvents(prev => [...prev, optimistic])
    closeModal()
    try {
      if (data.vinculo) {
        // Con contacto vinculado: agendarCita crea el evento, invita con el
        // email de la BD y registra la cita en el historial del recurso.
        const v = data.vinculo
        const result = await agendarCita({
          recursoTipo: v.contacto.tipo,
          recursoId: v.contacto.id,
          tipo: v.tipo,
          titulo: data.title,
          contactoNombre: v.contacto.nombre,
          contactoEmail: v.contacto.email ?? undefined,
          contexto: v.contacto.contexto,
          start: data.start,
          end: data.end,
          calendarId: data.calendarId,
          invitar: v.invitar,
          crearTarea: false,
        })
        if ('evento' in result && result.ok) {
          setEvents(prev => prev.map(e => e.id === tempId ? result.evento : e))
        } else {
          setEvents(prev => prev.filter(e => e.id !== tempId))
          setError('error' in result && result.error ? result.error : 'No se pudo crear el evento.')
        }
      } else {
        // Sin vínculo: flujo libre de siempre, sin registro en historial
        const created = await createCalendarEvent(data)
        setEvents(prev => prev.map(e => e.id === tempId ? created : e))
      }
    } catch {
      setEvents(prev => prev.filter(e => e.id !== tempId))
      setError('No se pudo crear el evento.')
    } finally {
      setLoading(false)
    }
  }, [closeModal])

  const handleUpdate = useCallback(async (id: string, data: UpdateEventInput) => {
    setLoading(true)
    setError(null)
    const prev = events.find(e => e.id === id)
    const calId = prev?.calendarId ?? 'primary'
    setEvents(cur => cur.map(e => e.id === id ? { ...e, ...data } : e))
    closeModal()
    try {
      const updated = await updateCalendarEvent(id, calId, data)
      setEvents(cur => cur.map(e => e.id === id ? updated : e))
    } catch {
      if (prev) setEvents(cur => cur.map(e => e.id === id ? prev : e))
      setError('No se pudo actualizar el evento.')
    } finally {
      setLoading(false)
    }
  }, [events, closeModal])

  const handleDelete = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    const prev = events.find(e => e.id === id)
    const calId = prev?.calendarId ?? 'primary'
    setEvents(cur => cur.filter(e => e.id !== id))
    closeModal()
    try {
      await deleteCalendarEvent(id, calId)
    } catch {
      if (prev) setEvents(cur => [...cur, prev])
      setError('No se pudo eliminar el evento.')
    } finally {
      setLoading(false)
    }
  }, [events, closeModal])

  const handleDrop = useCallback(async (id: string, start: string, end: string, isAllDay: boolean) => {
    await handleUpdate(id, { start, end, isAllDay })
  }, [handleUpdate])

  const handleResize = useCallback(async (id: string, end: string) => {
    await handleUpdate(id, { end })
  }, [handleUpdate])

  const replaceEvents = useCallback((newEvents: CalendarEvent[]) => {
    setEvents(newEvents)
  }, [])

  return {
    events,
    modal,
    loading,
    error,
    openCreate,
    openEdit,
    closeModal,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleDrop,
    handleResize,
    replaceEvents,
  }
}
