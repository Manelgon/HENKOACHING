// ── Gmail API types ─────────────────────────────────────────────────────────

export type GmailLabel = {
  id: string
  name: string
  type: 'system' | 'user'
  unread: number
  total: number
}

export type GmailThread = {
  id: string
  snippet: string
  subject: string
  from: string
  to: string
  date: Date
  unread: boolean
  labels: string[]
  messageCount: number
}

export type GmailMessage = {
  id: string
  threadId: string
  from: string
  to: string
  date: Date
  subject: string
  bodyHtml: string | null
  bodyText: string | null
  unread: boolean
}

// ── Legacy IMAP types (kept for AttachmentInput used in ComposeDrawer) ───────

export type AttachmentInput = {
  name: string
  size: number
  mimeType: string
  base64: string
}

// ── Kept for backward compat with any remaining references ──────────────────
export type EmailMessage = {
  uid: number
  from: string
  subject: string
  date: Date
  seen: boolean
  snippet: string
}

export type EmailDetail = EmailMessage & {
  to: string
  bodyHtml: string | null
  bodyText: string | null
}

export type ImapFolder = {
  path: string
  label: string
  type: FolderType
  unread: number
}

export type FolderType = 'inbox' | 'sent' | 'drafts' | 'spam' | 'trash'
