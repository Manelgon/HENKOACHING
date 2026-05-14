'use client'

import { useState } from 'react'
import ImageUploader from './ImageUploader'
import KeywordsInput from './KeywordsInput'

type Props = {
  slug: string
  titulo: string
  extracto: string
  imagenPortada: string | null
  metaTitulo: string
  metaDescripcion: string
  ogImageUrl: string | null
  canonicalUrl: string
  keywords: string[]
  onSlugChange: (v: string) => void
  onMetaTituloChange: (v: string) => void
  onMetaDescripcionChange: (v: string) => void
  onOgImageChange: (v: string | null) => void
  onCanonicalChange: (v: string) => void
  onKeywordsChange: (v: string[]) => void
  errors?: Record<string, string>
}

const HOST = typeof window !== 'undefined' ? window.location.origin : ''

export default function SeoPanel(props: Props) {
  const [open, setOpen] = useState(false)

  const tituloFinal = props.metaTitulo || props.titulo
  const descripcionFinal = props.metaDescripcion || props.extracto
  const tituloLen = tituloFinal.length
  const descripcionLen = descripcionFinal.length
  const slugFinal = props.slug || 'tu-articulo'

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 md:px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3 text-left">
          <span className="w-9 h-9 rounded-xl bg-henko-greenblue/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-henko-turquoise" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <span>
            <p className="font-raleway font-semibold text-gray-900">SEO y compartir en redes</p>
            <p className="font-raleway text-xs text-gray-400">Meta título, descripción, Open Graph, palabras clave</p>
          </span>
        </div>
        <svg className={`w-5 h-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-5 md:px-6 py-6 space-y-6">
          {/* Preview Google */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4">
            <p className="font-raleway text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Vista previa en Google</p>
            <div className="space-y-1">
              <div className="text-xs text-gray-600 truncate">{HOST}{HOST ? '/' : ''}blog/{slugFinal}</div>
              <div className="text-blue-700 text-lg leading-tight font-medium truncate">{tituloFinal || 'Tu título aparecerá aquí'}</div>
              <div className="text-sm text-gray-600 line-clamp-2">{descripcionFinal || 'La descripción se mostrará aquí. Resúmela en menos de 160 caracteres.'}</div>
            </div>
          </div>

          <Field label="Slug (URL del artículo)" hint="Solo minúsculas, números y guiones." error={props.errors?.slug}>
            <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 overflow-hidden focus-within:border-henko-turquoise focus-within:bg-white transition-colors">
              <span className="px-3 py-2.5 text-gray-400 text-sm font-raleway border-r border-gray-200">/blog/</span>
              <input
                value={props.slug}
                onChange={(e) => props.onSlugChange(e.target.value)}
                className="flex-1 px-3 py-2.5 bg-transparent outline-none font-raleway text-sm"
                placeholder="mi-articulo"
              />
            </div>
          </Field>

          <Field
            label="Meta título"
            counter={`${tituloLen}/70`}
            counterWarning={tituloLen > 70}
            hint="Lo que verá Google como título. Si lo dejas vacío, usaremos el título del artículo."
            error={props.errors?.meta_titulo}
          >
            <input
              value={props.metaTitulo}
              onChange={(e) => props.onMetaTituloChange(e.target.value)}
              maxLength={120}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white"
              placeholder={props.titulo || 'Título optimizado para SEO'}
            />
          </Field>

          <Field
            label="Meta descripción"
            counter={`${descripcionLen}/160`}
            counterWarning={descripcionLen > 180}
            hint="Resumen que aparece bajo el título en Google. Idealmente entre 120 y 160 caracteres."
            error={props.errors?.meta_descripcion}
          >
            <textarea
              value={props.metaDescripcion}
              onChange={(e) => props.onMetaDescripcionChange(e.target.value)}
              rows={3}
              maxLength={250}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white resize-none"
              placeholder={props.extracto || 'Resumen atractivo del artículo'}
            />
          </Field>

          <Field label="Palabras clave" hint="Pulsa Enter o coma para añadir. Útiles para tu organización interna y como referencia.">
            <KeywordsInput value={props.keywords} onChange={props.onKeywordsChange} placeholder="coaching, liderazgo, ..." />
          </Field>

          <Field
            label="Imagen para redes sociales (Open Graph)"
            hint="Es la imagen que se muestra al compartir el enlace en LinkedIn, Twitter, WhatsApp, etc. Si la dejas vacía, usaremos la imagen de portada."
            error={props.errors?.og_image_url}
          >
            <ImageUploader
              value={props.ogImageUrl}
              onChange={props.onOgImageChange}
              hint="Recomendado: 1200×630 px"
            />
          </Field>

          <Field
            label="URL canónica (opcional)"
            hint="Solo si este artículo ya existe en otra URL y quieres indicárselo a Google. La mayoría de las veces déjala vacía."
            error={props.errors?.canonical_url}
          >
            <input
              type="url"
              value={props.canonicalUrl}
              onChange={(e) => props.onCanonicalChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white"
              placeholder="https://otro-sitio.com/articulo-original"
            />
          </Field>
        </div>
      )}
    </div>
  )
}

function Field({
  label,
  hint,
  counter,
  counterWarning,
  error,
  children,
}: {
  label: string
  hint?: string
  counter?: string
  counterWarning?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-2">
        <label className="block font-raleway text-sm font-semibold text-gray-700">{label}</label>
        {counter && (
          <span className={`font-raleway text-xs ${counterWarning ? 'text-red-500' : 'text-gray-400'}`}>{counter}</span>
        )}
      </div>
      {children}
      {error ? (
        <p className="font-raleway text-xs text-red-500">{error}</p>
      ) : hint ? (
        <p className="font-raleway text-xs text-gray-400">{hint}</p>
      ) : null}
    </div>
  )
}
