import { Metadata } from 'next'
import Link from 'next/link'
import PageHeader from '@/components/PageHeader'

export const metadata: Metadata = {
  title: 'Sobre mí — Henkoaching',
  description: 'Jennifer Cervera, consultora de operaciones, liderazgo y mindfulness empresarial. Basada en Mallorca.',
}

type Valor = { v: string; d: string; bgClass: string; light?: boolean }

const VALORES: Valor[] = [
  { v: 'Consciencia', d: 'Cada cambio empieza por darse cuenta. Sin juicios.', bgClass: 'bg-henko-turquoise', light: true },
  { v: 'Honestidad',  d: 'Digo lo que veo aunque no sea fácil de escuchar.', bgClass: 'bg-henko-yellow' },
  { v: 'Proceso',     d: 'Los grandes cambios son el resultado de pequeños pasos.', bgClass: 'bg-henko-greenblue' },
  { v: 'Raíces',      d: 'Mallorca, lo mediterráneo y la calma como base de todo.', bgClass: 'bg-henko-coral' },
]

export default function SobreMiPage() {
  return (
    <div className="bg-henko-white pt-24 font-raleway">
      <PageHeader
        overline="Sobre mí"
        title="Jennifer Cervera"
        subtitle="Consultora de operaciones, coach y apasionada de los procesos humanos."
        bgClass="bg-henko-yellow"
        dark={false}
      />

      {/* Bio */}
      <section className="px-6 md:px-12 py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Photo placeholder */}
          <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden bg-henko-greenblue flex items-center justify-center">
            <div
              className="absolute pointer-events-none"
              style={{
                width: 180, height: 234, bottom: -40, right: -40,
                background: '#eddc88', opacity: 0.6,
                borderRadius: '60% 40% 70% 30% / 50% 60% 40% 60%',
              }}
            />
            <div
              className="absolute pointer-events-none"
              style={{
                width: 130, height: 169, top: 30, left: -30,
                background: '#958cba', opacity: 0.4,
                borderRadius: '60% 40% 70% 30% / 50% 60% 40% 60%',
              }}
            />
            <div className="relative z-10 text-center">
              <div className="w-20 h-20 rounded-full bg-white/40 mx-auto mb-3 flex items-center justify-center">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </div>
              <p className="text-[11px] text-gray-700/60 font-mono tracking-wide">foto jennifer</p>
            </div>
          </div>

          {/* Text */}
          <div>
            <p className="font-raleway font-bold text-henko-turquoise tracking-[0.18em] uppercase text-[11px] mb-4">Mi historia</p>
            <h2 className="font-roxborough text-3xl md:text-5xl text-gray-900 mb-6 leading-tight">
              Del caos a la<br />
              <em className="italic text-henko-turquoise font-light">transformación</em>
            </h2>
            <p className="text-[15px] leading-[1.85] text-gray-600 mb-5">
              Soy Jennifer, consultora de operaciones y coach especializada en transformación empresarial. Llevo más de 5 años ayudando a empresas a pasar del caos operativo a la claridad organizativa.
            </p>
            <p className="text-[15px] leading-[1.85] text-gray-600 mb-5">
              Nací y crecí en Mallorca, y es desde aquí donde construí Henkoaching — tomando el concepto japonés de <em>henko</em> (cambio transformador) y la metáfora de la oruga que se convierte en mariposa.
            </p>
            <p className="text-[15px] leading-[1.85] text-gray-600">
              Mi trabajo combina la consultoría estratégica con el coaching consciente. Porque el cambio real no es solo de procesos — es de personas.
            </p>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="px-6 md:px-12 py-20" style={{ background: '#f2ebe5' }}>
        <div className="max-w-7xl mx-auto">
          <p className="font-raleway font-bold text-henko-turquoise tracking-[0.18em] uppercase text-[11px] mb-4">Mis valores</p>
          <h2 className="font-roxborough text-3xl md:text-5xl text-gray-900 mb-12 leading-tight">Lo que me guía</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {VALORES.map((item) => {
              const tColor = item.light ? 'text-white' : 'text-gray-900'
              const dColor = item.light ? 'text-white/75' : 'text-gray-700'
              return (
                <div key={item.v} className={`${item.bgClass} rounded-[2rem] p-8 min-h-[200px]`}>
                  <h3 className={`font-roxborough text-xl mb-3 ${tColor}`}>{item.v}</h3>
                  <p className={`text-sm leading-relaxed ${dColor}`}>{item.d}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-henko-white py-24 px-6 md:px-12 text-center">
        <h2 className="font-roxborough text-3xl md:text-4xl text-gray-900 mb-6">¿Trabajamos juntos?</h2>
        <Link
          href="/contacto"
          className="inline-flex items-center gap-2 bg-henko-turquoise text-white px-9 py-4 rounded-full text-[15px] font-semibold hover:bg-henko-turquoise-light hover:shadow-lg hover:shadow-henko-turquoise/30 transition-all"
        >
          Escríbeme →
        </Link>
      </section>
    </div>
  )
}
