type Oferta = {
  id: string
  titulo: string
  slug: string
  estado: string
  fechaPublicacion: string | null
  createdAt: string
  solicitudes: number
}

type Props = { ofertas: Oferta[] }

const ESTADO_LABEL: Record<string, { label: string; cls: string }> = {
  publicada: { label: 'Publicada', cls: 'bg-green-50 text-green-700' },
  borrador: { label: 'Borrador', cls: 'bg-gray-100 text-gray-500' },
  cerrada: { label: 'Cerrada', cls: 'bg-red-50 text-red-600' },
  pausada: { label: 'Pausada', cls: 'bg-amber-50 text-amber-700' },
}

export default function EmpresaOfertasTable({ ofertas }: Props) {
  return (
    <div className="space-y-4">
      <h1 className="font-roxborough text-2xl text-gray-900">Mis ofertas</h1>

      {ofertas.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-10 text-center">
          <p className="font-raleway text-gray-400 text-sm">Aún no tienes ofertas publicadas.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm font-raleway">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Título</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Estado</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Publicada</th>
                <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Candidatos</th>
              </tr>
            </thead>
            <tbody>
              {ofertas.map((o) => {
                const est = ESTADO_LABEL[o.estado] ?? { label: o.estado, cls: 'bg-gray-100 text-gray-500' }
                const fecha = o.fechaPublicacion
                  ? new Date(o.fechaPublicacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
                  : new Date(o.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
                return (
                  <tr key={o.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{o.titulo}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${est.cls}`}>
                        {est.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{fecha}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-700">{o.solicitudes}</td>
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
