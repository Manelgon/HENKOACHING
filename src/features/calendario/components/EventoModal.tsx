'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { CalendarEvent, CreateEventInput, ModalState, EventoVinculo } from '../types'
import type { CalendarMeta } from '@/actions/google-calendar'
import { createTask, getTaskLists } from '@/actions/google-tasks'
import type { TaskList } from '@/actions/google-tasks'
import { crearTareaVinculada, type ContactoEncontrado } from '@/actions/citas'
import { TIPOS_CITA, TIPOS_TAREA } from '@/shared/lib/tipos-cita'
import ContactoSelector, { VinculoTipoSelect, VinculoInvitarToggle, TIPO_OTRO } from './ContactoSelector'
import { Row, ClockIcon, PeopleIcon, MeetIcon, LocationIcon, DescriptionIcon, LinkIcon, CalendarIcon } from './EventoModalUI'

const EventSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  start: z.string().min(1),
  end: z.string().min(1),
  description: z.string().optional(),
  location: z.string().optional(),
  isAllDay: z.boolean().optional(),
})

const TaskFormSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  due: z.string().optional(),
  notes: z.string().optional(),
})

type EventFormValues = z.infer<typeof EventSchema>
type TaskFormValues = z.infer<typeof TaskFormSchema>
type Tab = 'evento' | 'tarea'

type Props = {
  modal: ModalState
  onClose: () => void
  onCreate: (data: CreateEventInput & { attendees?: string[]; addMeet?: boolean; vinculo?: EventoVinculo }) => void
  onUpdate: (id: string, data: Partial<CreateEventInput>) => void
  onDelete: (id: string) => void
  calendars?: CalendarMeta[]
}

export default function EventoModal({ modal, onClose, onCreate, onUpdate, onDelete, calendars = [] }: Props) {
  const isEdit = modal.mode === 'edit'
  const event = isEdit ? modal.event : null

  const [tab, setTab] = useState<Tab>('evento')
  const [showDatePickers, setShowDatePickers] = useState(false)
  const [guestInput, setGuestInput] = useState('')
  const [guests, setGuests] = useState<string[]>([])
  const [showGuestInput, setShowGuestInput] = useState(false)
  const [addMeet, setAddMeet] = useState(false)
  const [showLocation, setShowLocation] = useState(false)
  const [showDescription, setShowDescription] = useState(false)
  const [taskLists, setTaskLists] = useState<TaskList[]>([])
  const [taskListId, setTaskListId] = useState('')
  const [selectedCalendarId, setSelectedCalendarId] = useState('primary')
  const [savingTask, setSavingTask] = useState(false)
  const [taskError, setTaskError] = useState<string | null>(null)

  // Vínculo opcional con un contacto del CRM (compartido entre Evento y Tarea)
  const [contacto, setContacto] = useState<ContactoEncontrado | null>(null)
  const [tipoCita, setTipoCita] = useState<string>(TIPO_OTRO)
  const [tipoTarea, setTipoTarea] = useState<string>(TIPO_OTRO)
  const [invitarContacto, setInvitarContacto] = useState(true)

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<EventFormValues>({
    resolver: zodResolver(EventSchema),
  })
  const { register: registerTask, handleSubmit: handleTaskSubmit, reset: resetTask, setValue: setTaskValue } = useForm<TaskFormValues>({
    resolver: zodResolver(TaskFormSchema),
  })

  function selectContacto(c: ContactoEncontrado) {
    setContacto(c)
    setInvitarContacto(!!c.email)
    const tCita = TIPOS_CITA[c.tipo][0] ?? TIPO_OTRO
    const tTarea = TIPOS_TAREA[c.tipo][0] ?? TIPO_OTRO
    setTipoCita(tCita)
    setTipoTarea(tTarea)
    if (tCita !== TIPO_OTRO) setValue('title', `${tCita} con ${c.nombre}`)
    if (tTarea !== TIPO_OTRO) setTaskValue('title', `${tTarea} — ${c.nombre}`)
  }

  function clearContacto() {
    setContacto(null)
    setTipoCita(TIPO_OTRO)
    setTipoTarea(TIPO_OTRO)
  }

  function handleTipoCita(t: string) {
    setTipoCita(t)
    if (contacto && t !== TIPO_OTRO) setValue('title', `${t} con ${contacto.nombre}`)
  }

  function handleTipoTarea(t: string) {
    setTipoTarea(t)
    if (contacto && t !== TIPO_OTRO) setTaskValue('title', `${t} — ${contacto.nombre}`)
  }

  const startVal = watch('start')
  const endVal = watch('end')
  const isAllDay = watch('isAllDay')

  useEffect(() => {
    if (modal.mode === 'create') {
      reset({ start: modal.start, end: modal.end, isAllDay: modal.isAllDay, title: '', description: '', location: '' })
      resetTask({ title: '', due: modal.start?.split('T')[0] ?? '', notes: '' })
      setGuests([])
      setAddMeet(false)
      setShowDatePickers(false)
      setShowLocation(false)
      setShowDescription(false)
      setShowGuestInput(false)
      setTab(modal.defaultTab ?? 'evento')
      setContacto(null)
      setTipoCita(TIPO_OTRO)
      setTipoTarea(TIPO_OTRO)
      setInvitarContacto(true)
      setTaskError(null)
    } else if (modal.mode === 'edit') {
      reset({ title: event!.title, start: event!.start, end: event!.end, isAllDay: event!.isAllDay, description: event!.description ?? '', location: event!.location ?? '' })
      setShowLocation(!!event!.location)
      setShowDescription(!!event!.description)
      setShowDatePickers(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal])

  useEffect(() => {
    getTaskLists().then(lists => {
      setTaskLists(lists)
      if (lists.length > 0) setTaskListId(lists[0].id)
    }).catch(() => {})
  }, [])

  if (modal.mode === 'closed') return null

  const onSubmitEvent = (values: EventFormValues) => {
    if (isEdit && event) {
      onUpdate(event.id, { ...values, attendees: guests.length > 0 ? guests : undefined, addMeet, calendarId: selectedCalendarId })
      return
    }
    if (contacto) {
      // Con vínculo: agendarCita invita con el email de la BD y registra la
      // cita en el historial; los invitados manuales no aplican en este modo
      onCreate({
        ...values,
        calendarId: selectedCalendarId,
        vinculo: {
          contacto,
          tipo: tipoCita !== TIPO_OTRO ? tipoCita : undefined,
          invitar: invitarContacto && !!contacto.email,
        },
      })
      return
    }
    onCreate({ ...values, attendees: guests.length > 0 ? guests : undefined, addMeet, calendarId: selectedCalendarId })
  }

  const onSubmitTask = async (values: TaskFormValues) => {
    if (!taskListId) return
    setSavingTask(true)
    setTaskError(null)
    try {
      if (contacto) {
        const result = await crearTareaVinculada({
          recursoTipo: contacto.tipo,
          recursoId: contacto.id,
          tipo: tipoTarea !== TIPO_OTRO ? tipoTarea : undefined,
          titulo: values.title,
          contactoNombre: contacto.nombre,
          contactoEmail: contacto.email ?? undefined,
          fecha: values.due || new Date().toISOString().slice(0, 10),
          notas: values.notes || undefined,
          taskListId,
        })
        if ('error' in result && result.error) {
          setTaskError(result.error)
          setSavingTask(false)
          return
        }
      } else {
        await createTask(taskListId, { title: values.title, due: values.due, notes: values.notes })
      }
      onClose()
    } catch {
      setTaskError('No se pudo crear la tarea.')
      setSavingTask(false)
    }
  }

  const addGuest = () => {
    const email = guestInput.trim()
    if (email && !guests.includes(email)) {
      setGuests(prev => [...prev, email])
      setGuestInput('')
    }
  }

  const formatDateRange = () => {
    if (!startVal) return 'Selecciona fecha y hora'
    try {
      const start = new Date(startVal)
      const end = endVal ? new Date(endVal) : null
      const dateStr = start.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
      if (isAllDay) return dateStr
      const startTime = start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      const endTime = end ? end.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : ''
      return `${dateStr} · ${startTime}${endTime ? ` – ${endTime}` : ''}`
    } catch {
      return startVal
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[520px] mx-4 overflow-hidden">

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="w-8 h-8" />
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Title */}
        <div className="px-6 pb-3">
          {tab === 'evento' ? (
            <input
              {...register('title')}
              autoFocus={modal.mode === 'create'}
              placeholder="Añade un título"
              className="w-full text-[1.6rem] font-raleway text-gray-800 placeholder-gray-300 border-0 border-b-2 border-b-henko-turquoise focus:outline-none pb-1 bg-transparent"
            />
          ) : (
            <input
              {...registerTask('title')}
              autoFocus={modal.mode === 'create'}
              placeholder="Añade un título"
              className="w-full text-[1.6rem] font-raleway text-gray-800 placeholder-gray-300 border-0 border-b-2 border-b-henko-turquoise focus:outline-none pb-1 bg-transparent"
            />
          )}
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
        </div>

        {/* Tabs — solo en modo crear */}
        {!isEdit && (
          <div className="flex items-center gap-1 px-6 pb-3">
            {(['evento', 'tarea'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-full text-sm font-raleway font-medium transition-colors ${
                  tab === t ? 'bg-henko-turquoise/10 text-henko-turquoise font-semibold' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {t === 'evento' ? 'Evento' : 'Tarea'}
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="px-4 pb-2 space-y-0.5">
          {tab === 'evento' ? (
            <>
              {/* Fecha/hora */}
              <Row icon={<ClockIcon />} onClick={() => setShowDatePickers(d => !d)}>
                <div className="py-2">
                  <p className="font-raleway text-sm text-gray-700 capitalize">{formatDateRange()}</p>
                  {!isAllDay && startVal && (
                    <p className="text-xs text-gray-400 font-raleway mt-0.5">Zona horaria · No se repite</p>
                  )}
                </div>
              </Row>
              {showDatePickers && (
                <div className="ml-8 grid grid-cols-2 gap-3 pb-2 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1 font-raleway">Inicio</label>
                    <input {...register('start')} type="datetime-local" className="w-full border border-gray-200 rounded-xl px-3 py-2 font-raleway text-sm focus:outline-none focus:border-henko-turquoise" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1 font-raleway">Fin</label>
                    <input {...register('end')} type="datetime-local" className="w-full border border-gray-200 rounded-xl px-3 py-2 font-raleway text-sm focus:outline-none focus:border-henko-turquoise" />
                  </div>
                  <label className="col-span-2 flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register('isAllDay')} className="accent-henko-turquoise w-3.5 h-3.5" />
                    <span className="text-xs font-raleway text-gray-600">Todo el día</span>
                  </label>
                </div>
              )}

              {/* Vincular contacto del CRM (opcional) */}
              <Row icon={<LinkIcon />}>
                <ContactoSelector contacto={contacto} onSelect={selectContacto} onClear={clearContacto} />
              </Row>
              {contacto && (
                <div className="ml-10 pb-2 space-y-2">
                  <VinculoTipoSelect
                    tipos={TIPOS_CITA[contacto.tipo]}
                    value={tipoCita}
                    onChange={handleTipoCita}
                  />
                  <VinculoInvitarToggle
                    email={contacto.email}
                    checked={invitarContacto}
                    onToggle={() => setInvitarContacto(v => !v)}
                  />
                </div>
              )}

              {/* Invitados manuales — solo sin vínculo */}
              {!contacto && (
              <Row icon={<PeopleIcon />} onClick={() => !showGuestInput && setShowGuestInput(true)}>
                {showGuestInput ? (
                  <div className="py-1.5 w-full">
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        value={guestInput}
                        onChange={e => setGuestInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addGuest() } }}
                        placeholder="Email del invitado"
                        className="flex-1 text-sm font-raleway border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-henko-turquoise"
                      />
                      <button type="button" onClick={addGuest} className="text-xs font-raleway font-semibold text-henko-turquoise px-3 py-1.5 rounded-xl hover:bg-henko-turquoise/5 transition-colors">
                        Añadir
                      </button>
                    </div>
                    {guests.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {guests.map(g => (
                          <span key={g} className="flex items-center gap-1 text-xs font-raleway bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                            {g}
                            <button type="button" onClick={() => setGuests(p => p.filter(x => x !== g))} className="text-gray-400 hover:text-red-400">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="py-2 text-sm font-raleway text-gray-400">
                    {guests.length > 0 ? `${guests.length} invitado${guests.length > 1 ? 's' : ''}` : 'Añadir invitados'}
                  </span>
                )}
              </Row>
              )}

              {/* Google Meet — solo sin vínculo (con vínculo va en el toggle de invitar) */}
              {!contacto && (
              <Row icon={<MeetIcon />} onClick={() => setAddMeet(m => !m)}>
                <div className="flex items-center justify-between w-full py-2 pr-2">
                  <span className={`text-sm font-raleway ${addMeet ? 'text-henko-turquoise' : 'text-gray-400'}`}>
                    {addMeet ? 'Videoconferencia añadida' : 'Añadir videoconferencia de Google Meet'}
                  </span>
                  <div className={`w-8 h-4 rounded-full transition-colors flex-shrink-0 ${addMeet ? 'bg-henko-turquoise' : 'bg-gray-200'} relative`}>
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${addMeet ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                </div>
              </Row>
              )}

              {/* Ubicación */}
              <Row icon={<LocationIcon />} onClick={() => !showLocation && setShowLocation(true)}>
                {showLocation ? (
                  <input
                    {...register('location')}
                    placeholder="Añadir ubicación"
                    className="py-2 w-full text-sm font-raleway focus:outline-none text-gray-700 bg-transparent"
                  />
                ) : (
                  <span className="py-2 text-sm font-raleway text-gray-400">Añadir ubicación</span>
                )}
              </Row>

              {/* Descripción */}
              <Row icon={<DescriptionIcon />} onClick={() => !showDescription && setShowDescription(true)}>
                {showDescription ? (
                  <textarea
                    {...register('description')}
                    placeholder="Añadir descripción"
                    rows={3}
                    className="py-2 w-full text-sm font-raleway focus:outline-none text-gray-700 bg-transparent resize-none"
                  />
                ) : (
                  <span className="py-2 text-sm font-raleway text-gray-400">Añadir descripción o archivo adjunto</span>
                )}
              </Row>

              {/* Calendario */}
              <Row icon={<CalendarIcon />}>
                {calendars.length > 0 ? (
                  <div className="flex items-center gap-2 py-2">
                    <span
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: calendars.find(c => c.id === selectedCalendarId)?.color ?? '#1f8f9b' }}
                    />
                    <select
                      value={selectedCalendarId}
                      onChange={e => setSelectedCalendarId(e.target.value)}
                      className="text-sm font-raleway focus:outline-none text-gray-700 bg-transparent"
                    >
                      {calendars.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>
                ) : (
                  <span className="py-2 text-sm font-raleway text-gray-700">Jennifer Cervera</span>
                )}
              </Row>
            </>
          ) : (
            <>
              {/* Vincular contacto del CRM (opcional) */}
              <Row icon={<LinkIcon />}>
                <ContactoSelector contacto={contacto} onSelect={selectContacto} onClear={clearContacto} />
              </Row>
              {contacto && (
                <div className="ml-10 pb-2">
                  <VinculoTipoSelect
                    tipos={TIPOS_TAREA[contacto.tipo]}
                    value={tipoTarea}
                    onChange={handleTipoTarea}
                  />
                </div>
              )}

              {/* Tarea: fecha */}
              <Row icon={<ClockIcon />}>
                <input
                  {...registerTask('due')}
                  type="date"
                  className="py-2 text-sm font-raleway focus:outline-none text-gray-700 bg-transparent"
                />
              </Row>
              {/* Tarea: notas */}
              <Row icon={<DescriptionIcon />}>
                <textarea
                  {...registerTask('notes')}
                  placeholder="Añadir notas"
                  rows={2}
                  className="py-2 w-full text-sm font-raleway focus:outline-none text-gray-400 bg-transparent resize-none placeholder-gray-300"
                />
              </Row>
              {/* Lista */}
              {taskLists.length > 1 && (
                <Row icon={<CalendarIcon />}>
                  <select
                    value={taskListId}
                    onChange={e => setTaskListId(e.target.value)}
                    className="py-2 text-sm font-raleway focus:outline-none text-gray-700 bg-transparent"
                  >
                    {taskLists.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                  </select>
                </Row>
              )}
              {taskError && <p className="text-xs text-red-500 px-2 pt-1 font-raleway">{taskError}</p>}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 flex items-center justify-between px-6 py-4 mt-2">
          {isEdit && event ? (
            <button
              type="button"
              onClick={() => onDelete(event.id)}
              className="text-sm font-raleway text-red-400 hover:text-red-600 transition-colors"
            >
              Eliminar evento
            </button>
          ) : (
            <span className="text-sm font-raleway text-henko-turquoise cursor-pointer hover:underline select-none">
              Más opciones
            </span>
          )}
          <button
            type="button"
            onClick={tab === 'evento' ? handleSubmit(onSubmitEvent) : handleTaskSubmit(onSubmitTask)}
            disabled={tab === 'tarea' && savingTask}
            className="bg-henko-turquoise text-white font-raleway font-semibold text-sm py-2 px-6 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {savingTask ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
