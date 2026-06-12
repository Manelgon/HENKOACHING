import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import TestimoniosCarousel from '@/features/testimonios/components/TestimoniosCarousel'
import CTAButton from '@/components/web/CTAButton'

const SYMPTOMS = [
  {
    title: 'Avance con esfuerzo',
    desc: 'La empresa sigue adelante… pero cada vez cuesta más. La inercia sustituye al impulso y todo se siente cuesta arriba.',
  },
  {
    title: 'Roles sin definir',
    desc: 'Todo el mundo hace de todo, pero nadie tiene claro qué le corresponde. Las decisiones se acumulan.',
  },
  {
    title: 'Cambios que se posponen',
    desc: 'Se evitan los mismos cambios. Se sigue haciendo lo mismo porque siempre se ha hecho así.',
  },
  {
    title: 'Modo reactivo permanente',
    desc: 'El día a día manda. Y sin darte cuenta, la empresa ocupa todo tu tiempo, energía y cabeza apagando fuegos.',
  },
]

const SERVICES = [
  {
    num: '01',
    title: 'Orden y estructura',
    desc: 'Procesos claros, roles definidos y una operativa que funciona de manera autónoma sin depender exclusivamente de ti.',
  },
  {
    num: '02',
    title: 'Reclutamiento consciente',
    desc: 'Atracción de talento y personas que encajan verdaderamente, aportan valor continuo y sostienen la cultura de tu empresa.',
  },
  {
    num: '03',
    title: 'Liderazgo y desarrollo',
    desc: 'Equipos más conscientes, comunicación efectiva interdepartamental y un liderazgo humano que realmente sostiene.',
  },
]

export const revalidate = 300

export default async function Home() {
  const supabase = await createClient()
  const { data: testimoniosData } = await supabase
    .from('testimonios')
    .select('id, texto, nombre, rol, sector, rating')
    .eq('visible', true)
    .is('deleted_at', null)
    .order('orden', { ascending: true })
    .limit(20)
  const testimonios = testimoniosData ?? []

  return (
    <main className="overflow-hidden">

      {/* HERO */}
      <section className="relative pt-[92px] px-6 md:px-12">
        <div className="relative z-10 max-w-[1400px] mx-auto pt-24 md:pt-32 pb-16 grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-12 items-center">

          {/* Columna izquierda */}
          <div>

            {/* Kicker */}
            <p data-animate className="font-raleway font-semibold uppercase text-overline text-henko-turquoise mb-7 flex items-center gap-3">
              <span className="inline-block w-9 h-px bg-current opacity-60" aria-hidden="true" />
              Orden · Liderazgo · Equipos
            </p>

            {/* Titular serif con reveal por líneas */}
            <h1 data-animate="reveal" className="font-roxborough font-black text-henko-ink text-display-2xl m-0">
              <span className="reveal-line">
                <span className="reveal-inner block italic font-light text-henko-ink-soft text-display-lg mb-2">
                  Cuando una empresa crece o cambia,
                </span>
              </span>
              <span className="reveal-line">
                <span className="reveal-inner">
                  el <em className="italic text-henko-turquoise">orden</em> deja
                </span>
              </span>
              <span className="reveal-line">
                <span className="reveal-inner">de ser opcional.</span>
              </span>
            </h1>

            <p data-animate data-delay="400" className="font-raleway text-[17px] leading-[1.7] text-henko-ink-soft mt-7 max-w-xl">
              Acompaño a CEOs y empresas en crecimiento a crear orden, claridad y estructura
              para liderar con calma y construir equipos más conscientes.
            </p>

            <div data-animate data-delay="500" className="flex flex-wrap gap-4 items-center pt-9">
              <CTAButton href="/contacto" variant="primary">Trabaja conmigo</CTAButton>
              <CTAButton href="/servicios" variant="secondary">Ver servicios</CTAButton>
            </div>

          </div>

          {/* Columna derecha — logo */}
          <div data-animate="right" data-delay="300" className="hidden lg:flex items-center justify-center">
            <Image
              src="/henkologo.png"
              alt="Henkoaching"
              width={720}
              height={500}
              priority
              className="object-contain w-[72%] h-auto"
            />
          </div>

        </div>
      </section>

      {/* SÍNTOMAS */}
      <section className="py-24 md:py-32 px-6 md:px-12 hairline-t">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-16 items-start">

          {/* Columna izquierda */}
          <div className="lg:sticky lg:top-32">
            <p data-animate className="font-raleway font-semibold uppercase text-overline text-henko-turquoise mb-5 flex items-center gap-3">
              <span className="inline-block w-8 h-px bg-current opacity-60" aria-hidden="true" />
              ¿Te suena familiar?
            </p>

            <h2 data-animate="reveal" className="font-roxborough font-bold text-display-lg text-henko-ink mb-6">
              <span className="reveal-line"><span className="reveal-inner">Las señales de que</span></span>
              <span className="reveal-line">
                <span className="reveal-inner italic font-light text-henko-turquoise">algo debe cambiar</span>
              </span>
            </h2>

            <p data-animate data-delay="200" className="font-raleway text-[15px] leading-[1.75] text-henko-ink-soft mb-9">
              No falta talento. No falta trabajo. Cuando aparecen estas señales, lo que falta es{' '}
              <em className="italic text-henko-turquoise">orden, claridad y coherencia.</em>
            </p>

            <div data-animate data-delay="300">
              <CTAButton href="/contacto" variant="primary">Trabaja conmigo</CTAButton>
            </div>
          </div>

          {/* Columna derecha — lista */}
          <div data-stagger className="divide-y divide-henko-hairline">
            {SYMPTOMS.map((s) => (
              <div key={s.title} className="flex gap-5 py-7">
                <div className="w-7 h-7 rounded-full border border-henko-turquoise/40 bg-henko-turquoise/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L4.8 9L10 3" stroke="#1f8f9b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                <div>
                  <h3 className="font-roxborough font-bold text-lg text-henko-ink mb-1.5 leading-snug">
                    {s.title}
                  </h3>
                  <p className="font-raleway text-[14.5px] leading-[1.7] text-henko-ink-soft">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FRASE DESTACADA — franja papel profundo */}
      <section className="relative bg-henko-paper-deep hairline-t hairline-b py-24 md:py-32 px-6 md:px-12 text-center overflow-hidden">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 font-roxborough italic text-[16rem] md:text-[22rem] leading-none text-henko-ink/[0.04] select-none"
        >
          &ldquo;
        </span>

        <div className="relative z-10 max-w-3xl mx-auto">
          <p data-animate className="font-raleway font-semibold uppercase text-overline text-henko-turquoise mb-8 flex items-center justify-center gap-3">
            <span className="inline-block w-8 h-px bg-current opacity-60" aria-hidden="true" />
            Mi forma de trabajar
            <span className="inline-block w-8 h-px bg-current opacity-60" aria-hidden="true" />
          </p>
          <h2 data-animate data-delay="100" className="font-roxborough text-henko-ink mb-8" style={{fontSize: 'clamp(22px, 2.6vw, 38px)', lineHeight: 1.3, letterSpacing: '-0.01em'}}>
            No hago un análisis de procesos desde fuera. <em className="italic font-light text-henko-turquoise">Hablo con las personas, entiendo qué está pasando y ayudo a poner orden.</em>
          </h2>
          <p data-animate data-delay="200" className="font-roxborough italic text-base md:text-xl text-henko-ink-soft">
            Eso, en esencia, es diagnóstico organizacional.
          </p>
        </div>
      </section>

      {/* SERVICIOS */}
      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p data-animate className="font-raleway font-semibold uppercase text-overline text-henko-turquoise mb-5 flex items-center gap-3">
              <span className="inline-block w-8 h-px bg-current opacity-60" aria-hidden="true" />
              Servicios
            </p>
            <h2 data-animate="reveal" className="font-roxborough font-bold text-display-lg text-henko-ink">
              <span className="reveal-line"><span className="reveal-inner">Tres formas de</span></span>
              <span className="reveal-line">
                <span className="reveal-inner italic font-light text-henko-turquoise">acompañar tu organización</span>
              </span>
            </h2>
          </div>

          <div data-stagger className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {SERVICES.map((s) => (
              <div
                key={s.num}
                className="group relative bg-henko-card border border-henko-hairline rounded-[2rem] p-10 min-h-[280px] shadow-soft hover:shadow-lift hover:-translate-y-1 transition-all duration-300 ease-out-expo overflow-hidden"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-4 right-4 font-roxborough italic text-[8rem] leading-none text-henko-turquoise/[0.07] group-hover:text-henko-turquoise/[0.13] transition-colors duration-300 select-none"
                >
                  {s.num}
                </span>

                <div className="relative flex items-center gap-3 mb-7">
                  <span className="block w-8 h-px bg-henko-turquoise" />
                  <span className="font-raleway text-[10px] font-semibold tracking-[0.18em] uppercase text-henko-turquoise">
                    Servicio {s.num}
                  </span>
                </div>

                <h3 className="relative font-roxborough text-xl md:text-2xl text-henko-ink mb-3 leading-tight">{s.title}</h3>
                <p className="relative font-raleway text-[14.5px] leading-[1.75] text-henko-ink-soft">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <p data-animate className="font-raleway text-sm text-henko-ink-soft italic leading-relaxed max-w-2xl">
              Puedes trabajar de forma específica en una sola área o integrar las tres disciplinas de manera transversal según la fase en la que se encuentre tu empresa.
            </p>
            <div data-animate data-delay="100" className="self-start md:self-auto">
              <CTAButton href="/servicios" variant="secondary">Ver todos</CTAButton>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      {testimonios.length > 0 && (
        <section className="bg-henko-paper-deep py-24 md:py-32 px-6 md:px-12 hairline-t overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
              <div>
                <p data-animate className="font-raleway font-semibold uppercase text-overline text-henko-turquoise mb-5 flex items-center gap-3">
                  <span className="inline-block w-8 h-px bg-current opacity-60" aria-hidden="true" />
                  Lo que dicen · {testimonios.length} reseñas verificadas
                </p>
                <h2 data-animate="reveal" className="font-roxborough font-bold text-display-lg text-henko-ink">
                  <span className="reveal-line"><span className="reveal-inner">Quienes ya hicieron</span></span>
                  <span className="reveal-line">
                    <span className="reveal-inner italic font-light text-henko-turquoise">el cambio</span>
                  </span>
                </h2>
              </div>
            </div>

            <TestimoniosCarousel testimonios={testimonios} />
          </div>
        </section>
      )}

    </main>
  )
}
