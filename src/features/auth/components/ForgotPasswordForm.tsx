'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import { resetPassword } from '@/actions/auth'
import { useAction } from '@/shared/feedback/FeedbackContext'
import { FormError } from '@/components/FormError'

export function ForgotPasswordForm() {
  const runAction = useAction()
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email.trim()) {
      setError('Introduce tu email')
      return
    }
    if (!email.includes('@')) {
      setError('Email inválido')
      return
    }
    setError(null)

    const fd = new FormData()
    fd.append('email', email)

    const result = await runAction(
      'Enviando enlace de recuperación',
      () => resetPassword(fd),
      { successMessage: 'Enlace enviado. Revisa tu email.' },
    )
    if (result.ok) setSuccess(true)
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-henko-greenblue/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-henko-turquoise" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-gray-700 font-raleway">Revisa tu email para el enlace de recuperación.</p>
      </div>
    )
  }

  const fieldClass = `w-full bg-gray-50 border px-4 py-3 rounded-2xl text-gray-800 outline-none focus:bg-white focus:ring-4 transition-all font-raleway ${
    error
      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
      : 'border-gray-200 focus:border-henko-turquoise focus:ring-henko-turquoise/10'
  }`
  const labelClass = `block text-sm font-semibold uppercase tracking-widest font-raleway ${
    error ? 'text-red-600' : 'text-gray-700'
  }`

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (error) setError(null)
          }}
          className={fieldClass}
          placeholder="hola@tuempresa.com"
        />
        <FormError msg={error} />
      </div>

      <button
        type="submit"
        className="w-full bg-henko-turquoise text-white px-6 py-3 rounded-2xl font-bold font-raleway hover:bg-henko-greenblue transition-all shadow-md flex items-center justify-center gap-2"
      >
        Enviar enlace
      </button>
    </form>
  )
}
