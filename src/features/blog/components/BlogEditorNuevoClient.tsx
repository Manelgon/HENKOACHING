'use client'

import dynamic from 'next/dynamic'
import type { BlogCategoria } from '../types'

const BlogEditorNuevo = dynamic(() => import('./BlogEditorNuevo'), { ssr: false })

type Props = {
  categorias: Pick<BlogCategoria, 'id' | 'slug' | 'nombre'>[]
}

export default function BlogEditorNuevoClient({ categorias }: Props) {
  return <BlogEditorNuevo categorias={categorias} />
}
