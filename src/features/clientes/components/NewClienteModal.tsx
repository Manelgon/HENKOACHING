'use client'

import { useState } from 'react'
import { useAction } from '@/shared/feedback/FeedbackContext'
import { crearClienteManual } from '@/actions/clientes'
import type { EstadoCliente, ServicioContratado, TarifaTipo } from '@/lib/supabase/database.types'
import { ESTADOS_CLIENTE, SERVICIOS, TARIFAS } from './estados'
import { ORIGENES_LEAD } from '@/features/leads/components/estados'

export default function NewClienteModal({
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
    empresa: '',
    nif_cif: '',
    direccion_fiscal: '',
    servicio_contratado: '' as ServicioContratado | '',
    fecha_inicio: '',
    importe: '',
    tarifa: 'mensual' as TarifaTipo,
    proxima_sesion: '',
    linkedin_url: '',
    web_url: '',
    estado: 'activo' as EstadoCliente,
    origen: 'instagram',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre.trim() || !form.email.trim()) return

    const result = await runAction(
      'Creando cliente',
      () => crearClienteManual({
        nombre: form.nombre,
        email: form.email,
        telefono: form.telefono || null,
        empresa: form.empresa || null,
        nif_cif: form.nif_cif || null,
        direccion_fiscal: form.direccion_fiscal || null,
        servicio_contratado: (form.servicio_contratado || null) as ServicioContratado | null,
        fecha_inicio: form.fecha_inicio || null,
        importe: form.importe ? parseFloat(form.importe) : null,
        tarifa: form.tarifa,
        proxima_sesion: form.proxima_sesion || null,
        linkedin_url: form.linkedin_url || null,
        web_url: form.web_url || null,
        estado: form.estado,
        origen: form.origen,
      }),
      { successMessage: 'Cliente creado' },
    )
    if (result.ok) onCreated()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 md:px-8 py-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <p className="font-roxborough text-2xl text-gray-900">Nuevo cliente manual</p>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 md:px-8 py-6 space-y-6">
          <Section title="Datos de contacto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Nombre *" value={form.nombre} onChange={(v) => setForm({ ...form, nombre: v })} required />
              <Input label="Email *" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
              <Input label="Teléfono" type="tel" value={form.telefono} onChange={(v) => setForm({ ...form, telefono: v })} />
              <Input label="LinkedIn" value={form.linkedin_url} onChange={(v) => setForm({ ...form, linkedin_url: v })} placeholder="https://…" />
              <Select label="Origen" value={form.origen} onChange={(v) => setForm({ ...form, origen: v })} options={ORIGENES_LEAD} />
            </div>
          </Section>

          <Section title="Datos fiscales">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Empresa / Razón social" value={form.empresa} onChange={(v) => setForm({ ...form, empresa: v })} />
              <Input label="NIF / CIF" value={form.nif_cif} onChange={(v) => setForm({ ...form, nif_cif: v })} />
              <Input label="Web" value={form.web_url} onChange={(v) => setForm({ ...form, web_url: v })} placeholder="https://…" />
              <Input label="Dirección fiscal" value={form.direccion_fiscal} onChange={(v) => setForm({ ...form, direccion_fiscal: v })} className="md:col-span-2" />
            </div>
          </Section>

          <Section title="Servicio contratado">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Servicio"
                value={form.servicio_contratado}
                onChange={(v) => setForm({ ...form, servicio_contratado: v as ServicioContratado | '' })}
                options={[{ value: '', label: 'Sin especificar' }, ...SERVICIOS]}
              />
              <Input label="Fecha inicio" type="date" value={form.fecha_inicio} onChange={(v) => setForm({ ...form, fecha_inicio: v })} />
              <Input label="Importe (€)" type="number" value={form.importe} onChange={(v) => setForm({ ...form, importe: v })} placeholder="1500" />
              <Select label="Tipo de tarifa" value={form.tarifa} onChange={(v) => setForm({ ...form, tarifa: v as TarifaTipo })} options={TARIFAS} />
              <Input label="Próxima sesión" type="datetime-local" value={form.proxima_sesion} onChange={(v) => setForm({ ...form, proxima_sesion: v })} />
              <Select label="Estado" value={form.estado} onChange={(v) => setForm({ ...form, estado: v as EstadoCliente })} options={ESTADOS_CLIENTE.map((e) => ({ value: e.value, label: e.label }))} />
            </div>
          </Section>

          <div className="border-t border-gray-100 pt-5 flex flex-col-reverse md:flex-row gap-3">
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
              Crear cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{title}</p>
      {children}
    </div>
  )
}

function Input({
  label, value, onChange, type = 'text', required, placeholder, className = '',
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string; className?: string
}) {
  return (
    <div className={className}>
      <label className="block font-raleway text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
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
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]
}) {
  return (
    <div>
      <label className="block font-raleway text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
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
