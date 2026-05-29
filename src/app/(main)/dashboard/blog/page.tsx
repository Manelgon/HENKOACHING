import { createClient } from '@/lib/supabase/server'
import BlogTable from '@/features/blog/components/BlogTable'
import NuevoArticuloBtn from '@/features/blog/components/NuevoArticuloBtn'

export const metadata = {
  title: 'Blog — Henkoaching',
}

export const dynamic = 'force-dynamic'

export default async function BlogAdminPage() {
  const supabase = await createClient()

  const [{ data: posts }, { data: categorias }] = await Promise.all([
    supabase
      .from('blog_posts')
      .select('id, slug, titulo, extracto, imagen_portada, imagen_portada_alt, estado, fecha_publicacion, tiempo_lectura, vistas, updated_at, created_at, categoria:blog_categorias(id, slug, nombre)')
      .is('deleted_at', null)
      .order('updated_at', { ascending: false }),
    supabase
      .from('blog_categorias')
      .select('id, slug, nombre')
      .eq('activo', true)
      .order('orden'),
  ])

  return (
    <div className="w-full">
      <div className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-roxborough text-2xl md:text-3xl text-gray-900 mb-2">Blog</h1>
          <p className="font-raleway text-gray-500 font-light">
            Escribe, guarda en borrador y publica artículos cuando quieras. Cada uno se optimiza para SEO.
          </p>
        </div>
        <NuevoArticuloBtn />
      </div>

      <BlogTable
        posts={(posts ?? []) as never}
        categorias={categorias ?? []}
      />
    </div>
  )
}
