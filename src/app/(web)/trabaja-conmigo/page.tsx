import { Metadata } from 'next'
import Link from 'next/link'
import PageHeader from '@/components/PageHeader'

export const metadata: Metadata = {
  title: 'Trabaja conmigo — Henkoaching',
  description: 'Un proceso estructurado y humano, adaptado a tu empresa y a tu momento.',
}

type Step = {
  n: string
  title: string
  desc: string
  bgClass: string
  light?: boolean
}

const STEPS: Step[] = [
  { n: '01', title: 'Primera consulta', desc: 'Nos conocemos en una llamada gratuita de 45 minutos. Me cuentas tu situación y vemos si hay encaje.', bgClass: 'bg-henko-greenblue' },
  { n: '02', title: 'Diagnóstico',       desc: 'Analizo tu empresa en profundidad: procesos, equipo, cultura, retos. Entrevistas, observación, datos.', bgClass: 'bg-henko-yellow' },
  { n: '03', title: 'Plan personalizado', desc: 'Diseño un programa a medida con objetivos claros, plazos y métricas de éxito. Lo revisamos juntos.', bgClass: 'bg-henko-purple', light: true },
  { n: '04', title: 'Acompañamiento',    desc: 'Implementamos juntos. Sesiones regulares, seguimiento y ajustes hasta que el cambio sea sostenible.', bgClass: 'bg-henko-coral' },
]

const FORMATOS = [
  { title: 'Sesiones individuales', desc: 'Para CEOs, directores y líderes de equipo. 1h semanales o quincenales.', tag: '1:1' },
  { title: 'Talleres de equipo',     desc: 'Formaciones presenciales o en remoto para grupos de hasta 15 personas.', tag: 'GRUPO' },
  { title: 'Proyecto integral',      desc: 'Acompañamiento completo a tu empresa durante 3-6 meses.', tag: 'EMPRESA' },
]

export default function TrabajaConmigoPage() {
  return (
    <div className="bg-henko-white pt-24 font-raleway">
      <PageHeader
        overline="Trabaja conmigo"
        title="Así es como trabajo"
        subtitle="Un proceso estructurado y humano, adaptado a tu empresa y a tu momento."
        bgClass="bg-henko-greenblue"
        dark={false}
      />

      {/* 4 pasos */}
      <section className="px-6 md:px-12 py-20 bg-henko-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
          {STEPS.map((s) => {
            const textColor = s.light ? 'text-white' : 'text-gray-900'
            const numColor  = s.light ? 'text-white/50' : 'text-black/20'
            const descColor = s.light ? 'text-white/75' : 'text-gray-700'
            return (
              <div
                key={s.n}
                data-animate="scale"
                className={`${s.bgClass} rounded-[2.5rem] p-10 min-h-[220px]`}
              >
                <p className={`font-roxborough italic text-5xl mb-4 ${numColor}`}>{s.n}</p>
                <h3 className={`font-roxborough text-2xl mb-3 ${textColor}`}>{s.title}</h3>
                <p className={`text-sm leading-relaxed ${descColor}`}>{s.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Formatos */}
      <section className="px-6 md:px-12 py-20" style={{ background: '#f2ebe5' }}>
        <div className="max-w-7xl mx-auto">
          <p className="font-raleway font-bold text-henko-turquoise tracking-[0.18em] uppercase text-[11px] mb-4">Formatos de trabajo</p>
          <h2 className="font-roxborough text-3xl md:text-5xl text-gray-900 mb-12 leading-tight">¿Cómo nos adaptamos?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FORMATOS.map((f) => (
              <div key={f.title} className="bg-white rounded-[2rem] p-9 border border-black/5">
                <span className="inline-block text-[11px] tracking-wider font-bold text-henko-turquoise bg-henko-greenblue px-3 py-1 rounded-full mb-5">
                  {f.tag}
                </span>
                <h3 className="font-roxborough text-xl text-gray-900 mb-2.5">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-henko-white py-24 px-6 md:px-12 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="font-roxborough text-3xl md:text-4xl text-gray-900 mb-4">Empieza con una llamada gratuita</h2>
          <p className="text-gray-600 mb-9 leading-relaxed">
            Sin compromiso. 45 minutos para ver si hay encaje.
          </p>
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 bg-henko-turquoise text-white px-9 py-4 rounded-full text-[15px] font-semibold hover:bg-henko-turquoise-light hover:shadow-lg hover:shadow-henko-turquoise/30 transition-all"
          >
            Reservar llamada →
          </Link>
        </div>
      </section>
    </div>
  )
}
