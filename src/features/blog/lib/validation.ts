import { z } from 'zod'

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const blogPostSchema = z.object({
  titulo: z.string().trim().min(3, 'El título debe tener al menos 3 caracteres').max(160, 'Máximo 160 caracteres'),
  slug: z.string().trim().min(3, 'Slug muy corto').max(100, 'Slug muy largo').regex(slugRegex, 'Solo minúsculas, números y guiones'),
  extracto: z.string().trim().max(280, 'Máximo 280 caracteres').optional().nullable().transform((v) => v ?? ''),
  contenido: z.string().trim().min(20, 'El contenido debe tener al menos 20 caracteres'),
  imagen_portada: z.string().url('URL inválida').optional().nullable(),
  imagen_portada_alt: z.string().trim().max(200).optional().nullable(),
  categoria_id: z.number().int().positive().optional().nullable(),
  estado: z.enum(['borrador', 'publicado', 'archivado']),
  fecha_publicacion: z.string().datetime({ offset: true }).optional().nullable(),
  meta_titulo: z.string().trim().max(70, 'Recomendado < 70 caracteres').optional().nullable(),
  meta_descripcion: z.string().trim().max(180, 'Recomendado < 180 caracteres').optional().nullable(),
  og_image_url: z.string().url('URL inválida').optional().nullable(),
  canonical_url: z.string().url('URL inválida').optional().nullable(),
  keywords: z.array(z.string().trim().min(1).max(40)).max(15, 'Máximo 15 keywords').default([]),
})

export type BlogPostInput = z.infer<typeof blogPostSchema>
