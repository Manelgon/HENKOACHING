'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logAction } from '@/lib/audit/log-action'
import { blogPostSchema, type BlogPostInput } from '@/features/blog/lib/validation'
import { sanitizarHtml } from '@/features/blog/lib/sanitize'
import { calcularTiempoLectura } from '@/features/blog/lib/reading-time'
import { generarSlug } from '@/features/blog/lib/slug'
import type { EstadoPost } from '@/features/blog/types'

type ActionResult<T = undefined> = { ok: true; data?: T } | { error: string; fieldErrors?: Record<string, string> }

// Solo dashboard (para borradores — crear, guardar, eliminar)
function revalidarDashboard() {
  try { revalidatePath('/dashboard/blog') } catch {}
}

// Dashboard + blog público (solo al publicar / despublicar / archivar)
function revalidarBlogPublico(slug?: string | null) {
  try { revalidatePath('/dashboard/blog') } catch {}
  try { revalidatePath('/blog') } catch {}
  if (slug) { try { revalidatePath(`/blog/${slug}`) } catch {} }
}

async function generarSlugUnico(base: string, exceptId?: string): Promise<string> {
  const supabase = await createClient()
  const slugBase = generarSlug(base) || 'articulo'
  let slug = slugBase
  let intento = 1

  while (intento < 50) {
    const query = supabase.from('blog_posts').select('id').eq('slug', slug).limit(1)
    const { data } = await query
    const ocupado = data?.some((row) => row.id !== exceptId)
    if (!ocupado) return slug
    intento += 1
    slug = `${slugBase}-${intento}`
  }

  return `${slugBase}-${Date.now()}`
}

// =============================================================================
// CREAR ARTÍCULO (borrador por defecto)
// =============================================================================
export async function crearArticulo(input: Partial<BlogPostInput>): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const titulo = (input.titulo ?? 'Sin título').trim() || 'Sin título'
    const slug = await generarSlugUnico(input.slug?.trim() || titulo)

    const { data: nuevo, error } = await supabase
      .from('blog_posts')
      .insert({
        titulo,
        slug,
        contenido: input.contenido ?? '<p></p>',
        extracto: input.extracto ?? null,
        categoria_id: input.categoria_id ?? null,
        estado: 'borrador',
        autor_id: user.id,
        tiempo_lectura: 1,
      })
      .select('id, slug')
      .single()

    if (error) return { error: error.message }
    if (!nuevo) return { error: 'No se pudo crear el artículo (sin datos)' }

    await logAction({
      accion: 'blog.crear',
      recursoTipo: 'blog_post',
      recursoId: nuevo.id,
      recursoLabel: titulo,
    })

    revalidarDashboard()
    return { ok: true, data: { id: nuevo.id, slug: nuevo.slug } }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[crearArticulo] Error no capturado:', msg)
    return { error: `Error interno: ${msg}` }
  }
}

// =============================================================================
// GUARDAR / EDITAR ARTÍCULO
// =============================================================================
export async function guardarArticulo(id: string, input: unknown): Promise<ActionResult<{ slug: string }>> {
  const parsed = blogPostSchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    parsed.error.issues.forEach((issue) => {
      const key = issue.path.join('.')
      if (!fieldErrors[key]) fieldErrors[key] = issue.message
    })
    return { error: 'Hay campos inválidos', fieldErrors }
  }

  const data = parsed.data
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: actual } = await supabase
    .from('blog_posts')
    .select('slug, estado, titulo')
    .eq('id', id)
    .single()
  if (!actual) return { error: 'Artículo no encontrado' }

  const slug = data.slug !== actual.slug
    ? await generarSlugUnico(data.slug, id)
    : actual.slug

  const contenidoLimpio = sanitizarHtml(data.contenido)
  const tiempoLectura = calcularTiempoLectura(contenidoLimpio)

  const { error } = await supabase
    .from('blog_posts')
    .update({
      titulo: data.titulo,
      slug,
      extracto: data.extracto?.trim() || null,
      contenido: contenidoLimpio,
      imagen_portada: data.imagen_portada || null,
      imagen_portada_alt: data.imagen_portada_alt || null,
      categoria_id: data.categoria_id ?? null,
      meta_titulo: data.meta_titulo?.trim() || null,
      meta_descripcion: data.meta_descripcion?.trim() || null,
      og_image_url: data.og_image_url || null,
      canonical_url: data.canonical_url || null,
      keywords: data.keywords,
      tiempo_lectura: tiempoLectura,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  await logAction({
    accion: 'blog.editar',
    recursoTipo: 'blog_post',
    recursoId: id,
    recursoLabel: data.titulo,
  })

  revalidarDashboard()
  return { ok: true, data: { slug } }
}

// =============================================================================
// CAMBIAR ESTADO (publicar / despublicar / archivar)
// =============================================================================
export async function cambiarEstadoArticulo(id: string, nuevoEstado: EstadoPost): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const { data: actual } = await supabase
      .from('blog_posts')
      .select('slug, estado, titulo, fecha_publicacion')
      .eq('id', id)
      .single()
    if (!actual) return { error: 'Artículo no encontrado' }

    const updates: { estado: EstadoPost; fecha_publicacion?: string } = { estado: nuevoEstado }
    if (nuevoEstado === 'publicado' && !actual.fecha_publicacion) {
      updates.fecha_publicacion = new Date().toISOString()
    }

    const { error } = await supabase.from('blog_posts').update(updates).eq('id', id)
    if (error) return { error: error.message }

    await logAction({
      accion: 'blog.cambiar_estado',
      recursoTipo: 'blog_post',
      recursoId: id,
      recursoLabel: actual.titulo,
      metadata: { de: actual.estado, a: nuevoEstado },
    })

    revalidarBlogPublico(actual.slug)
    return { ok: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[cambiarEstadoArticulo] Error no capturado:', msg)
    return { error: `Error interno: ${msg}` }
  }
}

// =============================================================================
// ELIMINAR (soft delete)
// =============================================================================
export async function eliminarArticulo(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const { data: actual } = await supabase
      .from('blog_posts')
      .select('slug, titulo')
      .eq('id', id)
      .single()
    if (!actual) return { error: 'Artículo no encontrado' }

    const { error } = await supabase
      .from('blog_posts')
      .update({ deleted_at: new Date().toISOString(), estado: 'archivado' })
      .eq('id', id)

    if (error) return { error: error.message }

    await logAction({
      accion: 'blog.eliminar',
      recursoTipo: 'blog_post',
      recursoId: id,
      recursoLabel: actual.titulo,
    })

    revalidarDashboard()
    return { ok: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[eliminarArticulo] Error no capturado:', msg)
    return { error: `Error interno: ${msg}` }
  }
}

// =============================================================================
// SUBIR IMAGEN (portada / cuerpo del artículo)
// =============================================================================
export async function subirImagenBlog(formData: FormData): Promise<ActionResult<{ url: string; path: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const archivo = formData.get('file')
  if (!(archivo instanceof File)) return { error: 'Archivo inválido' }
  if (archivo.size > 5 * 1024 * 1024) return { error: 'La imagen supera 5 MB' }

  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp']
  if (!tiposPermitidos.includes(archivo.type)) {
    return { error: 'Formato no permitido (JPG, PNG o WebP)' }
  }

  const ext = archivo.name.split('.').pop()?.toLowerCase() || 'jpg'
  const nombre = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { error: errorUpload } = await supabase.storage
    .from('blog')
    .upload(nombre, archivo, {
      cacheControl: '3600',
      upsert: false,
      contentType: archivo.type,
    })

  if (errorUpload) return { error: errorUpload.message }

  const { data: pub } = supabase.storage.from('blog').getPublicUrl(nombre)
  return { ok: true, data: { url: pub.publicUrl, path: nombre } }
}

// =============================================================================
// INCREMENTAR VISTAS (público, llamado desde la página del artículo)
// =============================================================================
export async function incrementarVistasArticulo(id: string): Promise<void> {
  const supabase = await createClient()
  const { data: actual } = await supabase
    .from('blog_posts')
    .select('vistas')
    .eq('id', id)
    .single()

  if (!actual) return
  await supabase
    .from('blog_posts')
    .update({ vistas: (actual.vistas ?? 0) + 1 })
    .eq('id', id)
}
