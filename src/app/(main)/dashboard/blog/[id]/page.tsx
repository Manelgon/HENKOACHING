import { notFound } from 'next/navigation'
import dynamicImport from 'next/dynamic'
import { createClient } from '@/lib/supabase/server'

const BlogEditor = dynamicImport(() => import('@/features/blog/components/BlogEditor'), { ssr: false })

export const metadata = {
  title: 'Editar artículo — Henkoaching',
}

export const dynamic = 'force-dynamic'

export default async function EditarArticuloPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: post }, { data: categorias }] = await Promise.all([
    supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single(),
    supabase
      .from('blog_categorias')
      .select('id, slug, nombre')
      .eq('activo', true)
      .order('orden'),
  ])

  if (!post) notFound()

  return <BlogEditor post={post} categorias={categorias ?? []} />
}
