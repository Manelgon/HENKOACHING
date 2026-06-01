'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  resetearPasswordCandidato,
  crearNotaCandidato,
  eliminarNotaCandidato,
  vincularCandidatoAOferta,
  archivarCandidato,
  restaurarCandidato,
} from '@/actions/candidatos-admin'
import { useAction, useConfirm } from '@/shared/feedback/FeedbackContext'
import type { NotaInterna } from '../types'

type OfertaOpcion = { id: string; titulo: string }

type Props = {
  candidatoId: string
  candidatoEmail: string
  archivado: boolean
  notas: NotaInterna[]
  ofertas: OfertaOpcion[]
  ofertasVinculadas: string[]
}

export default function CandidatoAccionesAdmin({ candidatoId, candidatoEmail, archivado, notas: initNotas, ofertas, ofertasVinculadas }: Props) {
  const router = useRouter()
  const runAction = useAction()
  const confirm = useConfirm()

  const [notas, setNotas] = useState(initNotas)
  const [nuevaNota, setNuevaNota] = useState('')
  const [ofertaSeleccionada, setOfertaSeleccionada] = useState('')

  const ofertasDisponibles = ofertas.filter(o => !ofertasVinculadas.includes(o.id))

  async function handleReset() {
    const ok = await confirm({
      title: 'Enviar email de recuperación',
      description: `Se enviará un enlace de recuperación de contraseña a ${candidatoEmail}. El candidato podrá establecer una nueva contraseña.`,
      confirmLabel: 'Enviar email',
    })
    if (!ok) return
    const result = await runAction(
      'Enviando email de recuperación',
      () => resetearPasswordCandidato(candidatoId),
      { successMessage: `Email enviado a ${candidatoEmail}` },
    )
    if (result.ok) router.refresh()
  }

  async function handleNota() {
    if (!nuevaNota.trim()) return
    const result = await runAction(
      'Guardando nota',
      () => crearNotaCandidato(candidatoId, nuevaNota),
      { successMessage: 'Nota guardada' },
    )
    if (result.ok) {
      setNuevaNota('')
      router.refresh()
    }
  }

  async function handleEliminarNota(notaId: string) {
    const ok = await confirm({
      title: 'Eliminar nota',
      description: '¿Eliminar esta nota? No se puede deshacer.',
      confirmLabel: 'Eliminar',
      variant: 'danger',
    })
    if (!ok) return
    const result = await runAction(
      'Eliminando nota',
      () => eliminarNotaCandidato(notaId),
      { successMessage: 'Nota eliminada' },
    )
    if (result.ok) {
      setNotas(prev => prev.filter(n => n.id !== notaId))
    }
  }

  async function handleVincular() {
    if (!ofertaSeleccionada) return
    const result = await runAction(
      'Vinculando candidato a oferta',
      () => vincularCandidatoAOferta(candidatoId, ofertaSeleccionada),
      { successMessage: 'Candidato vinculado a la oferta' },
    )
    if (result.ok) {
      setOfertaSeleccionada('')
      router.refresh()
    }
  }

  async function handleArchivar() {
    if (archivado) {
      const result = await runAction(
        'Restaurando candidato',
        () => restaurarCandidato(candidatoId),
        { successMessage: 'Candidato restaurado' },
      )
      if (result.ok) router.refresh()
      return
    }
    const ok = await confirm({
      title: 'Archivar candidato',
      description: 'El candidato no aparecerá en la lista principal. Podrás restaurarlo en cualquier momento.',
      confirmLabel: 'Archivar',
      variant: 'danger',
    })
    if (!ok) return
    const result = await runAction(
      'Archivando candidato',
      () => archivarCandidato(candidatoId),
      { successMessage: 'Candidato archivado' },
    )
    if (result.ok) router.refresh()
  }

  return (
    <div className="space-y-5">

      {/* Notas internas */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
        <p className="font-raleway font-bold text-henko-turquoise tracking-[0.14em] uppercase text-[11px] mb-4">Notas internas</p>
        <div className="flex gap-2 mb-4">
          <textarea
            rows={2}
            placeholder="Añadir nota privada sobre este candidato…"
            value={nuevaNota}
            onChange={e => setNuevaNota(e.target.value)}
            className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-henko-turquoise focus:bg-white transition-colors resize-none"
          />
          <button
            type="button"
            onClick={handleNota}
            disabled={!nuevaNota.trim()}
            className="self-end px-4 py-2.5 rounded-xl bg-henko-turquoise text-white text-sm font-semibold hover:bg-henko-turquoise-light transition-all disabled:opacity-40"
          >
            Guardar
          </button>
        </div>
        {notas.length === 0 ? (
          <p className="text-xs text-gray-400 italic">Sin notas todavía.</p>
        ) : (
          <div className="space-y-2.5">
            {notas.map(n => (
              <div key={n.id} className="bg-gray-50 rounded-xl px-4 py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-gray-800 leading-snug whitespace-pre-wrap">{n.contenido}</p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {n.autor_nombre} · {new Date(n.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleEliminarNota(n.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5"
                  aria-label="Eliminar nota"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vincular a oferta */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
        <p className="font-raleway font-bold text-henko-turquoise tracking-[0.14em] uppercase text-[11px] mb-4">Vincular a oferta</p>
        {ofertasDisponibles.length === 0 ? (
          <p className="text-xs text-gray-400 italic">Ya está vinculado a todas las ofertas activas.</p>
        ) : (
          <div className="flex gap-2">
            <select
              value={ofertaSeleccionada}
              onChange={e => setOfertaSeleccionada(e.target.value)}
              className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-henko-turquoise focus:bg-white transition-colors"
            >
              <option value="">Seleccionar oferta…</option>
              {ofertasDisponibles.map(o => (
                <option key={o.id} value={o.id}>{o.titulo}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleVincular}
              disabled={!ofertaSeleccionada}
              className="px-4 py-2.5 rounded-xl bg-henko-turquoise text-white text-sm font-semibold hover:bg-henko-turquoise-light transition-all disabled:opacity-40"
            >
              Vincular
            </button>
          </div>
        )}
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
        <p className="font-raleway font-bold text-henko-turquoise tracking-[0.14em] uppercase text-[11px] mb-4">Acciones</p>
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:border-henko-turquoise hover:bg-henko-turquoise/5 transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-henko-turquoise/10 flex items-center justify-center flex-shrink-0 transition-colors">
              <svg className="w-4 h-4 text-gray-500 group-hover:text-henko-turquoise" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 group-hover:text-henko-turquoise transition-colors">Resetear contraseña</p>
              <p className="text-[11px] text-gray-400">Envía un email de recuperación a {candidatoEmail}</p>
            </div>
          </button>

          <button
            type="button"
            onClick={handleArchivar}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left group ${
              archivado
                ? 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50'
                : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
              archivado ? 'bg-emerald-100' : 'bg-gray-100 group-hover:bg-red-100'
            }`}>
              {archivado ? (
                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-gray-500 group-hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                </svg>
              )}
            </div>
            <div>
              <p className={`text-sm font-semibold transition-colors ${archivado ? 'text-emerald-700' : 'text-gray-800 group-hover:text-red-600'}`}>
                {archivado ? 'Restaurar candidato' : 'Archivar candidato'}
              </p>
              <p className="text-[11px] text-gray-400">
                {archivado ? 'Vuelve a aparecer en la lista principal' : 'Desaparece de la lista, datos conservados'}
              </p>
            </div>
          </button>
        </div>
      </div>

    </div>
  )
}
