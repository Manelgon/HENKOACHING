import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import CandidatoDashboard from '@/features/empleo/components/CandidatoDashboard'
import { createClient } from '@/lib/supabase/server'
import { getMisSolicitudes } from '@/features/empleo/queries'

export const metadata: Metadata = {
  title: 'Mi área — Henkoaching',
}

export const dynamic = 'force-dynamic'

export default async function CandidatoDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/candidato/login')

  const [{ data: profile }, { data: candProfile }, { data: cvActivo }, solicitudes] = await Promise.all([
    supabase.from('profiles').select('nombre, apellidos, email, telefono').eq('id', user.id).single(),
    supabase.from('candidato_profiles').select('ubicacion, cargo_actual').eq('user_id', user.id).single(),
    supabase
      .from('cvs')
      .select('id, nombre_archivo, storage_path, created_at, tamano_bytes')
      .eq('candidato_id', user.id)
      .eq('es_principal', true)
      .is('deleted_at', null)
      .maybeSingle(),
    getMisSolicitudes(user.id),
  ])

  return (
    <CandidatoDashboard
      perfil={{
        nombre: profile?.nombre ?? '',
        apellidos: profile?.apellidos ?? '',
        email: profile?.email ?? '',
        telefono: profile?.telefono ?? '',
        ubicacion: candProfile?.ubicacion ?? '',
        cargo: candProfile?.cargo_actual ?? '',
      }}
      cv={cvActivo}
      solicitudes={solicitudes.map((s) => {
        const oferta = s.ofertas as unknown as {
          id: string
          slug: string
          titulo: string
          empresas: { nombre: string } | null
        } | null
        return {
          id: s.id,
          estado: s.estado,
          fecha: s.created_at ? new Date(s.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '',
          ofertaSlug: oferta?.slug ?? '',
          ofertaTitulo: oferta?.titulo ?? '',
          empresa: oferta?.empresas?.nombre ?? '',
        }
      })}
    />
  )
}
