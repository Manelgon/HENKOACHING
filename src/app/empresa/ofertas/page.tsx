import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EmpresaOfertasTable from '@/features/empresa/components/EmpresaOfertasTable'

export const dynamic = 'force-dynamic'

export default async function EmpresaOfertasPage() {
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

  const { data: ofertas } = await supabase
    .from('ofertas')
    .select('id, titulo, slug, estado, fecha_publicacion, created_at')
    .eq('cliente_id', cliente.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  // Solicitudes por oferta
  const ofertaIds = (ofertas ?? []).map((o) => o.id)
  const { data: solicitudesCount } = ofertaIds.length > 0
    ? await supabase
        .from('solicitudes')
        .select('oferta_id')
        .in('oferta_id', ofertaIds)
    : { data: [] }

  const countPorOferta = (solicitudesCount ?? []).reduce<Record<string, number>>((acc, s) => {
    acc[s.oferta_id] = (acc[s.oferta_id] ?? 0) + 1
    return acc
  }, {})

  const ofertasConCount = (ofertas ?? []).map((o) => ({
    id: o.id,
    titulo: o.titulo,
    slug: o.slug,
    estado: o.estado,
    fechaPublicacion: o.fecha_publicacion,
    createdAt: o.created_at ?? '',
    solicitudes: countPorOferta[o.id] ?? 0,
  }))

  return <EmpresaOfertasTable ofertas={ofertasConCount} />
}
