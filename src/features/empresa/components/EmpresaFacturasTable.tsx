import { formatEur } from '@/shared/utils/format'

type Factura = {
  id: string
  numero: string
  fechaEmision: string
  total: number
  estado: string
  formaPago: string | null
}

type Props = { facturas: Factura[] }

const ESTADO_LABEL: Record<string, { label: string; cls: string }> = {
  emitida: { label: 'Emitida', cls: 'bg-blue-50 text-blue-700' },
  pagada: { label: 'Pagada', cls: 'bg-green-50 text-green-700' },
  vencida: { label: 'Vencida', cls: 'bg-red-50 text-red-600' },
  anulada: { label: 'Anulada', cls: 'bg-gray-100 text-gray-500' },
  rectificada: { label: 'Rectificada', cls: 'bg-amber-50 text-amber-700' },
}

export default function EmpresaFacturasTable({ facturas }: Props) {
  return (
    <div className="space-y-4">
      <h1 className="font-roxborough text-2xl text-gray-900">Facturas</h1>

      {facturas.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-10 text-center">
          <p className="font-raleway text-gray-400 text-sm">No hay facturas disponibles.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm font-raleway">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Número</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Fecha</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Estado</th>
                <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Total</th>
              </tr>
            </thead>
            <tbody>
              {facturas.map((f) => {
                const est = ESTADO_LABEL[f.estado] ?? { label: f.estado, cls: 'bg-gray-100 text-gray-500' }
                const fecha = new Date(f.fechaEmision).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
                return (
                  <tr key={f.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{f.numero}</td>
                    <td className="px-4 py-3 text-gray-500">{fecha}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${est.cls}`}>
                        {est.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">{formatEur(f.total)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
