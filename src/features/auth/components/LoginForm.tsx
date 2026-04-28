'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { login } from '@/actions/auth'
import { useAction, useToast } from '@/shared/feedback/FeedbackContext'

export function LoginForm() {
  const searchParams = useSearchParams()
  const oauthError = searchParams.get('error')
  const runAction = useAction()
  const pushToast = useToast()
  const [warned, setWarned] = useState(false)

  useEffect(() => {
    if (oauthError === 'auth_callback_failed' && !warned) {
      pushToast('error', 'Error al iniciar sesión. Intenta de nuevo.')
      setWarned(true)
    }
  }, [oauthError, warned, pushToast])

  async function handleSubmit(formData: FormData) {
    await runAction(
      'Iniciando sesión',
      async () => {
        const result = await login(formData)
        if (result?.error) throw new Error('Email o contraseña incorrectos.')
        return null
      },
      { silentSuccess: true },
    )
  }

  return (
    <form action={handleSubmit} className="space-y-5">
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

      <div className="space-y-1">
        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 uppercase tracking-widest font-raleway">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-2xl text-gray-800 outline-none focus:border-henko-turquoise focus:bg-white focus:ring-4 focus:ring-henko-turquoise/10 transition-all font-raleway"
          placeholder="••••••••"
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="remember"
            className="w-4 h-4 rounded border-gray-300 text-henko-turquoise focus:ring-henko-turquoise/30 accent-henko-turquoise"
          />
          <span className="text-sm text-gray-500 font-raleway">Recuérdame</span>
        </label>
        <Link href="/forgot-password" className="text-sm text-henko-turquoise hover:underline font-raleway">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <button
        type="submit"
        className="w-full bg-henko-turquoise text-white px-6 py-3 rounded-2xl font-bold font-raleway hover:bg-henko-greenblue transition-all shadow-md flex items-center justify-center gap-2"
      >
        Entrar
      </button>
    </form>
  )
}
