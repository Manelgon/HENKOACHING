import { createClient } from '@/lib/supabase/server'
import BlogEditorNuevoClient from '@/features/blog/components/BlogEditorNuevoClient'

export const metadata = {
  title: 'Nuevo artículo — Henkoaching',
}

export const dynamic = 'force-dynamic'

export default async function NuevoArticuloPage() {
  const supabase = await createClient()
  const { data: categorias } = await supabase
    .from('blog_categorias')
    .select('id, slug, nombre')
    .eq('activo', true)
    .order('orden')

  return <BlogEditorNuevoClient categorias={categorias ?? []} />
}
