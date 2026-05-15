import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import OfertaDetalle from '@/features/empleo/components/OfertaDetalle'
import JobPostingJsonLd from '@/features/empleo/components/JobPostingJsonLd'
import { getOfertaPorSlug, yaAplico } from '@/features/empleo/queries'
import { createClient } from '@/lib/supabase/server'
import { SITE_URL } from '@/features/blog/lib/site-config'

type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const oferta = await getOfertaPorSlug(slug)
  if (!oferta) return { title: 'Oferta no encontrada — Henkoaching' }
  const description = oferta.descripcion.slice(0, 160)
  const canonical = `${SITE_URL}/empleo/${oferta.slug}`
  return {
    title: `${oferta.titulo} — Henkoaching`,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      url: canonical,
      title: `${oferta.titulo} — Henkoaching`,
      description,
    },
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
    <>
      <JobPostingJsonLd oferta={oferta} />
      <OfertaDetalle
        oferta={oferta}
        yaAplicado={aplicado}
        isCandidato={isCandidato}
        isLoggedIn={!!user}
      />
    </>
  )
}
