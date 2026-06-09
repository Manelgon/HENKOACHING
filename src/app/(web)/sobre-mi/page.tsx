import { Metadata } from 'next'
import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import { getCompanySettings, getSignedAssetUrl } from '@/lib/company-settings'

export const dynamic = 'force-dynamic'

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

export default async function SobreMiPage() {
  const settings = await getCompanySettings()
  const sobreMiUrl = await getSignedAssetUrl(settings.sobre_mi_path, 60 * 60 * 24)

  return (
    <div className="bg-white pt-24 font-raleway">
      <PageHeader
        overline="Sobre mí"
        title={
          <>
            Jennifer <em className="italic text-henko-turquoise font-light">Cervera</em>
          </>
        }
        subtitle="Consultora de operaciones, coach y apasionada de los procesos humanos. Mallorca como punto de partida y la transformación consciente como brújula."
      />

      {/* Bio */}
      <section className="px-6 md:px-12 pt-10 pb-20 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[5fr,7fr] gap-12 lg:gap-16 items-center">
          {/* Foto */}
          <div data-animate="left" className="relative aspect-square rounded-[3rem] overflow-hidden bg-gradient-to-br from-henko-turquoise/[0.08] via-white to-henko-turquoise/[0.04] border border-henko-turquoise/15 flex items-center justify-center">
            {sobreMiUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={sobreMiUrl}
                alt="Jennifer Cervera"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <>
                {/* Decorative blobs */}
                <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                  <div className="blob-1 absolute -top-12 -left-12 w-72 h-72 bg-henko-turquoise/[0.10]" />
                  <div className="blob-3 absolute -bottom-12 -right-12 w-72 h-72 bg-henko-turquoise/[0.08]" />
                </div>
                <span
                  aria-hidden
                  className="pointer-events-none absolute top-2 left-6 font-roxborough italic text-[10rem] leading-none text-henko-turquoise/[0.12] select-none"
                >
                  J
                </span>
                <div className="relative z-10 text-center">
                  <div className="w-24 h-24 rounded-full bg-white shadow-sm border border-henko-turquoise/20 mx-auto mb-4 flex items-center justify-center">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1f8f9b" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                  </div>
                  <p className="text-[10px] text-henko-turquoise/70 tracking-[0.22em] uppercase font-bold">foto jennifer</p>
                </div>
              </>
            )}
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
            <p data-animate="right" data-delay="400" className="text-[15px] leading-[1.85] text-gray-600 mb-5">
              Mi trabajo combina la consultoría estratégica con el coaching consciente. Porque el cambio real no es solo de procesos — es de personas.
            </p>
            <p data-animate="right" data-delay="500" className="text-[15px] leading-[1.85] text-gray-600">
              Soy también instructora de meditación y creo firmemente que el bienestar individual y la salud organizativa van de la mano. Cuando una empresa funciona bien, las personas que la forman también.
            </p>
          </div>
        </div>
      </section>

      {/* Trayectoria */}
      <section className="px-6 md:px-12 py-16 bg-[#f4f6f7] border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <p data-animate className="font-raleway font-bold text-henko-turquoise tracking-[0.18em] uppercase text-[11px] mb-3">Trayectoria y formación</p>
              <h2 data-animate data-delay="100" className="font-roxborough text-2xl md:text-3xl text-gray-900 leading-tight">
                Un recorrido que <em className="italic text-henko-turquoise font-light">tiene sentido</em>
              </h2>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            {[
              { periodo: '2024 – hoy', titulo: 'Henkoaching', desc: 'Coach ejecutiva, instructora de meditación y consultora para CEOs y empresas en transformación. Mallorca como base, el cambio como método.', tag: 'Actualidad' },
              { periodo: '2022 – 2023', titulo: 'Advanced Coaching Program · EAE', desc: 'EAE Business School. Coaching ejecutivo y de equipo. El paso que transformó mi forma de acompañar a líderes y equipos.', tag: 'Formación' },
              { periodo: '2020 – 2024', titulo: 'RRHH, bienestar y operaciones', desc: 'De asistente de dirección a Employee Ambassador en Iberostar y Gerente de RRHH. Donde descubrí que las personas son la clave de todo.', tag: 'Experiencia' },
              { periodo: '2010 – 2016', titulo: 'Administración de Empresas · UIB', desc: 'Universitat de les Illes Balears. Formación base en gestión y organización empresarial, con estancia internacional en Alemania (Paderborn, 2014).', tag: 'Formación' },
              { periodo: '2014 – 2021', titulo: 'Administración y finanzas', desc: 'Contabilidad, tesorería y gestión administrativa. La base que me enseñó a leer una organización por dentro.', tag: 'Experiencia' },
            ].map((item, idx) => (
              <div
                key={idx}
                data-animate
                data-delay={idx * 80}
                className="group bg-white border border-henko-turquoise/15 rounded-[1.5rem] px-7 py-5 flex flex-col md:flex-row md:items-center gap-4 hover:border-henko-turquoise/35 hover:shadow-[0_8px_32px_rgba(31,143,155,0.07)] transition-all duration-300"
              >
                <div className="flex-shrink-0 flex items-center gap-4 md:w-48">
                  <span className="font-raleway text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase">{item.periodo}</span>
                  <span className={`hidden md:block text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full ${item.tag === 'Actualidad' ? 'bg-henko-turquoise text-white' : item.tag === 'Formación' ? 'bg-henko-turquoise/12 text-henko-turquoise border border-henko-turquoise/30' : 'bg-gray-100 text-gray-500'}`}>{item.tag}</span>
                </div>
                <div className="hidden md:block w-px h-8 bg-henko-turquoise/20 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-roxborough text-lg text-gray-900 leading-tight mb-1">{item.titulo}</p>
                  <p className="text-[13.5px] leading-[1.7] text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="px-6 md:px-12 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <p data-animate className="font-raleway font-bold text-henko-turquoise tracking-[0.18em] uppercase text-[11px] mb-4">Mis valores</p>
          <h2 data-animate data-delay="100" className="font-roxborough text-2xl md:text-4xl text-gray-900 mb-12 leading-tight">
            Lo que <em className="italic text-henko-turquoise font-light">me guía</em>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {VALORES.map((item, idx) => (
              <div
                key={item.v}
                data-animate="scale"
                data-delay={idx * 100}
                className="group relative bg-white border border-henko-turquoise/15 rounded-[2rem] p-8 md:p-9 min-h-[200px] shadow-sm hover:border-henko-turquoise/40 hover:shadow-[0_16px_48px_rgba(31,143,155,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex"
              >
                {/* Vertical accent bar */}
                <span
                  aria-hidden
                  className="absolute top-8 bottom-8 left-0 w-px bg-gradient-to-b from-transparent via-henko-turquoise to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-300"
                />

                <div className="relative flex flex-col justify-center pl-2 w-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="block w-6 h-px bg-henko-turquoise" />
                    <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-henko-turquoise">
                      Valor 0{idx + 1}
                    </span>
                  </div>
                  <h3 className="font-roxborough text-xl md:text-[22px] mb-2.5 text-gray-900 leading-tight">{item.v}</h3>
                  <p className="text-[14px] leading-[1.7] text-gray-600">{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-henko-turquoise py-24 md:py-28 px-6 md:px-12 text-center overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="blob-1 absolute -top-32 -left-32 w-[480px] h-[480px] bg-white/[0.08]" />
          <div className="blob-2 absolute -bottom-40 -right-32 w-[520px] h-[520px] bg-white/[0.06]" />
        </div>

        <span
          aria-hidden
          className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 font-roxborough italic text-[18rem] md:text-[22rem] leading-none text-white/[0.06] select-none"
        >
          &mdash;
        </span>

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="block w-8 h-px bg-white/60" />
            <p className="font-raleway font-bold text-white tracking-[0.22em] uppercase text-[11px]">
              Hablemos
            </p>
            <span className="block w-8 h-px bg-white/60" />
          </div>
          <h2 data-animate className="font-roxborough text-3xl md:text-5xl text-white mb-4 leading-[1.15]">
            ¿Trabajamos <em className="italic font-light">juntos?</em>
          </h2>
          <p data-animate data-delay="100" className="font-roxborough italic text-lg md:text-xl text-white/90 mb-10">
            Primera consulta gratuita de 45 minutos. Sin compromiso.
          </p>
          <Link
            data-animate
            data-delay="200"
            href="/contacto"
            className="inline-flex items-center gap-2 bg-white text-henko-turquoise px-9 py-4 rounded-full text-[15px] font-semibold tracking-wide hover:bg-gray-50 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
          >
            Escríbeme →
          </Link>
        </div>
      </section>
    </div>
  )
}
