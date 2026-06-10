'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  onAgendar: () => void
  onDescargarCv?: () => void   // undefined si el candidato no tiene CV
  trayectoriaUrl: string       // /api/dashboard/candidatos/{id}/pdf
  tieneTrayectoria: boolean     // bloquea "Descargar trayectoria" si está vacía
  perfilUrl: string            // /dashboard/candidatos/{id}
}

export default function AccionesDropdown({ onAgendar, onDescargarCv, trayectoriaUrl, tieneTrayectoria, perfilUrl }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  function handleOpen(e: React.MouseEvent) {
    e.stopPropagation()
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      // alineado a la derecha del botón
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

  function run(fn: () => void) {
    setOpen(false)
    fn()
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        className="w-8 h-8 rounded-lg hover:bg-black/5 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
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
          className="fixed z-50 bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-[210px]"
          style={{ top: pos.top, left: pos.left }}
        >
          <MenuItem onClick={() => run(onAgendar)} label="Agendar entrevista">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </MenuItem>

          {onDescargarCv ? (
            <MenuItem onClick={() => run(onDescargarCv)} label="Descargar CV">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </MenuItem>
          ) : (
            <MenuItemDisabled label="Sin CV" hint="El candidato no adjuntó CV">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </MenuItemDisabled>
          )}

          {tieneTrayectoria ? (
            <MenuItem onClick={() => run(() => window.open(trayectoriaUrl, '_blank', 'noopener'))} label="Descargar trayectoria">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </MenuItem>
          ) : (
            <MenuItemDisabled label="Trayectoria" hint="El candidato aún no ha rellenado su trayectoria">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </MenuItemDisabled>
          )}

          <div className="my-1 border-t border-gray-100" />

          <MenuItem onClick={() => run(() => router.push(perfilUrl))} label="Ver perfil completo">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0v.75H4.5v-.75z" />
          </MenuItem>
        </div>
      )}
    </>
  )
}

function MenuItem({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick() }}
      className="w-full text-left px-3 py-2 text-[13px] font-medium text-gray-700 flex items-center gap-2.5 hover:bg-gray-50 transition-colors"
    >
      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>{children}</svg>
      {label}
    </button>
  )
}

function MenuItemDisabled({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div
      title={hint}
      className="w-full text-left px-3 py-2 text-[13px] font-medium text-gray-300 flex items-center gap-2.5 cursor-not-allowed"
    >
      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>{children}</svg>
      <span className="flex items-center gap-1.5">
        {label}
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75M3.75 21.75h16.5a1.5 1.5 0 001.5-1.5v-8.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v8.25a1.5 1.5 0 001.5 1.5z" />
        </svg>
      </span>
    </div>
  )
}
