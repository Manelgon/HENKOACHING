'use server'

import { google } from 'googleapis'
import { z } from 'zod'

export type TaskList = {
  id: string
  title: string
}

export type Task = {
  id: string
  title: string
  status: 'needsAction' | 'completed'
  due: string | null
  notes: string | null
}

const CreateTaskSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200),
  due: z.string().optional(),
  notes: z.string().max(2000).optional(),
})

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>

function createAuth() {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  )
  auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })
  return auth
}

export async function getTaskLists(): Promise<TaskList[]> {
  const tasksClient = google.tasks({ version: 'v1', auth: createAuth() })
  const all: TaskList[] = []
  let pageToken: string | undefined

  do {
    const res = await tasksClient.tasklists.list({ maxResults: 100, pageToken })
    for (const l of res.data.items ?? []) {
      all.push({ id: l.id ?? '', title: l.title ?? 'Sin nombre' })
    }
    pageToken = res.data.nextPageToken ?? undefined
  } while (pageToken)

  return all
}

export async function getTasks(taskListId: string): Promise<Task[]> {
  const tasks = google.tasks({ version: 'v1', auth: createAuth() })
  const res = await tasks.tasks.list({
    tasklist: taskListId,
    showCompleted: true,
    showHidden: false,
    maxResults: 100,
  })
  return (res.data.items ?? []).map(t => ({
    id: t.id ?? '',
    title: t.title ?? 'Sin título',
    status: (t.status as 'needsAction' | 'completed') ?? 'needsAction',
    due: t.due ? t.due.split('T')[0] : null,
    notes: t.notes ?? null,
  }))
}

export async function createTask(taskListId: string, data: CreateTaskInput): Promise<Task> {
  const parsed = CreateTaskSchema.parse(data)
  const tasks = google.tasks({ version: 'v1', auth: createAuth() })
  const res = await tasks.tasks.insert({
    tasklist: taskListId,
    requestBody: {
      title: parsed.title,
      notes: parsed.notes,
      due: parsed.due ? `${parsed.due}T00:00:00.000Z` : undefined,
    },
  })
  const t = res.data
  return {
    id: t.id ?? '',
    title: t.title ?? '',
    status: (t.status as 'needsAction' | 'completed') ?? 'needsAction',
    due: t.due ? t.due.split('T')[0] : null,
    notes: t.notes ?? null,
  }
}

export async function toggleTask(taskListId: string, taskId: string, completed: boolean): Promise<Task> {
  const tasks = google.tasks({ version: 'v1', auth: createAuth() })
  const res = await tasks.tasks.patch({
    tasklist: taskListId,
    task: taskId,
    requestBody: {
      status: completed ? 'completed' : 'needsAction',
      completed: completed ? new Date().toISOString() : undefined,
    },
  })
  const t = res.data
  return {
    id: t.id ?? '',
    title: t.title ?? '',
    status: (t.status as 'needsAction' | 'completed') ?? 'needsAction',
    due: t.due ? t.due.split('T')[0] : null,
    notes: t.notes ?? null,
  }
}

export async function deleteTask(taskListId: string, taskId: string): Promise<void> {
  const tasks = google.tasks({ version: 'v1', auth: createAuth() })
  await tasks.tasks.delete({ tasklist: taskListId, task: taskId })
}

export async function createTaskList(title: string): Promise<TaskList> {
  const parsed = z.string().min(1).max(100).parse(title)
  const tasksClient = google.tasks({ version: 'v1', auth: createAuth() })
  const res = await tasksClient.tasklists.insert({ requestBody: { title: parsed } })
  return { id: res.data.id ?? '', title: res.data.title ?? parsed }
}
