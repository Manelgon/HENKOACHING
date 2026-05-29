'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAction } from '@/shared/feedback/FeedbackContext'
import { cambiarEstadoSolicitud } from '@/actions/solicitudes'
import type { SolicitudCandidato } from '../types'
import type { EstadoSolicitud } from '@/lib/supabase/database.types'

const ESTADOS: { value: EstadoSolicitud; label: string; color: string }[] = [
  { value: 'nuevo',      label: 'Nuevo',      color: 'bg-blue-100 text-blue-700' },
  { value: 'revisando',  label: 'Revisando',  color: 'bg-amber-100 text-amber-700' },
  { value: 'entrevista', label: 'Entrevista', color: 'bg-purple-100 text-purple-700' },
  { value: 'descartado', label: 'Descartado', color: 'bg-red-100 text-red-600' },
  { value: 'contratado', label: 'Contratado', color: 'bg-green-100 text-green-700' },
]

function getBadge(estado: EstadoSolicitud) {
  return ESTADOS.find((e) => e.value === estado) ?? { label: estado, color: 'bg-gray-100 text-gray-600' }
}

export default function CandidatoSolicitudes({ solicitudes, candidatoId }: { solicitudes: SolicitudCandidato[]; candidatoId: string }) {
  if (solicitudes.length === 0) {
    return (
      <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-8">
        <h3 className="font-roxborough text-lg text-gray-900 mb-4">Solicitudes</h3>
        <p className="font-raleway text-sm text-gray-400">Este candidato no ha aplicado a ninguna oferta.</p>
      </section>
    )
  }

  return (
    <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-8">
      <h3 className="font-roxborough text-lg text-gray-900 mb-5">
        Solicitudes <span className="font-raleway text-base font-normal text-gray-400">({solicitudes.length})</span>
      </h3>
      <div className="space-y-3">
        {solicitudes.map((s) => <SolicitudRow key={s.id} s={s} candidatoId={candidatoId} />)}
      </div>
    </section>
  )
}

function SolicitudRow({ s, candidatoId }: { s: SolicitudCandidato; candidatoId: string }) {
  const router = useRouter()
  const runAction = useAction()
  const [acting, setActing] = useState(false)
  const [refreshing, startRefresh] = useTransition()
  const isLoading = acting || refreshing

  // Valor optimista local solo para rollback en caso de error
  const [optimisticEstado, setOptimisticEstado] = useState<EstadoSolicitud | null>(null)
  const estadoActual = optimisticEstado ?? s.estado
  const badge = getBadge(estadoActual)

  async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const nuevo = e.target.value as EstadoSolicitud
    const prev = s.estado
    setOptimisticEstado(nuevo)
    setActing(true)
    const r = await runAction('Actualizando estado', () => cambiarEstadoSolicitud(s.id, nuevo), { silentSuccess: true })
    setActing(false)
    if (!r.ok) {
      setOptimisticEstado(prev)
    } else {
      setOptimisticEstado(null) // dejar que el prop actualizado tome el control
      startRefresh(() => router.refresh())
    }
  }

  return (
    <div className={`flex items-start gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100/80 transition-colors relative ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}>
      <div className="flex-1 min-w-0">
        <Link
          href={`/dashboard/ofertas/${s.oferta_id}`}
          className="font-raleway font-semibold text-sm text-gray-900 hover:text-henko-turquoise transition-colors line-clamp-1"
        >
          {s.oferta_titulo}
        </Link>
        {s.created_at && (
          <p className="font-raleway text-xs text-gray-400 mt-0.5">
            {new Date(s.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        )}
        {s.mensaje && (
          <p className="font-raleway text-xs text-gray-500 mt-1.5 italic line-clamp-2">"{s.mensaje}"</p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`font-raleway text-xs font-semibold px-2.5 py-1 rounded-full ${badge.color}`}>
          {badge.label}
        </span>
        <select
          value={estadoActual}
          onChange={onChange}
          disabled={isLoading}
          className="font-raleway text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-600 outline-none focus:border-henko-turquoise transition-colors disabled:opacity-50"
        >
          {ESTADOS.map((e) => (
            <option key={e.value} value={e.value}>{e.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
