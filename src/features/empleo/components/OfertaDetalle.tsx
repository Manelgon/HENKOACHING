'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Oferta } from '@/features/empleo/data'

export default function OfertaDetalle({ oferta: o }: { oferta: Oferta }) {
  const [aplicado, setAplicado] = useState(false)

  return (
    <div className="bg-henko-white pt-28 pb-24 font-raleway">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <Link
          href="/empleo"
          className="inline-flex items-center gap-1.5 text-sm text-henko-turquoise font-semibold mb-8 hover:gap-2 transition-all"
        >
          ← Volver a ofertas
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-2">
            <p className="font-raleway font-bold text-henko-turquoise tracking-[0.18em] uppercase text-[11px] mb-4">
              {o.sector}
            </p>
            <h1 className="font-roxborough text-4xl md:text-5xl text-gray-900 mb-3 leading-tight">{o.titulo}</h1>
            <p className="text-base text-gray-500 mb-6">{o.empresa} · {o.ubicacion}</p>

            <div className="flex gap-2 flex-wrap mb-10">
              {[o.modalidad, o.jornada, o.salario].map((tag, i) => (
                <span
                  key={i}
                  className={`text-xs px-4 py-1.5 rounded-full font-semibold ${
                    i === 2
                      ? 'bg-henko-greenblue text-henko-turquoise'
                      : 'text-gray-600'
                  }`}
                  style={i !== 2 ? { background: '#f2ebe5' } : undefined}
                >
                  {tag}
                </span>
              ))}
            </div>

            <h3 className="font-roxborough text-2xl text-gray-900 mb-3.5">Descripción</h3>
            <p className="text-sm leading-[1.85] text-gray-600 mb-9">{o.desc}</p>

            <h3 className="font-roxborough text-2xl text-gray-900 mb-3.5">Requisitos</h3>
            <ul className="mb-9 space-y-2.5">
              {o.requisitos.map((r, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-henko-turquoise flex-shrink-0 mt-2" />
                  <span className="text-sm text-gray-600 leading-relaxed">{r}</span>
                </li>
              ))}
            </ul>

            <h3 className="font-roxborough text-2xl text-gray-900 mb-3.5">Qué ofrecemos</h3>
            <ul className="space-y-2.5">
              {o.ofrecemos.map((r, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-henko-yellow flex-shrink-0 mt-2" />
                  <span className="text-sm text-gray-600 leading-relaxed">{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24">
            <div className="bg-henko-white border border-black/5 rounded-3xl p-8 mb-4">
              <p className="text-xs text-gray-400 mb-5">Publicada el {o.fecha}</p>
              {aplicado ? (
                <div className="text-center py-5">
                  <div className="w-12 h-12 rounded-full bg-henko-greenblue flex items-center justify-center mx-auto mb-3">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1f8f9b" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <p className="font-roxborough text-lg mb-1.5">¡Solicitud enviada!</p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Te avisaremos cuando haya novedades en tu candidatura.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={() => setAplicado(true)}
                    className="w-full inline-flex items-center justify-center gap-2 bg-henko-turquoise text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-henko-turquoise-light hover:shadow-lg transition-all"
                  >
                    Aplicar a esta oferta
                  </button>
                  <Link
                    href="/candidato/signup"
                    className="w-full inline-flex items-center justify-center gap-2 bg-transparent border-2 border-henko-turquoise text-henko-turquoise px-6 py-2.5 rounded-full text-xs font-semibold hover:bg-henko-turquoise hover:text-white transition-all"
                  >
                    Crear perfil y aplicar
                  </Link>
                </div>
              )}
            </div>
            <div className="bg-henko-turquoise rounded-3xl px-7 py-6">
              <p className="font-roxborough italic text-white text-lg leading-snug mb-2.5">
                &ldquo;El talento correcto en el rol correcto&rdquo;
              </p>
              <p className="text-[11px] text-white/65">— Henkoaching</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
