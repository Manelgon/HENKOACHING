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

  const [
    { count: leadsPendientes },
    { count: clientesActivos },
    { count: solicitudesNuevas },
    { count: candidatosNuevos },
    { data: ultimasSolicitudes },
    { data: ultimasLeads },
  ] = await Promise.all([
    supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('archivado', false)
      .in('estado', ['nuevo', 'pendiente']),
    supabase
      .from('clientes')
      .select('id', { count: 'exact', head: true })
      .eq('estado', 'activo')
      .is('deleted_at', null),
    supabase
      .from('solicitudes')
      .select('id', { count: 'exact', head: true })
      .eq('estado', 'nuevo'),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'candidato')
      .is('deleted_at', null)
      .gte('created_at', desdeSemana.toISOString()),
    supabase
      .from('solicitudes')
      .select(`
        id, created_at, estado,
        candidato_profiles:candidato_id(profiles(nombre, apellidos, email)),
        ofertas(titulo)
      `)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('leads')
      .select('id, nombre, email, estado, created_at')
      .eq('archivado', false)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  type SolRaw = {
    id: string
    created_at: string | null
    estado: string
    candidato_profiles: { profiles: { nombre: string | null; apellidos: string | null; email: string } | null } | null
    ofertas: { titulo: string } | null
  }

  const solicitudes = ((ultimasSolicitudes ?? []) as unknown as SolRaw[]).map(s => ({
    id: s.id,
    created_at: s.created_at,
    estado: s.estado,
    candidato: [s.candidato_profiles?.profiles?.nombre, s.candidato_profiles?.profiles?.apellidos].filter(Boolean).join(' ') || s.candidato_profiles?.profiles?.email || 'Candidato',
    oferta: s.ofertas?.titulo ?? '—',
  }))

  const ESTADO_SOL: Record<string, { label: string; clase: string }> = {
    nuevo:      { label: 'Nuevo',      clase: 'bg-henko-greenblue text-henko-turquoise' },
    revisando:  { label: 'Revisando',  clase: 'bg-henko-yellow text-yellow-900' },
    entrevista: { label: 'Entrevista', clase: 'bg-henko-purple text-white' },
    descartado: { label: 'Descartado', clase: 'bg-black/5 text-gray-500' },
    contratado: { label: 'Contratado', clase: 'bg-henko-turquoise text-white' },
  }

  const ESTADO_LEAD: Record<string, { label: string; clase: string }> = {
    nuevo:     { label: 'Nuevo',     clase: 'bg-henko-greenblue text-henko-turquoise' },
    pendiente: { label: 'Pendiente', clase: 'bg-henko-yellow text-yellow-900' },
    contactado:{ label: 'Contactado',clase: 'bg-blue-50 text-blue-700' },
    perdido:   { label: 'Perdido',   clase: 'bg-black/5 text-gray-500' },
    convertido:{ label: 'Cliente',   clase: 'bg-henko-turquoise text-white' },
  }

  return (
    <div className="w-full">
      <div className="mb-8 md:mb-10">
        <h1 className="font-roxborough text-2xl md:text-3xl text-gray-900 mb-2">Panel de gestión</h1>
        <p className="font-raleway text-gray-500 font-light">Resumen de tu negocio y portal de empleo.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-8">
        <StatCard label="Leads pendientes"    value={leadsPendientes ?? 0}  accent="turquoise" href="/dashboard/leads" />
        <StatCard label="Clientes activos"    value={clientesActivos ?? 0}  accent="purple"    href="/dashboard/clientes" />
        <StatCard label="Solicitudes nuevas"  value={solicitudesNuevas ?? 0} accent="coral"    href="/dashboard/solicitudes" />
        <StatCard label="Candidatos (7 días)" value={candidatosNuevos ?? 0} accent="orange"   href="/dashboard/candidatos" />
      </div>

      {/* Accesos rápidos */}
      <div className="mb-8">
        <p className="font-raleway text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Accesos rápidos</p>
        <div className="grid grid-cols-3 gap-3">
          <QuickLink href="/dashboard/ofertas" icon="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" label="Nueva oferta" />
          <QuickLink href="/dashboard/clientes" icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" label="Nuevo cliente" />
          <QuickLink href="/dashboard/facturas" icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" label="Nueva factura" />
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Últimas solicitudes empleo */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-roxborough text-lg text-gray-900">Últimas solicitudes</h2>
            <Link href="/dashboard/solicitudes" className="text-xs font-raleway text-henko-turquoise hover:underline">Ver todas →</Link>
          </div>
          {solicitudes.length === 0 ? (
            <p className="font-raleway text-sm text-gray-400 italic">Sin solicitudes todavía.</p>
          ) : (
            <div className="space-y-2">
              {solicitudes.map(s => {
                const meta = ESTADO_SOL[s.estado] ?? { label: s.estado, clase: 'bg-gray-100 text-gray-600' }
                const fecha = s.created_at ? new Date(s.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '—'
                return (
                  <Link
                    key={s.id}
                    href="/dashboard/solicitudes"
                    className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-henko-greenblue transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-raleway font-semibold text-gray-900 text-sm truncate">{s.candidato}</p>
                      <p className="text-xs text-gray-400 font-raleway truncate">{s.oferta}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${meta.clase}`}>{meta.label}</span>
                      <span className="text-[11px] text-gray-400">{fecha}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Últimas leads */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-roxborough text-lg text-gray-900">Últimas leads</h2>
            <Link href="/dashboard/leads" className="text-xs font-raleway text-henko-turquoise hover:underline">Ver todas →</Link>
          </div>
          {(!ultimasLeads || ultimasLeads.length === 0) ? (
            <p className="font-raleway text-sm text-gray-400 italic">Sin leads todavía.</p>
          ) : (
            <div className="space-y-2">
              {ultimasLeads.map(l => {
                const meta = ESTADO_LEAD[l.estado as string] ?? { label: l.estado, clase: 'bg-gray-100 text-gray-600' }
                const fecha = l.created_at ? new Date(l.created_at as string).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '—'
                return (
                  <Link
                    key={l.id}
                    href="/dashboard/leads"
                    className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-henko-greenblue transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-raleway font-semibold text-gray-900 text-sm truncate">{l.nombre as string}</p>
                      <p className="text-xs text-gray-400 font-raleway truncate">{l.email as string}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${meta.clase}`}>{meta.label}</span>
                      <span className="text-[11px] text-gray-400">{fecha}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

function StatCard({ label, value, accent, href }: { label: string; value: number; accent: 'turquoise' | 'coral' | 'purple' | 'orange'; href: string }) {
  const colorMap = { turquoise: 'text-henko-turquoise', coral: 'text-henko-coral', purple: 'text-henko-purple', orange: 'text-henko-orange' }
  return (
    <Link href={href} className="bg-white rounded-2xl md:rounded-[2rem] p-5 md:p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all">
      <p className="font-raleway text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
      <p className={`font-roxborough text-3xl md:text-5xl ${colorMap[accent]}`}>{value}</p>
    </Link>
  )
}

function QuickLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center gap-2.5 hover:shadow-md hover:border-henko-greenblue hover:bg-henko-greenblue/5 transition-all group"
    >
      <div className="w-10 h-10 rounded-xl bg-henko-turquoise/10 flex items-center justify-center group-hover:bg-henko-turquoise/20 transition-colors">
        <svg className="w-5 h-5 text-henko-turquoise" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>
      <span className="font-raleway text-xs font-semibold text-gray-700 group-hover:text-henko-turquoise transition-colors text-center">{label}</span>
    </Link>
  )
}
