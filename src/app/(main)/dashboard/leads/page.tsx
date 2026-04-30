import { createClient } from '@/lib/supabase/server'
import LeadsTable from '@/features/leads/components/LeadsTable'

export const metadata = {
  title: 'Leads — Henkoaching',
}

export const dynamic = 'force-dynamic'

export default async function LeadsPage() {
  const supabase = await createClient()
  const { data: leads } = await supabase
    .from('leads')
    .select('id, nombre, email, telefono, asunto, mensaje, servicio_interes, origen, estado, leido, archivado, creado_manualmente, created_at')
    .eq('archivado', false)
    .order('created_at', { ascending: false })

  return (
    <div className="w-full">
      <div className="mb-8 md:mb-10">
        <h1 className="font-roxborough text-3xl md:text-4xl text-gray-900 mb-2">Leads</h1>
        <p className="font-raleway text-gray-500 font-light">Gestiona tus contactos: del formulario web, redes sociales, llamadas o referencias.</p>
      </div>

      <LeadsTable leads={leads ?? []} />
    </div>
  )
}
