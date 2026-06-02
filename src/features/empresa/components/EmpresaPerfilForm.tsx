'use client'

import { useState, useTransition } from 'react'
import { actualizarPerfilEmpresa } from '@/features/empresa/actions/empresa'

type Initial = {
  nombre: string
  email: string | null
  telefono: string | null
  descripcion: string | null
  logoUrl: string | null
  ubicacion: string | null
  webUrl: string | null
  linkedinUrl: string | null
  nifCif: string | null
}

type Props = {
  clienteId: string
  initial: Initial
}

export default function EmpresaPerfilForm({ clienteId, initial }: Props) {
  const [form, setForm] = useState({
    nombre: initial.nombre,
    email: initial.email ?? '',
    telefono: initial.telefono ?? '',
    descripcion: initial.descripcion ?? '',
    logoUrl: initial.logoUrl ?? '',
    ubicacion: initial.ubicacion ?? '',
    webUrl: initial.webUrl ?? '',
    linkedinUrl: initial.linkedinUrl ?? '',
    nifCif: initial.nifCif ?? '',
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleChange(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      setSuccess(false)
      setError(null)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    startTransition(async () => {
      const result = await actualizarPerfilEmpresa(clienteId, {
        nombre: form.nombre,
        email: form.email || null,
        telefono: form.telefono || null,
        descripcion: form.descripcion || null,
        logoUrl: form.logoUrl || null,
        ubicacion: form.ubicacion || null,
        webUrl: form.webUrl || null,
        linkedinUrl: form.linkedinUrl || null,
        nifCif: form.nifCif || null,
      })
      if (result.error) setError(result.error)
      else setSuccess(true)
    })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-roxborough text-2xl text-gray-900">Mi perfil</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-xl p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombre de empresa *">
            <input
              type="text"
              value={form.nombre}
              onChange={handleChange('nombre')}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg font-raleway text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-henko-turquoise/30 focus:border-henko-turquoise transition-colors"
              placeholder="Mi empresa S.L."
            />
          </Field>

          <Field label="NIF / CIF">
            <input
              type="text"
              value={form.nifCif}
              onChange={handleChange('nifCif')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg font-raleway text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-henko-turquoise/30 focus:border-henko-turquoise transition-colors"
              placeholder="B12345678"
            />
          </Field>

          <Field label="Email de contacto">
            <input
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg font-raleway text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-henko-turquoise/30 focus:border-henko-turquoise transition-colors"
              placeholder="contacto@empresa.com"
            />
          </Field>

          <Field label="Teléfono">
            <input
              type="tel"
              value={form.telefono}
              onChange={handleChange('telefono')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg font-raleway text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-henko-turquoise/30 focus:border-henko-turquoise transition-colors"
              placeholder="+34 600 000 000"
            />
          </Field>

          <Field label="Ubicación">
            <input
              type="text"
              value={form.ubicacion}
              onChange={handleChange('ubicacion')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg font-raleway text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-henko-turquoise/30 focus:border-henko-turquoise transition-colors"
              placeholder="Madrid, España"
            />
          </Field>

          <Field label="Web">
            <input
              type="url"
              value={form.webUrl}
              onChange={handleChange('webUrl')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg font-raleway text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-henko-turquoise/30 focus:border-henko-turquoise transition-colors"
              placeholder="https://empresa.com"
            />
          </Field>

          <Field label="LinkedIn">
            <input
              type="url"
              value={form.linkedinUrl}
              onChange={handleChange('linkedinUrl')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg font-raleway text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-henko-turquoise/30 focus:border-henko-turquoise transition-colors"
              placeholder="https://linkedin.com/company/..."
            />
          </Field>

          <Field label="URL del logo">
            <input
              type="url"
              value={form.logoUrl}
              onChange={handleChange('logoUrl')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg font-raleway text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-henko-turquoise/30 focus:border-henko-turquoise transition-colors"
              placeholder="https://..."
            />
          </Field>
        </div>

        <Field label="Descripción">
          <textarea
            value={form.descripcion}
            onChange={handleChange('descripcion')}
            rows={4}
            className="input-field resize-none"
            placeholder="Breve descripción de tu empresa..."
          />
        </Field>

        {error && (
          <p className="text-sm text-red-600 font-raleway">{error}</p>
        )}
        {success && (
          <p className="text-sm text-green-600 font-raleway">Perfil actualizado correctamente.</p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2.5 bg-henko-turquoise text-white rounded-xl font-raleway text-sm font-medium hover:bg-henko-turquoise/90 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block font-raleway text-xs font-medium text-gray-600">{label}</label>
      {children}
    </div>
  )
}
