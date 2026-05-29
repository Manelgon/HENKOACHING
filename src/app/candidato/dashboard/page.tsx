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

  const { data: roleProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (roleProfile?.role && roleProfile.role !== 'candidato') redirect('/dashboard')

  const [
    { data: profile },
    { data: candProfile },
    { data: cvActivo },
    { data: expData },
    { data: eduData },
    { data: idiomaData },
    solicitudes,
  ] = await Promise.all([
    supabase.from('profiles').select('nombre, apellidos, email, telefono, avatar_url').eq('id', user.id).single(),
    supabase.from('candidato_profiles')
      .select('ubicacion, localidad, cp, cargo_actual, resumen, linkedin_url, tipo_jornada, modalidad_trabajo, tipo_contrato, sectores_interes, disponibilidad, pretension_salarial')
      .eq('user_id', user.id).single(),
    supabase.from('cvs').select('id, nombre_archivo, storage_path, created_at, tamano_bytes')
      .eq('candidato_id', user.id).eq('es_principal', true).is('deleted_at', null).maybeSingle(),
    supabase.from('candidato_experiencias').select('id, empresa, cargo, desde, hasta, descripcion').eq('candidato_id', user.id).order('orden').order('created_at'),
    supabase.from('candidato_educacion').select('id, centro, titulo, ano_fin').eq('candidato_id', user.id).order('orden').order('created_at'),
    supabase.from('candidato_idiomas').select('id, idioma, nivel').eq('candidato_id', user.id).order('orden').order('created_at'),
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
        localidad: candProfile?.localidad ?? '',
        cp: candProfile?.cp ?? '',
        cargo: candProfile?.cargo_actual ?? '',
        resumen: candProfile?.resumen ?? '',
        linkedinUrl: candProfile?.linkedin_url ?? '',
        avatarUrl: profile?.avatar_url ?? '',
      }}
      completion={{
        hasAvatar: !!profile?.avatar_url,
        hasTelefono: !!profile?.telefono,
        hasUbicacion: !!candProfile?.ubicacion,
        hasCargo: !!candProfile?.cargo_actual,
        hasResumen: !!candProfile?.resumen,
        hasLinkedin: !!candProfile?.linkedin_url,
        hasCv: !!cvActivo,
        hasExperiencia: (expData?.length ?? 0) > 0,
        hasEducacion: (eduData?.length ?? 0) > 0,
        hasIdioma: (idiomaData?.length ?? 0) > 0,
        hasPreferencias: !!candProfile?.tipo_jornada || (candProfile?.sectores_interes?.length ?? 0) > 0,
      }}
      cv={cvActivo}
      experiencias={(expData ?? []).map((e) => ({
        id: e.id, empresa: e.empresa, cargo: e.cargo,
        desde: e.desde ?? null, hasta: e.hasta ?? null, descripcion: e.descripcion ?? null,
      }))}
      educacion={(eduData ?? []).map((e) => ({
        id: e.id, centro: e.centro, titulo: e.titulo, ano_fin: e.ano_fin ?? null,
      }))}
      idiomas={(idiomaData ?? []).map((i) => ({
        id: i.id, idioma: i.idioma, nivel: i.nivel,
      }))}
      preferencias={{
        tipoJornada: candProfile?.tipo_jornada ?? '',
        modalidad: candProfile?.modalidad_trabajo ?? '',
        tipoContrato: candProfile?.tipo_contrato ?? '',
        sectores: candProfile?.sectores_interes ?? [],
        disponibilidad: candProfile?.disponibilidad ?? '',
        pretensionSalarial: candProfile?.pretension_salarial ?? '',
      }}
      solicitudes={solicitudes.map((s) => {
        const oferta = s.ofertas as unknown as {
          id: string
          slug: string
          titulo: string
          clientes: { nombre: string } | null
        } | null
        return {
          id: s.id,
          estado: s.estado,
          fecha: s.created_at ? new Date(s.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '',
          ofertaSlug: oferta?.slug ?? '',
          ofertaTitulo: oferta?.titulo ?? '',
          empresa: oferta?.clientes?.nombre ?? '',
        }
      })}
    />
  )
}
