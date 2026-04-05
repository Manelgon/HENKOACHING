import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sobre mí — Henkoaching',
  description: 'Jennifer Cervera, consultora de operaciones, liderazgo y mindfulness empresarial. Basada en Mallorca.',
}

export default function SobreMiPage() {
  return (
    <main className="pt-24">

      {/* Hero */}
      <section className="bg-henko-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <p className="section-title text-sm mb-4">Quién soy</p>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 font-raleway uppercase tracking-wide">
            Sobre mí
          </h1>
        </div>
      </section>

      {/* Presentación */}
      <section className="bg-henko-white pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            {/* Texto */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Roxborough CF, Georgia, serif' }}>
                Jennifer Cervera
              </h2>
              <p className="text-henko-turquoise font-raleway font-semibold mb-6">
                Consultora de operaciones, liderazgo y mindfulness empresarial
              </p>
              <div className="space-y-5 text-gray-500 font-raleway text-base leading-relaxed">
                <p>
                  Llevo años ayudando a empresas a ordenarse por dentro. Primero desde dentro de organizaciones,
                  aprendiendo lo que de verdad pasa cuando una empresa crece sin estructura. Luego acompañando
                  a otras desde fuera, con perspectiva y distancia.
                </p>
                <p>
                  Lo que me diferencia es que no separo lo operativo de lo humano. Un proceso no funciona
                  si las personas que lo tienen que aplicar no lo entienden, no lo sienten suyo o están agotadas.
                  Por eso trabajo las dos cosas a la vez.
                </p>
                <p>
                  Me formé en coaching y mindfulness porque quería tener herramientas para acompañar el cambio
                  real, no solo diseñarlo en papel. Y porque creo que las empresas funcionan mejor cuando
                  quienes las lideran están bien.
                </p>
                <p>
                  Basada en Mallorca, trabajo con empresas de toda España.
                </p>
              </div>
            </div>

            {/* Visual */}
            <div className="relative">
              <div className="w-full aspect-[3/4] bg-henko-greenblue/30" />
              <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-henko-yellow/40" />
              <div className="absolute -top-6 -left-6 w-20 h-20 bg-henko-turquoise/20" />
            </div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="bg-henko-greenblue/15 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="section-title text-sm mb-3">Cómo pienso</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: 'Roxborough CF, Georgia, serif' }}>
              Lo que guía mi forma de trabajar
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                title: 'El cambio real no se impone',
                desc: 'Se construye con las personas que lo van a vivir. Mi trabajo es crear las condiciones para que ocurra.',
              },
              {
                title: 'Lo operativo y lo humano van juntos',
                desc: 'Los procesos los aplican personas. Si no cuidas las dos partes, la solución no dura.',
              },
              {
                title: 'La claridad es un acto de respeto',
                desc: 'Saber qué te corresponde, qué se espera de ti y hacia dónde va la empresa no es un lujo. Es lo mínimo.',
              },
              {
                title: 'Hacerse cargo es el primer paso',
                desc: 'El cambio empieza cuando dejamos de esperar que sea el otro quien lo haga. En las empresas, y en la vida.',
              },
            ].map((val) => (
              <div key={val.title} className="bg-henko-white p-8 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3 font-raleway" style={{ fontFamily: 'Roxborough CF, Georgia, serif' }}>
                  {val.title}
                </h3>
                <p className="text-gray-500 font-raleway text-sm leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HENKO */}
      <section className="bg-henko-turquoise py-20 text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="font-raleway uppercase tracking-widest text-sm text-white/60 mb-6">El nombre</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ fontFamily: 'Roxborough CF, Georgia, serif' }}>
            ¿Por qué Henkoaching?
          </h2>
          <p className="text-white/80 font-raleway leading-relaxed text-lg">
            <em>Henko</em> significa <strong>cambio transformador</strong> en japonés. No un ajuste pequeño,
            sino el tipo de cambio que lo transforma todo. Como la metamorfosis de la oruga a mariposa:
            un proceso con idas y venidas, con diferentes colores, pero que lleva a algo completamente nuevo.
          </p>
          <p className="text-white/60 font-raleway text-sm mt-6 italic">
            El proyecto nació en Mallorca. La estética del logo, inspirada en Joan Miró.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-henko-white py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl text-gray-900 font-bold mb-4" style={{ fontFamily: 'Roxborough CF, Georgia, serif' }}>
            ¿Te resuena lo que hago?
          </h2>
          <p className="text-gray-400 font-raleway text-sm mb-8">
            Hablemos. Sin compromiso, solo para conocernos y ver si tiene sentido trabajar juntos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contacto" className="btn-primary">
              Escribir ahora
            </Link>
            <Link href="/trabaja-conmigo" className="btn-outline">
              Ver cómo trabajo
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
