'use client'

import { useCallback, useRef, useState } from 'react'
import { subirImagenBlog } from '@/actions/blog'
import { useAction } from '@/shared/feedback/FeedbackContext'

type Props = {
  value: string | null
  alt?: string | null
  onChange: (url: string | null) => void
  onAltChange?: (alt: string) => void
  label?: string
  hint?: string
}

export default function ImageUploader({ value, alt, onChange, onAltChange, label, hint }: Props) {
  const runAction = useAction()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const subir = useCallback(async (file: File) => {
    const form = new FormData()
    form.set('file', file)
    const result = await runAction(
      'Subiendo imagen',
      () => subirImagenBlog(form),
      { silentSuccess: true },
    )
    if (result.ok && result.data && 'data' in result.data && result.data.data) {
      onChange(result.data.data.url)
    }
  }, [runAction, onChange])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) subir(file)
  }, [subir])

  return (
    <div className="space-y-2">
      {label && <label className="block font-raleway text-sm font-semibold text-gray-700">{label}</label>}

      {value ? (
        <div className="relative group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={alt ?? ''} className="w-full max-h-72 object-cover rounded-2xl" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-3 right-3 bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl text-xs font-raleway font-semibold text-red-500 hover:bg-red-50 transition-colors shadow-sm"
          >
            Quitar
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl px-6 py-10 text-center cursor-pointer transition-colors ${
            isDragging ? 'border-henko-turquoise bg-henko-turquoise/5' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="font-raleway text-sm text-gray-600 mb-1">
            <span className="text-henko-turquoise font-semibold">Sube una imagen</span> o arrástrala aquí
          </p>
          <p className="font-raleway text-xs text-gray-400">JPG, PNG o WebP · Máx. 5 MB</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) subir(file)
          e.target.value = ''
        }}
      />

      {value && onAltChange && (
        <input
          type="text"
          placeholder="Texto alternativo (alt) — describe la imagen para accesibilidad y SEO"
          value={alt ?? ''}
          onChange={(e) => onAltChange(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-raleway text-sm outline-none focus:border-henko-turquoise focus:bg-white"
        />
      )}

      {hint && <p className="font-raleway text-xs text-gray-400">{hint}</p>}
    </div>
  )
}
