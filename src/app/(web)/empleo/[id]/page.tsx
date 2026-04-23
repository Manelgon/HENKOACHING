import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { OFERTAS } from '@/features/empleo/data'
import OfertaDetalle from '@/features/empleo/components/OfertaDetalle'

type Params = Promise<{ id: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params
  const oferta = OFERTAS.find(o => o.id === Number(id))
  if (!oferta) return { title: 'Oferta no encontrada — Henkoaching' }
  return {
    title: `${oferta.titulo} — Henkoaching`,
    description: oferta.desc,
  }
}

export default async function OfertaPage({ params }: { params: Params }) {
  const { id } = await params
  const oferta = OFERTAS.find(o => o.id === Number(id))
  if (!oferta) notFound()
  return <OfertaDetalle oferta={oferta} />
}
