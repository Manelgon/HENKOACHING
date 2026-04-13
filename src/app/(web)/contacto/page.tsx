'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'

export default function ContactoPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    // Simulamos envío — aquí conectarías con tu backend o servicio de email
    await new Promise((res) => setTimeout(res, 1200))
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div className="bg-henko-white text-gray-900 selection:bg-henko-turquoise selection:text-white overflow-x-hidden pt-24 font-raleway min-h-screen flex flex-col">

      {/* Hero Section */}
      <section className="relative px-6 md:px-12 py-16 md:py-24 max-w-7xl mx-auto flex flex-col justify-center items-center text-center">
        <span className="font-hey-gotcha text-[150px] md:text-[200px] text-henko-turquoise/5 absolute top-0 left-1/2 -translate-x-1/2 select-none pointer-events-none">
          Hablemos
        </span>
        <div className="relative z-10 max-w-3xl">
          <span data-animate className="inline-block px-4 py-1 rounded-full bg-henko-greenblue/15 text-henko-turquoise font-semibold text-xs uppercase tracking-widest mb-6">
            Contacto
          </span>
          <h1 data-animate data-delay="100" className="text-5xl md:text-7xl font-roxborough leading-tight mb-8">
            Comencemos la conversación
          </h1>
          <p data-animate data-delay="200" className="text-xl md:text-2xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
            Sin formularios kilométricos, sin presupuestos automáticos. Solo una charla para ver si tiene sentido trabajar juntos.
          </p>
        </div>
      </section>

      {/* Formulario y Bento Info */}
      <section className="px-6 md:px-12 pb-32 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Formulario (Columna Principal) */}
          <div data-animate="left" className="lg:col-span-7 bg-white p-10 md:p-14 rounded-[3rem] shadow-sm border border-gray-100 relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-henko-turquoise/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

            {submitted ? (
              <div className="flex flex-col items-center justify-center text-center py-12 relative z-10">
                <div className="w-24 h-24 bg-henko-greenblue/20 rounded-full flex items-center justify-center mb-8">
                  <svg className="w-12 h-12 text-henko-turquoise" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-4xl font-roxborough text-gray-900 mb-6">
                  ¡Mensaje recibido!
                </h2>
                <p className="text-lg text-gray-600 font-light max-w-md mx-auto leading-relaxed">
                  Gracias por escribir. Responderé en un plazo de 24-48 horas para acordar nuestra primera llamada.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8 relative z-10 w-full">
                <h3 className="text-3xl font-roxborough mb-8">Escríbeme</h3>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-widest pl-1" htmlFor="nombre">
                    Tu nombre
                  </label>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    required
                    className="w-full bg-gray-50 border border-gray-200 px-6 py-4 rounded-2xl text-gray-800 text-lg outline-none focus:border-henko-turquoise focus:bg-white focus:ring-4 focus:ring-henko-turquoise/10 transition-all"
                    placeholder="Ej. Laura Gómez"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-widest pl-1" htmlFor="email">
                    Tu email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full bg-gray-50 border border-gray-200 px-6 py-4 rounded-2xl text-gray-800 text-lg outline-none focus:border-henko-turquoise focus:bg-white focus:ring-4 focus:ring-henko-turquoise/10 transition-all"
                    placeholder="hola@tuempresa.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-widest pl-1" htmlFor="empresa">
                    Tu empresa <span className="text-gray-400 font-normal normal-case tracking-normal">(Opcional)</span>
                  </label>
                  <input
                    id="empresa"
                    name="empresa"
                    type="text"
                    className="w-full bg-gray-50 border border-gray-200 px-6 py-4 rounded-2xl text-gray-800 text-lg outline-none focus:border-henko-turquoise focus:bg-white focus:ring-4 focus:ring-henko-turquoise/10 transition-all"
                    placeholder="Nombre de tu empresa"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-widest pl-1" htmlFor="mensaje">
                    ¿Dónde está tu empresa ahora?
                  </label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    rows={5}
                    required
                    className="w-full bg-gray-50 border border-gray-200 px-6 py-4 rounded-2xl text-gray-800 text-lg outline-none focus:border-henko-turquoise focus:bg-white focus:ring-4 focus:ring-henko-turquoise/10 transition-all resize-none"
                    placeholder="Cuéntame brevemente qué está pasando, qué quieres que sea diferente, qué has intentado…"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-br from-henko-turquoise to-henko-greenblue text-white px-10 py-5 rounded-2xl font-bold shadow-lg hover:shadow-henko-turquoise/20 transition-all text-lg flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enviando mensaje...
                    </>
                  ) : (
                    <>
                      Enviar mensaje
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Columna Lateral - Bento Grid para Info */}
          <div data-animate="right" className="lg:col-span-5 flex flex-col gap-8 h-full">

            {/* Card: Qué pasa después */}
            <div className="bg-henko-greenblue/10 p-10 rounded-[3rem] border border-gray-100 flex-1 relative overflow-hidden group hover:shadow-md transition-shadow min-h-[300px]">
              <svg className="absolute -right-8 -bottom-8 w-48 h-48 text-henko-turquoise/5 group-hover:scale-110 transition-transform duration-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z" />
              </svg>
              <div className="relative z-10 flex flex-col justify-center h-full">
                <span className="inline-block px-4 py-1 rounded-full bg-white text-henko-turquoise font-bold text-xs uppercase tracking-widest mb-6 shadow-sm self-start">
                  Proceso
                </span>
                <h3 className="text-3xl font-roxborough mb-6 text-gray-900 leading-tight">
                  Una primera llamada
                </h3>
                <div className="space-y-4 text-gray-600 font-light leading-relaxed">
                  <p>Sin preparación previa. Me cuentas cómo está la empresa y qué te gustaría que fuera diferente.</p>
                  <p>Yo te cuento cómo podría ayudarte. Si hay encaje, acordamos siguientes pasos. Si no, te digo la verdad.</p>
                  <p className="font-semibold text-henko-turquoise pt-2">Sin compromiso. Sin presión.</p>
                </div>
              </div>
            </div>

            {/* Card: Ubicación */}
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 group hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-henko-turquoise/10 text-henko-turquoise rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-henko-turquoise group-hover:text-white transition-colors duration-300">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-roxborough mb-2">Mallorca, España</h4>
                <p className="text-sm text-gray-500 font-light">
                  Trabajo con empresas de toda España (presencial y remoto).
                </p>
              </div>
            </div>

            {/* Card: Quote */}
            <div className="bg-gradient-to-br from-henko-purple/15 to-purple-100/60 border border-purple-200/50 p-10 rounded-[3rem] shadow-xl relative overflow-hidden flex flex-col justify-center min-h-[220px]">
              <svg className="w-12 h-12 text-henko-purple mb-6 opacity-40" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-2xl font-roxborough italic leading-relaxed relative z-10 font-light text-gray-900">
                "Si sientes que tu empresa podría funcionar mejor, probablemente tengas razón."
              </p>
            </div>

          </div>
        </div>
      </section>

    </div>
  )
}
