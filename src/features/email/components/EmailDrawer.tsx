'use client'

import { useEffect } from 'react'
import type { EmailDetail } from '../types'

type Props = {
  email: EmailDetail
  onClose: () => void
  onReply: (to: string, subject: string, quotedHtml: string) => void
  onNewEmail: (to: string) => void
}

export default function EmailDrawer({ email, onClose, onReply, onNewEmail }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const fecha = new Date(email.date).toLocaleString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  // Extraer dirección de email del campo "from" (Nombre <email@domain.com>)
  const emailMatch = email.from.match(/<(.+?)>/)
  const replyTo = emailMatch ? emailMatch[1] : email.from.trim()

  // Asunto sin doble Re:
  const replySubject = email.subject?.startsWith('Re:') ? (email.subject ?? '') : `Re: ${email.subject ?? ''}`

  // HTML citado para el cuerpo de la respuesta
  const quotedHtml = [
    '<br><br>',
    `<blockquote style="border-left:3px solid #e5e7eb;padding-left:14px;margin:0;color:#6b7280;">`,
    `<p style="font-size:11px;color:#9ca3af;margin:0 0 6px;">El ${fecha}, ${email.from} escribió:</p>`,
    email.bodyHtml ?? (email.bodyText ? `<pre style="white-space:pre-wrap;font-size:13px;">${email.bodyText}</pre>` : ''),
    '</blockquote>',
  ].join('')

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      {/* Overlay */}
      <div className="flex-1 bg-black/40" />

      {/* Panel */}
      <div
        className="w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header sticky */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 flex items-start justify-between gap-4 z-10">
          <div className="min-w-0">
            <p className="font-roxborough text-xl text-gray-900 leading-tight">{email.subject || '(Sin asunto)'}</p>
            <p className="font-raleway text-sm text-gray-500 mt-0.5 truncate">{email.from}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 flex-shrink-0"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Metadatos */}
          <div className="bg-gray-50 rounded-2xl p-5 space-y-2.5 font-raleway text-sm">
            <MetaField label="De">
              <a href={`mailto:${replyTo}`} className="text-henko-turquoise hover:underline break-all">
                {email.from}
              </a>
            </MetaField>
            <MetaField label="Fecha">{fecha}</MetaField>
            <MetaField label="Asunto">{email.subject || '(Sin asunto)'}</MetaField>
          </div>

          {/* Cuerpo */}
          <div>
            <p className="font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Mensaje</p>
            <div className="bg-white border border-gray-100 rounded-2xl px-5 py-5 overflow-x-auto">
              {email.bodyHtml ? (
                <div
                  className="prose prose-sm max-w-none font-raleway [&_a]:text-henko-turquoise [&_a]:no-underline hover:[&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: email.bodyHtml }}
                />
              ) : email.bodyText ? (
                <pre className="font-raleway text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {email.bodyText}
                </pre>
              ) : (
                <p className="font-raleway text-sm text-gray-400 text-center py-6">
                  Este mensaje no tiene cuerpo de texto.
                </p>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className="border-t border-gray-100 pt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onReply(replyTo, replySubject, quotedHtml)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-henko-turquoise text-white font-raleway font-semibold text-sm hover:bg-henko-turquoise-light transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Responder
            </button>
            <button
              type="button"
              onClick={() => onNewEmail(replyTo)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-raleway text-sm hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Nuevo correo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetaField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-xs text-gray-400 uppercase tracking-wider font-bold w-16 flex-shrink-0">{label}</span>
      <span className="text-gray-700">{children}</span>
    </div>
  )
}
