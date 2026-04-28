import { Metadata } from 'next'
import OfertasListing from '@/features/empleo/components/OfertasListing'
import { getOfertasPublicadas, getCatalogos } from '@/features/empleo/queries'

export const metadata: Metadata = {
  title: 'Portal de Empleo — Henkoaching',
  description: 'Oportunidades de trabajo seleccionadas por Henkoaching para empresas en transformación.',
}

export const dynamic = 'force-dynamic'

export default async function EmpleoPage() {
  const [ofertas, catalogos] = await Promise.all([
    getOfertasPublicadas(),
    getCatalogos(),
  ])

  return (
    <OfertasListing
      ofertas={ofertas}
      sectores={catalogos.sectores.map(s => s.nombre)}
      modalidades={catalogos.modalidades.map(m => m.nombre)}
    />
  )
}
