import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import BlogCard, { type BlogCardData } from '@/features/blog/components/BlogCard'
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

const AUDIENCE = [
  { tag: 'Crecimiento', title: 'Empresas en crecimiento',    sub: 'Que necesitan estructura firme para escalar sin caer en el caos organizativo.' },
  { tag: 'Transición',  title: 'Cambio generacional',         sub: 'Transiciones familiares o de liderazgo que requieren orden y claridad de roles desde el primer día.' },
  { tag: 'Digital',     title: 'Transformación digital',      sub: 'Procesos operativos que deben evolucionar hacia lo digital sin que el equipo se quede atrás.' },
  { tag: 'Cultura',     title: 'Cambio cultural',             sub: 'Organizaciones que quieren renovar su forma de trabajar y comunicarse internamente.' },
  { tag: 'Escalado',    title: 'Equipos que crecieron rápido', sub: 'Equipos que escalaron muy rápido sin una base clara desde la que sostenerse.' },
  { tag: 'Delegación',  title: 'CEOs que quieren soltar',      sub: 'Líderes y fundadores que ya no quieren ni deben participar en la microgestión diaria.' },
]

const ENFOQUE_PILLS = [
  { label: 'Diagnóstico real',         sub: 'Sin diagnósticos genéricos.' },
  { label: 'Sin dependencias externas', sub: 'Te llevas las herramientas.' },
  { label: 'Cambio sostenible',         sub: 'Resultados que perduran.' },
  { label: 'Desde las raíces',          sub: 'No solo en la superficie.' },
]


export const revalidate = 300

export default async function Home() {
  const supabase = await createClient()
  const [{ data: latestPostsData }, { data: testimoniosData }] = await Promise.all([
    supabase
      .from('blog_posts')
      .select('slug, titulo, extracto, imagen_portada, imagen_portada_alt, fecha_publicacion, tiempo_lectura, categoria:blog_categorias(slug, nombre)')
      .eq('estado', 'publicado')
      .is('deleted_at', null)
      .order('fecha_publicacion', { ascending: false, nullsFirst: false })
      .limit(3),
    supabase
      .from('testimonios')
      .select('id, texto, nombre, rol, sector, rating')
      .eq('visible', true)
      .is('deleted_at', null)
      .order('orden', { ascending: true })
      .limit(20),
  ])
  const latestPosts = (latestPostsData ?? []) as unknown as BlogCardData[]
  const testimonios = testimoniosData ?? []

  return (
    <main className="overflow-hidden bg-white">

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center bg-white pt-20 overflow-hidden">
        {/* Decorative blobs (henko = transformación) */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="blob-1 absolute -top-24 -left-32 w-[420px] h-[420px] bg-henko-turquoise/[0.08]" />
          <div className="blob-2 absolute top-1/3 -right-40 w-[520px] h-[520px] bg-henko-turquoise/[0.06]" />
          <div className="blob-3 absolute -bottom-32 left-1/4 w-[380px] h-[380px] bg-henko-turquoise/[0.05]" />
        </div>

        {/* Subtle grain/vignette overlay */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/60" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <Image
            src="/henkologo.png"
            alt="Henkoaching"
            width={720}
            height={500}
            className="object-contain mx-auto mb-9 w-[360px] h-auto drop-shadow-[0_8px_32px_rgba(31,143,155,0.12)]"
            priority
          />

          <p className="font-roxborough italic text-2xl md:text-3xl text-gray-700 mb-4 leading-relaxed">
            Cuando una empresa crece o cambia,<br />
            el orden deja de ser opcional.
          </p>
          <div className="flex items-center justify-center gap-3 mb-12">
            <span className="block w-8 h-px bg-henko-turquoise/40" />
            <p className="text-[11px] md:text-xs tracking-[0.22em] text-henko-turquoise font-semibold uppercase">
              coaching &amp; mindfulness empresarial
            </p>
            <span className="block w-8 h-px bg-henko-turquoise/40" />
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 bg-henko-turquoise text-white px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide hover:bg-henko-turquoise-light hover:shadow-lg hover:shadow-henko-turquoise/30 transition-all duration-200"
            >
              Trabaja conmigo
            </Link>
            <Link
              href="/servicios"
              className="inline-flex items-center gap-2 bg-transparent border-2 border-henko-turquoise text-henko-turquoise px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide hover:bg-henko-turquoise hover:text-white transition-all duration-200"
            >
              Ver servicios
            </Link>
          </div>
        </div>

      </section>

      {/* SÍNTOMAS */}
      <section className="bg-gray-50 py-24 md:py-28 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <p className="font-raleway font-bold text-henko-turquoise tracking-[0.18em] uppercase text-[11px] mb-4">¿Te suena familiar?</p>
          <h2 data-animate className="font-roxborough text-3xl md:text-4xl text-gray-900 mb-14 leading-tight">
            Las señales de que<br />
            <em className="italic text-henko-turquoise font-light">algo debe cambiar</em>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {SYMPTOMS.map((s, i) => (
              <div
                key={i}
                data-animate="scale"
                data-delay={i * 100}
                className="group relative bg-white rounded-[2.5rem] p-9 md:p-10 border border-henko-turquoise/15 shadow-sm hover:border-henko-turquoise/40 hover:shadow-[0_16px_48px_rgba(31,143,155,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {/* Decorative number watermark */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-4 -right-2 font-roxborough italic text-[7rem] leading-none text-henko-turquoise/[0.06] group-hover:text-henko-turquoise/10 transition-colors duration-300 select-none"
                >
                  0{i + 1}
                </span>

                <div className="relative flex items-center gap-3 mb-5">
                  <span className="block w-8 h-px bg-henko-turquoise" />
                  <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-henko-turquoise">
                    Síntoma 0{i + 1}
                  </span>
                </div>

                <h3 className="relative font-roxborough text-xl md:text-2xl text-gray-900 mb-3 leading-tight">
                  {s.title}
                </h3>
                <p className="relative text-[14.5px] leading-[1.75] text-gray-600">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Banner */}
          <div data-animate data-delay="400" className="mt-5 rounded-[2rem] bg-white border border-henko-turquoise/15 px-10 md:px-12 py-8 md:py-9 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-sm">
            <div>
              <p className="font-roxborough text-xl md:text-2xl text-gray-900 mb-1.5">
                No falta talento. No falta trabajo.
              </p>
              <p className="font-roxborough text-xl md:text-2xl text-henko-turquoise italic">
                Falta orden, claridad y coherencia.
              </p>
            </div>
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 bg-henko-turquoise text-white px-7 py-3.5 rounded-full text-sm font-semibold tracking-wide hover:bg-henko-turquoise-light hover:shadow-lg transition-all duration-200 whitespace-nowrap"
            >
              Hablemos →
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section className="bg-white py-24 md:py-28 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-14 gap-6">
            <div>
              <p className="font-raleway font-bold text-henko-turquoise tracking-[0.18em] uppercase text-[11px] mb-4">Servicios</p>
              <h2 data-animate className="font-roxborough text-3xl md:text-4xl text-gray-900 leading-tight">
                Tres formas de<br />
                <em className="italic text-henko-turquoise font-light">acompañar tu organización</em>
              </h2>
            </div>
            <Link
              href="/servicios"
              className="inline-flex items-center gap-2 bg-transparent border-2 border-henko-turquoise text-henko-turquoise px-7 py-3 rounded-full text-sm font-semibold tracking-wide hover:bg-henko-turquoise hover:text-white transition-all duration-200 self-start md:self-auto"
            >
              Ver todos →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SERVICES.map((s, i) => (
              <div
                key={s.num}
                data-animate="scale"
                data-delay={i * 100}
                className="group relative bg-white border border-henko-turquoise/15 rounded-[2.5rem] p-10 min-h-[280px] shadow-sm hover:border-henko-turquoise/40 hover:shadow-[0_16px_48px_rgba(31,143,155,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {/* Decorative number watermark */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-6 -right-2 font-roxborough italic text-[8rem] leading-none text-henko-turquoise/[0.07] group-hover:text-henko-turquoise/[0.12] transition-colors duration-300 select-none"
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

          <p className="mt-7 text-sm text-gray-500 italic leading-relaxed max-w-2xl">
            Puedes trabajar de forma específica en una sola área o integrar las tres disciplinas de manera transversal según la fase en la que se encuentre tu empresa.
          </p>
        </div>
      </section>

      {/* QUOTE */}
      <section className="relative py-28 md:py-36 px-6 md:px-12 bg-henko-turquoise/[0.04] border-y border-henko-turquoise/15 overflow-hidden">
        {/* Soft radial glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(31,143,155,0.06)_0%,transparent_60%)]"
        />

        {/* Giant decorative quotes */}
        <span
          aria-hidden
          className="pointer-events-none absolute top-4 left-4 md:top-8 md:left-12 font-roxborough italic text-[14rem] md:text-[20rem] leading-none text-henko-turquoise/[0.10] select-none"
        >
          &ldquo;
        </span>
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-[-6rem] right-4 md:bottom-[-8rem] md:right-12 font-roxborough italic text-[14rem] md:text-[20rem] leading-none text-henko-turquoise/[0.10] select-none"
        >
          &rdquo;
        </span>

        <div data-animate className="max-w-3xl mx-auto text-center relative z-10">
          <p className="font-roxborough italic text-2xl md:text-4xl text-gray-900 leading-[1.35] mb-7">
            Cuando la mariposa toma alas,<br />
            no queda nada de la oruga
          </p>
          <div className="w-12 h-0.5 bg-henko-turquoise mx-auto mb-5" />
          <p className="text-xs text-henko-turquoise/80 tracking-[0.14em] font-semibold">JENNIFER CERVERA · HENKOACHING</p>
        </div>
      </section>

      {/* PARA QUIÉN */}
      <section className="bg-gray-50 py-24 md:py-28 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <p className="font-raleway font-bold text-henko-turquoise tracking-[0.18em] uppercase text-[11px] mb-4">Para quién</p>
          <h2 data-animate className="font-roxborough text-3xl md:text-4xl text-gray-900 mb-14 leading-tight">
            Acompaño a empresas que<br />
            <em className="italic text-henko-turquoise font-light">están en momentos clave</em>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AUDIENCE.map((a, i) => (
              <div
                key={i}
                data-animate="scale"
                data-delay={i * 80}
                className="group relative bg-white border border-henko-turquoise/15 rounded-[2.5rem] p-8 md:p-9 min-h-[200px] shadow-sm hover:border-henko-turquoise/40 hover:shadow-[0_16px_48px_rgba(31,143,155,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex"
              >
                {/* Vertical accent bar */}
                <span
                  aria-hidden
                  className="absolute top-8 bottom-8 left-0 w-px bg-gradient-to-b from-transparent via-henko-turquoise to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-300"
                />

                <div className="relative flex flex-col justify-center pl-2 w-full">
                  {/* Tag overline */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="block w-6 h-px bg-henko-turquoise" />
                    <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-henko-turquoise">
                      {a.tag}
                    </span>
                  </div>

                  <h3 className="font-roxborough text-xl md:text-[22px] text-gray-900 mb-3 leading-tight">{a.title}</h3>
                  <p className="text-[14.5px] leading-[1.7] text-gray-600">{a.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/servicios"
              className="inline-flex items-center gap-2 bg-henko-turquoise text-white px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide hover:bg-henko-turquoise-light hover:shadow-lg hover:shadow-henko-turquoise/30 transition-all duration-200"
            >
              Descubrir cómo puedo ayudarte →
            </Link>
          </div>
        </div>
      </section>

      {/* ENFOQUE */}
      <section className="bg-white py-24 md:py-28 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          <div>
            <p className="font-raleway font-bold text-henko-turquoise tracking-[0.18em] uppercase text-[11px] mb-4">Mi enfoque</p>
            <h2 data-animate="left" className="font-roxborough text-3xl md:text-4xl text-gray-900 mb-7 leading-tight">
              El cambio no se impone.<br />
              <em className="italic text-henko-turquoise font-light">Se construye desde dentro.</em>
            </h2>
            <p data-animate="left" data-delay="100" className="text-base md:text-[15px] leading-[1.85] text-gray-600 mb-4">
              Entro en la empresa para entender cómo funciona realmente en su base, no solo lo que parece que pasa en la superficie.
            </p>
            <p data-animate="left" data-delay="200" className="text-base md:text-[15px] leading-[1.85] text-gray-600 mb-9">
              Ordenamos la estructura, mejoramos los canales de comunicación y trabajamos el liderazgo desde las raíces, para que la transformación se sostenga orgánicamente en tu equipo.
            </p>
            <Link
              href="/sobre-mi"
              className="inline-flex items-center gap-2 bg-transparent border-2 border-henko-turquoise text-henko-turquoise px-7 py-3 rounded-full text-sm font-semibold tracking-wide hover:bg-henko-turquoise hover:text-white transition-all duration-200"
            >
              Descubrir mi metodología →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {ENFOQUE_PILLS.map((pill, i) => {
              // 4 ornamentos orgánicos distintos: ola, espiral, semilla, raíz
              const ornaments = [
                // 0 — ondas (diagnóstico, profundidad)
                <path key="o0" d="M0 30 Q15 10, 30 30 T60 30 T90 30 T120 30" />,
                // 1 — espiral abierta (sin dependencias, libertad)
                <path key="o1" d="M60 50 a25 25 0 1 1 -20 -24 a18 18 0 1 1 14 18 a12 12 0 1 1 -8 -12" />,
                // 2 — brote/hoja (cambio sostenible)
                <path key="o2" d="M30 70 Q30 35, 55 25 Q70 18, 65 5 M30 70 Q35 50, 50 45" />,
                // 3 — raíces ramificándose (desde las raíces)
                <path key="o3" d="M50 0 V25 M50 25 Q35 35, 25 55 M50 25 Q65 35, 75 55 M50 25 V60 M50 60 Q40 70, 35 80 M50 60 Q60 70, 65 80" />,
              ]
              return (
                <div
                  key={i}
                  data-animate="scale"
                  data-delay={i * 100}
                  className="group relative bg-white border border-henko-turquoise/15 rounded-[2rem] p-8 md:p-9 min-h-[160px] shadow-sm hover:border-henko-turquoise/40 hover:shadow-[0_16px_48px_rgba(31,143,155,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex"
                >
                  {/* Vertical accent bar */}
                  <span
                    aria-hidden
                    className="absolute top-8 bottom-8 left-0 w-px bg-gradient-to-b from-transparent via-henko-turquoise to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-300"
                  />

                  {/* Organic ornament watermark */}
                  <svg
                    aria-hidden
                    viewBox="0 0 120 90"
                    className="pointer-events-none absolute -bottom-4 -right-2 w-32 h-24 text-henko-turquoise/[0.10] group-hover:text-henko-turquoise/20 transition-colors duration-300"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {ornaments[i]}
                  </svg>

                  <div className="relative flex flex-col justify-center pl-2 w-full">
                    <p className="font-roxborough text-xl md:text-2xl leading-tight text-gray-900 mb-1.5">{pill.label}</p>
                    <p className="text-[13px] leading-relaxed text-gray-500 italic font-roxborough">{pill.sub}</p>
                  </div>
                </div>
              )
            })}
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

      {/* CTA FINAL */}
      <section className="relative bg-henko-turquoise py-28 md:py-32 px-6 md:px-12 text-center overflow-hidden">
        {/* Decorative blobs */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="blob-1 absolute -top-32 -left-32 w-[480px] h-[480px] bg-white/[0.08]" />
          <div className="blob-2 absolute -bottom-40 -right-32 w-[520px] h-[520px] bg-white/[0.06]" />
        </div>

        {/* Giant decorative quote mark */}
        <span
          aria-hidden
          className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 font-roxborough italic text-[18rem] md:text-[24rem] leading-none text-white/[0.06] select-none"
        >
          &mdash;
        </span>

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="block w-8 h-px bg-white/60" />
            <p className="font-raleway font-bold text-white tracking-[0.22em] uppercase text-[11px]">
              ¿Listo para el siguiente paso?
            </p>
            <span className="block w-8 h-px bg-white/60" />
          </div>
          <h2 data-animate className="font-roxborough text-3xl md:text-5xl text-white mb-5 leading-[1.15]">
            Si sientes que tu empresa<br />podría funcionar mejor...
          </h2>
          <p data-animate data-delay="100" className="font-roxborough italic text-2xl md:text-3xl text-white/90 mb-12">
            probablemente tengas razón.
          </p>
          <div data-animate data-delay="200" className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 bg-white text-henko-turquoise px-9 py-4 rounded-full text-[15px] font-semibold tracking-wide hover:bg-gray-50 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              Trabajar conmigo →
            </Link>
            <Link
              href="/servicios"
              className="inline-flex items-center gap-2 bg-transparent border-2 border-white text-white px-9 py-4 rounded-full text-[15px] font-semibold tracking-wide hover:bg-white hover:text-henko-turquoise transition-all duration-200"
            >
              Descubrir cómo puedo ayudarte
            </Link>
          </div>
        </div>
      </section>

      {/* BLOG */}
      {latestPosts.length > 0 && (
        <section className="bg-gray-50 py-24 md:py-28 px-6 md:px-12 border-t border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-14 gap-6">
              <div>
                <p className="font-raleway font-bold text-henko-turquoise tracking-[0.18em] uppercase text-[11px] mb-4">Blog</p>
                <h2 data-animate className="font-roxborough text-3xl md:text-4xl text-gray-900 leading-tight">
                  Últimas<br />
                  <em className="italic text-henko-turquoise font-light">reflexiones</em>
                </h2>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 bg-transparent border-2 border-henko-turquoise text-henko-turquoise px-7 py-3 rounded-full text-sm font-semibold tracking-wide hover:bg-henko-turquoise hover:text-white transition-all duration-200 self-start md:self-auto"
              >
                Ver todas →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {latestPosts.map((p) => (
                <BlogCard key={p.slug} post={p} compact />
              ))}
            </div>
          </div>
        </section>
      )}

    </main>
  )
}
