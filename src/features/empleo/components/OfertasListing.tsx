import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import OfertasFiltros from './OfertasFiltros'
import type { OfertaListing } from '@/features/empleo/queries'

type Props = {
  filtradas: OfertaListing[]
  total: number
  sectores: string[]
  modalidades: string[]
  activeSectores: string[]
  activeModalidades: string[]
  busqueda: string
}

export default function OfertasListing({
  filtradas,
  total,
  sectores,
  modalidades,
  activeSectores,
  activeModalidades,
  busqueda,
}: Props) {
  return (
    <div className="pt-24 font-raleway">
      <PageHeader
        overline="Portal de empleo"
        title={
          <>
            Oportunidades<br />
            <em className="italic text-henko-turquoise font-light">para crecer</em>
          </>
        }
        subtitle="Posiciones seleccionadas por Henkoaching para empresas en transformación. Solo trabajamos con organizaciones donde el talento realmente importa."
      />

      <section className="px-6 md:px-12 max-w-7xl mx-auto">
        <OfertasFiltros
          sectores={sectores}
          modalidades={modalidades}
          activeSectores={activeSectores}
          activeModalidades={activeModalidades}
          busqueda={busqueda}
        />

        <p className="text-xs text-henko-ink-soft/70 tracking-wider mb-6">
          {filtradas.length} oferta{filtradas.length !== 1 ? 's' : ''} disponible{filtradas.length !== 1 ? 's' : ''}
        </p>

        <div className="flex flex-col gap-3.5">
          {filtradas.map(o => (
            <OfertaRow key={o.id} o={o} />
          ))}
          {filtradas.length === 0 && (
            <div className="text-center py-20 text-henko-ink-soft/70">
              <p className="font-roxborough text-2xl mb-2">No hay resultados</p>
              <p className="text-sm">
                {total === 0 ? 'Aún no hay ofertas publicadas' : 'Prueba con otros filtros'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA candidatos */}
      <section className="relative mt-24 px-6 md:px-12 py-24 md:py-28 text-center bg-henko-paper-deep hairline-t overflow-hidden">
        <span
          aria-hidden
          className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 font-roxborough italic text-[18rem] md:text-[22rem] leading-none text-henko-ink/[0.04] select-none"
        >
          &mdash;
        </span>

        <div className="relative z-10 max-w-7xl mx-auto">
          <p className="font-raleway font-semibold uppercase text-overline text-henko-turquoise mb-6 flex items-center justify-center gap-3">
            <span className="inline-block w-8 h-px bg-current opacity-60" aria-hidden="true" />
            Candidatos
            <span className="inline-block w-8 h-px bg-current opacity-60" aria-hidden="true" />
          </p>
          <h2 data-animate className="font-roxborough text-3xl md:text-5xl text-henko-ink mb-4 leading-[1.15]">
            ¿Buscas el <em className="italic font-light text-henko-turquoise">siguiente paso?</em>
          </h2>
          <p data-animate data-delay="100" className="font-roxborough italic text-lg md:text-xl text-henko-ink-soft mb-10">
            Crea tu perfil, sube tu CV y aplica con un solo clic.
          </p>

          <div data-stagger className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 text-left">
            {[
              { num: '01', title: 'Ofertas exclusivas', desc: 'Solo trabajamos con empresas donde la cultura y el talento son una prioridad real.' },
              { num: '02', title: 'Proceso transparente', desc: 'Sabrás en qué punto está tu candidatura en todo momento, sin silencio radio.' },
              { num: '03', title: 'Acompañamiento real', desc: 'No eres un CV. Te asesoramos antes y durante el proceso para que llegues preparado.' },
            ].map((b) => (
              <div key={b.num} className="bg-henko-card border border-henko-hairline rounded-[1.5rem] p-6 shadow-soft">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="font-roxborough italic text-2xl text-henko-turquoise/30 leading-none shrink-0">{b.num}</span>
                  <p className="font-roxborough italic text-henko-ink text-xl leading-tight">{b.title}</p>
                </div>
                <p className="font-raleway text-henko-ink-soft text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>

          <div data-animate data-delay="200" className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/candidato/signup"
              className="inline-flex items-center gap-2 bg-henko-turquoise text-white px-8 py-3.5 rounded-full text-[15px] font-semibold tracking-wide hover:bg-henko-turquoise-light hover:shadow-lift hover:-translate-y-0.5 transition-all duration-300"
            >
              Crear perfil de candidato →
            </Link>
            <Link
              href="/candidato/login"
              className="inline-flex items-center gap-2 bg-transparent border border-henko-hairline text-henko-ink px-8 py-3.5 rounded-full text-[15px] font-semibold tracking-wide hover:border-henko-turquoise hover:text-henko-turquoise transition-all"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function OfertaRow({ o }: { o: OfertaListing }) {
  return (
    <Link
      href={`/empleo/${o.slug}`}
      className="group relative bg-henko-card rounded-[2rem] px-8 md:px-10 py-7 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border border-henko-hairline shadow-soft hover:border-henko-turquoise/40 hover:shadow-lift hover:-translate-y-1 transition-all duration-300 ease-out-expo overflow-hidden"
    >
      <span
        aria-hidden
        className="absolute top-7 bottom-7 left-0 w-px bg-gradient-to-b from-transparent via-henko-turquoise to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-300"
      />

      <div className="relative flex-1 min-w-0 pl-2">
        <div className="flex items-center gap-3 mb-2">
          <span className="block w-6 h-px bg-henko-turquoise" />
          <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-henko-turquoise">
            Activa · {o.empresa}
          </span>
        </div>
        <h3 className="font-roxborough text-xl md:text-2xl text-henko-ink mb-2 leading-tight">{o.titulo}</h3>
        <p className="text-sm text-henko-ink-soft mb-3">{o.ubicacion}</p>
        <div className="flex gap-2 flex-wrap">
          {[o.modalidad, o.jornada, o.sector].filter(Boolean).map((tag, i) => (
            <span key={i} className="text-[11px] px-3 py-1 rounded-full font-semibold bg-henko-paper-deep text-henko-ink-soft group-hover:bg-henko-turquoise/10 group-hover:text-henko-turquoise transition-colors">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="relative text-left md:text-right flex-shrink-0">
        <p className="text-sm font-semibold text-henko-turquoise mb-1">{o.salario}</p>
        <p className="text-xs text-henko-ink-soft/70 mb-2">{o.fecha}</p>
        <p className="text-xs text-henko-turquoise font-bold tracking-wider uppercase group-hover:translate-x-1 transition-transform">
          Ver oferta →
        </p>
      </div>
    </Link>
  )
}
