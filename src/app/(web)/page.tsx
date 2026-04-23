import Link from 'next/link'
import Image from 'next/image'
import AnimatedButterfly from '@/components/AnimatedButterfly'
import {
  AvanceSVG,
  RolesSVG,
  PospuestosSVG,
  ReactivoSVG,
} from '@/components/SymptomIllustrations'

const SYMPTOMS = [
  {
    title: 'Avance con esfuerzo',
    desc: 'La empresa sigue adelante… pero cada vez cuesta más. La inercia sustituye al impulso y todo se siente cuesta arriba.',
    bg: '#c8e8e2',
    Svg: AvanceSVG,
    flip: false,
  },
  {
    title: 'Roles sin definir',
    desc: 'Todo el mundo hace de todo, pero nadie tiene claro qué le corresponde. Las decisiones se acumulan.',
    bg: '#f0e4a0',
    Svg: RolesSVG,
    flip: false,
  },
  {
    title: 'Cambios que se posponen',
    desc: 'Se evitan los mismos cambios. Se sigue haciendo lo mismo porque siempre se ha hecho así.',
    bg: '#c9bedd',
    Svg: PospuestosSVG,
    flip: true,
  },
  {
    title: 'Modo reactivo permanente',
    desc: 'El día a día manda. Y sin darte cuenta, la empresa ocupa todo tu tiempo, energía y cabeza apagando fuegos.',
    bg: '#e8b8b8',
    Svg: ReactivoSVG,
    flip: true,
  },
]

const SERVICES = [
  {
    num: '01',
    title: 'Orden y estructura',
    desc: 'Procesos claros, roles definidos y una operativa que funciona de manera autónoma sin depender exclusivamente de ti.',
    bg: 'bg-henko-turquoise',
    text: 'text-white',
    numClass: 'text-white/40',
  },
  {
    num: '02',
    title: 'Reclutamiento consciente',
    desc: 'Atracción de talento y personas que encajan verdaderamente, aportan valor continuo y sostienen la cultura de tu empresa.',
    bg: 'bg-henko-greenblue',
    text: 'text-gray-900',
    numClass: 'text-black/15',
  },
  {
    num: '03',
    title: 'Liderazgo y desarrollo',
    desc: 'Equipos más conscientes, comunicación efectiva interdepartamental y un liderazgo humano que realmente sostiene.',
    bg: 'bg-henko-yellow',
    text: 'text-gray-900',
    numClass: 'text-black/15',
  },
]

const AUDIENCE = [
  { title: 'Empresas en crecimiento', sub: 'Que necesitan estructura firme para escalar sin caer en el caos organizativo.', bg: 'bg-henko-greenblue', text: 'text-gray-900' },
  { title: 'Cambio generacional', sub: 'Transiciones familiares o de liderazgo que requieren orden y claridad de roles desde el primer día.', bg: 'bg-henko-yellow', text: 'text-gray-900' },
  { title: 'Transformación digital', sub: 'Procesos operativos que deben evolucionar hacia lo digital sin que el equipo se quede atrás.', bg: 'bg-henko-coral', text: 'text-gray-900' },
  { title: 'Cambio cultural', sub: 'Organizaciones que quieren renovar su forma de trabajar y comunicarse internamente.', bg: 'bg-henko-purple', text: 'text-white' },
  { title: 'Equipos que crecieron rápido', sub: 'Equipos que escalaron muy rápido sin una base clara desde la que sostenerse.', bg: 'bg-white border border-gray-200/70', text: 'text-gray-900' },
  { title: 'CEOs que quieren soltar', sub: 'Líderes y fundadores que ya no quieren ni deben participar en la microgestión diaria.', bg: 'bg-henko-turquoise', text: 'text-white' },
]

const ENFOQUE_PILLS = [
  { label: 'Diagnóstico real', bg: 'bg-henko-greenblue', text: 'text-gray-900' },
  { label: 'Sin dependencias externas', bg: 'bg-henko-yellow', text: 'text-gray-900' },
  { label: 'Cambio sostenible', bg: 'bg-henko-turquoise', text: 'text-white' },
  { label: 'Desde las raíces', bg: 'bg-henko-coral', text: 'text-gray-900' },
]

export default function Home() {
  return (
    <main className="overflow-hidden bg-henko-white">

      {/* ═══ HERO — Centrado con blobs animados y mariposa ═══ */}
      <section className="relative min-h-screen flex items-center justify-center bg-henko-white pt-20 overflow-hidden">
        {/* Blobs morphing */}
        <div
          className="blob-1 absolute pointer-events-none"
          style={{
            width: 360, height: 468, top: -80, right: -100,
            background: '#addbd2', opacity: 0.65,
            borderRadius: '60% 40% 70% 30% / 50% 60% 40% 60%',
          }}
        />
        <div
          className="blob-2 absolute pointer-events-none"
          style={{
            width: 200, height: 260, bottom: 80, left: -60,
            background: '#eddc88', opacity: 0.65,
            borderRadius: '60% 40% 70% 30% / 50% 60% 40% 60%',
          }}
        />
        <div
          className="blob-3 absolute pointer-events-none"
          style={{
            width: 160, height: 208, top: '35%', left: '12%',
            background: '#958cba', opacity: 0.4,
            borderRadius: '60% 40% 70% 30% / 50% 60% 40% 60%',
          }}
        />
        <div
          className="blob-4 absolute pointer-events-none"
          style={{
            width: 130, height: 169, bottom: '18%', right: '8%',
            background: '#d69494', opacity: 0.5,
            borderRadius: '60% 40% 70% 30% / 50% 60% 40% 60%',
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <div className="relative inline-block">
            <Image
              src="/henkologo.png"
              alt="Henkoaching"
              width={360}
              height={360}
              className="object-contain mx-auto mb-7"
              style={{ width: 360, height: 'auto' }}
              priority
            />
            <AnimatedButterfly size={52} style={{ top: 22, right: 4 }} />
          </div>

          <p className="font-roxborough italic text-2xl md:text-3xl text-gray-700 mb-3 leading-relaxed">
            Cuando una empresa crece o cambia,<br />
            el orden deja de ser opcional.
          </p>
          <p className="text-xs md:text-sm tracking-[0.22em] text-henko-turquoise font-semibold uppercase mb-10">
            coaching &amp; mindfulness empresarial
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/trabaja-conmigo"
              className="inline-flex items-center gap-2 bg-henko-turquoise text-white px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide hover:bg-henko-turquoise-light hover:shadow-lg hover:shadow-henko-turquoise/30 transition-all duration-200"
            >
              Trabaja conmigo
            </Link>
            <Link
              href="/servicios"
              className="inline-flex items-center gap-2 bg-transparent border-2 border-henko-turquoise text-henko-turquoise px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide hover:bg-henko-turquoise hover:text-white transition-all duration-200"
            >
              Ver servicios
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ SÍNTOMAS — Grid 2x2 horizontal ═══ */}
      <section className="bg-henko-white py-24 md:py-28 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <p className="font-raleway font-bold text-henko-turquoise tracking-[0.18em] uppercase text-[11px] mb-4">¿Te suena familiar?</p>
          <h2 data-animate className="font-roxborough text-4xl md:text-5xl text-gray-900 mb-14 leading-tight">
            Las señales de que<br />
            <em className="italic text-henko-turquoise font-light">algo debe cambiar</em>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {SYMPTOMS.map((s, i) => {
              const Svg = s.Svg
              const text = (
                <div className="flex-1 p-8 md:p-9" style={{ background: s.bg }}>
                  <h3 className="font-roxborough text-xl md:text-2xl text-gray-900 mb-3 leading-tight">
                    {s.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-700">
                    {s.desc}
                  </p>
                </div>
              )
              const illus = (
                <div className="relative flex-shrink-0 bg-henko-white overflow-hidden" style={{ flex: '0 0 45%' }}>
                  <Svg />
                </div>
              )
              return (
                <div
                  key={i}
                  data-animate="scale"
                  data-delay={i * 100}
                  className="bg-henko-white rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row border border-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 min-h-[220px]"
                >
                  {s.flip ? (<>{illus}{text}</>) : (<>{text}{illus}</>)}
                </div>
              )
            })}
          </div>

          {/* Banner — borde turquesa transparente */}
          <div data-animate data-delay="400" className="mt-5 rounded-[2rem] border-2 border-henko-turquoise px-10 md:px-12 py-8 md:py-9 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <p className="font-roxborough text-xl md:text-2xl text-gray-900 mb-1.5">
                No falta talento. No falta trabajo.
              </p>
              <p className="font-roxborough text-xl md:text-2xl text-henko-turquoise italic">
                Falta orden, claridad y coherencia.
              </p>
            </div>
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 bg-henko-turquoise text-white px-7 py-3.5 rounded-full text-sm font-semibold tracking-wide hover:bg-henko-turquoise-light hover:shadow-lg transition-all duration-200 whitespace-nowrap"
            >
              Hablemos →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ SERVICIOS ═══ */}
      <section className="py-24 md:py-28 px-6 md:px-12" style={{ background: '#f2ebe5' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-14 gap-6">
            <div>
              <p className="font-raleway font-bold text-henko-turquoise tracking-[0.18em] uppercase text-[11px] mb-4">Servicios</p>
              <h2 data-animate className="font-roxborough text-4xl md:text-5xl text-gray-900 leading-tight">
                Tres formas de<br />
                <em className="italic text-henko-turquoise font-light">acompañar tu organización</em>
              </h2>
            </div>
            <Link
              href="/servicios"
              className="inline-flex items-center gap-2 bg-transparent border-2 border-henko-turquoise text-henko-turquoise px-7 py-3 rounded-full text-sm font-semibold tracking-wide hover:bg-henko-turquoise hover:text-white transition-all duration-200 self-start md:self-auto"
            >
              Ver todos →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SERVICES.map((s, i) => (
              <div
                key={s.num}
                data-animate="scale"
                data-delay={i * 100}
                className={`${s.bg} ${s.text} rounded-[2.5rem] p-10 min-h-[260px] flex flex-col justify-between hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300`}
              >
                <p className={`font-roxborough italic text-5xl leading-none mb-6 ${s.numClass}`}>
                  {s.num}
                </p>
                <div>
                  <h3 className="font-roxborough text-xl md:text-2xl mb-3">{s.title}</h3>
                  <p className="text-sm leading-relaxed opacity-80">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-7 text-sm text-gray-500 italic leading-relaxed max-w-2xl">
            Puedes trabajar de forma específica en una sola área o integrar las tres disciplinas de manera transversal según la fase en la que se encuentre tu empresa.
          </p>
        </div>
      </section>

      {/* ═══ PARA QUIÉN ═══ */}
      <section className="bg-henko-white py-24 md:py-28 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <p className="font-raleway font-bold text-henko-turquoise tracking-[0.18em] uppercase text-[11px] mb-4">Para quién</p>
          <h2 data-animate className="font-roxborough text-4xl md:text-5xl text-gray-900 mb-14 leading-tight">
            Acompaño a empresas que<br />
            <em className="italic text-henko-turquoise font-light">están en momentos clave</em>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AUDIENCE.map((a, i) => (
              <div
                key={i}
                data-animate="scale"
                data-delay={i * 80}
                className={`${a.bg} ${a.text} rounded-[2.5rem] p-9 min-h-[200px]`}
              >
                <h3 className="font-roxborough text-lg md:text-xl mb-3 leading-tight">{a.title}</h3>
                <p className="text-sm leading-relaxed opacity-75">{a.sub}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/trabaja-conmigo"
              className="inline-flex items-center gap-2 bg-henko-turquoise text-white px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide hover:bg-henko-turquoise-light hover:shadow-lg hover:shadow-henko-turquoise/30 transition-all duration-200"
            >
              Descubrir cómo puedo ayudarte →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ ENFOQUE ═══ */}
      <section className="py-24 md:py-28 px-6 md:px-12" style={{ background: '#f2ebe5' }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          <div>
            <p className="font-raleway font-bold text-henko-turquoise tracking-[0.18em] uppercase text-[11px] mb-4">Mi enfoque</p>
            <h2 data-animate="left" className="font-roxborough text-4xl md:text-5xl text-gray-900 mb-7 leading-tight">
              El cambio no se impone.<br />
              <em className="italic text-henko-turquoise font-light">Se construye desde dentro.</em>
            </h2>
            <p data-animate="left" data-delay="100" className="text-base md:text-[15px] leading-[1.85] text-gray-600 mb-4">
              Entro en la empresa para entender cómo funciona realmente en su base, no solo lo que parece que pasa en la superficie.
            </p>
            <p data-animate="left" data-delay="200" className="text-base md:text-[15px] leading-[1.85] text-gray-600 mb-9">
              Ordenamos la estructura, mejoramos los canales de comunicación y trabajamos el liderazgo desde las raíces, para que la transformación se sostenga orgánicamente en tu equipo.
            </p>
            <Link
              href="/sobre-mi"
              className="inline-flex items-center gap-2 bg-transparent border-2 border-henko-turquoise text-henko-turquoise px-7 py-3 rounded-full text-sm font-semibold tracking-wide hover:bg-henko-turquoise hover:text-white transition-all duration-200"
            >
              Descubrir mi metodología →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {ENFOQUE_PILLS.map((pill, i) => (
              <div
                key={i}
                data-animate="scale"
                data-delay={i * 100}
                className={`${pill.bg} ${pill.text} rounded-[2rem] p-7 md:p-8 min-h-[140px] flex items-end`}
              >
                <p className="font-roxborough text-lg md:text-xl leading-snug">{pill.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ QUOTE ═══ */}
      <section className="relative py-28 md:py-32 px-6 md:px-12 bg-gray-900 overflow-hidden">
        <div
          className="absolute pointer-events-none"
          style={{
            width: 320, height: 416, top: -100, right: -80,
            background: '#1f8f9b', opacity: 0.18,
            borderRadius: '60% 40% 70% 30% / 50% 60% 40% 60%',
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            width: 220, height: 286, bottom: -70, left: -60,
            background: '#eddc88', opacity: 0.14,
            borderRadius: '60% 40% 70% 30% / 50% 60% 40% 60%',
          }}
        />

        <div data-animate className="max-w-3xl mx-auto text-center relative z-10">
          <p className="font-roxborough italic text-3xl md:text-5xl text-white leading-[1.35] mb-7">
            &ldquo;Cuando la mariposa toma alas,<br />
            no queda nada de la oruga&rdquo;
          </p>
          <div className="w-12 h-0.5 bg-henko-turquoise mx-auto mb-5" />
          <p className="text-xs text-white/40 tracking-[0.14em]">JENNIFER CERVERA · HENKOACHING</p>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="relative bg-henko-white py-28 md:py-32 px-6 md:px-12 text-center overflow-hidden">
        <div
          className="absolute pointer-events-none"
          style={{
            width: 260, height: 338, top: -60, left: -80,
            background: '#addbd2', opacity: 0.55,
            borderRadius: '60% 40% 70% 30% / 50% 60% 40% 60%',
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            width: 190, height: 247, bottom: -40, right: -60,
            background: '#eddc88', opacity: 0.55,
            borderRadius: '60% 40% 70% 30% / 50% 60% 40% 60%',
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="font-raleway font-bold text-henko-turquoise tracking-[0.18em] uppercase text-[11px] mb-4">¿Listo para el siguiente paso?</p>
          <h2 data-animate className="font-roxborough text-4xl md:text-5xl text-gray-900 mb-4 leading-tight">
            Si sientes que tu empresa podría<br />funcionar mejor...
          </h2>
          <p data-animate data-delay="100" className="font-roxborough italic text-xl md:text-2xl text-henko-turquoise mb-10">
            probablemente tengas razón.
          </p>
          <div data-animate data-delay="200" className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/trabaja-conmigo"
              className="inline-flex items-center gap-2 bg-henko-turquoise text-white px-9 py-4 rounded-full text-[15px] font-semibold tracking-wide hover:bg-henko-turquoise-light hover:shadow-lg hover:shadow-henko-turquoise/30 transition-all duration-200"
            >
              Trabajar conmigo
            </Link>
            <Link
              href="/servicios"
              className="inline-flex items-center gap-2 bg-transparent border-2 border-henko-turquoise text-henko-turquoise px-9 py-4 rounded-full text-[15px] font-semibold tracking-wide hover:bg-henko-turquoise hover:text-white transition-all duration-200"
            >
              Descubrir cómo puedo ayudarte
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
