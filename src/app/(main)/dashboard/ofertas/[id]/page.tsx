import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import OfertaDetalleLayout from '@/features/empleo/components/OfertaDetalleLayout'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export default async function OfertaDetallePage({ params }: Props) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const [
    { data: ofertaRaw },
    { data: solicitudesRaw },
    { data: sectores },
    { data: modalidades },
    { data: jornadas },
    { data: empresas },
  ] = await Promise.all([
    supabase
      .from('ofertas')
      .select(`
        id, slug, titulo, ubicacion, salario_texto, descripcion, requisitos, ofrecemos,
        estado, fecha_publicacion, fecha_expiracion, sector_id, modalidad_id, jornada_id,
        empresa_oculta, reporta_a, contrato, funciones, competencias,
        clientes(nombre),
        sectores(nombre),
        modalidades(nombre),
        jornadas(nombre)
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single(),
    supabase
      .from('solicitudes')
      .select(`
        id, estado, created_at, mensaje, candidato_id, cv_id,
        cvs(nombre_archivo, storage_path),
        candidato_profiles:candidato_id(cargo_actual, profiles(nombre, apellidos, email, telefono))
      `)
      .eq('oferta_id', id)
      .order('created_at', { ascending: false }),
    supabase.from('sectores').select('id, nombre, slug').order('orden'),
    supabase.from('modalidades').select('id, nombre, slug').order('orden'),
    supabase.from('jornadas').select('id, nombre, slug').order('orden'),
    supabase.from('clientes').select('id, nombre, ubicacion').eq('tipo', 'empresa').is('deleted_at', null).order('nombre'),
  ])

  if (!ofertaRaw) notFound()

  type OfertaRaw = typeof ofertaRaw & {
    clientes: { nombre: string } | null
    sectores: { nombre: string } | null
    modalidades: { nombre: string } | null
    jornadas: { nombre: string } | null
  }
  const o = ofertaRaw as unknown as OfertaRaw

  const oferta = {
    id: o.id,
    titulo: o.titulo,
    empresa: (o.clientes)?.nombre ?? '',
    empresa_oculta: !!o.empresa_oculta,
    ubicacion: o.ubicacion ?? '',
    salario_texto: o.salario_texto ?? '',
    reporta_a: o.reporta_a ?? '',
    contrato: o.contrato ?? '',
    descripcion: o.descripcion,
    funciones: (o.funciones as string[]) ?? [],
    requisitos: (o.requisitos as string[]) ?? [],
    competencias: (o.competencias as string[]) ?? [],
    ofrecemos: (o.ofrecemos as string[]) ?? [],
    estado: o.estado as 'borrador' | 'publicada' | 'pausada' | 'cerrada',
    fecha: o.fecha_publicacion
      ? new Date(o.fecha_publicacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
      : '',
    fecha_expiracion: o.fecha_expiracion ? new Date(o.fecha_expiracion).toISOString().slice(0, 10) : '',
    sector_id: o.sector_id,
    modalidad_id: o.modalidad_id,
    jornada_id: o.jornada_id,
    sector_nombre: (o.sectores)?.nombre ?? '',
    modalidad_nombre: (o.modalidades)?.nombre ?? '',
    jornada_nombre: (o.jornadas)?.nombre ?? '',
  }

  type SolRaw = {
    id: string
    estado: string
    created_at: string | null
    mensaje: string | null
    candidato_id: string
    cv_id: string | null
    cvs: { nombre_archivo: string; storage_path: string } | null
    candidato_profiles: {
      cargo_actual: string | null
      profiles: { nombre: string | null; apellidos: string | null; email: string; telefono: string | null } | null
    } | null
  }

  const solicitudes = ((solicitudesRaw ?? []) as unknown as SolRaw[]).map(s => ({
    id: s.id,
    estado: s.estado as 'nuevo' | 'revisando' | 'entrevista' | 'descartado' | 'contratado',
    created_at: s.created_at,
    mensaje: s.mensaje,
    candidato_id: s.candidato_id,
    cargo_actual: s.candidato_profiles?.cargo_actual ?? null,
    nombre: [s.candidato_profiles?.profiles?.nombre, s.candidato_profiles?.profiles?.apellidos].filter(Boolean).join(' ') || s.candidato_profiles?.profiles?.email || 'Candidato',
    email: s.candidato_profiles?.profiles?.email ?? '',
    telefono: s.candidato_profiles?.profiles?.telefono ?? null,
    cvPath: s.cvs?.storage_path ?? null,
    cvNombre: s.cvs?.nombre_archivo ?? null,
  }))

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-6 font-raleway text-sm">
        <Link href="/dashboard/ofertas" className="text-gray-400 hover:text-henko-turquoise transition-colors">
          Ofertas
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-700 font-medium truncate">{oferta.titulo}</span>
      </div>

      <OfertaDetalleLayout
        oferta={oferta}
        solicitudes={solicitudes}
        sectores={sectores ?? []}
        modalidades={modalidades ?? []}
        jornadas={jornadas ?? []}
        empresas={(empresas ?? []).map(e => ({ id: e.id, nombre: e.nombre, ubicacion: e.ubicacion ?? null }))}
      />
    </div>
  )
}
