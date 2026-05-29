import { Metadata } from 'next'
import OfertasListing from '@/features/empleo/components/OfertasListing'
import { getOfertasPublicadas, getCatalogos } from '@/features/empleo/queries'
import { SITE_URL } from '@/features/blog/lib/site-config'

type SearchParams = {
  sector?: string | string[]
  modalidad?: string | string[]
  q?: string
}

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return []
  return Array.isArray(v) ? v : [v]
}

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<SearchParams> }
): Promise<Metadata> {
  const params = await searchParams
  const sectores = toArray(params.sector)
  const modalidades = toArray(params.modalidad)

  const parts: string[] = [...sectores, ...modalidades]
  const suffix = parts.length > 0 ? ` · ${parts.join(' · ')}` : ''
  const title = `Portal de Empleo${suffix} — Henkoaching`
  const description = 'Oportunidades de trabajo seleccionadas por Henkoaching para empresas en transformación.'

  const qs = new URLSearchParams()
  sectores.forEach(s => qs.append('sector', s))
  modalidades.forEach(m => qs.append('modalidad', m))
  if (params.q) qs.set('q', params.q)
  const qsStr = qs.toString()
  const canonical = `${SITE_URL}/empleo${qsStr ? `?${qsStr}` : ''}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      url: canonical,
      title,
      description,
    },
  }
}

export const dynamic = 'force-dynamic'

export default async function EmpleoPage(
  { searchParams }: { searchParams: Promise<SearchParams> }
) {
  const params = await searchParams
  const activeSectores = toArray(params.sector)
  const activeModalidades = toArray(params.modalidad)
  const busqueda = params.q ?? ''

  const [ofertas, catalogos] = await Promise.all([
    getOfertasPublicadas(),
    getCatalogos(),
  ])

  const filtradas = ofertas.filter(o => {
    if (activeSectores.length > 0 && !activeSectores.includes(o.sector)) return false
    if (activeModalidades.length > 0 && !activeModalidades.includes(o.modalidad)) return false
    const q = busqueda.toLowerCase()
    if (q && !o.titulo.toLowerCase().includes(q) && !o.empresa.toLowerCase().includes(q)) return false
    return true
  })

  return (
    <OfertasListing
      filtradas={filtradas}
      total={ofertas.length}
      sectores={catalogos.sectores.map(s => s.nombre)}
      modalidades={catalogos.modalidades.map(m => m.nombre)}
      activeSectores={activeSectores}
      activeModalidades={activeModalidades}
      busqueda={busqueda}
    />
  )
}
