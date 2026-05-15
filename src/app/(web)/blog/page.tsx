import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/PageHeader'
import BlogCard, { type BlogCardData } from '@/features/blog/components/BlogCard'
import { SITE_URL } from '@/features/blog/lib/site-config'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Blog — Henkoaching',
  description: 'Reflexiones sobre liderazgo, coaching, recursos humanos y cultura organizacional por Jennifer Cervera.',
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: 'Blog — Henkoaching',
    description: 'Reflexiones sobre liderazgo, coaching, recursos humanos y cultura organizacional.',
    url: `${SITE_URL}/blog`,
    type: 'website',
  },
}

export default async function BlogIndexPage() {
  const supabase = await createClient()
  const [{ data: posts }, { data: categorias }] = await Promise.all([
    supabase
      .from('blog_posts')
      .select('slug, titulo, extracto, imagen_portada, imagen_portada_alt, fecha_publicacion, tiempo_lectura, categoria:blog_categorias(slug, nombre)')
      .eq('estado', 'publicado')
      .is('deleted_at', null)
      .order('fecha_publicacion', { ascending: false, nullsFirst: false }),
    supabase
      .from('blog_categorias')
      .select('slug, nombre')
      .eq('activo', true)
      .order('orden'),
  ])

  const items = (posts ?? []) as unknown as BlogCardData[]
  const [featured, ...resto] = items

  return (
    <main className="min-h-screen bg-white pt-24">
      <PageHeader
        overline="Blog"
        title="Reflexiones, prácticas y aprendizajes"
        subtitle="Sobre liderazgo, coaching, gestión de personas y la cultura que se construye en cada decisión."
      />

      <section className="px-6 md:px-12 pt-10 pb-16 max-w-7xl mx-auto">
        {categorias && categorias.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            <span className="px-4 py-2 rounded-full bg-henko-turquoise text-white font-raleway text-xs font-semibold tracking-wide uppercase">
              Todos
            </span>
            {categorias.map((c) => (
              <Link
                key={c.slug}
                href={`/blog/categoria/${c.slug}`}
                className="px-4 py-2 rounded-full border border-gray-200 text-gray-600 font-raleway text-xs font-semibold tracking-wide uppercase hover:bg-gray-50 hover:text-henko-turquoise transition-colors"
              >
                {c.nombre}
              </Link>
            ))}
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-roxborough text-2xl text-gray-400 mb-2">Aún no hay artículos publicados</p>
            <p className="font-raleway text-gray-400">Vuelve pronto.</p>
          </div>
        ) : (
          <>
            {featured && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 pb-16 border-b border-gray-100">
                <BlogCard post={featured} featured />
              </div>
            )}

            {resto.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {resto.map((p) => (
                  <BlogCard key={p.slug} post={p} />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  )
}
