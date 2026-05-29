import 'server-only'
import { ImapFlow } from 'imapflow'
import sanitizeHtml from 'sanitize-html'
import type { EmailMessage, EmailDetail } from '../types'

type ImapCredentials = {
  host: string
  port: number
  encryption: 'ssl' | 'starttls' | 'none'
  user: string
  password: string
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
  // Evitar que errores de socket propaguen como uncaughtException
  client.on('error', () => { /* manejado en connect() */ })
  return client
}

async function safeLogout(client: ImapFlow) {
  try { await client.logout() } catch { /* ignorar error al cerrar */ }
}

export async function listarMensajes(creds: ImapCredentials, limit = 50): Promise<EmailMessage[]> {
  const client = buildClient(creds)
  await client.connect()

  const messages: EmailMessage[] = []

  try {
    await client.mailboxOpen('INBOX')

    const status = await client.status('INBOX', { messages: true })
    const total = status.messages ?? 0
    if (total === 0) return []

    const from = Math.max(1, total - limit + 1)
    const range = `${from}:${total}`

    for await (const msg of client.fetch(range, {
      uid: true,
      flags: true,
      envelope: true,
      bodyStructure: false,
      internalDate: true,
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

export async function leerMensaje(creds: ImapCredentials, uid: number): Promise<EmailDetail | null> {
  const client = buildClient(creds)
  await client.connect()

  try {
    await client.mailboxOpen('INBOX')

    let bodyHtml: string | null = null
    let bodyText: string | null = null
    let msgMeta: EmailMessage | null = null

    for await (const msg of client.fetch(`${uid}`, {
      uid: true,
      flags: true,
      envelope: true,
      internalDate: true,
      source: true,
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

      // Parsear el source para extraer HTML/texto
      if (msg.source) {
        const raw = msg.source.toString('utf8')
        const htmlMatch = raw.match(/Content-Type: text\/html[^]*?\r\n\r\n([\s\S]*?)(?:\r\n--|\r\n\r\n--|$)/i)
        const textMatch = raw.match(/Content-Type: text\/plain[^]*?\r\n\r\n([\s\S]*?)(?:\r\n--|\r\n\r\n--|$)/i)

        if (htmlMatch?.[1]) {
          bodyHtml = sanitizeHtml(htmlMatch[1], {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']),
            allowedAttributes: {
              ...sanitizeHtml.defaults.allowedAttributes,
              img: ['src', 'alt', 'width', 'height'],
              '*': ['style', 'class'],
            },
          })
        }
        if (textMatch?.[1]) {
          bodyText = textMatch[1].trim()
        }
      }

      // Marcar como leído
      await client.messageFlagsAdd(`${uid}`, ['\\Seen'], { uid: true })
    }

    if (!msgMeta) return null
    return { ...msgMeta, bodyHtml, bodyText }
  } finally {
    await safeLogout(client)
  }
}
