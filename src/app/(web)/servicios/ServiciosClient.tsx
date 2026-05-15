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
    title: 'Consultoría de Operaciones',
    subtitle: 'Estructura y procesos que liberan tu tiempo',
    desc: 'Analizo la estructura actual de tu empresa, identifico cuellos de botella y diseño procesos claros y replicables. El objetivo: que tu negocio funcione con o sin ti presente.',
    points: ['Mapeo de procesos actuales', 'Diseño de flujos de trabajo', 'Implementación de herramientas de gestión', 'Métricas y seguimiento de resultados'],
  },
  {
    title: 'Reclutamiento Consciente',
    subtitle: 'El talento correcto, en el rol correcto',
    desc: 'Más allá del currículum. Proceso de selección alineado con la cultura, los valores y las necesidades reales de tu empresa. Personas que encajan y que se quedan.',
    points: ['Definición de perfiles por competencias', 'Entrevistas alineadas con cultura', 'Onboarding estructurado', 'Seguimiento a 3 y 6 meses'],
  },
  {
    title: 'Desarrollo de Liderazgo',
    subtitle: 'Líderes que inspiran, no que controlan',
    desc: 'Trabajo con líderes y equipos directivos para desarrollar un estilo de liderazgo consciente, basado en la confianza y la delegación efectiva.',
    points: ['Sesiones individuales de coaching', 'Talleres para equipos directivos', 'Herramientas de delegación', 'Mindfulness aplicado al liderazgo'],
  },
]

const STEPS: [string, string][] = [
  ['Diagnóstico', 'Analizamos juntos la situación actual y definimos objetivos claros.'],
  ['Diseño', 'Diseñamos el plan de acción personalizado para tu empresa.'],
  ['Implementación', 'Ponemos en marcha los cambios de forma progresiva y medida.'],
  ['Seguimiento', 'Revisión de resultados y ajustes para que el cambio sea duradero.'],
]

const FORMATOS = [
  { title: 'Sesiones individuales', desc: 'Para CEOs, directores y líderes de equipo. 1h semanales o quincenales.', tag: '1:1' },
  { title: 'Talleres de equipo',     desc: 'Formaciones presenciales o en remoto para grupos de hasta 15 personas.', tag: 'GRUPO' },
  { title: 'Proyecto integral',      desc: 'Acompañamiento completo a tu empresa durante 3-6 meses.', tag: 'EMPRESA' },
]

export default function ServiciosClient() {
  const [active, setActive] = useState<number | null>(null)

  return (
    <div className="bg-white pt-24 font-raleway">
      <PageHeader
        overline="Servicios"
        title="Lo que ofrezco"
        subtitle="Tres áreas de transformación que se complementan para llevar tu empresa al siguiente nivel."
      />

      {/* Acordeón de servicios */}
      <section className="px-6 md:px-12 pt-10 pb-20 max-w-7xl mx-auto">
        <div className="flex flex-col gap-5">
          {SERVICES.map((s, i) => (
            <ServiceRow key={i} s={s} i={i} open={active === i} toggle={() => setActive(active === i ? null : i)} />
          ))}
        </div>
      </section>

      {/* Metodología */}
      <section className="px-6 md:px-12 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <p className="font-raleway font-bold text-henko-turquoise tracking-[0.18em] uppercase text-[11px] mb-4">Metodología</p>
          <h2 className="font-roxborough text-2xl md:text-4xl text-gray-900 mb-13 leading-tight">¿Cómo trabajo?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
            {STEPS.map(([title, desc], i) => (
              <div key={title} className="bg-white rounded-[2rem] px-7 py-9 border border-henko-turquoise/15 shadow-sm hover:border-henko-turquoise/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <p className="font-roxborough text-4xl text-henko-turquoise mb-3">0{i + 1}</p>
                <h3 className="font-roxborough text-xl text-gray-900 mb-2.5">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formatos */}
      <section className="px-6 md:px-12 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <p className="font-raleway font-bold text-henko-turquoise tracking-[0.18em] uppercase text-[11px] mb-4">Formatos de trabajo</p>
          <h2 className="font-roxborough text-2xl md:text-4xl text-gray-900 mb-12 leading-tight">¿Cómo nos adaptamos?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FORMATOS.map((f) => (
              <div key={f.title} className="bg-white rounded-[2rem] p-9 border border-henko-turquoise/15 shadow-sm hover:border-henko-turquoise/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <span className="inline-block text-[11px] tracking-wider font-bold text-henko-turquoise bg-henko-turquoise/10 px-3 py-1 rounded-full mb-5">
                  {f.tag}
                </span>
                <h3 className="font-roxborough text-xl text-gray-900 mb-2.5">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-24 px-6 md:px-12 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="font-roxborough text-2xl md:text-3xl text-gray-900 mb-4">¿Por dónde empezamos?</h2>
          <p className="text-gray-600 mb-9 leading-relaxed">
            Primera consulta gratuita de 45 minutos. Sin compromiso.
          </p>
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 bg-henko-turquoise text-white px-9 py-4 rounded-full text-[15px] font-semibold hover:bg-henko-turquoise-light hover:shadow-lg hover:shadow-henko-turquoise/30 transition-all"
          >
            Reserva tu consulta gratuita
          </Link>
        </div>
      </section>
    </div>
  )
}

function ServiceRow({ s, i, open, toggle }: { s: Service; i: number; open: boolean; toggle: () => void }) {
  return (
    <div
      className={`bg-white border rounded-[2.5rem] overflow-hidden transition-all duration-300 ${
        open
          ? 'border-henko-turquoise/40 shadow-[0_16px_48px_rgba(31,143,155,0.12)]'
          : 'border-henko-turquoise/15 shadow-sm hover:border-henko-turquoise/40 hover:shadow-md hover:-translate-y-0.5'
      }`}
    >
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center justify-between px-8 md:px-12 py-7 text-left"
      >
        <div className="flex items-baseline gap-4">
          <p className="text-xs tracking-[0.14em] text-henko-turquoise font-semibold">0{i + 1}</p>
          <h3 className="font-roxborough text-xl md:text-2xl text-gray-900">{s.title}</h3>
        </div>
        <span
          className={`text-3xl transition-transform ${open ? 'rotate-45' : ''} text-henko-turquoise flex-shrink-0`}
          aria-hidden
        >
          +
        </span>
      </button>
      {open && (
        <div className="px-8 md:px-12 pb-8 grid grid-cols-1 md:grid-cols-2 gap-8 pt-0">
          <div>
            <p className="font-roxborough italic text-base md:text-lg mb-3 text-henko-turquoise">{s.subtitle}</p>
            <p className="text-sm md:text-[14.5px] leading-[1.75] text-gray-600">{s.desc}</p>
          </div>
          <ul className="list-none p-0 md:pl-4">
            {s.points.map((p) => (
              <li key={p} className="flex items-start gap-3 mb-3">
                <span className="w-5 h-5 rounded-full bg-henko-turquoise/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-henko-turquoise" />
                </span>
                <span className="text-sm leading-relaxed text-gray-700">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
