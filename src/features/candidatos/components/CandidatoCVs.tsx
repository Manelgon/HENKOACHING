'use client'

import { useState } from 'react'
import { getCvSignedUrl } from '@/actions/candidatos-admin'
import type { CvDoc } from '../types'

export default function CandidatoCVs({ cvs }: { cvs: CvDoc[] }) {
  if (cvs.length === 0) return null
  return (
    <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-8">
      <h3 className="font-roxborough text-lg text-gray-900 mb-5">CVs adjuntos</h3>
      <div className="space-y-2">
        {cvs.map((cv) => <CvItem key={cv.id} cv={cv} />)}
      </div>
    </section>
  )
}

function CvItem({ cv }: { cv: CvDoc }) {
  const [loading, setLoading] = useState(false)

  async function descargar() {
    setLoading(true)
    const url = await getCvSignedUrl(cv.storage_path)
    setLoading(false)
    if (url) window.open(url, '_blank')
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span className="flex-1 font-raleway text-sm text-gray-700 truncate">{cv.nombre_archivo}</span>
      {cv.es_principal && (
        <span className="font-raleway text-xs bg-henko-turquoise/10 text-henko-turquoise px-2 py-0.5 rounded-full">Principal</span>
      )}
      <button
        type="button"
        onClick={descargar}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 font-raleway text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Generando…' : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Descargar
          </>
        )}
      </button>
    </div>
  )
}
