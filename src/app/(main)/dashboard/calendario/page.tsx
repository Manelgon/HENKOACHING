import { getCalendarEventsRange, getCalendars } from '@/actions/google-calendar'
import { getTaskLists, getTasks } from '@/actions/google-tasks'
import type { TaskList, Task } from '@/actions/google-tasks'
import CalendarioView from '@/features/calendario/components/CalendarioView'

export const metadata = { title: 'Calendario — Henkoaching' }
export const dynamic = 'force-dynamic'

export default async function CalendarioPage() {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth(), 1)
  const to = new Date(now.getFullYear(), now.getMonth() + 2, 0)

  const [initialEvents, initialCalendars, lists] = await Promise.all([
    getCalendarEventsRange(from, to).catch(() => []),
    getCalendars().catch(() => []),
    getTaskLists().catch(() => [] as TaskList[]),
  ])

  const initialTaskGroups = await Promise.all(
    lists.map(async list => {
      const tasks = await getTasks(list.id).catch(() => [] as Task[])
      return { list, tasks }
    })
  )

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="font-roxborough text-2xl md:text-3xl text-gray-900 mb-2">Calendario</h1>
        <p className="font-raleway text-gray-500 font-light">Gestiona tu agenda sincronizada con Google Calendar.</p>
      </div>
      <CalendarioView
        initialEvents={initialEvents}
        initialCalendars={initialCalendars}
        initialTaskGroups={initialTaskGroups}
      />
    </div>
  )
}
