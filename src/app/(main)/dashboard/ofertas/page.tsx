import AdminOfertas from '@/features/empleo/components/AdminOfertas'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Ofertas de empleo — Henkoaching',
}

export const dynamic = 'force-dynamic'

export default async function DashboardOfertasPage() {
  const supabase = await createClient()

  const [{ data: ofertas }, { data: sectores }, { data: modalidades }, { data: jornadas }, { data: empresas }] = await Promise.all([
    supabase
      .from('ofertas')
      .select(`
        id, slug, titulo, ubicacion, salario_texto, descripcion, requisitos, ofrecemos,
        estado, fecha_publicacion, sector_id, modalidad_id, jornada_id, cliente_id,
        empresa_oculta, reporta_a, contrato, funciones, competencias,
        clientes(nombre),
        sectores(nombre),
        modalidades(nombre),
        jornadas(nombre)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false }),
    supabase.from('sectores').select('id, nombre, slug').order('orden'),
    supabase.from('modalidades').select('id, nombre, slug').order('orden'),
    supabase.from('jornadas').select('id, nombre, slug').order('orden'),
    supabase
      .from('clientes')
      .select('id, nombre, ubicacion')
      .eq('tipo', 'empresa')
      .is('deleted_at', null)
      .order('nombre'),
  ])

  const ofertasView = (ofertas ?? []).map((o) => ({
    id: o.id,
    titulo: o.titulo,
    empresa: (o.clientes as unknown as { nombre: string } | null)?.nombre ?? '',
    empresa_oculta: !!o.empresa_oculta,
    ubicacion: o.ubicacion ?? '',
    salario_texto: o.salario_texto ?? '',
    reporta_a: o.reporta_a ?? '',
    contrato: o.contrato ?? '',
    descripcion: o.descripcion,
    funciones: o.funciones ?? [],
    requisitos: o.requisitos ?? [],
    competencias: o.competencias ?? [],
    ofrecemos: o.ofrecemos ?? [],
    estado: o.estado,
    fecha: o.fecha_publicacion ? new Date(o.fecha_publicacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
    sector_id: o.sector_id,
    modalidad_id: o.modalidad_id,
    jornada_id: o.jornada_id,
    sector_nombre: (o.sectores as unknown as { nombre: string } | null)?.nombre ?? '',
    modalidad_nombre: (o.modalidades as unknown as { nombre: string } | null)?.nombre ?? '',
    jornada_nombre: (o.jornadas as unknown as { nombre: string } | null)?.nombre ?? '',
  }))

  return (
    <div className="w-full">
      <AdminOfertas
        ofertas={ofertasView}
        sectores={sectores ?? []}
        modalidades={modalidades ?? []}
        jornadas={jornadas ?? []}
        empresas={(empresas ?? []).map((e) => ({ id: e.id, nombre: e.nombre, ubicacion: e.ubicacion ?? null }))}
      />
    </div>
  )
}
