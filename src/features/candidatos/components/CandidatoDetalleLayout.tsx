'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  getCvSignedUrl,
  resetearPasswordCandidato,
  crearNotaCandidato,
  eliminarNotaCandidato,
  vincularCandidatoAOferta,
  archivarCandidato,
  restaurarCandidato,
} from '@/actions/candidatos-admin'
import { useAction, useConfirm } from '@/shared/feedback/FeedbackContext'
import ComposeDrawer from '@/features/email/components/ComposeDrawer'
import CustomSelect from '@/shared/components/CustomSelect'
import { CandidatoExperiencia, CandidatoEducacion, CandidatoIdiomas, CandidatoPreferencias } from './CandidatoExperiencia'
import CandidatoSolicitudes from './CandidatoSolicitudes'
import type { CandidatoPerfil, NotaInterna } from '../types'

type Props = {
  perfil: CandidatoPerfil
  cvPrincipal: { id: string; nombre_archivo: string; storage_path: string } | null
  ofertas: { id: string; titulo: string }[]
  ofertasVinculadas: string[]
}

type Tab = 'trayectoria' | 'solicitudes' | 'notas'

export default function CandidatoDetalleLayout({ perfil, cvPrincipal, ofertas, ofertasVinculadas }: Props) {
  const router = useRouter()
  const runAction = useAction()
  const confirm = useConfirm()

  const [activeTab, setActiveTab] = useState<Tab>('trayectoria')
  const [composeOpen, setComposeOpen] = useState(false)
  const [notas, setNotas] = useState<NotaInterna[]>(perfil.notas)
  const [nuevaNota, setNuevaNota] = useState('')
  const [ofertaSeleccionada, setOfertaSeleccionada] = useState('')

  const nombre = [perfil.nombre, perfil.apellidos].filter(Boolean).join(' ') || perfil.email
  const inicial = (perfil.nombre?.[0] ?? perfil.email[0]).toUpperCase()
  const expActual = perfil.experiencias.find(e => !e.hasta) ?? perfil.experiencias[0] ?? null
  const cargoDisplay = expActual ? `${expActual.cargo} · ${expActual.empresa}` : null
  const ofertasDisponibles = ofertas.filter(o => !ofertasVinculadas.includes(o.id))

  async function handleDescargarCV() {
    if (!cvPrincipal) return
    const result = await runAction(
      'Generando enlace de descarga',
      () => getCvSignedUrl(cvPrincipal.storage_path),
      { silentSuccess: true },
    )
    if (result.ok && result.data) {
      window.open(result.data as string, '_blank')
    }
  }

  async function handleReset() {
    const ok = await confirm({
      title: 'Enviar email de recuperación',
      description: `Se enviará un enlace de recuperación de contraseña a ${perfil.email}. El candidato podrá establecer una nueva contraseña.`,
      confirmLabel: 'Enviar email',
    })
    if (!ok) return
    const result = await runAction(
      'Enviando email de recuperación',
      () => resetearPasswordCandidato(perfil.id),
      { successMessage: `Email enviado a ${perfil.email}` },
    )
    if (result.ok) router.refresh()
  }

  async function handleArchivar() {
    if (perfil.archivado) {
      const result = await runAction(
        'Restaurando candidato',
        () => restaurarCandidato(perfil.id),
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
      () => archivarCandidato(perfil.id),
      { successMessage: 'Candidato archivado' },
    )
    if (result.ok) router.refresh()
  }

  async function handleNota() {
    if (!nuevaNota.trim()) return
    const result = await runAction(
      'Guardando nota',
      () => crearNotaCandidato(perfil.id, nuevaNota),
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
      () => vincularCandidatoAOferta(perfil.id, ofertaSeleccionada),
      { successMessage: 'Candidato vinculado a la oferta' },
    )
    if (result.ok) {
      setOfertaSeleccionada('')
      router.refresh()
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'trayectoria', label: 'Trayectoria' },
    { id: 'solicitudes', label: 'Solicitudes' },
    { id: 'notas', label: 'Notas internas' },
  ]

  return (
    <>
      {/* Header card */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-8 mb-5">
        <div className="flex items-start justify-between gap-6">
          {/* Left: avatar + info */}
          <div className="flex items-start gap-5 flex-1 min-w-0">
            <div className="w-16 h-16 rounded-2xl bg-henko-turquoise/20 flex items-center justify-center text-henko-turquoise font-roxborough text-2xl flex-shrink-0">
              {inicial}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-roxborough text-2xl text-gray-900 mb-0.5">{nombre}</h2>
              {cargoDisplay && (
                <p className="font-raleway text-henko-turquoise font-medium text-sm mb-1">{cargoDisplay}</p>
              )}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                <span className="font-raleway text-sm text-gray-500 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {perfil.email}
                </span>
                {perfil.telefono && (
                  <span className="font-raleway text-sm text-gray-500 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {perfil.telefono}
                  </span>
                )}
                {(perfil.ubicacion || perfil.localidad) && (
                  <span className="font-raleway text-sm text-gray-500 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {[perfil.localidad, perfil.ubicacion, perfil.cp].filter(Boolean).join(', ')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: action buttons */}
          <div className="flex flex-wrap gap-2 flex-shrink-0">
            {cvPrincipal && (
              <button
                type="button"
                onClick={handleDescargarCV}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-henko-turquoise text-henko-turquoise text-xs font-semibold font-raleway hover:bg-henko-turquoise/5 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Descargar CV
              </button>
            )}
            <a
              href={`/api/dashboard/candidatos/${perfil.id}/pdf`}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold font-raleway hover:border-henko-turquoise hover:text-henko-turquoise hover:bg-henko-turquoise/5 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              PDF trayectoria
            </a>
            <button
              type="button"
              onClick={() => setComposeOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold font-raleway hover:border-henko-turquoise hover:text-henko-turquoise hover:bg-henko-turquoise/5 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
              Email
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold font-raleway hover:border-henko-turquoise hover:text-henko-turquoise hover:bg-henko-turquoise/5 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z" />
              </svg>
              Reset pwd
            </button>
            <button
              type="button"
              onClick={handleArchivar}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold font-raleway transition-all ${
                perfil.archivado
                  ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                  : 'border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              {perfil.archivado ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                </svg>
              )}
              {perfil.archivado ? 'Restaurar' : 'Archivar'}
            </button>
          </div>
        </div>

        {perfil.resumen && (
          <p className="font-raleway text-sm text-gray-600 leading-relaxed mt-5 pt-5 border-t border-gray-100">
            {perfil.resumen}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`font-raleway font-semibold text-sm px-4 pb-3 pt-1 transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'text-henko-turquoise border-henko-turquoise'
                : 'text-gray-400 border-transparent hover:text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'trayectoria' && (
        <div className="space-y-5">
          <CandidatoExperiencia experiencias={perfil.experiencias} />
          <CandidatoEducacion educacion={perfil.educacion} />
          <CandidatoIdiomas idiomas={perfil.idiomas} />
          <CandidatoPreferencias perfil={perfil} />
        </div>
      )}

      {activeTab === 'solicitudes' && (
        <div className="space-y-5">
          <CandidatoSolicitudes solicitudes={perfil.solicitudes} candidatoId={perfil.id} />

          {/* Vincular a oferta */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
            <p className="font-raleway font-bold text-henko-turquoise tracking-[0.14em] uppercase text-[11px] mb-4">Vincular a oferta</p>
            {ofertasDisponibles.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Ya está vinculado a todas las ofertas activas.</p>
            ) : (
              <div className="flex gap-2">
                <CustomSelect
                  value={ofertaSeleccionada}
                  onChange={(v) => setOfertaSeleccionada(v)}
                  options={[
                    { value: '', label: 'Seleccionar oferta…' },
                    ...ofertasDisponibles.map(o => ({ value: o.id, label: o.titulo })),
                  ]}
                  className="flex-1"
                />
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
        </div>
      )}

      {activeTab === 'notas' && (
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
      )}

      {composeOpen && (
        <ComposeDrawer
          onClose={() => setComposeOpen(false)}
          defaultTo={perfil.email}
        />
      )}
    </>
  )
}
