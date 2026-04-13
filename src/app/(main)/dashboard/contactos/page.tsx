export const metadata = {
  title: 'Contactos — Henkoaching',
}

export default function ContactosPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="font-roxborough text-4xl text-gray-900 mb-2">Formularios de contacto</h1>
        <p className="font-raleway text-gray-500 font-light">Mensajes recibidos desde la página de contacto</p>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="font-roxborough text-xl text-gray-400 mb-2">Sin mensajes todavía</p>
          <p className="font-raleway text-gray-400 text-sm font-light">Cuando conectes el formulario a Supabase, los mensajes aparecerán aquí.</p>
        </div>
      </div>
    </div>
  )
}
