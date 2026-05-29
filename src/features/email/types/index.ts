export type EmailMessage = {
  uid: number
  from: string
  subject: string
  date: Date
  seen: boolean
  snippet: string
}

export type EmailDetail = EmailMessage & {
  bodyHtml: string | null
  bodyText: string | null
}

export type ImapFolder = {
  path: string          // path real en el servidor (ej: "Sent", "INBOX.Spam")
  label: string         // nombre visible (ej: "Enviados")
  type: FolderType
  unread: number
}

export type FolderType = 'inbox' | 'sent' | 'drafts' | 'spam' | 'trash'

export type AttachmentInput = {
  name: string
  size: number
  mimeType: string
  base64: string        // contenido en base64 para serializar al servidor
}
