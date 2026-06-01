'use client'

import { useEffect, useRef, useState } from 'react'

export type SelectOption = {
  value: string
  label: string
  dot?: string // clase Tailwind de color para el punto (ej. 'bg-henko-turquoise')
}

type Props = {
  value: string
  onChange: (v: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
}

export default function CustomSelect({ value, onChange, options, placeholder = 'Seleccionar…', className = '' }: Props) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)

  const selected = options.find(o => o.value === value)

  function handleOpen() {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + window.scrollY + 4, left: r.left + window.scrollX, width: r.width })
    }
    setOpen(v => !v)
  }

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        className={`inline-flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-raleway outline-none hover:border-henko-turquoise hover:bg-white transition-colors text-left ${open ? 'border-henko-turquoise bg-white' : ''} ${className}`}
      >
        <span className={selected ? 'text-gray-900' : 'text-gray-400'}>
          {selected?.label ?? placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed z-50 bg-white rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden"
          style={{ top: pos.top, left: pos.left, minWidth: pos.width }}
        >
          {options.map(op => (
            <button
              key={op.value}
              type="button"
              onClick={() => { setOpen(false); onChange(op.value) }}
              className={`w-full text-left px-4 py-2 text-sm font-raleway flex items-center gap-2.5 transition-colors
                ${op.value === value ? 'bg-henko-turquoise/5 text-henko-turquoise font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              {op.dot && <span className={`w-2 h-2 rounded-full flex-shrink-0 ${op.dot}`} />}
              {op.label}
            </button>
          ))}
        </div>
      )}
    </>
  )
}
