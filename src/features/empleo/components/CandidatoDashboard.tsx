'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MIS_SOLICITUDES, OFERTAS, ESTADO_SOL } from '@/features/empleo/data'

type Tab = 'solicitudes' | 'perfil' | 'cv'

const NAV: { id: Tab; label: string }[] = [
  { id: 'solicitudes', label: 'Mis solicitudes' },
  { id: 'perfil',      label: 'Mi perfil' },
  { id: 'cv',          label: 'Mi CV' },
]

export default function CandidatoDashboard() {
  const [tab, setTab] = useState<Tab>('solicitudes')

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[220px_1fr] bg-[#f5f0eb] font-raleway">
      {/* Sidebar */}
      <aside className="bg-henko-yellow flex flex-col py-8 md:sticky md:top-0 md:h-screen">
        <div className="px-6 pb-7">
          <Link href="/">
            <Image src="/henkologo.png" alt="Henkoaching" width={140} height={40} className="object-contain" />
          </Link>
        </div>
        <div className="px-3 flex-1">
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm mb-0.5 flex items-center gap-2.5 transition-all ${
                tab === item.id
                  ? 'bg-black/10 text-gray-900 font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${tab === item.id ? 'bg-henko-turquoise' : 'bg-transparent'}`}
              />
              {item.label}
            </button>
          ))}
        </div>
        <div className="px-3 pt-5 border-t border-black/10 mx-3">
          <div className="px-3.5 py-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-henko-turquoise flex items-center justify-center text-xs text-white font-bold">
              MG
            </div>
            <div>
              <p className="text-sm font-semibold">María García</p>
              <p className="text-[10px] text-gray-500">Candidata</p>
            </div>
          </div>
          <Link
            href="/empleo"
            className="block w-full px-3.5 py-2 rounded-xl text-xs text-gray-500 hover:text-gray-900 transition-colors"
          >
            ← Ver ofertas
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="p-8 md:p-12 overflow-y-auto">
        {tab === 'solicitudes' && <TabSolicitudes />}
        {tab === 'perfil' && <TabPerfil />}
        {tab === 'cv' && <TabCV />}
      </main>
    </div>
  )
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="font-raleway font-bold text-henko-turquoise tracking-[0.18em] uppercase text-[11px] mb-2">{children}</p>
}

function TabSolicitudes() {
  return (
    <div>
      <Eyebrow>Mi área</Eyebrow>
      <h2 className="font-roxborough text-3xl md:text-4xl text-gray-900 mb-8">Mis solicitudes</h2>

      <div className="flex flex-col gap-3.5">
        {MIS_SOLICITUDES.map((s, i) => {
          const o = OFERTAS.find(x => x.id === s.ofertaId)
          const meta = ESTADO_SOL[s.estado]
          return (
            <div
              key={i}
              className="bg-white rounded-2xl px-8 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-black/5"
            >
              <div>
                <p className="font-roxborough text-lg mb-1">{o?.titulo}</p>
                <p className="text-xs text-gray-400">{o?.empresa} · Aplicado el {s.fecha}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-[11px] px-3.5 py-1 rounded-full font-bold ${meta.badge}`}>
                  {meta.label}
                </span>
                <Link
                  href={`/empleo/${s.ofertaId}`}
                  className="text-xs text-henko-turquoise font-semibold hover:underline whitespace-nowrap"
                >
                  Ver oferta →
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-7">
        <Link
          href="/empleo"
          className="inline-flex items-center gap-2 bg-transparent border-2 border-henko-turquoise text-henko-turquoise px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-henko-turquoise hover:text-white transition-all"
        >
          Ver más ofertas →
        </Link>
      </div>
    </div>
  )
}

function TabPerfil() {
  const data: [string, string][] = [
    ['NOMBRE', 'María García'],
    ['EMAIL', 'maria@ejemplo.com'],
    ['TELÉFONO', '+34 600 123 456'],
    ['UBICACIÓN', 'Palma, Mallorca'],
    ['CARGO OBJETIVO', 'Responsable de Operaciones'],
  ]
  return (
    <div>
      <Eyebrow>Mi perfil</Eyebrow>
      <h2 className="font-roxborough text-3xl md:text-4xl text-gray-900 mb-8">Datos personales</h2>

      <div className="bg-white rounded-2xl px-9 py-8 border border-black/5 max-w-xl">
        {data.map(([l, v]) => (
          <div key={l} className="mb-5">
            <p className="text-[10px] tracking-[0.14em] text-henko-turquoise font-bold mb-1.5">{l}</p>
            <p className="text-sm text-gray-900 px-4 py-3 bg-henko-white rounded-xl">{v}</p>
          </div>
        ))}
        <button
          type="button"
          className="mt-2 inline-flex items-center gap-2 bg-henko-turquoise text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-henko-turquoise-light hover:shadow-lg transition-all"
        >
          Guardar cambios
        </button>
      </div>
    </div>
  )
}

function TabCV() {
  return (
    <div>
      <Eyebrow>Mi CV</Eyebrow>
      <h2 className="font-roxborough text-3xl md:text-4xl text-gray-900 mb-8">Currículum</h2>

      <div className="bg-white rounded-2xl px-9 py-10 border border-black/5 max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-henko-greenblue flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1f8f9b" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <p className="font-roxborough text-xl mb-1.5">CV_Maria_Garcia.pdf</p>
        <p className="text-xs text-gray-400 mb-6">Subido el 18 de abril de 2026</p>
        <div className="flex flex-col gap-2.5 items-center">
          <button
            type="button"
            className="inline-flex items-center gap-2 bg-transparent border-2 border-henko-turquoise text-henko-turquoise px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-henko-turquoise hover:text-white transition-all"
          >
            Descargar
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 bg-henko-turquoise text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-henko-turquoise-light hover:shadow-lg transition-all"
          >
            Actualizar CV
          </button>
        </div>
      </div>
    </div>
  )
}
