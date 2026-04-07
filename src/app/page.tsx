import Link from 'next/link'
import Image from 'next/image'


export default function Home() {
  return (
    <main className="overflow-hidden">

      {/* ═══ SECCIÓN 1 — HERO ═══ */}
      <section className="relative min-h-screen bg-henko-white flex items-center pt-28 pb-16">
        <div className="max-w-6xl mx-auto px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Texto izquierda */}
            <div>
              <h1 data-animate="left" className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight mb-6">
                Orden para tu empresa,<br />
                <span className="text-henko-turquoise">tu liderazgo</span><br />
                y tu mente.
              </h1>
              <p data-animate="left" data-delay="200" className="text-lg md:text-xl text-gray-500 font-raleway leading-relaxed mb-10 max-w-xl">
                Porque cuando hay orden, todo funciona mejor.
                <br />
                <em>También tú.</em>
              </p>
              <div data-animate="left" data-delay="400" className="flex flex-col sm:flex-row gap-4">
                <Link href="/trabaja-conmigo" className="btn-primary text-center">
                  Trabajar conmigo
                </Link>
                <Link href="/servicios" className="btn-outline text-center">
                  Descubrir cómo puedo ayudarte
                </Link>
              </div>
            </div>

            {/* Logo derecha */}
            <div data-animate="right" data-delay="200" className="hidden lg:flex items-center justify-center">
              <Image
                src="/henkologo.png"
                alt="Henkoaching"
                width={420}
                height={280}
                className="object-contain"
                priority
              />
            </div>

          </div>
        </div>
      </section>

      {/* ═══ SECCIÓN 2 — EL PROBLEMA ═══ */}
      <section className="bg-henko-turquoise py-24 text-white">
        <div className="max-w-6xl mx-auto px-6">

          {/* Título */}
          <div className="text-center mb-16">
            <h2 data-animate className="text-2xl md:text-4xl lg:text-5xl font-bold leading-snug whitespace-nowrap">
              Cuando una empresa crece o cambia,<br />
              el orden deja de ser opcional.
            </h2>
          </div>

          {/* Tarjetas de síntomas — full width apiladas */}
          <div className="flex flex-col gap-5 max-w-5xl mx-auto">

            {/* Tarjeta 1 — Avance con esfuerzo */}
            <div
              data-animate="scale"
              data-delay="0"
              className="bg-white/10 border border-white/20 rounded-3xl overflow-hidden hover:bg-white/20 transition-colors duration-300 grid grid-cols-1 md:grid-cols-2"
            >
              <div className="relative min-h-40">
                <Image src="/image.png" alt="Avance con esfuerzo" fill className="object-cover" />
              </div>
              <div className="p-5 flex flex-col justify-center">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-3">
                  <span className="text-2xl opacity-80">↗</span>
                  Avance con esfuerzo
                </h3>
                <p className="font-raleway text-white/75 text-sm leading-relaxed">
                  La empresa sigue adelante… pero cada vez cuesta más. La inercia sustituye al impulso.
                </p>
              </div>
            </div>

            {/* Tarjeta 2 — Roles sin definir */}
            <div
              data-animate="scale"
              data-delay="100"
              className="bg-white/10 border border-white/20 rounded-3xl overflow-hidden hover:bg-white/20 transition-colors duration-300 grid grid-cols-1 md:grid-cols-2"
            >
              <div className="relative min-h-40">
                <Image src="/roles.png" alt="Roles sin definir" fill className="object-cover" />
              </div>
              <div className="p-5 flex flex-col justify-center">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-3">
                  <span className="text-2xl opacity-80">⟳</span>
                  Roles sin definir
                </h3>
                <p className="font-raleway text-white/75 text-sm leading-relaxed">
                  Todo el mundo hace de todo, pero nadie tiene claro qué le corresponde. Las decisiones se acumulan y el liderazgo se diluye.
                </p>
              </div>
            </div>

            {/* Tarjeta 3 — Cambios que se posponen */}
            <div
              data-animate="scale"
              data-delay="200"
              className="bg-white/10 border border-white/20 rounded-3xl overflow-hidden hover:bg-white/20 transition-colors duration-300 grid grid-cols-1 md:grid-cols-2"
            >
              <div className="p-5 flex flex-col justify-center">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-3">
                  <span className="text-2xl opacity-80">⏸</span>
                  Cambios que se posponen
                </h3>
                <p className="font-raleway text-white/75 text-sm leading-relaxed">
                  Se repiten las mismas tareas y se evitan los mismos cambios. Se sigue haciendo lo mismo porque siempre se ha hecho así.
                </p>
              </div>
            </div>

            {/* Tarjeta 4 — Modo reactivo permanente */}
            <div
              data-animate="scale"
              data-delay="300"
              className="bg-white/10 border border-white/20 rounded-3xl overflow-hidden hover:bg-white/20 transition-colors duration-300 grid grid-cols-1 md:grid-cols-2"
            >
              <div className="relative min-h-40">
                <Image src="/reactivo.png" alt="Modo reactivo permanente" fill className="object-cover" />
              </div>
              <div className="p-5 flex flex-col justify-center">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-3">
                  <span className="text-2xl opacity-80">⚡</span>
                  Modo reactivo permanente
                  </h3>
                  <p className="font-raleway text-white/75 text-sm leading-relaxed">
                    El día a día manda. Y sin darte cuenta, la empresa ocupa tu tiempo, tu energía y tu cabeza.
                  </p>
                </div>
            </div>

          </div>

          {/* Remate */}
          <div data-animate data-delay="400" className="mt-16 pt-12 border-t border-white/20 max-w-3xl mx-auto text-center">
            <p className="text-xl font-raleway text-white/60 mb-3">No falta talento. No falta trabajo.</p>
            <p className="text-2xl md:text-3xl font-bold">
              Falta orden, claridad y coherencia.
            </p>
          </div>

        </div>
      </section>

      {/* ═══ SECCIÓN 3 — A QUIÉN ACOMPAÑO ═══ */}
      <section className="relative bg-henko-white py-24 overflow-hidden">

        {/* Líneas onduladas Dalí */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1280 800" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 0 120 C 180 60 320 200 560 130 C 800 60 1050 190 1280 120" stroke="#2BA8A0" strokeOpacity="0.2" strokeWidth="2" fill="none"/>
          <path d="M 0 260 C 150 340 380 180 620 270 C 860 360 1080 200 1280 260" stroke="#2BA8A0" strokeOpacity="0.12" strokeWidth="1.5" fill="none"/>
          <path d="M 0 400 C 200 320 420 490 680 390 C 920 290 1100 460 1280 400" stroke="#2BA8A0" strokeOpacity="0.2" strokeWidth="2" fill="none"/>
          <path d="M 0 540 C 160 630 360 450 600 550 C 840 650 1060 480 1280 540" stroke="#2BA8A0" strokeOpacity="0.12" strokeWidth="1.5" fill="none"/>
          <path d="M 0 680 C 220 600 440 760 700 670 C 940 580 1120 720 1280 680" stroke="#2BA8A0" strokeOpacity="0.15" strokeWidth="2" fill="none"/>
        </svg>

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          {/* Título */}
          <div data-animate className="text-center mb-16">
            <p className="section-title text-sm mb-4">Para quién</p>
            <h2 className="text-4xl md:text-5xl text-gray-900 leading-tight">
              Trabajo con empresas<br />que están en momentos clave.
            </h2>
          </div>

          {/* Tarjetas — fila 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[
              { num: '01', label: 'Empresas en crecimiento', desc: 'Que necesitan estructura para escalar sin caos.', radius: 'rounded-[4px_80px_16px_70px]', bg: 'bg-henko-greenblue/20', border: 'border-henko-greenblue/40', delay: '0' },
              { num: '02', label: 'Cambio generacional', desc: 'Transiciones que requieren orden y claridad de roles.', radius: 'rounded-[4px_80px_16px_70px]', bg: 'bg-henko-purple/20', border: 'border-henko-purple/40', delay: '100' },
              { num: '03', label: 'Transformación digital', desc: 'Procesos que deben evolucionar sin perder el equipo.', radius: 'rounded-[4px_80px_16px_70px]', bg: 'bg-henko-greenblue/20', border: 'border-henko-greenblue/40', delay: '200' },
            ].map((item) => (
              <div
                key={item.num}
                data-animate="scale"
                data-delay={item.delay}
                className={`${item.bg} ${item.radius} border ${item.border} p-7 hover:opacity-80 transition-opacity duration-300`}
              >
                <span className="section-title text-xs block mb-3">{item.num}</span>
                <h3 className="text-gray-900 font-bold text-lg mb-2 leading-snug">{item.label}</h3>
                <p className="text-gray-500 font-raleway text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Tarjetas — fila 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: '04', label: 'Cambio cultural', desc: 'Organizaciones que quieren trabajar de otra manera.', radius: 'rounded-[4px_80px_16px_70px]', bg: 'bg-henko-purple/20', border: 'border-henko-purple/40', delay: '100' },
              { num: '05', label: 'Equipos que crecieron rápido', desc: 'Sin una base clara desde la que sostenerse.', radius: 'rounded-[4px_80px_16px_70px]', bg: 'bg-henko-greenblue/20', border: 'border-henko-greenblue/40', delay: '200' },
              { num: '06', label: 'CEOs que quieren soltar', desc: 'Que ya no quieren (ni deben) estar en todo.', radius: 'rounded-[4px_80px_16px_70px]', bg: 'bg-henko-purple/10', border: 'border-henko-purple/50', delay: '300' },
            ].map((item) => (
              <div
                key={item.num}
                data-animate="scale"
                data-delay={item.delay}
                className={`${item.bg} ${item.radius} border ${item.border} p-7 hover:opacity-80 transition-opacity duration-300`}
              >
                <span className="section-title text-xs block mb-3">{item.num}</span>
                <h3 className="text-gray-900 font-bold text-lg mb-2 leading-snug">{item.label}</h3>
                <p className="text-gray-500 font-raleway text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECCIÓN 4 — QUÉ HAGO ═══ */}
      <section className="relative bg-henko-white py-24 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1280 800" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 0 100 C 200 40 380 180 620 100 C 860 20 1080 160 1280 100" stroke="#2BA8A0" strokeOpacity="0.15" strokeWidth="2" fill="none"/>
          <path d="M 0 280 C 160 360 340 200 580 280 C 820 360 1060 220 1280 280" stroke="#958cba" strokeOpacity="0.12" strokeWidth="1.5" fill="none"/>
          <path d="M 0 450 C 220 370 420 530 700 440 C 960 350 1120 500 1280 450" stroke="#2BA8A0" strokeOpacity="0.15" strokeWidth="2" fill="none"/>
          <path d="M 0 620 C 180 700 400 540 660 620 C 900 700 1100 560 1280 620" stroke="#958cba" strokeOpacity="0.1" strokeWidth="1.5" fill="none"/>
          <path d="M 0 760 C 240 680 460 800 740 740 C 980 680 1160 780 1280 760" stroke="#2BA8A0" strokeOpacity="0.12" strokeWidth="2" fill="none"/>
        </svg>
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div data-animate className="text-center mb-16">
            <p className="section-title text-sm mb-3">Servicios</p>
            <h2 className="text-3xl md:text-4xl text-gray-900 font-bold">
              Tres formas de acompañar tu empresa
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-stretch">
            {[
              { num: '01', title: 'Orden y estructura', desc: 'Procesos claros, roles definidos y una operativa que funciona sin depender de ti.', bg: 'bg-henko-turquoise', border: 'border-henko-turquoise', delay: '0' },
              { num: '02', title: 'Reclutamiento consciente', desc: 'Personas que encajan, aportan y sostienen la cultura de la empresa.', bg: 'bg-henko-purple', border: 'border-henko-purple', delay: '150' },
              { num: '03', title: 'Liderazgo y desarrollo', desc: 'Equipos más conscientes, mejor comunicación y liderazgo que realmente sostiene.', bg: 'bg-henko-turquoise', border: 'border-henko-turquoise', delay: '300' },
            ].map((service) => (
              <div
                key={service.num}
                data-animate="scale"
                data-delay={service.delay}
                className={`flex flex-col items-center text-center border-2 ${service.border} rounded-3xl p-8 hover:opacity-90 transition-opacity duration-300`}
              >
                <div className={`${service.bg} rounded-full w-44 h-44 shrink-0 flex items-center justify-center mb-8`}>
                  <span className="text-white font-roxborough font-bold text-5xl">{service.num}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-500 font-raleway text-sm leading-relaxed mb-6 flex-1">{service.desc}</p>
                <Link href="/servicios" className="btn-outline text-xs mt-auto">
                  Saber más
                </Link>
              </div>
            ))}
          </div>
          <p data-animate data-delay="200" className="text-center text-gray-400 font-raleway text-sm mt-14 italic">
            Puedes trabajar una sola área o integrarlas según lo que tu empresa necesite.
          </p>
          <div data-animate data-delay="300" className="text-center mt-8">
            <Link href="/contacto" className="btn-primary inline-block">
              Hablemos
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ SECCIÓN 5 — CÓMO TRABAJO ═══ */}
      <section className="bg-henko-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p data-animate="left" className="section-title text-sm mb-3">Mi enfoque</p>
              <h2 data-animate="left" data-delay="100" className="text-3xl md:text-4xl text-gray-900 mb-6 font-bold">
                El cambio no se impone.<br />Se construye.
              </h2>
              <div data-animate="left" data-delay="200" className="space-y-4 text-gray-500 font-raleway text-base leading-relaxed">
                <p>Entro en la empresa para entender cómo funciona realmente, no solo lo que parece que pasa.</p>
                <p>Ordenamos la estructura, mejoramos la comunicación y trabajamos el liderazgo desde dentro, para que el cambio no dependa de alguien externo, sino que se sostenga en el equipo.</p>
                <p>Aporto claridad, enfoque y herramientas, pero también conciencia: para dejar de reaccionar, asumir responsabilidad y empezar a hacer las cosas de otra manera.</p>
              </div>
              <p data-animate="left" data-delay="300" className="text-henko-turquoise font-raleway font-semibold mt-6">
                Ahí es donde el cambio se vuelve real.
              </p>
              <div data-animate="left" data-delay="400" className="mt-8">
                <Link href="/trabaja-conmigo" className="btn-primary inline-block">
                  Descubrir cómo trabajo
                </Link>
              </div>
            </div>
            <div data-animate="right" data-delay="200" className="hidden lg:flex items-center justify-center">
              <Image
                src="/mariposa.png"
                alt="Cuando la mariposa toma alas, no queda nada de la oruga"
                width={500}
                height={500}
                className="object-contain w-full max-w-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECCIÓN 6 — CTA FINAL ═══ */}
      <section className="bg-henko-yellow/30 py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 data-animate className="text-3xl md:text-4xl text-gray-900 mb-4 font-bold">
            Si sientes que tu empresa podría funcionar mejor de lo que está funcionando ahora,
          </h2>
          <p data-animate data-delay="200" className="text-2xl text-henko-turquoise font-bold mb-10">
            probablemente tengas razón.
          </p>
          <div data-animate data-delay="400" className="flex flex-col sm:flex-row gap-4 justify-center">
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
