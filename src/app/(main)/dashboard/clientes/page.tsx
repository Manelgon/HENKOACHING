import { createClient } from '@/lib/supabase/server'
import ClientesTable from '@/features/clientes/components/ClientesTable'

export const metadata = {
  title: 'Clientes — Henkoaching',
}

export const dynamic = 'force-dynamic'

export default async function ClientesPage() {
  const supabase = await createClient()
  const { data: clientes } = await supabase
    .from('clientes')
    .select('id, nombre, email, telefono, empresa, servicio_contratado, importe, tarifa, estado, proxima_sesion, fecha_inicio, fecha_conversion, origen')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  return (
    <div className="w-full">
      <div className="mb-8 md:mb-10">
        <h1 className="font-roxborough text-3xl md:text-4xl text-gray-900 mb-2">Clientes</h1>
        <p className="font-raleway text-gray-500 font-light">Tu cartera de clientes activos, en pausa o finalizados.</p>
      </div>

      <ClientesTable clientes={clientes ?? []} />
    </div>
  )
}
