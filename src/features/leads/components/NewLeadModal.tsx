'use client'

import { useEffect, useState } from 'react'
import { useAction } from '@/shared/feedback/FeedbackContext'
import { crearLeadManual } from '@/actions/leads'
import type { EstadoLead } from '@/lib/supabase/database.types'
import { ESTADOS_LEAD, ORIGENES_LEAD } from './estados'
import CustomSelect from '@/shared/components/CustomSelect'

const labelClass = 'text-[10px] tracking-[0.14em] text-henko-turquoise font-bold mb-1.5 block'
const inputBase = 'w-full px-4 py-2.5 rounded-xl text-sm border-[1.5px] bg-henko-white outline-none transition-colors'
const inputClass = inputBase + ' border-gray-200 focus:border-henko-turquoise'
const inputError = inputBase + ' border-red-400 bg-red-50 focus:border-red-500'

export default function NewLeadModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: () => void
}) {
  const runAction = useAction()
  const [enviado, setEnviado] = useState(false)
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: '',
    servicio_interes: '',
    origen: '',
    estado: '' as EstadoLead | '',
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
    setEnviado(true)
    if (!form.nombre.trim() || !form.email.trim() || !form.estado) return

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
        origen: form.origen || 'panel',
        estado: form.estado as EstadoLead,
      }),
      { successMessage: 'Lead creado' },
    )
    if (result.ok) onCreated()
  }

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/40 backdrop-blur-sm" />
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white h-full flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between gap-4 z-10 flex-shrink-0">
          <p className="font-roxborough text-xl text-gray-900">Nuevo lead manual</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="w-9 h-9 rounded-full hover:bg-black/5 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          <Field label="NOMBRE *" value={form.nombre} onChange={(v) => setForm({ ...form, nombre: v })} error={enviado && !form.nombre.trim()} />
          <Field label="EMAIL *" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} error={enviado && !form.email.trim()} />

          <div className="grid grid-cols-2 gap-3">
            <FieldInline label="TELÉFONO" type="tel" value={form.telefono} onChange={(v) => setForm({ ...form, telefono: v })} />
            <FieldInline label="ASUNTO" value={form.asunto} onChange={(v) => setForm({ ...form, asunto: v })} />
          </div>

          <Field
            label="SERVICIO DE INTERÉS"
            value={form.servicio_interes}
            onChange={(v) => setForm({ ...form, servicio_interes: v })}
            placeholder="ej. Operaciones, Liderazgo…"
          />

          <div className="grid grid-cols-2 gap-3">
            <SelectInline
              label="ORIGEN"
              value={form.origen}
              onChange={(v) => setForm({ ...form, origen: v })}
              options={ORIGENES_LEAD}
              placeholder="Selecciona…"
            />
            <SelectInline
              label="ESTADO INICIAL *"
              value={form.estado}
              onChange={(v) => setForm({ ...form, estado: v as EstadoLead | '' })}
              options={ESTADOS_LEAD.map((e) => ({ value: e.value, label: e.label }))}
              placeholder="Selecciona…"
              required
              error={enviado && !form.estado}
            />
          </div>

          <div>
            <label className={labelClass}>MENSAJE / NOTAS</label>
            <textarea
              rows={5}
              placeholder="¿Qué te dijo? ¿Qué necesita?"
              className={inputClass + ' resize-y leading-relaxed'}
              value={form.mensaje}
              onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center bg-transparent border-2 border-henko-turquoise text-henko-turquoise px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-henko-turquoise hover:text-white transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 inline-flex items-center justify-center bg-henko-turquoise text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-henko-turquoise-light hover:shadow-lg transition-all"
          >
            Crear lead
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({
  label, value, onChange, type = 'text', placeholder, error,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; error?: boolean
}) {
  return (
    <div>
      <label className={error ? labelClass.replace('text-henko-turquoise', 'text-red-500') : labelClass}>{label}</label>
      <input
        type={type}
        className={error ? inputError : inputClass}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
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
  label, value, onChange, options, placeholder, error,
}: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string; required?: boolean; error?: boolean
}) {
  const allOptions = placeholder ? [{ value: '', label: placeholder }, ...options] : options
  return (
    <div>
      <label className={error ? labelClass.replace('text-henko-turquoise', 'text-red-500') : labelClass}>{label}</label>
      <CustomSelect
        value={value}
        onChange={(v) => onChange(v)}
        options={allOptions}
        className="w-full"
      />
    </div>
  )
}
