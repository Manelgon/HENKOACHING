import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCandidatoPerfil } from '@/actions/candidatos-admin'
import CandidatoHeader from '@/features/candidatos/components/CandidatoHeader'
import { CandidatoExperiencia, CandidatoEducacion, CandidatoIdiomas, CandidatoPreferencias } from '@/features/candidatos/components/CandidatoExperiencia'
import CandidatoCVs from '@/features/candidatos/components/CandidatoCVs'
import CandidatoSolicitudes from '@/features/candidatos/components/CandidatoSolicitudes'
import CandidatoAccionesAdmin from '@/features/candidatos/components/CandidatoAccionesAdmin'

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

  const admin = createAdminClient()
  const [perfil, { data: ofertasData }] = await Promise.all([
    getCandidatoPerfil(id),
    admin.from('ofertas').select('id, titulo').eq('estado', 'publicada').is('deleted_at', null).order('created_at', { ascending: false }),
  ])
  if (!perfil) notFound()

  const ofertas = (ofertasData ?? []) as { id: string; titulo: string }[]
  const ofertasVinculadas = perfil.solicitudes.map(s => s.oferta_id)

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

        {/* Columna derecha: CV, solicitudes, acciones admin */}
        <div className="space-y-5">
          {perfil.cvs.length > 0 && <CandidatoCVs cvs={perfil.cvs} />}
          <CandidatoSolicitudes solicitudes={perfil.solicitudes} candidatoId={id} />
          <CandidatoAccionesAdmin
            candidatoId={id}
            candidatoEmail={perfil.email}
            archivado={perfil.archivado}
            notas={perfil.notas}
            ofertas={ofertas}
            ofertasVinculadas={ofertasVinculadas}
          />
        </div>
      </div>
    </div>
  )
}
