import AdminSolicitudes from '@/features/empleo/components/AdminSolicitudes'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Solicitudes — Henkoaching',
}

export const dynamic = 'force-dynamic'

export default async function DashboardSolicitudesPage() {
  const supabase = await createClient()

  const [{ data: solicitudes }, { data: ofertas }] = await Promise.all([
    supabase
      .from('solicitudes')
      .select(`
        id, estado, created_at, mensaje,
        candidato_id, oferta_id, cv_id,
        ofertas(id, titulo),
        cvs(id, nombre_archivo, storage_path),
        profiles:candidato_id(nombre, apellidos, email, telefono)
      `)
      .order('created_at', { ascending: false }),
    supabase
      .from('ofertas')
      .select('id, titulo')
      .is('deleted_at', null)
      .order('created_at', { ascending: false }),
  ])

  const solicitudesView = (solicitudes ?? []).map((s) => {
    const oferta = s.ofertas as unknown as { id: string; titulo: string } | null
    const cv = s.cvs as unknown as { id: string; nombre_archivo: string; storage_path: string } | null
    const profile = s.profiles as unknown as { nombre: string | null; apellidos: string | null; email: string; telefono: string | null } | null
    return {
      id: s.id,
      estado: s.estado,
      fecha: s.created_at ? new Date(s.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '',
      candidato: `${profile?.nombre ?? ''} ${profile?.apellidos ?? ''}`.trim() || profile?.email || '—',
      email: profile?.email ?? '',
      telefono: profile?.telefono ?? '',
      mensaje: s.mensaje ?? '',
      ofertaId: oferta?.id ?? '',
      ofertaTitulo: oferta?.titulo ?? '',
      cvNombre: cv?.nombre_archivo ?? null,
      cvPath: cv?.storage_path ?? null,
    }
  })

  return (
    <div className="w-full">
      <AdminSolicitudes solicitudes={solicitudesView} ofertas={ofertas ?? []} />
    </div>
  )
}
