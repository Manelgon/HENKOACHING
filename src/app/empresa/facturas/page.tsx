import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EmpresaFacturasTable from '@/features/empresa/components/EmpresaFacturasTable'

export const dynamic = 'force-dynamic'

export default async function EmpresaFacturasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cliente } = await supabase
    .from('clientes')
    .select('id')
    .eq('owner_user_id', user.id)
    .is('deleted_at', null)
    .maybeSingle()

  if (!cliente) redirect('/empresa/dashboard')

  const { data: facturas } = await supabase
    .from('facturas')
    .select('id, numero, fecha_emision, total, estado, forma_pago')
    .eq('cliente_id', cliente.id)
    .order('fecha_emision', { ascending: false })

  const rows = (facturas ?? []).map((f) => ({
    id: f.id,
    numero: f.numero,
    fechaEmision: f.fecha_emision,
    total: f.total ?? 0,
    estado: f.estado,
    formaPago: f.forma_pago,
  }))

  return <EmpresaFacturasTable facturas={rows} />
}
