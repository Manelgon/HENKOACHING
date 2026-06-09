'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import multiMonthPlugin from '@fullcalendar/multimonth'
import type { DateSelectArg, EventClickArg, EventDropArg, DatesSetArg } from '@fullcalendar/core'
import type { EventResizeDoneArg } from '@fullcalendar/interaction'
import { useCalendario } from '../hooks/useCalendario'
import EventoModal from './EventoModal'
import TasksPanel from './TasksPanel'
import type { CalendarEvent } from '../types'
import type { CalendarMeta, AppointmentSchedule } from '@/actions/google-calendar'
import type { Task } from '@/actions/google-tasks'
import { getCalendarEventsRange, getCalendars, getAppointmentSchedules } from '@/actions/google-calendar'
import { useState, useRef, useCallback, useEffect } from 'react'

const VIEWS = [
  { value: 'timeGridDay',     label: 'Día',     key: 'D' },
  { value: 'timeGridWeek',    label: 'Semana',  key: 'S' },
  { value: 'dayGridMonth',    label: 'Mes',     key: 'M' },
  { value: 'multiMonthYear',  label: 'Año',     key: 'A' },
  { value: 'listWeek',        label: 'Agenda',  key: 'G' },
  { value: 'timeGridFourDay', label: '4 días',  key: '4' },
]

type Props = { initialEvents: CalendarEvent[]; initialCalendars?: CalendarMeta[] }

export default function CalendarioView({ initialEvents, initialCalendars = [] }: Props) {
  const cal = useCalendario(initialEvents)
  const [loadingRange, setLoadingRange] = useState(false)
  const [currentView, setCurrentView] = useState('dayGridMonth')
  const [viewOpen, setViewOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [showWeekends, setShowWeekends] = useState(true)
  const [taskEvents, setTaskEvents] = useState<object[]>([])
  const [calendars, setCalendars] = useState<CalendarMeta[]>(initialCalendars)
  const [hiddenCals, setHiddenCals] = useState<Set<string>>(new Set())
  const [createOpen, setCreateOpen] = useState(false)
  const [showAgendas, setShowAgendas] = useState(false)
  const [agendas, setAgendas] = useState<AppointmentSchedule[]>([])
  const [loadingAgendas, setLoadingAgendas] = useState(false)
  const calRef = useRef<FullCalendar>(null)

  useEffect(() => {
    if (initialCalendars.length === 0) {
      getCalendars().then(setCalendars).catch(() => {})
    }
  }, [initialCalendars.length])

  const openAgendas = async () => {
    setCreateOpen(false)
    setShowAgendas(true)
    if (agendas.length === 0) {
      setLoadingAgendas(true)
      try {
        const list = await getAppointmentSchedules()
        setAgendas(list)
      } finally {
        setLoadingAgendas(false)
      }
    }
  }

  const handleTasksChange = useCallback((tasks: Task[]) => {
    const events = tasks
      .filter(t => t.due && t.status === 'needsAction')
      .map(t => ({
        id: `task-${t.id}`,
        title: `📌 ${t.title}`,
        start: t.due!,
        allDay: true,
        backgroundColor: '#f59e0b',
        borderColor: '#d97706',
        editable: false,
        extendedProps: { isTask: true },
      }))
    setTaskEvents(events)
  }, [])

  const handleDatesSet = async (arg: DatesSetArg) => {
    setCurrentView(arg.view.type)
    setTitle(arg.view.title)
    setLoadingRange(true)
    try {
      const fresh = await getCalendarEventsRange(arg.start, arg.end)
      cal.replaceEvents(fresh)
    } catch {
      // silently ignore
    } finally {
      setLoadingRange(false)
    }
  }

  const changeView = (view: string) => {
    calRef.current?.getApi().changeView(view)
    setCurrentView(view)
    setViewOpen(false)
  }

  const toggleCalendar = (id: string) => {
    setHiddenCals(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSelect = (arg: DateSelectArg) => {
    cal.openCreate(arg.startStr, arg.endStr, arg.allDay)
  }

  const handleEventClick = (arg: EventClickArg) => {
    if (arg.event.extendedProps.isTask) return
    const ev = cal.events.find(e => e.id === arg.event.id)
    if (ev) cal.openEdit(ev)
  }

  const handleEventDrop = (arg: EventDropArg) => {
    cal.handleDrop(arg.event.id, arg.event.startStr, arg.event.endStr || arg.event.startStr, arg.event.allDay)
  }

  const handleEventResize = (arg: EventResizeDoneArg) => {
    cal.handleResize(arg.event.id, arg.event.endStr)
  }

  const visibleEvents = cal.events.filter(ev => !hiddenCals.has(ev.calendarId))

  const fcEvents = [
    ...visibleEvents.map(ev => ({
      id: ev.id,
      title: ev.title,
      start: ev.start,
      end: ev.end,
      allDay: ev.isAllDay,
      backgroundColor: ev.color ?? '#1f8f9b',
      borderColor: ev.color ?? '#1f8f9b',
      extendedProps: { description: ev.description, location: ev.location, calendarId: ev.calendarId },
    })),
    ...taskEvents,
  ]

  const currentLabel = VIEWS.find(v => v.value === currentView)?.label ?? 'Mes'

  // Agrupar calendarios: primero los "Mis calendarios" (primary + propios), luego "Otros"
  const myCalendars = calendars.filter(c => c.primary || !c.id.includes('#'))
  const otherCalendars = calendars.filter(c => !c.primary && c.id.includes('#'))

  return (
    <div className="flex flex-col gap-0 bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden relative">
      <div className="flex gap-0">
        {/* Panel lateral de calendarios */}
        <div className="hidden lg:flex flex-col w-52 flex-shrink-0 border-r border-gray-100 p-5 pt-6 gap-1">
          <CalendarGroup
            title="Mis calendarios"
            items={myCalendars}
            hidden={hiddenCals}
            onToggle={toggleCalendar}
          />
          {otherCalendars.length > 0 && (
            <CalendarGroup
              title="Otros calendarios"
              items={otherCalendars}
              hidden={hiddenCals}
              onToggle={toggleCalendar}
            />
          )}
        </div>

        {/* Calendario */}
        <div className="flex-1 p-6 min-w-0">
          {(cal.loading || loadingRange) && (
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-henko-turquoise animate-pulse" />
              <span className="font-raleway text-xs text-gray-400">Sincronizando…</span>
            </div>
          )}

          {cal.error && (
            <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl">
              <p className="font-raleway text-sm text-red-500">{cal.error}</p>
            </div>
          )}

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              {/* Botón + Crear */}
              <div className="relative">
                <div className="flex items-center rounded-2xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => {
                      const now = new Date()
                      const start = now.toISOString().slice(0, 16)
                      const end = new Date(now.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16)
                      cal.openCreate(start, end, false)
                    }}
                    className="flex items-center gap-1.5 px-3 h-8 font-raleway font-semibold text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-base leading-none text-gray-400">+</span> Crear
                  </button>
                  <button
                    onClick={() => setCreateOpen(o => !o)}
                    className="w-7 h-8 flex items-center justify-center border-l border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors"
                  >
                    <svg className={`w-3 h-3 transition-transform ${createOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                {createOpen && (
                  <div className="absolute left-0 top-10 bg-white rounded-2xl border border-gray-100 shadow-lg py-1.5 z-20 min-w-[180px]">
                    <button
                      onClick={() => {
                        const now = new Date()
                        const start = now.toISOString().slice(0, 16)
                        const end = new Date(now.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16)
                        cal.openCreate(start, end, false)
                        setCreateOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 font-raleway text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      Evento
                    </button>
                    <button
                      onClick={() => {
                        const now = new Date()
                        const start = now.toISOString().slice(0, 16)
                        const end = new Date(now.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16)
                        cal.openCreate(start, end, false, 'tarea')
                        setCreateOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 font-raleway text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Tarea
                    </button>
                    <button
                      onClick={openAgendas}
                      className="w-full flex items-center gap-3 px-4 py-2.5 font-raleway text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Agenda de citas
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => calRef.current?.getApi().prev()}
                className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-colors font-raleway text-sm"
              >←</button>
              <button
                onClick={() => calRef.current?.getApi().today()}
                className="px-3 h-8 rounded-xl bg-henko-turquoise text-white font-raleway font-semibold text-xs hover:opacity-90 transition-opacity"
              >Hoy</button>
              <button
                onClick={() => calRef.current?.getApi().next()}
                className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-colors font-raleway text-sm"
              >→</button>
            </div>

            <span className="font-roxborough text-lg text-gray-900">{title}</span>

            <div className="relative">
              <button
                onClick={() => setViewOpen(o => !o)}
                className="flex items-center gap-2 px-3 h-8 rounded-xl border border-gray-200 text-gray-700 font-raleway font-semibold text-xs hover:bg-gray-50 transition-colors"
              >
                {currentLabel}
                <svg className={`w-3 h-3 transition-transform ${viewOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {viewOpen && (
                <div className="absolute right-0 top-10 bg-white rounded-2xl border border-gray-100 shadow-lg py-1.5 z-10 min-w-[170px]">
                  {VIEWS.map(v => (
                    <button
                      key={v.value}
                      onClick={() => changeView(v.value)}
                      className="w-full flex items-center justify-between px-4 py-2 font-raleway text-sm transition-colors hover:bg-gray-50 text-gray-700"
                    >
                      <span className={currentView === v.value ? 'text-henko-turquoise font-semibold' : ''}>
                        {currentView === v.value && <span className="mr-2 text-henko-turquoise">✓</span>}{v.label}
                      </span>
                      <span className="text-gray-300 text-xs">{v.key}</span>
                    </button>
                  ))}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={() => { setShowWeekends(s => !s); setViewOpen(false) }}
                      className="w-full flex items-center gap-2 px-4 py-2 font-raleway text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span className={`w-4 text-henko-turquoise ${showWeekends ? '' : 'invisible'}`}>✓</span>
                      Mostrar fines de semana
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <style>{`
            .fc { font-family: 'Raleway', sans-serif; }
            .fc-toolbar { display: none !important; }
            .fc-event { border-radius: 0.5rem !important; font-size: 0.75rem !important; cursor: pointer; }
            .fc-event:hover { opacity: 0.85; }
            .fc-daygrid-day:hover { background: #f0fdfb !important; cursor: pointer; }
            .fc-timegrid-slot:hover { background: #f0fdfb !important; cursor: pointer; }
            .fc-col-header-cell { font-weight: 700; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; }
            .fc-day-today { background: #f0fdfb !important; }
            .fc-highlight { background: #ccfbf1 !important; }
            .fc-daygrid-day-number { color: #374151; font-size: 0.8rem; }
          `}</style>

          <FullCalendar
            ref={calRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin, multiMonthPlugin]}
            initialView="dayGridMonth"
            locale="es"
            timeZone="Europe/Madrid"
            headerToolbar={false}
            events={fcEvents}
            weekends={showWeekends}
            views={{ timeGridFourDay: { type: 'timeGrid', duration: { days: 4 } } }}
            editable
            selectable
            selectMirror
            dayMaxEvents
            nowIndicator
            height="auto"
            select={handleSelect}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            datesSet={handleDatesSet}
          />

          <EventoModal
            modal={cal.modal}
            onClose={cal.closeModal}
            onCreate={cal.handleCreate}
            onUpdate={cal.handleUpdate}
            onDelete={cal.handleDelete}
            calendars={calendars}
          />

          {/* Panel agendas de citas */}
          {showAgendas && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowAgendas(false)} />
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-henko-turquoise/10 flex items-center justify-center">
                      <svg className="w-4 h-4 text-henko-turquoise" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="font-roxborough text-lg text-gray-900">Agendas de citas</h2>
                  </div>
                  <button onClick={() => setShowAgendas(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {loadingAgendas ? (
                  <p className="font-raleway text-sm text-gray-400 text-center py-6">Cargando agendas…</p>
                ) : agendas.length === 0 ? (
                  <div className="text-center py-6 space-y-4">
                    <p className="font-raleway text-sm text-gray-500">
                      No tienes agendas de citas creadas todavía.
                    </p>
                    <p className="font-raleway text-xs text-gray-400 max-w-sm mx-auto">
                      Una agenda de citas crea una página de reserva pública donde otras personas pueden elegir un horario disponible contigo. Requiere Google Workspace o una cuenta de Google personal con acceso a la función.
                    </p>
                    <a
                      href="https://calendar.google.com/calendar/u/0/r/agenda"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-henko-turquoise text-white font-raleway font-semibold text-sm py-2 px-5 rounded-xl hover:opacity-90 transition-opacity"
                    >
                      Crear en Google Calendar
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </a>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {agendas.map(a => (
                      <div key={a.id} className="flex items-start justify-between gap-4 p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
                        <div className="min-w-0">
                          <p className="font-raleway font-semibold text-sm text-gray-900 truncate">{a.title}</p>
                          {a.description && <p className="font-raleway text-xs text-gray-400 mt-0.5 truncate">{a.description}</p>}
                          {a.duration && <p className="font-raleway text-xs text-henko-turquoise mt-1">{a.duration}</p>}
                        </div>
                        <a
                          href={a.bookingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 flex items-center gap-1.5 text-xs font-raleway font-semibold text-henko-turquoise border border-henko-turquoise/30 px-3 py-1.5 rounded-xl hover:bg-henko-turquoise/5 transition-colors"
                        >
                          Ver página
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                        </a>
                      </div>
                    ))}
                    <div className="pt-2 text-center">
                      <a
                        href="https://calendar.google.com/calendar/u/0/r/agenda"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-raleway text-xs text-henko-turquoise hover:underline"
                      >
                        Gestionar en Google Calendar →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cerrar dropdown al hacer clic fuera */}
          {createOpen && <div className="fixed inset-0 z-[5]" onClick={() => setCreateOpen(false)} />}
        </div>
      </div>

      {/* Tareas */}
      <div className="border-t border-gray-100">
        <TasksPanel onTasksChange={handleTasksChange} />
      </div>
    </div>
  )
}

function CalendarGroup({ title, items, hidden, onToggle }: {
  title: string
  items: CalendarMeta[]
  hidden: Set<string>
  onToggle: (id: string) => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  if (items.length === 0) return null
  return (
    <div className="mb-4">
      <button
        onClick={() => setCollapsed(c => !c)}
        className="flex items-center justify-between w-full mb-2 group"
      >
        <span className="font-raleway font-bold text-[10px] text-gray-500 uppercase tracking-widest">{title}</span>
        <svg className={`w-3 h-3 text-gray-400 transition-transform ${collapsed ? '-rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {!collapsed && items.map(c => {
        const visible = !hidden.has(c.id)
        return (
          <button
            key={c.id}
            onClick={() => onToggle(c.id)}
            className="flex items-center gap-2.5 w-full py-1 px-1 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <span
              className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center transition-opacity"
              style={{ backgroundColor: visible ? c.color : 'transparent', border: `2px solid ${c.color}` }}
            >
              {visible && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            <span className={`font-raleway text-xs truncate ${visible ? 'text-gray-700' : 'text-gray-400'}`}>{c.title}</span>
          </button>
        )
      })}
    </div>
  )
}
