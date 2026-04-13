import Image from "next/image"
import Link from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: 'Servicios — Henkoaching',
  description: 'Operaciones, reclutamiento consciente y liderazgo. Tres líneas de trabajo para acompañar tu empresa en momentos clave.',
}

export default function ServiciosPage() {
  return (
    <div className="bg-henko-white text-gray-900 selection:bg-henko-turquoise selection:text-white overflow-x-hidden pt-24 font-raleway">
      {/* Hero Section */}
      <section className="relative px-6 md:px-12 py-24 md:py-32 flex flex-col items-center text-center overflow-hidden">
        <span className="font-hey-gotcha text-7xl md:text-9xl text-henko-turquoise/10 absolute -top-10 left-1/2 -translate-x-1/2 select-none pointer-events-none">
          Henko
        </span>

        <div className="relative z-10 max-w-4xl">
          <span data-animate className="inline-block px-4 py-1 rounded-full bg-henko-greenblue/15 text-henko-turquoise font-semibold text-xs uppercase tracking-widest mb-6">
            EXCELENCIA OPERATIVA
          </span>
          <h1 data-animate data-delay="100" className="text-5xl md:text-7xl font-roxborough leading-tight mb-8">
            Lo que hago: Servicios
          </h1>
          <p data-animate data-delay="200" className="text-xl md:text-2xl text-gray-600 font-light mb-12 max-w-2xl mx-auto">
            Transformo la visión en estructura, las personas en equipos de alto rendimiento y el caos en procesos fluidos. Acompañamiento estratégico con alma.
          </p>
        </div>
      </section>

      {/* Services Bento Grid */}
      <section className="px-6 md:px-12 pb-32 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

          {/* Service 01: Operaciones */}
          <div data-animate="left" className="md:col-span-8 group relative bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col justify-between">
            <span className="font-hey-gotcha text-[160px] absolute -right-6 -top-10 text-henko-turquoise/20 select-none z-0">01</span>

            <div className="relative z-10 flex flex-col h-full justify-between gap-12">
              <div>
                <div className="inline-block bg-henko-turquoise/10 text-henko-turquoise px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-12">
                  Estructura
                </div>
                <h2 className="text-4xl md:text-5xl font-roxborough mb-6 leading-tight">
                  Operaciones - <br />
                  <span className="text-henko-turquoise">Orden y estructura que funcionan</span>
                </h2>
                <p className="text-lg text-gray-600 mb-8 max-w-lg leading-relaxed font-light">
                  Diseñamos el esqueleto operativo que tu negocio necesita para escalar sin romperse. Desde la optimización de flujos de trabajo hasta la implementación de sistemas que liberan tu tiempo.
                </p>
              </div>
              <div className="bg-henko-turquoise px-8 py-10 rounded-3xl text-white shadow-inner">
                <span className="text-xs font-bold tracking-widest uppercase opacity-80 mb-2 block font-raleway">
                  Resultado
                </span>
                <p className="text-2xl font-roxborough italic">
                  "Una maquinaria interna invisible que permite que lo extraordinario suceda cada día."
                </p>
              </div>
            </div>
          </div>

          {/* Decorative Asset 1 */}
          <div data-animate="right" className="hidden md:block md:col-span-4 rounded-[3rem] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700 shadow-sm border border-gray-100 relative h-full min-h-[500px]">
            <Image
              alt="Minimalist luxury office space"
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>

          {/* Service 02: Reclutamiento */}
          <div data-animate="scale" data-delay="0" className="md:col-span-6 group relative overflow-hidden bg-white p-10 md:p-12 rounded-[3rem] shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 min-h-[520px]">
            <span className="font-hey-gotcha text-[140px] absolute -right-6 -top-8 text-henko-purple/30 select-none z-0">02</span>

            <div className="relative z-10 flex flex-col h-full">
              <h2 className="text-3xl md:text-4xl font-roxborough mb-6 mt-16">
                Reclutamiento consciente - <br />
                <span className="text-henko-purple">Las personas adecuadas</span>
              </h2>
              <p className="text-gray-600 mb-12 leading-relaxed font-light text-lg">
                No solo buscamos talento técnico; buscamos alineación de valores. Encontramos a los profesionales que se convertirán en los guardianes de tu cultura organizacional.
              </p>
              <div className="mt-auto bg-henko-purple px-8 py-10 rounded-3xl text-white shadow-inner">
                <span className="text-xs font-bold tracking-widest uppercase opacity-80 mb-2 block font-raleway">
                  Resultado
                </span>
                <p className="text-xl font-roxborough italic">
                  Equipos cohesionados que no solo trabajan juntos, sino que crecen juntos.
                </p>
              </div>
            </div>
          </div>

          {/* Service 03: Liderazgo */}
          <div data-animate="scale" data-delay="150" className="md:col-span-6 group relative overflow-hidden bg-white p-10 md:p-12 rounded-[3rem] shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 min-h-[520px]">
            <span className="font-hey-gotcha text-[140px] absolute left-2 md:left-6 -top-4 md:-top-6 text-henko-coral/30 select-none z-0">03</span>

            <div className="relative z-10 flex flex-col h-full mt-16">
              <h2 className="text-3xl md:text-4xl font-roxborough mb-6">
                Liderazgo y desarrollo - <br />
                <span className="text-henko-coral">El liderazgo que sostiene</span>
              </h2>
              <p className="text-gray-600 mb-12 leading-relaxed font-light text-lg">
                Formación y coaching para líderes que buscan inspirar, no solo gestionar. Desarrollamos las soft-skills necesarias para navegar la incertidumbre con empatía y firmeza.
              </p>
              <div className="bg-henko-coral px-8 py-10 rounded-3xl text-white shadow-inner">
                <span className="text-xs font-bold tracking-widest uppercase opacity-80 mb-2 block font-raleway">
                  Resultado
                </span>
                <p className="text-xl font-roxborough italic">
                  Líderes conscientes capaces de potenciar el talento interno y liderar el cambio.
                </p>
              </div>
            </div>
          </div>

          {/* Holistic Section / CTA */}
          <div data-animate className="md:col-span-12 relative overflow-hidden bg-gradient-to-br from-henko-purple/15 to-purple-100/60 border border-purple-200/50 p-12 md:p-24 rounded-[3rem] shadow-lg mt-8 flex items-center">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
              <div>
                <h2 className="text-5xl md:text-6xl font-roxborough text-gray-900 mb-8 leading-tight">
                  Acompañamiento integral
                </h2>
                <p className="text-xl text-gray-600 mb-12 font-light leading-relaxed">
                  No creo en soluciones aisladas. Mi enfoque integra estrategia, personas y procesos para crear organizaciones resilientes, humanas y altamente rentables.
                </p>
                <Link
                  href="/contacto"
                  className="inline-flex items-center gap-4 bg-henko-purple text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-henko-purple/90 transition-all duration-300 shadow-md"
                >
                  Hablemos de tu empresa
                </Link>
              </div>
              <div className="hidden lg:block relative h-[400px] rounded-[2rem] overflow-hidden shadow-xl">
                <Image
                  alt="Soft focused hands drawing a connection"
                  className="w-full h-full object-cover"
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"
                  fill
                  sizes="50vw"
                />
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}
