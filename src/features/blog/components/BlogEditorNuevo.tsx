'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAction } from '@/shared/feedback/FeedbackContext'
import { crearYGuardarArticulo } from '@/actions/blog'
import { generarSlug } from '../lib/slug'
import { calcularTiempoLectura } from '../lib/reading-time'
import type { BlogCategoria } from '../types'
import TipTapEditor from './TipTapEditor'
import ImageUploader from './ImageUploader'
import SeoPanel from './SeoPanel'
import CustomSelect from '@/shared/components/CustomSelect'

type Props = {
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

const EMPTY: FormState = {
  titulo: '',
  slug: '',
  extracto: '',
  contenido: '<p></p>',
  imagen_portada: null,
  imagen_portada_alt: null,
  categoria_id: null,
  meta_titulo: '',
  meta_descripcion: '',
  og_image_url: null,
  canonical_url: '',
  keywords: [],
}

export default function BlogEditorNuevo({ categorias }: Props) {
  const router = useRouter()
  const runAction = useAction()
  const [slugManual, setSlugManual] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const tiempoLectura = useMemo(() => calcularTiempoLectura(form.contenido), [form.contenido])
  const palabras = useMemo(
    () => form.contenido.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length,
    [form.contenido]
  )

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function onTituloChange(v: string) {
    update('titulo', v)
    if (!slugManual) update('slug', generarSlug(v))
  }

  function onSlugChange(v: string) {
    setSlugManual(true)
    update('slug', generarSlug(v))
  }

  async function guardar(estado: 'borrador' | 'publicado') {
    setErrors({})
    const result = await runAction(
      estado === 'publicado' ? 'Publicando artículo' : 'Guardando borrador',
      () => crearYGuardarArticulo({
        titulo: form.titulo,
        slug: form.slug || generarSlug(form.titulo || 'articulo'),
        extracto: form.extracto,
        contenido: form.contenido,
        imagen_portada: form.imagen_portada,
        imagen_portada_alt: form.imagen_portada_alt,
        categoria_id: form.categoria_id,
        meta_titulo: form.meta_titulo,
        meta_descripcion: form.meta_descripcion,
        og_image_url: form.og_image_url,
        canonical_url: form.canonical_url || null,
        keywords: form.keywords,
        estado,
      }),
      { successMessage: estado === 'publicado' ? 'Artículo publicado' : 'Borrador guardado' },
    )

    if (!result.ok) return
    const inner = result.data
    if (inner && 'error' in inner) {
      if (inner.fieldErrors) setErrors(inner.fieldErrors)
      return
    }
    if (inner && 'data' in inner && inner.data?.id) {
      router.push(`/dashboard/blog/${inner.data.id}`)
    } else {
      router.push('/dashboard/blog')
    }
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
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-raleway font-semibold bg-gray-100 text-gray-500">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              Nuevo
            </span>
          </div>
          <p className="font-raleway text-xs text-gray-400">
            {palabras} palabras · {tiempoLectura} min lectura
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => guardar('borrador')}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-raleway font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            Guardar borrador
          </button>
          <button
            type="button"
            onClick={() => guardar('publicado')}
            className="px-5 py-2.5 rounded-xl bg-henko-turquoise text-white font-raleway font-semibold text-sm hover:bg-henko-turquoise-light transition-colors"
          >
            Guardar y publicar
          </button>
        </div>
      </div>

      <div className="space-y-6">
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
              <CustomSelect
                value={form.categoria_id != null ? String(form.categoria_id) : ''}
                onChange={(v) => update('categoria_id', v ? Number(v) : null)}
                options={[
                  { value: '', label: 'Sin categoría' },
                  ...categorias.map((c) => ({ value: String(c.id), label: c.nombre })),
                ]}
                className="w-full"
              />
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
      </div>
    </div>
  )
}
