export const metadata = {
  title: 'Panel — Henkoaching',
}

export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-roxborough text-4xl text-gray-900 mb-2">Panel de gestión</h1>
        <p className="font-raleway text-gray-500 font-light">Gestiona los formularios recibidos desde la web</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
          <p className="font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Contactos recibidos</p>
          <p className="font-roxborough text-5xl text-henko-turquoise">—</p>
          <p className="font-raleway text-sm text-gray-400 mt-2">Pendiente de conectar</p>
        </div>
        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
          <p className="font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Solicitudes "Trabaja conmigo"</p>
          <p className="font-roxborough text-5xl text-henko-purple">—</p>
          <p className="font-raleway text-sm text-gray-400 mt-2">Pendiente de conectar</p>
        </div>
        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
          <p className="font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Esta semana</p>
          <p className="font-roxborough text-5xl text-henko-coral">—</p>
          <p className="font-raleway text-sm text-gray-400 mt-2">Pendiente de conectar</p>
        </div>
      </div>

      {/* Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Formularios contacto */}
        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-henko-turquoise/10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-henko-turquoise" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="font-roxborough text-xl text-gray-900">Formularios de contacto</h2>
          </div>
          <p className="font-raleway text-gray-400 text-sm font-light mb-6">
            Mensajes enviados desde la página de contacto de la web. Incluye nombre, email, empresa y mensaje.
          </p>
          <div className="bg-gray-50 rounded-2xl p-6 text-center">
            <p className="font-raleway text-sm text-gray-400">Conecta Supabase para ver los mensajes aquí</p>
          </div>
        </div>

        {/* Trabaja conmigo */}
        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-henko-purple/10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-henko-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="font-roxborough text-xl text-gray-900">Trabaja conmigo</h2>
          </div>
          <p className="font-raleway text-gray-400 text-sm font-light mb-6">
            Solicitudes de colaboración y consultas recibidas desde la sección "Trabaja conmigo".
          </p>
          <div className="bg-gray-50 rounded-2xl p-6 text-center">
            <p className="font-raleway text-sm text-gray-400">Conecta Supabase para ver las solicitudes aquí</p>
          </div>
        </div>
      </div>

      {/* Info conectar */}
      <div className="mt-6 bg-henko-turquoise/5 border border-henko-turquoise/20 rounded-[2rem] p-8">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-henko-turquoise/20 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-henko-turquoise" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-roxborough text-lg text-gray-900 mb-1">Próximo paso: conectar los formularios</h3>
            <p className="font-raleway text-gray-500 text-sm font-light leading-relaxed">
              El panel está listo. Cuando conectes los formularios de contacto a Supabase, los mensajes aparecerán aquí automáticamente con nombre, email, empresa y fecha de envío.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
