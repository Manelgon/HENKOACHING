import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LogsView from '@/features/audit/components/LogsView'

export const metadata = {
  title: 'Logs — Henkoaching',
}

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 100

type SearchParams = Promise<{
  accion?: string
  recurso?: string
  actor?: string
  q?: string
  page?: string
}>

export default async function LogsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: actor } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (actor?.role !== 'admin') redirect('/dashboard')

  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('audit_logs')
    .select('id, actor_email, actor_id, accion, recurso_tipo, recurso_id, recurso_label, metadata, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (params.accion) query = query.eq('accion', params.accion)
  if (params.recurso) query = query.eq('recurso_tipo', params.recurso)
  if (params.actor) query = query.ilike('actor_email', `%${params.actor}%`)
  if (params.q) query = query.or(`recurso_label.ilike.%${params.q}%,recurso_id.ilike.%${params.q}%,actor_email.ilike.%${params.q}%`)

  const { data: logs, count } = await query

  // Cargar listas únicas para los filtros (limitar a 200 valores recientes)
  const { data: facets } = await supabase
    .from('audit_logs')
    .select('accion, recurso_tipo')
    .order('created_at', { ascending: false })
    .limit(500)

  const accionesUnicas = Array.from(new Set((facets ?? []).map((f) => f.accion))).sort()
  const recursosUnicos = Array.from(new Set((facets ?? []).map((f) => f.recurso_tipo))).sort()

  return (
    <div className="w-full">
      <div className="mb-10">
        <h1 className="font-roxborough text-4xl text-gray-900 mb-2">Logs del sistema</h1>
        <p className="font-raleway text-gray-500 font-light">
          Auditoría completa de todas las acciones realizadas en el proyecto.
        </p>
      </div>

      <LogsView
        logs={logs ?? []}
        total={count ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        acciones={accionesUnicas}
        recursos={recursosUnicos}
        currentFilters={{
          accion: params.accion ?? '',
          recurso: params.recurso ?? '',
          actor: params.actor ?? '',
          q: params.q ?? '',
        }}
      />
    </div>
  )
}
