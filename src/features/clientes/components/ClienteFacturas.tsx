'use client'

import Link from 'next/link'
import { formatEur } from '@/shared/utils/format'

type Factura = {
  id: string
  numero: string | null
  fecha_emision: string | null
  total: number | null
  estado: string
}

const ESTADO_BADGE: Record<string, string> = {
  emitida:    'bg-henko-greenblue text-henko-turquoise',
  pagada:     'bg-emerald-50 text-emerald-700',
  vencida:    'bg-red-50 text-red-600',
  anulada:    'bg-black/5 text-gray-400',
  devuelta:   'bg-orange-50 text-orange-600',
  rectificada:'bg-gray-100 text-gray-500',
}

const ESTADO_LABEL: Record<string, string> = {
  emitida: 'Emitida', pagada: 'Pagada', vencida: 'Vencida',
  anulada: 'Anulada', devuelta: 'Devuelta', rectificada: 'Rectificada',
}

export default function ClienteFacturas({ facturas, clienteId: _ }: { facturas: Factura[]; clienteId: string }) {
  return (
    <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-8">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-roxborough text-lg text-gray-900">
          Facturas
          {facturas.length > 0 && (
            <span className="ml-2 font-raleway text-base font-normal text-gray-400">({facturas.length})</span>
          )}
        </h3>
        <Link
          href="/dashboard/facturas"
          className="text-xs font-raleway font-semibold text-henko-turquoise hover:underline"
        >
          Ver todas →
        </Link>
      </div>

      {facturas.length === 0 ? (
        <p className="font-raleway text-sm text-gray-400 italic">No hay facturas asociadas a este cliente.</p>
      ) : (
        <div className="space-y-2">
          {facturas.map(f => (
            <div key={f.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
              <div className="min-w-0">
                <p className="font-raleway text-sm font-semibold text-gray-900">{f.numero ?? '—'}</p>
                {f.fecha_emision && (
                  <p className="font-raleway text-[11px] text-gray-400">
                    {new Date(f.fecha_emision).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${ESTADO_BADGE[f.estado] ?? 'bg-gray-100 text-gray-500'}`}>
                  {ESTADO_LABEL[f.estado] ?? f.estado}
                </span>
                {f.total != null && (
                  <span className="font-raleway text-sm font-semibold text-gray-700 min-w-[70px] text-right">
                    {formatEur(f.total)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
