'use client'

import { useState, useRef, useEffect } from 'react'

export type AccionItem = {
  label: string
  onClick?: () => void
  iconPath?: string       // d="" de un <path> (stroke)
  disabled?: boolean
  disabledHint?: string   // tooltip cuando está deshabilitado (muestra candado)
  danger?: boolean
  divider?: boolean       // separador encima de este item
}

type Props = {
  items: AccionItem[]
  className?: string
}

export default function AccionesMenu({ items, className }: Props) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  function handleOpen(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + window.scrollY + 4, left: r.right + window.scrollX - 210 })
    }
    setOpen(v => !v)
  }

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const t = e.target as Node
      if (!btnRef.current?.contains(t) && !menuRef.current?.contains(t)) setOpen(false)
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
        className={`w-8 h-8 rounded-lg hover:bg-black/5 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors ${className ?? ''}`}
        title="Acciones"
        aria-label="Acciones"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="12" cy="19" r="1.6" />
        </svg>
      </button>
      {open && (
        <div
          ref={menuRef}
          onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
          className="fixed z-50 bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-[210px]"
          style={{ top: pos.top, left: pos.left }}
        >
          {items.map((item, i) => (
            <div key={i}>
              {item.divider && <div className="my-1 border-t border-gray-100" />}
              {item.disabled ? (
                <div
                  title={item.disabledHint}
                  className="w-full text-left px-3 py-2 text-[13px] font-medium text-gray-300 flex items-center gap-2.5 cursor-not-allowed"
                >
                  <Icon path={item.iconPath} />
                  <span className="flex items-center gap-1.5">
                    {item.label}
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75M3.75 21.75h16.5a1.5 1.5 0 001.5-1.5v-8.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v8.25a1.5 1.5 0 001.5 1.5z" />
                    </svg>
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); item.onClick?.() }}
                  className={`w-full text-left px-3 py-2 text-[13px] font-medium flex items-center gap-2.5 transition-colors ${
                    item.danger ? 'text-red-500 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon path={item.iconPath} danger={item.danger} />
                  {item.label}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function Icon({ path, danger }: { path?: string; danger?: boolean }) {
  if (!path) return <span className="w-4 h-4 flex-shrink-0" />
  return (
    <svg className={`w-4 h-4 flex-shrink-0 ${danger ? 'text-red-400' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  )
}
