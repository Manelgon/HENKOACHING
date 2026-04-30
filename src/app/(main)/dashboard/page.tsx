import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Panel — Henkoaching',
}

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  const desdeSemana = new Date()
  desdeSemana.setDate(desdeSemana.getDate() - 7)

  const ahora = new Date()
  const en7Dias = new Date()
  en7Dias.setDate(en7Dias.getDate() + 7)

  const [
    { count: leadsPendientes },
    { count: leadsNuevosSemana },
    { count: clientesActivos },
    { count: clientesPausados },
    { data: proximasSesiones },
  ] = await Promise.all([
    supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('archivado', false)
      .in('estado', ['nuevo', 'pendiente']),
    supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('archivado', false)
      .gte('created_at', desdeSemana.toISOString()),
    supabase
      .from('clientes')
      .select('id', { count: 'exact', head: true })
      .eq('estado', 'activo')
      .is('deleted_at', null),
    supabase
      .from('clientes')
      .select('id', { count: 'exact', head: true })
      .eq('estado', 'pausado')
      .is('deleted_at', null),
    supabase
      .from('cliente_sesiones')
      .select('id, fecha, tipo, cliente_id, clientes:cliente_id(nombre)')
      .eq('realizada', false)
      .gte('fecha', ahora.toISOString())
      .lte('fecha', en7Dias.toISOString())
      .order('fecha', { ascending: true })
      .limit(5),
  ])

  return (
    <div className="w-full">
      <div className="mb-10">
        <h1 className="font-roxborough text-4xl text-gray-900 mb-2">Panel de gestión</h1>
        <p className="font-raleway text-gray-500 font-light">Resumen de tus leads, clientes y próximas sesiones.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard label="Leads pendientes" value={leadsPendientes ?? 0} accent="turquoise" href="/dashboard/leads" />
        <StatCard label="Leads esta semana" value={leadsNuevosSemana ?? 0} accent="coral" href="/dashboard/leads" />
        <StatCard label="Clientes activos" value={clientesActivos ?? 0} accent="purple" href="/dashboard/clientes" />
        <StatCard label="Clientes pausados" value={clientesPausados ?? 0} accent="orange" href="/dashboard/clientes" />
      </div>

      {/* Próximas sesiones */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-roxborough text-xl md:text-2xl text-gray-900">Próximas sesiones (7 días)</h2>
          <Link href="/dashboard/clientes" className="text-xs font-raleway text-henko-turquoise hover:underline">Ver clientes →</Link>
        </div>
        {(!proximasSesiones || proximasSesiones.length === 0) ? (
          <p className="font-raleway text-sm text-gray-400 italic">Sin sesiones programadas en los próximos 7 días.</p>
        ) : (
          <div className="space-y-2">
            {proximasSesiones.map((s) => {
              const nombre = (s.clientes as { nombre?: string } | null)?.nombre ?? 'Cliente'
              const fecha = new Date(s.fecha).toLocaleString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
              return (
                <Link
                  key={s.id}
                  href={`/dashboard/clientes/${s.cliente_id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-henko-greenblue transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-raleway font-semibold text-gray-900 text-sm truncate">{nombre}</p>
                    <p className="text-xs text-gray-500 font-raleway">{s.tipo ?? 'Sesión'}</p>
                  </div>
                  <span className="font-raleway text-xs text-henko-turquoise font-semibold flex-shrink-0">{fecha}</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  accent,
  href,
}: {
  label: string
  value: number
  accent: 'turquoise' | 'coral' | 'purple' | 'orange'
  href: string
}) {
  const colorMap = {
    turquoise: 'text-henko-turquoise',
    coral: 'text-henko-coral',
    purple: 'text-henko-purple',
    orange: 'text-henko-orange',
  }
  return (
    <Link
      href={href}
      className="bg-white rounded-2xl md:rounded-[2rem] p-5 md:p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all"
    >
      <p className="font-raleway text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
      <p className={`font-roxborough text-3xl md:text-5xl ${colorMap[accent]}`}>{value}</p>
    </Link>
  )
}
