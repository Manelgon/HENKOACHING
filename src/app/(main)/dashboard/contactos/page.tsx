import { createClient } from '@/lib/supabase/server'
import LeadsTable from '@/features/leads/components/LeadsTable'

export const metadata = {
  title: 'Contactos — Henkoaching',
}

export const dynamic = 'force-dynamic'

export default async function ContactosPage() {
  const supabase = await createClient()
  const { data: leads } = await supabase
    .from('leads')
    .select('id, nombre, email, telefono, asunto, mensaje, servicio_interes, leido, archivado, created_at')
    .eq('tipo', 'contacto_general')
    .eq('archivado', false)
    .order('created_at', { ascending: false })

  return (
    <div className="w-full">
      <div className="mb-10">
        <h1 className="font-roxborough text-4xl text-gray-900 mb-2">Formularios de contacto</h1>
        <p className="font-raleway text-gray-500 font-light">Mensajes recibidos desde la página de contacto</p>
      </div>

      <LeadsTable leads={leads ?? []} />
    </div>
  )
}
