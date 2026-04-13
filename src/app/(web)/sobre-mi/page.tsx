import Image from "next/image"
import Link from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sobre mí | Henkoaching",
  description: "Jennifer Cervera, consultora de operaciones, liderazgo y mindfulness empresarial. Basada en Mallorca.",
}

export default function SobreMiPage() {
  return (
    <div className="bg-henko-white text-gray-900 selection:bg-henko-turquoise selection:text-white overflow-x-hidden pt-24 font-raleway">

      {/* Hero Section */}
      <section className="relative px-6 md:px-12 py-24 flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto gap-12">
        <span className="font-hey-gotcha text-[150px] md:text-[200px] text-henko-turquoise/5 absolute top-0 -left-10 select-none pointer-events-none">
          Conóceme
        </span>

        <div data-animate="left" className="relative z-10 w-full md:w-1/2">
          <span className="inline-block px-4 py-1 rounded-full bg-henko-greenblue/15 text-henko-turquoise font-semibold text-xs uppercase tracking-widest mb-6">
            Quién soy
          </span>
          <h1 className="text-5xl md:text-7xl font-roxborough leading-tight mb-6">
            Jennifer Cervera
          </h1>
          <p className="text-xl md:text-2xl text-henko-turquoise font-medium mb-8 max-w-xl">
            Consultora de operaciones, liderazgo y mindfulness empresarial.
          </p>
          <div className="space-y-6 text-gray-600 text-lg leading-relaxed max-w-lg">
            <p>
              Llevo años ayudando a empresas a ordenarse por dentro. Primero desde dentro de organizaciones,
              aprendiendo lo que de verdad pasa cuando una empresa crece sin estructura. Luego acompañando
              a otras desde fuera, con perspectiva y distancia.
            </p>
            <p>
              Basada en Mallorca, trabajo con empresas de toda España.
            </p>
          </div>
        </div>

        <div data-animate="right" className="w-full md:w-1/2 relative z-10 mt-12 md:mt-0">
          <div className="relative w-full aspect-[4/5] max-w-md mx-auto rounded-[3rem] overflow-hidden shadow-2xl">
            <Image
              alt="Jennifer Cervera"
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
          {/* Decorative shapes */}
          <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-henko-yellow/20 rounded-full blur-3xl -z-10" />
          <div className="absolute -top-6 -left-6 w-32 h-32 bg-henko-turquoise/20 rounded-full blur-2xl -z-10" />
        </div>
      </section>

      {/* Lo que me diferencia */}
      <section className="px-6 md:px-12 py-24 bg-gray-50 border-y border-gray-100">
        <div data-animate className="max-w-4xl mx-auto text-center relative">
          <svg className="w-16 h-16 text-henko-turquoise mx-auto mb-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h2 className="text-3xl md:text-5xl font-roxborough mb-8 leading-tight">
            Lo operativo y lo humano no se pueden separar
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto font-light mb-8">
            Un proceso no funciona si las personas que lo tienen que aplicar no lo entienden, no lo sienten suyo o están agotadas. Por eso trabajo las dos cosas a la vez.
          </p>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto font-light">
            Me formé en coaching y mindfulness porque quería tener herramientas para acompañar el cambio real, no solo diseñarlo en papel. Y porque creo que las empresas funcionan mejor cuando quienes las lideran están bien.
          </p>
        </div>
      </section>

      {/* Cómo Pienso (Valores / Bento) */}
      <section className="px-6 md:px-12 py-32 max-w-7xl mx-auto">
        <div data-animate className="text-center mb-20">
          <span className="inline-block px-4 py-1 rounded-full bg-gray-100 text-gray-600 font-semibold text-xs uppercase tracking-widest mb-4">
            Valores
          </span>
          <h2 className="text-4xl md:text-5xl font-roxborough">Lo que guía mi forma de trabajar</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              num: "01",
              title: "El cambio real no se impone",
              desc: "Se construye con las personas que lo van a vivir. Mi trabajo es crear las condiciones para que ocurra.",
              color: "text-henko-turquoise",
              bg: "text-henko-turquoise/20",
            },
            {
              num: "02",
              title: "Lo operativo y humano van juntos",
              desc: "Los procesos los aplican personas. Si no cuidas las dos partes, la solución no dura.",
              color: "text-henko-purple",
              bg: "text-henko-purple/30",
            },
            {
              num: "03",
              title: "La claridad es un acto de respeto",
              desc: "Saber qué te corresponde, qué se espera de ti y hacia dónde va la empresa no es un lujo. Es lo mínimo.",
              color: "text-henko-coral",
              bg: "text-henko-coral/30",
            },
            {
              num: "04",
              title: "Hacerse cargo es el primer paso",
              desc: "El cambio empieza cuando dejamos de esperar que sea el otro quien lo haga. En las empresas, y en la vida.",
              color: "text-henko-yellow",
              bg: "text-henko-yellow/40",
            },
          ].map((val, idx) => (
            <div key={idx} data-animate="scale" data-delay={idx * 100} className="group relative bg-white p-10 md:p-14 rounded-[3rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500 overflow-hidden">
              <span className={`font-hey-gotcha text-[120px] absolute -right-4 -top-6 select-none transition-transform group-hover:scale-110 ${val.bg}`}>
                {val.num}
              </span>
              <div className="relative z-10">
                <h3 className={`text-2xl font-roxborough mb-4 pr-12 ${val.color}`}>
                  {val.title}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed max-w-sm">
                  {val.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HENKO */}
      <section className="bg-henko-turquoise py-24 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 transform origin-top-right"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

        <div data-animate className="max-w-4xl mx-auto text-center relative z-10">
          <span className="font-raleway uppercase tracking-widest text-xs font-bold text-white/70 mb-6 block">
            El nombre
          </span>
          <h2 className="text-4xl md:text-5xl font-roxborough text-white mb-10">
            ¿Por qué Henkoaching?
          </h2>
          <p className="text-white/90 font-light leading-relaxed text-xl mb-12 max-w-3xl mx-auto">
            <strong className="font-semibold">Henko</strong> significa <em>cambio transformador</em> en japonés. No un ajuste pequeño,
            sino el tipo de cambio que lo transform todo. Como la metamorfosis de la oruga a mariposa:
            un proceso con idas y venidas, con diferentes colores, pero que lleva a algo completamente nuevo.
          </p>
          <div className="inline-block bg-white/10 px-8 py-4 rounded-2xl border border-white/20 backdrop-blur-sm">
            <p className="text-white/80 font-raleway text-sm italic">
              El proyecto nació en Mallorca. La estética del logo está inspirada en Joan Miró.
            </p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-6 md:px-12 py-24 mb-12 max-w-5xl mx-auto text-center">
        <div data-animate className="bg-gray-50 p-16 rounded-[3rem] relative overflow-hidden border border-gray-100">
          <svg className="absolute -bottom-10 -right-10 w-[200px] h-[200px] text-henko-turquoise/5 select-none" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <h2 className="text-3xl md:text-4xl font-roxborough mb-6 relative z-10">¿Te resuena lo que hago?</h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto relative z-10 font-light">
            Hablemos. Sin compromiso, solo para conocernos y ver si tiene sentido trabajar juntos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
            <Link href="/contacto" className="w-full sm:w-auto bg-gradient-to-br from-henko-turquoise to-henko-greenblue text-white px-10 py-5 rounded-xl font-bold shadow-lg hover:shadow-henko-turquoise/30 transition-all text-center">
              Escribir ahora
            </Link>
            <Link href="/trabaja-conmigo" className="w-full sm:w-auto px-10 py-5 rounded-xl font-semibold border border-gray-300 hover:bg-white transition-all text-center">
              Ver cómo trabajo
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
