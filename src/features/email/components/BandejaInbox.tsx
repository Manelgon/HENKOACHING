'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { listarEmailsBandeja, leerEmailBandeja } from '@/actions/email'
import EmailDrawer from './EmailDrawer'
import { useEmailStore } from '@/features/email/store/emailStore'
import { TablePagination, usePagination } from '@/components/TablePagination'
import type { EmailMessage, EmailDetail } from '../types'

type Props = {
  hasImapConfig: boolean
}

export default function BandejaInbox({ hasImapConfig }: Props) {
  const [mensajes, setMensajes] = useState<EmailMessage[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<EmailDetail | null>(null)
  const [loadingUid, setLoadingUid] = useState<number | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroLeido, setFiltroLeido] = useState<'todos' | 'no_leido' | 'leido'>('todos')
  const { markAllSeen, setUnreadCount } = useEmailStore()

  const cargar = useCallback(async (silencioso = false) => {
    if (!silencioso) setLoading(true)
    setError(null)
    try {
      const r = await listarEmailsBandeja()
      if ('error' in r) {
        setError(r.error ?? 'Error desconocido')
      } else {
        setMensajes(r.messages)
        const unread = r.messages.filter((m) => !m.seen).length
        setUnreadCount(unread)
      }
    } catch (e) {
      setError(`Error al cargar: ${String(e)}`)
    } finally {
      if (!silencioso) setLoading(false)
    }
  }, [setUnreadCount])

  useEffect(() => {
    markAllSeen()
  }, [markAllSeen])

  useEffect(() => { cargar() }, [cargar])

  useEffect(() => {
    if (!hasImapConfig) return
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') cargar(true)
    }, 120_000)
    return () => clearInterval(interval)
  }, [hasImapConfig, cargar])

  const filtered = useMemo(() => {
    if (!mensajes) return []
    let result = mensajes
    if (filtroLeido === 'no_leido') result = result.filter((m) => !m.seen)
    if (filtroLeido === 'leido') result = result.filter((m) => m.seen)
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      result = result.filter(
        (m) =>
          m.from.toLowerCase().includes(q) ||
          m.subject.toLowerCase().includes(q)
      )
    }
    return result
  }, [mensajes, busqueda, filtroLeido])

  const pagination = usePagination(filtered, 20)

  async function abrirEmail(uid: number) {
    setLoadingUid(uid)
    setError(null)
    try {
      const r = await leerEmailBandeja(uid)
      if ('error' in r) {
        setError(r.error ?? 'Error al abrir el correo')
      } else {
        setSelected(r.detail)
        setMensajes((prev) =>
          prev ? prev.map((m) => (m.uid === uid ? { ...m, seen: true } : m)) : prev
        )
      }
    } catch (e) {
      setError(`Error al abrir el correo: ${String(e)}`)
    } finally {
      setLoadingUid(null)
    }
  }

  if (!hasImapConfig) {
    return (
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm px-6 md:px-8 py-16 md:py-20 text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <p className="font-roxborough text-xl text-gray-400 mb-2">Configura las credenciales IMAP</p>
        <p className="font-raleway text-gray-400 text-sm font-light">
          Para ver la bandeja de entrada, ve a la pestaña <strong>Configuración</strong> y añade el servidor IMAP y la contraseña.
        </p>
      </div>
    )
  }

  const noLeidos = mensajes ? mensajes.filter((m) => !m.seen).length : 0

  return (
    <>
      {/* Tabs estado lectura */}
      <div className="flex items-end justify-between gap-4 mb-6 border-b border-gray-200">
        <div className="flex items-center gap-1 overflow-x-auto flex-1 min-w-0">
          {(['todos', 'no_leido', 'leido'] as const).map((v) => {
            const labels = { todos: 'Todos', no_leido: 'No leídos', leido: 'Leídos' }
            const counts = {
              todos: mensajes?.length ?? 0,
              no_leido: noLeidos,
              leido: (mensajes?.length ?? 0) - noLeidos,
            }
            return (
              <button
                key={v}
                type="button"
                onClick={() => setFiltroLeido(v)}
                className={`relative flex items-center gap-1.5 px-4 py-3 font-raleway text-sm font-semibold whitespace-nowrap transition-colors ${
                  filtroLeido === v
                    ? 'text-henko-turquoise after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-henko-turquoise after:rounded-t'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {v === 'no_leido' && <span className="w-1.5 h-1.5 rounded-full bg-henko-turquoise flex-shrink-0" />}
                {labels[v]}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  filtroLeido === v ? 'bg-henko-turquoise/15 text-henko-turquoise' : 'bg-gray-100 text-gray-400'
                }`}>
                  {counts[v]}
                </span>
              </button>
            )
          })}
        </div>
        <button
          type="button"
          onClick={() => cargar()}
          disabled={loading}
          className="hidden md:inline-flex mb-2 flex-shrink-0 items-center gap-2 px-5 py-2.5 rounded-xl bg-henko-turquoise text-white font-raleway font-semibold text-sm hover:bg-henko-turquoise-light disabled:opacity-50 transition-colors"
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

      {/* Toolbar: buscador */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm px-4 md:px-6 py-4 mb-6">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Buscar por remitente o asunto…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white transition-colors"
          />
          <button
            type="button"
            onClick={() => cargar()}
            disabled={loading}
            className="md:hidden flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-henko-turquoise text-white hover:bg-henko-turquoise-light disabled:opacity-50 transition-colors"
            aria-label="Actualizar bandeja"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Error visible */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 mb-6 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="font-raleway text-sm text-red-600 flex-1">{error}</p>
          <button type="button" onClick={() => setError(null)} className="text-red-300 hover:text-red-500">✕</button>
        </div>
      )}

      {/* Tabla */}
      {loading && mensajes === null ? (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm px-6 py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <p className="font-raleway text-gray-400 text-sm">Conectando al servidor de correo…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm px-6 md:px-8 py-16 md:py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="font-roxborough text-xl text-gray-400 mb-2">
            {!mensajes || mensajes.length === 0 ? 'La bandeja está vacía' : 'Ningún correo coincide con los filtros'}
          </p>
          <p className="font-raleway text-gray-400 text-sm font-light">
            {!mensajes || mensajes.length === 0
              ? 'Cuando lleguen correos, aparecerán aquí.'
              : 'Prueba a cambiar o quitar los filtros.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          {/* Cabecera desktop */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 lg:px-8 py-4 border-b border-gray-100 bg-gray-50">
            <span className="col-span-4 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">De</span>
            <span className="col-span-6 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Asunto</span>
            <span className="col-span-2 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Fecha</span>
          </div>

          {pagination.paginated.map((msg) => {
            const isLoading = loadingUid === msg.uid
            return (
              <div
                key={msg.uid}
                className={`border-b border-gray-100 last:border-0 ${!msg.seen ? 'bg-henko-greenblue/10' : ''}`}
              >
                {/* Fila desktop */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => loadingUid === null && abrirEmail(msg.uid)}
                  onKeyDown={(e) => e.key === 'Enter' && loadingUid === null && abrirEmail(msg.uid)}
                  className={`hidden md:grid grid-cols-12 gap-4 px-6 lg:px-8 py-4 items-center transition-colors ${
                    isLoading ? 'opacity-60 cursor-wait' : 'cursor-pointer hover:bg-gray-50'
                  }`}
                >
                  <span className="col-span-4 font-raleway font-semibold text-gray-900 truncate flex items-center gap-2">
                    {isLoading ? (
                      <svg className="w-4 h-4 animate-spin text-henko-turquoise flex-shrink-0" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : !msg.seen ? (
                      <span className="w-2 h-2 rounded-full bg-henko-turquoise flex-shrink-0" />
                    ) : null}
                    <span className="truncate">{msg.from}</span>
                  </span>
                  <span className={`col-span-6 font-raleway text-sm truncate ${!msg.seen ? 'font-medium text-gray-800' : 'text-gray-500'}`}>
                    {msg.subject}
                  </span>
                  <span className="col-span-2 font-raleway text-xs text-gray-400">{formatDate(msg.date)}</span>
                </div>

                {/* Tarjeta móvil */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => loadingUid === null && abrirEmail(msg.uid)}
                  onKeyDown={(e) => e.key === 'Enter' && loadingUid === null && abrirEmail(msg.uid)}
                  className={`md:hidden px-4 py-4 transition-colors ${
                    isLoading ? 'opacity-60 cursor-wait' : 'cursor-pointer hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <p className="font-raleway font-semibold text-gray-900 text-sm flex items-center min-w-0 truncate">
                      {isLoading ? (
                        <svg className="w-3 h-3 animate-spin text-henko-turquoise mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : !msg.seen ? (
                        <span className="w-2 h-2 rounded-full bg-henko-turquoise mr-2 flex-shrink-0" />
                      ) : null}
                      <span className="truncate">{msg.from}</span>
                    </p>
                    <span className="font-raleway text-xs text-gray-400 flex-shrink-0">{formatDate(msg.date)}</span>
                  </div>
                  <p className={`font-raleway text-xs truncate ${!msg.seen ? 'font-medium text-gray-700' : 'text-gray-500'}`}>
                    {msg.subject}
                  </p>
                </div>
              </div>
            )
          })}

          <TablePagination
            page={pagination.page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            totalPages={pagination.totalPages}
            from={pagination.from}
            to={pagination.to}
            onPageChange={pagination.setPage}
            onPageSizeChange={pagination.setPageSize}
          />
        </div>
      )}

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
