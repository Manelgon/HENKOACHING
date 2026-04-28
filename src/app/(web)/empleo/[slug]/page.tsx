import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import OfertaDetalle from '@/features/empleo/components/OfertaDetalle'
import { getOfertaPorSlug, yaAplico } from '@/features/empleo/queries'
import { createClient } from '@/lib/supabase/server'

type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const oferta = await getOfertaPorSlug(slug)
  if (!oferta) return { title: 'Oferta no encontrada — Henkoaching' }
  return {
    title: `${oferta.titulo} — Henkoaching`,
    description: oferta.descripcion.slice(0, 160),
  }
}

export const dynamic = 'force-dynamic'

export default async function OfertaPage({ params }: { params: Params }) {
  const { slug } = await params
  const oferta = await getOfertaPorSlug(slug)
  if (!oferta) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isCandidato = false
  let aplicado = false

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isCandidato = profile?.role === 'candidato'
    if (isCandidato) {
      aplicado = await yaAplico(user.id, oferta.id)
    }
  }

  return (
    <OfertaDetalle
      oferta={oferta}
      yaAplicado={aplicado}
      isCandidato={isCandidato}
      isLoggedIn={!!user}
    />
  )
}
