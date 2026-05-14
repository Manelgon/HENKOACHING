'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import type { OfertaListing } from '@/features/empleo/queries'

type Props = {
  ofertas: OfertaListing[]
  sectores: string[]
  modalidades: string[]
}

export default function OfertasListing({ ofertas, sectores, modalidades }: Props) {
  const [sectoresSel, setSectoresSel] = useState<string[]>([])
  const [modalidadesSel, setModalidadesSel] = useState<string[]>([])
  const [busqueda, setBusqueda] = useState('')

  const filtradas = useMemo(() => ofertas.filter(o => {
    if (sectoresSel.length > 0 && !sectoresSel.includes(o.sector)) return false
    if (modalidadesSel.length > 0 && !modalidadesSel.includes(o.modalidad)) return false
    const q = busqueda.toLowerCase()
    if (q && !o.titulo.toLowerCase().includes(q) && !o.empresa.toLowerCase().includes(q)) return false
    return true
  }), [ofertas, sectoresSel, modalidadesSel, busqueda])

  return (
    <div className="bg-white pt-24 pb-24 font-raleway">
      <PageHeader
        overline="Portal de empleo"
        title="Oportunidades de trabajo"
        subtitle="Posiciones seleccionadas por Henkoaching para empresas en transformación."
      />

      <section className="px-6 md:px-12 pt-14 max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center gap-3 mb-10">
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por cargo o empresa..."
            className="flex-1 min-w-[260px] px-5 py-3 rounded-full text-sm border-[1.5px] border-black/10 bg-white outline-none focus:border-henko-turquoise transition-colors"
          />
          <MultiSelect
            label="Sector"
            allLabel="Todos"
            options={sectores}
            selected={sectoresSel}
            onChange={setSectoresSel}
          />
          <MultiSelect
            label="Modalidad"
            allLabel="Todas"
            options={modalidades}
            selected={modalidadesSel}
            onChange={setModalidadesSel}
          />
        </div>

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
              <p className="text-sm">{ofertas.length === 0 ? 'Aún no hay ofertas publicadas' : 'Prueba con otros filtros'}</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA candidatos */}
      <section className="mt-24 px-6 md:px-12 py-20 text-center bg-gray-50">
        <div className="max-w-xl mx-auto">
          <h2 className="font-roxborough text-2xl md:text-3xl text-gray-900 mb-4">¿Eres candidato?</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Crea tu perfil, sube tu CV y aplica a las ofertas con un solo clic.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/candidato/signup"
              className="inline-flex items-center gap-2 bg-henko-turquoise text-white px-7 py-3 rounded-full text-sm font-semibold hover:bg-henko-turquoise-light hover:shadow-lg transition-all"
            >
              Crear perfil de candidato
            </Link>
            <Link
              href="/candidato/login"
              className="inline-flex items-center gap-2 bg-transparent border-2 border-henko-turquoise text-henko-turquoise px-7 py-3 rounded-full text-sm font-semibold hover:bg-henko-turquoise hover:text-white transition-all"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function MultiSelect({
  label,
  allLabel,
  options,
  selected,
  onChange,
}: {
  label: string
  allLabel: string
  options: string[]
  selected: string[]
  onChange: (next: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const toggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(s => s !== option))
    } else {
      onChange([...selected, option])
    }
  }

  const buttonLabel = selected.length === 0
    ? allLabel
    : selected.length === 1
      ? selected[0]
      : `${label} (${selected.length})`

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all border ${
          selected.length > 0
            ? 'bg-henko-turquoise text-white border-henko-turquoise'
            : 'bg-white text-gray-600 border-henko-turquoise/15 shadow-sm hover:border-henko-turquoise/40'
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{buttonLabel}</span>
        <svg
          className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-multiselectable
          className="absolute z-30 mt-2 min-w-[220px] bg-white border border-henko-turquoise/15 rounded-2xl shadow-lg py-2 max-h-[320px] overflow-y-auto"
        >
          <button
            type="button"
            onClick={() => onChange([])}
            className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-gray-50 transition-colors ${
              selected.length === 0 ? 'text-henko-turquoise font-semibold' : 'text-gray-700'
            }`}
          >
            <span className="w-4 h-4 rounded border border-gray-300 flex items-center justify-center flex-shrink-0">
              {selected.length === 0 && <span className="w-2 h-2 rounded-sm bg-henko-turquoise" />}
            </span>
            {allLabel}
          </button>
          <div className="my-1 border-t border-gray-100" />
          {options.map(option => {
            const checked = selected.includes(option)
            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={checked}
                onClick={() => toggle(option)}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                  checked ? 'text-henko-turquoise font-semibold' : 'text-gray-700'
                }`}
              >
                <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                  checked ? 'border-henko-turquoise bg-henko-turquoise' : 'border-gray-300'
                }`}>
                  {checked && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                {option}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function OfertaRow({ o }: { o: OfertaListing }) {
  return (
    <Link
      href={`/empleo/${o.slug}`}
      className="group bg-white rounded-3xl px-9 py-7 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border border-henko-turquoise/15 shadow-sm hover:border-henko-turquoise/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
          <h3 className="font-roxborough text-xl text-gray-900">{o.titulo}</h3>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-henko-turquoise/10 text-henko-turquoise tracking-wider">
            ACTIVA
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-3">{o.empresa} · {o.ubicacion}</p>
        <div className="flex gap-2 flex-wrap">
          {[o.modalidad, o.jornada, o.sector].filter(Boolean).map((tag, i) => (
            <span key={i} className="text-xs px-3 py-1 rounded-full font-semibold bg-gray-100 text-gray-600">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="text-left md:text-right flex-shrink-0">
        <p className="text-sm font-semibold text-henko-turquoise mb-1">{o.salario}</p>
        <p className="text-xs text-gray-400">{o.fecha}</p>
        <p className="text-xs text-henko-turquoise mt-2 font-semibold group-hover:translate-x-1 transition-transform">Ver oferta →</p>
      </div>
    </Link>
  )
}
