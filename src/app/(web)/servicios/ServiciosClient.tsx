'use client'

import { useState } from 'react'
import Link from 'next/link'
import PageHeader from '@/components/PageHeader'

type Service = {
  title: string
  subtitle: string
  desc: string
  points: string[]
}

const SERVICES: Service[] = [
  {
    title: 'Orden y Estructura',
    subtitle: 'Estructura y procesos que liberan tu tiempo',
    desc: 'Analizo la estructura actual de tu empresa, identifico cuellos de botella y juntos diseñamos procesos claros teniendo en cuenta la operativa, cultura y estrategia de tu empresa.',
    points: ['Mapeo de procesos actuales', 'Diseño de flujos de trabajo', 'Implementación de herramientas de gestión'],
  },
  {
    title: 'Reclutamiento Consciente',
    subtitle: 'La persona correcta en el lugar correcto',
    desc: 'Proceso de selección más allá del currículum. Me encargo de buscar un match entre empresa y talento para crear relaciones más alineadas y que encajan con las necesidades no solo de la empresa sino también del trabajador.',
    points: ['Definición de perfiles a nivel técnico y humano', 'Proceso de selección personalizado y detallado', 'Seguimiento antes, durante y después del proceso', 'Entrevistas a conciencia con la empresa y los candidatos'],
  },
  {
    title: 'Desarrollo Organizacional y Liderazgo',
    subtitle: 'Líderes que inspiran, no que controlan',
    desc: 'Trabajo con líderes y equipos directivos para desarrollar un estilo de liderazgo consciente, basado en la confianza y la delegación efectiva.',
    points: ['Sesiones individuales de coaching', 'Talleres para equipos directivos', 'Mindfulness aplicado al liderazgo'],
  },
]

const AUDIENCE = [
  { title: 'Empresas en crecimiento',    sub: 'Necesitan estructura para escalar sin caer en el caos organizativo.' },
  { title: 'Cambio generacional',         sub: 'Transiciones de liderazgo que requieren orden y claridad de roles.' },
  { title: 'Transformación digital',      sub: 'Procesos que deben evolucionar hacia lo digital sin perder al equipo.' },
  { title: 'Cambio cultural',             sub: 'Quieren renovar su forma de trabajar y comunicarse internamente.' },
  { title: 'Equipos que crecieron rápido', sub: 'Escalaron muy rápido y necesitan una base sólida desde la que sostenerse.' },
  { title: 'CEOs que quieren soltar',      sub: 'Ya no quieren ni deben participar en la microgestión diaria.' },
]

const STEPS: [string, string][] = [
  ['Diagnóstico', 'Analizamos juntos la situación actual y definimos objetivos claros.'],
  ['Diseño', 'Diseñamos el plan de acción personalizado para tu empresa.'],
  ['Implementación', 'Ponemos en marcha los cambios de forma progresiva y medida.'],
  ['Seguimiento', 'Revisión de resultados y ajustes para que el cambio sea duradero.'],
]

const FORMATOS_ITEMS = [
  'Seguimiento operativo semanal',
  'Sesiones individuales',
  'Reuniones con jefes de departamentos',
  'Formaciones grupales',
]

const FAQS: { q: string; a: string }[] = [
  {
    q: '¿Cómo puedo liberar tiempo como CEO o fundador sin que la empresa deje de funcionar?',
    a: 'Trabajando la consultoría de operaciones: revisar procesos, delegar con claridad y construir una estructura que no dependa de ti para sostenerse. En Henkoaching acompaño a CEOs y fundadores a salir del día a día operativo en 3-6 meses, identificando cuellos de botella reales y diseñando sistemas que liberen tu agenda sin perder control.',
  },
  {
    q: '¿Qué es el reclutamiento consciente y en qué se diferencia de un proceso de selección tradicional?',
    a: 'El reclutamiento consciente evalúa fit cultural, motivación real y valores antes que el currículum. En vez de cubrir una vacante rápido, se define con precisión el rol, el tipo de persona que encajará con tu equipo y se acompaña la incorporación. Esto reduce rotación, errores de contratación caros y conflictos internos en los primeros meses.',
  },
  {
    q: '¿Cómo formar líderes que inspiren a su equipo en lugar de controlarlo?',
    a: 'Con un programa de desarrollo de liderazgo centrado en autoconocimiento, comunicación no violenta, gestión emocional y delegación efectiva. Se trabaja en sesiones 1:1 semanales o quincenales con directivos y mandos intermedios, complementadas con talleres de equipo para alinear el estilo de liderazgo con la cultura de la empresa.',
  },
  {
    q: '¿Cuánto cuesta y cuánto dura un acompañamiento de coaching empresarial?',
    a: 'Hay tres modalidades: sesiones 1:1 (CEOs y líderes, 1 hora semanal o quincenal), talleres de equipo (grupos de hasta 15 personas, presencial o remoto) y proyecto integral (acompañamiento completo a la empresa durante 3-6 meses). El precio se ajusta al alcance tras una primera llamada gratuita de diagnóstico de 20 minutos.',
  },
  {
    q: '¿Funciona el coaching en remoto o tiene que ser presencial?',
    a: 'Funciona en ambos formatos. Las sesiones 1:1 y la mayoría de talleres se hacen en remoto por videollamada con la misma efectividad que presencial. Para proyectos integrales de transformación cultural o intervenciones en equipos con conflicto, recomiendo combinar sesiones online con jornadas presenciales puntuales.',
  },
  {
    q: '¿Cuándo es el momento adecuado para contratar a un coach de operaciones y liderazgo?',
    a: 'Cuando aparecen señales claras: el fundador es cuello de botella de todo, el equipo crece más rápido que los procesos, hay rotación frecuente, decisiones que se atascan o líderes recién promovidos sin formación. Cuanto antes se interviene, más barato y rápido es el cambio: esperar a la crisis multiplica el coste.',
  },
]

export default function ServiciosClient() {
  const [active, setActive] = useState<number | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <div className="pt-24 font-raleway">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <PageHeader
        overline="Trabaja conmigo"
        title={
          <>
            Tres áreas que<br />
            <em className="italic text-henko-turquoise font-light">se complementan</em>
          </>
        }
        subtitle="Operaciones, talento y liderazgo. Trabaja una sola disciplina o intégralas según la fase en la que se encuentre tu empresa."
      />

      {/* Acordeón de servicios */}
      <section className="px-6 md:px-12 pb-20 max-w-7xl mx-auto">
        <div className="flex flex-col gap-5">
          {SERVICES.map((s, i) => (
            <div key={i} data-animate data-delay={i * 100}>
              <ServiceRow s={s} i={i} open={active === i} toggle={() => setActive(active === i ? null : i)} />
            </div>
          ))}
        </div>
      </section>

      {/* Para quién */}
      <section className="px-6 md:px-12 py-20 hairline-t">
        <div className="max-w-7xl mx-auto">

          <p data-animate className="font-raleway font-semibold uppercase text-overline text-henko-turquoise mb-5 flex items-center gap-3">
            <span className="inline-block w-8 h-px bg-current opacity-60" aria-hidden="true" />
            Para quién
          </p>
          <h2 data-animate data-delay="100" className="font-roxborough font-bold text-display-lg text-henko-ink mb-12">
            Empresas en <em className="italic text-henko-turquoise font-light">momentos clave</em>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
            {[AUDIENCE.slice(0, 3), AUDIENCE.slice(3)].map((col, ci) => (
              <div key={ci} data-stagger className="divide-y divide-henko-hairline">
                {col.map((a, i) => (
                  <div key={i} className="flex gap-4 py-6">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full border border-henko-turquoise/40 bg-henko-turquoise/10 flex items-center justify-center mt-0.5">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L4.8 9L10 3" stroke="#1f8f9b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-roxborough font-bold text-lg text-henko-ink mb-1 leading-snug">{a.title}</p>
                      <p className="font-raleway text-[14px] text-henko-ink-soft leading-[1.7]">{a.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Link
              data-animate
              href="/contacto"
              className="inline-flex items-center gap-2 bg-henko-turquoise text-white px-7 py-3.5 rounded-full text-[14.5px] font-semibold hover:bg-henko-turquoise-light hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-12px_rgba(12,82,81,0.55)] transition-all duration-200"
            >
              Agenda una llamada →
            </Link>
          </div>

        </div>
      </section>

      {/* Metodología */}
      <section className="px-6 md:px-12 py-20 hairline-t">
        <div className="max-w-7xl mx-auto">
          <p data-animate className="font-raleway font-semibold uppercase text-overline text-henko-turquoise mb-5 flex items-center gap-3">
            <span className="inline-block w-8 h-px bg-current opacity-60" aria-hidden="true" />
            Metodología
          </p>
          <h2 data-animate data-delay="100" className="font-roxborough font-bold text-display-lg text-henko-ink">¿Cómo trabajo?</h2>
          <div data-stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
            {STEPS.map(([title, desc], i) => (
              <div
                key={title}
                className="group relative bg-henko-card rounded-[2rem] p-8 md:p-9 border border-henko-hairline shadow-soft hover:shadow-lift hover:-translate-y-1 transition-all duration-300 ease-out-expo overflow-hidden min-h-[220px]"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-4 -right-2 font-roxborough italic text-[6.5rem] leading-none text-henko-turquoise/[0.07] group-hover:text-henko-turquoise/[0.12] transition-colors duration-300 select-none"
                >
                  0{i + 1}
                </span>

                <div className="relative flex items-center gap-3 mb-5">
                  <span className="block w-8 h-px bg-henko-turquoise" />
                  <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-henko-turquoise">
                    Fase 0{i + 1}
                  </span>
                </div>

                <h3 className="relative font-roxborough text-xl md:text-[22px] text-henko-ink mb-2.5 leading-tight">{title}</h3>
                <p className="relative text-[14px] text-henko-ink-soft leading-[1.7]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo nos adaptamos */}
      <section className="px-6 md:px-12 py-20 hairline-t">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-16 items-start">
          <div>
            <p data-animate className="font-raleway font-semibold uppercase text-overline text-henko-turquoise mb-5 flex items-center gap-3">
              <span className="inline-block w-8 h-px bg-current opacity-60" aria-hidden="true" />
              Cómo nos adaptamos
            </p>
            <h2 data-animate data-delay="100" className="font-roxborough font-bold text-display-lg text-henko-ink mb-6">¿Cómo nos adaptamos?</h2>
            <p data-animate data-delay="200" className="text-base md:text-[15px] leading-[1.85] text-henko-ink-soft mb-8">
              En función del servicio que necesites y del caso concreto de tu empresa, adaptamos el tiempo online y/o presencial para conseguir el objetivo planteado. Puede ser:
            </p>
            <Link data-animate data-delay="300" href="/contacto" className="inline-flex items-center gap-2 bg-henko-turquoise text-white px-7 py-3 rounded-full text-sm font-semibold tracking-wide hover:bg-henko-turquoise/90 transition-all duration-200">
              Hablemos →
            </Link>
          </div>
          <div data-stagger className="divide-y divide-henko-hairline">
            {FORMATOS_ITEMS.map((item, i) => (
              <div key={i} className="flex items-center gap-4 py-5">
                <div className="flex-shrink-0 w-7 h-7 rounded-full border border-henko-turquoise/40 bg-henko-turquoise/10 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L4.8 9L10 3" stroke="#1f8f9b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="font-raleway text-[15px] text-henko-ink">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 md:px-12 py-20 hairline-t">
        <div className="max-w-4xl mx-auto">
          <p data-animate className="font-raleway font-semibold uppercase text-overline text-henko-turquoise mb-5 flex items-center gap-3">
            <span className="inline-block w-8 h-px bg-current opacity-60" aria-hidden="true" />
            Preguntas frecuentes
          </p>
          <h2 data-animate data-delay="100" className="font-roxborough font-bold text-display-lg text-henko-ink mb-12">¿Tienes dudas antes de empezar?</h2>

          <div className="flex flex-col gap-4">
            {FAQS.map((f, i) => {
              const open = openFaq === i
              return (
                <div
                  key={f.q}
                  className={`bg-henko-card border rounded-[2rem] overflow-hidden transition-all duration-300 ${
                    open
                      ? 'border-henko-turquoise/40 shadow-lift'
                      : 'border-henko-hairline shadow-soft hover:border-henko-turquoise/40 hover:shadow-lift'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="w-full flex items-center justify-between gap-6 px-7 md:px-10 py-6 text-left"
                    aria-expanded={open}
                  >
                    <h3 className="font-roxborough text-base md:text-lg text-henko-ink leading-snug">{f.q}</h3>
                    <span
                      className={`text-2xl transition-transform ${open ? 'rotate-45' : ''} text-henko-turquoise flex-shrink-0`}
                      aria-hidden
                    >
                      +
                    </span>
                  </button>
                  {open && (
                    <div className="px-7 md:px-10 pb-7">
                      <p className="text-sm md:text-[14.5px] leading-[1.75] text-henko-ink-soft">{f.a}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 bg-transparent border-2 border-henko-turquoise text-henko-turquoise px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide hover:bg-henko-turquoise hover:text-white transition-all duration-200"
            >
              Cuéntame tu caso →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-henko-paper-deep hairline-t py-24 md:py-28 px-6 md:px-12 text-center overflow-hidden">
        <span
          aria-hidden
          className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 font-roxborough italic text-[18rem] md:text-[22rem] leading-none text-henko-ink/[0.04] select-none"
        >
          &mdash;
        </span>

        <div className="relative z-10 max-w-2xl mx-auto">
          <p data-animate className="font-raleway font-semibold uppercase text-overline text-henko-turquoise mb-6 flex items-center justify-center gap-3">
            <span className="inline-block w-8 h-px bg-current opacity-60" aria-hidden="true" />
            Primer paso
            <span className="inline-block w-8 h-px bg-current opacity-60" aria-hidden="true" />
          </p>
          <h2 data-animate data-delay="100" className="font-roxborough text-3xl md:text-5xl text-henko-ink mb-4 leading-[1.15]">
            ¿Por dónde <em className="italic font-light text-henko-turquoise">empezamos?</em>
          </h2>
          <p data-animate data-delay="200" className="font-roxborough italic text-lg md:text-xl text-henko-ink-soft mb-10">
            Primera consulta gratuita de 20 minutos. Sin compromiso.
          </p>
          <Link
            data-animate
            data-delay="300"
            href="/contacto"
            className="inline-flex items-center gap-2 bg-henko-turquoise text-white px-9 py-4 rounded-full text-[15px] font-semibold tracking-wide hover:bg-henko-turquoise-light hover:shadow-lift hover:-translate-y-0.5 transition-all duration-300"
          >
            Reserva tu consulta gratuita →
          </Link>
        </div>
      </section>
    </div>
  )
}

function ServiceRow({ s, i, open, toggle }: { s: Service; i: number; open: boolean; toggle: () => void }) {
  return (
    <div
      className={`group relative bg-henko-card border rounded-[2.5rem] overflow-hidden transition-all duration-300 ${
        open
          ? 'border-henko-turquoise/40 shadow-lift'
          : 'border-henko-hairline shadow-soft hover:border-henko-turquoise/40 hover:shadow-lift hover:-translate-y-1'
      }`}
    >
      <span
        aria-hidden
        className={`pointer-events-none absolute -top-6 right-6 font-roxborough italic text-[8rem] leading-none select-none transition-colors duration-300 ${
          open ? 'text-henko-turquoise/[0.14]' : 'text-henko-turquoise/[0.07] group-hover:text-henko-turquoise/[0.12]'
        }`}
      >
        0{i + 1}
      </span>

      <button
        type="button"
        onClick={toggle}
        className="relative w-full flex items-center justify-between gap-6 px-8 md:px-12 py-7 text-left"
      >
        <div className="flex items-center gap-4 min-w-0">
          <span className={`block h-px transition-all duration-300 ${open ? 'w-12 bg-henko-turquoise' : 'w-8 bg-henko-turquoise/60'}`} />
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-henko-turquoise mb-1">
              Servicio 0{i + 1}
            </p>
            <h3 className="font-roxborough text-xl md:text-2xl text-henko-ink leading-tight">{s.title}</h3>
          </div>
        </div>
        <span
          className={`text-3xl transition-transform duration-300 ${open ? 'rotate-45' : ''} text-henko-turquoise flex-shrink-0`}
          aria-hidden
        >
          +
        </span>
      </button>
      {open && (
        <div className="relative px-8 md:px-12 pb-8 grid grid-cols-1 md:grid-cols-2 gap-8 pt-0">
          <div>
            <p className="font-roxborough italic text-base md:text-lg mb-3 text-henko-turquoise">{s.subtitle}</p>
            <p className="text-sm md:text-[14.5px] leading-[1.75] text-henko-ink-soft">{s.desc}</p>
          </div>
          <ul className="list-none p-0 md:pl-4">
            {s.points.map((p) => (
              <li key={p} className="flex items-start gap-3 mb-3">
                <span className="w-5 h-5 rounded-full bg-henko-turquoise/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-henko-turquoise" />
                </span>
                <span className="text-sm leading-relaxed text-henko-ink">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
