'use client'

import type { ConsentimientoRow } from '@/actions/rgpd'

function exportCSV(rows: ConsentimientoRow[]) {
  const headers = ['Tipo', 'Nombre', 'Email', 'Fecha de consentimiento', 'Texto aceptado']
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
  const lines = [
    headers.map(escape).join(','),
    ...rows.map(r => [
      escape(r.tipo === 'candidato' ? 'Candidato' : 'Lead/Contacto'),
      escape(r.nombre),
      escape(r.email),
      escape(new Date(r.fecha).toLocaleString('es-ES')),
      escape(r.consent_text ?? ''),
    ].join(',')),
  ]
  const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `registro-consentimientos-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function ConsentimientosTable({ rows }: { rows: ConsentimientoRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="font-raleway text-gray-500 text-sm">Sin consentimientos registrados todavía</p>
        <p className="font-raleway text-gray-400 text-xs mt-1">Aparecerán aquí cuando lleguen nuevas inscripciones o contactos</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-raleway text-sm text-gray-500">
          <strong className="text-gray-800">{rows.length}</strong> registro{rows.length !== 1 ? 's' : ''} de consentimiento
        </p>
        <button
          type="button"
          onClick={() => exportCSV(rows)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-raleway font-semibold text-gray-700 hover:border-henko-turquoise hover:text-henko-turquoise transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          Exportar CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-raleway text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="text-left px-4 py-3 font-raleway text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="text-left px-4 py-3 font-raleway text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="text-left px-4 py-3 font-raleway text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="text-left px-4 py-3 font-raleway text-xs font-bold text-gray-500 uppercase tracking-wider">Texto aceptado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-lg text-[11px] font-semibold font-raleway ${
                    row.tipo === 'candidato'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {row.tipo === 'candidato' ? 'Candidato' : 'Contacto'}
                  </span>
                </td>
                <td className="px-4 py-3 font-raleway text-gray-800 font-medium">{row.nombre}</td>
                <td className="px-4 py-3 font-raleway text-gray-500">{row.email}</td>
                <td className="px-4 py-3 font-raleway text-gray-500 whitespace-nowrap">
                  {new Date(row.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                  <span className="block text-[10px] text-gray-400">
                    {new Date(row.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </td>
                <td className="px-4 py-3 font-raleway text-xs text-gray-500 max-w-xs">
                  {row.consent_text ? (
                    <span className="italic">&ldquo;{row.consent_text}&rdquo;</span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="font-raleway text-[11px] text-gray-400">
        El CSV incluye BOM UTF-8 para compatibilidad con Excel. Ábrelo directamente o impórtalo como texto UTF-8.
      </p>
    </div>
  )
}
