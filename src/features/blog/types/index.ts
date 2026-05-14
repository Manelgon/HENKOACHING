import type { Database, EstadoPost } from '@/lib/supabase/database.types'

export type BlogPostRow = Database['public']['Tables']['blog_posts']['Row']
export type BlogPostInsert = Database['public']['Tables']['blog_posts']['Insert']
export type BlogPostUpdate = Database['public']['Tables']['blog_posts']['Update']
export type BlogCategoria = Database['public']['Tables']['blog_categorias']['Row']

export type { EstadoPost }

export type BlogPostWithRelations = BlogPostRow & {
  categoria: Pick<BlogCategoria, 'id' | 'slug' | 'nombre'> | null
  autor: { id: string; nombre: string | null; apellidos: string | null; avatar_url: string | null } | null
}

export type BlogPostListItem = Pick<
  BlogPostRow,
  | 'id'
  | 'slug'
  | 'titulo'
  | 'extracto'
  | 'imagen_portada'
  | 'imagen_portada_alt'
  | 'estado'
  | 'fecha_publicacion'
  | 'tiempo_lectura'
  | 'vistas'
  | 'updated_at'
  | 'created_at'
> & {
  categoria: Pick<BlogCategoria, 'id' | 'slug' | 'nombre'> | null
}

export type BlogFormInput = {
  titulo: string
  slug: string
  extracto: string
  contenido: string
  imagen_portada: string | null
  imagen_portada_alt: string | null
  categoria_id: number | null
  estado: EstadoPost
  fecha_publicacion: string | null
  meta_titulo: string | null
  meta_descripcion: string | null
  og_image_url: string | null
  canonical_url: string | null
  keywords: string[]
}
