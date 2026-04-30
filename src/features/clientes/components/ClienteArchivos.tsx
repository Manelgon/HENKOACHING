'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAction } from '@/shared/feedback/FeedbackContext'
import { eliminarArchivoCliente, getArchivoSignedUrl, subirArchivoCliente } from '@/actions/clientes'

type Archivo = {
  id: string
  nombre_archivo: string
  storage_path: string
  tipo: string | null
  tamano_bytes: number | null
  created_at: string | null
}

const TIPOS = [
  { value: 'contrato', label: 'Contrato' },
  { value: 'factura', label: 'Factura' },
  { value: 'propuesta', label: 'Propuesta' },
  { value: 'otro', label: 'Otro' },
]

export default function ClienteArchivos({
  clienteId,
  archivos,
}: {
  clienteId: string
  archivos: Archivo[]
}) {
  const router = useRouter()
  const runAction = useAction()
  const inputRef = useRef<HTMLInputElement>(null)
  const [tipo, setTipo] = useState('contrato')

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const fd = new FormData()
    fd.append('file', file)
    fd.append('tipo', tipo)

    const result = await runAction(
      `Subiendo ${file.name}`,
      () => subirArchivoCliente(clienteId, fd),
      { successMessage: 'Archivo subido' },
    )
    if (result.ok) {
      if (inputRef.current) inputRef.current.value = ''
      router.refresh()
    }
  }

  async function handleOpen(archivoId: string) {
    const result = await runAction(
      'Abriendo archivo',
      () => getArchivoSignedUrl(archivoId),
      { silentSuccess: true },
    )
    if (result.ok && result.data.url) {
      window.open(result.data.url, '_blank', 'noopener,noreferrer')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este archivo?')) return
    const result = await runAction(
      'Eliminando archivo',
      () => eliminarArchivoCliente(id),
      { successMessage: 'Archivo eliminado' },
    )
    if (result.ok) router.refresh()
  }

  function formatBytes(b: number | null): string {
    if (!b) return ''
    if (b < 1024) return `${b} B`
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
    return `${(b / 1024 / 1024).toFixed(1)} MB`
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="font-roxborough text-lg text-gray-900">Archivos</p>
        <span className="text-xs text-gray-400 font-raleway">{archivos.length}</span>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white font-raleway text-sm outline-none focus:border-henko-turquoise"
          >
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <input
            ref={inputRef}
            type="file"
            onChange={handleUpload}
            className="flex-1 text-sm font-raleway text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-henko-turquoise file:text-white file:text-xs file:font-semibold hover:file:bg-henko-turquoise-light file:cursor-pointer"
          />
        </div>
        <p className="text-[11px] text-gray-400 font-raleway mt-2">
          PDF, imágenes, Word, Excel. Máx 10 MB.
        </p>
      </div>

      {archivos.length === 0 ? (
        <p className="text-xs text-gray-400 font-raleway italic">Aún no hay archivos.</p>
      ) : (
        <div className="space-y-2">
          {archivos.map((a) => (
            <div key={a.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-henko-greenblue/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-henko-turquoise" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <button
                type="button"
                onClick={() => handleOpen(a.id)}
                className="flex-1 min-w-0 text-left"
              >
                <p className="font-raleway text-sm text-gray-800 truncate hover:text-henko-turquoise">{a.nombre_archivo}</p>
                <p className="text-[11px] text-gray-400 font-raleway">
                  {a.tipo ?? 'archivo'} · {formatBytes(a.tamano_bytes)} · {a.created_at ? new Date(a.created_at).toLocaleDateString('es-ES') : ''}
                </p>
              </button>
              <button
                type="button"
                onClick={() => handleDelete(a.id)}
                className="text-xs text-red-400 hover:text-red-600 font-raleway flex-shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
