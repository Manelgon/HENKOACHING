'use client'

import { useState, useCallback } from 'react'
import { listarEmailsBandeja, leerEmailBandeja } from '@/actions/email'
import EmailDrawer from './EmailDrawer'
import type { EmailMessage, EmailDetail } from '../types'

type Props = {
  hasImapConfig: boolean
}

export default function BandejaInbox({ hasImapConfig }: Props) {
  const [mensajes, setMensajes] = useState<EmailMessage[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<EmailDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const cargar = useCallback(async (silencioso = false) => {
    if (!silencioso) setLoading(true)
    setError(null)
    const r = await listarEmailsBandeja()
    if (!silencioso) setLoading(false)
    if ('error' in r) {
      setError(r.error ?? 'Error desconocido')
    } else {
      setMensajes(r.messages)
    }
  }, [])

  // Cargar al montar
  useEffect(() => { cargar() }, [cargar])

  // Auto-refresco cada 60s mientras la página está visible
  useEffect(() => {
    if (!hasImapConfig) return
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') cargar(true)
    }, 60_000)
    return () => clearInterval(interval)
  }, [hasImapConfig, cargar])

  async function abrirEmail(uid: number) {
    setLoadingDetail(true)
    const r = await leerEmailBandeja(uid)
    setLoadingDetail(false)
    if ('error' in r) {
      setError(r.error ?? 'Error desconocido')
    } else {
      setSelected(r.detail)
      // Marcar como leído en la lista local
      setMensajes((prev) =>
        prev ? prev.map((m) => (m.uid === uid ? { ...m, seen: true } : m)) : prev
      )
    }
  }

  if (!hasImapConfig) {
    return (
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <p className="font-roxborough text-gray-900 text-lg mb-2">Configura las credenciales IMAP</p>
        <p className="font-raleway text-gray-500 text-sm">
          Para ver la bandeja de entrada, ve a la pestaña <strong>Configuración</strong> y añade el servidor IMAP y la contraseña.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-roxborough text-lg text-gray-900">Bandeja de entrada</h2>
          <button
            type="button"
            onClick={cargar}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-henko-turquoise text-white font-raleway text-sm font-semibold hover:bg-henko-turquoise-light disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            Actualizar
          </button>
        </div>

        {/* Estado vacío / error / lista */}
        {error && (
          <div className="px-6 py-4 bg-red-50 border-b border-red-100">
            <p className="font-raleway text-sm text-red-600">{error}</p>
          </div>
        )}

        {mensajes === null && !loading && !error && (
          <div className="px-6 py-12 text-center">
            <p className="font-raleway text-gray-400 text-sm">Conectando…</p>
          </div>
        )}

        {loading && (
          <div className="px-6 py-12 text-center">
            <p className="font-raleway text-gray-400 text-sm">Conectando al servidor de correo…</p>
          </div>
        )}

        {mensajes !== null && mensajes.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="font-raleway text-gray-400 text-sm">La bandeja está vacía.</p>
          </div>
        )}

        {mensajes && mensajes.length > 0 && (
          <ul className="divide-y divide-gray-50">
            {mensajes.map((msg) => (
              <li key={msg.uid}>
                <button
                  type="button"
                  onClick={() => abrirEmail(msg.uid)}
                  disabled={loadingDetail}
                  className={`w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors flex items-start gap-4 ${!msg.seen ? 'bg-blue-50/30' : ''}`}
                >
                  {/* Indicador no leído */}
                  <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${!msg.seen ? 'bg-henko-turquoise' : 'bg-transparent'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-raleway text-sm truncate ${!msg.seen ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {msg.from}
                      </span>
                      <span className="font-raleway text-xs text-gray-400 flex-shrink-0">
                        {formatDate(msg.date)}
                      </span>
                    </div>
                    <p className={`font-raleway text-sm mt-0.5 truncate ${!msg.seen ? 'font-medium text-gray-800' : 'text-gray-500'}`}>
                      {msg.subject}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected && (
        <EmailDrawer email={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}

function formatDate(date: Date): string {
  const now = new Date()
  const d = new Date(date)
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }
  if (diffDays < 7) {
    return d.toLocaleDateString('es-ES', { weekday: 'short' })
  }
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}
