import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Trabaja conmigo — Henkoaching',
  description: 'Orden, claridad y equipos alineados para que la empresa funcione sin depender de una sola persona.',
}

const areas = [
  {
    num: '01',
    color: 'bg-henko-turquoise',
    title: 'Orden y estructura',
    desc: 'Procesos claros, roles definidos y una operativa que funciona.',
  },
  {
    num: '02',
    color: 'bg-henko-purple',
    title: 'Reclutamiento consciente',
    desc: 'Personas que encajan, aportan y sostienen la cultura de la empresa.',
  },
  {
    num: '03',
    color: 'bg-henko-coral',
    title: 'Liderazgo y desarrollo',
    desc: 'Equipos más conscientes, mejor comunicación y liderazgo que realmente sostiene.',
  },
]

const steps = [
  {
    num: '01',
    title: 'Analizar',
    desc: 'Entender cómo funciona tu empresa y qué está generando fricción.',
  },
  {
    num: '02',
    title: 'Estructurar',
    desc: 'Definir procesos, roles y comunicación de forma clara.',
  },
  {
    num: '03',
    title: 'Implementar',
    desc: 'Llevarlo al día a día, ajustar y acompañar al equipo.',
  },
  {
    num: '04',
    title: 'Integrar',
    desc: 'Que el cambio se mantenga en el tiempo y no dependa de nadie externo.',
  },
]

const results = [
  'Procesos más claros y ordenados',
  'Equipos alineados y con responsabilidad',
  'Menos carga para el CEO',
  'Mejor comunicación y menos fricción',
  'Más foco, claridad y estabilidad',
]

export default function TrabajaConmigoPage() {
  return (
    <main className="pt-24">

      {/* ═══ SECCIÓN 1 — INTRO ═══ */}
      <section className="bg-henko-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl">
            <p className="section-title text-sm mb-4">Trabaja conmigo</p>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Cómo puedo ayudarte a que tu empresa funcione mejor
            </h1>
            <p className="text-xl text-gray-500 font-raleway max-w-xl leading-relaxed mb-10">
              Orden, claridad y equipos alineados para que la empresa funcione sin depender de una sola persona.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contacto" className="btn-primary text-center">
                Trabajar conmigo
              </Link>
              <Link href="#como-trabajamos" className="btn-outline text-center">
                Ver cómo trabajar juntos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECCIÓN 2 — ÁREAS DE TRABAJO ═══ */}
      <section className="bg-henko-greenblue/15 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="section-title text-sm mb-3">Áreas de trabajo</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Puedes trabajar una parte concreta<br />o todo de forma integrada
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {areas.map((area) => (
              <div key={area.num} className="bg-henko-white p-8 border border-gray-100 hover:shadow-md transition-shadow duration-200">
                <span className={`inline-block ${area.color} text-white font-raleway text-xs font-bold tracking-widest px-3 py-1 mb-6`}>
                  {area.num}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {area.title}
                </h3>
                <p className="text-gray-500 font-raleway text-sm leading-relaxed">{area.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-400 font-raleway text-sm mt-10 italic">
            Puedes trabajar una sola área o integrarlas según lo que tu empresa necesite.
          </p>
        </div>
      </section>

      {/* ═══ SECCIÓN 3 — CÓMO TRABAJAMOS ═══ */}
      <section id="como-trabajamos" className="bg-henko-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="section-title text-sm mb-3">El proceso</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Un proceso claro, adaptado a cada empresa
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            {steps.map((step, i) => (
              <div key={step.num} className="relative flex gap-8">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-henko-turquoise text-white flex items-center justify-center font-raleway text-xs font-bold flex-shrink-0 z-10">
                    {step.num}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-0.5 bg-henko-greenblue flex-grow my-1" style={{ minHeight: '48px' }} />
                  )}
                </div>
                <div className="pb-12">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 font-raleway text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECCIÓN 4 — QUÉ SE CONSIGUE ═══ */}
      <section className="bg-henko-turquoise py-24 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="font-raleway uppercase tracking-widest text-sm text-white/60 mb-3">Resultados</p>
            <h2 className="text-3xl md:text-4xl font-bold">
              Lo que empieza a cambiar
            </h2>
          </div>

          <div className="max-w-2xl mx-auto space-y-4">
            {results.map((item) => (
              <div key={item} className="flex items-center gap-5 border border-white/20 px-6 py-4">
                <span className="w-2 h-2 rounded-full bg-henko-yellow flex-shrink-0" />
                <span className="font-raleway text-white/90 text-base">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECCIÓN 5 — DIFERENCIAL ═══ */}
      <section className="bg-henko-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="section-title text-sm mb-3">Lo que me diferencia</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                El cambio no es solo organizativo.<br />Es también personal.
              </h2>
              <div className="space-y-5 text-gray-500 font-raleway text-base leading-relaxed">
                <p>
                  Trabajo con la estructura de la empresa, pero también con cómo piensan, se comunican y actúan las personas dentro de ella.
                </p>
                <p>
                  Porque muchas veces el problema no es solo operativo: es la forma de liderar, de reaccionar, de comunicarse o de sostener el cambio.
                </p>
                <p>
                  Por eso, además de ordenar procesos y equipos, introduzco herramientas que ayudan a parar, observar y actuar con más claridad.
                </p>
                <p>
                  En algunos casos esto incluye dinámicas de coaching, espacios de reflexión o prácticas como la meditación, siempre adaptadas al contexto empresarial.
                </p>
              </div>
              <p className="text-henko-turquoise font-raleway font-semibold mt-8">
                Porque sin ese cambio interno, el cambio externo no se sostiene.
              </p>
            </div>

            {/* Visual */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="w-full aspect-square bg-henko-greenblue/30" />
                <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-henko-yellow/50" />
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-henko-turquoise/20" />
                <div className="absolute inset-0 flex items-center justify-center p-10">
                  <blockquote className="text-center">
                    <p className="text-2xl text-henko-turquoise leading-relaxed">
                      "Sin el cambio interno, el cambio externo no se sostiene."
                    </p>
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECCIÓN 6 — CTA FINAL ═══ */}
      <section className="bg-henko-yellow/30 py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-10">
            Podemos trabajar una sola área o integrar todo el proceso según lo que tu empresa necesite.
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contacto" className="btn-primary">
              Trabajar conmigo
            </Link>
            <Link href="#como-trabajamos" className="btn-outline">
              Ver cómo trabajar juntos
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
