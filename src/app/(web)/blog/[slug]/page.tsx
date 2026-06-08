import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { after } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import BlogCard, { type BlogCardData } from '@/features/blog/components/BlogCard'
import { SITE_URL, BLOG_AUTHOR, urlAbsoluta } from '@/features/blog/lib/site-config'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ slug: string }> }

async function obtenerArticulo(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('id, slug, titulo, extracto, contenido, imagen_portada, imagen_portada_alt, og_image_url, meta_titulo, meta_descripcion, canonical_url, keywords, fecha_publicacion, tiempo_lectura, updated_at, categoria:blog_categorias(id, slug, nombre)')
    .eq('slug', slug)
    .eq('estado', 'publicado')
    .is('deleted_at', null)
    .maybeSingle()
  return data
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await obtenerArticulo(slug)
  if (!post) return { title: 'Artículo no encontrado' }

  const title = post.meta_titulo || `${post.titulo} — Blog Henkoaching`
  const description = post.meta_descripcion || post.extracto || `Artículo de Jennifer Cervera en Henkoaching`
  const ogImage = post.og_image_url || post.imagen_portada
  const canonical = post.canonical_url || `${SITE_URL}/blog/${post.slug}`

  return {
    title,
    description,
    keywords: post.keywords ?? undefined,
    authors: [{ name: BLOG_AUTHOR }],
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/blog/${post.slug}`,
      type: 'article',
      locale: 'es_ES',
      siteName: 'Henkoaching',
      publishedTime: post.fecha_publicacion ?? undefined,
      modifiedTime: post.updated_at ?? undefined,
      authors: [BLOG_AUTHOR],
      images: ogImage ? [{ url: urlAbsoluta(ogImage), alt: post.imagen_portada_alt ?? post.titulo }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [urlAbsoluta(ogImage)] : undefined,
    },
  }
}

export default async function ArticuloPage({ params }: PageProps) {
  const { slug } = await params
  const post = await obtenerArticulo(slug)
  if (!post) notFound()

  // Incremento de vistas después de enviar la respuesta (cliente sin cookies para evitar contexto de request)
  after(async () => {
    try {
      const anon = (await import('@supabase/supabase-js')).createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )
      const { data } = await anon.from('blog_posts').select('vistas').eq('id', post.id).single()
      if (data) await anon.from('blog_posts').update({ vistas: (data.vistas ?? 0) + 1 }).eq('id', post.id)
    } catch {}
  })

  const supabase = await createClient()
  const { data: relacionados } = await supabase
    .from('blog_posts')
    .select('slug, titulo, extracto, imagen_portada, imagen_portada_alt, fecha_publicacion, tiempo_lectura, categoria:blog_categorias(slug, nombre)')
    .eq('estado', 'publicado')
    .is('deleted_at', null)
    .neq('id', post.id)
    .eq('categoria_id', post.categoria?.id ?? -1)
    .order('fecha_publicacion', { ascending: false, nullsFirst: false })
    .limit(3)

  const fecha = post.fecha_publicacion
    ? new Date(post.fecha_publicacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  const ogImageAbs = post.og_image_url
    ? urlAbsoluta(post.og_image_url)
    : post.imagen_portada
      ? urlAbsoluta(post.imagen_portada)
      : `${SITE_URL}/henkologo.png`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.titulo,
    description: post.meta_descripcion || post.extracto || undefined,
    image: ogImageAbs,
    datePublished: post.fecha_publicacion,
    dateModified: post.updated_at,
    author: { '@type': 'Person', name: BLOG_AUTHOR },
    publisher: {
      '@type': 'Organization',
      name: 'Henkoaching',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/henkologo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
    keywords: Array.isArray(post.keywords) ? post.keywords.join(', ') || undefined : undefined,
    articleSection: post.categoria?.nombre ?? undefined,
  }

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="px-6 md:px-12 pt-32 md:pt-36 max-w-4xl mx-auto">
        <ol className="flex items-center gap-2 text-xs font-raleway text-gray-400">
          <li><Link href="/" className="hover:text-henko-turquoise transition-colors">Inicio</Link></li>
          <li>/</li>
          <li><Link href="/blog" className="hover:text-henko-turquoise transition-colors">Blog</Link></li>
          {post.categoria && (
            <>
              <li>/</li>
              <li>
                <Link href={`/blog/categoria/${post.categoria.slug}`} className="hover:text-henko-turquoise transition-colors">
                  {post.categoria.nombre}
                </Link>
              </li>
            </>
          )}
        </ol>
      </nav>

      {/* Cabecera del artículo */}
      <header className="px-6 md:px-12 pt-8 pb-12 max-w-4xl mx-auto">
        {post.categoria && (
          <p className="text-[11px] tracking-[0.2em] uppercase font-raleway font-bold text-henko-turquoise mb-5">
            {post.categoria.nombre}
          </p>
        )}
        <h1 className="font-roxborough text-3xl md:text-4xl lg:text-5xl text-gray-900 leading-tight mb-6">
          {post.titulo}
        </h1>
        {post.extracto && (
          <p className="font-raleway text-lg md:text-xl text-gray-600 leading-relaxed mb-8 max-w-3xl">
            {post.extracto}
          </p>
        )}
        <div className="flex items-center gap-4 text-sm font-raleway text-gray-500">
          <span className="font-semibold text-gray-700">{BLOG_AUTHOR}</span>
          {fecha && <><span className="text-gray-300">·</span><time dateTime={post.fecha_publicacion ?? ''}>{fecha}</time></>}
          {post.tiempo_lectura && <><span className="text-gray-300">·</span><span>{post.tiempo_lectura} min de lectura</span></>}
        </div>
      </header>

      {/* Imagen de portada */}
      {post.imagen_portada && (
        <div className="px-6 md:px-12 max-w-5xl mx-auto mb-12">
          <div className="relative w-full aspect-[16/9] rounded-[2rem] overflow-hidden bg-gray-100">
            <Image
              src={post.imagen_portada}
              alt={post.imagen_portada_alt ?? post.titulo}
              fill
              priority
              sizes="(min-width: 1024px) 1024px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* Contenido */}
      <article className="px-6 md:px-12 max-w-3xl mx-auto pb-20">
        <div
          className="prose prose-lg prose-gray max-w-none font-raleway prose-headings:font-roxborough prose-headings:text-gray-900 prose-a:text-henko-turquoise hover:prose-a:text-henko-turquoise-light prose-img:rounded-2xl prose-blockquote:border-henko-turquoise prose-blockquote:bg-henko-greenblue/5 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-xl"
          dangerouslySetInnerHTML={{ __html: post.contenido ?? '' }}
        />

        <div className="border-t border-gray-100 mt-16 pt-10 flex items-center justify-between gap-4">
          <Link href="/blog" className="font-raleway text-sm text-gray-500 hover:text-henko-turquoise transition-colors">
            ← Volver al blog
          </Link>
          <Link
            href="/contacto"
            className="inline-flex items-center px-5 py-2.5 rounded-full bg-henko-turquoise text-white font-raleway text-xs font-bold tracking-widest uppercase hover:bg-henko-turquoise-light transition-colors"
          >
            Hablemos
          </Link>
        </div>
      </article>

      {/* Artículos relacionados */}
      {relacionados && relacionados.length > 0 && (
        <section className="bg-gray-50 px-6 md:px-12 py-16 border-t border-gray-100">
          <div className="max-w-7xl mx-auto">
            <p className="text-[11px] tracking-[0.2em] uppercase font-raleway font-bold text-henko-turquoise mb-3 text-center">
              Sigue leyendo
            </p>
            <h2 className="font-roxborough text-2xl md:text-3xl text-gray-900 text-center mb-12">
              Más artículos como este
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
              {(relacionados as unknown as BlogCardData[]).map((p) => (
                <BlogCard key={p.slug} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
