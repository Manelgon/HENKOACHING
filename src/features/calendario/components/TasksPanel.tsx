'use client'

import { useState, useEffect, useRef } from 'react'
import { getTaskLists, getTasks, createTask, toggleTask, deleteTask, createTaskList } from '@/actions/google-tasks'
import type { TaskList, Task } from '@/actions/google-tasks'

type ListState = {
  list: TaskList
  tasks: Task[]
  loading: boolean
  creating: boolean
  newTitle: string
  newDue: string
}

type InitialGroup = { list: TaskList; tasks: Task[] }

type Props = {
  onTasksChange: (tasks: Task[]) => void
  initialGroups?: InitialGroup[]
}

export default function TasksPanel({ onTasksChange, initialGroups = [] }: Props) {
  const [groups, setGroups] = useState<ListState[]>(
    initialGroups.map(g => ({ list: g.list, tasks: g.tasks, loading: false, creating: false, newTitle: '', newDue: '' }))
  )
  const [creatingList, setCreatingList] = useState(false)
  const [newListTitle, setNewListTitle] = useState('')
  const [savingList, setSavingList] = useState(false)

  // Mantener una referencia viva al callback para no reejecutar la carga inicial
  // cuando el padre re-renderiza con una nueva función, evitando un closure stale.
  const onTasksChangeRef = useRef(onTasksChange)
  useEffect(() => { onTasksChangeRef.current = onTasksChange }, [onTasksChange])
  const notifyTasksChange = (tasks: Task[]) => onTasksChangeRef.current(tasks)

  useEffect(() => {
    if (initialGroups.length > 0) {
      notifyTasksChange(initialGroups.flatMap(g => g.tasks))
      return
    }
    getTaskLists()
      .then(lists => {
        const initial = lists.map(list => ({ list, tasks: [], loading: true, creating: false, newTitle: '', newDue: '' }))
        setGroups(initial)
        lists.forEach((list, i) => {
          getTasks(list.id)
            .then(tasks => {
              setGroups(prev => {
                const next = prev.map((g, idx) => idx === i ? { ...g, tasks, loading: false } : g)
                notifyTasksChange(next.flatMap(g => g.tasks))
                return next
              })
            })
            .catch(() => {
              setGroups(prev => prev.map((g, idx) => idx === i ? { ...g, loading: false } : g))
            })
        })
      })
      .catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateGroup = (listId: string, patch: Partial<ListState>) => {
    setGroups(prev => prev.map(g => g.list.id === listId ? { ...g, ...patch } : g))
  }

  const handleToggle = async (listId: string, task: Task) => {
    const newCompleted = task.status !== 'completed'
    setGroups(prev => {
      const next = prev.map(g =>
        g.list.id !== listId ? g : {
          ...g,
          tasks: g.tasks.map(t => t.id === task.id ? { ...t, status: (newCompleted ? 'completed' : 'needsAction') as Task['status'] } : t),
        }
      )
      notifyTasksChange(next.flatMap(g => g.tasks))
      return next
    })
    try {
      await toggleTask(listId, task.id, newCompleted)
    } catch {
      setGroups(prev => {
        const next = prev.map(g =>
          g.list.id !== listId ? g : { ...g, tasks: g.tasks.map(t => t.id === task.id ? task : t) }
        )
        notifyTasksChange(next.flatMap(g => g.tasks))
        return next
      })
    }
  }

  const handleDelete = async (listId: string, task: Task) => {
    const group = groups.find(g => g.list.id === listId)
    if (!group) return
    const prevTasks = group.tasks
    setGroups(prev => {
      const next = prev.map(g =>
        g.list.id !== listId ? g : { ...g, tasks: g.tasks.filter(t => t.id !== task.id) }
      )
      notifyTasksChange(next.flatMap(g => g.tasks))
      return next
    })
    try {
      await deleteTask(listId, task.id, task.title)
    } catch {
      setGroups(prev => {
        const next = prev.map(g => g.list.id !== listId ? g : { ...g, tasks: prevTasks })
        notifyTasksChange(next.flatMap(g => g.tasks))
        return next
      })
    }
  }

  const handleCreate = async (e: React.FormEvent, listId: string) => {
    e.preventDefault()
    const group = groups.find(g => g.list.id === listId)
    if (!group || !group.newTitle.trim()) return
    updateGroup(listId, { creating: false })
    try {
      const created = await createTask(listId, { title: group.newTitle.trim(), due: group.newDue || undefined })
      setGroups(prev => {
        const next = prev.map(g =>
          g.list.id !== listId ? g : { ...g, tasks: [created, ...g.tasks], newTitle: '', newDue: '' }
        )
        notifyTasksChange(next.flatMap(g => g.tasks))
        return next
      })
    } catch {
      updateGroup(listId, { creating: true })
    }
  }

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newListTitle.trim()) return
    setSavingList(true)
    try {
      const list = await createTaskList(newListTitle.trim())
      setGroups(prev => [...prev, { list, tasks: [], loading: false, creating: false, newTitle: '', newDue: '' }])
      setNewListTitle('')
      setCreatingList(false)
    } catch {
      // silently ignore
    } finally {
      setSavingList(false)
    }
  }

  if (groups.length === 0 && !creatingList) return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-5">
        <svg className="w-4 h-4 text-henko-turquoise" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-roxborough text-lg text-gray-900">Tareas</span>
      </div>
      <button onClick={() => setCreatingList(true)} className="flex items-center gap-1.5 text-xs font-raleway font-semibold bg-henko-turquoise text-white py-1.5 px-3 rounded-xl hover:opacity-90 transition-opacity">
        <span className="text-base leading-none">+</span> Crear lista
      </button>
    </div>
  )

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-henko-turquoise" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-roxborough text-lg text-gray-900">Tareas</span>
        </div>
        {!creatingList && (
          <button
            onClick={() => setCreatingList(true)}
            className="flex items-center gap-1.5 text-xs font-raleway font-semibold bg-henko-turquoise text-white py-1.5 px-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            <span className="text-sm leading-none">+</span> Crear lista
          </button>
        )}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 -mb-2">
        {/* Formulario nueva lista */}
        {creatingList && (
          <form onSubmit={handleCreateList} className="border border-henko-turquoise/30 rounded-2xl p-4 flex flex-col gap-3 w-56 flex-shrink-0">
            <p className="font-raleway font-bold text-xs text-gray-700 uppercase tracking-wider">Nueva lista</p>
            <input
              autoFocus
              value={newListTitle}
              onChange={e => setNewListTitle(e.target.value)}
              placeholder="Nombre de la lista"
              className="w-full text-xs font-raleway border border-henko-turquoise rounded-xl px-3 py-2 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={savingList || !newListTitle.trim()}
                className="flex-1 text-xs font-raleway font-semibold bg-henko-turquoise text-white rounded-xl py-1.5 hover:opacity-90 disabled:opacity-50"
              >
                {savingList ? 'Guardando…' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={() => { setCreatingList(false); setNewListTitle('') }}
                className="flex-1 text-xs font-raleway border border-gray-200 rounded-xl py-1.5 text-gray-500 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
        {groups.map(g => (
          <TaskListColumn
            key={g.list.id}
            group={g}
            onToggle={(task) => handleToggle(g.list.id, task)}
            onDelete={(task) => handleDelete(g.list.id, task)}
            onCreate={(e) => handleCreate(e, g.list.id)}
            onSetCreating={(v) => updateGroup(g.list.id, { creating: v })}
            onTitleChange={(v) => updateGroup(g.list.id, { newTitle: v })}
            onDueChange={(v) => updateGroup(g.list.id, { newDue: v })}
          />
        ))}
      </div>
    </div>
  )
}

type ColumnProps = {
  group: ListState
  onToggle: (task: Task) => void
  onDelete: (task: Task) => void
  onCreate: (e: React.FormEvent) => void
  onSetCreating: (v: boolean) => void
  onTitleChange: (v: string) => void
  onDueChange: (v: string) => void
}

function TaskListColumn({ group, onToggle, onDelete, onCreate, onSetCreating, onTitleChange, onDueChange }: ColumnProps) {
  const pending = group.tasks.filter(t => t.status === 'needsAction')
  const completed = group.tasks.filter(t => t.status === 'completed')

  return (
    <div className="border border-gray-100 rounded-2xl p-4 flex flex-col gap-2 w-56 flex-shrink-0">
      {/* Cabecera de lista */}
      <div className="flex items-center justify-between mb-1">
        <p className="font-raleway font-bold text-xs text-gray-700 uppercase tracking-wider truncate">{group.list.title}</p>
        {pending.length > 0 && (
          <span className="text-[10px] font-bold text-henko-turquoise bg-henko-turquoise/10 px-2 py-0.5 rounded-full flex-shrink-0">{pending.length}</span>
        )}
      </div>

      {/* Tareas */}
      {group.loading ? (
        <p className="text-xs text-gray-400 font-raleway italic text-center py-2">Cargando…</p>
      ) : (
        <>
          {pending.length === 0 && completed.length === 0 && (
            <p className="text-xs text-gray-400 font-raleway italic text-center py-2">Sin tareas.</p>
          )}
          <div className="space-y-0.5">
            {pending.map(task => (
              <TaskRow key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
            ))}
          </div>
          {completed.length > 0 && (
            <details className="mt-1">
              <summary className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer select-none py-1">
                Completadas ({completed.length})
              </summary>
              <div className="space-y-0.5 mt-1">
                {completed.map(task => (
                  <TaskRow key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
                ))}
              </div>
            </details>
          )}
        </>
      )}
    </div>
  )
}

function TaskRow({ task, onToggle, onDelete }: { task: Task; onToggle: (t: Task) => void; onDelete: (t: Task) => void }) {
  const done = task.status === 'completed'
  return (
    <div className="flex items-start gap-2 group px-1 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
      <button
        onClick={() => onToggle(task)}
        className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors ${done ? 'border-henko-turquoise bg-henko-turquoise' : 'border-gray-300 hover:border-henko-turquoise'}`}
      >
        {done && (
          <svg className="w-full h-full text-white p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-raleway leading-snug ${done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{task.title}</p>
        {task.due && !done && (
          <p className="text-[10px] text-amber-500 font-raleway mt-0.5">
            {new Date(task.due + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
          </p>
        )}
      </div>
      <button
        onClick={() => onDelete(task)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-400 flex-shrink-0"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
