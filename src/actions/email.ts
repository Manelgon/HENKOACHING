'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAction } from '@/lib/audit/log-action'
import { encryptText, decryptText } from '@/lib/crypto/encrypt'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' as const }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || profile.role !== 'admin') return { error: 'Sin permisos' as const }
  return { user, profile }
}

export type EmailConfigInput = {
  smtp_host: string
  smtp_port: number
  smtp_user: string
  smtp_password: string   // vacío = no cambiar la actual
  smtp_encryption: 'starttls' | 'ssl' | 'none'
  smtp_from_name: string
  imap_host: string
  imap_port: number
  imap_user: string
  imap_password: string   // vacío = no cambiar la actual
  imap_encryption: 'ssl' | 'starttls' | 'none'
}

export type EmailConfigPublic = {
  smtp_host: string | null
  smtp_port: number
  smtp_user: string | null
  smtp_encryption: string
  smtp_from_name: string | null
  hasSmtpPassword: boolean
  imap_host: string | null
  imap_port: number
  imap_user: string | null
  imap_encryption: string
  hasImapPassword: boolean
}

async function fetchSupabaseSmtpConfig(): Promise<Partial<EmailConfigPublic>> {
  const token = process.env.SUPABASE_ACCESS_TOKEN
  const ref = process.env.SUPABASE_PROJECT_REF
  if (!token || !ref) return {}

  try {
    const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/config/auth`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      cache: 'no-store',
    })
    if (!res.ok) return {}
    const data = await res.json() as Record<string, unknown>
    return {
      smtp_host: (data.smtp_host as string) || null,
      smtp_port: (data.smtp_port as number) || 587,
      smtp_user: (data.smtp_user as string) || null,
      smtp_encryption: (data.smtp_admin_email as string) ? 'starttls' : 'starttls',
      hasSmtpPassword: !!(data.smtp_pass as string),
    }
  } catch {
    return {}
  }
}

async function updateSupabaseSmtpConfig(input: EmailConfigInput, password: string) {
  const token = process.env.SUPABASE_ACCESS_TOKEN
  const ref = process.env.SUPABASE_PROJECT_REF
  if (!token || !ref) return { ok: false, error: 'SUPABASE_ACCESS_TOKEN o SUPABASE_PROJECT_REF no configurados' }

  const body: Record<string, unknown> = {
    smtp_host: input.smtp_host,
    smtp_port: input.smtp_port,
    smtp_user: input.smtp_user,
    smtp_sender_name: input.smtp_from_name,
  }
  if (password) body.smtp_pass = password

  try {
    const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/config/auth`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.text()
      return { ok: false, error: `Management API: ${err}` }
    }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

export async function getEmailConfig(): Promise<EmailConfigPublic> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('email_settings' as never)
    .select('*')
    .eq('id', 1)
    .maybeSingle() as { data: Record<string, unknown> | null }

  // Intentar pre-rellenar desde Supabase Management API si la DB local está vacía
  const supabaseConfig = (!data?.smtp_host) ? await fetchSupabaseSmtpConfig() : {}

  return {
    smtp_host: (data?.smtp_host as string | null) ?? (supabaseConfig.smtp_host ?? null),
    smtp_port: (data?.smtp_port as number | null) ?? (supabaseConfig.smtp_port ?? 587),
    smtp_user: (data?.smtp_user as string | null) ?? (supabaseConfig.smtp_user ?? null),
    smtp_encryption: (data?.smtp_encryption as string | null) ?? (supabaseConfig.smtp_encryption ?? 'starttls'),
    smtp_from_name: (data?.smtp_from_name as string | null) ?? null,
    hasSmtpPassword: !!(data?.smtp_password) || !!(supabaseConfig.hasSmtpPassword),
    imap_host: (data?.imap_host as string | null) ?? null,
    imap_port: (data?.imap_port as number | null) ?? 993,
    imap_user: (data?.imap_user as string | null) ?? null,
    imap_encryption: (data?.imap_encryption as string | null) ?? 'ssl',
    hasImapPassword: !!(data?.imap_password),
  }
}

export async function guardarEmailConfig(input: EmailConfigInput) {
  const auth = await requireAdmin()
  if ('error' in auth) return { error: auth.error }

  const admin = createAdminClient()

  // Leer passwords actuales si no se envían nuevas
  const { data: current } = await admin
    .from('email_settings' as never)
    .select('smtp_password, imap_password')
    .eq('id', 1)
    .maybeSingle() as { data: Record<string, string | null> | null }

  const smtpPassPlain = input.smtp_password || null
  const imapPassPlain = input.imap_password || null

  const update: Record<string, unknown> = {
    smtp_host: input.smtp_host.trim() || null,
    smtp_port: input.smtp_port,
    smtp_user: input.smtp_user.trim() || null,
    smtp_encryption: input.smtp_encryption,
    smtp_from_name: input.smtp_from_name.trim() || null,
    imap_host: input.imap_host.trim() || null,
    imap_port: input.imap_port,
    imap_user: input.imap_user.trim() || null,
    imap_encryption: input.imap_encryption,
    updated_at: new Date().toISOString(),
  }

  // Solo cifrar y guardar password si se envió una nueva
  if (smtpPassPlain) {
    update.smtp_password = encryptText(smtpPassPlain)
  } else if (current?.smtp_password) {
    update.smtp_password = current.smtp_password // mantener la existente
  }

  if (imapPassPlain) {
    update.imap_password = encryptText(imapPassPlain)
  } else if (current?.imap_password) {
    update.imap_password = current.imap_password // mantener la existente
  }

  const { error: dbError } = await admin
    .from('email_settings' as never)
    .update(update as never)
    .eq('id', 1)

  if (dbError) return { error: dbError.message }

  // Actualizar SMTP en Supabase Auth automáticamente
  const effectiveSmtpPass = smtpPassPlain || (current?.smtp_password ? decryptText(current.smtp_password) : '')
  const supabaseResult = await updateSupabaseSmtpConfig(input, effectiveSmtpPass)

  await logAction({
    accion: 'email.config.actualizar',
    recursoTipo: 'email_settings',
    recursoId: '1',
  })

  revalidatePath('/dashboard/email')

  return {
    ok: true,
    supabaseSync: supabaseResult.ok,
    supabaseSyncError: supabaseResult.ok ? undefined : supabaseResult.error,
  }
}

// Descifrar passwords para uso interno (solo en server)
async function getDecryptedPasswords(): Promise<{ smtp: string | null; imap: string | null; config: Record<string, unknown> | null }> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('email_settings' as never)
    .select('*')
    .eq('id', 1)
    .maybeSingle() as { data: Record<string, unknown> | null }

  return {
    smtp: data?.smtp_password ? decryptText(data.smtp_password as string) : null,
    imap: data?.imap_password ? decryptText(data.imap_password as string) : null,
    config: data,
  }
}

export async function listarCarpetasImap() {
  const auth = await requireAdmin()
  if ('error' in auth) return { error: auth.error }

  const { imap, config } = await getDecryptedPasswords()
  if (!config?.imap_host || !imap) return { error: 'Sin credenciales IMAP.' }

  try {
    const { listarCarpetas } = await import('@/features/email/services/imap')
    const folders = await listarCarpetas({
      host: config.imap_host as string,
      port: (config.imap_port as number) ?? 993,
      encryption: (config.imap_encryption as 'ssl' | 'starttls' | 'none') ?? 'ssl',
      user: config.imap_user as string,
      password: imap,
    })
    return { ok: true, folders }
  } catch (e) {
    return { error: `Error IMAP: ${String(e)}` }
  }
}

export async function listarEmailsBandeja(mailbox = 'INBOX') {
  const auth = await requireAdmin()
  if ('error' in auth) return { error: auth.error }

  const { imap, config } = await getDecryptedPasswords()

  if (!config?.imap_host || !imap) {
    return { error: 'No hay credenciales IMAP configuradas. Ve a Configuración para añadirlas.' }
  }

  try {
    const { listarMensajes } = await import('@/features/email/services/imap')
    const messages = await listarMensajes({
      host: config.imap_host as string,
      port: (config.imap_port as number) ?? 993,
      encryption: (config.imap_encryption as 'ssl' | 'starttls' | 'none') ?? 'ssl',
      user: config.imap_user as string,
      password: imap,
    }, mailbox)
    return { ok: true, messages }
  } catch (e) {
    return { error: `Error IMAP: ${String(e)}` }
  }
}

export async function leerEmailBandeja(uid: number, mailbox = 'INBOX') {
  const auth = await requireAdmin()
  if ('error' in auth) return { error: auth.error }

  const { imap, config } = await getDecryptedPasswords()

  if (!config?.imap_host || !imap) {
    return { error: 'No hay credenciales IMAP configuradas.' }
  }

  try {
    const { leerMensaje } = await import('@/features/email/services/imap')
    const detail = await leerMensaje({
      host: config.imap_host as string,
      port: (config.imap_port as number) ?? 993,
      encryption: (config.imap_encryption as 'ssl' | 'starttls' | 'none') ?? 'ssl',
      user: config.imap_user as string,
      password: imap,
    }, uid, mailbox)

    if (!detail) return { error: 'Mensaje no encontrado' }
    return { ok: true, detail }
  } catch (e) {
    return { error: `Error IMAP: ${String(e)}` }
  }
}

export type EnviarEmailInput = {
  to: string
  subject: string
  bodyText: string
  bodyHtml: string
  attachments?: { name: string; mimeType: string; base64: string }[]
}

export async function enviarEmail({ to, subject, bodyText, bodyHtml, attachments = [] }: EnviarEmailInput) {
  const auth = await requireAdmin()
  if ('error' in auth) return { error: auth.error }

  const { smtp, config } = await getDecryptedPasswords()

  if (!config?.smtp_host || !smtp) {
    return { error: 'No hay credenciales SMTP configuradas. Ve a Configuración para añadirlas.' }
  }

  try {
    const nodemailer = await import('nodemailer')
    const transporter = nodemailer.createTransport({
      host: config.smtp_host as string,
      port: (config.smtp_port as number) ?? 587,
      secure: (config.smtp_encryption as string) === 'ssl',
      auth: { user: config.smtp_user as string, pass: smtp },
      tls: { rejectUnauthorized: false },
    })

    const fromName = (config.smtp_from_name as string) || (config.smtp_user as string)
    await transporter.sendMail({
      from: `"${fromName}" <${config.smtp_user as string}>`,
      to,
      subject,
      text: bodyText,
      html: bodyHtml,
      attachments: attachments.map((a) => ({
        filename: a.name,
        content: Buffer.from(a.base64, 'base64'),
        contentType: a.mimeType,
      })),
    })

    await logAction({ accion: 'email.enviar', recursoTipo: 'email', recursoId: to, metadata: { subject, adjuntos: attachments.length } })
    return { ok: true }
  } catch (e) {
    return { error: `Error SMTP: ${String(e)}` }
  }
}
