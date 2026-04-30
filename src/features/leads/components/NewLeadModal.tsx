'use client'

import { useState } from 'react'
import { useAction } from '@/shared/feedback/FeedbackContext'
import { crearLeadManual } from '@/actions/leads'
import type { EstadoLead } from '@/lib/supabase/database.types'
import { ESTADOS_LEAD, ORIGENES_LEAD } from './estados'

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre.trim() || !form.email.trim() || !form.mensaje.trim()) {
      return
    }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 md:px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <p className="font-roxborough text-2xl text-gray-900">Nuevo lead manual</p>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 md:px-8 py-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre *"
              value={form.nombre}
              onChange={(v) => setForm({ ...form, nombre: v })}
              required
            />
            <Input
              label="Email *"
              type="email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              required
            />
            <Input
              label="Teléfono"
              type="tel"
              value={form.telefono}
              onChange={(v) => setForm({ ...form, telefono: v })}
            />
            <Input
              label="Asunto"
              value={form.asunto}
              onChange={(v) => setForm({ ...form, asunto: v })}
            />
            <Input
              label="Servicio de interés"
              value={form.servicio_interes}
              onChange={(v) => setForm({ ...form, servicio_interes: v })}
              placeholder="ej: Operaciones, Liderazgo…"
            />
            <Select
              label="Origen *"
              value={form.origen}
              onChange={(v) => setForm({ ...form, origen: v })}
              options={ORIGENES_LEAD}
            />
            <Select
              label="Estado inicial"
              value={form.estado}
              onChange={(v) => setForm({ ...form, estado: v as EstadoLead })}
              options={ESTADOS_LEAD.map((e) => ({ value: e.value, label: e.label }))}
            />
          </div>

          <div>
            <label className="block font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              Mensaje / Notas *
            </label>
            <textarea
              value={form.mensaje}
              onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
              required
              rows={4}
              placeholder="¿Qué te dijo? ¿Qué necesita?"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-raleway text-sm hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-5 py-2.5 rounded-xl bg-henko-turquoise text-white font-raleway font-semibold text-sm hover:bg-henko-turquoise-light"
            >
              Crear lead
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  required,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <div>
      <label className="block font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white"
      />
    </div>
  )
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      <label className="block font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}
