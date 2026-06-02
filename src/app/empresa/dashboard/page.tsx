import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EmpresaOverview from '@/features/empresa/components/EmpresaOverview'

export const dynamic = 'force-dynamic'

export default async function EmpresaDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cliente } = await supabase
    .from('clientes')
    .select('id, nombre, descripcion, logo_url, ubicacion')
    .eq('owner_user_id', user.id)
    .is('deleted_at', null)
    .maybeSingle()

  if (!cliente) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center gap-4">
        <p className="font-raleway text-gray-500">Tu cuenta de empresa aún no está vinculada a ningún perfil.</p>
        <p className="font-raleway text-sm text-gray-400">Contacta con Henkoaching para activar tu acceso.</p>
      </div>
    )
  }

  const [
    { count: totalOfertas },
    { count: totalCandidatos },
    { count: totalFacturas },
    { count: ofertasActivas },
  ] = await Promise.all([
    supabase.from('ofertas').select('*', { count: 'exact', head: true }).eq('cliente_id', cliente.id).is('deleted_at', null),
    supabase.from('solicitudes').select('ofertas!inner(cliente_id)', { count: 'exact', head: true }).eq('ofertas.cliente_id', cliente.id),
    supabase.from('facturas').select('*', { count: 'exact', head: true }).eq('cliente_id', cliente.id),
    supabase.from('ofertas').select('*', { count: 'exact', head: true }).eq('cliente_id', cliente.id).eq('estado', 'publicada').is('deleted_at', null),
  ])

  return (
    <EmpresaOverview
      nombre={cliente.nombre}
      descripcion={cliente.descripcion}
      logoUrl={cliente.logo_url}
      ubicacion={cliente.ubicacion}
      stats={{
        totalOfertas: totalOfertas ?? 0,
        ofertasActivas: ofertasActivas ?? 0,
        totalCandidatos: totalCandidatos ?? 0,
        totalFacturas: totalFacturas ?? 0,
      }}
    />
  )
}
