'use client'

import { TablePagination, usePagination } from '@/components/TablePagination'
import RegistroAcciones from './RegistroAcciones'

type EstadoEnvio = 'pendiente' | 'enviado' | 'aceptado' | 'rechazado' | 'error'

const ESTADO_LABEL: Record<EstadoEnvio, { texto: string; clase: string }> = {
  pendiente:  { texto: 'Pendiente', clase: 'bg-gray-100 text-gray-700' },
  enviado:    { texto: 'Enviado',   clase: 'bg-blue-50 text-blue-700' },
  aceptado:   { texto: 'Aceptado',  clase: 'bg-emerald-50 text-emerald-700' },
  rechazado:  { texto: 'Rechazado', clase: 'bg-red-50 text-red-700' },
  error:      { texto: 'Error',     clase: 'bg-orange-50 text-orange-700' },
}

type Registro = {
  id: string
  num_registro: number
  tipo: 'alta' | 'anulacion'
  numero_factura: string
  fecha_hora_generacion: string
  huella: string
  estado_envio: EstadoEnvio
  ultimo_error: string | null
}

export default function RegistrosVerifactuTable({ registros }: { registros: Registro[] }) {
  const pagination = usePagination(registros, 20)

  if (registros.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-10 text-center">
        <p className="font-raleway text-sm text-gray-500">No hay registros que coincidan con los filtros.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl border border-black/5 overflow-hidden">
      {/* Cabecera */}
      <div className="hidden md:grid px-4 py-3.5 border-b border-black/5 grid-cols-[56px_160px_80px_120px_140px_100px_80px] text-[10px] tracking-widest text-gray-400 font-bold">
        <span>Nº</span>
        <span>FECHA / HORA</span>
        <span>TIPO</span>
        <span>FACTURA</span>
        <span>HUELLA</span>
        <span>ENVÍO AEAT</span>
        <span className="text-right">ACCIONES</span>
      </div>

      {pagination.paginated.map((r) => {
        const estadoMeta = ESTADO_LABEL[r.estado_envio]
        const fecha = new Date(r.fecha_hora_generacion).toLocaleString('es-ES', {
          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
        })
        return (
          <div key={r.id} className="border-b border-black/5 last:border-0 hover:bg-henko-white/40 transition-colors">
            {/* Desktop */}
            <div className="hidden md:grid px-4 py-3 grid-cols-[56px_160px_80px_120px_140px_100px_80px] items-center gap-2">
              <span className="font-mono text-sm text-gray-700">{r.num_registro}</span>
              <span className="text-xs text-gray-600 whitespace-nowrap">{fecha}</span>
              <span>
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${r.tipo === 'anulacion' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {r.tipo === 'anulacion' ? 'Anulación' : 'Alta'}
                </span>
              </span>
              <span className="font-mono text-xs text-gray-700">{r.numero_factura}</span>
              <span className="font-mono text-[10px] text-gray-500 truncate" title={r.huella}>
                {r.huella.slice(0, 14)}…
              </span>
              <span>
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${estadoMeta.clase}`} title={r.ultimo_error ?? undefined}>
                  {estadoMeta.texto}
                </span>
              </span>
              <div className="flex justify-end">
                <RegistroAcciones registroId={r.id} numeroFactura={r.numero_factura} estadoEnvio={r.estado_envio} />
              </div>
            </div>
            {/* Móvil */}
            <div className="md:hidden px-4 py-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-gray-700">#{r.num_registro}</span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${r.tipo === 'anulacion' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    {r.tipo === 'anulacion' ? 'Anulación' : 'Alta'}
                  </span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${estadoMeta.clase}`}>
                    {estadoMeta.texto}
                  </span>
                </div>
                <RegistroAcciones registroId={r.id} numeroFactura={r.numero_factura} estadoEnvio={r.estado_envio} />
              </div>
              <p className="font-mono text-xs text-gray-700">{r.numero_factura}</p>
              <p className="text-[11px] text-gray-400">{fecha}</p>
            </div>
          </div>
        )
      })}

      <TablePagination
        page={pagination.page}
        pageSize={pagination.pageSize}
        total={pagination.total}
        totalPages={pagination.totalPages}
        from={pagination.from}
        to={pagination.to}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />
    </div>
  )
}
