export const metadata = {
  title: 'Trabaja conmigo — Henkoaching',
}

export default function TrabajaConmigoAdminPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="font-roxborough text-4xl text-gray-900 mb-2">Trabaja conmigo</h1>
        <p className="font-raleway text-gray-500 font-light">Solicitudes recibidas desde la sección "Trabaja conmigo"</p>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-4 px-8 py-4 border-b border-gray-100 bg-gray-50">
          <span className="col-span-3 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Nombre</span>
          <span className="col-span-3 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Email</span>
          <span className="col-span-2 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Empresa</span>
          <span className="col-span-3 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Mensaje</span>
          <span className="col-span-1 font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest">Fecha</span>
        </div>

        {/* Empty state */}
        <div className="px-8 py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="font-roxborough text-xl text-gray-400 mb-2">Sin solicitudes todavía</p>
          <p className="font-raleway text-gray-400 text-sm font-light">Cuando conectes el formulario a Supabase, las solicitudes aparecerán aquí.</p>
        </div>
      </div>
    </div>
  )
}
