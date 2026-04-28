'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import PageHeader from '@/components/PageHeader'
import { crearLead } from '@/actions/leads'
import { useAction } from '@/shared/feedback/FeedbackContext'

export default function ContactoPage() {
  const runAction = useAction()
  const [form, setForm] = useState({ nombre: '', empresa: '', email: '', servicio: '', mensaje: '' })
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const result = await runAction(
      'Enviando mensaje',
      () => crearLead({
        tipo: 'contacto_general',
        nombre: form.nombre,
        email: form.email,
        asunto: form.empresa ? `Contacto de ${form.empresa}` : 'Consulta general',
        mensaje: form.mensaje,
        servicio_interes: form.servicio || undefined,
      }),
      { successMessage: 'Mensaje enviado, te respondo en menos de 24h' },
    )
    if (result.ok) setSent(true)
  }

  const inputClass = 'w-full px-4 py-3.5 rounded-2xl text-sm border-[1.5px] border-black/10 bg-white text-gray-900 outline-none focus:border-henko-turquoise transition-colors'
  const labelClass = 'text-[11px] tracking-[0.12em] font-bold text-henko-turquoise mb-1.5 block'

  return (
    <div className="bg-henko-white pt-24 font-raleway">
      <PageHeader
        overline="Contacto"
        title="Hablemos"
        subtitle="Primera consulta gratuita de 45 minutos. Sin compromiso."
        bgClass="bg-henko-coral"
        dark={false}
      />

      <section className="px-6 md:px-12 py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20">
          {/* Form */}
          <div>
            {sent ? (
              <div className="bg-henko-greenblue rounded-[2.5rem] px-12 py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-henko-turquoise mx-auto mb-5 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2 className="font-roxborough text-3xl md:text-4xl text-gray-900 mb-3">¡Mensaje enviado!</h2>
                <p className="text-[15px] leading-relaxed text-gray-700 opacity-80">
                  Te respondo en menos de 24h para acordar tu consulta gratuita.
                </p>
                <button
                  type="button"
                  onClick={() => { setSent(false); setForm({ nombre: '', empresa: '', email: '', servicio: '', mensaje: '' }) }}
                  className="mt-7 inline-flex items-center gap-2 bg-henko-turquoise text-white px-7 py-3 rounded-full text-sm font-semibold hover:bg-henko-turquoise-light hover:shadow-lg transition-all"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 className="font-roxborough text-3xl md:text-5xl text-gray-900 mb-9 leading-tight">Escríbeme</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={labelClass} htmlFor="nombre">NOMBRE</label>
                    <input id="nombre" name="nombre" type="text" required placeholder="Tu nombre" className={inputClass}
                      value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="empresa">EMPRESA</label>
                    <input id="empresa" name="empresa" type="text" placeholder="Tu empresa" className={inputClass}
                      value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} />
                  </div>
                </div>

                <div className="mb-4">
                  <label className={labelClass} htmlFor="email">EMAIL</label>
                  <input id="email" name="email" type="email" required placeholder="tu@email.com" className={inputClass}
                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>

                <div className="mb-4">
                  <label className={labelClass} htmlFor="servicio">¿QUÉ TE INTERESA?</label>
                  <select id="servicio" name="servicio" className={inputClass + ' appearance-none'}
                    value={form.servicio} onChange={(e) => setForm({ ...form, servicio: e.target.value })}>
                    <option value="">Selecciona un servicio</option>
                    <option>Consultoría de Operaciones</option>
                    <option>Reclutamiento Consciente</option>
                    <option>Desarrollo de Liderazgo</option>
                    <option>No lo sé todavía</option>
                  </select>
                </div>

                <div className="mb-8">
                  <label className={labelClass} htmlFor="mensaje">CUÉNTAME</label>
                  <textarea id="mensaje" name="mensaje" rows={5} required
                    placeholder="¿Qué está pasando en tu empresa? ¿Qué te trajo hasta aquí?"
                    className={inputClass + ' resize-y leading-relaxed'}
                    value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })} />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 bg-henko-turquoise text-white px-7 py-4 rounded-full text-[15px] font-semibold hover:bg-henko-turquoise-light hover:shadow-lg transition-all"
                >
                  Enviar mensaje →
                </button>
              </form>
            )}
          </div>

          {/* Info */}
          <div className="pt-2">
            <h2 className="font-roxborough text-3xl md:text-5xl text-gray-900 mb-6 leading-tight">
              Mallorca<br />
              <em className="italic text-henko-turquoise font-light">te respondo en 24h</em>
            </h2>
            <p className="text-[15px] leading-[1.8] text-gray-600 mb-12">
              Si tienes dudas sobre si mis servicios encajan con lo que buscas, escríbeme. Prefiero que lo hablemos antes de tomar ninguna decisión.
            </p>

            {[
              { label: 'EMAIL', val: 'hola@henkoaching.com' },
              { label: 'INSTAGRAM', val: '@henkoaching' },
              { label: 'UBICACIÓN', val: 'Mallorca, Illes Balears, España' },
            ].map((item) => (
              <div key={item.label} className="mb-7">
                <p className="text-[10px] tracking-[0.16em] text-henko-turquoise font-bold mb-1">{item.label}</p>
                <p className="text-[15px] text-gray-900">{item.val}</p>
              </div>
            ))}

            <div className="bg-henko-greenblue rounded-[2rem] px-8 py-8 mt-4">
              <p className="font-roxborough italic text-lg leading-snug text-gray-900">
                &ldquo;El primer paso es siempre el más difícil.<br />Pero también el más importante.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
