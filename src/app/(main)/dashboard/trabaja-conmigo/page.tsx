import { createClient } from '@/lib/supabase/server'
import LeadsTable from '@/features/leads/components/LeadsTable'

export const metadata = {
  title: 'Trabaja conmigo — Henkoaching',
}

export const dynamic = 'force-dynamic'

export default async function TrabajaConmigoAdminPage() {
  const supabase = await createClient()
  const { data: leads } = await supabase
    .from('leads')
    .select('id, nombre, email, telefono, asunto, mensaje, servicio_interes, leido, archivado, created_at')
    .eq('tipo', 'trabaja_conmigo')
    .eq('archivado', false)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="font-roxborough text-4xl text-gray-900 mb-2">Trabaja conmigo</h1>
        <p className="font-raleway text-gray-500 font-light">Solicitudes recibidas desde la sección &quot;Trabaja conmigo&quot;</p>
      </div>

      <LeadsTable leads={leads ?? []} />
    </div>
  )
}
