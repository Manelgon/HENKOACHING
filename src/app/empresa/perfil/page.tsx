import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EmpresaPerfilForm from '@/features/empresa/components/EmpresaPerfilForm'

export const dynamic = 'force-dynamic'

export default async function EmpresaPerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cliente } = await supabase
    .from('clientes')
    .select('id, nombre, email, telefono, descripcion, logo_url, ubicacion, web_url, linkedin_url, nif_cif')
    .eq('owner_user_id', user.id)
    .is('deleted_at', null)
    .maybeSingle()

  if (!cliente) redirect('/empresa/dashboard')

  return (
    <EmpresaPerfilForm
      clienteId={cliente.id}
      initial={{
        nombre: cliente.nombre,
        email: cliente.email,
        telefono: cliente.telefono,
        descripcion: cliente.descripcion,
        logoUrl: cliente.logo_url,
        ubicacion: cliente.ubicacion,
        webUrl: cliente.web_url,
        linkedinUrl: cliente.linkedin_url,
        nifCif: cliente.nif_cif,
      }}
    />
  )
}
