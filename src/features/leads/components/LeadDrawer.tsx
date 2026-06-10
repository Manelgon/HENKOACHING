'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAction, useConfirm } from '@/shared/feedback/FeedbackContext'
import { crearNotaLead, eliminarNotaLead } from '@/actions/leads'
import type { EstadoLead } from '@/lib/supabase/database.types'
import CheckCircleIcon from '@/shared/components/icons/CheckCircleIcon'
import { ESTADOS_LEAD, getEstadoMeta, getOrigenLabel } from './estados'
import type { LeadRow } from './LeadsTable'
import AccionesMenu, { type AccionItem } from '@/shared/components/AccionesMenu'
import AgendarCitaModal from '@/shared/components/AgendarCitaModal'
import CitasHistorial from '@/shared/components/CitasHistorial'

import { TIPOS_CITA, TIPOS_TAREA } from '@/shared/lib/tipos-cita'

const ICON_CAL = 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5'

type Nota = {
  id: string
  contenido: string
  created_at: string | null
  autor_id: string | null
  autor_email?: string | null
}

export default function LeadDrawer({
  lead,
  onClose,
  onCambiarEstado,
  onArchivar,
  onConvertir,
  onDesarchivar,
  onEliminar,
}: {
  lead: LeadRow
  onClose: () => void
  onCambiarEstado: (estado: EstadoLead) => void
  onArchivar: () => void
  onConvertir: () => void
  onDesarchivar?: () => void
  onEliminar?: () => void
}) {
  const router = useRouter()
  const runAction = useAction()
  const confirm = useConfirm()
  const [notas, setNotas] = useState<Nota[]>([])
  const [nuevaNota, setNuevaNota] = useState('')
  const [loadingNotas, setLoadingNotas] = useState(true)
  const [agendarOpen, setAgendarOpen] = useState(false)
  const estado = getEstadoMeta(lead.estado)

  const leadAcciones: AccionItem[] = lead.archivado
    ? [
        { label: 'Agendar cita', onClick: () => setAgendarOpen(true), iconPath: ICON_CAL },
        ...(onDesarchivar ? [{ label: 'Recuperar lead', onClick: onDesarchivar, iconPath: 'M9 15 3 9m0 0 6-6M3 9h12a6 6 0 010 12h-3' }] : []),
        ...(onEliminar ? [{ label: 'Eliminar definitivamente', onClick: onEliminar, danger: true, divider: true, iconPath: 'm14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0' }] : []),
      ]
    : [
        { label: 'Agendar cita', onClick: () => setAgendarOpen(true), iconPath: ICON_CAL },
        { label: 'Convertir a cliente', onClick: onConvertir, iconPath: 'M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z' },
        { label: 'Archivar lead', onClick: onArchivar, danger: true, divider: true, iconPath: 'm20.25 7.5-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10.5 11.25h3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z' },
      ]

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoadingNotas(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('lead_notas')
        .select('id, contenido, created_at, autor_id, profiles:autor_id(email)')
        .eq('lead_id', lead.id)
        .order('created_at', { ascending: false })

      if (cancelled) return
      const mapped = (data ?? []).map((n) => ({
        id: n.id,
        contenido: n.contenido,
        created_at: n.created_at,
        autor_id: n.autor_id,
        autor_email: (n.profiles as { email?: string } | null)?.email ?? null,
      }))
      setNotas(mapped)
      setLoadingNotas(false)
    }
    load()
    return () => { cancelled = true }
  }, [lead.id])

  async function handleAddNota(e: React.FormEvent) {
    e.preventDefault()
    if (!nuevaNota.trim()) return
    const result = await runAction(
      'Guardando nota',
      () => crearNotaLead(lead.id, nuevaNota),
      { successMessage: 'Nota añadida' },
    )
    if (result.ok) {
      setNuevaNota('')
      router.refresh()
      // Recargar notas
      const supabase = createClient()
      const { data } = await supabase
        .from('lead_notas')
        .select('id, contenido, created_at, autor_id, profiles:autor_id(email)')
        .eq('lead_id', lead.id)
        .order('created_at', { ascending: false })
      const mapped = (data ?? []).map((n) => ({
        id: n.id,
        contenido: n.contenido,
        created_at: n.created_at,
        autor_id: n.autor_id,
        autor_email: (n.profiles as { email?: string } | null)?.email ?? null,
      }))
      setNotas(mapped)
    }
  }

  async function handleDelNota(notaId: string) {
    const ok = await confirm({
      title: 'Eliminar nota',
      description: '¿Eliminar esta nota? Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
      variant: 'danger',
    })
    if (!ok) return
    const result = await runAction(
      'Eliminando nota',
      () => eliminarNotaLead(notaId),
      { successMessage: 'Nota eliminada' },
    )
    if (result.ok) setNotas((n) => n.filter((x) => x.id !== notaId))
  }

  const fecha = lead.created_at
    ? new Date(lead.created_at).toLocaleString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <>
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/40" />
      <div
        className="w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 flex items-start justify-between gap-4 z-10">
          <div className="min-w-0">
            <p className="font-roxborough text-xl text-gray-900 truncate">{lead.nombre}</p>
            <p className="font-raleway text-sm text-gray-500 truncate">{lead.email}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <AccionesMenu items={leadAcciones} />
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Estado + acciones rápidas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Estado</p>
              {lead.archivado && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px] font-raleway font-semibold uppercase tracking-wider">
                  Archivado
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {ESTADOS_LEAD.map((e) => {
                const active = lead.estado === e.value
                const disabled = active || !!lead.archivado
                return (
                  <button
                    key={e.value}
                    type="button"
                    onClick={() => onCambiarEstado(e.value)}
                    disabled={disabled}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-raleway font-semibold transition-all ${
                      active
                        ? `${e.bg} ${e.color} ring-2 ring-offset-1 ring-current cursor-default`
                        : lead.archivado
                          ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${e.dot}`} />
                    {e.label}
                  </button>
                )
              })}
            </div>
            <p className="font-raleway text-xs text-gray-400">
              Estado actual: <span className={`font-semibold ${estado.color}`}>{estado.label}</span>
            </p>
          </div>

          {/* Datos contacto */}
          <div className="bg-gray-50 rounded-2xl p-5 space-y-2.5 font-raleway text-sm">
            <Field label="Email">
              <a href={`mailto:${lead.email}`} className="text-henko-turquoise hover:underline">{lead.email}</a>
            </Field>
            {lead.telefono && (
              <Field label="Teléfono">
                <a href={`tel:${lead.telefono}`} className="text-henko-turquoise hover:underline">{lead.telefono}</a>
              </Field>
            )}
            {lead.servicio_interes && <Field label="Servicio">{lead.servicio_interes}</Field>}
            {lead.asunto && <Field label="Asunto">{lead.asunto}</Field>}
            <Field label="Origen">{getOrigenLabel(lead.origen)}</Field>
            <Field label="Recibido">{fecha}</Field>
            {lead.creado_manualmente && (
              <p className="text-xs text-gray-400 italic pt-2">⚙ Lead añadido manualmente</p>
            )}
          </div>

          {/* Mensaje */}
          <div>
            <p className="font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Mensaje</p>
            <p className="bg-white border border-gray-100 rounded-2xl px-5 py-4 leading-relaxed whitespace-pre-line text-sm text-gray-700 font-raleway">
              {lead.mensaje}
            </p>
          </div>

          {/* Citas */}
          <CitasHistorial
            recurso={{ tipo: 'lead', id: lead.id, nombre: lead.nombre, email: lead.email, contexto: lead.asunto ?? lead.servicio_interes ?? undefined }}
            tiposCita={TIPOS_CITA.lead}
            tiposTarea={TIPOS_TAREA.lead}
            compact
          />

          {/* Notas */}
          <div>
            <p className="font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Notas internas</p>
            <form onSubmit={handleAddNota} className="mb-3">
              <textarea
                value={nuevaNota}
                onChange={(e) => setNuevaNota(e.target.value)}
                placeholder="Añadir una nota… (ej: le llamé martes, no contestó)"
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white resize-none"
              />
              <button
                type="submit"
                disabled={!nuevaNota.trim()}
                className="mt-2 px-4 py-2 rounded-xl bg-henko-turquoise text-white text-xs font-raleway font-semibold hover:bg-henko-turquoise-light disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Añadir nota
              </button>
            </form>

            {loadingNotas ? (
              <p className="text-xs text-gray-400 font-raleway">Cargando…</p>
            ) : notas.length === 0 ? (
              <p className="text-xs text-gray-400 font-raleway italic">Aún no hay notas.</p>
            ) : (
              <div className="space-y-2">
                {notas.map((n) => (
                  <div key={n.id} className="bg-henko-yellow/20 border border-henko-yellow/40 rounded-xl px-4 py-3">
                    <p className="font-raleway text-sm text-gray-800 whitespace-pre-line">{n.contenido}</p>
                    <div className="flex items-center justify-between mt-2 text-[11px] text-gray-500 font-raleway">
                      <span>
                        {n.autor_email ?? 'Sistema'} · {n.created_at ? new Date(n.created_at).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDelNota(n.id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Consentimiento RGPD */}
          {(lead.acepto_privacidad_at || lead.consent_text) && (
            <div className="pt-4 border-t border-gray-100">
              <p className="font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Consentimiento RGPD</p>
              <div className="space-y-2">
                {lead.acepto_privacidad_at && (
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    <span className="font-raleway text-xs text-gray-500">
                      Aceptado el{' '}
                      <strong className="text-gray-700">
                        {new Date(lead.acepto_privacidad_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </strong>
                    </span>
                  </div>
                )}
                {lead.consent_text && (
                  <p className="font-raleway text-xs text-gray-500 italic bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                    &ldquo;{lead.consent_text}&rdquo;
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    {agendarOpen && (
      <AgendarCitaModal
        recurso={{ tipo: 'lead', id: lead.id, nombre: lead.nombre, email: lead.email, contexto: lead.asunto ?? lead.servicio_interes ?? undefined }}
        tiposCita={TIPOS_CITA.lead}
        tiposTarea={TIPOS_TAREA.lead}
        onClose={() => setAgendarOpen(false)}
        onDone={() => setAgendarOpen(false)}
      />
    )}
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-xs text-gray-400 uppercase tracking-wider font-bold w-24 flex-shrink-0">{label}</span>
      <span className="text-gray-700 break-all">{children}</span>
    </div>
  )
}
