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
    <main className="pt-24">

      {/* Hero */}
      <section className="bg-henko-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <p className="section-title text-sm mb-4">Contacto</p>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Hablemos
          </h1>
          <p className="text-xl text-gray-500 font-raleway max-w-xl leading-relaxed">
            Sin formularios kilométricos, sin presupuestos automáticos. Solo una conversación
            para ver si tiene sentido trabajar juntos.
          </p>
        </div>
      </section>

      {/* Formulario + info */}
      <section className="bg-henko-white py-16 pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

            {/* Formulario */}
            <div>
              {submitted ? (
                <div className="bg-henko-greenblue/20 border border-henko-greenblue p-10">
                  <div className="w-3 h-3 rounded-full bg-henko-turquoise mb-6" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Mensaje recibido.
                  </h2>
                  <p className="text-gray-500 font-raleway leading-relaxed">
                    Gracias por escribir. Respondo en 24-48 horas para acordar una primera llamada.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block font-raleway text-sm text-gray-500 uppercase tracking-widest mb-2" htmlFor="nombre">
                      Tu nombre
                    </label>
                    <input
                      id="nombre"
                      name="nombre"
                      type="text"
                      required
                      className="w-full border border-gray-200 bg-transparent px-4 py-3 font-raleway text-gray-800 text-sm outline-none focus:border-henko-turquoise transition-colors"
                      placeholder="Jennifer García"
                    />
                  </div>

                  <div>
                    <label className="block font-raleway text-sm text-gray-500 uppercase tracking-widest mb-2" htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="w-full border border-gray-200 bg-transparent px-4 py-3 font-raleway text-gray-800 text-sm outline-none focus:border-henko-turquoise transition-colors"
                      placeholder="hola@tuempresa.com"
                    />
                  </div>

                  <div>
                    <label className="block font-raleway text-sm text-gray-500 uppercase tracking-widest mb-2" htmlFor="empresa">
                      Tu empresa (opcional)
                    </label>
                    <input
                      id="empresa"
                      name="empresa"
                      type="text"
                      className="w-full border border-gray-200 bg-transparent px-4 py-3 font-raleway text-gray-800 text-sm outline-none focus:border-henko-turquoise transition-colors"
                      placeholder="Nombre de tu empresa"
                    />
                  </div>

                  <div>
                    <label className="block font-raleway text-sm text-gray-500 uppercase tracking-widest mb-2" htmlFor="mensaje">
                      Cuéntame brevemente dónde está tu empresa ahora
                    </label>
                    <textarea
                      id="mensaje"
                      name="mensaje"
                      rows={5}
                      required
                      className="w-full border border-gray-200 bg-transparent px-4 py-3 font-raleway text-gray-800 text-sm outline-none focus:border-henko-turquoise transition-colors resize-none"
                      placeholder="Qué está pasando, qué quieres que sea diferente, qué has intentado…"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Enviando…
                      </>
                    ) : (
                      'Enviar mensaje'
                    )}
                  </button>

                  <p className="text-gray-400 font-raleway text-xs text-center">
                    Respondo en 24-48 horas.
                  </p>
                </form>
              )}
            </div>

            {/* Info lateral */}
            <div className="space-y-10">
              <div>
                <p className="section-title text-xs mb-3">Qué pasa después</p>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Una primera llamada de 30 minutos
                </h2>
                <div className="space-y-4 text-gray-500 font-raleway text-sm leading-relaxed">
                  <p>Sin preparación previa. Me cuentas cómo está la empresa y qué te gustaría que fuera diferente.</p>
                  <p>Yo te cuento si y cómo podría ayudarte. Si hay encaje, acordamos los siguientes pasos. Si no, te digo la verdad igualmente.</p>
                  <p className="text-henko-turquoise font-semibold">Sin compromiso. Sin presión.</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-10">
                <p className="section-title text-xs mb-4">Ubicación</p>
                <p className="text-gray-600 font-raleway text-sm">Mallorca, España</p>
                <p className="text-gray-400 font-raleway text-sm mt-1">Trabajo con empresas de toda España (presencial y remoto)</p>
              </div>

              {/* Quote */}
              <div className="bg-henko-greenblue/20 p-8">
                <p className="text-henko-turquoise text-lg leading-relaxed">
                  "Si sientes que tu empresa podría funcionar mejor,<br />probablemente tengas razón."
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

    </main>
  )
}
