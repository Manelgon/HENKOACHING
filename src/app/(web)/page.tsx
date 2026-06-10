import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import TestimoniosCarousel from '@/features/testimonios/components/TestimoniosCarousel'

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
    <main className="overflow-hidden bg-white">

      {/* HERO */}
      <section className="relative bg-white pt-[92px] px-6 md:px-12 overflow-hidden">
        <div className="relative z-10 max-w-[1400px] mx-auto pt-28 pb-14 grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-12 items-center">

          {/* Columna izquierda */}
          <div>

          {/* Kicker con líneas a los lados */}
          <div data-animate className="flex items-center gap-[14px] mb-[22px]">
            <span className="block w-[34px] h-[1.5px] bg-henko-turquoise opacity-50" />
            <p className="text-[13px] tracking-[0.2em] text-henko-turquoise font-bold uppercase font-raleway whitespace-nowrap">
              Orden · Liderazgo · Equipos
            </p>
            <span className="block w-[34px] h-[1.5px] bg-henko-turquoise opacity-50" />
          </div>

          {/* Titular tipográfico audaz */}
          <h1 data-animate data-delay="100" className="font-roxborough m-0" style={{fontSize: 'clamp(34px, 4.5vw, 68px)', lineHeight: 0.97, letterSpacing: '-0.025em'}}>
            <span className="block italic font-light text-[#4C625F]" style={{fontSize: 'clamp(20px, 2.5vw, 36px)', letterSpacing: '-0.01em', marginBottom: 6, fontWeight: 300}}>
              Cuando una empresa crece o cambia,
            </span>
            el <em className="italic text-henko-turquoise not-italic" style={{fontStyle: 'italic'}}>orden</em> deja
            <span className="block">de ser opcional.</span>
          </h1>

          <p data-animate data-delay="200" className="font-raleway text-[17px] leading-[1.6] text-[#4C625F] mt-[20px]">
              Acompaño a CEOs y empresas en crecimiento a crear orden, claridad y estructura
              para liderar con calma y construir equipos más conscientes.
            </p>

          </div>{/* fin columna izquierda */}

          {/* Columna derecha — logo */}
          <div data-animate="right" data-delay="150" className="hidden lg:flex items-center justify-center">
            <Image
              src="/henkologo.png"
              alt="Henkoaching"
              width={720}
              height={500}
              className="object-contain w-[75%] h-auto"
            />
          </div>

          {/* Botones centrados entre columnas — fila completa */}
          <div data-animate data-delay="300" className="lg:col-span-2 flex gap-4 items-center justify-center pt-4">
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2.5 bg-henko-turquoise text-white px-8 py-4 rounded-full text-[15.5px] font-semibold hover:bg-henko-turquoise-light hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-12px_rgba(12,82,81,0.55)] transition-all duration-200 whitespace-nowrap"
            >
              Trabaja conmigo
            </Link>
            <Link
              href="/servicios"
              className="inline-flex items-center gap-2.5 bg-transparent border border-[rgba(21,48,46,0.22)] text-[#15302E] px-7 py-4 rounded-full text-[15.5px] font-semibold hover:border-henko-turquoise hover:text-henko-turquoise transition-all duration-200 whitespace-nowrap group"
            >
              Ver servicios <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
            </Link>
          </div>

        </div>
      </section>

      {/* SÍNTOMAS */}
      <section className="bg-white py-24 md:py-28 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-16 items-start">

          {/* Columna izquierda */}
          <div className="lg:sticky lg:top-32">
            <div data-animate className="mb-5">
              <p className="text-[11px] tracking-[0.2em] text-henko-turquoise font-bold uppercase font-raleway whitespace-nowrap">
                ¿Te suena familiar?
              </p>
            </div>

            <h2 data-animate data-delay="100" className="font-roxborough text-[clamp(28px,3vw,44px)] text-gray-900 mb-6 leading-tight">
              Las señales de que<br />
              <em className="italic text-henko-turquoise font-light">algo debe cambiar</em>
            </h2>

            <p data-animate data-delay="200" className="font-raleway text-[15px] leading-[1.75] text-gray-600 mb-8">
              No falta talento. No falta trabajo. Cuando aparecen estas señales, lo que falta es{' '}
              <em className="italic text-henko-turquoise">orden, claridad y coherencia.</em>
            </p>

            <Link
              data-animate
              data-delay="300"
              href="/contacto"
              className="inline-flex items-center gap-2 bg-henko-turquoise text-white px-7 py-3.5 rounded-full text-[14.5px] font-semibold hover:bg-henko-turquoise-light hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-12px_rgba(12,82,81,0.55)] transition-all duration-200"
            >
              Trabaja conmigo
            </Link>
          </div>

          {/* Columna derecha — lista */}
          <div className="divide-y divide-[#DDD8CE]">
            {SYMPTOMS.map((s, i) => (
              <div key={i} data-animate data-delay={i * 80} className="flex gap-4 py-6">
                {/* Check icon relleno */}
                <div className="w-7 h-7 rounded-full bg-henko-turquoise flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L4.8 9L10 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                <div>
                  <h3 className="font-raleway font-bold text-[15px] text-gray-900 mb-1.5 leading-snug">
                    {s.title}
                  </h3>
                  <p className="font-raleway text-[14px] leading-[1.7] text-gray-500">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FRASE DESTACADA — franja turquesa */}
      <section className="relative bg-henko-turquoise py-24 md:py-28 px-6 md:px-12 text-center overflow-hidden">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 font-roxborough italic text-[16rem] md:text-[22rem] leading-none text-white/[0.07] select-none"
        >
          &ldquo;
        </span>

        <div className="relative z-10 max-w-3xl mx-auto">
          <div data-animate className="flex items-center justify-center gap-3 mb-7">
            <span className="block w-8 h-px bg-white/60" />
            <p className="font-raleway font-bold text-white tracking-[0.22em] uppercase text-[11px]">
              Mi forma de trabajar
            </p>
            <span className="block w-8 h-px bg-white/60" />
          </div>
          <h2 data-animate data-delay="100" className="font-roxborough text-white mb-7" style={{fontSize: 'clamp(20px, 2.5vw, 36px)', lineHeight: 1.3, letterSpacing: '-0.01em'}}>
            No hago un análisis de procesos desde fuera. <em className="italic font-light">Hablo con las personas, entiendo qué está pasando y ayudo a poner orden.</em>
          </h2>
          <p data-animate data-delay="200" className="font-roxborough italic text-base md:text-xl text-white/85">
            Eso, en esencia, es diagnóstico organizacional.
          </p>
        </div>
      </section>

      {/* SERVICIOS */}
      <section className="bg-white py-24 md:py-28 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14">
            <p className="font-raleway font-bold text-henko-turquoise tracking-[0.18em] uppercase text-[11px] mb-4">Servicios</p>
            <h2 data-animate className="font-roxborough text-3xl md:text-4xl text-gray-900 leading-tight">
              Tres formas de <em className="italic text-henko-turquoise font-light">acompañar tu organización</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SERVICES.map((s, i) => (
              <div
                key={s.num}
                data-animate="scale"
                data-delay={i * 100}
                className="group relative bg-white border border-henko-turquoise/15 rounded-[2.5rem] p-10 min-h-[280px] shadow-sm hover:border-henko-turquoise/40 hover:shadow-[0_16px_48px_rgba(31,143,155,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-4 right-4 font-roxborough italic text-[8rem] leading-none text-henko-turquoise/[0.07] group-hover:text-henko-turquoise/[0.12] transition-colors duration-300 select-none"
                >
                  {s.num}
                </span>

                <div className="relative flex items-center gap-3 mb-6">
                  <span className="block w-8 h-px bg-henko-turquoise" />
                  <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-henko-turquoise">
                    Servicio {s.num}
                  </span>
                </div>

                <h3 className="relative font-roxborough text-xl md:text-2xl text-gray-900 mb-3 leading-tight">{s.title}</h3>
                <p className="relative text-[14.5px] leading-[1.75] text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <p className="text-sm text-gray-500 italic leading-relaxed max-w-2xl">
              Puedes trabajar de forma específica en una sola área o integrar las tres disciplinas de manera transversal según la fase en la que se encuentre tu empresa.
            </p>
            <Link
              href="/servicios"
              className="inline-flex items-center gap-2 bg-transparent border-2 border-henko-turquoise text-henko-turquoise px-7 py-3 rounded-full text-sm font-semibold tracking-wide hover:bg-henko-turquoise hover:text-white transition-all duration-200 self-start md:self-auto whitespace-nowrap"
            >
              Ver todos →
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      {testimonios.length > 0 && (
        <section className="bg-gray-50 py-24 md:py-28 px-6 md:px-12 border-t border-gray-100 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
              <div>
                <p className="font-raleway font-bold text-henko-turquoise tracking-[0.18em] uppercase text-[11px] mb-4">
                  Lo que dicen · {testimonios.length} reseñas verificadas
                </p>
                <h2 data-animate className="font-roxborough text-3xl md:text-4xl text-gray-900 leading-tight">
                  Quienes ya hicieron<br />
                  <em className="italic text-henko-turquoise font-light">el cambio</em>
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
