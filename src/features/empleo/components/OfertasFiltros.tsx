'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState, useRef, useEffect, useTransition } from 'react'

type Props = {
  sectores: string[]
  modalidades: string[]
  activeSectores: string[]
  activeModalidades: string[]
  busqueda: string
}

export default function OfertasFiltros({
  sectores,
  modalidades,
  activeSectores,
  activeModalidades,
  busqueda,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [localBusqueda, setLocalBusqueda] = useState(busqueda)
  const [, startTransition] = useTransition()

  const pushUrl = (newSectores: string[], newModalidades: string[], q: string) => {
    const params = new URLSearchParams()
    newSectores.forEach(s => params.append('sector', s))
    newModalidades.forEach(m => params.append('modalidad', m))
    if (q.trim()) params.set('q', q.trim())
    const qs = params.toString()
    startTransition(() => {
      router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
    })
  }

  // Debounce search input — sector/modalidad changes are immediate
  useEffect(() => {
    const timer = setTimeout(() => {
      // Read current URL to preserve sector/modalidad params
      const current = new URLSearchParams(window.location.search)
      const currentSectores = current.getAll('sector')
      const currentModalidades = current.getAll('modalidad')
      pushUrl(currentSectores, currentModalidades, localBusqueda)
    }, 400)
    return () => clearTimeout(timer)
  }, [localBusqueda]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-wrap items-center gap-3 mb-10">
      <input
        value={localBusqueda}
        onChange={e => setLocalBusqueda(e.target.value)}
        placeholder="Buscar por cargo o empresa..."
        className="flex-1 min-w-[260px] px-5 py-3 rounded-full text-sm border-[1.5px] border-henko-hairline bg-henko-card text-henko-ink placeholder:text-henko-ink-soft/50 outline-none focus:border-henko-turquoise transition-colors"
      />
      <MultiSelect
        label="Sector"
        allLabel="Todos"
        options={sectores}
        selected={activeSectores}
        onChange={next => pushUrl(next, activeModalidades, localBusqueda)}
      />
      <MultiSelect
        label="Modalidad"
        allLabel="Todas"
        options={modalidades}
        selected={activeModalidades}
        onChange={next => pushUrl(activeSectores, next, localBusqueda)}
      />
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
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const toggle = (option: string) => {
    onChange(selected.includes(option)
      ? selected.filter(s => s !== option)
      : [...selected, option])
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
            : 'bg-henko-card text-henko-ink-soft border-henko-hairline shadow-soft hover:border-henko-turquoise/40'
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
