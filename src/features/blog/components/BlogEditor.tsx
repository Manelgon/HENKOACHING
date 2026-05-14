'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAction } from '@/shared/feedback/FeedbackContext'
import { cambiarEstadoArticulo, eliminarArticulo, guardarArticulo } from '@/actions/blog'
import { generarSlug } from '../lib/slug'
import { calcularTiempoLectura } from '../lib/reading-time'
import type { BlogPostRow, BlogCategoria } from '../types'
import TipTapEditor from './TipTapEditor'
import ImageUploader from './ImageUploader'
import SeoPanel from './SeoPanel'
import { getEstadoMeta } from './estados'

type Props = {
  post: BlogPostRow
  categorias: Pick<BlogCategoria, 'id' | 'slug' | 'nombre'>[]
}

type FormState = {
  titulo: string
  slug: string
  extracto: string
  contenido: string
  imagen_portada: string | null
  imagen_portada_alt: string | null
  categoria_id: number | null
  meta_titulo: string
  meta_descripcion: string
  og_image_url: string | null
  canonical_url: string
  keywords: string[]
}

export default function BlogEditor({ post, categorias }: Props) {
  const router = useRouter()
  const runAction = useAction()
  const [slugManual, setSlugManual] = useState<boolean>(Boolean(post.slug && post.slug !== 'sin-titulo'))

  const [form, setForm] = useState<FormState>({
    titulo: post.titulo ?? '',
    slug: post.slug ?? '',
    extracto: post.extracto ?? '',
    contenido: post.contenido ?? '<p></p>',
    imagen_portada: post.imagen_portada,
    imagen_portada_alt: post.imagen_portada_alt,
    categoria_id: post.categoria_id,
    meta_titulo: post.meta_titulo ?? '',
    meta_descripcion: post.meta_descripcion ?? '',
    og_image_url: post.og_image_url,
    canonical_url: post.canonical_url ?? '',
    keywords: post.keywords ?? [],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const tiempoLectura = useMemo(() => calcularTiempoLectura(form.contenido), [form.contenido])
  const estadoMeta = getEstadoMeta(post.estado)
  const palabras = useMemo(() => form.contenido.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length, [form.contenido])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function onTituloChange(v: string) {
    update('titulo', v)
    if (!slugManual) {
      update('slug', generarSlug(v))
    }
  }

  function onSlugChange(v: string) {
    setSlugManual(true)
    update('slug', generarSlug(v))
  }

  async function guardar(redirigirListado = false): Promise<boolean> {
    setErrors({})
    const result = await runAction(
      'Guardando artículo',
      () => guardarArticulo(post.id, {
        titulo: form.titulo,
        slug: form.slug || generarSlug(form.titulo || 'articulo'),
        extracto: form.extracto,
        contenido: form.contenido,
        imagen_portada: form.imagen_portada,
        imagen_portada_alt: form.imagen_portada_alt,
        categoria_id: form.categoria_id,
        estado: post.estado,
        fecha_publicacion: post.fecha_publicacion,
        meta_titulo: form.meta_titulo,
        meta_descripcion: form.meta_descripcion,
        og_image_url: form.og_image_url,
        canonical_url: form.canonical_url || null,
        keywords: form.keywords,
      }),
      { successMessage: 'Artículo guardado' },
    )
    if (!result.ok) return false
    const inner = result.data
    if (inner && 'error' in inner) {
      if (inner.fieldErrors) setErrors(inner.fieldErrors)
      return false
    }
    if (redirigirListado) router.push('/dashboard/blog')
    else router.refresh()
    return true
  }

  async function publicar() {
    const ok = await guardar()
    if (!ok) return
    const result = await runAction(
      'Publicando',
      () => cambiarEstadoArticulo(post.id, 'publicado'),
      { successMessage: 'Artículo publicado' },
    )
    if (result.ok) router.refresh()
  }

  async function despublicar() {
    const result = await runAction(
      'Enviando a borrador',
      () => cambiarEstadoArticulo(post.id, 'borrador'),
      { successMessage: 'Artículo enviado a borrador' },
    )
    if (result.ok) router.refresh()
  }

  async function eliminar() {
    if (!confirm('¿Eliminar este artículo?')) return
    const result = await runAction(
      'Eliminando',
      () => eliminarArticulo(post.id),
      { successMessage: 'Artículo eliminado' },
    )
    if (result.ok) router.push('/dashboard/blog')
  }

  return (
    <div className="max-w-5xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/dashboard/blog" className="font-raleway text-sm text-gray-400 hover:text-henko-turquoise transition-colors">
              ← Volver al blog
            </Link>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-raleway font-semibold ${estadoMeta.bg} ${estadoMeta.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${estadoMeta.dot}`} />
              {estadoMeta.label}
            </span>
          </div>
          <p className="font-raleway text-xs text-gray-400">
            {palabras} palabras · {tiempoLectura} min lectura
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {post.estado === 'publicado' && (
            <Link
              href={`/blog/${post.slug}`}
              target="_blank"
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-raleway font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Ver en la web
            </Link>
          )}
          <button
            type="button"
            onClick={() => guardar()}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-raleway font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            Guardar borrador
          </button>
          {post.estado !== 'publicado' ? (
            <button
              type="button"
              onClick={publicar}
              className="px-5 py-2.5 rounded-xl bg-henko-turquoise text-white font-raleway font-semibold text-sm hover:bg-henko-turquoise-light transition-colors"
            >
              Guardar y publicar
            </button>
          ) : (
            <button
              type="button"
              onClick={despublicar}
              className="px-5 py-2.5 rounded-xl bg-amber-50 text-amber-700 font-raleway font-semibold text-sm hover:bg-amber-100 transition-colors"
            >
              Despublicar
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Bloque principal: título, portada, contenido */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm px-5 md:px-8 py-6 md:py-8 space-y-6">
          <div>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => onTituloChange(e.target.value)}
              placeholder="Título del artículo"
              className="w-full px-0 py-2 bg-transparent font-roxborough text-3xl md:text-4xl text-gray-900 outline-none border-b border-transparent focus:border-gray-200 transition-colors placeholder:text-gray-300"
            />
            {errors.titulo && <p className="font-raleway text-xs text-red-500 mt-1">{errors.titulo}</p>}
          </div>

          <ImageUploader
            label="Imagen de portada"
            value={form.imagen_portada}
            alt={form.imagen_portada_alt}
            onChange={(url) => update('imagen_portada', url)}
            onAltChange={(alt) => update('imagen_portada_alt', alt)}
            hint="Recomendado: 1600×900 px. Aparecerá en el listado y al inicio del artículo."
          />

          <div>
            <label className="block font-raleway text-sm font-semibold text-gray-700 mb-2">
              Extracto <span className="text-gray-400 font-normal">({form.extracto.length}/280)</span>
            </label>
            <textarea
              value={form.extracto}
              onChange={(e) => update('extracto', e.target.value.slice(0, 280))}
              rows={2}
              placeholder="Breve resumen que verán los lectores en el listado y en redes sociales."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white resize-none"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-raleway text-sm font-semibold text-gray-700 mb-2">Categoría</label>
              <select
                value={form.categoria_id ?? ''}
                onChange={(e) => update('categoria_id', e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white"
              >
                <option value="">Sin categoría</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-raleway text-sm font-semibold text-gray-700 mb-2">Tiempo de lectura</label>
              <input
                value={`${tiempoLectura} min`}
                readOnly
                className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 font-raleway text-sm text-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-raleway text-sm font-semibold text-gray-700 mb-2">Contenido</label>
            <TipTapEditor
              value={form.contenido}
              onChange={(html) => update('contenido', html)}
            />
            {errors.contenido && <p className="font-raleway text-xs text-red-500 mt-1">{errors.contenido}</p>}
          </div>
        </div>

        {/* SEO acordeón */}
        <SeoPanel
          slug={form.slug}
          titulo={form.titulo}
          extracto={form.extracto}
          imagenPortada={form.imagen_portada}
          metaTitulo={form.meta_titulo}
          metaDescripcion={form.meta_descripcion}
          ogImageUrl={form.og_image_url}
          canonicalUrl={form.canonical_url}
          keywords={form.keywords}
          onSlugChange={onSlugChange}
          onMetaTituloChange={(v) => update('meta_titulo', v)}
          onMetaDescripcionChange={(v) => update('meta_descripcion', v)}
          onOgImageChange={(v) => update('og_image_url', v)}
          onCanonicalChange={(v) => update('canonical_url', v)}
          onKeywordsChange={(v) => update('keywords', v)}
          errors={errors}
        />

        {/* Zona peligrosa */}
        <div className="bg-white rounded-[2rem] border border-red-100 px-5 md:px-6 py-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-raleway font-semibold text-gray-900">Eliminar artículo</p>
            <p className="font-raleway text-xs text-gray-500">Quedará archivado y oculto de la web. Puedes recuperarlo desde Archivados.</p>
          </div>
          <button
            type="button"
            onClick={eliminar}
            className="px-4 py-2 rounded-xl bg-red-50 text-red-500 font-raleway font-semibold text-sm hover:bg-red-100 transition-colors flex-shrink-0"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
