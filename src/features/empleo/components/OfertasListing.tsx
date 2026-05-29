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
    <div className="bg-white pt-24 font-raleway">
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

      <section className="px-6 md:px-12 pt-10 max-w-7xl mx-auto">
        <OfertasFiltros
          sectores={sectores}
          modalidades={modalidades}
          activeSectores={activeSectores}
          activeModalidades={activeModalidades}
          busqueda={busqueda}
        />

        <p className="text-xs text-gray-400 tracking-wider mb-6">
          {filtradas.length} oferta{filtradas.length !== 1 ? 's' : ''} disponible{filtradas.length !== 1 ? 's' : ''}
        </p>

        <div className="flex flex-col gap-3.5">
          {filtradas.map(o => (
            <OfertaRow key={o.id} o={o} />
          ))}
          {filtradas.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p className="font-roxborough text-2xl mb-2">No hay resultados</p>
              <p className="text-sm">
                {total === 0 ? 'Aún no hay ofertas publicadas' : 'Prueba con otros filtros'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA candidatos */}
      <section className="relative mt-24 px-6 md:px-12 py-24 md:py-28 text-center bg-henko-turquoise overflow-hidden">
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
              Candidatos
            </p>
            <span className="block w-8 h-px bg-white/60" />
          </div>
          <h2 data-animate className="font-roxborough text-3xl md:text-5xl text-white mb-4 leading-[1.15]">
            ¿Buscas el<br />
            <em className="italic font-light">siguiente paso?</em>
          </h2>
          <p data-animate data-delay="100" className="font-roxborough italic text-lg md:text-xl text-white/90 mb-10">
            Crea tu perfil, sube tu CV y aplica con un solo clic.
          </p>
          <div data-animate data-delay="200" className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/candidato/signup"
              className="inline-flex items-center gap-2 bg-white text-henko-turquoise px-8 py-3.5 rounded-full text-[15px] font-semibold tracking-wide hover:bg-gray-50 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              Crear perfil de candidato →
            </Link>
            <Link
              href="/candidato/login"
              className="inline-flex items-center gap-2 bg-transparent border-2 border-white text-white px-8 py-3.5 rounded-full text-[15px] font-semibold tracking-wide hover:bg-white hover:text-henko-turquoise transition-all"
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
      className="group relative bg-white rounded-[2rem] px-8 md:px-10 py-7 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border border-henko-turquoise/15 shadow-sm hover:border-henko-turquoise/40 hover:shadow-[0_16px_48px_rgba(31,143,155,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
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
        <h3 className="font-roxborough text-xl md:text-2xl text-gray-900 mb-2 leading-tight">{o.titulo}</h3>
        <p className="text-sm text-gray-500 mb-3">{o.ubicacion}</p>
        <div className="flex gap-2 flex-wrap">
          {[o.modalidad, o.jornada, o.sector].filter(Boolean).map((tag, i) => (
            <span key={i} className="text-[11px] px-3 py-1 rounded-full font-semibold bg-gray-100 text-gray-600 group-hover:bg-henko-turquoise/10 group-hover:text-henko-turquoise transition-colors">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="relative text-left md:text-right flex-shrink-0">
        <p className="text-sm font-semibold text-henko-turquoise mb-1">{o.salario}</p>
        <p className="text-xs text-gray-400 mb-2">{o.fecha}</p>
        <p className="text-xs text-henko-turquoise font-bold tracking-wider uppercase group-hover:translate-x-1 transition-transform">
          Ver oferta →
        </p>
      </div>
    </Link>
  )
}
