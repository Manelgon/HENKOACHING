'use client'

import { useState } from 'react'
import { useToast } from '@/shared/feedback/FeedbackContext'
import { exportarBackupVerifactu } from '@/actions/verifactu'

export default function BackupButton() {
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  async function descargar() {
    setLoading(true)
    const r = await exportarBackupVerifactu()
    setLoading(false)

    if ('error' in r && r.error) {
      toast('error', r.error)
      return
    }
    if (!('ndjson' in r) || !r.ndjson) return

    const blob = new Blob([r.ndjson], { type: 'application/x-ndjson' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const fecha = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')
    a.href = url
    a.download = `verifactu-backup-${fecha}.ndjson`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast('success', `Backup generado · ${r.totalRegistros} registros`)
  }

  return (
    <button
      onClick={descargar}
      disabled={loading}
      className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 font-raleway text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
    >
      {loading ? 'Generando…' : 'Descargar backup'}
    </button>
  )
}
