'use client'

import dynamic from 'next/dynamic'
import type { BlogPostRow, BlogCategoria } from '../types'

const BlogEditor = dynamic(() => import('./BlogEditor'), { ssr: false })

type Props = {
  post: BlogPostRow
  categorias: Pick<BlogCategoria, 'id' | 'slug' | 'nombre'>[]
}

export default function BlogEditorClient({ post, categorias }: Props) {
  return <BlogEditor post={post} categorias={categorias} />
}
