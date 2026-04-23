import { Metadata } from 'next'
import OfertasListing from '@/features/empleo/components/OfertasListing'

export const metadata: Metadata = {
  title: 'Portal de Empleo — Henkoaching',
  description: 'Oportunidades de trabajo seleccionadas por Henkoaching para empresas en transformación.',
}

export default function EmpleoPage() {
  return <OfertasListing />
}
