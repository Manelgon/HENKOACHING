import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Servicios — Henkoaching',
  description: 'Operaciones, reclutamiento consciente y liderazgo. Tres líneas de trabajo para acompañar tu empresa en momentos clave.',
}

const services = [
  {
    id: 'operaciones',
    num: '01',
    color: 'bg-henko-turquoise',
    accentBg: 'bg-henko-greenblue/20',
    title: 'Operaciones',
    subtitle: 'Orden y estructura que funcionan',
    intro: 'Cuando la empresa crece, los procesos que antes servían dejan de escalar. Aparece el caos: duplicidades, decisiones sin dueño, tareas que caen entre sillas.',
    what: [
      'Análisis de procesos actuales',
      'Definición de roles y responsabilidades',
      'Diseño de flujos operativos claros',
      'Implementación por fases con el equipo',
      'Indicadores para mantener el orden',
    ],
    result: 'Una empresa que funciona con claridad, donde cada persona sabe qué hace y por qué.',
  },
  {
    id: 'reclutamiento',
    num: '02',
    color: 'bg-henko-purple',
    accentBg: 'bg-henko-purple/10',
    title: 'Reclutamiento consciente',
    subtitle: 'Las personas adecuadas en el lugar adecuado',
    intro: 'Contratar rápido y mal es más caro que hacerlo bien desde el principio. El reclutamiento consciente busca más allá del CV: busca encaje real con la cultura y el momento de la empresa.',
    what: [
      'Definición del perfil real que necesitas',
      'Proceso de selección estructurado',
      'Evaluación de competencias y valores',
      'Acompañamiento en la toma de decisión',
      'Onboarding para una integración sólida',
    ],
    result: 'Personas que aportan, encajan y se quedan. Equipos que se sostienen solos.',
  },
  {
    id: 'liderazgo',
    num: '03',
    color: 'bg-henko-coral',
    accentBg: 'bg-henko-coral/10',
    title: 'Liderazgo y desarrollo',
    subtitle: 'El liderazgo que sostiene el cambio',
    intro: 'El orden en los procesos no es suficiente si el liderazgo no acompaña. Los equipos funcionan cuando quien lidera es consciente, se comunica con claridad y sabe soltar el control.',
    what: [
      'Coaching individual para líderes',
      'Trabajo en comunicación y delegación',
      'Dinámicas de equipo y cohesión',
      'Mindfulness aplicado al liderazgo',
      'Acompañamiento en situaciones de cambio',
    ],
    result: 'Líderes que lideran de verdad. Equipos que trabajan mejor juntos.',
  },
]

export default function ServiciosPage() {
  return (
    <main className="pt-24">

      {/* Hero */}
      <section className="bg-henko-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <p className="section-title text-sm mb-4">Lo que hago</p>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Servicios
          </h1>
          <p className="text-xl text-gray-500 font-raleway max-w-2xl leading-relaxed">
            Tres áreas de trabajo para acompañar a tu empresa en los momentos que más importan.
            Puedes trabajar una sola o integrarlas según lo que necesites.
          </p>
        </div>
      </section>

      {/* Servicios */}
      {services.map((service, i) => (
        <section
          key={service.id}
          className={`py-24 ${i % 2 === 0 ? 'bg-henko-white' : 'bg-gray-50'}`}
        >
          <div className="max-w-6xl mx-auto px-6">
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-start ${i % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>

              {/* Content */}
              <div className={i % 2 !== 0 ? 'lg:order-2' : ''}>
                <span className={`inline-block ${service.color} text-white font-raleway text-xs font-bold tracking-widest px-3 py-1 mb-6`}>
                  {service.num}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Roxborough CF, Georgia, serif' }}>
                  {service.title}
                </h2>
                <p className="text-henko-turquoise font-raleway font-semibold mb-6">{service.subtitle}</p>
                <p className="text-gray-500 font-raleway leading-relaxed mb-8">{service.intro}</p>

                <h3 className="text-sm font-raleway uppercase tracking-widest font-semibold text-gray-400 mb-4">
                  En qué consiste
                </h3>
                <ul className="space-y-3 mb-8">
                  {service.what.map((item) => (
                    <li key={item} className="flex items-start gap-3 font-raleway text-gray-600 text-sm">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-henko-turquoise flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Result card */}
              <div className={i % 2 !== 0 ? 'lg:order-1' : ''}>
                <div className={`${service.accentBg} p-10 h-full flex flex-col justify-center`}>
                  <p className="text-xs font-raleway uppercase tracking-widest font-semibold text-gray-400 mb-4">
                    Resultado
                  </p>
                  <p className="text-xl md:text-2xl text-gray-800 leading-relaxed" style={{ fontFamily: 'Roxborough CF, Georgia, serif' }}>
                    {service.result}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Opción integral */}
      <section className="bg-henko-turquoise py-20 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="font-raleway uppercase tracking-widest text-sm text-white/60 mb-4">Para quien lo necesita todo</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ fontFamily: 'Roxborough CF, Georgia, serif' }}>
            Acompañamiento integral
          </h2>
          <p className="text-white/80 font-raleway text-lg leading-relaxed mb-10">
            Cuando la empresa necesita un cambio de fondo: estructura, personas y liderazgo
            trabajando al mismo tiempo. Un proceso más profundo, pensado para organizaciones
            que quieren transformarse de verdad.
          </p>
          <Link href="/trabaja-conmigo" className="inline-block border-2 border-white text-white px-8 py-3 font-raleway font-semibold tracking-wide uppercase text-sm hover:bg-white hover:text-henko-turquoise transition-all duration-200">
            Hablemos de tu empresa
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-henko-white py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-gray-400 font-raleway text-sm mb-4">¿No sabes por dónde empezar?</p>
          <h2 className="text-2xl text-gray-900 font-bold mb-6" style={{ fontFamily: 'Roxborough CF, Georgia, serif' }}>
            Lo descubrimos juntos en una primera conversación.
          </h2>
          <Link href="/contacto" className="btn-primary inline-block">
            Escribir ahora
          </Link>
        </div>
      </section>

    </main>
  )
}
