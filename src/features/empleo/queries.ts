import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const EMPRESA_CONFIDENCIAL = 'Empresa confidencial'

export type OfertaListing = {
  id: string
  slug: string
  titulo: string
  empresa: string
  empresaOculta: boolean
  ubicacion: string
  modalidad: string
  jornada: string
  sector: string
  salario: string
  fecha: string
  estado: string
}

export type OfertaDetalle = OfertaListing & {
  reportaA: string
  contrato: string
  descripcion: string
  funciones: string[]
  requisitos: string[]
  competencias: string[]
  ofrecemos: string[]
  // Datos crudos para SEO (JSON-LD JobPosting)
  fechaPublicacionISO: string | null
  fechaExpiracionISO: string | null
  salarioMin: number | null
  salarioMax: number | null
  modalidadSlug: string
}

const formatDate = (iso: string | null) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

export async function getOfertasPublicadas(): Promise<OfertaListing[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('ofertas')
    .select(`
      id, slug, titulo, ubicacion, salario_texto, fecha_publicacion, estado, empresa_oculta,
      clientes(nombre),
      sectores(nombre),
      modalidades(nombre),
      jornadas(nombre)
    `)
    .eq('estado', 'publicada')
    .is('deleted_at', null)
    .order('fecha_publicacion', { ascending: false })

  if (error || !data) return []

  return data.map((o) => {
    const empresaReal = (o.clientes as unknown as { nombre: string } | null)?.nombre ?? ''
    const oculta = !!o.empresa_oculta
    return {
      id: o.id,
      slug: o.slug,
      titulo: o.titulo,
      empresa: oculta ? EMPRESA_CONFIDENCIAL : empresaReal,
      empresaOculta: oculta,
      ubicacion: o.ubicacion ?? '',
      modalidad: (o.modalidades as unknown as { nombre: string } | null)?.nombre ?? '',
      jornada: (o.jornadas as unknown as { nombre: string } | null)?.nombre ?? '',
      sector: (o.sectores as unknown as { nombre: string } | null)?.nombre ?? '',
      salario: o.salario_texto ?? '',
      fecha: formatDate(o.fecha_publicacion),
      estado: o.estado,
    }
  })
}

export async function getOfertaPorSlug(slug: string): Promise<OfertaDetalle | null> {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('ofertas')
    .select(`
      id, slug, titulo, ubicacion, salario_texto, salario_min, salario_max,
      fecha_publicacion, fecha_expiracion, estado, empresa_oculta,
      reporta_a, contrato, descripcion, funciones, requisitos, competencias, ofrecemos,
      clientes(nombre),
      sectores(nombre),
      modalidades(nombre, slug),
      jornadas(nombre)
    `)
    .eq('slug', slug)
    .eq('estado', 'publicada')
    .is('deleted_at', null)
    .maybeSingle()

  if (!data) return null

  const modalidad = data.modalidades as unknown as { nombre: string; slug: string } | null
  const empresaReal = (data.clientes as unknown as { nombre: string } | null)?.nombre ?? ''
  const oculta = !!data.empresa_oculta

  return {
    id: data.id,
    slug: data.slug,
    titulo: data.titulo,
    empresa: oculta ? EMPRESA_CONFIDENCIAL : empresaReal,
    empresaOculta: oculta,
    ubicacion: data.ubicacion ?? '',
    modalidad: modalidad?.nombre ?? '',
    modalidadSlug: modalidad?.slug ?? '',
    jornada: (data.jornadas as unknown as { nombre: string } | null)?.nombre ?? '',
    sector: (data.sectores as unknown as { nombre: string } | null)?.nombre ?? '',
    salario: data.salario_texto ?? '',
    salarioMin: data.salario_min ?? null,
    salarioMax: data.salario_max ?? null,
    fecha: formatDate(data.fecha_publicacion),
    fechaPublicacionISO: data.fecha_publicacion ?? null,
    fechaExpiracionISO: data.fecha_expiracion ?? null,
    estado: data.estado,
    reportaA: data.reporta_a ?? '',
    contrato: data.contrato ?? '',
    descripcion: data.descripcion,
    funciones: data.funciones ?? [],
    requisitos: data.requisitos ?? [],
    competencias: data.competencias ?? [],
    ofrecemos: data.ofrecemos ?? [],
  }
}

export async function getOfertasSlugsPublicados(): Promise<{ slug: string; updated_at: string | null }[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('ofertas')
    .select('slug, updated_at, fecha_publicacion, fecha_expiracion')
    .eq('estado', 'publicada')
    .is('deleted_at', null)

  if (!data) return []

  const ahora = new Date()
  return data
    .filter((o) => !o.fecha_expiracion || new Date(o.fecha_expiracion) > ahora)
    .map((o) => ({ slug: o.slug, updated_at: o.updated_at ?? o.fecha_publicacion ?? null }))
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
      id, estado, created_at, updated_at,
      ofertas(id, slug, titulo, estado, clientes(nombre))
    `)
    .eq('candidato_id', userId)
    .order('updated_at', { ascending: false, nullsFirst: false })

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
