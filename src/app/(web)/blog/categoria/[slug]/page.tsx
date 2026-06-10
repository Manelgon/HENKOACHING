import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createPublicClient } from '@/lib/supabase/public'
import PageHeader from '@/components/PageHeader'
import BlogCard, { type BlogCardData } from '@/features/blog/components/BlogCard'
import { SITE_URL } from '@/features/blog/lib/site-config'

export const revalidate = 300

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('blog_categorias')
    .select('nombre, descripcion')
    .eq('slug', slug)
    .eq('activo', true)
    .single()

  if (!data) return { title: 'Categoría — Blog Henkoaching' }
  const titulo = `${data.nombre} — Blog Henkoaching`
  return {
    title: titulo,
    description: data.descripcion ?? `Artículos de la categoría ${data.nombre}.`,
    alternates: { canonical: `${SITE_URL}/blog/categoria/${slug}` },
    openGraph: {
      title: titulo,
      description: data.descripcion ?? undefined,
      url: `${SITE_URL}/blog/categoria/${slug}`,
      type: 'website',
    },
  }
}

export default async function CategoriaPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = createPublicClient()

  const { data: categoria } = await supabase
    .from('blog_categorias')
    .select('id, slug, nombre, descripcion')
    .eq('slug', slug)
    .eq('activo', true)
    .single()

  if (!categoria) notFound()

  const [{ data: posts }, { data: otrasCategorias }] = await Promise.all([
    supabase
      .from('blog_posts')
      .select('slug, titulo, extracto, imagen_portada, imagen_portada_alt, fecha_publicacion, tiempo_lectura, categoria:blog_categorias(slug, nombre)')
      .eq('estado', 'publicado')
      .eq('categoria_id', categoria.id)
      .is('deleted_at', null)
      .order('fecha_publicacion', { ascending: false, nullsFirst: false }),
    supabase
      .from('blog_categorias')
      .select('slug, nombre')
      .eq('activo', true)
      .order('orden'),
  ])

  const items = (posts ?? []) as unknown as BlogCardData[]

  return (
    <main className="min-h-screen bg-white pt-24">
      <PageHeader
        overline={`Blog · ${categoria.nombre}`}
        title={categoria.nombre}
        subtitle={categoria.descripcion ?? undefined}
      />

      <section className="px-6 md:px-12 py-16 max-w-7xl mx-auto">
        <div className="flex flex-wrap gap-2 mb-12">
          <Link href="/blog" className="px-4 py-2 rounded-full border border-gray-200 text-gray-600 font-raleway text-xs font-semibold tracking-wide uppercase hover:bg-gray-50 hover:text-henko-turquoise transition-colors">
            Todos
          </Link>
          {otrasCategorias?.map((c) => (
            <Link
              key={c.slug}
              href={`/blog/categoria/${c.slug}`}
              className={`px-4 py-2 rounded-full font-raleway text-xs font-semibold tracking-wide uppercase transition-colors ${
                c.slug === categoria.slug
                  ? 'bg-henko-turquoise text-white'
                  : 'border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-henko-turquoise'
              }`}
            >
              {c.nombre}
            </Link>
          ))}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-roxborough text-2xl text-gray-400 mb-2">Aún no hay artículos en esta categoría</p>
            <Link href="/blog" className="font-raleway text-henko-turquoise hover:text-henko-turquoise-light underline">Ver todos los artículos</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {items.map((p) => (
              <BlogCard key={p.slug} post={p} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
