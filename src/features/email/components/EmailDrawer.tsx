'use client'

import { useEffect } from 'react'
import type { EmailDetail } from '../types'

type Props = {
  email: EmailDetail
  onClose: () => void
}

export default function EmailDrawer({ email, onClose }: Props) {
  // Cerrar con Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100">
          <div className="flex-1 min-w-0">
            <h3 className="font-roxborough text-lg text-gray-900 leading-tight">{email.subject}</h3>
            <p className="font-raleway text-sm text-gray-500 mt-1 truncate">{email.from}</p>
            <p className="font-raleway text-xs text-gray-400 mt-0.5">
              {new Date(email.date).toLocaleString('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Cerrar"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cuerpo */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {email.bodyHtml ? (
            <div
              className="prose prose-sm max-w-none font-raleway"
              // El HTML ya está sanitizado en el servidor con sanitize-html
              dangerouslySetInnerHTML={{ __html: email.bodyHtml }}
            />
          ) : email.bodyText ? (
            <pre className="font-raleway text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {email.bodyText}
            </pre>
          ) : (
            <p className="font-raleway text-sm text-gray-400 text-center py-8">
              Este mensaje no tiene cuerpo de texto.
            </p>
          )}
        </div>
      </div>
    </>
  )
}
