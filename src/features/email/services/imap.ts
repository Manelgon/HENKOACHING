import 'server-only'
import { ImapFlow } from 'imapflow'
import sanitizeHtml from 'sanitize-html'
import { simpleParser } from 'mailparser'
import type { EmailMessage, EmailDetail, ImapFolder, FolderType } from '../types'

type ImapCredentials = {
  host: string
  port: number
  encryption: 'ssl' | 'starttls' | 'none'
  user: string
  password: string
}

// Heurísticas para detectar el tipo de carpeta por nombre y atributos IMAP
const FOLDER_PATTERNS: { type: FolderType; label: string; patterns: RegExp[] }[] = [
  { type: 'sent',   label: 'Enviados',   patterns: [/sent/i, /enviados/i, /^Sent$/i] },
  { type: 'drafts', label: 'Borradores', patterns: [/draft/i, /borrador/i] },
  { type: 'spam',   label: 'Spam',       patterns: [/spam/i, /junk/i, /correo no deseado/i] },
  { type: 'trash',  label: 'Papelera',   patterns: [/trash/i, /papelera/i, /deleted/i, /bin/i] },
]

function detectFolderType(name: string, specialUse?: string): FolderType {
  if (specialUse) {
    if (specialUse.includes('Sent'))   return 'sent'
    if (specialUse.includes('Drafts')) return 'drafts'
    if (specialUse.includes('Junk'))   return 'spam'
    if (specialUse.includes('Trash'))  return 'trash'
  }
  for (const { type, patterns } of FOLDER_PATTERNS) {
    if (patterns.some((p) => p.test(name))) return type
  }
  return 'inbox'
}

function buildClient(creds: ImapCredentials): ImapFlow {
  const client = new ImapFlow({
    host: creds.host,
    port: creds.port,
    secure: creds.encryption === 'ssl',
    auth: { user: creds.user, pass: creds.password },
    logger: false,
    connectionTimeout: 15000,
    greetingTimeout: 8000,
    socketTimeout: 20000,
    tls: creds.encryption !== 'none' ? { rejectUnauthorized: false } : undefined,
  })
  client.on('error', () => { /* evita uncaughtException */ })
  return client
}

async function safeLogout(client: ImapFlow) {
  try { await client.logout() } catch { /* ignorar */ }
}

export async function listarCarpetas(creds: ImapCredentials): Promise<ImapFolder[]> {
  const client = buildClient(creds)
  await client.connect()
  try {
    const list = await client.list()
    const seen = new Set<FolderType>()
    const folders: ImapFolder[] = [{ path: 'INBOX', label: 'Recibidos', type: 'inbox', unread: 0 }]
    seen.add('inbox')

    for (const mailbox of list) {
      if (mailbox.path === 'INBOX') continue
      const specialUse = (mailbox as { specialUse?: string }).specialUse
      const type = detectFolderType(mailbox.name, specialUse)
      if (seen.has(type)) continue
      seen.add(type)
      const known = FOLDER_PATTERNS.find((p) => p.type === type)
      folders.push({ path: mailbox.path, label: known?.label ?? mailbox.name, type, unread: 0 })
    }

    // Traer no leídos para carpetas relevantes (inbox + spam)
    for (const folder of folders) {
      if (folder.type !== 'inbox' && folder.type !== 'spam') continue
      try {
        const status = await client.status(folder.path, { unseen: true })
        folder.unread = status.unseen ?? 0
      } catch { /* ignorar si falla una carpeta */ }
    }

    const ORDER: FolderType[] = ['inbox', 'sent', 'drafts', 'spam', 'trash']
    folders.sort((a, b) => ORDER.indexOf(a.type) - ORDER.indexOf(b.type))
    return folders
  } finally {
    await safeLogout(client)
  }
}

export async function listarMensajes(creds: ImapCredentials, mailbox = 'INBOX', limit = 50): Promise<EmailMessage[]> {
  const client = buildClient(creds)
  await client.connect()
  const messages: EmailMessage[] = []
  try {
    await client.mailboxOpen(mailbox)
    const status = await client.status(mailbox, { messages: true })
    const total = status.messages ?? 0
    if (total === 0) return []

    const from = Math.max(1, total - limit + 1)
    const range = `${from}:${total}`

    for await (const msg of client.fetch(range, {
      uid: true, flags: true, envelope: true, bodyStructure: false, internalDate: true,
    })) {
      const fromAddr = msg.envelope?.from?.[0]
      const fromStr = fromAddr
        ? `${fromAddr.name ? fromAddr.name + ' ' : ''}<${fromAddr.address}>`
        : '(desconocido)'
      messages.push({
        uid: msg.uid,
        from: fromStr,
        subject: msg.envelope?.subject ?? '(sin asunto)',
        date: msg.internalDate ? new Date(msg.internalDate) : new Date(),
        seen: msg.flags?.has('\\Seen') ?? false,
        snippet: '',
      })
    }
    messages.sort((a, b) => b.date.getTime() - a.date.getTime())
  } finally {
    await safeLogout(client)
  }
  return messages
}

export async function leerMensaje(creds: ImapCredentials, uid: number, mailbox = 'INBOX'): Promise<EmailDetail | null> {
  const client = buildClient(creds)
  await client.connect()
  try {
    await client.mailboxOpen(mailbox)
    let msgMeta: EmailMessage | null = null
    for await (const msg of client.fetch(String(uid), {
      uid: true, flags: true, envelope: true, internalDate: true,
    }, { uid: true })) {
      const fromAddr = msg.envelope?.from?.[0]
      const fromStr = fromAddr
        ? `${fromAddr.name ? fromAddr.name + ' ' : ''}<${fromAddr.address}>`
        : '(desconocido)'
      msgMeta = {
        uid: msg.uid,
        from: fromStr,
        subject: msg.envelope?.subject ?? '(sin asunto)',
        date: msg.internalDate ? new Date(msg.internalDate) : new Date(),
        seen: msg.flags?.has('\\Seen') ?? false,
        snippet: '',
      }
    }
    if (!msgMeta) return null

    let bodyHtml: string | null = null
    let bodyText: string | null = null
    const download = await client.download(String(uid), undefined, { uid: true })
    if (download) {
      const parsed = await simpleParser(download.content)
      if (parsed.html) {
        bodyHtml = sanitizeHtml(parsed.html, {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']),
          allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            img: ['src', 'alt', 'width', 'height'],
            '*': ['style', 'class'],
          },
        })
      }
      if (parsed.text) bodyText = parsed.text.trim()
    }

    await client.messageFlagsAdd(String(uid), ['\\Seen'], { uid: true })
    return { ...msgMeta, bodyHtml, bodyText }
  } finally {
    await safeLogout(client)
  }
}
