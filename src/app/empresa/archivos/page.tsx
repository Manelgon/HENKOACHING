import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EmpresaArchivosTable from '@/features/empresa/components/EmpresaArchivosTable'

export const dynamic = 'force-dynamic'

export default async function EmpresaArchivosPage() {
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

  const { data: archivos } = await supabase
    .from('cliente_archivos')
    .select('id, nombre_archivo, tipo, tamano_bytes, created_at, storage_path')
    .eq('cliente_id', cliente.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const rows = (archivos ?? []).map((a) => ({
    id: a.id,
    nombre: a.nombre_archivo,
    tipo: a.tipo,
    tamanoBytes: a.tamano_bytes,
    fecha: a.created_at ?? '',
    storagePath: a.storage_path,
  }))

  return <EmpresaArchivosTable archivos={rows} />
}
