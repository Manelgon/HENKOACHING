'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAction } from '@/shared/feedback/FeedbackContext'
import { crearNotaCliente, eliminarNotaCliente } from '@/actions/clientes'

type Nota = {
  id: string
  contenido: string
  created_at: string | null
  autor_email: string | null
}

export default function ClienteNotas({
  clienteId,
  notas,
}: {
  clienteId: string
  notas: Nota[]
}) {
  const router = useRouter()
  const runAction = useAction()
  const [nueva, setNueva] = useState('')

  async function add(e: React.FormEvent) {
    e.preventDefault()
    if (!nueva.trim()) return
    const result = await runAction(
      'Guardando nota',
      () => crearNotaCliente(clienteId, nueva),
      { successMessage: 'Nota añadida' },
    )
    if (result.ok) {
      setNueva('')
      router.refresh()
    }
  }

  async function del(notaId: string) {
    if (!confirm('¿Eliminar esta nota?')) return
    const result = await runAction(
      'Eliminando nota',
      () => eliminarNotaCliente(notaId),
      { successMessage: 'Nota eliminada' },
    )
    if (result.ok) router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="font-roxborough text-lg text-gray-900">Notas</p>
        <span className="text-xs text-gray-400 font-raleway">{notas.length}</span>
      </div>

      <form onSubmit={add} className="mb-4">
        <textarea
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
          placeholder="Anotar lo que pasó en la última conversación, ideas, recordatorios…"
          rows={2}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white resize-none"
        />
        <button
          type="submit"
          disabled={!nueva.trim()}
          className="mt-2 px-4 py-2 rounded-xl bg-henko-turquoise text-white text-xs font-raleway font-semibold hover:bg-henko-turquoise-light disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Añadir nota
        </button>
      </form>

      {notas.length === 0 ? (
        <p className="text-xs text-gray-400 font-raleway italic">Aún no hay notas.</p>
      ) : (
        <div className="space-y-2">
          {notas.map((n) => (
            <div key={n.id} className="bg-henko-yellow/20 border border-henko-yellow/40 rounded-xl px-4 py-3">
              <p className="font-raleway text-sm text-gray-800 whitespace-pre-line">{n.contenido}</p>
              <div className="flex items-center justify-between mt-2 text-[11px] text-gray-500 font-raleway">
                <span>
                  {n.autor_email ?? 'Sistema'} · {n.created_at ? new Date(n.created_at).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
                <button
                  type="button"
                  onClick={() => del(n.id)}
                  className="text-red-400 hover:text-red-600"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
