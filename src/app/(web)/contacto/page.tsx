'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import { FormError } from '@/components/FormError'
import { crearLead } from '@/actions/leads'
import { useAction } from '@/shared/feedback/FeedbackContext'
import { CONSENT_TEXT_CONTACTO } from '@/shared/constants/consent'

type Errors = { nombre?: string; email?: string; mensaje?: string; privacidad?: string }

export default function ContactoPage() {
  const runAction = useAction()
  const [form, setForm] = useState({ nombre: '', empresa: '', email: '', servicio: '', mensaje: '' })
  const [aceptoPrivacidad, setAceptoPrivacidad] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const errs: Errors = {}
    if (!form.nombre.trim()) errs.nombre = 'Introduce tu nombre'
    if (!form.email.trim()) errs.email = 'Introduce tu email'
    else if (!form.email.includes('@')) errs.email = 'Email inválido'
    if (!form.mensaje.trim()) errs.mensaje = 'Cuéntame qué necesitas'
    if (!aceptoPrivacidad) errs.privacidad = 'Debes aceptar la política de privacidad para enviar el mensaje'
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setErrors({})

    const result = await runAction(
      'Enviando mensaje',
      () => crearLead({
        tipo: 'contacto_general',
        nombre: form.nombre,
        email: form.email,
        asunto: form.empresa ? `Contacto de ${form.empresa}` : 'Consulta general',
        mensaje: form.mensaje,
        servicio_interes: form.servicio || undefined,
        acepto_privacidad: aceptoPrivacidad,
        consent_text: CONSENT_TEXT_CONTACTO,
      }),
      { successMessage: 'Mensaje enviado' },
    )
    if (result.ok) setSent(true)
  }

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-3.5 rounded-2xl text-sm border-[1.5px] bg-white text-gray-900 outline-none transition-colors ${
      hasError ? 'border-red-300 focus:border-red-400' : 'border-black/10 focus:border-henko-turquoise'
    }`
  const labelClass = (hasError: boolean) =>
    `text-[11px] tracking-[0.12em] font-bold mb-1.5 block ${
      hasError ? 'text-red-600' : 'text-henko-turquoise'
    }`

  const updateField = <K extends keyof typeof form>(key: K, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key as keyof Errors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }))
    }
  }

  return (
    <div className="bg-white pt-24 font-raleway">
      <PageHeader
        overline="Contacto"
        title={
          <>
            Empecemos por <em className="italic text-henko-turquoise font-light">una conversación</em>
          </>
        }
        subtitle="45 minutos. Sin compromiso. Prefiero que lo hablemos antes de tomar cualquier decisión."
      />

      <section className="px-6 md:px-12 pt-10 pb-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20">
          {/* Form */}
          <div data-animate="left" className="relative bg-white border border-henko-turquoise/15 rounded-[2.5rem] p-8 md:p-10 shadow-sm overflow-hidden">
            {/* Vertical accent bar */}
            <span
              aria-hidden
              className="absolute top-10 bottom-10 left-0 w-px bg-gradient-to-b from-transparent via-henko-turquoise to-transparent opacity-60"
            />

            {sent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-henko-turquoise mx-auto mb-5 flex items-center justify-center shadow-lg shadow-henko-turquoise/20">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="flex items-center justify-center gap-3 mb-3">
                  <span className="block w-8 h-px bg-henko-turquoise" />
                  <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-henko-turquoise">Enviado</span>
                  <span className="block w-8 h-px bg-henko-turquoise" />
                </div>
                <h2 className="font-roxborough text-2xl md:text-3xl text-gray-900 mb-3">
                  ¡Mensaje <em className="italic text-henko-turquoise font-light">recibido</em>!
                </h2>
                <p className="text-[15px] leading-relaxed text-gray-600 max-w-sm mx-auto">
                  Gracias por escribirme. Me pondré en contacto contigo lo antes posible.
                </p>
                <button
                  type="button"
                  onClick={() => { setSent(false); setForm({ nombre: '', empresa: '', email: '', servicio: '', mensaje: '' }); setAceptoPrivacidad(false) }}
                  className="mt-7 inline-flex items-center gap-2 bg-transparent border-2 border-henko-turquoise text-henko-turquoise px-7 py-3 rounded-full text-sm font-semibold hover:bg-henko-turquoise hover:text-white transition-all"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <span className="block w-8 h-px bg-henko-turquoise" />
                  <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-henko-turquoise">Cuéntame</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={labelClass(!!errors.nombre)} htmlFor="nombre">NOMBRE</label>
                    <input
                      id="nombre"
                      name="nombre"
                      type="text"
                      placeholder="Tu nombre"
                      className={inputClass(!!errors.nombre)}
                      value={form.nombre}
                      onChange={(e) => updateField('nombre', e.target.value)}
                    />
                    <FormError msg={errors.nombre} />
                  </div>
                  <div>
                    <label className={labelClass(false)} htmlFor="empresa">EMPRESA</label>
                    <input
                      id="empresa"
                      name="empresa"
                      type="text"
                      placeholder="Tu empresa"
                      className={inputClass(false)}
                      value={form.empresa}
                      onChange={(e) => updateField('empresa', e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className={labelClass(!!errors.email)} htmlFor="email">EMAIL</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    className={inputClass(!!errors.email)}
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                  />
                  <FormError msg={errors.email} />
                </div>

                <div className="mb-4">
                  <label className={labelClass(false)} htmlFor="servicio">¿QUÉ TE INTERESA?</label>
                  <select
                    id="servicio"
                    name="servicio"
                    className={inputClass(false) + ' appearance-none'}
                    value={form.servicio}
                    onChange={(e) => updateField('servicio', e.target.value)}
                  >
                    <option value="">Selecciona un servicio</option>
                    <option>Consultoría de Operaciones</option>
                    <option>Reclutamiento Consciente</option>
                    <option>Desarrollo de Liderazgo</option>
                    <option>No lo sé todavía</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className={labelClass(!!errors.mensaje)} htmlFor="mensaje">CUÉNTAME</label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    rows={5}
                    placeholder="¿Qué está pasando en tu empresa? ¿Qué te trajo hasta aquí?"
                    className={inputClass(!!errors.mensaje) + ' resize-y leading-relaxed'}
                    value={form.mensaje}
                    onChange={(e) => updateField('mensaje', e.target.value)}
                  />
                  <FormError msg={errors.mensaje} />
                </div>

                <div className="mb-8">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      id="privacidad"
                      name="privacidad"
                      type="checkbox"
                      checked={aceptoPrivacidad}
                      onChange={(e) => {
                        setAceptoPrivacidad(e.target.checked)
                        if (errors.privacidad && e.target.checked) {
                          setErrors((prev) => ({ ...prev, privacidad: undefined }))
                        }
                      }}
                      className={`mt-0.5 w-4 h-4 rounded border-[1.5px] cursor-pointer accent-henko-turquoise ${
                        errors.privacidad ? 'border-red-400' : 'border-black/20'
                      }`}
                    />
                    <span className="text-[13px] leading-relaxed text-gray-700 group-hover:text-gray-900 transition-colors">
                      He leído y acepto la{' '}
                      <Link
                        href="/legal#privacidad"
                        target="_blank"
                        className="text-henko-turquoise hover:text-henko-turquoise-light font-semibold underline underline-offset-2"
                      >
                        política de privacidad
                      </Link>
                      {' '}y el tratamiento de mis datos.
                    </span>
                  </label>
                  <FormError msg={errors.privacidad} />
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
          <div data-animate="right" className="pt-2">
            <div className="flex items-center gap-3 mb-4">
              <span className="block w-8 h-px bg-henko-turquoise" />
              <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-henko-turquoise">Desde Mallorca</span>
            </div>
            <h2 className="font-roxborough text-2xl md:text-3xl text-gray-900 mb-5 leading-tight">
              Otras formas de <em className="italic text-henko-turquoise font-light">encontrarme</em>
            </h2>
            <p className="text-[15px] leading-[1.8] text-gray-600 mb-10">
              Si prefieres otro canal o solo quieres asomarte a lo que comparto, estoy en estos sitios.
            </p>

            <div className="space-y-3 mb-8">
              {[
                { label: 'EMAIL', val: 'info@henkoaching.com', href: 'mailto:info@henkoaching.com' },
                { label: 'TELÉFONO', val: '633 65 76 65', href: 'tel:+34633657665' },
                { label: 'INSTAGRAM', val: '@henkoaching', href: 'https://www.instagram.com/henkoaching/' },
                { label: 'LINKEDIN', val: 'Jennifer Cervera', href: 'https://es.linkedin.com/in/jennifer-cervera-3b66a2136' },
                { label: 'UBICACIÓN', val: 'Palma de Mallorca, Illes Balears, España' },
              ].map((item) => {
                const inner = (
                  <div className="relative flex items-center gap-5 pl-4">
                    <span
                      aria-hidden
                      className="absolute top-2 bottom-2 left-0 w-px bg-henko-turquoise/40 group-hover:bg-henko-turquoise transition-colors duration-300"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] tracking-[0.22em] text-henko-turquoise font-bold uppercase mb-0.5">{item.label}</p>
                      <p className="text-[15px] text-gray-900 group-hover:text-henko-turquoise transition-colors truncate">{item.val}</p>
                    </div>
                    {item.href && (
                      <span aria-hidden className="text-henko-turquoise opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0">→</span>
                    )}
                  </div>
                )
                return item.href ? (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="group block bg-white border border-henko-turquoise/15 rounded-2xl px-5 py-4 shadow-sm hover:border-henko-turquoise/40 hover:shadow-[0_8px_24px_rgba(31,143,155,0.08)] hover:-translate-y-0.5 transition-all duration-300"
                  >
                    {inner}
                  </a>
                ) : (
                  <div key={item.label} className="group block bg-white border border-henko-turquoise/15 rounded-2xl px-5 py-4 shadow-sm">
                    {inner}
                  </div>
                )
              })}
            </div>

            <div className="relative bg-henko-turquoise/[0.05] border border-henko-turquoise/15 rounded-[2rem] px-8 py-8 overflow-hidden">
              <span
                aria-hidden
                className="pointer-events-none absolute -top-2 -left-2 font-roxborough italic text-[8rem] leading-none text-henko-turquoise/[0.12] select-none"
              >
                &ldquo;
              </span>
              <p className="relative font-roxborough italic text-lg leading-snug text-gray-900">
                El primer paso es siempre el más difícil.<br />
                <span className="text-henko-turquoise">Pero también el más importante.</span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
