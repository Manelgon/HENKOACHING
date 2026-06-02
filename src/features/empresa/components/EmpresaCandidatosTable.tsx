type Solicitud = {
  id: string
  estado: string
  fecha: string
  candidato: string
  ofertaTitulo: string
}

type Props = { solicitudes: Solicitud[] }

const ESTADO_LABEL: Record<string, { label: string; cls: string }> = {
  nuevo: { label: 'Nuevo', cls: 'bg-blue-50 text-blue-700' },
  revisado: { label: 'Revisado', cls: 'bg-gray-100 text-gray-600' },
  entrevista: { label: 'Entrevista', cls: 'bg-amber-50 text-amber-700' },
  aceptado: { label: 'Aceptado', cls: 'bg-green-50 text-green-700' },
  descartado: { label: 'Descartado', cls: 'bg-red-50 text-red-600' },
}

export default function EmpresaCandidatosTable({ solicitudes }: Props) {
  return (
    <div className="space-y-4">
      <h1 className="font-roxborough text-2xl text-gray-900">Candidatos recibidos</h1>

      {solicitudes.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-10 text-center">
          <p className="font-raleway text-gray-400 text-sm">Aún no has recibido candidatos.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm font-raleway">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Candidato</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Oferta</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Estado</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((s) => {
                const est = ESTADO_LABEL[s.estado] ?? { label: s.estado, cls: 'bg-gray-100 text-gray-500' }
                const fecha = new Date(s.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
                return (
                  <tr key={s.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{s.candidato}</td>
                    <td className="px-4 py-3 text-gray-600">{s.ofertaTitulo}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${est.cls}`}>
                        {est.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{fecha}</td>
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
