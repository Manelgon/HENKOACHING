import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SITE_URL } from '@/features/blog/lib/site-config'
import { getOfertasSlugsPublicados } from '@/features/empleo/queries'

export const revalidate = 300

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const [{ data: posts }, { data: categorias }, ofertas] = await Promise.all([
    supabase
      .from('blog_posts')
      .select('slug, updated_at, fecha_publicacion')
      .eq('estado', 'publicado')
      .is('deleted_at', null),
    supabase
      .from('blog_categorias')
      .select('slug')
      .eq('activo', true),
    getOfertasSlugsPublicados(),
  ])

  const ahora = new Date()

  const rutasEstaticas: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: ahora, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/servicios`, lastModified: ahora, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/sobre-mi`, lastModified: ahora, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/contacto`, lastModified: ahora, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${SITE_URL}/empleo`, lastModified: ahora, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: ahora, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/legal`, lastModified: ahora, changeFrequency: 'yearly', priority: 0.3 },
  ]

  const rutasCategorias: MetadataRoute.Sitemap = (categorias ?? []).map((c) => ({
    url: `${SITE_URL}/blog/categoria/${c.slug}`,
    lastModified: ahora,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  const rutasPosts: MetadataRoute.Sitemap = (posts ?? []).map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : (p.fecha_publicacion ? new Date(p.fecha_publicacion) : ahora),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const rutasOfertas: MetadataRoute.Sitemap = ofertas.map((o) => ({
    url: `${SITE_URL}/empleo/${o.slug}`,
    lastModified: o.updated_at ? new Date(o.updated_at) : ahora,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...rutasEstaticas, ...rutasCategorias, ...rutasPosts, ...rutasOfertas]
}
