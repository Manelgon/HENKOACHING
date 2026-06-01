'use client'

import { useEffect } from 'react'

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Blog error]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
      <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-8 max-w-lg w-full text-center">
        <p className="font-raleway font-semibold text-red-700 mb-2">Error al cargar el blog</p>
        {error.message && (
          <p className="font-raleway text-sm text-red-600 mb-2">{error.message}</p>
        )}
        {error.digest && (
          <p className="font-raleway text-xs text-gray-400 mb-4">Digest: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="px-4 py-2 rounded-xl bg-henko-turquoise text-white font-raleway text-sm font-semibold"
        >
          Reintentar
        </button>
      </div>
    </div>
  )
}
