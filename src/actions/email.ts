'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAction } from '@/lib/audit/log-action'
import { encryptText, decryptText } from '@/lib/crypto/encrypt'
import { templateCandidaturaCandidato, templateCandidaturaAdmin } from '@/lib/email/templates/candidatura'
import { templateLeadConfirmacion } from '@/lib/email/templates/lead'

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
  subject_confirmation: string
  subject_recovery: string
  subject_invite: string
  subject_magic_link: string
  template_confirmation: string
  template_recovery: string
  template_invite: string
  template_magic_link: string
  subject_candidatura_candidato: string
  template_candidatura_candidato: string
  subject_candidatura_admin: string
  template_candidatura_admin: string
  subject_cambio_estado: string
  template_cambio_estado: string
  subject_lead_confirmacion: string
  template_lead_confirmacion: string
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
  subject_confirmation: string
  subject_recovery: string
  subject_invite: string
  subject_magic_link: string
  template_confirmation: string
  template_recovery: string
  template_invite: string
  template_magic_link: string
  subject_candidatura_candidato: string
  template_candidatura_candidato: string
  subject_candidatura_admin: string
  template_candidatura_admin: string
  subject_cambio_estado: string
  template_cambio_estado: string
  subject_lead_confirmacion: string
  template_lead_confirmacion: string
}

// ── Defaults para templates transaccionales del portal de empleo ──────────────

const SITE_URL_DEFAULT = 'https://henkoaching.com'

const DEFAULT_SUBJECT_CANDIDATURA_CANDIDATO = 'Tu candidatura ha sido recibida — {{ofertaTitulo}}'
const DEFAULT_SUBJECT_CANDIDATURA_ADMIN = 'Nueva candidatura — {{candidatoNombre}}'
const DEFAULT_SUBJECT_CAMBIO_ESTADO = 'Actualización de tu candidatura — {{ofertaTitulo}}'
const DEFAULT_SUBJECT_LEAD_CONFIRMACION = 'Hemos recibido tu mensaje · HenKoaching'

const DEFAULT_TEMPLATE_CANDIDATURA_CANDIDATO = templateCandidaturaCandidato({
  candidatoNombre: '{{candidatoNombre}}',
  ofertaTitulo: '{{ofertaTitulo}}',
  empresaNombre: '{{empresaNombre}}',
  siteUrl: SITE_URL_DEFAULT,
})

const DEFAULT_TEMPLATE_CANDIDATURA_ADMIN = templateCandidaturaAdmin({
  candidatoNombre: '{{candidatoNombre}}',
  candidatoEmail: '{{candidatoEmail}}',
  ofertaTitulo: '{{ofertaTitulo}}',
  perfilUrl: '{{perfilUrl}}',
  siteUrl: SITE_URL_DEFAULT,
})

const DEFAULT_TEMPLATE_CAMBIO_ESTADO = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0ece6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ece6;padding:48px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:560px;width:100%;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="padding:36px 48px 28px;border-bottom:1px solid #ede9e4;text-align:center;">
            <img src="${SITE_URL_DEFAULT}/henkologo.png" width="180" alt="HenKoaching" style="display:block;margin:0 auto;max-width:180px;">
          </td>
        </tr>
        <tr>
          <td style="padding:40px 48px;">
            <div style="display:inline-block;background:#1f8f9b1a;color:#1f8f9b;font-family:Arial,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding:4px 10px;border-radius:4px;margin:0 0 20px;">{{estadoLabel}}</div>
            <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:26px;font-weight:700;color:#1a1a1a;line-height:1.3;">Actualización de<br>tu candidatura</h1>
            <p style="margin:0 0 20px;font-family:Arial,sans-serif;font-size:15px;color:#444;line-height:1.7;">Hola {{candidatoNombre}},</p>
            <div style="background:#f8f9fa;border-left:3px solid #1f8f9b;border-radius:0 8px 8px 0;padding:16px 20px;margin:0 0 24px;">
              <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;">Oferta</p>
              <p style="margin:0;font-family:Arial,sans-serif;font-size:15px;color:#1a1a1a;font-weight:600;">{{ofertaTitulo}}</p>
            </div>
            <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:15px;color:#444;line-height:1.7;">Hemos actualizado el estado de tu candidatura. Puedes consultar todos los detalles en tu área personal.</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#aaa;line-height:1.6;">Si tienes alguna pregunta, no dudes en contactarnos.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 48px;border-top:1px solid #ede9e4;background:#faf8f5;">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#aaa;line-height:1.6;text-align:center;">HenKoaching · Jennifer Cervera · <a href="${SITE_URL_DEFAULT}" style="color:#1f8f9b;text-decoration:none;">henkoaching.com</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

const DEFAULT_TEMPLATE_LEAD_CONFIRMACION = templateLeadConfirmacion({
  nombre: '{{nombre}}',
  asunto: '{{asunto}}',
  servicio: '{{servicio}}',
  siteUrl: SITE_URL_DEFAULT,
})

// ──────────────────────────────────────────────────────────────────────────────

const DEFAULT_TEMPLATE_CONFIRMATION = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Confirma tu cuenta</title></head>
<body style="margin:0;padding:0;background:#f0ece6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ece6;padding:48px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:560px;width:100%;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="padding:36px 48px 28px;border-bottom:1px solid #ede9e4;text-align:center;">
            <img src="https://henkoaching.com/henkologo.png" width="180" alt="HenKoaching" style="display:block;margin:0 auto;max-width:180px;">
          </td>
        </tr>
        <tr>
          <td style="padding:40px 48px;">
            <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:26px;font-weight:700;color:#1a1a1a;line-height:1.3;">Bienvenida,<br>confirma tu cuenta</h1>
            <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:14px;color:#777;line-height:1.6;">Has creado una cuenta con el email:</p>
            <p style="margin:0 0 28px;font-family:Arial,sans-serif;font-size:14px;color:#1f8f9b;font-weight:600;">{{ .Email }}</p>
            <p style="margin:0 0 32px;font-family:Arial,sans-serif;font-size:15px;color:#444;line-height:1.7;">Haz clic en el botón para confirmar tu cuenta y acceder a tu área personal de HenKoaching.</p>
            <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#1f8f9b;color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:8px;letter-spacing:0.3px;">Confirmar mi cuenta</a>
            <p style="margin:32px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#aaa;line-height:1.6;">Si no creaste esta cuenta, puedes ignorar este email.<br>El enlace expira en 24 horas.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 48px;border-top:1px solid #ede9e4;background:#faf8f5;">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#aaa;line-height:1.6;text-align:center;">HenKoaching · Jennifer Cervera · <a href="{{ .SiteURL }}" style="color:#1f8f9b;text-decoration:none;">henkoaching.com</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

const DEFAULT_TEMPLATE_RECOVERY = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Recupera tu contraseña</title></head>
<body style="margin:0;padding:0;background:#f0ece6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ece6;padding:48px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:560px;width:100%;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="padding:36px 48px 28px;border-bottom:1px solid #ede9e4;text-align:center;">
            <img src="{{ .SiteURL }}/henkologo.png" width="180" alt="HenKoaching" style="display:block;margin:0 auto;max-width:180px;">
          </td>
        </tr>
        <tr>
          <td style="padding:40px 48px;">
            <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:26px;font-weight:700;color:#1a1a1a;line-height:1.3;">Recupera tu<br>contraseña</h1>
            <p style="margin:0 0 32px;font-family:Arial,sans-serif;font-size:15px;color:#444;line-height:1.7;">Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón para crear una nueva contraseña.</p>
            <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#1f8f9b;color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:8px;letter-spacing:0.3px;">Restablecer contraseña</a>
            <p style="margin:32px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#aaa;line-height:1.6;">Si no solicitaste este cambio, puedes ignorar este email.<br>El enlace expira en 1 hora.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 48px;border-top:1px solid #ede9e4;background:#faf8f5;">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#aaa;line-height:1.6;text-align:center;">HenKoaching · Jennifer Cervera · <a href="{{ .SiteURL }}" style="color:#1f8f9b;text-decoration:none;">henkoaching.com</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

const DEFAULT_TEMPLATE_INVITE = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Invitación a HenKoaching</title></head>
<body style="margin:0;padding:0;background:#f0ece6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ece6;padding:48px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:560px;width:100%;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="padding:36px 48px 28px;border-bottom:1px solid #ede9e4;text-align:center;">
            <img src="{{ .SiteURL }}/henkologo.png" width="180" alt="HenKoaching" style="display:block;margin:0 auto;max-width:180px;">
          </td>
        </tr>
        <tr>
          <td style="padding:40px 48px;">
            <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:26px;font-weight:700;color:#1a1a1a;line-height:1.3;">Tienes una<br>invitación</h1>
            <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:14px;color:#777;line-height:1.6;">Has sido invitada a unirte a HenKoaching con el email:</p>
            <p style="margin:0 0 28px;font-family:Arial,sans-serif;font-size:14px;color:#1f8f9b;font-weight:600;">{{ .Email }}</p>
            <p style="margin:0 0 32px;font-family:Arial,sans-serif;font-size:15px;color:#444;line-height:1.7;">Acepta la invitación para crear tu cuenta y acceder a tu área personal.</p>
            <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#1f8f9b;color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:8px;letter-spacing:0.3px;">Aceptar invitación</a>
            <p style="margin:32px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#aaa;line-height:1.6;">Si no esperabas esta invitación, puedes ignorar este email.<br>El enlace expira en 24 horas.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 48px;border-top:1px solid #ede9e4;background:#faf8f5;">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#aaa;line-height:1.6;text-align:center;">HenKoaching · Jennifer Cervera · <a href="{{ .SiteURL }}" style="color:#1f8f9b;text-decoration:none;">henkoaching.com</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

const DEFAULT_TEMPLATE_MAGIC_LINK = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Tu enlace de acceso</title></head>
<body style="margin:0;padding:0;background:#f0ece6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ece6;padding:48px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:560px;width:100%;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="padding:36px 48px 28px;border-bottom:1px solid #ede9e4;text-align:center;">
            <img src="{{ .SiteURL }}/henkologo.png" width="180" alt="HenKoaching" style="display:block;margin:0 auto;max-width:180px;">
          </td>
        </tr>
        <tr>
          <td style="padding:40px 48px;">
            <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:26px;font-weight:700;color:#1a1a1a;line-height:1.3;">Tu enlace<br>de acceso</h1>
            <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:14px;color:#777;line-height:1.6;">Solicitaste acceder a HenKoaching con:</p>
            <p style="margin:0 0 28px;font-family:Arial,sans-serif;font-size:14px;color:#1f8f9b;font-weight:600;">{{ .Email }}</p>
            <p style="margin:0 0 32px;font-family:Arial,sans-serif;font-size:15px;color:#444;line-height:1.7;">Haz clic en el botón para iniciar sesión directamente, sin necesidad de contraseña.</p>
            <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#1f8f9b;color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:8px;letter-spacing:0.3px;">Iniciar sesión</a>
            <p style="margin:32px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#aaa;line-height:1.6;">Si no solicitaste este enlace, puedes ignorar este email.<br>El enlace expira en 1 hora y solo puede usarse una vez.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 48px;border-top:1px solid #ede9e4;background:#faf8f5;">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#aaa;line-height:1.6;text-align:center;">HenKoaching · Jennifer Cervera · <a href="{{ .SiteURL }}" style="color:#1f8f9b;text-decoration:none;">henkoaching.com</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

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
    mailer_subjects_confirmation: input.subject_confirmation,
    mailer_subjects_recovery: input.subject_recovery,
    mailer_subjects_invite: input.subject_invite,
    mailer_subjects_magic_link: input.subject_magic_link,
    mailer_templates_confirmation_content: input.template_confirmation,
    mailer_templates_recovery_content: input.template_recovery,
    mailer_templates_invite_content: input.template_invite,
    mailer_templates_magic_link_content: input.template_magic_link,
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
    subject_confirmation: (data?.subject_confirmation as string | null) ?? 'Confirma tu cuenta en HenKoaching',
    subject_recovery: (data?.subject_recovery as string | null) ?? 'Recupera tu contraseña de HenKoaching',
    subject_invite: (data?.subject_invite as string | null) ?? 'Te invitan a unirse a HenKoaching',
    subject_magic_link: (data?.subject_magic_link as string | null) ?? 'Tu enlace de acceso a HenKoaching',
    template_confirmation: (data?.template_confirmation as string | null) ?? DEFAULT_TEMPLATE_CONFIRMATION,
    template_recovery: (data?.template_recovery as string | null) ?? DEFAULT_TEMPLATE_RECOVERY,
    template_invite: (data?.template_invite as string | null) ?? DEFAULT_TEMPLATE_INVITE,
    template_magic_link: (data?.template_magic_link as string | null) ?? DEFAULT_TEMPLATE_MAGIC_LINK,
    subject_candidatura_candidato: (data?.subject_candidatura_candidato as string | null) ?? DEFAULT_SUBJECT_CANDIDATURA_CANDIDATO,
    template_candidatura_candidato: (data?.template_candidatura_candidato as string | null) ?? DEFAULT_TEMPLATE_CANDIDATURA_CANDIDATO,
    subject_candidatura_admin: (data?.subject_candidatura_admin as string | null) ?? DEFAULT_SUBJECT_CANDIDATURA_ADMIN,
    template_candidatura_admin: (data?.template_candidatura_admin as string | null) ?? DEFAULT_TEMPLATE_CANDIDATURA_ADMIN,
    subject_cambio_estado: (data?.subject_cambio_estado as string | null) ?? DEFAULT_SUBJECT_CAMBIO_ESTADO,
    template_cambio_estado: (data?.template_cambio_estado as string | null) ?? DEFAULT_TEMPLATE_CAMBIO_ESTADO,
    subject_lead_confirmacion: (data?.subject_lead_confirmacion as string | null) ?? DEFAULT_SUBJECT_LEAD_CONFIRMACION,
    template_lead_confirmacion: (data?.template_lead_confirmacion as string | null) ?? DEFAULT_TEMPLATE_LEAD_CONFIRMACION,
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
    subject_confirmation: input.subject_confirmation.trim() || 'Confirma tu cuenta en HenKoaching',
    subject_recovery: input.subject_recovery.trim() || 'Recupera tu contraseña de HenKoaching',
    subject_invite: input.subject_invite.trim() || 'Te invitan a unirse a HenKoaching',
    subject_magic_link: input.subject_magic_link.trim() || 'Tu enlace de acceso a HenKoaching',
    template_confirmation: input.template_confirmation || DEFAULT_TEMPLATE_CONFIRMATION,
    template_recovery: input.template_recovery || DEFAULT_TEMPLATE_RECOVERY,
    template_invite: input.template_invite || DEFAULT_TEMPLATE_INVITE,
    template_magic_link: input.template_magic_link || DEFAULT_TEMPLATE_MAGIC_LINK,
    subject_candidatura_candidato: input.subject_candidatura_candidato.trim() || null,
    template_candidatura_candidato: input.template_candidatura_candidato.trim() || null,
    subject_candidatura_admin: input.subject_candidatura_admin.trim() || null,
    template_candidatura_admin: input.template_candidatura_admin.trim() || null,
    subject_cambio_estado: input.subject_cambio_estado.trim() || null,
    template_cambio_estado: input.template_cambio_estado.trim() || null,
    subject_lead_confirmacion: input.subject_lead_confirmacion.trim() || null,
    template_lead_confirmacion: input.template_lead_confirmacion.trim() || null,
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

// =============================================================================
// Emails transaccionales: fallos y reintento
// =============================================================================

export type EmailFallido = {
  id: string
  para: string
  asunto: string
  tipo: string | null
  error: string | null
  intentos: number
  created_at: string
}

export async function listarEmailsFallidos(): Promise<EmailFallido[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('email_envios' as never)
    .select('id, para, asunto, tipo, error, intentos, created_at')
    .eq('estado', 'error')
    .order('created_at', { ascending: false })
    .limit(100) as { data: EmailFallido[] | null }
  return data ?? []
}

export async function contarEmailsFallidos(): Promise<number> {
  const admin = createAdminClient()
  const { count } = await admin
    .from('email_envios' as never)
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'error')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) as { count: number | null }
  return count ?? 0
}

export async function reintentarEmail(id: string): Promise<{ ok: true } | { error: string }> {
  const auth = await requireAdmin()
  if ('error' in auth) return { error: auth.error as string }

  const admin = createAdminClient()

  const { data: registro } = await admin
    .from('email_envios' as never)
    .select('para, asunto, html, intentos')
    .eq('id', id)
    .single() as { data: { para: string; asunto: string; html: string; intentos: number } | null }

  if (!registro) return { error: 'Registro no encontrado' }

  // Marcar como pendiente e incrementar intentos
  const { error: pendienteError } = await admin
    .from('email_envios' as never)
    .update({ estado: 'pendiente', error: null, intentos: registro.intentos + 1 } as never)
    .eq('id', id)
  if (pendienteError) return { error: 'Error actualizando estado: ' + (pendienteError as { message: string }).message }

  // Leer credenciales SMTP
  const { data: settings } = await admin
    .from('email_settings' as never)
    .select('*')
    .eq('id', 1)
    .maybeSingle() as { data: Record<string, unknown> | null }

  if (!settings?.smtp_host || !settings?.smtp_password) {
    const msg = 'SMTP no configurado'
    await admin.from('email_envios' as never).update({ estado: 'error', error: msg } as never).eq('id', id)
    return { error: msg }
  }

  let smtpPass: string
  try {
    smtpPass = decryptText(settings.smtp_password as string)
  } catch {
    const msg = 'No se pudo descifrar la contraseña SMTP'
    await admin.from('email_envios' as never).update({ estado: 'error', error: msg } as never).eq('id', id)
    return { error: msg }
  }

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
      to: registro.para,
      subject: registro.asunto,
      html: registro.html,
    })

    const { error: enviadoError } = await admin
      .from('email_envios' as never)
      .update({ estado: 'enviado', sent_at: new Date().toISOString() } as never)
      .eq('id', id)
    if (enviadoError) console.error('Error marcando email como enviado:', (enviadoError as { message: string }).message)

    await logAction({
      accion: 'email.transaccional.reintento_ok',
      recursoTipo: 'email_envios',
      recursoId: id,
      recursoLabel: registro.para,
    })

    return { ok: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    await admin.from('email_envios' as never).update({ estado: 'error', error: msg } as never).eq('id', id)
    await logAction({
      accion: 'email.transaccional.reintento_error',
      recursoTipo: 'email_envios',
      recursoId: id,
      recursoLabel: registro.para,
      metadata: { error: msg },
    })
    return { error: msg }
  }
}
