'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAction } from '@/shared/feedback/FeedbackContext'
import { crearDerechoArco } from '@/actions/rgpd'

const TIPOS = [
  { value: 'acceso',        label: 'Acceso — quiero saber qué datos tienes sobre mí' },
  { value: 'rectificacion', label: 'Rectificación — quiero corregir datos incorrectos' },
  { value: 'supresion',     label: 'Supresión — quiero que elimines mis datos' },
  { value: 'portabilidad',  label: 'Portabilidad — quiero recibir mis datos en formato portable' },
  { value: 'oposicion',     label: 'Oposición — me opongo a un tratamiento concreto' },
  { value: 'limitacion',    label: 'Limitación — quiero que limites el tratamiento de mis datos' },
]

type Errors = {
  nombre?: string
  email?: string
  tipo_derecho?: string
  descripcion?: string
  privacidad?: string
}

const inputBase = 'w-full px-4 py-3 rounded-xl text-sm border-[1.5px] bg-white outline-none transition-colors font-raleway'
const inputCls = inputBase + ' border-gray-200 focus:border-henko-turquoise'
const inputErr = inputBase + ' border-red-400 bg-red-50 focus:border-red-500'
const labelCls = 'block font-raleway text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5'

export default function DerechosArcoPage() {
  const runAction = useAction()
  const [form, setForm] = useState({ nombre: '', email: '', tipo_derecho: '', descripcion: '' })
  const [privacidad, setPrivacidad] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [sent, setSent] = useState(false)

  function set(k: keyof typeof form, v: string) {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: undefined }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: Errors = {}
    if (!form.nombre.trim()) errs.nombre = 'Introduce tu nombre'
    if (!form.email.trim()) errs.email = 'Introduce tu email'
    else if (!form.email.includes('@')) errs.email = 'Email inválido'
    if (!form.tipo_derecho) errs.tipo_derecho = 'Selecciona el tipo de derecho'
    if (!form.descripcion.trim()) errs.descripcion = 'Describe brevemente tu solicitud'
    if (!privacidad) errs.privacidad = 'Debes aceptar la política de privacidad'
    if (Object.keys(errs).length) { setErrors(errs); return }

    const result = await runAction(
      'Enviando solicitud',
      () => crearDerechoArco(form),
      { successMessage: 'Solicitud enviada correctamente' },
    )
    if (result.ok) setSent(true)
  }

  if (sent) {
    return (
      <main className="min-h-screen bg-henko-white flex items-center justify-center px-4 py-20">
        <div className="max-w-lg w-full text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-green-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="font-roxborough text-2xl text-gray-900 mb-3">Solicitud recibida</h1>
          <p className="font-raleway text-gray-500 mb-2">
            Hemos registrado tu solicitud. Recibirás un email de confirmación en breve.
          </p>
          <p className="font-raleway text-sm text-gray-400 mb-8">
            Responderemos en un plazo máximo de <strong>1 mes</strong> conforme al RGPD.
          </p>
          <Link href="/legal" className="font-raleway text-sm text-henko-turquoise hover:underline">
            Volver a la página legal
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-henko-white px-4 py-16 md:py-24">
      <div className="max-w-lg mx-auto">
        <div className="mb-10">
          <Link href="/legal" className="font-raleway text-sm text-gray-400 hover:text-henko-turquoise transition-colors flex items-center gap-1 mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a información legal
          </Link>
          <h1 className="font-roxborough text-3xl text-gray-900 mb-3">Ejercicio de derechos RGPD</h1>
          <p className="font-raleway text-gray-500 text-sm leading-relaxed">
            Puedes ejercer tus derechos de acceso, rectificación, supresión, portabilidad, oposición y limitación del tratamiento conforme al Reglamento (UE) 2016/679.
            Responderemos en un plazo máximo de <strong>1 mes</strong>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelCls}>Nombre completo <span className="text-red-400">*</span></label>
            <input
              className={errors.nombre ? inputErr : inputCls}
              value={form.nombre}
              onChange={e => set('nombre', e.target.value)}
              placeholder="Tu nombre y apellidos"
            />
            {errors.nombre && <p className="mt-1 font-raleway text-xs text-red-500">{errors.nombre}</p>}
          </div>

          <div>
            <label className={labelCls}>Email <span className="text-red-400">*</span></label>
            <input
              className={errors.email ? inputErr : inputCls}
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="tu@email.com"
            />
            {errors.email && <p className="mt-1 font-raleway text-xs text-red-500">{errors.email}</p>}
          </div>

          <div>
            <label className={labelCls}>Tipo de derecho <span className="text-red-400">*</span></label>
            <select
              className={errors.tipo_derecho ? inputErr : inputCls}
              value={form.tipo_derecho}
              onChange={e => set('tipo_derecho', e.target.value)}
            >
              <option value="">Selecciona el derecho que quieres ejercer…</option>
              {TIPOS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            {errors.tipo_derecho && <p className="mt-1 font-raleway text-xs text-red-500">{errors.tipo_derecho}</p>}
          </div>

          <div>
            <label className={labelCls}>Descripción de tu solicitud <span className="text-red-400">*</span></label>
            <textarea
              className={(errors.descripcion ? inputErr : inputCls) + ' resize-none'}
              rows={4}
              value={form.descripcion}
              onChange={e => set('descripcion', e.target.value)}
              placeholder="Describe qué datos quieres acceder, rectificar o eliminar, o por qué te opones al tratamiento…"
              maxLength={2000}
            />
            <p className="mt-1 font-raleway text-xs text-gray-400 text-right">{form.descripcion.length}/2000</p>
            {errors.descripcion && <p className="font-raleway text-xs text-red-500">{errors.descripcion}</p>}
          </div>

          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={privacidad}
                onChange={e => { setPrivacidad(e.target.checked); setErrors(er => ({ ...er, privacidad: undefined })) }}
                className="mt-0.5 w-4 h-4 accent-henko-turquoise shrink-0"
              />
              <span className="font-raleway text-sm text-gray-600 leading-relaxed">
                He leído y acepto la{' '}
                <Link href="/legal#privacidad" className="text-henko-turquoise hover:underline">
                  política de privacidad
                </Link>
              </span>
            </label>
            {errors.privacidad && <p className="mt-1 font-raleway text-xs text-red-500">{errors.privacidad}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-henko-turquoise text-white font-raleway font-semibold hover:bg-henko-turquoise-light transition-colors"
          >
            Enviar solicitud
          </button>

          <p className="font-raleway text-xs text-gray-400 text-center leading-relaxed">
            También puedes enviarnos tu solicitud por email a{' '}
            <a href="mailto:info@henkoaching.com" className="text-henko-turquoise hover:underline">
              info@henkoaching.com
            </a>
            {' '}o reclamar ante la{' '}
            <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-henko-turquoise hover:underline">
              AEPD
            </a>.
          </p>
        </form>
      </div>
    </main>
  )
}
