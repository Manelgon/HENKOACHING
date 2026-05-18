'use client'

import { useEffect, useRef, useState } from 'react'

export type TestimonioPublico = {
  id: string
  texto: string
  nombre: string
  rol: string | null
  sector: string | null
  rating: number | null
}

const AUTOPLAY_MS = 5000

export default function TestimoniosCarousel({ testimonios }: { testimonios: TestimonioPublico[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [openModal, setOpenModal] = useState<TestimonioPublico | null>(null)
  const [paused, setPaused] = useState(false)

  // Update active dot based on scroll position
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const onScroll = () => {
      const cardWidth = el.scrollWidth / testimonios.length
      const idx = Math.round(el.scrollLeft / cardWidth)
      setActiveIndex(Math.max(0, Math.min(testimonios.length - 1, idx)))
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [testimonios.length])

  // Autoplay
  useEffect(() => {
    if (paused || openModal || testimonios.length <= 1) return
    const respectReducedMotion = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (respectReducedMotion) return

    const interval = setInterval(() => {
      const el = scrollerRef.current
      if (!el) return
      const cardWidth = el.scrollWidth / testimonios.length
      const maxScroll = el.scrollWidth - el.clientWidth
      if (el.scrollLeft >= maxScroll - 4) {
        el.scrollTo({ left: 0, behavior: 'auto' })
      } else {
        el.scrollBy({ left: cardWidth, behavior: 'smooth' })
      }
    }, AUTOPLAY_MS)
    return () => clearInterval(interval)
  }, [paused, openModal, testimonios.length])

  // Close modal with Esc
  useEffect(() => {
    if (!openModal) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenModal(null) }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [openModal])

  function scrollByCards(dir: 1 | -1) {
    const el = scrollerRef.current
    if (!el) return
    const cardWidth = el.scrollWidth / testimonios.length
    const visibleCards = Math.max(1, Math.round(el.clientWidth / cardWidth))
    const maxScroll = el.scrollWidth - el.clientWidth
    const epsilon = 4 // tolerancia píxel para detectar extremos

    // Reset al inicio cuando se llega al final (salto instantáneo, no infinito)
    if (dir === 1 && el.scrollLeft >= maxScroll - epsilon) {
      el.scrollTo({ left: 0, behavior: 'auto' })
      return
    }
    if (dir === -1 && el.scrollLeft <= epsilon) {
      el.scrollTo({ left: maxScroll, behavior: 'auto' })
      return
    }

    el.scrollBy({ left: dir * cardWidth * visibleCards, behavior: 'smooth' })
  }

  function scrollToCard(idx: number) {
    const el = scrollerRef.current
    if (!el) return
    const cardWidth = el.scrollWidth / testimonios.length
    el.scrollTo({ left: idx * cardWidth, behavior: 'smooth' })
  }

  return (
    <>
      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
      >
        {/* Nav arrows (desktop) */}
        <div className="hidden md:flex absolute -top-16 right-0 gap-2 z-10">
          <button
            type="button"
            onClick={() => scrollByCards(-1)}
            aria-label="Anterior"
            className="w-11 h-11 rounded-full bg-white border-2 border-henko-turquoise/30 text-henko-turquoise hover:bg-henko-turquoise hover:text-white hover:border-henko-turquoise transition-all flex items-center justify-center"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollByCards(1)}
            aria-label="Siguiente"
            className="w-11 h-11 rounded-full bg-white border-2 border-henko-turquoise/30 text-henko-turquoise hover:bg-henko-turquoise hover:text-white hover:border-henko-turquoise transition-all flex items-center justify-center"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Scroller */}
        <div
          ref={scrollerRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0 pb-2"
          style={{ scrollbarWidth: 'none' }}
        >
          {testimonios.map((t) => (
            <figure
              key={t.id}
              className="group relative bg-white border border-henko-turquoise/15 rounded-[2.5rem] p-8 md:p-9 shadow-sm hover:border-henko-turquoise/40 hover:shadow-[0_16px_48px_rgba(31,143,155,0.08)] transition-all duration-300 overflow-hidden flex flex-col snap-start flex-shrink-0 w-[85%] sm:w-[60%] md:w-[calc((100%-2rem)/3)]"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -top-6 -right-2 font-roxborough italic text-[9rem] leading-none text-henko-turquoise/[0.07] group-hover:text-henko-turquoise/[0.12] transition-colors duration-300 select-none"
              >
                &rdquo;
              </span>

              {t.sector && (
                <div className="relative flex items-center gap-3 mb-4">
                  <span className="block w-8 h-px bg-henko-turquoise" />
                  <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-henko-turquoise">
                    {t.sector}
                  </span>
                </div>
              )}

              {t.rating && (
                <p className="relative text-yellow-500 text-sm mb-3" aria-label={`${t.rating} de 5 estrellas`}>
                  {'★'.repeat(t.rating)}<span className="text-gray-200">{'★'.repeat(5 - t.rating)}</span>
                </p>
              )}

              <blockquote className="relative font-roxborough italic text-[16px] md:text-[17px] leading-[1.55] text-gray-800 mb-4 flex-1 line-clamp-6">
                {t.texto}
              </blockquote>

              <button
                type="button"
                onClick={() => setOpenModal(t)}
                className="relative self-start text-[12px] font-semibold tracking-wide text-henko-turquoise hover:text-henko-turquoise-light underline underline-offset-4 decoration-henko-turquoise/40 hover:decoration-henko-turquoise transition-colors mb-5"
              >
                Leer reseña completa →
              </button>

              <figcaption className="relative pt-4 border-t border-henko-turquoise/10">
                <p className="font-roxborough text-base text-gray-900 leading-tight">{t.nombre}</p>
                {t.rol && <p className="text-[12px] text-gray-500 mt-0.5">{t.rol}</p>}
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-8">
          {testimonios.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToCard(i)}
              aria-label={`Ir al testimonio ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === activeIndex ? 'w-8 bg-henko-turquoise' : 'w-1.5 bg-henko-turquoise/25 hover:bg-henko-turquoise/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Modal */}
      {openModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Reseña completa"
          onClick={() => setOpenModal(null)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-[2.5rem] max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8 md:p-12 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setOpenModal(null)}
              aria-label="Cerrar"
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <span
              aria-hidden
              className="pointer-events-none absolute -top-2 left-6 font-roxborough italic text-[10rem] leading-none text-henko-turquoise/[0.08] select-none"
            >
              &ldquo;
            </span>

            {openModal.sector && (
              <div className="relative flex items-center gap-3 mb-5 pt-2">
                <span className="block w-8 h-px bg-henko-turquoise" />
                <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-henko-turquoise">
                  {openModal.sector}
                </span>
              </div>
            )}

            {openModal.rating && (
              <p className="relative text-yellow-500 mb-5">
                {'★'.repeat(openModal.rating)}<span className="text-gray-200">{'★'.repeat(5 - openModal.rating)}</span>
              </p>
            )}

            <blockquote className="relative font-roxborough italic text-lg md:text-xl leading-[1.55] text-gray-800 mb-8">
              {openModal.texto}
            </blockquote>

            <div className="relative pt-5 border-t border-henko-turquoise/15">
              <p className="font-roxborough text-lg text-gray-900 leading-tight">{openModal.nombre}</p>
              {openModal.rol && <p className="text-sm text-gray-500 mt-1">{openModal.rol}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
