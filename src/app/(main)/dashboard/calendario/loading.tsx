export default function CalendarioLoading() {
  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="h-8 w-48 bg-gray-100 rounded-xl animate-pulse mb-2" />
        <div className="h-4 w-72 bg-gray-100 rounded-lg animate-pulse" />
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex gap-0">
          {/* Sidebar calendarios */}
          <div className="hidden lg:flex flex-col w-52 flex-shrink-0 border-r border-gray-100 p-5 pt-6 gap-3">
            <div className="h-3 w-28 bg-gray-100 rounded animate-pulse" />
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded bg-gray-100 animate-pulse flex-shrink-0" />
                <div className="h-3 rounded animate-pulse bg-gray-100" style={{ width: `${60 + i * 15}px` }} />
              </div>
            ))}
            <div className="h-3 w-24 bg-gray-100 rounded animate-pulse mt-3" />
            {[1, 2].map(i => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded bg-gray-100 animate-pulse flex-shrink-0" />
                <div className="h-3 rounded animate-pulse bg-gray-100" style={{ width: `${70 + i * 20}px` }} />
              </div>
            ))}
          </div>

          {/* Calendario */}
          <div className="flex-1 p-6 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-24 h-8 bg-gray-100 rounded-2xl animate-pulse" />
                <div className="w-8 h-8 bg-gray-100 rounded-xl animate-pulse" />
                <div className="w-16 h-8 bg-gray-100 rounded-xl animate-pulse" />
                <div className="w-8 h-8 bg-gray-100 rounded-xl animate-pulse" />
              </div>
              <div className="w-40 h-6 bg-gray-100 rounded-lg animate-pulse" />
              <div className="w-20 h-8 bg-gray-100 rounded-xl animate-pulse" />
            </div>

            {/* Cabecera días */}
            <div className="grid grid-cols-7 gap-px mb-1">
              {['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'].map(d => (
                <div key={d} className="text-center py-2">
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{d}</span>
                </div>
              ))}
            </div>

            {/* Grid de días */}
            <div className="grid grid-cols-7 gap-px bg-gray-100 border border-gray-100 rounded-xl overflow-hidden">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="bg-white min-h-[90px] p-2">
                  <div className="w-6 h-4 bg-gray-100 rounded animate-pulse mb-2" />
                  {i % 5 === 0 && <div className="h-5 bg-gray-100 rounded-lg animate-pulse" />}
                  {i % 7 === 2 && <div className="h-5 bg-gray-100 rounded-lg animate-pulse mt-1" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel tareas skeleton */}
        <div className="border-t border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-4 h-4 bg-gray-100 rounded animate-pulse" />
            <div className="w-16 h-5 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-56 flex-shrink-0 border border-gray-100 rounded-2xl p-4 space-y-2">
                <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
                {[1, 2, 3, 4].map(j => (
                  <div key={j} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-gray-100 flex-shrink-0" />
                    <div className="h-3 bg-gray-100 rounded animate-pulse flex-1" style={{ width: `${50 + j * 10}%` }} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
