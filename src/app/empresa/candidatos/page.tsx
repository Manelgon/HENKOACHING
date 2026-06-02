import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EmpresaCandidatosTable from '@/features/empresa/components/EmpresaCandidatosTable'

export const dynamic = 'force-dynamic'

export default async function EmpresaCandidatosPage() {
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

  const { data: solicitudes } = await supabase
    .from('solicitudes')
    .select(`
      id,
      estado,
      created_at,
      ofertas!inner ( id, titulo, cliente_id ),
      profiles!candidato_id ( nombre, apellidos, email )
    `)
    .eq('ofertas.cliente_id', cliente.id)
    .order('created_at', { ascending: false })

  const rows = (solicitudes ?? []).map((s) => {
    const oferta = s.ofertas as unknown as { id: string; titulo: string } | null
    const perfil = s.profiles as unknown as { nombre: string | null; apellidos: string | null; email: string | null } | null
    return {
      id: s.id,
      estado: s.estado,
      fecha: s.created_at ?? '',
      candidato: perfil
        ? `${perfil.nombre ?? ''} ${perfil.apellidos ?? ''}`.trim() || (perfil.email ?? 'Sin nombre')
        : 'Desconocido',
      ofertaTitulo: oferta?.titulo ?? '',
    }
  })

  return <EmpresaCandidatosTable solicitudes={rows} />
}
