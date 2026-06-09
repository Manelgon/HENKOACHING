import 'server-only'

import { google } from 'googleapis'
import sanitizeHtml from 'sanitize-html'
import type { GmailThread, GmailMessage, GmailLabel } from '../types'

function createAuth() {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  )
  auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })
  return auth
}

function getGmail() {
  return google.gmail({ version: 'v1', auth: createAuth() })
}

function decodeBase64Url(data: string): string {
  return Buffer.from(data, 'base64url').toString('utf-8')
}

function findHtmlPart(parts: Array<{ mimeType?: string | null; body?: { data?: string | null } | null; parts?: unknown[] | null }>): string | null {
  for (const part of parts) {
    if (part.mimeType === 'text/html' && part.body?.data) {
      return decodeBase64Url(part.body.data)
    }
    if (part.parts) {
      const found = findHtmlPart(part.parts as typeof parts)
      if (found) return found
    }
  }
  return null
}

function findTextPart(parts: Array<{ mimeType?: string | null; body?: { data?: string | null } | null; parts?: unknown[] | null }>): string | null {
  for (const part of parts) {
    if (part.mimeType === 'text/plain' && part.body?.data) {
      return decodeBase64Url(part.body.data)
    }
    if (part.parts) {
      const found = findTextPart(part.parts as typeof parts)
      if (found) return found
    }
  }
  return null
}

function getHeader(headers: Array<{ name?: string | null; value?: string | null }>, name: string): string {
  return headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value ?? ''
}

export async function listarLabels(): Promise<GmailLabel[]> {
  const gmail = getGmail()
  const res = await gmail.users.labels.list({ userId: 'me' })
  const labels = res.data.labels ?? []

  const details = await Promise.all(
    labels
      .filter(l => ['INBOX', 'SENT', 'DRAFT', 'SPAM', 'TRASH'].includes(l.id ?? '') || l.type === 'user')
      .map(async l => {
        try {
          const detail = await gmail.users.labels.get({ userId: 'me', id: l.id! })
          return {
            id: l.id ?? '',
            name: translateLabelName(l.name ?? l.id ?? ''),
            type: (l.type === 'user' ? 'user' : 'system') as 'system' | 'user',
            unread: detail.data.messagesUnread ?? 0,
            total: detail.data.messagesTotal ?? 0,
          }
        } catch {
          return {
            id: l.id ?? '',
            name: translateLabelName(l.name ?? l.id ?? ''),
            type: (l.type === 'user' ? 'user' : 'system') as 'system' | 'user',
            unread: 0,
            total: 0,
          }
        }
      })
  )
  return details
}

function translateLabelName(name: string): string {
  const map: Record<string, string> = {
    INBOX: 'Recibidos',
    SENT: 'Enviados',
    DRAFT: 'Borradores',
    SPAM: 'Spam',
    TRASH: 'Papelera',
  }
  return map[name] ?? name
}

export async function listarThreads(labelId = 'INBOX', q?: string, pageToken?: string, maxResults = 20): Promise<{ threads: GmailThread[]; nextPageToken?: string }> {
  const gmail = getGmail()
  const res = await gmail.users.threads.list({
    userId: 'me',
    labelIds: labelId ? [labelId] : undefined,
    q,
    maxResults,
    pageToken,
  })

  const items = res.data.threads ?? []

  const threads = await Promise.all(
    items.map(async item => {
      try {
        const thread = await gmail.users.threads.get({
          userId: 'me',
          id: item.id!,
          format: 'metadata',
          metadataHeaders: ['Subject', 'From', 'To', 'Date'],
        })
        const messages = thread.data.messages ?? []
        const last = messages[messages.length - 1]
        const headers = last?.payload?.headers ?? []
        const unread = messages.some(m => m.labelIds?.includes('UNREAD'))

        return {
          id: item.id ?? '',
          snippet: item.snippet ?? thread.data.snippet ?? '',
          subject: getHeader(headers, 'Subject') || '(sin asunto)',
          from: getHeader(headers, 'From'),
          to: getHeader(headers, 'To'),
          date: new Date(parseInt(last?.internalDate ?? '0')),
          unread,
          labels: last?.labelIds ?? [],
          messageCount: messages.length,
        } satisfies GmailThread
      } catch {
        return {
          id: item.id ?? '',
          snippet: item.snippet ?? '',
          subject: '(sin asunto)',
          from: '',
          to: '',
          date: new Date(),
          unread: false,
          labels: [],
          messageCount: 1,
        } satisfies GmailThread
      }
    })
  )

  return { threads, nextPageToken: res.data.nextPageToken ?? undefined }
}

export async function leerThread(threadId: string): Promise<GmailMessage[]> {
  const gmail = getGmail()
  const res = await gmail.users.threads.get({ userId: 'me', id: threadId, format: 'full' })
  const messages = res.data.messages ?? []

  return messages.map(msg => {
    const headers = msg.payload?.headers ?? []
    const parts = msg.payload?.parts ?? []
    const bodyData = msg.payload?.body?.data

    let htmlRaw: string | null = null
    let textRaw: string | null = null

    if (bodyData) {
      if (msg.payload?.mimeType === 'text/html') {
        htmlRaw = decodeBase64Url(bodyData)
      } else {
        textRaw = decodeBase64Url(bodyData)
      }
    } else if (parts.length > 0) {
      htmlRaw = findHtmlPart(parts)
      textRaw = findTextPart(parts)
    }

    const bodyHtml = htmlRaw
      ? sanitizeHtml(htmlRaw, {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'style', 'font', 'table', 'tbody', 'tr', 'td', 'th', 'thead']),
          allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, '*': ['style', 'class', 'align', 'bgcolor', 'width', 'height', 'cellpadding', 'cellspacing', 'border', 'valign'] },
        })
      : null

    return {
      id: msg.id ?? '',
      threadId: msg.threadId ?? '',
      from: getHeader(headers, 'From'),
      to: getHeader(headers, 'To'),
      date: new Date(parseInt(msg.internalDate ?? '0')),
      subject: getHeader(headers, 'Subject') || '(sin asunto)',
      bodyHtml,
      bodyText: textRaw,
      unread: msg.labelIds?.includes('UNREAD') ?? false,
    } satisfies GmailMessage
  })
}

export async function modificarThread(threadId: string, addLabelIds: string[], removeLabelIds: string[]): Promise<void> {
  const gmail = getGmail()
  await gmail.users.threads.modify({
    userId: 'me',
    id: threadId,
    requestBody: { addLabelIds, removeLabelIds },
  })
}

export async function eliminarThread(threadId: string): Promise<void> {
  const gmail = getGmail()
  await gmail.users.threads.trash({ userId: 'me', id: threadId })
}
