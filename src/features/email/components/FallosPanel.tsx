'use client'

import { useState, useEffect, useCallback } from 'react'
import { listarEmailsFallidos, reintentarEmail } from '@/actions/email'
import { useEmailStore } from '@/features/email/store/emailStore'
import { contarEmailsFallidos } from '@/actions/email'
import type { EmailFallido } from '@/actions/email'

export default function FallosPanel() {
  const [fallos, setFallos] = useState<EmailFallido[]>([])
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState<string | null>(null)
  const [toast, setToast] = useState<{ id: string; ok: boolean; msg: string } | null>(null)
  const setFailedCount = useEmailStore((s) => s.setFailedCount)

  const cargar = useCallback(async () => {
    setLoading(true)
    const data = await listarEmailsFallidos()
    setFallos(data)
    setLoading(false)
  }, [])

  useEffect(() => { cargar() }, [cargar])

  async function reintentar(id: string) {
    setRetrying(id)
    const r = await reintentarEmail(id)
    if ('ok' in r) {
      setToast({ id, ok: true, msg: 'Email reenviado correctamente' })
      await cargar()
      // Actualizar failedCount en el store
      contarEmailsFallidos().then(setFailedCount).catch(() => {})
    } else {
      setToast({ id, ok: false, msg: r.error })
    }
    setRetrying(null)
    setTimeout(() => setToast(null), 4000)
  }

  const TIPO_LABEL: Record<string, string> = {
    'candidatura.candidato': 'Candidatura → candidato',
    'candidatura.admin': 'Candidatura → admin',
    'cambio_estado': 'Cambio de estado',
  }

  return (
    <div className="flex-1 min-w-0">
      {/* Toast */}
      {toast && (
        <div className={`mb-4 flex items-center gap-3 px-5 py-3 rounded-2xl border text-sm font-raleway ${
          toast.ok
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={toast.ok
                ? 'M5 13l4 4L19 7'
                : 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z'
              }
            />
          </svg>
          {toast.msg}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm px-6 py-16 text-center">
          <p className="font-raleway text-gray-400 text-sm">Cargando fallos…</p>
        </div>
      ) : fallos.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm px-6 py-16 text-center">
          <svg className="w-10 h-10 text-green-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-roxborough text-lg text-gray-400">Sin fallos recientes</p>
          <p className="font-raleway text-sm text-gray-400 mt-1">Todos los emails transaccionales se enviaron correctamente.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <p className="font-roxborough text-lg text-gray-800">Emails fallidos</p>
              <p className="font-raleway text-xs text-gray-400 mt-0.5">{fallos.length} error{fallos.length !== 1 ? 'es' : ''} — puedes reintentar el envío individualmente</p>
            </div>
            <button
              type="button"
              onClick={cargar}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-gray-500 font-raleway text-xs hover:bg-gray-50 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </button>
          </div>

          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50/80">
            <span className="col-span-3 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Destinatario</span>
            <span className="col-span-3 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Asunto</span>
            <span className="col-span-2 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Tipo</span>
            <span className="col-span-2 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Fecha</span>
            <span className="col-span-2 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Acción</span>
          </div>

          {fallos.map((f) => (
            <div key={f.id} className="border-b border-gray-100 last:border-0">
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 items-start">
                <div className="col-span-3 min-w-0">
                  <p className="font-raleway text-sm text-gray-800 truncate">{f.para}</p>
                </div>
                <div className="col-span-3 min-w-0">
                  <p className="font-raleway text-sm text-gray-700 truncate">{f.asunto}</p>
                </div>
                <div className="col-span-2">
                  <span className="font-raleway text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {f.tipo ? (TIPO_LABEL[f.tipo] ?? f.tipo) : '—'}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="font-raleway text-xs text-gray-400">{formatDate(f.created_at)}</p>
                  {f.intentos > 1 && (
                    <p className="font-raleway text-xs text-amber-500 mt-0.5">{f.intentos} intentos</p>
                  )}
                </div>
                <div className="col-span-2">
                  <button
                    type="button"
                    onClick={() => reintentar(f.id)}
                    disabled={retrying === f.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-henko-turquoise text-white font-raleway text-xs font-semibold hover:bg-henko-turquoise-light disabled:opacity-50 disabled:cursor-wait transition-colors"
                  >
                    {retrying === f.id ? (
                      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                    Reintentar
                  </button>
                </div>
              </div>

              {/* Mobile */}
              <div className="md:hidden px-4 py-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="font-raleway text-sm font-semibold text-gray-800 truncate">{f.para}</p>
                    <p className="font-raleway text-xs text-gray-500 truncate mt-0.5">{f.asunto}</p>
                  </div>
                  <span className="font-raleway text-xs text-gray-400 flex-shrink-0">{formatDate(f.created_at)}</span>
                </div>
                {f.error && (
                  <p className="font-raleway text-xs text-red-400 mb-3 bg-red-50 px-3 py-2 rounded-lg">{f.error}</p>
                )}
                <button
                  type="button"
                  onClick={() => reintentar(f.id)}
                  disabled={retrying === f.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-henko-turquoise text-white font-raleway text-xs font-semibold hover:bg-henko-turquoise-light disabled:opacity-50 transition-colors"
                >
                  Reintentar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  if (diffDays < 7) return d.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' })
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}
