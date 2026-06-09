'use client'

import { useEffect, useState, useCallback } from 'react'
import { getCalendarEvents, type CalendarEvent } from '@/actions/google-calendar'
import { getTaskLists, getTasks, toggleTask, type TaskList, type Task } from '@/actions/google-tasks'

const INTERVAL_MS = 60_000

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatTime(iso: string, isAllDay: boolean) {
  if (isAllDay) return 'Todo el día'
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

function getDayLabel(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)
  if (d.toDateString() === today.toDateString()) return 'Hoy'
  if (d.toDateString() === tomorrow.toDateString()) return 'Mañana'
  return null
}

type ListWithTasks = { list: TaskList; tasks: Task[] }

export default function CalendarWidget({ initial }: { initial: CalendarEvent[] }) {
  const [events, setEvents] = useState<CalendarEvent[]>(initial)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [taskGroups, setTaskGroups] = useState<ListWithTasks[]>([])

  const loadTasks = useCallback(async () => {
    try {
      const lists = await getTaskLists()
      const groups = await Promise.all(
        lists.map(async list => {
          try {
            const tasks = await getTasks(list.id)
            return { list, tasks }
          } catch {
            return { list, tasks: [] }
          }
        })
      )
      setTaskGroups(groups)
    } catch {
      // silently ignore
    }
  }, [])

  useEffect(() => {
    loadTasks()
    const id = setInterval(async () => {
      const fresh = await getCalendarEvents()
      setEvents(fresh)
      setLastUpdated(new Date())
      loadTasks()
    }, INTERVAL_MS)
    return () => clearInterval(id)
  }, [loadTasks])

  const handleToggle = async (listId: string, task: Task) => {
    const newCompleted = task.status !== 'completed'
    setTaskGroups(prev =>
      prev.map(g =>
        g.list.id !== listId ? g : {
          ...g,
          tasks: g.tasks.map(t =>
            t.id !== task.id ? t : { ...t, status: newCompleted ? 'completed' : 'needsAction' }
          ),
        }
      )
    )
    try {
      await toggleTask(listId, task.id, newCompleted)
    } catch {
      // revert on error
      setTaskGroups(prev =>
        prev.map(g =>
          g.list.id !== listId ? g : {
            ...g,
            tasks: g.tasks.map(t => t.id !== task.id ? t : task),
          }
        )
      )
    }
  }

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
      {/* Eventos */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-henko-turquoise/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-henko-turquoise" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <h2 className="font-roxborough text-lg text-gray-900">Próximos eventos</h2>
        </div>
        <span className="text-[10px] font-raleway text-gray-300">
          {lastUpdated.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {events.length === 0 ? (
        <p className="font-raleway text-sm text-gray-400 italic">Sin eventos próximos.</p>
      ) : (
        <div className="space-y-2">
          {events.map(ev => {
            const dayLabel = getDayLabel(ev.start)
            return (
              <div
                key={ev.id}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-henko-greenblue transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0 w-10 text-center">
                    {dayLabel ? (
                      <span className="text-[10px] font-bold text-henko-turquoise uppercase">{dayLabel}</span>
                    ) : (
                      <span className="text-[10px] text-gray-400 font-raleway">{formatDay(ev.start)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-raleway font-semibold text-gray-900 text-sm truncate">{ev.title}</p>
                    {ev.location && (
                      <p className="text-xs text-gray-400 font-raleway truncate">{ev.location}</p>
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-gray-400 font-raleway flex-shrink-0">
                  {formatTime(ev.start, ev.isAllDay)}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Tareas */}
      {taskGroups.length > 0 && (
        <>
          <div className="border-t border-gray-100 mt-6 pt-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="font-roxborough text-lg text-gray-900">Mis tareas</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {taskGroups.map(({ list, tasks }) => {
                const pending = tasks.filter(t => t.status === 'needsAction')
                return (
                  <div key={list.id} className="border border-gray-100 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-raleway font-bold text-xs text-gray-700 uppercase tracking-wider truncate">{list.title}</p>
                      {pending.length > 0 && (
                        <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full flex-shrink-0">{pending.length}</span>
                      )}
                    </div>
                    {pending.length === 0 ? (
                      <p className="font-raleway text-xs text-gray-400 italic text-center py-3">Todas completadas</p>
                    ) : (
                      <div className="space-y-1">
                        {pending.map(task => (
                          <button
                            key={task.id}
                            onClick={() => handleToggle(list.id, task)}
                            className="w-full flex items-start gap-2.5 py-1.5 px-1 rounded-lg hover:bg-gray-50 transition-colors group text-left"
                          >
                            <div className="mt-0.5 w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0 group-hover:border-henko-turquoise transition-colors" />
                            <div className="min-w-0">
                              <p className="font-raleway text-xs text-gray-700 leading-snug">{task.title}</p>
                              {task.due && (
                                <p className="text-[10px] text-amber-500 font-raleway mt-0.5">
                                  {new Date(task.due + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                </p>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
