'use client'

import { useState, type KeyboardEvent } from 'react'

type Props = {
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  max?: number
}

export default function KeywordsInput({ value, onChange, placeholder, max = 15 }: Props) {
  const [draft, setDraft] = useState('')

  function agregar() {
    const v = draft.trim().replace(/,$/, '').trim()
    if (!v) return
    if (value.includes(v)) { setDraft(''); return }
    if (value.length >= max) return
    onChange([...value, v])
    setDraft('')
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
      if (draft.trim()) {
        e.preventDefault()
        agregar()
      }
    } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  function quitar(idx: number) {
    onChange(value.filter((_, i) => i !== idx))
  }

  return (
    <div className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus-within:border-henko-turquoise focus-within:bg-white transition-colors flex flex-wrap items-center gap-1.5">
      {value.map((tag, idx) => (
        <span
          key={`${tag}-${idx}`}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-henko-turquoise/10 text-henko-turquoise text-xs font-raleway font-semibold"
        >
          {tag}
          <button
            type="button"
            onClick={() => quitar(idx)}
            className="hover:text-henko-turquoise-light"
            aria-label={`Quitar ${tag}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKey}
        onBlur={() => { if (draft.trim()) agregar() }}
        placeholder={value.length === 0 ? (placeholder ?? 'Escribe y pulsa Enter…') : ''}
        className="flex-1 min-w-[120px] py-1 px-1 bg-transparent outline-none font-raleway text-sm"
      />
    </div>
  )
}
