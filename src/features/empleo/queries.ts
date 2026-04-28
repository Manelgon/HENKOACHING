import { createClient } from '@/lib/supabase/server'

export type OfertaListing = {
  id: string
  slug: string
  titulo: string
  empresa: string
  ubicacion: string
  modalidad: string
  jornada: string
  sector: string
  salario: string
  fecha: string
  estado: string
}

export type OfertaDetalle = OfertaListing & {
  descripcion: string
  requisitos: string[]
  ofrecemos: string[]
}

const formatDate = (iso: string | null) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

export async function getOfertasPublicadas(): Promise<OfertaListing[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ofertas')
    .select(`
      id, slug, titulo, ubicacion, salario_texto, fecha_publicacion, estado,
      empresas(nombre),
      sectores(nombre),
      modalidades(nombre),
      jornadas(nombre)
    `)
    .eq('estado', 'publicada')
    .is('deleted_at', null)
    .order('fecha_publicacion', { ascending: false })

  if (error || !data) return []

  return data.map((o) => ({
    id: o.id,
    slug: o.slug,
    titulo: o.titulo,
    empresa: (o.empresas as unknown as { nombre: string } | null)?.nombre ?? '',
    ubicacion: o.ubicacion ?? '',
    modalidad: (o.modalidades as unknown as { nombre: string } | null)?.nombre ?? '',
    jornada: (o.jornadas as unknown as { nombre: string } | null)?.nombre ?? '',
    sector: (o.sectores as unknown as { nombre: string } | null)?.nombre ?? '',
    salario: o.salario_texto ?? '',
    fecha: formatDate(o.fecha_publicacion),
    estado: o.estado,
  }))
}

export async function getOfertaPorSlug(slug: string): Promise<OfertaDetalle | null> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('ofertas')
    .select(`
      id, slug, titulo, ubicacion, salario_texto, fecha_publicacion, estado,
      descripcion, requisitos, ofrecemos,
      empresas(nombre),
      sectores(nombre),
      modalidades(nombre),
      jornadas(nombre)
    `)
    .eq('slug', slug)
    .is('deleted_at', null)
    .maybeSingle()

  if (!data) return null

  return {
    id: data.id,
    slug: data.slug,
    titulo: data.titulo,
    empresa: (data.empresas as unknown as { nombre: string } | null)?.nombre ?? '',
    ubicacion: data.ubicacion ?? '',
    modalidad: (data.modalidades as unknown as { nombre: string } | null)?.nombre ?? '',
    jornada: (data.jornadas as unknown as { nombre: string } | null)?.nombre ?? '',
    sector: (data.sectores as unknown as { nombre: string } | null)?.nombre ?? '',
    salario: data.salario_texto ?? '',
    fecha: formatDate(data.fecha_publicacion),
    estado: data.estado,
    descripcion: data.descripcion,
    requisitos: data.requisitos ?? [],
    ofrecemos: data.ofrecemos ?? [],
  }
}

export type Catalogo = { id: number; nombre: string; slug: string }

export async function getCatalogos(): Promise<{
  sectores: Catalogo[]
  modalidades: Catalogo[]
  jornadas: Catalogo[]
}> {
  const supabase = await createClient()

  const [s, m, j] = await Promise.all([
    supabase.from('sectores').select('id, nombre, slug').eq('activo', true).order('orden'),
    supabase.from('modalidades').select('id, nombre, slug').eq('activo', true).order('orden'),
    supabase.from('jornadas').select('id, nombre, slug').eq('activo', true).order('orden'),
  ])

  return {
    sectores: s.data ?? [],
    modalidades: m.data ?? [],
    jornadas: j.data ?? [],
  }
}

export async function getMisSolicitudes(userId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('solicitudes')
    .select(`
      id, estado, created_at,
      ofertas(id, slug, titulo, empresas(nombre))
    `)
    .eq('candidato_id', userId)
    .order('created_at', { ascending: false })

  return data ?? []
}

export async function yaAplico(userId: string, ofertaId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('solicitudes')
    .select('id')
    .eq('candidato_id', userId)
    .eq('oferta_id', ofertaId)
    .maybeSingle()

  return !!data
}
