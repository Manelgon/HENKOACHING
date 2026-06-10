import AdminSolicitudes from '@/features/empleo/components/AdminSolicitudes'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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
        candidato_profiles:candidato_id(cargo_actual, resumen, profiles(nombre, apellidos, email, telefono))
      `)
      .order('created_at', { ascending: false })
      // Cota de seguridad: la vista filtra en cliente; evitamos cargar la tabla
      // completa si el volumen de solicitudes crece con el portal de empleo.
      .limit(500),
    supabase
      .from('ofertas')
      .select('id, titulo')
      .is('deleted_at', null)
      .order('created_at', { ascending: false }),
  ])

  // Qué candidatos tienen trayectoria rellena (experiencia, educación o idiomas).
  // Se consulta con admin client porque esas tablas tienen RLS más estricta.
  const candidatoIds = [...new Set((solicitudes ?? []).map(s => s.candidato_id).filter(Boolean) as string[])]
  const conTrayectoria = new Set<string>()
  if (candidatoIds.length) {
    const admin = createAdminClient()
    const [{ data: exps }, { data: edus }, { data: idis }] = await Promise.all([
      admin.from('candidato_experiencias').select('candidato_id').in('candidato_id', candidatoIds),
      admin.from('candidato_educacion').select('candidato_id').in('candidato_id', candidatoIds),
      admin.from('candidato_idiomas').select('candidato_id').in('candidato_id', candidatoIds),
    ])
    for (const r of [...(exps ?? []), ...(edus ?? []), ...(idis ?? [])]) {
      if (r.candidato_id) conTrayectoria.add(r.candidato_id as string)
    }
  }

  const solicitudesView = (solicitudes ?? []).map((s) => {
    const oferta = s.ofertas as unknown as { id: string; titulo: string } | null
    const cv = s.cvs as unknown as { id: string; nombre_archivo: string; storage_path: string } | null
    const candidatoProfile = s.candidato_profiles as unknown as { cargo_actual: string | null; resumen: string | null; profiles: { nombre: string | null; apellidos: string | null; email: string; telefono: string | null } | null } | null
    const profile = candidatoProfile?.profiles ?? null
    const cargo = candidatoProfile?.cargo_actual ?? null
    const tieneTrayectoria = conTrayectoria.has(s.candidato_id) || !!candidatoProfile?.resumen?.trim()
    return {
      id: s.id,
      estado: s.estado,
      fecha: s.created_at ? new Date(s.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '',
      candidatoId: s.candidato_id,
      candidato: `${profile?.nombre ?? ''} ${profile?.apellidos ?? ''}`.trim() || profile?.email || '—',
      email: profile?.email ?? '',
      telefono: profile?.telefono ?? '',
      mensaje: s.mensaje ?? '',
      ofertaId: oferta?.id ?? '',
      ofertaTitulo: oferta?.titulo ?? '',
      cvNombre: cv?.nombre_archivo ?? null,
      cvPath: cv?.storage_path ?? null,
      cargo: cargo ?? '',
      tieneTrayectoria,
    }
  })

  return (
    <div className="w-full">
      <AdminSolicitudes solicitudes={solicitudesView} ofertas={ofertas ?? []} />
    </div>
  )
}
