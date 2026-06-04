'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAction, useConfirm } from '@/shared/feedback/FeedbackContext'
import { subirRatFirmado, quitarRatFirmado } from '@/actions/ajustes'
import DocumentoEditorDrawer from './DocumentoEditorDrawer'
import DerechosArcoTable from './DerechosArcoTable'
import type { RgpdDocId, RgpdDocumento, DerechoArco } from '@/features/rgpd/types'

type Tab = 'documentos' | 'solicitudes'

const DOC_ICONS: Record<RgpdDocId, React.ReactNode> = {
  ropa: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  runbook: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  politica_ia: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-1m-6 0H9" />
    </svg>
  ),
  formacion_ia: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg>
  ),
  dpia_checklist: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  subencargados: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  responsable_incidentes: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
}

// Los docs con contenido vacío (formacion_ia, ropa recién creados) no se consideran completados
function isCompleted(doc: RgpdDocumento): boolean {
  if (!doc.actualizado_at) return false
  if (doc.id === 'formacion_ia') {
    const r = (doc.contenido as { registros?: unknown[] }).registros ?? []
    return r.length > 0
  }
  return true
}

function DocCard({ doc, onClick }: { doc: RgpdDocumento; onClick: () => void }) {
  const done = isCompleted(doc)
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left px-5 py-4 bg-white rounded-2xl border border-gray-200 hover:border-henko-turquoise hover:shadow-md transition-all group flex items-center gap-4"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${done ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'} group-hover:bg-henko-turquoise/10 group-hover:text-henko-turquoise`}>
        {DOC_ICONS[doc.id]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-raleway text-sm font-semibold text-gray-800 leading-snug">{doc.titulo}</p>
        <p className="font-raleway text-xs text-gray-400 leading-relaxed truncate">{doc.descripcion}</p>
        {doc.actualizado_at && (
          <p className="font-raleway text-[10px] text-gray-400 mt-0.5">
            Actualizado {new Date(doc.actualizado_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        )}
      </div>
      <span className={`text-[10px] font-bold font-raleway px-2 py-1 rounded-lg shrink-0 ${done ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
        {done ? 'Completado' : 'Pendiente'}
      </span>
      <svg className="w-4 h-4 text-gray-300 shrink-0 group-hover:text-henko-turquoise transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  )
}

// ── RAT Panel (movido desde Ajustes) ─────────────────────────────────────────
function RatPanel({ ratFirmadoUrl, ratFirmadoAt, onChange }: { ratFirmadoUrl: string | null; ratFirmadoAt: string | null; onChange: () => void }) {
  const runAction = useAction()
  const confirm = useConfirm()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const r = await runAction('Subiendo RAT firmado', () => subirRatFirmado(fd), { successMessage: 'RAT firmado guardado' })
    setUploading(false)
    e.target.value = ''
    if (r.ok) onChange()
  }

  async function onQuitar() {
    const ok = await confirm({
      title: 'Quitar RAT firmado',
      description: '¿Eliminar el RAT firmado guardado? Seguirás teniendo el borrador para volver a descargarlo.',
      confirmLabel: 'Quitar',
      variant: 'danger',
    })
    if (!ok) return
    const r = await runAction('Quitando RAT firmado', () => quitarRatFirmado(), { successMessage: 'RAT eliminado' })
    if (r.ok) onChange()
  }

  const fechaFormateada = ratFirmadoAt
    ? new Date(ratFirmadoAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
    : null

  return (
    <div className="mt-6 p-5 bg-white rounded-2xl border border-gray-200">
      <p className="font-raleway text-xs text-gray-500 font-semibold mb-4 uppercase tracking-wide">PDF del RAT firmado</p>
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
          <div className="flex-1">
            <p className="font-raleway text-xs font-semibold text-gray-800 mb-2">Descarga el RoPA como PDF, imprímelo y fírmalo a mano</p>
            <a href="/api/rat-pdf" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-xs font-raleway font-semibold text-blue-700 hover:bg-blue-50 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              Abrir RAT para imprimir
            </a>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
          <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
          <div className="flex-1">
            <p className="font-raleway text-xs font-semibold text-gray-800 mb-2">Sube aquí el PDF firmado para archivarlo</p>
            {uploading ? (
              <span className="font-raleway text-xs text-gray-500">Subiendo…</span>
            ) : ratFirmadoUrl ? (
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white rounded-xl border border-green-200">
                  <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-raleway text-xs font-semibold text-green-700">Firmado el {fechaFormateada}</span>
                </div>
                <a href={ratFirmadoUrl} target="_blank" rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-raleway font-semibold text-gray-700 hover:bg-gray-50">Ver</a>
                <button type="button" onClick={() => inputRef.current?.click()}
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-raleway font-semibold text-gray-700 hover:bg-gray-50">Reemplazar</button>
                <button type="button" onClick={onQuitar}
                  className="px-2.5 py-1.5 rounded-xl bg-red-50 text-red-500 text-xs font-raleway font-semibold hover:bg-red-100">Quitar</button>
              </div>
            ) : (
              <button type="button" onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-henko-turquoise text-white text-xs font-raleway font-semibold hover:bg-henko-turquoise-light transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Subir RAT firmado (PDF)
              </button>
            )}
          </div>
        </div>
      </div>
      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={onFile} />
    </div>
  )
}

// ── Dashboard principal ───────────────────────────────────────────────────────
export default function RgpdDashboard({
  documentos: initialDocumentos,
  solicitudes,
  ratFirmadoUrl,
  ratFirmadoAt,
}: {
  documentos: RgpdDocumento[]
  solicitudes: DerechoArco[]
  ratFirmadoUrl: string | null
  ratFirmadoAt: string | null
}) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('documentos')
  const [documentos, setDocumentos] = useState(initialDocumentos)
  const [docAbierto, setDocAbierto] = useState<RgpdDocId | null>(null)

  const docActivoData = docAbierto ? documentos.find(d => d.id === docAbierto) : null
  const pendientes = documentos.filter(d => !isCompleted(d)).length

  function handleSaved(id: RgpdDocId, contenido: Record<string, unknown>) {
    setDocumentos(ds => ds.map(d => d.id === id ? {
      ...d,
      contenido,
      actualizado_at: new Date().toISOString(),
    } : d))
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-roxborough text-2xl md:text-3xl text-gray-900 mb-2">Cumplimiento RGPD</h1>
        <p className="font-raleway text-gray-500 font-light">
          Documentos normativos, registro del RoPA y gestión de solicitudes de derechos.
        </p>
      </div>

      {/* Resumen */}
      {pendientes > 0 && (
        <div className="mb-6 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="font-raleway text-sm text-amber-700">
            <strong>{pendientes} documento{pendientes > 1 ? 's' : ''} pendiente{pendientes > 1 ? 's' : ''}</strong> de completar. Haz clic en cada tarjeta para revisar y guardar su contenido.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {(['documentos', 'solicitudes'] as Tab[]).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 font-raleway text-sm font-semibold transition-colors border-b-2 -mb-px ${tab === t ? 'border-henko-turquoise text-henko-turquoise' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {t === 'documentos' ? 'Documentos normativos' : 'Solicitudes de derechos'}
            {t === 'solicitudes' && solicitudes.filter(s => s.estado === 'pendiente').length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                {solicitudes.filter(s => s.estado === 'pendiente').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Documentos grid */}
      {tab === 'documentos' && (
        <>
          <div className="flex flex-col gap-3 mb-6">
            {documentos.map(doc => (
              <DocCard key={doc.id} doc={doc} onClick={() => setDocAbierto(doc.id)} />
            ))}
          </div>
          <RatPanel
            ratFirmadoUrl={ratFirmadoUrl}
            ratFirmadoAt={ratFirmadoAt}
            onChange={() => router.refresh()}
          />
        </>
      )}

      {/* Solicitudes ARCO */}
      {tab === 'solicitudes' && (
        <DerechosArcoTable initialData={solicitudes} />
      )}

      {/* Drawer editor */}
      {docActivoData && (
        <DocumentoEditorDrawer
          doc={docActivoData}
          onClose={() => setDocAbierto(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
