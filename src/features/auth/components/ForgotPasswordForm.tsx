'use client'

import { useState } from 'react'
import { resetPassword } from '@/actions/auth'
import { useAction } from '@/shared/feedback/FeedbackContext'

export function ForgotPasswordForm() {
  const runAction = useAction()
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    const result = await runAction(
      'Enviando enlace de recuperación',
      () => resetPassword(formData),
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

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 uppercase tracking-widest font-raleway">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-2xl text-gray-800 outline-none focus:border-henko-turquoise focus:bg-white focus:ring-4 focus:ring-henko-turquoise/10 transition-all font-raleway"
          placeholder="hola@tuempresa.com"
        />
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
