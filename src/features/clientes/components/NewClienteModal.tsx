'use client'

import { useEffect, useState } from 'react'
import { useAction } from '@/shared/feedback/FeedbackContext'
import { crearClienteManual } from '@/actions/clientes'
import type { EstadoCliente, ServicioContratado, TarifaTipo, TipoCliente } from '@/lib/supabase/database.types'
import { ESTADOS_CLIENTE, SERVICIOS, TARIFAS } from './estados'
import { ORIGENES_LEAD } from '@/features/leads/components/estados'

const labelClass = 'text-[10px] tracking-[0.14em] text-henko-turquoise font-bold mb-1.5 block'
const labelErrorClass = 'text-[10px] tracking-[0.14em] text-red-500 font-bold mb-1.5 block'
const inputBase = 'w-full px-4 py-2.5 rounded-xl text-sm border-[1.5px] bg-henko-white outline-none transition-colors'
const inputClass = inputBase + ' border-gray-200 focus:border-henko-turquoise'
const inputError = inputBase + ' border-red-400 bg-red-50 focus:border-red-500'

export default function NewClienteModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: () => void
}) {
  const runAction = useAction()
  const [form, setForm] = useState({
    tipo: '' as TipoCliente | '',
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
    origen: '',
    slug: '',
    logo_url: '',
    descripcion: '',
    ubicacion: '',
  })

  const esEmpresa = form.tipo === 'empresa'
  const tipoSeleccionado = form.tipo !== ''
  const [showServicio, setShowServicio] = useState(false)
  const [showFichaPublica, setShowFichaPublica] = useState(false)
  const [enviado, setEnviado] = useState(false)

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
    if (!form.tipo || !form.nombre.trim() || (!esEmpresa && !form.email.trim())) return

    const result = await runAction(
      'Creando cliente',
      () => crearClienteManual({
        tipo: form.tipo as TipoCliente,
        nombre: form.nombre,
        email: form.email || null,
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
        origen: form.origen || 'panel',
        slug: esEmpresa ? (form.slug || null) : null,
        logo_url: esEmpresa ? (form.logo_url || null) : null,
        descripcion: esEmpresa ? (form.descripcion || null) : null,
        ubicacion: esEmpresa ? (form.ubicacion || null) : null,
      }),
      { successMessage: 'Cliente creado' },
    )
    if (result.ok) onCreated()
  }

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/40 backdrop-blur-sm" />
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white h-full flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between gap-4 z-10 flex-shrink-0">
          <p className="font-roxborough text-xl text-gray-900">Nuevo cliente manual</p>
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
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <Section title="Tipo de cliente *">
            <div className="grid grid-cols-2 gap-2">
              <TipoOption active={form.tipo === 'particular'} onClick={() => setForm({ ...form, tipo: 'particular' })} label="Particular" />
              <TipoOption active={form.tipo === 'empresa'} onClick={() => setForm({ ...form, tipo: 'empresa' })} label="Empresa" />
            </div>
            {enviado && !tipoSeleccionado && (
              <p className="mt-2 font-raleway text-xs text-red-500">Selecciona un tipo para continuar</p>
            )}
          </Section>

          {tipoSeleccionado && (
            <>
              <Section title="Datos de contacto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label={esEmpresa ? 'NOMBRE COMERCIAL *' : 'NOMBRE *'} value={form.nombre} onChange={(v) => setForm({ ...form, nombre: v })} required error={enviado && !form.nombre.trim()} />
                  <Field
                    label={esEmpresa ? 'EMAIL CONTACTO' : 'EMAIL *'}
                    type="email"
                    value={form.email}
                    onChange={(v) => setForm({ ...form, email: v })}
                    required={!esEmpresa}
                    error={enviado && !esEmpresa && !form.email.trim()}
                  />
                  <Field label="TELÉFONO" type="tel" value={form.telefono} onChange={(v) => setForm({ ...form, telefono: v })} />
                  {!esEmpresa && (
                    <Field label="LINKEDIN" value={form.linkedin_url} onChange={(v) => setForm({ ...form, linkedin_url: v })} placeholder="https://…" />
                  )}
                  <Select
                    label="ORIGEN"
                    value={form.origen}
                    onChange={(v) => setForm({ ...form, origen: v })}
                    options={ORIGENES_LEAD}
                    placeholder="Selecciona…"
                  />
                </div>
              </Section>

              <Section title="Datos fiscales">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {!esEmpresa && (
                    <Field label="EMPRESA / RAZÓN SOCIAL" value={form.empresa} onChange={(v) => setForm({ ...form, empresa: v })} />
                  )}
                  <Field label="NIF / CIF" value={form.nif_cif} onChange={(v) => setForm({ ...form, nif_cif: v })} />
                  {!esEmpresa && (
                    <Field label="WEB" value={form.web_url} onChange={(v) => setForm({ ...form, web_url: v })} placeholder="https://…" />
                  )}
                  <div className="sm:col-span-2">
                    <Field label="DIRECCIÓN FISCAL" value={form.direccion_fiscal} onChange={(v) => setForm({ ...form, direccion_fiscal: v })} />
                  </div>
                </div>
              </Section>

              {!showServicio ? (
                <button
                  type="button"
                  onClick={() => setShowServicio(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-gray-300 text-gray-500 font-raleway text-sm hover:border-henko-turquoise hover:text-henko-turquoise transition-colors w-full"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Añadir servicio contratado (opcional)
                </button>
              ) : (
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
                  <button
                    type="button"
                    onClick={() => setShowServicio(false)}
                    className="mt-3 font-raleway text-xs font-semibold text-red-400 hover:text-red-600 transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Quitar servicio
                  </button>
                </Section>
              )}

              {/* Secciones opcionales — siempre al final */}
              {!showFichaPublica ? (
                <button
                  type="button"
                  onClick={() => setShowFichaPublica(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-gray-300 text-gray-500 font-raleway text-sm hover:border-henko-turquoise hover:text-henko-turquoise transition-colors w-full"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Añadir ficha en bolsa de empleo (opcional)
                </button>
              ) : (
                <Section title="Ficha pública (bolsa de empleo)">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="SLUG (URL)" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} placeholder="se autogenera del nombre" />
                    <Field label="UBICACIÓN" value={form.ubicacion} onChange={(v) => setForm({ ...form, ubicacion: v })} placeholder="Palma, Mallorca" />
                    <Field label="LOGO URL" value={form.logo_url} onChange={(v) => setForm({ ...form, logo_url: v })} placeholder="https://…" />
                    <Field label="WEB" value={form.web_url} onChange={(v) => setForm({ ...form, web_url: v })} placeholder="https://…" />
                    <div className="sm:col-span-2">
                      <Field label="DESCRIPCIÓN" value={form.descripcion} onChange={(v) => setForm({ ...form, descripcion: v })} />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFichaPublica(false)}
                    className="mt-3 font-raleway text-xs font-semibold text-red-400 hover:text-red-600 transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Quitar ficha pública
                  </button>
                </Section>
              )}
            </>
          )}
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
            Crear cliente
          </button>
        </div>
      </form>
    </div>
  )
}

function TipoOption({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-xl border-[1.5px] px-4 py-3 transition-colors font-raleway font-semibold text-sm ${
        active
          ? 'border-henko-turquoise bg-henko-turquoise/5 text-henko-turquoise'
          : 'border-black/5 bg-henko-white text-gray-700 hover:border-black/10'
      }`}
    >
      {label}
    </button>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-roxborough text-base text-gray-900 mb-3">{title}</p>
      {children}
    </div>
  )
}

function Field({
  label, value, onChange, type = 'text', required, placeholder, error,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string; error?: boolean
}) {
  return (
    <div>
      <label className={error ? labelErrorClass : labelClass}>{label}</label>
      <input
        type={type}
        className={error ? inputError : inputClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
      />
    </div>
  )
}

function Select({
  label, value, onChange, options, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <select
        className={inputClass + ' appearance-none'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}
