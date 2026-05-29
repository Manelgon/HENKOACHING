'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAction } from '@/shared/feedback/FeedbackContext'
import { guardarEmailConfig, type EmailConfigInput, type EmailConfigPublic } from '@/actions/email'

type Props = {
  config: EmailConfigPublic
}

export default function EmailConfigForm({ config }: Props) {
  const router = useRouter()
  const runAction = useAction()

  const [datos, setDatos] = useState<EmailConfigInput>({
    smtp_host: config.smtp_host ?? '',
    smtp_port: config.smtp_port,
    smtp_user: config.smtp_user ?? '',
    smtp_password: '',
    smtp_encryption: (config.smtp_encryption as EmailConfigInput['smtp_encryption']) ?? 'starttls',
    smtp_from_name: config.smtp_from_name ?? '',
    imap_host: config.imap_host ?? '',
    imap_port: config.imap_port,
    imap_user: config.imap_user ?? '',
    imap_password: '',
    imap_encryption: (config.imap_encryption as EmailConfigInput['imap_encryption']) ?? 'ssl',
  })

  const set = <K extends keyof EmailConfigInput>(key: K, value: EmailConfigInput[K]) =>
    setDatos((prev) => ({ ...prev, [key]: value }))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const r = await runAction('Guardando configuración de email', () => guardarEmailConfig(datos), {
      successMessage: 'Configuración guardada',
    })
    if (r.ok) {
      const data = r.data
      if ('supabaseSyncError' in data && data.supabaseSyncError) {
        console.warn('Supabase sync warning:', data.supabaseSyncError)
      }
      router.refresh()
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* SMTP */}
      <Section
        title="Configuración SMTP"
        description="Servidor de envío de emails. Se usará para enviar notificaciones, verificaciones de cuenta y recuperación de contraseña."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Servidor SMTP" wide>
            <input
              type="text"
              value={datos.smtp_host}
              onChange={(e) => set('smtp_host', e.target.value)}
              placeholder="mail.piensasolutions.com"
              className="input"
            />
          </Field>
          <Field label="Puerto">
            <input
              type="number"
              value={datos.smtp_port}
              onChange={(e) => set('smtp_port', Number(e.target.value))}
              placeholder="587"
              className="input"
            />
          </Field>
          <Field label="Cifrado">
            <select
              value={datos.smtp_encryption}
              onChange={(e) => set('smtp_encryption', e.target.value as EmailConfigInput['smtp_encryption'])}
              className="input"
            >
              <option value="starttls">STARTTLS (recomendado, puerto 587)</option>
              <option value="ssl">SSL/TLS (puerto 465)</option>
              <option value="none">Sin cifrado (no recomendado)</option>
            </select>
          </Field>
          <Field label="Usuario SMTP">
            <input
              type="text"
              value={datos.smtp_user}
              onChange={(e) => set('smtp_user', e.target.value)}
              placeholder="info@henkoaching.com"
              className="input"
            />
          </Field>
          <Field label="Contraseña SMTP">
            <input
              type="password"
              value={datos.smtp_password}
              onChange={(e) => set('smtp_password', e.target.value)}
              placeholder={config.hasSmtpPassword ? '••••••••  (dejar vacío para no cambiar)' : 'Contraseña del email'}
              className="input"
              autoComplete="new-password"
            />
          </Field>
          <Field label="Nombre del remitente">
            <input
              type="text"
              value={datos.smtp_from_name}
              onChange={(e) => set('smtp_from_name', e.target.value)}
              placeholder="Jennifer Cervera · Henkoaching"
              className="input"
            />
          </Field>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <p className="font-raleway text-xs text-blue-700 font-semibold mb-1">Sincronización automática con Supabase</p>
          <p className="font-raleway text-xs text-blue-600">
            Al guardar, la configuración SMTP se aplicará automáticamente en Supabase para que los emails de
            verificación y recuperación de contraseña se envíen desde este servidor.
          </p>
        </div>
      </Section>

      {/* IMAP */}
      <Section
        title="Configuración IMAP"
        description="Servidor de recepción de emails. Permite ver la bandeja de entrada de info@henkoaching.com desde este panel."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Servidor IMAP" wide>
            <input
              type="text"
              value={datos.imap_host}
              onChange={(e) => set('imap_host', e.target.value)}
              placeholder="mail.piensasolutions.com"
              className="input"
            />
          </Field>
          <Field label="Puerto">
            <input
              type="number"
              value={datos.imap_port}
              onChange={(e) => set('imap_port', Number(e.target.value))}
              placeholder="993"
              className="input"
            />
          </Field>
          <Field label="Cifrado">
            <select
              value={datos.imap_encryption}
              onChange={(e) => set('imap_encryption', e.target.value as EmailConfigInput['imap_encryption'])}
              className="input"
            >
              <option value="ssl">SSL/TLS (recomendado, puerto 993)</option>
              <option value="starttls">STARTTLS (puerto 143)</option>
              <option value="none">Sin cifrado (no recomendado)</option>
            </select>
          </Field>
          <Field label="Usuario IMAP">
            <input
              type="text"
              value={datos.imap_user}
              onChange={(e) => set('imap_user', e.target.value)}
              placeholder="info@henkoaching.com"
              className="input"
            />
          </Field>
          <Field label="Contraseña IMAP">
            <input
              type="password"
              value={datos.imap_password}
              onChange={(e) => set('imap_password', e.target.value)}
              placeholder={config.hasImapPassword ? '••••••••  (dejar vacío para no cambiar)' : 'Contraseña del email'}
              className="input"
              autoComplete="new-password"
            />
          </Field>
        </div>
      </Section>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-henko-turquoise text-white font-raleway font-semibold text-sm hover:bg-henko-turquoise-light transition-colors"
        >
          Guardar configuración
        </button>
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border-radius: 0.75rem;
          border: 1px solid rgb(229, 231, 235);
          background: rgb(249, 250, 251);
          font-family: var(--font-raleway), Raleway, sans-serif;
          font-size: 0.875rem;
          color: rgb(17, 24, 39);
          outline: none;
          transition: border-color 0.15s, background 0.15s;
        }
        :global(.input:focus) {
          border-color: #1f8f9b;
          background: #fff;
        }
      `}</style>
    </form>
  )
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-8">
      <h2 className="font-roxborough text-xl text-gray-900 mb-1">{title}</h2>
      {description && <p className="font-raleway text-gray-500 text-sm font-light mb-6">{description}</p>}
      {children}
    </section>
  )
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <label className={`block ${wide ? 'md:col-span-2' : ''}`}>
      <span className="font-raleway text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
        {label}
      </span>
      {children}
    </label>
  )
}
