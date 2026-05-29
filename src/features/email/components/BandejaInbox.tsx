'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { listarEmailsBandeja, leerEmailBandeja, listarCarpetasImap } from '@/actions/email'
import { useAction } from '@/shared/feedback/FeedbackContext'
import EmailDrawer from './EmailDrawer'
import ComposeDrawer from './ComposeDrawer'
import FallosPanel from './FallosPanel'
import { useEmailStore } from '@/features/email/store/emailStore'
import { TablePagination, usePagination } from '@/components/TablePagination'
import type { EmailMessage, EmailDetail, ImapFolder, FolderType } from '../types'

type Props = {
  hasImapConfig: boolean
}

const FOLDER_ICONS: Record<FolderType, string> = {
  inbox:  'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  sent:   'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
  drafts: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  spam:   'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636',
  trash:  'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
}

export default function BandejaInbox({ hasImapConfig }: Props) {
  const runAction = useAction()
  const [mensajes, setMensajes] = useState<EmailMessage[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<EmailDetail | null>(null)
  const [loadingUid, setLoadingUid] = useState<number | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroLeido, setFiltroLeido] = useState<'todos' | 'no_leido' | 'leido'>('todos')
  const [composing, setComposing] = useState(false)
  const [folders, setFolders] = useState<ImapFolder[]>([])
  const [activeFolder, setActiveFolder] = useState<ImapFolder>({ path: 'INBOX', label: 'Recibidos', type: 'inbox', unread: 0 })

  const [activeView, setActiveView] = useState<'imap' | 'fallos'>('imap')

  const { markAllSeen, setUnreadCount, failedCount } = useEmailStore()

  const cargar = useCallback(async (mailbox: string, silencioso = false) => {
    setError(null)

    const doLoad = async () => {
      const r = await listarEmailsBandeja(mailbox)
      if ('error' in r) throw new Error(r.error ?? 'Error desconocido')
      setMensajes(r.messages)
      const unread = r.messages.filter((m) => !m.seen).length
      setUnreadCount(unread)
      return r
    }

    if (silencioso) {
      try { await doLoad() } catch (e) { setError(String(e)) }
    } else {
      const result = await runAction('Cargando emails', doLoad, { silentSuccess: true })
      if (!result.ok) setError(result.error)
    }
  }, [runAction, setUnreadCount])

  // Cargar carpetas al montar
  useEffect(() => {
    if (!hasImapConfig) return
    listarCarpetasImap().then((r) => {
      if ('ok' in r && r.folders) setFolders(r.folders)
    })
  }, [hasImapConfig])

  useEffect(() => { markAllSeen() }, [markAllSeen])
  useEffect(() => { cargar(activeFolder.path) }, [activeFolder.path, cargar])

  // Auto-refresco cada 120s
  useEffect(() => {
    if (!hasImapConfig) return
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') cargar(activeFolder.path, true)
    }, 120_000)
    return () => clearInterval(interval)
  }, [hasImapConfig, activeFolder.path, cargar])

  const filtered = useMemo(() => {
    if (!mensajes) return []
    let result = mensajes
    if (filtroLeido === 'no_leido') result = result.filter((m) => !m.seen)
    if (filtroLeido === 'leido')    result = result.filter((m) => m.seen)
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      result = result.filter((m) => m.from.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q))
    }
    return result
  }, [mensajes, busqueda, filtroLeido])

  const pagination = usePagination(filtered, 20)

  async function abrirEmail(uid: number) {
    setLoadingUid(uid)
    setError(null)
    try {
      const r = await leerEmailBandeja(uid, activeFolder.path)
      if ('error' in r) {
        setError(r.error ?? 'Error al abrir el correo')
      } else {
        setSelected(r.detail)
        setMensajes((prev) => prev ? prev.map((m) => m.uid === uid ? { ...m, seen: true } : m) : prev)
      }
    } catch (e) {
      setError(`Error al abrir: ${String(e)}`)
    } finally {
      setLoadingUid(null)
    }
  }

  function cambiarCarpeta(folder: ImapFolder) {
    if (folder.path === activeFolder.path) return
    setActiveFolder(folder)
    setMensajes(null)
    setBusqueda('')
    setFiltroLeido('todos')
  }

  if (!hasImapConfig) {
    return (
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm px-6 md:px-8 py-16 text-center">
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

  // Carpetas a mostrar: siempre INBOX + las detectadas del servidor
  const foldersToShow: ImapFolder[] = folders.length > 0 ? folders : [activeFolder]

  return (
    <>
      <div className="flex gap-6">
        {/* Sidebar carpetas */}
        <aside className="hidden lg:flex flex-col gap-1 w-44 flex-shrink-0">
          <button
            type="button"
            onClick={() => setComposing(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-henko-turquoise text-white font-raleway font-semibold text-sm hover:bg-henko-turquoise-light transition-colors mb-3"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Redactar
          </button>

          {foldersToShow.map((folder) => (
            <button
              key={folder.path}
              type="button"
              onClick={() => { setActiveView('imap'); cambiarCarpeta(folder) }}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-raleway text-sm font-medium transition-colors text-left ${
                activeView === 'imap' && activeFolder.path === folder.path
                  ? 'bg-henko-turquoise/10 text-henko-turquoise font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={FOLDER_ICONS[folder.type]} />
              </svg>
              <span className="flex-1 truncate">{folder.label}</span>
              {(folder.unread > 0) && (
                <span className="text-xs bg-henko-turquoise text-white rounded-full px-1.5 py-0.5 font-bold leading-none">
                  {folder.unread}
                </span>
              )}
            </button>
          ))}

          {/* Ítem especial: Fallos transaccionales */}
          <button
            type="button"
            onClick={() => setActiveView('fallos')}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-raleway text-sm font-medium transition-colors text-left mt-1 border-t border-gray-100 pt-3 ${
              activeView === 'fallos'
                ? 'bg-red-50 text-red-600 font-semibold'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span className="flex-1 truncate">Fallos</span>
            {failedCount > 0 && (
              <span className="text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 font-bold leading-none">
                {failedCount > 9 ? '9+' : failedCount}
              </span>
            )}
          </button>

        </aside>

        {/* Panel principal */}
        <div className="flex-1 min-w-0">
          {/* Banner de fallos */}
          {failedCount > 0 && activeView === 'imap' && (
            <div className="mb-4 flex items-center gap-3 px-5 py-3 rounded-2xl bg-red-50 border border-red-200">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="font-raleway text-sm text-red-700 flex-1">
                <strong>{failedCount}</strong> email{failedCount !== 1 ? 's' : ''} no se {failedCount !== 1 ? 'pudieron enviar' : 'pudo enviar'}.
              </p>
              <button
                type="button"
                onClick={() => setActiveView('fallos')}
                className="font-raleway text-xs font-semibold text-red-600 underline underline-offset-2 hover:text-red-800 whitespace-nowrap"
              >
                Ver fallos →
              </button>
            </div>
          )}

          {/* Vista Fallos */}
          {activeView === 'fallos' && <FallosPanel />}

          {/* Contenido IMAP */}
          {activeView === 'imap' && (
          <><div className="flex items-end justify-between gap-4 mb-4 border-b border-gray-200">
            <div className="flex items-center gap-1 overflow-x-auto flex-1 min-w-0">
              {/* Carpetas en móvil */}
              <div className="flex lg:hidden items-center gap-1 mr-2 border-r border-gray-200 pr-2">
                {foldersToShow.slice(0, 3).map((folder) => (
                  <button
                    key={folder.path}
                    type="button"
                    onClick={() => cambiarCarpeta(folder)}
                    title={folder.label}
                    className={`p-2 rounded-lg transition-colors ${
                      activeFolder.path === folder.path ? 'bg-henko-turquoise/10 text-henko-turquoise' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={FOLDER_ICONS[folder.type]} />
                    </svg>
                  </button>
                ))}
              </div>

              {(['todos', 'no_leido', 'leido'] as const).map((v) => {
                const labels = { todos: 'Todos', no_leido: 'No leídos', leido: 'Leídos' }
                const counts = { todos: mensajes?.length ?? 0, no_leido: noLeidos, leido: (mensajes?.length ?? 0) - noLeidos }
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
                    }`}>{counts[v]}</span>
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => cargar(activeFolder.path)}
                className="hidden md:flex flex-shrink-0 items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-raleway text-sm hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualizar
              </button>
              <button
                type="button"
                onClick={() => setComposing(true)}
                className="lg:hidden flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-henko-turquoise text-white font-raleway font-semibold text-sm hover:bg-henko-turquoise-light transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Redactar
              </button>
            </div>
          </div>

          {/* Buscador */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por remitente o asunto…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={() => cargar(activeFolder.path)}
              className="md:hidden flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-henko-turquoise text-white hover:bg-henko-turquoise-light transition-colors"
              aria-label="Actualizar bandeja"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 mb-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="font-raleway text-sm text-red-600 flex-1">{error}</p>
              <button type="button" onClick={() => setError(null)} className="text-red-300 hover:text-red-500">✕</button>
            </div>
          )}

          {/* Lista de mensajes */}
          {mensajes === null ? (
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm px-6 py-20 text-center">
              <p className="font-raleway text-gray-400 text-sm">Conectando…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm px-6 py-16 text-center">
              <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="font-roxborough text-lg text-gray-400">
                {!mensajes.length ? `${activeFolder.label} está vacío` : 'Ningún correo coincide'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50/80">
                <span className="col-span-4 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">De</span>
                <span className="col-span-6 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Asunto</span>
                <span className="col-span-2 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Fecha</span>
              </div>

              {pagination.paginated.map((msg) => {
                const isLoadingMsg = loadingUid === msg.uid
                return (
                  <div key={msg.uid} className={`border-b border-gray-100 last:border-0 ${!msg.seen ? 'bg-henko-greenblue/10' : ''}`}>
                    <div
                      role="button" tabIndex={0}
                      onClick={() => loadingUid === null && abrirEmail(msg.uid)}
                      onKeyDown={(e) => e.key === 'Enter' && loadingUid === null && abrirEmail(msg.uid)}
                      className={`hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 items-center transition-colors ${isLoadingMsg ? 'opacity-60 cursor-wait' : 'cursor-pointer hover:bg-gray-50'}`}
                    >
                      <span className="col-span-4 font-raleway font-semibold text-gray-900 truncate flex items-center gap-2 text-sm">
                        {isLoadingMsg ? (
                          <svg className="w-3.5 h-3.5 animate-spin text-henko-turquoise flex-shrink-0" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : !msg.seen ? <span className="w-2 h-2 rounded-full bg-henko-turquoise flex-shrink-0" /> : null}
                        <span className="truncate">{msg.from}</span>
                      </span>
                      <span className={`col-span-6 font-raleway text-sm truncate ${!msg.seen ? 'font-medium text-gray-800' : 'text-gray-500'}`}>{msg.subject}</span>
                      <span className="col-span-2 font-raleway text-xs text-gray-400">{formatDate(msg.date)}</span>
                    </div>

                    <div
                      role="button" tabIndex={0}
                      onClick={() => loadingUid === null && abrirEmail(msg.uid)}
                      onKeyDown={(e) => e.key === 'Enter' && loadingUid === null && abrirEmail(msg.uid)}
                      className={`md:hidden px-4 py-4 transition-colors ${isLoadingMsg ? 'opacity-60 cursor-wait' : 'cursor-pointer hover:bg-gray-50'}`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <p className="font-raleway font-semibold text-gray-900 text-sm flex items-center min-w-0 gap-1.5 truncate">
                          {!msg.seen && <span className="w-2 h-2 rounded-full bg-henko-turquoise flex-shrink-0" />}
                          <span className="truncate">{msg.from}</span>
                        </p>
                        <span className="font-raleway text-xs text-gray-400 flex-shrink-0">{formatDate(msg.date)}</span>
                      </div>
                      <p className={`font-raleway text-xs truncate ${!msg.seen ? 'font-medium text-gray-700' : 'text-gray-500'}`}>{msg.subject}</p>
                    </div>
                  </div>
                )
              })}

              <TablePagination
                page={pagination.page} pageSize={pagination.pageSize}
                total={pagination.total} totalPages={pagination.totalPages}
                from={pagination.from} to={pagination.to}
                onPageChange={pagination.setPage} onPageSizeChange={pagination.setPageSize}
              />
            </div>
          )}
          </>)}
        </div>
      </div>

      {selected && <EmailDrawer email={selected} onClose={() => setSelected(null)} />}
      {composing && <ComposeDrawer onClose={() => setComposing(false)} />}
    </>
  )
}

function formatDate(date: Date): string {
  const now = new Date()
  const d = new Date(date)
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  if (diffDays < 7) return d.toLocaleDateString('es-ES', { weekday: 'short' })
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}
