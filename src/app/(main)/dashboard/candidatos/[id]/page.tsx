import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCandidatoPerfil } from '@/actions/candidatos-admin'
import CandidatoHeader from '@/features/candidatos/components/CandidatoHeader'
import { CandidatoExperiencia, CandidatoEducacion, CandidatoIdiomas, CandidatoPreferencias } from '@/features/candidatos/components/CandidatoExperiencia'
import CandidatoCVs from '@/features/candidatos/components/CandidatoCVs'
import CandidatoSolicitudes from '@/features/candidatos/components/CandidatoSolicitudes'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export default async function CandidatoPerfilPage({ params }: Props) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const perfil = await getCandidatoPerfil(id)
  if (!perfil) notFound()

  const nombre = [perfil.nombre, perfil.apellidos].filter(Boolean).join(' ') || perfil.email

  return (
    <div className="w-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 font-raleway text-sm">
        <Link href="/dashboard/candidatos" className="text-gray-400 hover:text-henko-turquoise transition-colors">
          Candidatos
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-700 font-medium truncate">{nombre}</span>
      </div>

      {/* Header full width */}
      <CandidatoHeader perfil={perfil} />

      {/* Dos columnas */}
      <div className="mt-5 grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
        {/* Columna izquierda: experiencia, educación, idiomas, preferencias */}
        <div className="space-y-5">
          <CandidatoExperiencia experiencias={perfil.experiencias} />
          <CandidatoEducacion educacion={perfil.educacion} />
          <CandidatoIdiomas idiomas={perfil.idiomas} />
          <CandidatoPreferencias perfil={perfil} />
        </div>

        {/* Columna derecha: CV, solicitudes */}
        <div className="space-y-5">
          {perfil.cvs.length > 0 && <CandidatoCVs cvs={perfil.cvs} />}
          <CandidatoSolicitudes solicitudes={perfil.solicitudes} candidatoId={id} />
        </div>
      </div>
    </div>
  )
}
