import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="overflow-hidden">

      {/* ═══════════════════════════════════════════
          SECCIÓN 1 — HERO
      ═══════════════════════════════════════════ */}
      <section className="relative min-h-screen bg-henko-white flex items-center pt-36 pb-16">
        <div className="max-w-6xl mx-auto px-6 w-full">
          <div className="max-w-3xl">
            {/* Logo hero */}
            <div className="mb-10">
              <Image
                src="/henkologo.png"
                alt="Henkoaching"
                width={260}
                height={130}
                className="object-contain object-left"
                priority
              />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight mb-6">
              Orden para tu empresa,<br />
              <span className="text-henko-turquoise">tu liderazgo</span><br />
              y tu mente.
            </h1>
            <p className="text-lg md:text-xl text-gray-500 font-raleway leading-relaxed mb-10 max-w-xl">
              Porque cuando hay orden, todo funciona mejor.
              <br />
              <em>También tú.</em>
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/trabaja-conmigo" className="btn-primary text-center">
                Trabajar conmigo
              </Link>
              <Link href="/servicios" className="btn-outline text-center">
                Descubrir cómo puedo ayudarte
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-1/3 h-full bg-henko-greenblue/20 -z-10 hidden lg:block" />
      </section>

      {/* ═══════════════════════════════════════════
          SECCIÓN 2 — EL PROBLEMA
      ═══════════════════════════════════════════ */}
      <section className="bg-henko-turquoise py-24 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-10 leading-snug">
              Cuando una empresa crece o cambia,<br />
              el orden deja de ser opcional.
            </h2>
            <div className="text-white/80 font-raleway text-base md:text-lg leading-loose space-y-5">
              <p>Hay momentos en los que la empresa sigue avanzando… pero cada vez con más esfuerzo.</p>
              <p>
                Todo el mundo hace de todo, pero nadie tiene del todo claro qué le corresponde.<br />
                Las decisiones se acumulan, cuesta delegar y el liderazgo se diluye.
              </p>
              <p>Se repiten tareas. Se posponen cambios.<br />
                Y muchas veces se sigue haciendo lo mismo… porque siempre se ha hecho así.</p>
              <p>
                El día a día se vuelve reactivo.<br />
                Y sin darte cuenta, la empresa empieza a ocuparlo todo: tu tiempo, tu energía, tu cabeza.
              </p>
            </div>
            <div className="mt-12 pt-10 border-t border-white/20">
              <p className="text-xl font-raleway text-white/60 mb-3">No falta talento. No falta trabajo.</p>
              <p className="text-2xl md:text-3xl font-bold">
                Falta orden, claridad y coherencia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECCIÓN 3 — A QUIÉN ACOMPAÑO
      ═══════════════════════════════════════════ */}
      <section className="bg-henko-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="section-title text-sm mb-3">Para quién</p>
            <h2 className="text-3xl md:text-4xl text-gray-900 font-bold">
              Trabajo con empresas<br />que están en momentos clave.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { label: 'Empresas en crecimiento', desc: 'Que necesitan estructura para escalar sin caos.' },
              { label: 'Cambio generacional', desc: 'Transiciones que requieren orden y claridad de roles.' },
              { label: 'Transformación digital', desc: 'Procesos que deben evolucionar sin perder el equipo.' },
              { label: 'Cambio cultural', desc: 'Organizaciones que quieren trabajar de otra manera.' },
              { label: 'Equipos que crecieron rápido', desc: 'Sin una base clara desde la que sostenerse.' },
              { label: 'CEOs que quieren soltar', desc: 'Que ya no quieren (ni deben) estar en todo.' },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-henko-greenblue/20 border border-henko-greenblue/40 p-6 hover:bg-henko-greenblue/40 transition-colors duration-200"
              >
                <div className="w-2 h-2 rounded-full bg-henko-turquoise mb-4" />
                <h3 className="text-gray-900 font-semibold font-raleway mb-2">{item.label}</h3>
                <p className="text-gray-500 text-sm font-raleway leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECCIÓN 4 — QUÉ HAGO (3 LÍNEAS)
      ═══════════════════════════════════════════ */}
      <section className="bg-henko-greenblue/15 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="section-title text-sm mb-3">Servicios</p>
            <h2 className="text-3xl md:text-4xl text-gray-900 font-bold">
              Tres formas de acompañar tu empresa
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: '01', title: 'Orden y estructura', desc: 'Procesos claros, roles definidos y una operativa que funciona sin depender de ti.', color: 'bg-henko-turquoise' },
              { num: '02', title: 'Reclutamiento consciente', desc: 'Personas que encajan, aportan y sostienen la cultura de la empresa.', color: 'bg-henko-purple' },
              { num: '03', title: 'Liderazgo y desarrollo', desc: 'Equipos más conscientes, mejor comunicación y liderazgo que realmente sostiene.', color: 'bg-henko-coral' },
            ].map((service) => (
              <div key={service.num} className="bg-henko-white p-8 border border-gray-100 hover:shadow-md transition-shadow duration-200">
                <span className={`inline-block ${service.color} text-white font-raleway text-xs font-bold tracking-widest px-3 py-1 mb-6`}>
                  {service.num}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {service.title}
                </h3>
                <p className="text-gray-500 font-raleway text-sm leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 font-raleway text-sm mt-10 italic">
            Puedes trabajar una sola área o integrarlas según lo que tu empresa necesite.
          </p>
          <div className="text-center mt-8">
            <Link href="/servicios" className="btn-primary inline-block">
              Ver todos los servicios
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECCIÓN 5 — CÓMO TRABAJO
      ═══════════════════════════════════════════ */}
      <section className="bg-henko-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="section-title text-sm mb-3">Mi enfoque</p>
              <h2 className="text-3xl md:text-4xl text-gray-900 mb-6 font-bold">
                El cambio no se impone.<br />Se construye.
              </h2>
              <div className="space-y-4 text-gray-500 font-raleway text-base leading-relaxed">
                <p>Entro en la empresa para entender cómo funciona realmente, no solo lo que parece que pasa.</p>
                <p>Ordenamos la estructura, mejoramos la comunicación y trabajamos el liderazgo desde dentro, para que el cambio no dependa de alguien externo, sino que se sostenga en el equipo.</p>
                <p>Aporto claridad, enfoque y herramientas, pero también conciencia: para dejar de reaccionar, asumir responsabilidad y empezar a hacer las cosas de otra manera.</p>
              </div>
              <p className="text-henko-turquoise font-raleway font-semibold mt-6">
                Ahí es donde el cambio se vuelve real.
              </p>
              <div className="mt-8">
                <Link href="/trabaja-conmigo" className="btn-primary inline-block">
                  Descubrir cómo trabajo
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="w-full aspect-square bg-henko-greenblue/30" />
                <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-henko-yellow/50" />
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-henko-turquoise/20" />
                <div className="absolute inset-0 flex items-center justify-center p-10">
                  <blockquote className="text-center">
                    <p className="text-2xl text-henko-turquoise leading-relaxed">
                      "Cuando la mariposa toma alas, no queda nada de la oruga"
                    </p>
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECCIÓN 6 — CTA FINAL
      ═══════════════════════════════════════════ */}
      <section className="bg-henko-yellow/30 py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl text-gray-900 mb-4 font-bold">
            Si sientes que tu empresa podría funcionar mejor de lo que está funcionando ahora,
          </h2>
          <p className="text-2xl text-henko-turquoise font-bold mb-10">
            probablemente tengas razón.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/trabaja-conmigo" className="btn-primary">
              Trabajar conmigo
            </Link>
            <Link href="/servicios" className="btn-outline">
              Descubrir cómo puedo ayudarte
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
