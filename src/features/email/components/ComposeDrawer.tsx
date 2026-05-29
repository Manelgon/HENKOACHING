'use client'

import { useState, useEffect, useRef } from 'react'
import { useAction } from '@/shared/feedback/FeedbackContext'
import { enviarEmail } from '@/actions/email'
import EmailEditor from './EmailEditor'
import type { AttachmentInput } from '../types'

type Props = {
  onClose: () => void
  defaultTo?: string
  defaultSubject?: string
  defaultBodyHtml?: string
}

const MAX_SIZE_MB = 10
const MAX_ATTACHMENTS = 5

export default function ComposeDrawer({ onClose, defaultTo = '', defaultSubject = '', defaultBodyHtml = '' }: Props) {
  const runAction = useAction()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [to, setTo] = useState(defaultTo)
  const [subject, setSubject] = useState(defaultSubject)
  const [bodyHtml, setBodyHtml] = useState(defaultBodyHtml)
  const [bodyText, setBodyText] = useState('')
  const [attachments, setAttachments] = useState<AttachmentInput[]>([])
  const [attachError, setAttachError] = useState<string | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function onAddFiles(e: React.ChangeEvent<HTMLInputElement>) {
    setAttachError(null)
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    const newAttachments: AttachmentInput[] = []
    for (const file of files) {
      if (attachments.length + newAttachments.length >= MAX_ATTACHMENTS) {
        setAttachError(`Máximo ${MAX_ATTACHMENTS} adjuntos`)
        break
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setAttachError(`"${file.name}" supera ${MAX_SIZE_MB}MB`)
        continue
      }
      const base64 = await fileToBase64(file)
      newAttachments.push({ name: file.name, size: file.size, mimeType: file.type, base64 })
    }
    setAttachments((prev) => [...prev, ...newAttachments])
    e.target.value = ''
  }

  function removeAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const r = await runAction(
      'Enviando email',
      () => enviarEmail({ to, subject, bodyText, bodyHtml, attachments }),
      { successMessage: `Email enviado a ${to}` }
    )
    if (r.ok) onClose()
  }

  const totalSize = attachments.reduce((s, a) => s + a.size, 0)

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} aria-hidden />

      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-roxborough text-xl text-gray-900">Nuevo email</h3>
          <button
            type="button" onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700"
            aria-label="Cerrar"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Campos Para y Asunto */}
          <div className="px-6 pt-4 pb-3 space-y-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <span className="font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest w-14 flex-shrink-0">Para</span>
              <input
                type="email" required value={to} onChange={(e) => setTo(e.target.value)}
                placeholder="destinatario@email.com"
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white transition-colors"
                autoFocus
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest w-14 flex-shrink-0">Asunto</span>
              <input
                type="text" required value={subject} onChange={(e) => setSubject(e.target.value)}
                placeholder="Asunto del mensaje"
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <EmailEditor
              value={bodyHtml}
              onChange={(html, text) => { setBodyHtml(html); setBodyText(text) }}
              placeholder="Escribe tu mensaje…"
            />

            {/* Adjuntos */}
            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Adjuntos ({formatSize(totalSize)})
                </p>
                {attachments.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span className="flex-1 font-raleway text-sm text-gray-700 truncate">{a.name}</span>
                    <span className="font-raleway text-xs text-gray-400">{formatSize(a.size)}</span>
                    <button
                      type="button" onClick={() => removeAttachment(i)}
                      className="text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            {attachError && (
              <p className="mt-2 font-raleway text-xs text-red-500">{attachError}</p>
            )}
          </div>

          {/* Acciones */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-henko-turquoise text-white font-raleway font-semibold text-sm hover:bg-henko-turquoise-light transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Enviar
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={attachments.length >= MAX_ATTACHMENTS}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-raleway text-sm hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              Adjuntar
            </button>

            <input
              ref={fileInputRef} type="file" multiple className="hidden"
              onChange={onAddFiles}
            />

            <button
              type="button" onClick={onClose}
              className="ml-auto px-4 py-2.5 rounded-xl text-gray-400 font-raleway text-sm hover:text-gray-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
