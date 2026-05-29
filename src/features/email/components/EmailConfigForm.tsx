'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAction } from '@/shared/feedback/FeedbackContext'
import { guardarEmailConfig, type EmailConfigInput, type EmailConfigPublic } from '@/actions/email'

type Tab = 'credenciales' | 'templates'

type Props = {
  config: EmailConfigPublic
}

export default function EmailConfigForm({ config }: Props) {
  const router = useRouter()
  const runAction = useAction()
  const [activeTab, setActiveTab] = useState<Tab>('credenciales')
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)

  function openPreview(html: string) {
    const rendered = html
      .replaceAll('{{ .SiteURL }}', 'https://henkoaching.com')
      .replaceAll('{{ .ConfirmationURL }}', '#')
      .replaceAll('{{ .Email }}', 'jennifer@henkoaching.com')
    setPreviewHtml(rendered)
  }

  function openPreviewTransaccional(html: string, vars: Record<string, string>) {
    const rendered = Object.entries(vars).reduce(
      (t, [k, v]) => t.replaceAll(`{{${k}}}`, v),
      html,
    )
    setPreviewHtml(rendered)
  }

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
    subject_confirmation: config.subject_confirmation,
    subject_recovery: config.subject_recovery,
    subject_invite: config.subject_invite,
    subject_magic_link: config.subject_magic_link,
    template_confirmation: config.template_confirmation,
    template_recovery: config.template_recovery,
    template_invite: config.template_invite,
    template_magic_link: config.template_magic_link,
    subject_candidatura_candidato: config.subject_candidatura_candidato,
    template_candidatura_candidato: config.template_candidatura_candidato,
    subject_candidatura_admin: config.subject_candidatura_admin,
    template_candidatura_admin: config.template_candidatura_admin,
    subject_cambio_estado: config.subject_cambio_estado,
    template_cambio_estado: config.template_cambio_estado,
  })

  const set = <K extends keyof EmailConfigInput>(key: K, value: EmailConfigInput[K]) =>
    setDatos((prev) => ({ ...prev, [key]: value }))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const r = await runAction('Guardando configuración de email', () => guardarEmailConfig(datos), {
      successMessage: 'Configuración guardada y sincronizada con Supabase',
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
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 w-fit">
        <TabButton active={activeTab === 'credenciales'} onClick={() => setActiveTab('credenciales')}>
          Credenciales
        </TabButton>
        <TabButton active={activeTab === 'templates'} onClick={() => setActiveTab('templates')}>
          Templates de email
        </TabButton>
      </div>

      {/* ── TAB: CREDENCIALES ── */}
      {activeTab === 'credenciales' && (
        <div className="space-y-8">
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
                Al guardar, la configuración SMTP y los templates se aplicarán automáticamente en Supabase.
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
        </div>
      )}

      {/* ── TAB: TEMPLATES ── */}
      {activeTab === 'templates' && (
        <div className="space-y-8">
          {/* Variables help - Auth */}
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <p className="font-raleway text-xs text-amber-800 font-semibold mb-2">Variables disponibles — Templates de autenticación (Supabase)</p>
            <div className="flex flex-wrap gap-2">
              {['{{ .ConfirmationURL }}', '{{ .Email }}', '{{ .SiteURL }}'].map((v) => (
                <code key={v} className="bg-amber-100 text-amber-900 font-mono text-xs px-2 py-1 rounded-md">{v}</code>
              ))}
            </div>
            <p className="font-raleway text-xs text-amber-700 mt-2">
              Supabase reemplazará estas variables automáticamente al enviar el email.
            </p>
          </div>

          <div className="space-y-3">
            <TemplateAccordion title="Email de confirmación de cuenta" description="Se envía cuando un usuario se registra.">
              <div className="space-y-4">
                <Field label="Asunto del email">
                  <input type="text" value={datos.subject_confirmation} onChange={(e) => set('subject_confirmation', e.target.value)} className="input" />
                </Field>
                <Field label="HTML del template">
                  <textarea value={datos.template_confirmation} onChange={(e) => set('template_confirmation', e.target.value)} rows={20} className="input font-mono text-xs resize-y" spellCheck={false} />
                </Field>
                <div className="flex justify-end">
                  <button type="button" onClick={() => openPreview(datos.template_confirmation)} className="px-4 py-2 rounded-xl border border-gray-200 bg-white font-raleway text-sm text-gray-700 hover:bg-gray-50 transition-colors">Ver preview</button>
                </div>
              </div>
            </TemplateAccordion>

            <TemplateAccordion title="Email de recuperación de contraseña" description="Se envía cuando un usuario solicita restablecer su contraseña.">
              <div className="space-y-4">
                <Field label="Asunto del email">
                  <input type="text" value={datos.subject_recovery} onChange={(e) => set('subject_recovery', e.target.value)} className="input" />
                </Field>
                <Field label="HTML del template">
                  <textarea value={datos.template_recovery} onChange={(e) => set('template_recovery', e.target.value)} rows={20} className="input font-mono text-xs resize-y" spellCheck={false} />
                </Field>
                <div className="flex justify-end">
                  <button type="button" onClick={() => openPreview(datos.template_recovery)} className="px-4 py-2 rounded-xl border border-gray-200 bg-white font-raleway text-sm text-gray-700 hover:bg-gray-50 transition-colors">Ver preview</button>
                </div>
              </div>
            </TemplateAccordion>

            <TemplateAccordion title="Email de invitación" description="Se envía cuando se invita a un usuario nuevo.">
              <div className="space-y-4">
                <Field label="Asunto del email">
                  <input type="text" value={datos.subject_invite} onChange={(e) => set('subject_invite', e.target.value)} className="input" />
                </Field>
                <Field label="HTML del template">
                  <textarea value={datos.template_invite} onChange={(e) => set('template_invite', e.target.value)} rows={20} className="input font-mono text-xs resize-y" spellCheck={false} />
                </Field>
                <div className="flex justify-end">
                  <button type="button" onClick={() => openPreview(datos.template_invite)} className="px-4 py-2 rounded-xl border border-gray-200 bg-white font-raleway text-sm text-gray-700 hover:bg-gray-50 transition-colors">Ver preview</button>
                </div>
              </div>
            </TemplateAccordion>

            <TemplateAccordion title="Email de magic link" description="Se envía cuando un usuario solicita acceder sin contraseña.">
              <div className="space-y-4">
                <Field label="Asunto del email">
                  <input type="text" value={datos.subject_magic_link} onChange={(e) => set('subject_magic_link', e.target.value)} className="input" />
                </Field>
                <Field label="HTML del template">
                  <textarea value={datos.template_magic_link} onChange={(e) => set('template_magic_link', e.target.value)} rows={20} className="input font-mono text-xs resize-y" spellCheck={false} />
                </Field>
                <div className="flex justify-end">
                  <button type="button" onClick={() => openPreview(datos.template_magic_link)} className="px-4 py-2 rounded-xl border border-gray-200 bg-white font-raleway text-sm text-gray-700 hover:bg-gray-50 transition-colors">Ver preview</button>
                </div>
              </div>
            </TemplateAccordion>
          </div>

          {/* Variables help - Transaccionales */}
          <div className="p-4 bg-teal-50 rounded-xl border border-teal-100">
            <p className="font-raleway text-xs text-teal-800 font-semibold mb-2">Variables disponibles — Emails del portal de empleo</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {['{{candidatoNombre}}', '{{ofertaTitulo}}', '{{empresaNombre}}', '{{candidatoEmail}}', '{{perfilUrl}}', '{{estadoLabel}}'].map((v) => (
                <code key={v} className="bg-teal-100 text-teal-900 font-mono text-xs px-2 py-1 rounded-md">{v}</code>
              ))}
            </div>
            <p className="font-raleway text-xs text-teal-700">
              Deja el template vacío para usar el diseño por defecto. Si lo personalizas, estas variables se reemplazarán automáticamente.
            </p>
          </div>

          <div className="space-y-3">
            <TemplateAccordion
              title="Confirmación de candidatura al candidato"
              description="Se envía al candidato cuando aplica a una oferta de empleo."
            >
              <div className="space-y-4">
                <Field label="Asunto del email">
                  <input
                    type="text"
                    value={datos.subject_candidatura_candidato}
                    onChange={(e) => set('subject_candidatura_candidato', e.target.value)}
                    placeholder="Tu candidatura ha sido recibida — {{ofertaTitulo}}"
                    className="input"
                  />
                </Field>
                <Field label="HTML del template">
                  <textarea
                    value={datos.template_candidatura_candidato}
                    onChange={(e) => set('template_candidatura_candidato', e.target.value)}
                    rows={20}
                    placeholder="Vacío = usar template por defecto"
                    className="input font-mono text-xs resize-y"
                    spellCheck={false}
                  />
                </Field>
                {datos.template_candidatura_candidato && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => openPreviewTransaccional(datos.template_candidatura_candidato, {
                        candidatoNombre: 'Laura García',
                        ofertaTitulo: 'Coach Ejecutivo',
                        empresaNombre: 'Empresa ejemplo',
                      })}
                      className="px-4 py-2 rounded-xl border border-gray-200 bg-white font-raleway text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Ver preview
                    </button>
                  </div>
                )}
              </div>
            </TemplateAccordion>

            <TemplateAccordion
              title="Notificación de nueva candidatura a Jennifer"
              description="Se envía a la dirección ADMIN_NOTIFICATION_EMAIL cuando llega una candidatura nueva."
            >
              <div className="space-y-4">
                <Field label="Asunto del email">
                  <input
                    type="text"
                    value={datos.subject_candidatura_admin}
                    onChange={(e) => set('subject_candidatura_admin', e.target.value)}
                    placeholder="Nueva candidatura — {{candidatoNombre}}"
                    className="input"
                  />
                </Field>
                <Field label="HTML del template">
                  <textarea
                    value={datos.template_candidatura_admin}
                    onChange={(e) => set('template_candidatura_admin', e.target.value)}
                    rows={20}
                    placeholder="Vacío = usar template por defecto"
                    className="input font-mono text-xs resize-y"
                    spellCheck={false}
                  />
                </Field>
                {datos.template_candidatura_admin && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => openPreviewTransaccional(datos.template_candidatura_admin, {
                        candidatoNombre: 'Laura García',
                        candidatoEmail: 'laura@ejemplo.com',
                        ofertaTitulo: 'Coach Ejecutivo',
                        perfilUrl: 'https://henkoaching.com/dashboard/candidatos/123',
                      })}
                      className="px-4 py-2 rounded-xl border border-gray-200 bg-white font-raleway text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Ver preview
                    </button>
                  </div>
                )}
              </div>
            </TemplateAccordion>

            <TemplateAccordion
              title="Actualización de estado de candidatura"
              description="Se envía al candidato cuando Jennifer cambia el estado: en revisión, entrevista, seleccionado o descartado."
            >
              <div className="space-y-4">
                <Field label="Asunto del email">
                  <input
                    type="text"
                    value={datos.subject_cambio_estado}
                    onChange={(e) => set('subject_cambio_estado', e.target.value)}
                    placeholder="Actualización de tu candidatura — {{ofertaTitulo}}"
                    className="input"
                  />
                </Field>
                <Field label="HTML del template">
                  <textarea
                    value={datos.template_cambio_estado}
                    onChange={(e) => set('template_cambio_estado', e.target.value)}
                    rows={20}
                    placeholder="Vacío = usar template por defecto (con estilos por estado)"
                    className="input font-mono text-xs resize-y"
                    spellCheck={false}
                  />
                </Field>
                {datos.template_cambio_estado && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => openPreviewTransaccional(datos.template_cambio_estado, {
                        candidatoNombre: 'Laura García',
                        ofertaTitulo: 'Coach Ejecutivo',
                        estadoLabel: 'Entrevista',
                      })}
                      className="px-4 py-2 rounded-xl border border-gray-200 bg-white font-raleway text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Ver preview
                    </button>
                  </div>
                )}
              </div>
            </TemplateAccordion>
          </div>
        </div>
      )}

      {/* Guardar */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-henko-turquoise text-white font-raleway font-semibold text-sm hover:bg-henko-turquoise-light transition-colors"
        >
          {activeTab === 'templates' ? 'Guardar templates' : 'Guardar configuración'}
        </button>
      </div>

      {/* Modal preview */}
      {previewHtml !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          onClick={() => setPreviewHtml(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden w-full max-w-xl shadow-2xl flex flex-col overflow-y-auto"
            style={{ maxHeight: 'calc(100vh - 64px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
              <span className="font-raleway text-sm font-semibold text-gray-700">Preview del email</span>
              <button
                type="button"
                onClick={() => setPreviewHtml(null)}
                className="text-gray-400 hover:text-gray-700 text-xl leading-none font-light"
              >
                ×
              </button>
            </div>
            <iframe
              srcDoc={previewHtml}
              className="w-full"
              style={{ border: 'none', display: 'block', height: '720px' }}
              title="Preview del template de email"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      )}

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
        :global(textarea.input) {
          font-family: 'Courier New', Courier, monospace;
        }
      `}</style>
    </form>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-xl font-raleway text-sm font-medium transition-colors ${
        active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
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

function TemplateAccordion({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors"
      >
        <div>
          <p className="font-roxborough text-base text-gray-900">{title}</p>
          <p className="font-raleway text-xs text-gray-400 font-light mt-0.5">{description}</p>
        </div>
        <span className={`ml-4 shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>
      {open && (
        <div className="px-6 pb-6 border-t border-gray-100 pt-5">
          {children}
        </div>
      )}
    </div>
  )
}
