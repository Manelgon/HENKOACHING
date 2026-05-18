import { Metadata } from 'next'
import Link from 'next/link'
import PageHeader from '@/components/PageHeader'

export const metadata: Metadata = {
  title: 'Sobre mí — Henkoaching',
  description: 'Jennifer Cervera, consultora de operaciones, liderazgo y mindfulness empresarial. Basada en Mallorca.',
}

const VALORES = [
  { v: 'Consciencia', d: 'Cada cambio empieza por darse cuenta. Sin juicios.' },
  { v: 'Honestidad',  d: 'Digo lo que veo aunque no sea fácil de escuchar.' },
  { v: 'Proceso',     d: 'Los grandes cambios son el resultado de pequeños pasos.' },
  { v: 'Raíces',      d: 'Mallorca, lo mediterráneo y la calma como base de todo.' },
]

export default function SobreMiPage() {
  return (
    <div className="bg-white pt-24 font-raleway">
      <PageHeader
        overline="Sobre mí"
        title="Jennifer Cervera"
        subtitle="Consultora de operaciones, coach y apasionada de los procesos humanos."
      />

      {/* Bio */}
      <section className="px-6 md:px-12 pt-10 pb-20 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Photo placeholder */}
          <div data-animate="left" className="relative aspect-[4/5] rounded-[3rem] overflow-hidden bg-gray-50 border border-henko-turquoise/15 flex items-center justify-center">
            <div className="relative z-10 text-center">
              <div className="w-20 h-20 rounded-full bg-henko-turquoise/10 mx-auto mb-3 flex items-center justify-center">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1f8f9b" strokeWidth="1.5" strokeOpacity="0.6">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </div>
              <p className="text-[11px] text-gray-400 font-mono tracking-wide">foto jennifer</p>
            </div>
          </div>

          {/* Text */}
          <div>
            <p data-animate="right" className="font-raleway font-bold text-henko-turquoise tracking-[0.18em] uppercase text-[11px] mb-4">Mi historia</p>
            <h2 data-animate="right" data-delay="100" className="font-roxborough text-2xl md:text-4xl text-gray-900 mb-6 leading-tight">
              Del caos a la<br />
              <em className="italic text-henko-turquoise font-light">transformación</em>
            </h2>
            <p data-animate="right" data-delay="200" className="text-[15px] leading-[1.85] text-gray-600 mb-5">
              Soy Jennifer, consultora de operaciones y coach especializada en transformación empresarial. Llevo más de 5 años ayudando a empresas a pasar del caos operativo a la claridad organizativa.
            </p>
            <p data-animate="right" data-delay="300" className="text-[15px] leading-[1.85] text-gray-600 mb-5">
              Nací y crecí en Mallorca, y es desde aquí donde construí Henkoaching — tomando el concepto japonés de <em>henko</em> (cambio transformador) y la metáfora de la oruga que se convierte en mariposa.
            </p>
            <p data-animate="right" data-delay="400" className="text-[15px] leading-[1.85] text-gray-600">
              Mi trabajo combina la consultoría estratégica con el coaching consciente. Porque el cambio real no es solo de procesos — es de personas.
            </p>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="px-6 md:px-12 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <p data-animate className="font-raleway font-bold text-henko-turquoise tracking-[0.18em] uppercase text-[11px] mb-4">Mis valores</p>
          <h2 data-animate data-delay="100" className="font-roxborough text-2xl md:text-4xl text-gray-900 mb-12 leading-tight">Lo que me guía</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {VALORES.map((item, idx) => (
              <div
                key={item.v}
                data-animate="scale"
                data-delay={idx * 100}
                className="bg-white border border-henko-turquoise/15 rounded-[2rem] p-8 min-h-[200px] shadow-sm hover:border-henko-turquoise/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <h3 className="font-roxborough text-xl mb-3 text-gray-900">{item.v}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-24 px-6 md:px-12 text-center">
        <h2 data-animate className="font-roxborough text-2xl md:text-3xl text-gray-900 mb-6">¿Trabajamos juntos?</h2>
        <Link
          data-animate
          data-delay="100"
          href="/contacto"
          className="inline-flex items-center gap-2 bg-henko-turquoise text-white px-9 py-4 rounded-full text-[15px] font-semibold hover:bg-henko-turquoise-light hover:shadow-lg hover:shadow-henko-turquoise/30 transition-all"
        >
          Escríbeme →
        </Link>
      </section>
    </div>
  )
}
