'use client'

import { useEffect, useState } from 'react'

export type TestimonioPublico = {
  id: string
  texto: string
  nombre: string
  rol: string | null
  sector: string | null
  rating: number | null
}

const AUTOPLAY_MS = 6000

export default function TestimoniosCarousel({ testimonios }: { testimonios: TestimonioPublico[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const total = testimonios.length

  function go(dir: 1 | -1) {
    setActiveIndex((prev) => (prev + dir + total) % total)
  }

  function goTo(idx: number) {
    setActiveIndex(idx)
  }

  // Autoplay
  useEffect(() => {
    if (paused || total <= 1) return
    const respectReducedMotion = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (respectReducedMotion) return

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total)
    }, AUTOPLAY_MS)
    return () => clearInterval(interval)
  }, [paused, total])

  if (total === 0) return null

  const t = testimonios[activeIndex]

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      {/* Nav arrows (top-right) */}
      {total > 1 && (
        <div className="absolute -top-16 right-0 flex gap-2 z-10">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Anterior"
            className="w-11 h-11 rounded-full bg-white border-2 border-henko-turquoise/30 text-henko-turquoise hover:bg-henko-turquoise hover:text-white hover:border-henko-turquoise transition-all flex items-center justify-center"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Siguiente"
            className="w-11 h-11 rounded-full bg-white border-2 border-henko-turquoise/30 text-henko-turquoise hover:bg-henko-turquoise hover:text-white hover:border-henko-turquoise transition-all flex items-center justify-center"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}

      {/* Cita destacada — layout editorial en 2 columnas */}
      <figure key={t.id} className="relative grid grid-cols-1 lg:grid-cols-[4fr_8fr] gap-8 lg:gap-14 items-start animate-[fadeIn_0.5s_ease]">

        {/* Columna izquierda — meta + autor */}
        <div className="lg:pt-4">
          <div className="flex items-center gap-4 mb-6">
            {t.rating && (
              <p className="text-yellow-500 text-base" aria-label={`${t.rating} de 5 estrellas`}>
                {'★'.repeat(t.rating)}<span className="text-gray-200">{'★'.repeat(5 - t.rating)}</span>
              </p>
            )}
            {t.sector && (
              <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-henko-turquoise">
                {t.sector}
              </span>
            )}
          </div>

          <figcaption className="flex items-center gap-3">
            <span className="block w-10 h-px bg-henko-turquoise/40" />
            <div>
              <p className="font-roxborough text-lg text-gray-900 leading-tight">{t.nombre}</p>
              {t.rol && <p className="text-[13px] text-gray-500 mt-0.5">{t.rol}</p>}
            </div>
          </figcaption>
        </div>

        {/* Columna derecha — cita */}
        <blockquote className="relative font-roxborough text-[19px] md:text-[24px] leading-[1.6] text-gray-800">
          <span
            aria-hidden
            className="pointer-events-none font-roxborough italic text-henko-turquoise/25 select-none mr-1"
          >
            &ldquo;
          </span>
          {t.texto}
        </blockquote>

      </figure>

      {/* Dots + contador */}
      {total > 1 && (
        <div className="flex items-center justify-between gap-6 mt-12 pt-8 border-t border-henko-turquoise/10">
          <div className="flex gap-1.5">
            {testimonios.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ir al testimonio ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === activeIndex ? 'w-8 bg-henko-turquoise' : 'w-1.5 bg-henko-turquoise/25 hover:bg-henko-turquoise/50'
                }`}
              />
            ))}
          </div>
          <p className="font-raleway text-[13px] tracking-[0.15em] text-gray-400 tabular-nums">
            <span className="text-henko-turquoise font-bold">{String(activeIndex + 1).padStart(2, '0')}</span>
            {' / '}
            {String(total).padStart(2, '0')}
          </p>
        </div>
      )}
    </div>
  )
}
