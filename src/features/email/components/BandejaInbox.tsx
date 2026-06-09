'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  listarLabelsGmail,
  listarThreadsGmail,
  leerThreadGmail,
  archivarThread,
  toggleLeidoThread,
  eliminarThreadGmail,
  buscarThreadsGmail,
} from '@/actions/email'
import { useAction, useConfirm } from '@/shared/feedback/FeedbackContext'
import EmailDrawer from './EmailDrawer'
import ComposeDrawer from './ComposeDrawer'
import FallosPanel from './FallosPanel'
import { useEmailStore } from '@/features/email/store/emailStore'
import type { GmailLabel, GmailThread, GmailMessage } from '../types'

type Props = {
  hasImapConfig: boolean
  initialLabels?: GmailLabel[]
  initialThreads?: GmailThread[]
}

const SYSTEM_LABEL_ICONS: Record<string, string> = {
  INBOX:   'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  SENT:    'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
  DRAFT:   'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  SPAM:    'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636',
  TRASH:   'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  DEFAULT: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
}

export default function BandejaInbox({ hasImapConfig, initialLabels = [], initialThreads }: Props) {
  const runAction = useAction()
  const confirm = useConfirm()
  const { setUnreadCount, failedCount } = useEmailStore()

  const [labels, setLabels] = useState<GmailLabel[]>(initialLabels)
  const [activeLabelId, setActiveLabelId] = useState('INBOX')
  const [threads, setThreads] = useState<GmailThread[] | null>(initialThreads ?? null)
  const [pageTokens, setPageTokens] = useState<(string | undefined)[]>([undefined])
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedMessages, setSelectedMessages] = useState<GmailMessage[] | null>(null)
  const [selectedThread, setSelectedThread] = useState<GmailThread | null>(null)
  const [loadingThreadId, setLoadingThreadId] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [busquedaInput, setBusquedaInput] = useState('')
  const [composing, setComposing] = useState(false)
  const [composeDefaults, setComposeDefaults] = useState<{ to?: string; subject?: string; bodyHtml?: string } | null>(null)
  const [activeView, setActiveView] = useState<'gmail' | 'fallos'>('gmail')
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set())
  // Skip first INBOX fetch if data was server-prefetched
  const skipFirstFetch = useRef(initialThreads != null)

  // Sync unread count from initial labels (server-prefetched)
  useEffect(() => {
    if (initialLabels.length > 0) {
      const inbox = initialLabels.find(x => x.id === 'INBOX')
      if (inbox) setUnreadCount(inbox.unread)
      return
    }
    listarLabelsGmail().then(l => {
      setLabels(l)
      const inbox = l.find(x => x.id === 'INBOX')
      if (inbox) setUnreadCount(inbox.unread)
    }).catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setUnreadCount])

  const fetchPage = useCallback(async (labelId: string, pg: number, tokens: (string | undefined)[], q?: string, size?: number) => {
    setLoading(true)
    setError(null)
    setSeleccionados(new Set())
    try {
      const token = tokens[pg]
      const r = q
        ? await buscarThreadsGmail(q)
        : await listarThreadsGmail(labelId, undefined, token, size ?? pageSize)
      setThreads(r.threads)
      setHasNextPage(!!r.nextPageToken)
      if (r.nextPageToken) {
        setPageTokens(prev => {
          const next = [...prev]
          next[pg + 1] = r.nextPageToken
          return next
        })
      }
    } catch (e) {
      setError(String(e))
      setThreads([])
    } finally {
      setLoading(false)
    }
  }, [])

  const resetAndLoad = useCallback((labelId: string, q?: string) => {
    setPage(0)
    setPageTokens([undefined])
    setHasNextPage(false)
    fetchPage(labelId, 0, [undefined], q)
  }, [fetchPage])

  useEffect(() => {
    if (skipFirstFetch.current && activeLabelId === 'INBOX') {
      skipFirstFetch.current = false
      return
    }
    resetAndLoad(activeLabelId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLabelId, resetAndLoad])

  // Auto-refresco cada 120s
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') fetchPage(activeLabelId, page, pageTokens, busqueda || undefined)
    }, 120_000)
    return () => clearInterval(id)
  }, [activeLabelId, busqueda, page, pageTokens, fetchPage])

  const abrirThread = async (thread: GmailThread) => {
    setLoadingThreadId(thread.id)
    try {
      const messages = await leerThreadGmail(thread.id)
      setSelectedMessages(messages)
      setSelectedThread(thread)
      if (thread.unread) {
        await toggleLeidoThread(thread.id, true)
        setThreads(prev => prev ? prev.map(t => t.id === thread.id ? { ...t, unread: false } : t) : prev)
      }
    } catch {
      setError('Error al abrir el hilo.')
    } finally {
      setLoadingThreadId(null)
    }
  }

  const handleArchivar = async (threadId: string) => {
    setThreads(prev => prev ? prev.filter(t => t.id !== threadId) : prev)
    try { await archivarThread(threadId) } catch { fetchPage(activeLabelId, page, pageTokens) }
  }

  const handleEliminar = async (threadId: string) => {
    setThreads(prev => prev ? prev.filter(t => t.id !== threadId) : prev)
    try { await eliminarThreadGmail(threadId) } catch { fetchPage(activeLabelId, page, pageTokens) }
  }

  const handleToggleLeido = async (thread: GmailThread) => {
    const newUnread = !thread.unread
    setThreads(prev => prev ? prev.map(t => t.id === thread.id ? { ...t, unread: newUnread } : t) : prev)
    try { await toggleLeidoThread(thread.id, !newUnread) } catch {}
  }

  const eliminarSeleccionados = async () => {
    const ids = Array.from(seleccionados)
    const ok = await confirm({
      title: `Eliminar ${ids.length} hilo${ids.length !== 1 ? 's' : ''}`,
      description: 'Los mensajes se moverán a la papelera.',
      confirmLabel: 'Eliminar',
      variant: 'danger',
    })
    if (!ok) return
    await runAction('Eliminando', async () => {
      await Promise.all(ids.map(id => eliminarThreadGmail(id)))
      setThreads(prev => prev ? prev.filter(t => !ids.includes(t.id)) : prev)
      setSeleccionados(new Set())
    }, { successMessage: `${ids.length} eliminado${ids.length !== 1 ? 's' : ''}` })
  }

  const canPrev = page > 0
  const canNext = hasNextPage

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault()
    const q = busquedaInput.trim()
    setBusqueda(q)
    resetAndLoad(activeLabelId, q || undefined)
  }

  const cambiarLabel = (labelId: string) => {
    if (labelId === activeLabelId) return
    setActiveLabelId(labelId)
    setThreads(null)
    setBusqueda('')
    setBusquedaInput('')
    setSeleccionados(new Set())
    setActiveView('gmail')
  }

  const systemLabels = labels.filter(l => l.type === 'system')
  const userLabels = labels.filter(l => l.type === 'user')

  return (
    <>
      <div className="flex gap-6">
        {/* Sidebar labels */}
        <aside className="hidden lg:flex flex-col gap-1 w-44 flex-shrink-0">
          <button
            type="button"
            onClick={() => setComposing(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-henko-turquoise text-white font-raleway font-semibold text-sm hover:opacity-90 transition-opacity mb-3"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Redactar
          </button>

          {systemLabels.map(label => (
            <LabelButton
              key={label.id}
              label={label}
              active={activeView === 'gmail' && activeLabelId === label.id}
              onClick={() => { setActiveView('gmail'); cambiarLabel(label.id) }}
              iconPath={SYSTEM_LABEL_ICONS[label.id] ?? SYSTEM_LABEL_ICONS.DEFAULT}
            />
          ))}

          {userLabels.length > 0 && (
            <>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 pt-3 pb-1">Etiquetas</p>
              {userLabels.map(label => (
                <LabelButton
                  key={label.id}
                  label={label}
                  active={activeView === 'gmail' && activeLabelId === label.id}
                  onClick={() => { setActiveView('gmail'); cambiarLabel(label.id) }}
                  iconPath={SYSTEM_LABEL_ICONS.DEFAULT}
                />
              ))}
            </>
          )}

          <button
            type="button"
            onClick={() => setActiveView('fallos')}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-raleway text-sm font-medium transition-colors text-left mt-1 border-t border-gray-100 pt-3 ${
              activeView === 'fallos' ? 'bg-red-50 text-red-600 font-semibold' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span className="flex-1 truncate">Fallos SMTP</span>
            {failedCount > 0 && (
              <span className="text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 font-bold leading-none">
                {failedCount > 9 ? '9+' : failedCount}
              </span>
            )}
          </button>
        </aside>

        {/* Panel principal */}
        <div className="flex-1 min-w-0">
          {activeView === 'fallos' && <FallosPanel />}

          {activeView === 'gmail' && (
            <>
              {/* Buscador */}
              <form onSubmit={handleBuscar} className="flex items-center gap-3 mb-4">
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Buscar en Gmail…"
                    value={busquedaInput}
                    onChange={e => setBusquedaInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-henko-turquoise text-white font-raleway text-sm font-semibold hover:opacity-90 transition-opacity"
                >Buscar</button>
                <button
                  type="button"
                  onClick={() => fetchPage(activeLabelId, page, pageTokens)}
                  className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-raleway text-sm hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Actualizar
                </button>
              </form>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 mb-4 flex items-start gap-3">
                  <p className="font-raleway text-sm text-red-600 flex-1">{error}</p>
                  <button type="button" onClick={() => setError(null)} className="text-red-300 hover:text-red-500">✕</button>
                </div>
              )}

              {threads === null ? (
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm px-6 py-20 text-center">
                  <p className="font-raleway text-gray-400 text-sm">Cargando Gmail…</p>
                </div>
              ) : threads.length === 0 ? (
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm px-6 py-16 text-center">
                  <p className="font-roxborough text-lg text-gray-400">Bandeja vacía</p>
                </div>
              ) : (
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                  {seleccionados.size > 0 && (
                    <div className="flex items-center gap-3 px-6 py-3 bg-henko-turquoise/5 border-b border-henko-turquoise/20">
                      <span className="font-raleway text-sm font-semibold text-henko-turquoise">
                        {seleccionados.size} seleccionado{seleccionados.size !== 1 ? 's' : ''}
                      </span>
                      <button
                        type="button"
                        onClick={eliminarSeleccionados}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 font-raleway text-xs font-semibold hover:bg-red-100 transition-colors"
                      >Eliminar</button>
                      <button
                        type="button"
                        onClick={() => setSeleccionados(new Set())}
                        className="font-raleway text-xs text-gray-400 hover:text-gray-600 ml-auto"
                      >Cancelar</button>
                    </div>
                  )}

                  {(threads ?? []).map(thread => {
                    const isLoadingThread = loadingThreadId === thread.id
                    const selected = seleccionados.has(thread.id)
                    return (
                      <div
                        key={thread.id}
                        className={`border-b border-gray-100 last:border-0 group ${selected ? 'bg-henko-turquoise/5' : thread.unread ? 'bg-blue-50/30' : ''}`}
                      >
                        <div
                          role="button" tabIndex={0}
                          onClick={() => !isLoadingThread && abrirThread(thread)}
                          onKeyDown={e => e.key === 'Enter' && !isLoadingThread && abrirThread(thread)}
                          className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${isLoadingThread ? 'opacity-60 cursor-wait' : 'cursor-pointer hover:bg-gray-50'}`}
                        >
                          {/* Checkbox */}
                          <div onClick={e => { e.stopPropagation(); setSeleccionados(prev => { const n = new Set(prev); n.has(thread.id) ? n.delete(thread.id) : n.add(thread.id); return n }) }}>
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => {}}
                              className="w-4 h-4 rounded text-henko-turquoise focus:ring-henko-turquoise cursor-pointer"
                            />
                          </div>

                          {/* Indicador no leído */}
                          <div className="w-2 flex-shrink-0">
                            {thread.unread && <span className="block w-2 h-2 rounded-full bg-henko-turquoise" />}
                          </div>

                          {/* Contenido */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-3 mb-0.5">
                              <span className={`font-raleway text-sm truncate ${thread.unread ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                {thread.from.replace(/<.*?>/, '').trim() || thread.from}
                                {thread.messageCount > 1 && (
                                  <span className="ml-1.5 text-[10px] text-gray-400 font-normal">({thread.messageCount})</span>
                                )}
                              </span>
                              <span className="font-raleway text-xs text-gray-400 flex-shrink-0">{formatDate(thread.date)}</span>
                            </div>
                            <p className={`font-raleway text-sm truncate ${thread.unread ? 'font-medium text-gray-800' : 'text-gray-500'}`}>{thread.subject}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="font-raleway text-xs text-gray-400 truncate flex-1">{thread.snippet}</p>
                              <span className="flex-shrink-0 text-[9px] font-raleway font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-400 border border-blue-100">
                                Gmail
                              </span>
                            </div>
                          </div>

                          {/* Acciones inline (hover) */}
                          <div className="hidden group-hover:flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                            <ActionBtn title="Archivar" onClick={() => handleArchivar(thread.id)} icon="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            <ActionBtn title={thread.unread ? 'Marcar como leído' : 'Marcar no leído'} onClick={() => handleToggleLeido(thread)} icon={thread.unread ? 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8' : 'M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76'} />
                            <ActionBtn title="Eliminar" onClick={() => handleEliminar(thread.id)} icon="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" danger />
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {/* Footer paginación */}
                  <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                    {/* Info + selector tamaño */}
                    <div className="flex items-center gap-3">
                      <span className="font-raleway text-xs text-gray-400">
                        Página {page + 1}{hasNextPage ? '+' : ` de ${pageTokens.length}`}
                      </span>
                      <select
                        value={pageSize}
                        onChange={e => {
                          const newSize = Number(e.target.value)
                          setPageSize(newSize)
                          setPage(0)
                          setPageTokens([undefined])
                          fetchPage(activeLabelId, 0, [undefined], busqueda || undefined, newSize)
                        }}
                        className="text-xs font-raleway border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-henko-turquoise text-gray-600"
                      >
                        {[12, 20, 50, 100].map(s => <option key={s} value={s}>{s} por página</option>)}
                      </select>
                    </div>

                    {/* Paginación numerada */}
                    <div className="flex items-center gap-1">
                      <button
                        disabled={!canPrev}
                        onClick={() => {
                          const newPage = page - 1
                          setPage(newPage)
                          fetchPage(activeLabelId, newPage, pageTokens, busqueda || undefined)
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 font-raleway text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >‹</button>

                      {(() => {
                        const knownPages = pageTokens.length
                        const pages: (number | '…')[] = []
                        if (knownPages <= 7) {
                          for (let i = 0; i < knownPages; i++) pages.push(i)
                        } else {
                          pages.push(0)
                          if (page > 2) pages.push('…')
                          for (let i = Math.max(1, page - 1); i <= Math.min(knownPages - 2, page + 1); i++) pages.push(i)
                          if (page < knownPages - 3) pages.push('…')
                          pages.push(knownPages - 1)
                        }
                        return pages.map((p, i) =>
                          p === '…' ? (
                            <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center font-raleway text-xs text-gray-400">…</span>
                          ) : (
                            <button
                              key={p}
                              disabled={loading}
                              onClick={() => {
                                setPage(p)
                                fetchPage(activeLabelId, p, pageTokens, busqueda || undefined)
                              }}
                              className={`w-8 h-8 flex items-center justify-center rounded-xl font-raleway text-sm transition-colors ${page === p ? 'bg-henko-turquoise text-white font-semibold' : 'border border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                            >{p + 1}</button>
                          )
                        )
                      })()}

                      <button
                        disabled={!canNext || loading}
                        onClick={() => {
                          const newPage = page + 1
                          setPage(newPage)
                          fetchPage(activeLabelId, newPage, pageTokens, busqueda || undefined)
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 font-raleway text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? <span className="w-3 h-3 rounded-full border-2 border-gray-300 border-t-henko-turquoise animate-spin" /> : '›'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedMessages && selectedThread && (
        <EmailDrawer
          messages={selectedMessages}
          thread={selectedThread}
          onClose={() => { setSelectedMessages(null); setSelectedThread(null) }}
          onReply={(to, subject, quotedHtml) => {
            setSelectedMessages(null); setSelectedThread(null)
            setComposeDefaults({ to, subject, bodyHtml: quotedHtml })
          }}
          onNewEmail={to => {
            setSelectedMessages(null); setSelectedThread(null)
            setComposeDefaults({ to })
          }}
          onArchivar={() => { handleArchivar(selectedThread.id); setSelectedMessages(null); setSelectedThread(null) }}
          onEliminar={() => { handleEliminar(selectedThread.id); setSelectedMessages(null); setSelectedThread(null) }}
        />
      )}

      {(composing || composeDefaults) && (
        <ComposeDrawer
          onClose={() => { setComposing(false); setComposeDefaults(null) }}
          defaultTo={composeDefaults?.to ?? ''}
          defaultSubject={composeDefaults?.subject ?? ''}
          defaultBodyHtml={composeDefaults?.bodyHtml ?? ''}
        />
      )}
    </>
  )
}

function LabelButton({ label, active, onClick, iconPath }: { label: GmailLabel; active: boolean; onClick: () => void; iconPath: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-raleway text-sm font-medium transition-colors text-left ${
        active ? 'bg-henko-turquoise/10 text-henko-turquoise font-semibold' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={iconPath} />
      </svg>
      <span className="flex-1 truncate">{label.name}</span>
      {label.unread > 0 && (
        <span className="text-xs bg-henko-turquoise text-white rounded-full px-1.5 py-0.5 font-bold leading-none">
          {label.unread}
        </span>
      )}
    </button>
  )
}

function ActionBtn({ title, onClick, icon, danger }: { title: string; onClick: () => void; icon: string; danger?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${danger ? 'text-gray-300 hover:text-red-400 hover:bg-red-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
      </svg>
    </button>
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
