import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="overflow-hidden bg-henko-white">

      {/* ═══ SECCIÓN 1 — HERO ═══ */}
      <section className="relative min-h-[90vh] bg-henko-white flex items-center pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Texto izquierda */}
            <div className="z-20">
              <h1 data-animate="left" className="text-5xl md:text-6xl lg:text-7xl font-roxborough text-gray-900 leading-[1.1] mb-8">
                Orden para tu empresa,<br />
                <span className="text-henko-turquoise italic font-light">tu liderazgo</span><br />
                y tu mente.
              </h1>
              <p data-animate="left" data-delay="200" className="text-lg md:text-xl text-gray-600 font-raleway leading-relaxed mb-10 max-w-xl font-light">
                Porque cuando hay orden, todo funciona mejor.
                <br />
                <em className="font-medium text-gray-900">También tú.</em>
              </p>
              <div data-animate="left" data-delay="400" className="flex flex-col sm:flex-row gap-5">
                <Link href="/trabaja-conmigo" className="bg-henko-turquoise text-white px-8 py-4 rounded-full font-bold text-center hover:bg-henko-greenblue transition-all duration-300 shadow-lg hover:shadow-cyan-500/20">
                  Trabajar conmigo
                </Link>
                <Link href="/servicios" className="bg-white text-gray-800 border-2 border-gray-100 px-8 py-4 rounded-full font-bold text-center hover:border-gray-200 transition-all duration-300 hover:shadow-md">
                  Descubrir cómo puedo ayudarte
                </Link>
              </div>
            </div>

            {/* Logo o Imagen Hero derecha (Bento Style) */}
            <div data-animate="right" data-delay="200" className="hidden lg:block relative h-[600px]">
              {/* Bento Decoration */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-henko-turquoise/10 to-henko-purple/10 rounded-full blur-3xl -z-10"></div>
              <div className="relative w-full h-full bg-white rounded-[3rem] p-12 shadow-2xl flex items-center justify-center border border-gray-100 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white z-0"></div>
                <div className="relative z-10 transform transition-transform duration-700 group-hover:scale-105 w-full h-full">
                  <Image
                    src="/henkologo.png"
                    alt="Henkoaching"
                    fill
                    className="object-contain drop-shadow-sm p-8"
                    priority
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══ SECCIÓN 2 — EL PROBLEMA ═══ */}
      <section className="bg-gray-50 py-32 relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">

          {/* Título */}
          <div className="text-center mb-20 max-w-4xl mx-auto">
            <h2 data-animate className="text-4xl md:text-5xl lg:text-6xl font-roxborough text-gray-900 leading-tight">
              Cuando una empresa crece o cambia,<br />
              <span className="italic text-gray-500 font-light">el orden deja de ser opcional.</span>
            </h2>
          </div>

          {/* Bento Grid — Síntomas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 max-w-6xl mx-auto">

            {/* Tarjeta 1 — Avance con esfuerzo (Larga) */}
            <div data-animate="scale" data-delay="0" className="lg:col-span-8 bg-white border border-gray-100 rounded-[3rem] overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row group">
              <div className="p-10 md:p-12 flex flex-col justify-center flex-1">
                <span className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">↗</span>
                <h3 className="font-roxborough text-2xl md:text-3xl text-gray-900 mb-4">
                  Avance con esfuerzo
                </h3>
                <p className="font-raleway text-gray-500 text-lg leading-relaxed font-light">
                  La empresa sigue adelante… pero cada vez cuesta más. La inercia sustituye al impulso y todo se siente cuesta arriba.
                </p>
              </div>
              <div className="relative w-full md:w-2/5 min-h-[250px] bg-gray-100 overflow-hidden">
                <Image src="/image.png" alt="Avance con esfuerzo" fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
            </div>

            {/* Tarjeta 2 — Roles sin definir (Corta) */}
            <div data-animate="scale" data-delay="100" className="lg:col-span-4 bg-henko-turquoise/5 border border-henko-turquoise/20 rounded-[3rem] p-10 md:p-12 hover:shadow-lg transition-all duration-300 group flex flex-col justify-center">
              <span className="w-12 h-12 rounded-full bg-white text-henko-turquoise flex items-center justify-center text-2xl mb-6 shadow-sm group-hover:rotate-180 transition-transform duration-700">⟳</span>
              <h3 className="font-roxborough text-2xl md:text-3xl text-gray-900 mb-4">
                Roles sin definir
              </h3>
              <p className="font-raleway text-gray-600 text-base leading-relaxed font-light">
                Todo el mundo hace de todo, pero nadie tiene claro qué le corresponde. Las decisiones se acumulan.
              </p>
            </div>

            {/* Tarjeta 3 — Cambios pospuestos (Corta) */}
            <div data-animate="scale" data-delay="200" className="lg:col-span-4 bg-henko-purple/5 border border-henko-purple/20 rounded-[3rem] p-10 md:p-12 hover:shadow-lg transition-all duration-300 group flex flex-col justify-center">
              <span className="w-12 h-12 rounded-full bg-white text-henko-purple flex items-center justify-center text-xl mb-6 shadow-sm group-hover:-translate-y-2 transition-transform">⏸</span>
              <h3 className="font-roxborough text-2xl md:text-3xl text-gray-900 mb-4">
                Cambios que se posponen
              </h3>
              <p className="font-raleway text-gray-600 text-base leading-relaxed font-light">
                Se evitan los mismos cambios. Se sigue haciendo lo mismo porque siempre se ha hecho así.
              </p>
            </div>

            {/* Tarjeta 4 — Modo reactivo (Larga) */}
            <div data-animate="scale" data-delay="300" className="lg:col-span-8 bg-white text-gray-900 border border-gray-100 rounded-[3rem] overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row group">
              <div className="relative w-full md:w-2/5 min-h-[250px] overflow-hidden bg-gray-100">
                <Image src="/reactivo.png" alt="Modo reactivo permanente" fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-10 md:p-12 flex flex-col justify-center flex-1 relative z-20">
                <span className="w-12 h-12 rounded-full bg-yellow-50 text-yellow-500 flex items-center justify-center text-xl mb-6">⚡</span>
                <h3 className="font-roxborough text-2xl md:text-3xl text-gray-900 mb-4">
                  Modo reactivo permanente
                </h3>
                <p className="font-raleway text-gray-500 text-lg leading-relaxed font-light">
                  El día a día manda. Y sin darte cuenta, la empresa ocupa todo tu tiempo, energía y cabeza apagando fuegos constantemente.
                </p>
              </div>
            </div>

          </div>

          {/* Remate Bento */}
          <div data-animate data-delay="400" className="mt-6 max-w-6xl mx-auto">
            <div className="bg-gradient-to-r from-henko-purple/15 to-purple-100/60 p-10 md:p-14 rounded-[3rem] text-center shadow-lg border border-purple-200/50">
              <p className="text-xl md:text-2xl font-raleway text-purple-900 mb-2 font-medium">No falta talento. No falta trabajo.</p>
              <p className="text-3xl md:text-5xl font-roxborough text-gray-900 mb-10">
                Falta orden, claridad y coherencia.
              </p>
              <Link href="/contacto" className="inline-flex items-center gap-3 bg-henko-purple text-white px-8 py-4 rounded-full font-raleway font-bold text-sm tracking-widest uppercase hover:bg-henko-purple/90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                Hablemos →
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ═══ SECCIÓN 3 — A QUIÉN ACOMPAÑO (Bento Grids Asimétricos) ═══ */}
      <section className="bg-white py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">

          <div data-animate className="text-center mb-20">
            <p className="font-raleway font-bold text-henko-turquoise tracking-widest uppercase text-sm mb-4">Para quién</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-roxborough text-gray-900 leading-tight">
              Acompaño a empresas que<br />
              <span className="italic font-light text-gray-500">están en momentos clave</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { num: '01', col: 'col-span-1', label: 'Empresas en crecimiento', desc: 'Que necesitan estructura firme para escalar sin caer en el caos organizativo.', bg: 'bg-henko-greenblue/10', color: 'text-henko-greenblue' },
              { num: '02', col: 'col-span-1 lg:col-span-2', label: 'Cambio generacional', desc: 'Transiciones familiares o de liderazgo que requieren un profundo orden y claridad de roles desde el primer día.', bg: 'bg-henko-purple/10', color: 'text-henko-purple' },
              { num: '03', col: 'col-span-1 lg:col-span-2', label: 'Transformación digital', desc: 'Procesos operativos que deben evolucionar hacia lo digital sin que el equipo se quede atrás ni pierda motivación.', bg: 'bg-yellow-50', color: 'text-yellow-500' },
              { num: '04', col: 'col-span-1', label: 'Cambio cultural', desc: 'Organizaciones que quieren renovar su forma de trabajar y comunicarse.', bg: 'bg-henko-coral/10', color: 'text-henko-coral' },
              { num: '05', col: 'col-span-1', label: 'Equipos rápidos', desc: 'Equipos que crecieron muy rápido sin una base clara desde la que sostenerse.', bg: 'bg-henko-greenblue/10', color: 'text-henko-greenblue' },
              { num: '06', col: 'col-span-1 lg:col-span-2', label: 'CEOs que quieren soltar', desc: 'Líderes y fundadores que ya no quieren (ni deben) participar en la microgestión diaria.', bg: 'bg-henko-purple/10', color: 'text-henko-purple' },
            ].map((item, i) => (
              <div
                key={item.num}
                data-animate="scale"
                data-delay={i * 100}
                className={`${item.col} ${item.bg} rounded-[3rem] p-10 flex flex-col justify-between hover:shadow-xl transition-all duration-300 relative overflow-hidden group min-h-[300px]`}
              >
                <span className={`font-hey-gotcha text-8xl absolute -right-4 -top-6 opacity-30 select-none transition-transform group-hover:scale-110 ${item.color}`}>{item.num}</span>
                <h3 className={`text-gray-900 font-roxborough text-3xl mb-4 relative z-10 w-4/5`}>{item.label}</h3>
                <p className={`text-gray-600 font-raleway text-lg leading-relaxed font-light relative z-10 w-full lg:w-4/5`}>{item.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ═══ SECCIÓN 4 — QUÉ HAGO (Servicios) ═══ */}
      <section className="bg-gray-50 py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div data-animate className="text-center mb-20">
            <p className="font-raleway font-bold text-henko-purple tracking-widest uppercase text-sm mb-4">Servicios</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-roxborough text-gray-900 leading-tight">
              Tres formas de<br />
              <span className="italic font-light text-gray-500">acompañar tu organización</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {[
              { num: '01', title: 'Orden y estructura', desc: 'Procesos claros, roles definidos y una operativa que funciona de manera autónoma sin depender exclusivamente de ti.', link: '/servicios', accent: 'bg-henko-greenblue text-henko-greenblue' },
              { num: '02', title: 'Reclutamiento consciente', desc: 'Atracción de talento y personas que encajan verdaderamente, aportan valor continuo y sostienen la cultura de tu empresa.', link: '/servicios', accent: 'bg-henko-purple text-henko-purple' },
              { num: '03', title: 'Liderazgo y desarrollo', desc: 'Equipos mucho más conscientes, comunicación efectiva interdepartamental y un liderazgo humano que realmente sostiene.', link: '/servicios', accent: 'bg-henko-coral text-henko-coral' },
            ].map((service, i) => (
              <Link
                href={service.link}
                key={service.num}
                data-animate="scale"
                data-delay={i * 150}
                className="bg-white rounded-[3rem] p-10 md:p-12 border border-gray-100 hover:shadow-2xl transition-all duration-500 group flex flex-col relative overflow-hidden"
              >
                {/* Decorative background element hover */}
                <div className={`absolute -bottom-20 -right-20 w-48 h-48 rounded-full ${service.accent.split(' ')[0]} opacity-0 group-hover:opacity-5 blur-3xl transition-opacity duration-500`}></div>

                <span className={`font-hey-gotcha text-7xl mb-6 ${service.accent.split(' ')[1]}`}>{service.num}</span>
                <h3 className="text-2xl md:text-3xl font-roxborough text-gray-900 mb-4">{service.title}</h3>
                <p className="text-gray-500 font-raleway text-lg leading-relaxed mb-8 flex-1 font-light">{service.desc}</p>
                <div className={`font-raleway font-bold text-sm tracking-wide uppercase group-hover:pl-2 transition-all flex items-center gap-2 ${service.accent.split(' ')[1]}`}>
                  Saber más <span className="text-lg leading-none">→</span>
                </div>
              </Link>
            ))}
          </div>

          <p data-animate data-delay="300" className="text-center text-gray-500 font-raleway text-lg mt-8 italic max-w-2xl mx-auto">
            Puedes trabajar de forma específica en una sola área o integrar las tres disciplinas de manera transversal según la fase en la que se encuentre tu empresa.
          </p>
        </div>
      </section>

      {/* ═══ SECCIÓN 5 — CÓMO TRABAJO ═══ */}
      <section className="bg-white py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gray-50 border border-gray-100 rounded-[4rem] p-12 lg:p-24 overflow-hidden relative shadow-lg">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <p data-animate="left" className="font-raleway font-bold text-henko-purple tracking-widest uppercase text-sm mb-6">Mi enfoque</p>
                <h2 data-animate="left" data-delay="100" className="text-4xl md:text-5xl lg:text-5xl font-roxborough text-gray-900 leading-tight mb-8">
                  El cambio no se impone.<br />
                  <span className="italic text-gray-500 font-light">Se construye desde dentro.</span>
                </h2>

                <div data-animate="left" data-delay="200" className="space-y-6 text-gray-600 font-raleway text-lg leading-relaxed font-light">
                  <p>Entro en la empresa para entender cómo funciona realmente en su base, no solo lo que parece que pasa en la superficie.</p>
                  <p>Ordenamos la estructura, mejoramos los canales de comunicación y trabajamos el liderazgo desde las raíces, para que la transformación no dependa de alguien externo, sino que se sostenga orgánicamente en tu equipo.</p>
                </div>

                <p data-animate="left" data-delay="300" className="text-henko-turquoise font-roxborough text-2xl italic mt-10">
                  Ahí es donde el cambio se vuelve real.
                </p>

                <div data-animate="left" data-delay="400" className="mt-12">
                  <Link href="/trabaja-conmigo" className="inline-flex items-center gap-4 bg-gray-900 text-white px-8 py-4 rounded-full font-bold hover:bg-gray-800 transition-all shadow-md">
                    Descubrir mi metodología
                  </Link>
                </div>
              </div>

              {/* Imagen mariposa — columna derecha */}
              <div data-animate="right" className="hidden lg:flex items-center justify-center h-[500px] relative">
                <Image src="/mariposa.png" alt="Mariposa Metamorfosis" fill sizes="50vw" className="object-contain" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECCIÓN 6 — CTA FINAL ═══ */}
      <section className="bg-henko-white py-16 pb-32">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-br from-henko-purple/15 to-purple-100/60 rounded-[4rem] p-10 md:p-16 shadow-xl border border-purple-200/50">
            <h2 data-animate className="text-4xl md:text-5xl font-roxborough text-gray-900 mb-3 leading-tight">
              Si sientes que tu empresa podría funcionar mejor de lo que está funcionando ahora...
            </h2>
            <p data-animate data-delay="200" className="text-xl md:text-3xl font-raleway text-purple-900 mt-6 mb-10">
              <span className="font-bold">probablemente tengas razón.</span>
            </p>
            <div data-animate data-delay="400" className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/trabaja-conmigo" className="bg-gray-900 text-white px-10 py-5 rounded-full font-bold hover:bg-gray-800 transition-all shadow-lg hover:-translate-y-1">
                Trabajar conmigo
              </Link>
              <Link href="/contacto" className="bg-white/60 backdrop-blur-md text-gray-900 border border-gray-900/10 px-10 py-5 rounded-full font-bold hover:bg-white transition-all shadow-sm hover:-translate-y-1">
                Descubrir cómo puedo ayudarte
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
