import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Panel — Henkoaching',
}

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  const desdeSemana = new Date()
  desdeSemana.setDate(desdeSemana.getDate() - 7)

  const [{ count: totalContactos }, { count: estaSemana }] = await Promise.all([
    supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('tipo', 'contacto_general')
      .eq('archivado', false),
    supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('tipo', 'contacto_general')
      .eq('archivado', false)
      .gte('created_at', desdeSemana.toISOString()),
  ])

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-roxborough text-4xl text-gray-900 mb-2">Panel de gestión</h1>
        <p className="font-raleway text-gray-500 font-light">Gestiona los formularios recibidos desde la web</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
          <p className="font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Contactos recibidos</p>
          <p className="font-roxborough text-5xl text-henko-turquoise">{totalContactos ?? 0}</p>
          <p className="font-raleway text-sm text-gray-400 mt-2">Total histórico</p>
        </div>
        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
          <p className="font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Esta semana</p>
          <p className="font-roxborough text-5xl text-henko-coral">{estaSemana ?? 0}</p>
          <p className="font-raleway text-sm text-gray-400 mt-2">Últimos 7 días</p>
        </div>
      </div>
    </div>
  )
}
