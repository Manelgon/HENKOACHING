'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAction } from '@/shared/feedback/FeedbackContext'
import { crearSesion, actualizarSesion, eliminarSesion } from '@/actions/clientes'

type Sesion = {
  id: string
  fecha: string
  tipo: string | null
  duracion: number | null
  notas: string | null
  realizada: boolean | null
}

const TIPOS = ['sesion', 'reunion', 'seguimiento', 'llamada']

export default function ClienteSesiones({
  clienteId,
  sesiones,
}: {
  clienteId: string
  sesiones: Sesion[]
}) {
  const router = useRouter()
  const runAction = useAction()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ fecha: '', tipo: 'sesion', duracion: '60', notas: '' })

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.fecha) return
    const result = await runAction(
      'Programando sesión',
      () => crearSesion(clienteId, {
        fecha: form.fecha,
        tipo: form.tipo,
        duracion: form.duracion ? parseInt(form.duracion) : undefined,
        notas: form.notas || undefined,
      }),
      { successMessage: 'Sesión programada' },
    )
    if (result.ok) {
      setForm({ fecha: '', tipo: 'sesion', duracion: '60', notas: '' })
      setShowForm(false)
      router.refresh()
    }
  }

  async function toggleRealizada(s: Sesion) {
    const result = await runAction(
      s.realizada ? 'Desmarcando sesión' : 'Marcando como realizada',
      () => actualizarSesion(s.id, { realizada: !s.realizada }),
      { silentSuccess: true },
    )
    if (result.ok) router.refresh()
  }

  async function del(id: string) {
    if (!confirm('¿Eliminar esta sesión?')) return
    const result = await runAction(
      'Eliminando sesión',
      () => eliminarSesion(id),
      { successMessage: 'Sesión eliminada' },
    )
    if (result.ok) router.refresh()
  }

  const proximas = sesiones.filter((s) => !s.realizada)
  const pasadas = sesiones.filter((s) => s.realizada)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="font-roxborough text-lg text-gray-900">Sesiones</p>
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="text-xs px-3 py-1.5 rounded-lg bg-henko-turquoise text-white font-raleway font-semibold hover:bg-henko-turquoise-light"
        >
          {showForm ? 'Cancelar' : '+ Programar'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-raleway text-xs font-semibold text-gray-500 mb-1">Fecha y hora *</label>
              <input
                type="datetime-local"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white font-raleway text-sm outline-none focus:border-henko-turquoise"
              />
            </div>
            <div>
              <label className="block font-raleway text-xs font-semibold text-gray-500 mb-1">Tipo</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white font-raleway text-sm outline-none focus:border-henko-turquoise"
              >
                {TIPOS.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-raleway text-xs font-semibold text-gray-500 mb-1">Duración (min)</label>
              <input
                type="number"
                value={form.duracion}
                onChange={(e) => setForm({ ...form, duracion: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white font-raleway text-sm outline-none focus:border-henko-turquoise"
              />
            </div>
          </div>
          <textarea
            value={form.notas}
            onChange={(e) => setForm({ ...form, notas: e.target.value })}
            placeholder="Notas (opcional)"
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white font-raleway text-sm outline-none focus:border-henko-turquoise resize-none"
          />
          <button
            type="submit"
            className="w-full px-4 py-2 rounded-lg bg-henko-turquoise text-white text-xs font-raleway font-semibold hover:bg-henko-turquoise-light"
          >
            Programar sesión
          </button>
        </form>
      )}

      {sesiones.length === 0 ? (
        <p className="text-xs text-gray-400 font-raleway italic">Aún no hay sesiones programadas.</p>
      ) : (
        <div className="space-y-3">
          {proximas.length > 0 && (
            <div>
              <p className="text-[11px] font-raleway font-bold text-gray-400 uppercase tracking-widest mb-2">Próximas</p>
              <div className="space-y-2">
                {proximas.map((s) => <SesionItem key={s.id} sesion={s} onToggle={() => toggleRealizada(s)} onDelete={() => del(s.id)} />)}
              </div>
            </div>
          )}
          {pasadas.length > 0 && (
            <div>
              <p className="text-[11px] font-raleway font-bold text-gray-400 uppercase tracking-widest mb-2 mt-4">Realizadas</p>
              <div className="space-y-2">
                {pasadas.map((s) => <SesionItem key={s.id} sesion={s} onToggle={() => toggleRealizada(s)} onDelete={() => del(s.id)} realizada />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SesionItem({
  sesion,
  onToggle,
  onDelete,
  realizada,
}: {
  sesion: Sesion
  onToggle: () => void
  onDelete: () => void
  realizada?: boolean
}) {
  const fecha = new Date(sesion.fecha).toLocaleString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`flex items-start gap-3 px-3 py-2.5 rounded-lg border ${realizada ? 'bg-gray-50 border-gray-100' : 'bg-henko-greenblue/10 border-henko-greenblue/30'}`}>
      <button
        type="button"
        onClick={onToggle}
        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
          realizada ? 'bg-henko-turquoise border-henko-turquoise text-white' : 'border-gray-300 hover:border-henko-turquoise'
        }`}
        aria-label={realizada ? 'Marcar como no realizada' : 'Marcar como realizada'}
      >
        {realizada && <span className="text-[10px]">✓</span>}
      </button>
      <div className="flex-1 min-w-0">
        <p className="font-raleway text-sm text-gray-800">
          <span className="font-semibold">{fecha}</span>
          {sesion.tipo && <span className="text-gray-500"> · {sesion.tipo}</span>}
          {sesion.duracion && <span className="text-gray-500"> · {sesion.duracion} min</span>}
        </p>
        {sesion.notas && <p className="text-xs text-gray-600 font-raleway mt-1 whitespace-pre-line">{sesion.notas}</p>}
      </div>
      <button
        type="button"
        onClick={onDelete}
        className="text-xs text-red-400 hover:text-red-600 font-raleway flex-shrink-0"
      >
        ✕
      </button>
    </div>
  )
}
