'use client'

import { useEffect, useRef, useState } from 'react'
import { buscarContactos, type ContactoEncontrado } from '@/actions/citas'

// Buscador de contactos del CRM (leads, clientes, candidatos) para vincular
// eventos/tareas del calendario. La vinculación es opcional: si no se
// selecciona nadie, el flujo del calendario sigue siendo el de siempre.
const TIPO_LABEL: Record<ContactoEncontrado['tipo'], string> = {
  lead: 'Lead',
  cliente: 'Cliente',
  candidato: 'Candidato',
}

// Valor sentinela: el usuario quiere título libre en vez de un tipo del catálogo
export const TIPO_OTRO = '__otro__'

export function VinculoTipoSelect({ tipos, value, onChange }: { tipos: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-raleway">Tipo</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="text-sm font-raleway border border-gray-200 rounded-xl px-2 py-1.5 focus:outline-none focus:border-henko-turquoise bg-white"
      >
        {tipos.map(t => <option key={t} value={t}>{t}</option>)}
        <option value={TIPO_OTRO}>Otro (título libre)</option>
      </select>
    </div>
  )
}

export function VinculoInvitarToggle({ email, checked, onToggle }: { email: string | null; checked: boolean; onToggle: () => void }) {
  const activo = checked && !!email
  return (
    <button
      type="button"
      onClick={() => email && onToggle()}
      disabled={!email}
      className={`flex items-center justify-between gap-3 w-full pr-2 py-1 text-left ${!email ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span className={`text-sm font-raleway ${activo ? 'text-henko-turquoise' : 'text-gray-400'}`}>
        Invitar por email + Google Meet
        <span className="block text-[11px] text-gray-400">{email ?? 'Sin email de contacto'}</span>
      </span>
      <div className={`w-8 h-4 rounded-full transition-colors flex-shrink-0 ${activo ? 'bg-henko-turquoise' : 'bg-gray-200'} relative`}>
        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${activo ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </div>
    </button>
  )
}

type Props = {
  contacto: ContactoEncontrado | null
  onSelect: (c: ContactoEncontrado) => void
  onClear: () => void
}

export default function ContactoSelector({ contacto, onSelect, onClear }: Props) {
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState<ContactoEncontrado[]>([])
  const [buscando, setBuscando] = useState(false)
  const [abierto, setAbierto] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Búsqueda con debounce
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    const q = query.trim()
    if (q.length < 2) {
      setResultados([])
      setBuscando(false)
      return
    }
    setBuscando(true)
    timer.current = setTimeout(() => {
      buscarContactos(q)
        .then(r => { setResultados(r); setAbierto(true) })
        .catch(() => setResultados([]))
        .finally(() => setBuscando(false))
    }, 300)
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [query])

  if (contacto) {
    return (
      <div className="flex items-center gap-2 py-1.5 flex-wrap">
        <span className="flex items-center gap-1.5 text-sm font-raleway bg-henko-turquoise/10 text-henko-turquoise font-semibold px-3 py-1.5 rounded-full">
          {contacto.nombre}
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{TIPO_LABEL[contacto.tipo]}</span>
          <button
            type="button"
            onClick={onClear}
            aria-label="Quitar vínculo"
            className="ml-0.5 text-henko-turquoise/60 hover:text-red-500 transition-colors"
          >
            ×
          </button>
        </span>
        {contacto.email
          ? <span className="text-xs text-gray-400 font-raleway truncate">{contacto.email}</span>
          : <span className="text-xs text-amber-500 font-raleway">Sin email</span>}
      </div>
    )
  }

  return (
    <div className="relative py-1.5 w-full">
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => { if (resultados.length) setAbierto(true) }}
        placeholder="Vincular lead, cliente o candidato…"
        className="w-full text-sm font-raleway border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-henko-turquoise"
      />
      {buscando && <p className="text-[11px] text-gray-400 font-raleway mt-1">Buscando…</p>}
      {abierto && !buscando && query.trim().length >= 2 && (
        <div className="absolute z-20 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-1 max-h-56 overflow-y-auto">
          {resultados.length === 0 ? (
            <p className="px-3 py-2 text-xs text-gray-400 font-raleway italic">Sin resultados</p>
          ) : (
            resultados.map(r => (
              <button
                key={`${r.tipo}-${r.id}`}
                type="button"
                onClick={() => { onSelect(r); setQuery(''); setResultados([]); setAbierto(false) }}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-raleway text-sm text-gray-800 truncate">{r.nombre}</span>
                  <span className="font-raleway text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-bold uppercase tracking-wider flex-shrink-0">
                    {TIPO_LABEL[r.tipo]}
                  </span>
                </div>
                <p className="font-raleway text-[11px] text-gray-400 truncate">
                  {r.email ?? 'Sin email'}{r.contexto ? ` · ${r.contexto}` : ''}
                </p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
