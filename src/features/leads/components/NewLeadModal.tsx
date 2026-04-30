'use client'

import { useEffect, useState } from 'react'
import { useAction } from '@/shared/feedback/FeedbackContext'
import { crearLeadManual } from '@/actions/leads'
import type { EstadoLead } from '@/lib/supabase/database.types'
import { ESTADOS_LEAD, ORIGENES_LEAD } from './estados'

const labelClass = 'text-[10px] tracking-[0.14em] text-henko-turquoise font-bold mb-1.5 block'
const inputClass = 'w-full px-4 py-2.5 rounded-xl text-sm border-[1.5px] border-black/5 bg-henko-white outline-none focus:border-henko-turquoise transition-colors'

export default function NewLeadModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: () => void
}) {
  const runAction = useAction()
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: '',
    servicio_interes: '',
    origen: 'instagram',
    estado: 'pendiente' as EstadoLead,
  })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre.trim() || !form.email.trim() || !form.mensaje.trim()) return

    const result = await runAction(
      'Creando lead',
      () => crearLeadManual({
        tipo: 'contacto_general',
        nombre: form.nombre,
        email: form.email,
        telefono: form.telefono || undefined,
        asunto: form.asunto || undefined,
        mensaje: form.mensaje,
        servicio_interes: form.servicio_interes || undefined,
        origen: form.origen,
        estado: form.estado,
      }),
      { successMessage: 'Lead creado' },
    )
    if (result.ok) onCreated()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm px-3 py-4 sm:px-4 sm:py-10"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl sm:rounded-3xl border border-black/5 w-full max-w-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-9 pt-5 sm:pt-7 pb-4 sm:pb-5 border-b border-black/5">
          <h2 className="font-roxborough text-xl sm:text-2xl text-gray-900">Nuevo lead manual</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="w-9 h-9 rounded-full hover:bg-black/5 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 sm:px-9 py-5 sm:py-7">
          <Field label="NOMBRE *" value={form.nombre} onChange={(v) => setForm({ ...form, nombre: v })} />
          <Field label="EMAIL *" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <FieldInline label="TELÉFONO" type="tel" value={form.telefono} onChange={(v) => setForm({ ...form, telefono: v })} />
            <FieldInline label="ASUNTO" value={form.asunto} onChange={(v) => setForm({ ...form, asunto: v })} />
          </div>

          <Field
            label="SERVICIO DE INTERÉS"
            value={form.servicio_interes}
            onChange={(v) => setForm({ ...form, servicio_interes: v })}
            placeholder="ej. Operaciones, Liderazgo…"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <SelectInline
              label="ORIGEN *"
              value={form.origen}
              onChange={(v) => setForm({ ...form, origen: v })}
              options={ORIGENES_LEAD}
            />
            <SelectInline
              label="ESTADO INICIAL"
              value={form.estado}
              onChange={(v) => setForm({ ...form, estado: v as EstadoLead })}
              options={ESTADOS_LEAD.map((e) => ({ value: e.value, label: e.label }))}
            />
          </div>

          <div className="mb-2">
            <label className={labelClass}>MENSAJE / NOTAS *</label>
            <textarea
              required
              rows={4}
              placeholder="¿Qué te dijo? ¿Qué necesita?"
              className={inputClass + ' resize-y leading-relaxed'}
              value={form.mensaje}
              onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 px-5 sm:px-9 py-4 sm:py-5 border-t border-black/5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-henko-turquoise text-henko-turquoise px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-henko-turquoise hover:text-white transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-henko-turquoise text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-henko-turquoise-light hover:shadow-lg transition-all"
          >
            Crear lead
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({
  label, value, onChange, type = 'text', placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  return (
    <div className="mb-4">
      <label className={labelClass}>{label}</label>
      <input
        type={type}
        className={inputClass}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        required={label.includes('*')}
      />
    </div>
  )
}

function FieldInline({
  label, value, onChange, type = 'text', placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <input
        type={type}
        className={inputClass}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function SelectInline({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <select
        className={inputClass + ' appearance-none'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}
