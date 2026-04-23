'use client'

import { useState } from 'react'
import Link from 'next/link'
import PageHeader from '@/components/PageHeader'

type Service = {
  title: string
  subtitle: string
  desc: string
  points: string[]
  bgClass: string
  light?: boolean
}

const SERVICES: Service[] = [
  {
    title: 'Consultoría de Operaciones',
    subtitle: 'Estructura y procesos que liberan tu tiempo',
    desc: 'Analizo la estructura actual de tu empresa, identifico cuellos de botella y diseño procesos claros y replicables. El objetivo: que tu negocio funcione con o sin ti presente.',
    points: ['Mapeo de procesos actuales', 'Diseño de flujos de trabajo', 'Implementación de herramientas de gestión', 'Métricas y seguimiento de resultados'],
    bgClass: 'bg-henko-turquoise',
    light: true,
  },
  {
    title: 'Reclutamiento Consciente',
    subtitle: 'El talento correcto, en el rol correcto',
    desc: 'Más allá del currículum. Proceso de selección alineado con la cultura, los valores y las necesidades reales de tu empresa. Personas que encajan y que se quedan.',
    points: ['Definición de perfiles por competencias', 'Entrevistas alineadas con cultura', 'Onboarding estructurado', 'Seguimiento a 3 y 6 meses'],
    bgClass: 'bg-henko-greenblue',
  },
  {
    title: 'Desarrollo de Liderazgo',
    subtitle: 'Líderes que inspiran, no que controlan',
    desc: 'Trabajo con líderes y equipos directivos para desarrollar un estilo de liderazgo consciente, basado en la confianza y la delegación efectiva.',
    points: ['Sesiones individuales de coaching', 'Talleres para equipos directivos', 'Herramientas de delegación', 'Mindfulness aplicado al liderazgo'],
    bgClass: 'bg-henko-yellow',
  },
]

const STEPS: [string, string][] = [
  ['Diagnóstico', 'Analizamos juntos la situación actual y definimos objetivos claros.'],
  ['Diseño', 'Diseñamos el plan de acción personalizado para tu empresa.'],
  ['Implementación', 'Ponemos en marcha los cambios de forma progresiva y medida.'],
  ['Seguimiento', 'Revisión de resultados y ajustes para que el cambio sea duradero.'],
]

export default function ServiciosClient() {
  const [active, setActive] = useState<number | null>(null)

  return (
    <div className="bg-henko-white pt-24 font-raleway">
      <PageHeader
        overline="Servicios"
        title="Lo que ofrezco"
        subtitle="Tres áreas de transformación que se complementan para llevar tu empresa al siguiente nivel."
      />

      {/* Acordeón de servicios */}
      <section className="px-6 md:px-12 py-20 max-w-7xl mx-auto">
        <div className="flex flex-col gap-5">
          {SERVICES.map((s, i) => (
            <ServiceRow key={i} s={s} i={i} open={active === i} toggle={() => setActive(active === i ? null : i)} />
          ))}
        </div>
      </section>

      {/* Metodología */}
      <section className="px-6 md:px-12 py-20" style={{ background: '#f2ebe5' }}>
        <div className="max-w-7xl mx-auto">
          <p className="font-raleway font-bold text-henko-turquoise tracking-[0.18em] uppercase text-[11px] mb-4">Metodología</p>
          <h2 className="font-roxborough text-3xl md:text-5xl text-gray-900 mb-13 leading-tight">¿Cómo trabajo?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
            {STEPS.map(([title, desc], i) => (
              <div key={title} className="bg-white rounded-[2rem] px-7 py-9 border border-black/5">
                <p className="font-roxborough text-4xl text-henko-turquoise mb-3">0{i + 1}</p>
                <h3 className="font-roxborough text-xl text-gray-900 mb-2.5">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-henko-white py-24 px-6 md:px-12 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="font-roxborough text-3xl md:text-4xl text-gray-900 mb-4">¿Por dónde empezamos?</h2>
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
  const textColor = s.light ? 'text-white' : 'text-gray-900'
  const numColor = s.light ? 'text-white/60' : 'text-gray-600'
  const descColor = s.light ? 'text-white/80' : 'text-gray-600'
  const subColor = s.light ? 'text-white/85' : 'text-gray-800'
  const dotClass = s.light ? 'bg-white/30' : 'bg-henko-turquoise'

  return (
    <div className={`${s.bgClass} rounded-[2.5rem] overflow-hidden transition-shadow ${open ? 'shadow-[0_16px_48px_rgba(0,0,0,0.1)]' : ''}`}>
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center justify-between px-8 md:px-12 py-10 text-left"
      >
        <div>
          <p className={`text-xs tracking-[0.14em] mb-1.5 ${numColor}`}>0{i + 1}</p>
          <h3 className={`font-roxborough text-2xl md:text-3xl ${textColor}`}>{s.title}</h3>
        </div>
        <span
          className={`text-3xl transition-transform ${open ? 'rotate-45' : ''} ${textColor} opacity-70 flex-shrink-0`}
          aria-hidden
        >
          +
        </span>
      </button>
      {open && (
        <div className="px-8 md:px-12 pb-10 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <p className={`font-roxborough italic text-lg md:text-xl mb-4 ${subColor}`}>{s.subtitle}</p>
            <p className={`text-sm md:text-[14.5px] leading-[1.8] ${descColor}`}>{s.desc}</p>
          </div>
          <ul className="list-none p-0">
            {s.points.map((p) => (
              <li key={p} className="flex items-start gap-3 mb-3.5">
                <span className={`w-5 h-5 rounded-full ${dotClass} flex-shrink-0 mt-0.5`} />
                <span className={`text-sm leading-relaxed ${s.light ? 'text-white/85' : 'text-gray-700'}`}>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
