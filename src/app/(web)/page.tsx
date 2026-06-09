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
      <section className="relative min-h-screen flex items-center justify-center bg-white pt-20 overflow-hidden">
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
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="block w-8 h-px bg-henko-turquoise/40" />
            <p className="text-[11px] md:text-xs tracking-[0.22em] text-henko-turquoise font-semibold uppercase">
              orden · liderazgo · equipos
            </p>
            <span className="block w-8 h-px bg-henko-turquoise/40" />
          </div>

          <p className="text-base md:text-[15px] leading-relaxed text-gray-500 mb-12 max-w-xl mx-auto">
            Ayudamos a CEOs y empresas en crecimiento a crear orden, claridad y estructura para liderar con calma y construir equipos más conscientes.
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
      <section className="bg-[#f4f6f7] py-24 md:py-28 px-6 md:px-12 border-t border-b border-gray-100">
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
                className="group relative bg-white rounded-[2.5rem] p-9 md:p-10 border border-henko-turquoise/25 shadow-sm hover:border-henko-turquoise/50 hover:shadow-[0_16px_48px_rgba(31,143,155,0.10)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-4 right-4 font-roxborough italic text-[7rem] leading-none text-henko-turquoise/[0.08] group-hover:text-henko-turquoise/[0.13] transition-colors duration-300 select-none"
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
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contacto"
                className="inline-flex items-center gap-2 bg-henko-turquoise text-white px-7 py-3.5 rounded-full text-sm font-semibold tracking-wide hover:bg-henko-turquoise-light hover:shadow-lg transition-all duration-200 whitespace-nowrap"
              >
                Trabaja conmigo
              </Link>
              <Link
                href="/servicios"
                className="inline-flex items-center gap-2 bg-transparent border-2 border-henko-turquoise text-henko-turquoise px-7 py-3.5 rounded-full text-sm font-semibold tracking-wide hover:bg-henko-turquoise hover:text-white transition-all duration-200 whitespace-nowrap"
              >
                Ver más
              </Link>
            </div>
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

          <p className="mt-7 text-sm text-gray-500 italic leading-relaxed max-w-2xl">
            Puedes trabajar de forma específica en una sola área o integrar las tres disciplinas de manera transversal según la fase en la que se encuentre tu empresa.
          </p>
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
