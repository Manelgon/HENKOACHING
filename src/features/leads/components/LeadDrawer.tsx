'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAction } from '@/shared/feedback/FeedbackContext'
import { crearNotaLead, eliminarNotaLead } from '@/actions/leads'
import type { EstadoLead } from '@/lib/supabase/database.types'
import { ESTADOS_LEAD, getEstadoMeta, getOrigenLabel } from './estados'
import type { LeadRow } from './LeadsTable'

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
}: {
  lead: LeadRow
  onClose: () => void
  onCambiarEstado: (estado: EstadoLead) => void
  onArchivar: () => void
  onConvertir: () => void
}) {
  const router = useRouter()
  const runAction = useAction()
  const [notas, setNotas] = useState<Nota[]>([])
  const [nuevaNota, setNuevaNota] = useState('')
  const [loadingNotas, setLoadingNotas] = useState(true)
  const estado = getEstadoMeta(lead.estado)

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
    if (!confirm('¿Eliminar esta nota?')) return
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
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 flex-shrink-0"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Estado + acciones rápidas */}
          <div className="space-y-3">
            <p className="font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Estado</p>
            <div className="flex flex-wrap gap-2">
              {ESTADOS_LEAD.map((e) => {
                const active = lead.estado === e.value
                return (
                  <button
                    key={e.value}
                    type="button"
                    onClick={() => onCambiarEstado(e.value)}
                    disabled={active}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-raleway font-semibold transition-all ${
                      active
                        ? `${e.bg} ${e.color} ring-2 ring-offset-1 ring-current cursor-default`
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

          {/* Acciones */}
          <div className="border-t border-gray-100 pt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onConvertir}
              className="flex-1 min-w-[140px] px-4 py-2.5 rounded-xl bg-henko-turquoise text-white font-raleway font-semibold text-sm hover:bg-henko-turquoise-light transition-colors"
            >
              ✓ Convertir a cliente
            </button>
            <button
              type="button"
              onClick={onArchivar}
              className="px-4 py-2.5 rounded-xl border border-red-200 text-red-500 font-raleway text-sm hover:bg-red-50 transition-colors"
            >
              Archivar
            </button>
          </div>
        </div>
      </div>
    </div>
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
