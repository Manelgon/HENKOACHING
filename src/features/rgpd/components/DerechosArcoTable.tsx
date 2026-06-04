'use client'

import { useState } from 'react'
import { useAction } from '@/shared/feedback/FeedbackContext'
import { cambiarEstadoDerecho } from '@/actions/rgpd'
import type { DerechoArco } from '@/features/rgpd/types'

const TIPO_LABELS: Record<DerechoArco['tipo_derecho'], string> = {
  acceso: 'Acceso',
  rectificacion: 'Rectificación',
  supresion: 'Supresión',
  portabilidad: 'Portabilidad',
  oposicion: 'Oposición',
  limitacion: 'Limitación',
}

const ESTADO_COLORS: Record<DerechoArco['estado'], string> = {
  pendiente: 'bg-amber-100 text-amber-700',
  en_proceso: 'bg-blue-100 text-blue-700',
  resuelta: 'bg-green-100 text-green-700',
}

const ESTADO_LABELS: Record<DerechoArco['estado'], string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  resuelta: 'Resuelta',
}

export default function DerechosArcoTable({ initialData }: { initialData: DerechoArco[] }) {
  const runAction = useAction()
  const [rows, setRows] = useState<DerechoArco[]>(initialData)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [notas, setNotas] = useState<Record<string, string>>({})

  async function cambiarEstado(id: string, estado: DerechoArco['estado']) {
    const r = await runAction(
      'Actualizando estado',
      () => cambiarEstadoDerecho(id, estado, notas[id]),
      { successMessage: 'Estado actualizado' },
    )
    if (r.ok) {
      setRows(rs => rs.map(r => r.id === id ? {
        ...r,
        estado,
        resolucion_at: estado === 'resuelta' ? new Date().toISOString() : r.resolucion_at,
        notas_admin: notas[id] ?? r.notas_admin,
      } : r))
      setExpanded(null)
    }
  }

  if (rows.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="font-raleway text-gray-500 text-sm">Sin solicitudes de derechos todavía</p>
        <p className="font-raleway text-gray-400 text-xs mt-1">Aparecerán aquí cuando alguien use el formulario público</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {rows.map(row => (
        <div key={row.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div
            className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setExpanded(e => e === row.id ? null : row.id)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-raleway text-sm font-semibold text-gray-800">{row.nombre}</span>
                <span className="text-gray-300">·</span>
                <span className="font-raleway text-xs text-gray-500">{row.email}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600 text-[11px] font-semibold font-raleway">
                  {TIPO_LABELS[row.tipo_derecho]}
                </span>
                <span className={`inline-flex px-2 py-0.5 rounded-lg text-[11px] font-semibold font-raleway ${ESTADO_COLORS[row.estado]}`}>
                  {ESTADO_LABELS[row.estado]}
                </span>
                <span className="text-xs text-gray-400 font-raleway">
                  {new Date(row.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
            <svg className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${expanded === row.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {expanded === row.id && (
            <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4">
              <div>
                <p className="text-[10px] tracking-[0.14em] text-henko-turquoise font-bold mb-1">DESCRIPCIÓN DE LA SOLICITUD</p>
                <p className="font-raleway text-sm text-gray-700 bg-gray-50 rounded-xl p-3">{row.descripcion}</p>
              </div>
              {row.notas_admin && (
                <div>
                  <p className="text-[10px] tracking-[0.14em] text-henko-turquoise font-bold mb-1">NOTAS INTERNAS</p>
                  <p className="font-raleway text-sm text-gray-600">{row.notas_admin}</p>
                </div>
              )}
              {row.estado !== 'resuelta' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] tracking-[0.14em] text-henko-turquoise font-bold mb-1 block">NOTAS INTERNAS (OPCIONAL)</label>
                    <textarea
                      className="w-full px-3 py-2 rounded-xl text-sm border-[1.5px] border-gray-200 bg-white outline-none focus:border-henko-turquoise transition-colors font-raleway resize-none"
                      rows={2}
                      value={notas[row.id] ?? ''}
                      onChange={e => setNotas(n => ({ ...n, [row.id]: e.target.value }))}
                      placeholder="Anotaciones sobre esta solicitud..."
                    />
                  </div>
                  <div className="flex gap-2">
                    {row.estado === 'pendiente' && (
                      <button
                        type="button"
                        onClick={() => cambiarEstado(row.id, 'en_proceso')}
                        className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm font-raleway font-semibold hover:bg-blue-100 transition-colors"
                      >
                        Marcar en proceso
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => cambiarEstado(row.id, 'resuelta')}
                      className="px-4 py-2 rounded-xl bg-green-50 text-green-700 text-sm font-raleway font-semibold hover:bg-green-100 transition-colors"
                    >
                      Marcar como resuelta
                    </button>
                  </div>
                </div>
              )}
              {row.estado === 'resuelta' && row.resolucion_at && (
                <p className="font-raleway text-xs text-green-600">
                  Resuelta el {new Date(row.resolucion_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
