import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ClienteDetalleLayout from '@/features/clientes/components/ClienteDetalleLayout'

export const dynamic = 'force-dynamic'

export default async function ClienteFichaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: cliente } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!cliente) notFound()

  const [{ data: notasRaw }, { data: archivos }, { data: facturas }, { data: ofertas }] = await Promise.all([
    supabase
      .from('cliente_notas')
      .select('id, contenido, created_at, autor_id, profiles:autor_id(email)')
      .eq('cliente_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('cliente_archivos')
      .select('id, nombre_archivo, storage_path, tipo, tamano_bytes, created_at')
      .eq('cliente_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false }),
    supabase
      .from('facturas')
      .select('id, numero, fecha_emision, total, estado')
      .eq('cliente_id', id)
      .order('fecha_emision', { ascending: false }),
    supabase
      .from('ofertas')
      .select(`
        id, titulo, estado, fecha_publicacion,
        solicitudes(id, estado, created_at,
          candidato_profiles:candidato_id(profiles(nombre, apellidos, email))
        )
      `)
      .eq('cliente_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false }),
  ])

  const notas = (notasRaw ?? []).map((n) => ({
    id: n.id,
    contenido: n.contenido,
    created_at: n.created_at,
    autor_email: (n.profiles as { email?: string } | null)?.email ?? null,
  }))

  return (
    <div className="w-full">
      <div className="mb-6">
        <Link href="/dashboard/clientes" className="inline-flex items-center gap-1 text-sm text-gray-500 font-raleway hover:text-henko-turquoise">
          ← Volver a clientes
        </Link>
      </div>

      <ClienteDetalleLayout
        cliente={cliente}
        notas={notas}
        archivos={archivos ?? []}
        facturas={facturas ?? []}
        ofertas={ofertas ?? []}
      />
    </div>
  )
}
