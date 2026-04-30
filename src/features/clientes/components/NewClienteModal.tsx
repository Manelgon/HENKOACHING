'use client'

import { useEffect, useState } from 'react'
import { useAction } from '@/shared/feedback/FeedbackContext'
import { crearClienteManual } from '@/actions/clientes'
import type { EstadoCliente, ServicioContratado, TarifaTipo } from '@/lib/supabase/database.types'
import { ESTADOS_CLIENTE, SERVICIOS, TARIFAS } from './estados'
import { ORIGENES_LEAD } from '@/features/leads/components/estados'

const labelClass = 'text-[10px] tracking-[0.14em] text-henko-turquoise font-bold mb-1.5 block'
const inputClass = 'w-full px-4 py-2.5 rounded-xl text-sm border-[1.5px] border-black/5 bg-henko-white outline-none focus:border-henko-turquoise transition-colors'

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
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm px-3 py-4 sm:px-4 sm:py-10"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl sm:rounded-3xl border border-black/5 w-full max-w-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-9 pt-5 sm:pt-7 pb-4 sm:pb-5 border-b border-black/5">
          <h2 className="font-roxborough text-xl sm:text-2xl text-gray-900">Nuevo cliente manual</h2>
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
        <div className="px-5 sm:px-9 py-5 sm:py-7 space-y-6">
          <Section title="Datos de contacto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="NOMBRE *" value={form.nombre} onChange={(v) => setForm({ ...form, nombre: v })} required />
              <Field label="EMAIL *" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
              <Field label="TELÉFONO" type="tel" value={form.telefono} onChange={(v) => setForm({ ...form, telefono: v })} />
              <Field label="LINKEDIN" value={form.linkedin_url} onChange={(v) => setForm({ ...form, linkedin_url: v })} placeholder="https://…" />
              <Select
                label="ORIGEN"
                value={form.origen}
                onChange={(v) => setForm({ ...form, origen: v })}
                options={ORIGENES_LEAD}
              />
            </div>
          </Section>

          <Section title="Datos fiscales">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="EMPRESA / RAZÓN SOCIAL" value={form.empresa} onChange={(v) => setForm({ ...form, empresa: v })} />
              <Field label="NIF / CIF" value={form.nif_cif} onChange={(v) => setForm({ ...form, nif_cif: v })} />
              <Field label="WEB" value={form.web_url} onChange={(v) => setForm({ ...form, web_url: v })} placeholder="https://…" />
              <div className="sm:col-span-2">
                <Field label="DIRECCIÓN FISCAL" value={form.direccion_fiscal} onChange={(v) => setForm({ ...form, direccion_fiscal: v })} />
              </div>
            </div>
          </Section>

          <Section title="Servicio contratado">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="SERVICIO"
                value={form.servicio_contratado}
                onChange={(v) => setForm({ ...form, servicio_contratado: v as ServicioContratado | '' })}
                options={[{ value: '', label: 'Sin especificar' }, ...SERVICIOS]}
              />
              <Field label="FECHA INICIO" type="date" value={form.fecha_inicio} onChange={(v) => setForm({ ...form, fecha_inicio: v })} />
              <Field label="IMPORTE (€)" type="number" value={form.importe} onChange={(v) => setForm({ ...form, importe: v })} placeholder="1500" />
              <Select
                label="TIPO DE TARIFA"
                value={form.tarifa}
                onChange={(v) => setForm({ ...form, tarifa: v as TarifaTipo })}
                options={TARIFAS}
              />
              <Field label="PRÓXIMA SESIÓN" type="datetime-local" value={form.proxima_sesion} onChange={(v) => setForm({ ...form, proxima_sesion: v })} />
              <Select
                label="ESTADO"
                value={form.estado}
                onChange={(v) => setForm({ ...form, estado: v as EstadoCliente })}
                options={ESTADOS_CLIENTE.map((e) => ({ value: e.value, label: e.label }))}
              />
            </div>
          </Section>
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
            Crear cliente
          </button>
        </div>
      </form>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-roxborough text-base sm:text-lg text-gray-900 mb-3">{title}</p>
      {children}
    </div>
  )
}

function Field({
  label, value, onChange, type = 'text', required, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <input
        type={type}
        className={inputClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
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
