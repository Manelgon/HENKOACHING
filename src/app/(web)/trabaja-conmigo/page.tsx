import Image from "next/image"
import Link from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Trabaja Conmigo | Henkoaching",
  description: "Cómo puedo ayudarte a que tu empresa funcione mejor. Orden, claridad y equipos alineados para que la empresa funcione sin depender de una sola persona.",
}

export default function TrabajaConmigoPage() {
  return (
    <div className="bg-henko-white text-gray-900 selection:bg-henko-turquoise selection:text-white overflow-x-hidden pt-24 font-raleway">

      {/* Hero Section */}
      <section className="relative px-6 md:px-12 py-24 md:py-32 flex flex-col items-center text-center overflow-hidden">
        <span className="font-hey-gotcha text-7xl md:text-9xl text-henko-turquoise/10 absolute -top-10 left-1/2 -translate-x-1/2 select-none pointer-events-none">
          Henko
        </span>

        <div className="relative z-10 max-w-4xl">
          <span data-animate className="inline-block px-4 py-1 rounded-full bg-henko-greenblue/15 text-henko-turquoise font-semibold text-xs uppercase tracking-widest mb-6">
            Trabaja conmigo
          </span>
          <h1 data-animate data-delay="100" className="text-5xl md:text-7xl font-roxborough leading-tight mb-8">
            Cómo puedo ayudarte a que tu empresa funcione mejor
          </h1>
          <p data-animate data-delay="200" className="text-xl md:text-2xl text-gray-600 font-light mb-12 max-w-2xl mx-auto">
            Orden, claridad y equipos alineados para que la empresa funcione sin depender de una sola persona.
          </p>
          <div data-animate data-delay="300" className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/contacto" className="w-full sm:w-auto bg-gradient-to-br from-henko-turquoise to-henko-greenblue text-white px-10 py-5 rounded-xl font-bold shadow-lg hover:shadow-henko-turquoise/20 transition-all text-center">
              Trabajar conmigo
            </Link>
            <Link href="#proceso" className="w-full sm:w-auto px-10 py-5 rounded-xl font-semibold border border-gray-300 hover:bg-white/50 transition-all text-center">
              Ver cómo trabajar juntos
            </Link>
          </div>
        </div>

        <div data-animate data-delay="400" className="mt-20 w-full max-w-6xl aspect-[21/9] rounded-[3rem] overflow-hidden relative shadow-2xl">
          <Image
            alt="Interior de oficina moderna y elegante"
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"
            fill
            sizes="100vw"
            priority
          />
        </div>
      </section>

      {/* Áreas de Trabajo (Bento) */}
      <section className="px-6 md:px-12 py-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div data-animate="left" className="md:col-span-12 mb-12">
            <h2 className="text-4xl md:text-5xl font-roxborough mb-4">Áreas de Trabajo</h2>
            <div className="h-1 w-24 bg-henko-turquoise rounded-full"></div>
          </div>

          {/* Card 1 */}
          <div data-animate="left" className="md:col-span-8 group relative bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500 overflow-hidden">
            <span className="font-hey-gotcha text-[140px] absolute -right-4 -top-8 text-henko-turquoise/20 select-none">01</span>
            <div className="relative z-10 flex flex-col h-full justify-between min-h-[250px]">
              <div>
                <svg className="w-10 h-10 text-henko-turquoise mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="text-3xl font-roxborough mb-4">Orden y estructura</h3>
                <p className="text-gray-600 text-lg max-w-md leading-relaxed">
                  Procesos claros, roles definidos y una operativa que funciona de forma autónoma.
                </p>
              </div>
              <div className="mt-12 flex gap-2">
                <span className="px-4 py-1 rounded-full bg-gray-50 text-gray-600 text-xs font-medium">Sistemas</span>
                <span className="px-4 py-1 rounded-full bg-gray-50 text-gray-600 text-xs font-medium">Operativa</span>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div data-animate="right" className="md:col-span-4 group relative bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500 overflow-hidden">
            <span className="font-hey-gotcha text-[120px] absolute -right-6 -top-6 text-henko-purple/30 select-none">02</span>
            <div className="relative z-10 min-h-[250px]">
              <svg className="w-10 h-10 text-henko-purple mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-3xl font-roxborough mb-4">Reclutamiento consciente</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Personas que encajan, aportan y sostienen la cultura de la empresa desde el primer día.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div data-animate="scale" className="md:col-span-12 group relative bg-white p-12 rounded-[3rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2 relative">
              <span className="font-hey-gotcha text-[160px] absolute -left-10 -top-16 text-henko-coral/30 select-none">03</span>
              <svg className="w-10 h-10 text-henko-coral mb-6 relative z-10 block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="text-3xl font-roxborough mb-4 relative z-10">Liderazgo y desarrollo</h3>
              <p className="text-gray-600 text-lg leading-relaxed relative z-10">
                Equipos más conscientes, mejor comunicación y liderazgo que realmente sostiene el crecimiento.
              </p>
            </div>
            <div className="w-full md:w-1/2 h-64 rounded-[2rem] overflow-hidden relative">
              <Image
                alt="Equipo trabajando colaborativamente"
                className="w-full h-full object-cover"
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* El Proceso */}
      <section id="proceso" className="bg-gray-50 py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div data-animate className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-roxborough mb-6">El Proceso</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Un camino estructurado diseñado para transformar la realidad operativa de tu negocio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {/* Progress line for desktop */}
            <div className="hidden md:block absolute top-[5rem] left-0 w-full h-[1px] bg-gray-200 z-0"></div>

            {[
              { num: '01', title: 'Analizar', desc: 'Entender dónde estamos y detectar los cuellos de botella.', color: 'text-henko-turquoise' },
              { num: '02', title: 'Estructurar', desc: 'Definir procesos, roles y canales de comunicación.', color: 'text-henko-purple' },
              { num: '03', title: 'Implementar', desc: 'Poner en marcha las nuevas dinámicas con el equipo.', color: 'text-henko-coral' },
              { num: '04', title: 'Integrar', desc: 'Asegurar que los cambios perduran en el tiempo.', color: 'text-henko-yellow' },
            ].map((step, i) => (
              <div key={step.num} data-animate="scale" data-delay={i * 100} className="relative z-10 bg-white p-8 rounded-[2rem] shadow-sm hover:-translate-y-2 transition-transform duration-300">
                <span className={`font-hey-gotcha text-5xl mb-4 block ${step.color}`}>{step.num}</span>
                <h4 className="font-roxborough text-xl mb-3">{step.title}</h4>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resultados */}
      <section className="bg-henko-turquoise py-24 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 transform origin-top-right"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 relative z-10">

          <div data-animate="left" className="w-full md:w-1/2">
            <h2 className="text-4xl md:text-5xl font-roxborough text-white mb-8">El impacto en tu organización</h2>
            <p className="text-white/80 text-lg mb-12">
              Logramos una transformación que se siente en el día a día y se refleja en los números.
            </p>
            <ul className="space-y-6">
              {[
                "Procesos claros y documentados",
                "Equipos alineados con la visión",
                "Menos carga mental para el CEO",
                "Mejor comunicación interna",
                "Más foco en lo estratégico"
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-4 text-white group">
                  <span className="bg-white/10 p-2 rounded-full group-hover:scale-110 transition-transform flex items-center justify-center">
                    <svg className="w-5 h-5 text-henko-yellow" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="text-xl font-light">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div data-animate="right" className="w-full md:w-1/2">
            <div className="relative p-4">
              <div className="absolute inset-0 bg-henko-yellow rounded-[3rem] rotate-3"></div>
              <div className="relative bg-white p-8 md:p-12 rounded-[3rem] shadow-xl">
                <svg className="w-12 h-12 text-henko-turquoise mb-6 opacity-40" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-2xl font-roxborough italic text-gray-800 mb-8 leading-relaxed">
                  "Jennifer ha logrado que mi equipo no solo trabaje mejor, sino que entienda por qué lo hace. Ahora la empresa fluye sin que yo tenga que estar en cada detalle."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden relative">
                    <Image
                      alt="Avatar Cliente"
                      className="w-full h-full object-cover"
                      src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974&auto=format&fit=crop"
                      fill
                      sizes="48px"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">Andrés M.</p>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">CEO & Fundador</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Diferencial */}
      <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto overflow-visible">
        <div className="relative flex flex-col md:flex-row items-center gap-0">
          <div data-animate="left" className="w-full md:w-3/5 h-[500px] rounded-[3rem] overflow-hidden shadow-2xl relative z-0">
            <Image
              alt="Jennifer Cervera en ambiente profesional"
              className="w-full h-full object-cover"
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop"
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
            />
          </div>
          <div data-animate="right" className="w-full md:w-1/2 md:-ml-32 mt-[-60px] md:mt-0 relative z-10">
            <div className="bg-white p-12 md:p-16 rounded-[3rem] shadow-2xl border border-gray-100">
              <h2 className="text-4xl font-roxborough mb-8 leading-tight">
                El cambio no es solo organizativo. Es también personal.
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Acompaño a empresas que entienden que el crecimiento sostenible empieza por las personas. No entrego manuales de procesos que acaban en un cajón; implemento hábitos que transforman la cultura.
              </p>
              <p className="text-lg text-gray-600 mb-10 leading-relaxed italic border-l-4 border-henko-coral pl-6">
                "Mi enfoque une la eficiencia operativa con la consciencia humana, porque ninguna estructura se sostiene sin personas alineadas."
              </p>
              <div className="font-hey-gotcha text-4xl text-henko-turquoise transform -rotate-2">
                Jennifer Cervera
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-6 md:px-12 py-24 mb-12 max-w-5xl mx-auto text-center">
        <div data-animate className="bg-henko-greenblue/10 p-16 rounded-[3rem] relative overflow-hidden">
          <svg className="absolute -bottom-10 -left-10 w-[200px] h-[200px] text-henko-turquoise/5 select-none" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13.13 22.19l-1.63-3.83c1.56-.58 3.2-1.33 4.64-2.5 1.15-1.07 2.1-2.43 2.76-4.01l3.5 12.33-9.27-1.99zm6.61-17.65c-2.42-2.52-6.19-2.51-8.71 0l-5.65 5.66c-2.42 2.42-2.42 6.3 0 8.71l5.65-5.65 8.71-8.72zM2.87 22.19l3.5-12.33c.66 1.58 1.61 2.94 2.75 4.02 1.45 1.16 3.09 1.91 4.65 2.49l-1.63 3.83-9.27 1.99z" />
          </svg>
          <h2 className="text-3xl md:text-4xl font-roxborough mb-8 relative z-10">¿Empezamos a dar forma a tu empresa?</h2>
          <p className="text-xl text-gray-700 mb-12 max-w-2xl mx-auto relative z-10">
            Podemos trabajar una sola área o integrar todo el proceso según lo que tu empresa necesite hoy.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
            <Link href="/contacto" className="w-full sm:w-auto bg-henko-turquoise text-white px-12 py-5 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform text-center">
              Hablemos ahora
            </Link>
            <Link href="/contacto" className="w-full sm:w-auto px-12 py-5 rounded-xl font-semibold border-2 border-henko-turquoise text-henko-turquoise hover:bg-henko-turquoise hover:text-white transition-all text-center">
              Agendar consultoría
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
