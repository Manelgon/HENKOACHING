'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAction } from '@/shared/feedback/FeedbackContext'
import { cambiarEstadoCliente, editarCliente, eliminarCliente } from '@/actions/clientes'
import type {
  EstadoCliente,
  ServicioContratado,
  TarifaTipo,
} from '@/lib/supabase/database.types'
import {
  ESTADOS_CLIENTE,
  SERVICIOS,
  TARIFAS,
  formatImporte,
  getServicioLabel,
  getTarifaLabel,
} from './estados'
import { getOrigenLabel, ORIGENES_LEAD } from '@/features/leads/components/estados'

export type Cliente = {
  id: string
  nombre: string
  email: string
  telefono: string | null
  empresa: string | null
  nif_cif: string | null
  direccion_fiscal: string | null
  servicio_contratado: ServicioContratado | null
  fecha_inicio: string | null
  importe: number | null
  tarifa: TarifaTipo | null
  proxima_sesion: string | null
  linkedin_url: string | null
  web_url: string | null
  estado: EstadoCliente
  origen: string | null
  fecha_conversion: string | null
  lead_id: string | null
  created_at: string | null
}

export default function ClienteFicha({ cliente }: { cliente: Cliente }) {
  const router = useRouter()
  const runAction = useAction()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    nombre: cliente.nombre,
    email: cliente.email,
    telefono: cliente.telefono ?? '',
    empresa: cliente.empresa ?? '',
    nif_cif: cliente.nif_cif ?? '',
    direccion_fiscal: cliente.direccion_fiscal ?? '',
    servicio_contratado: (cliente.servicio_contratado ?? '') as ServicioContratado | '',
    fecha_inicio: cliente.fecha_inicio ?? '',
    importe: cliente.importe?.toString() ?? '',
    tarifa: (cliente.tarifa ?? 'mensual') as TarifaTipo,
    proxima_sesion: cliente.proxima_sesion ? cliente.proxima_sesion.slice(0, 16) : '',
    linkedin_url: cliente.linkedin_url ?? '',
    web_url: cliente.web_url ?? '',
    estado: cliente.estado,
    origen: cliente.origen ?? '',
  })

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const result = await runAction(
      'Guardando cambios',
      () => editarCliente(cliente.id, {
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
        origen: form.origen || null,
      }),
      { successMessage: 'Cliente actualizado' },
    )
    if (result.ok) {
      setEditing(false)
      router.refresh()
    }
  }

  async function handleEstado(nuevo: EstadoCliente) {
    const result = await runAction(
      'Cambiando estado',
      () => cambiarEstadoCliente(cliente.id, nuevo),
      { silentSuccess: true },
    )
    if (result.ok) router.refresh()
  }

  async function handleEliminar() {
    if (!confirm('¿Eliminar este cliente? Esta acción no se puede deshacer.')) return
    const result = await runAction(
      'Eliminando cliente',
      () => eliminarCliente(cliente.id),
      { successMessage: 'Cliente eliminado' },
    )
    if (result.ok) router.push('/dashboard/clientes')
  }

  if (editing) {
    return (
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6 space-y-6">
        <Section title="Datos de contacto">
          <Grid>
            <Input label="Nombre" value={form.nombre} onChange={(v) => setForm({ ...form, nombre: v })} required />
            <Input label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
            <Input label="Teléfono" value={form.telefono} onChange={(v) => setForm({ ...form, telefono: v })} />
            <Input label="LinkedIn" value={form.linkedin_url} onChange={(v) => setForm({ ...form, linkedin_url: v })} />
            <Select label="Origen" value={form.origen} onChange={(v) => setForm({ ...form, origen: v })} options={[{ value: '', label: 'Sin especificar' }, ...ORIGENES_LEAD]} />
          </Grid>
        </Section>

        <Section title="Datos fiscales">
          <Grid>
            <Input label="Empresa" value={form.empresa} onChange={(v) => setForm({ ...form, empresa: v })} />
            <Input label="NIF / CIF" value={form.nif_cif} onChange={(v) => setForm({ ...form, nif_cif: v })} />
            <Input label="Web" value={form.web_url} onChange={(v) => setForm({ ...form, web_url: v })} />
            <Input label="Dirección fiscal" value={form.direccion_fiscal} onChange={(v) => setForm({ ...form, direccion_fiscal: v })} className="md:col-span-2" />
          </Grid>
        </Section>

        <Section title="Servicio">
          <Grid>
            <Select
              label="Servicio"
              value={form.servicio_contratado}
              onChange={(v) => setForm({ ...form, servicio_contratado: v as ServicioContratado | '' })}
              options={[{ value: '', label: 'Sin especificar' }, ...SERVICIOS]}
            />
            <Input label="Fecha inicio" type="date" value={form.fecha_inicio} onChange={(v) => setForm({ ...form, fecha_inicio: v })} />
            <Input label="Importe (€)" type="number" value={form.importe} onChange={(v) => setForm({ ...form, importe: v })} />
            <Select label="Tipo de tarifa" value={form.tarifa} onChange={(v) => setForm({ ...form, tarifa: v as TarifaTipo })} options={TARIFAS} />
            <Input label="Próxima sesión" type="datetime-local" value={form.proxima_sesion} onChange={(v) => setForm({ ...form, proxima_sesion: v })} />
            <Select label="Estado" value={form.estado} onChange={(v) => setForm({ ...form, estado: v as EstadoCliente })} options={ESTADOS_CLIENTE.map((e) => ({ value: e.value, label: e.label }))} />
          </Grid>
        </Section>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button type="button" onClick={() => setEditing(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-raleway text-sm hover:bg-gray-50">
            Cancelar
          </button>
          <button type="submit" className="flex-1 px-5 py-2.5 rounded-xl bg-henko-turquoise text-white font-raleway font-semibold text-sm hover:bg-henko-turquoise-light">
            Guardar cambios
          </button>
        </div>
      </form>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6 space-y-6">
      {/* Estado + acciones */}
      <div>
        <p className="font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Estado</p>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {ESTADOS_CLIENTE.map((e) => {
            const active = cliente.estado === e.value
            return (
              <button
                key={e.value}
                type="button"
                onClick={() => handleEstado(e.value)}
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
      </div>

      <Section title="Contacto">
        <DL>
          <DT>Email</DT>
          <DD><a href={`mailto:${cliente.email}`} className="text-henko-turquoise hover:underline">{cliente.email}</a></DD>
          {cliente.telefono && <><DT>Teléfono</DT><DD><a href={`tel:${cliente.telefono}`} className="text-henko-turquoise hover:underline">{cliente.telefono}</a></DD></>}
          {cliente.linkedin_url && <><DT>LinkedIn</DT><DD><a href={cliente.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-henko-turquoise hover:underline truncate">{cliente.linkedin_url}</a></DD></>}
          <DT>Origen</DT><DD>{getOrigenLabel(cliente.origen)}</DD>
        </DL>
      </Section>

      {(cliente.empresa || cliente.nif_cif || cliente.direccion_fiscal || cliente.web_url) && (
        <Section title="Datos fiscales">
          <DL>
            {cliente.empresa && <><DT>Empresa</DT><DD>{cliente.empresa}</DD></>}
            {cliente.nif_cif && <><DT>NIF / CIF</DT><DD>{cliente.nif_cif}</DD></>}
            {cliente.direccion_fiscal && <><DT>Dirección</DT><DD>{cliente.direccion_fiscal}</DD></>}
            {cliente.web_url && <><DT>Web</DT><DD><a href={cliente.web_url} target="_blank" rel="noopener noreferrer" className="text-henko-turquoise hover:underline truncate">{cliente.web_url}</a></DD></>}
          </DL>
        </Section>
      )}

      <Section title="Servicio">
        <DL>
          <DT>Servicio</DT><DD>{getServicioLabel(cliente.servicio_contratado)}</DD>
          <DT>Tarifa</DT><DD>{cliente.importe != null ? `${formatImporte(cliente.importe, cliente.tarifa)} (${getTarifaLabel(cliente.tarifa)})` : '—'}</DD>
          {cliente.fecha_inicio && <><DT>Fecha inicio</DT><DD>{new Date(cliente.fecha_inicio).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</DD></>}
          {cliente.proxima_sesion && <><DT>Próxima sesión</DT><DD>{new Date(cliente.proxima_sesion).toLocaleString('es-ES', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</DD></>}
        </DL>
      </Section>

      <Section title="Histórico">
        <DL>
          {cliente.fecha_conversion && (
            <>
              <DT>Cliente desde</DT>
              <DD>{new Date(cliente.fecha_conversion).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</DD>
            </>
          )}
          {cliente.lead_id && (
            <>
              <DT>Origen</DT>
              <DD className="text-gray-500 italic">Convertido desde un lead</DD>
            </>
          )}
        </DL>
      </Section>

      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="flex-1 min-w-[140px] px-4 py-2.5 rounded-xl bg-henko-turquoise text-white font-raleway font-semibold text-sm hover:bg-henko-turquoise-light"
        >
          ✎ Editar datos
        </button>
        <button
          type="button"
          onClick={handleEliminar}
          className="px-4 py-2.5 rounded-xl border border-red-200 text-red-500 font-raleway text-sm hover:bg-red-50"
        >
          Eliminar
        </button>
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

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
}

function DL({ children }: { children: React.ReactNode }) {
  return <dl className="space-y-2 font-raleway text-sm">{children}</dl>
}

function DT({ children }: { children: React.ReactNode }) {
  return <dt className="text-xs text-gray-400 uppercase tracking-wider font-bold">{children}</dt>
}

function DD({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <dd className={`text-gray-700 mb-2 break-words ${className}`}>{children}</dd>
}

function Input({
  label, value, onChange, type = 'text', required, className = '',
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; className?: string
}) {
  return (
    <div className={className}>
      <label className="block font-raleway text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
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
