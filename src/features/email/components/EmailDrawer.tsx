'use client'

import { useEffect, useState } from 'react'
import type { GmailMessage, GmailThread } from '../types'

type Props = {
  messages: GmailMessage[]
  thread: GmailThread
  onClose: () => void
  onReply: (to: string, subject: string, quotedHtml: string) => void
  onNewEmail: (to: string) => void
  onArchivar?: () => void
  onEliminar: () => void
}

export default function EmailDrawer({ messages, thread, onClose, onReply, onNewEmail, onArchivar, onEliminar }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(
    // Último mensaje expandido por defecto
    new Set(messages.length > 0 ? [messages[messages.length - 1].id] : [])
  )

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const lastMessage = messages[messages.length - 1]
  const emailMatch = lastMessage?.from.match(/<(.+?)>/)
  const replyTo = emailMatch ? emailMatch[1] : (lastMessage?.from ?? '').trim()
  const replySubject = thread.subject?.startsWith('Re:') ? thread.subject : `Re: ${thread.subject}`

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/40" />
      <div
        className="w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 flex items-start justify-between gap-4 z-10">
          <div className="min-w-0 flex-1">
            <p className="font-roxborough text-xl text-gray-900 leading-tight">{thread.subject || '(Sin asunto)'}</p>
            <p className="font-raleway text-xs text-gray-400 mt-1">{messages.length} mensaje{messages.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {onArchivar && (
              <button
                type="button"
                title="Archivar"
                onClick={onArchivar}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </button>
            )}
            <button
              type="button"
              title="Eliminar"
              onClick={onEliminar}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
            >✕</button>
          </div>
        </div>

        {/* Mensajes en acordeón */}
        <div className="flex-1 px-6 py-4 space-y-2">
          {messages.map((msg, idx) => {
            const isOpen = expanded.has(msg.id)
            const isLast = idx === messages.length - 1
            const fecha = new Date(msg.date).toLocaleString('es-ES', {
              day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
            })

            return (
              <div key={msg.id} className={`border border-gray-100 rounded-2xl overflow-hidden ${isLast ? 'shadow-sm' : ''}`}>
                {/* Cabecera del mensaje */}
                <button
                  type="button"
                  onClick={() => toggleExpand(msg.id)}
                  className="w-full flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-full bg-henko-turquoise/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-roxborough text-sm text-henko-turquoise">
                        {(msg.from[0] ?? '?').toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-raleway font-semibold text-sm text-gray-900 truncate">
                        {msg.from.replace(/<.*?>/, '').trim() || msg.from}
                      </p>
                      {!isOpen && (
                        <p className="font-raleway text-xs text-gray-400 truncate">{msg.bodyText?.slice(0, 80) ?? msg.subject}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-raleway text-xs text-gray-400">{fecha}</span>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Cuerpo expandido */}
                {isOpen && (
                  <div className="px-5 pb-5">
                    <div className="text-xs text-gray-400 font-raleway mb-3 space-y-0.5">
                      <p><span className="font-bold">De:</span> {msg.from}</p>
                      <p><span className="font-bold">Para:</span> {msg.to}</p>
                    </div>
                    <div className="border border-gray-100 rounded-xl px-5 py-4 overflow-x-auto">
                      {msg.bodyHtml ? (
                        <div
                          className="prose prose-sm max-w-none font-raleway [&_a]:text-henko-turquoise"
                          dangerouslySetInnerHTML={{ __html: msg.bodyHtml }}
                        />
                      ) : msg.bodyText ? (
                        <pre className="font-raleway text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{msg.bodyText}</pre>
                      ) : (
                        <p className="font-raleway text-sm text-gray-400 text-center py-4">Sin cuerpo de mensaje.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Acciones */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3">
          <button
            type="button"
            onClick={() => {
              const quotedHtml = lastMessage ? buildQuote(lastMessage) : ''
              onReply(replyTo, replySubject, quotedHtml)
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-henko-turquoise text-white font-raleway font-semibold text-sm hover:opacity-90 transition-opacity"
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
            Nuevo correo
          </button>
        </div>
      </div>
    </div>
  )
}

function buildQuote(msg: GmailMessage): string {
  const fecha = new Date(msg.date).toLocaleString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  return [
    '<br><br>',
    `<blockquote style="border-left:3px solid #e5e7eb;padding-left:14px;margin:0;color:#6b7280;">`,
    `<p style="font-size:11px;color:#9ca3af;margin:0 0 6px;">El ${fecha}, ${msg.from} escribió:</p>`,
    msg.bodyHtml ?? (msg.bodyText ? `<pre style="white-space:pre-wrap;font-size:13px;">${msg.bodyText}</pre>` : ''),
    '</blockquote>',
  ].join('')
}
