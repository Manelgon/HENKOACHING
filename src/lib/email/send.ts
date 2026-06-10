import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { decryptText } from '@/lib/crypto/encrypt'
import { logAction } from '@/lib/audit/log-action'

export type SendEmailInput = {
  to: string
  subject: string
  html: string
  tipo: string
  metadata?: Record<string, unknown>
}

export async function sendTransactional(input: SendEmailInput): Promise<void> {
  const admin = createAdminClient()

  // 1. Registrar intento en email_envios
  const { data: registro } = await admin
    .from('email_envios' as never)
    .insert({
      para: input.to,
      asunto: input.subject,
      html: input.html,
      tipo: input.tipo,
      metadata: input.metadata ?? {},
      estado: 'pendiente',
      intentos: 1,
    } as never)
    .select('id')
    .single() as { data: { id: string } | null }

  const registroId = registro?.id ?? null

  // 2. Leer credenciales SMTP
  const { data: settings } = await admin
    .from('email_settings' as never)
    .select('*')
    .eq('id', 1)
    .maybeSingle() as { data: Record<string, unknown> | null }

  if (!settings?.smtp_host || !settings?.smtp_password) {
    const msg = 'SMTP no configurado en email_settings'
    await _markError(registroId, msg)
    console.warn('[email] sendTransactional: ' + msg)
    return
  }

  let smtpPass: string
  try {
    smtpPass = decryptText(settings.smtp_password as string)
  } catch {
    const msg = 'No se pudo descifrar la contraseña SMTP'
    await _markError(registroId, msg)
    console.error('[email] ' + msg)
    return
  }

  // 3. Enviar con nodemailer
  try {
    const nodemailer = await import('nodemailer')
    const transporter = nodemailer.createTransport({
      host: settings.smtp_host as string,
      port: (settings.smtp_port as number) ?? 465,
      secure: (settings.smtp_encryption as string) === 'ssl',
      auth: { user: settings.smtp_user as string, pass: smtpPass },
      tls: { rejectUnauthorized: false },
    })

    const fromName = (settings.smtp_from_name as string) || (settings.smtp_user as string)
    await transporter.sendMail({
      from: `"${fromName}" <${settings.smtp_user as string}>`,
      to: input.to,
      subject: input.subject,
      html: input.html,
    })

    // 4a. Marcar como enviado
    if (registroId) {
      const { error: updateError } = await admin
        .from('email_envios' as never)
        .update({ estado: 'enviado', sent_at: new Date().toISOString() } as never)
        .eq('id', registroId)
      // Si el envío SMTP fue correcto pero no pudimos persistir el estado,
      // dejamos rastro: el registro quedaría como 'pendiente' y sería invisible
      // al panel de reintentos, así que al menos lo registramos en consola.
      if (updateError) {
        console.error('[email] Enviado a', input.to, 'pero falló marcar como enviado:', updateError.message)
      }
    }

    await logAction({
      accion: 'email.transaccional.enviado',
      recursoTipo: 'email_envios',
      recursoId: registroId,
      recursoLabel: input.to,
      metadata: { tipo: input.tipo, asunto: input.subject },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await _markError(registroId, msg)
    await logAction({
      accion: 'email.transaccional.error',
      recursoTipo: 'email_envios',
      recursoId: registroId,
      recursoLabel: input.to,
      metadata: { tipo: input.tipo, error: msg },
    })
    console.error('[email] Error enviando a', input.to, ':', msg)
  }
}

async function _markError(id: string | null, msg: string) {
  if (!id) return
  const admin = createAdminClient()
  await admin
    .from('email_envios' as never)
    .update({ estado: 'error', error: msg } as never)
    .eq('id', id)
}
