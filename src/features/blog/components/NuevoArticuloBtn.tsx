'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearArticulo } from '@/actions/blog'
import { useToast } from '@/shared/feedback/FeedbackContext'

export default function NuevoArticuloBtn() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const pushToast = useToast()

  async function handleClick() {
    setLoading(true)
    try {
      const result = await crearArticulo({})
      if ('error' in result) {
        pushToast('error', result.error)
        return
      }
      router.push(`/dashboard/blog/${result.data!.id}`)
    } catch {
      pushToast('error', 'No se pudo crear el artículo. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-henko-turquoise text-white font-raleway font-semibold text-sm hover:bg-henko-turquoise-light transition-colors whitespace-nowrap disabled:opacity-60"
    >
      {loading ? 'Creando…' : '+ Nuevo artículo'}
    </button>
  )
}
