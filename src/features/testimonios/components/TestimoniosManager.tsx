'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  crearTestimonio,
  actualizarTestimonio,
  eliminarTestimonio,
  alternarVisibilidad,
  type TestimonioInput,
} from '@/actions/testimonios'
import type { Database } from '@/lib/supabase/database.types'

type Testimonio = Database['public']['Tables']['testimonios']['Row']

const FUENTES = ['google', 'linkedin', 'email', 'manual'] as const

const EMPTY: TestimonioInput = {
  texto: '',
  nombre: '',
  rol: '',
  sector: '',
  rating: 5,
  fuente: 'google',
  fecha: '',
  orden: 0,
  visible: true,
}

export default function TestimoniosManager({ testimonios }: { testimonios: Testimonio[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<TestimonioInput>(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  function resetForm() {
    setForm(EMPTY)
    setEditingId(null)
    setShowForm(false)
    setError(null)
  }

  function startEdit(t: Testimonio) {
    setEditingId(t.id)
    setForm({
      texto: t.texto,
      nombre: t.nombre,
      rol: t.rol ?? '',
      sector: t.sector ?? '',
      rating: t.rating ?? 5,
      fuente: t.fuente ?? 'manual',
      fecha: t.fecha ?? '',
      orden: t.orden,
      visible: t.visible,
    })
    setShowForm(true)
    setError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    startTransition(async () => {
      const result = editingId
        ? await actualizarTestimonio(editingId, form)
        : await crearTestimonio(form)
      if ('error' in result) {
        setError(result.error)
        return
      }
      setSuccess(editingId ? 'Testimonio actualizado' : 'Testimonio creado')
      resetForm()
      router.refresh()
    })
  }

  function handleDelete(id: string) {
    if (!confirm('¿Eliminar este testimonio? Esta acción es reversible (soft delete).')) return
    startTransition(async () => {
      const result = await eliminarTestimonio(id)
      if ('error' in result) setError(result.error)
      else router.refresh()
    })
  }

  function handleToggleVisible(id: string, currentlyVisible: boolean) {
    startTransition(async () => {
      const result = await alternarVisibilidad(id, !currentlyVisible)
      if ('error' in result) setError(result.error)
      else router.refresh()
    })
  }

  return (
    <div className="space-y-8">
      {success && (
        <div className="rounded-2xl bg-green-50 border border-green-200 px-5 py-3 text-sm text-green-800">
          {success}
        </div>
      )}
      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-5 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Toggle add form */}
      {!showForm && (
        <button
          type="button"
          onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY) }}
          className="inline-flex items-center gap-2 bg-henko-turquoise text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-henko-turquoise-light transition-all"
        >
          + Nuevo testimonio
        </button>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-henko-turquoise/15 rounded-[2rem] p-7 md:p-9 shadow-sm space-y-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-roxborough text-xl text-gray-900">
              {editingId ? 'Editar testimonio' : 'Nuevo testimonio'}
            </h2>
            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              Cancelar
            </button>
          </div>

          <div>
            <label className="text-[11px] tracking-[0.12em] font-bold mb-1.5 block text-henko-turquoise">
              TEXTO DEL TESTIMONIO *
            </label>
            <textarea
              required
              rows={5}
              value={form.texto}
              onChange={(e) => setForm({ ...form, texto: e.target.value })}
              maxLength={1000}
              placeholder="Pega aquí el texto de la reseña (Google, LinkedIn, email...)"
              className="w-full px-4 py-3 rounded-2xl text-sm border-[1.5px] border-black/10 focus:border-henko-turquoise outline-none resize-y leading-relaxed"
            />
            <p className="text-xs text-gray-400 mt-1">{form.texto.length}/1000</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] tracking-[0.12em] font-bold mb-1.5 block text-henko-turquoise">NOMBRE *</label>
              <input
                required
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="María Llull"
                className="w-full px-4 py-3 rounded-2xl text-sm border-[1.5px] border-black/10 focus:border-henko-turquoise outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] tracking-[0.12em] font-bold mb-1.5 block text-henko-turquoise">ROL / CARGO</label>
              <input
                type="text"
                value={form.rol ?? ''}
                onChange={(e) => setForm({ ...form, rol: e.target.value })}
                placeholder="CEO, empresa familiar"
                className="w-full px-4 py-3 rounded-2xl text-sm border-[1.5px] border-black/10 focus:border-henko-turquoise outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] tracking-[0.12em] font-bold mb-1.5 block text-henko-turquoise">SECTOR</label>
              <input
                type="text"
                value={form.sector ?? ''}
                onChange={(e) => setForm({ ...form, sector: e.target.value })}
                placeholder="Servicios profesionales"
                className="w-full px-4 py-3 rounded-2xl text-sm border-[1.5px] border-black/10 focus:border-henko-turquoise outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] tracking-[0.12em] font-bold mb-1.5 block text-henko-turquoise">FUENTE</label>
              <select
                value={form.fuente ?? 'manual'}
                onChange={(e) => setForm({ ...form, fuente: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl text-sm border-[1.5px] border-black/10 focus:border-henko-turquoise outline-none appearance-none bg-white"
              >
                {FUENTES.map((f) => (
                  <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] tracking-[0.12em] font-bold mb-1.5 block text-henko-turquoise">FECHA</label>
              <input
                type="date"
                value={form.fecha ?? ''}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl text-sm border-[1.5px] border-black/10 focus:border-henko-turquoise outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="text-[11px] tracking-[0.12em] font-bold mb-1.5 block text-henko-turquoise">RATING</label>
              <select
                value={form.rating ?? 5}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-2xl text-sm border-[1.5px] border-black/10 focus:border-henko-turquoise outline-none appearance-none bg-white"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{'★'.repeat(n)}{'☆'.repeat(5 - n)}  ({n}/5)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] tracking-[0.12em] font-bold mb-1.5 block text-henko-turquoise">ORDEN</label>
              <input
                type="number"
                value={form.orden ?? 0}
                onChange={(e) => setForm({ ...form, orden: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-2xl text-sm border-[1.5px] border-black/10 focus:border-henko-turquoise outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">Menor = primero</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer pb-3">
              <input
                type="checkbox"
                checked={form.visible ?? true}
                onChange={(e) => setForm({ ...form, visible: e.target.checked })}
                className="w-4 h-4 accent-henko-turquoise"
              />
              <span className="text-sm text-gray-700">Visible en la web</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-henko-turquoise text-white px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-henko-turquoise-light disabled:opacity-50 transition-all"
          >
            {pending ? 'Guardando…' : editingId ? 'Actualizar' : 'Crear testimonio'}
          </button>
        </form>
      )}

      {/* Lista */}
      {testimonios.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-[2rem] p-12 text-center">
          <p className="text-gray-500">No hay testimonios todavía. Crea el primero.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {testimonios.map((t) => (
            <div
              key={t.id}
              className={`bg-white border rounded-[1.75rem] p-6 md:p-7 shadow-sm transition-all ${
                t.visible ? 'border-henko-turquoise/20' : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex flex-col md:flex-row gap-4 md:items-start md:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="text-xs font-bold tracking-wider uppercase text-henko-turquoise bg-henko-turquoise/10 px-2.5 py-0.5 rounded-full">
                      {t.fuente ?? 'manual'}
                    </span>
                    {t.rating && (
                      <span className="text-sm text-yellow-500">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</span>
                    )}
                    {!t.visible && (
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">OCULTO</span>
                    )}
                    <span className="text-xs text-gray-400">orden: {t.orden}</span>
                  </div>
                  <p className="font-roxborough italic text-[15px] text-gray-800 leading-relaxed mb-3 line-clamp-3">
                    &ldquo;{t.texto}&rdquo;
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold text-gray-900">{t.nombre}</span>
                    {t.rol && <span className="text-gray-500"> · {t.rol}</span>}
                    {t.sector && <span className="text-gray-400"> · {t.sector}</span>}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 md:flex-col md:items-end">
                  <button
                    type="button"
                    onClick={() => startEdit(t)}
                    disabled={pending}
                    className="text-xs font-semibold text-henko-turquoise hover:underline px-3 py-1.5"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleVisible(t.id, t.visible)}
                    disabled={pending}
                    className="text-xs font-semibold text-gray-600 hover:text-gray-900 hover:underline px-3 py-1.5"
                  >
                    {t.visible ? 'Ocultar' : 'Mostrar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(t.id)}
                    disabled={pending}
                    className="text-xs font-semibold text-red-600 hover:underline px-3 py-1.5"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
