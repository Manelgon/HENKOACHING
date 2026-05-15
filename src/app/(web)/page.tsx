import Link from 'next/link'
import Image from 'next/image'
import {
  AvanceSVG,
  RolesSVG,
  PospuestosSVG,
  ReactivoSVG,
} from '@/components/SymptomIllustrations'
import { createClient } from '@/lib/supabase/server'
import BlogCard, { type BlogCardData } from '@/features/blog/components/BlogCard'

const SYMPTOMS = [
  {
    title: 'Avance con esfuerzo',
    desc: 'La empresa sigue adelante… pero cada vez cuesta más. La inercia sustituye al impulso y todo se siente cuesta arriba.',
    Svg: AvanceSVG,
    flip: false,
  },
  {
    title: 'Roles sin definir',
    desc: 'Todo el mundo hace de todo, pero nadie tiene claro qué le corresponde. Las decisiones se acumulan.',
    Svg: RolesSVG,
    flip: false,
  },
  {
    title: 'Cambios que se posponen',
    desc: 'Se evitan los mismos cambios. Se sigue haciendo lo mismo porque siempre se ha hecho así.',
    Svg: PospuestosSVG,
    flip: true,
  },
  {
    title: 'Modo reactivo permanente',
    desc: 'El día a día manda. Y sin darte cuenta, la empresa ocupa todo tu tiempo, energía y cabeza apagando fuegos.',
    Svg: ReactivoSVG,
    flip: true,
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
  { title: 'Empresas en crecimiento', sub: 'Que necesitan estructura firme para escalar sin caer en el caos organizativo.' },
  { title: 'Cambio generacional', sub: 'Transiciones familiares o de liderazgo que requieren orden y claridad de roles desde el primer día.' },
  { title: 'Transformación digital', sub: 'Procesos operativos que deben evolucionar hacia lo digital sin que el equipo se quede atrás.' },
  { title: 'Cambio cultural', sub: 'Organizaciones que quieren renovar su forma de trabajar y comunicarse internamente.' },
  { title: 'Equipos que crecieron rápido', sub: 'Equipos que escalaron muy rápido sin una base clara desde la que sostenerse.' },
  { title: 'CEOs que quieren soltar', sub: 'Líderes y fundadores que ya no quieren ni deben participar en la microgestión diaria.' },
]

const ENFOQUE_PILLS = [
  'Diagnóstico real',
  'Sin dependencias externas',
  'Cambio sostenible',
  'Desde las raíces',
]

export const revalidate = 300

export default async function Home() {
  const supabase = await createClient()
  const { data: latestPostsData } = await supabase
    .from('blog_posts')
    .select('slug, titulo, extracto, imagen_portada, imagen_portada_alt, fecha_publicacion, tiempo_lectura, categoria:blog_categorias(slug, nombre)')
    .eq('estado', 'publicado')
    .is('deleted_at', null)
    .order('fecha_publicacion', { ascending: false, nullsFirst: false })
    .limit(3)
  const latestPosts = (latestPostsData ?? []) as unknown as BlogCardData[]

  return (
    <main className="overflow-hidden bg-white">

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center bg-white pt-20">
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <Image
            src="/henkologo.png"
            alt="Henkoaching"
            width={720}
            height={500}
            className="object-contain mx-auto mb-7 w-[360px] h-auto"
            priority
          />

          <p className="font-roxborough italic text-2xl md:text-3xl text-gray-700 mb-3 leading-relaxed">
            Cuando una empresa crece o cambia,<br />
            el orden deja de ser opcional.
          </p>
          <p className="text-xs md:text-sm tracking-[0.22em] text-henko-turquoise font-semibold uppercase mb-10">
            coaching &amp; mindfulness empresarial
          </p>

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
            {SYMPTOMS.map((s, i) => {
              const Svg = s.Svg
              const text = (
                <div className="flex-1 p-8 md:p-9 bg-white">
                  <h3 className="font-roxborough text-xl md:text-2xl text-gray-900 mb-3 leading-tight">
                    {s.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {s.desc}
                  </p>
                </div>
              )
              const illus = (
                <div className="relative flex-shrink-0 bg-gray-50 overflow-hidden" style={{ flex: '0 0 45%' }}>
                  <Svg />
                </div>
              )
              return (
                <div
                  key={i}
                  data-animate="scale"
                  data-delay={i * 100}
                  className="bg-white rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row border border-henko-turquoise/15 shadow-sm hover:border-henko-turquoise/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 min-h-[220px]"
                >
                  {s.flip ? (<>{illus}{text}</>) : (<>{text}{illus}</>)}
                </div>
              )
            })}
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
                className="bg-white border border-henko-turquoise/15 rounded-[2.5rem] p-10 min-h-[260px] flex flex-col justify-between shadow-sm hover:border-henko-turquoise/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <p className="font-roxborough italic text-5xl leading-none mb-6 text-henko-turquoise/40">
                  {s.num}
                </p>
                <div>
                  <h3 className="font-roxborough text-xl md:text-2xl text-gray-900 mb-3">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-600">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-7 text-sm text-gray-500 italic leading-relaxed max-w-2xl">
            Puedes trabajar de forma específica en una sola área o integrar las tres disciplinas de manera transversal según la fase en la que se encuentre tu empresa.
          </p>
        </div>
      </section>

      {/* QUOTE */}
      <section className="relative py-28 md:py-32 px-6 md:px-12 bg-white border-y border-gray-100">
        <div data-animate className="max-w-3xl mx-auto text-center relative z-10">
          <p className="font-roxborough italic text-2xl md:text-4xl text-gray-900 leading-[1.35] mb-7">
            &ldquo;Cuando la mariposa toma alas,<br />
            no queda nada de la oruga&rdquo;
          </p>
          <div className="w-12 h-0.5 bg-henko-turquoise mx-auto mb-5" />
          <p className="text-xs text-gray-500 tracking-[0.14em]">JENNIFER CERVERA · HENKOACHING</p>
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
                className="bg-white border border-henko-turquoise/15 rounded-[2.5rem] p-9 min-h-[200px] shadow-sm hover:border-henko-turquoise/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <h3 className="font-roxborough text-lg md:text-xl text-gray-900 mb-3 leading-tight">{a.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{a.sub}</p>
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
            {ENFOQUE_PILLS.map((label, i) => (
              <div
                key={i}
                data-animate="scale"
                data-delay={i * 100}
                className="bg-white border border-henko-turquoise/15 rounded-[2rem] p-7 md:p-8 min-h-[140px] flex items-center justify-center text-center shadow-sm hover:border-henko-turquoise/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <p className="font-roxborough text-lg md:text-xl leading-snug text-gray-900">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-white py-28 md:py-32 px-6 md:px-12 text-center">
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="font-raleway font-bold text-henko-turquoise tracking-[0.18em] uppercase text-[11px] mb-4">¿Listo para el siguiente paso?</p>
          <h2 data-animate className="font-roxborough text-3xl md:text-4xl text-gray-900 mb-4 leading-tight">
            Si sientes que tu empresa podría<br />funcionar mejor...
          </h2>
          <p data-animate data-delay="100" className="font-roxborough italic text-xl md:text-2xl text-henko-turquoise mb-10">
            probablemente tengas razón.
          </p>
          <div data-animate data-delay="200" className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 bg-henko-turquoise text-white px-9 py-4 rounded-full text-[15px] font-semibold tracking-wide hover:bg-henko-turquoise-light hover:shadow-lg hover:shadow-henko-turquoise/30 transition-all duration-200"
            >
              Trabajar conmigo
            </Link>
            <Link
              href="/servicios"
              className="inline-flex items-center gap-2 bg-transparent border-2 border-henko-turquoise text-henko-turquoise px-9 py-4 rounded-full text-[15px] font-semibold tracking-wide hover:bg-henko-turquoise hover:text-white transition-all duration-200"
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
