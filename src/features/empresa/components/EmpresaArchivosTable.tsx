type Archivo = {
  id: string
  nombre: string
  tipo: string | null
  tamanoBytes: number | null
  fecha: string
  storagePath: string
}

type Props = { archivos: Archivo[] }

function formatBytes(bytes: number | null) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function TipoIcon() {
  return (
    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  )
}

export default function EmpresaArchivosTable({ archivos }: Props) {
  return (
    <div className="space-y-4">
      <h1 className="font-roxborough text-2xl text-gray-900">Archivos</h1>

      {archivos.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-10 text-center">
          <p className="font-raleway text-gray-400 text-sm">No hay archivos compartidos.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm font-raleway">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Archivo</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Tipo</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Tamaño</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {archivos.map((a) => {
                const fecha = new Date(a.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
                return (
                  <tr key={a.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <TipoIcon />
                        <span className="font-medium text-gray-800 truncate max-w-[260px]">{a.nombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 capitalize">{a.tipo ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{formatBytes(a.tamanoBytes)}</td>
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
