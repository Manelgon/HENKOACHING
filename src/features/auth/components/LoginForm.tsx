'use client'

import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { login } from '@/actions/auth'
import { useAction, useToast } from '@/shared/feedback/FeedbackContext'
import { FormError } from '@/components/FormError'

type Errors = { email?: string; password?: string }

export function LoginForm() {
  const searchParams = useSearchParams()
  const oauthError = searchParams.get('error')
  const runAction = useAction()
  const pushToast = useToast()
  const [warned, setWarned] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<Errors>({})

  useEffect(() => {
    if (oauthError === 'auth_callback_failed' && !warned) {
      pushToast('error', 'Error al iniciar sesión. Intenta de nuevo.')
      setWarned(true)
    }
  }, [oauthError, warned, pushToast])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const errs: Errors = {}
    if (!form.email.trim()) errs.email = 'Introduce tu email'
    else if (!form.email.includes('@')) errs.email = 'Email inválido'
    if (!form.password) errs.password = 'Introduce tu contraseña'
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setErrors({})

    const fd = new FormData()
    fd.append('email', form.email)
    fd.append('password', form.password)

    await runAction(
      'Iniciando sesión',
      async () => {
        const result = await login(fd)
        if (result?.error) throw new Error('Email o contraseña incorrectos.')
        return null
      },
      { silentSuccess: true },
    )
  }

  const fieldClass = (hasError: boolean) =>
    `w-full bg-gray-50 border px-4 py-3 rounded-2xl text-gray-800 outline-none focus:bg-white focus:ring-4 transition-all font-raleway ${
      hasError
        ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
        : 'border-gray-200 focus:border-henko-turquoise focus:ring-henko-turquoise/10'
    }`

  const labelClass = (hasError: boolean) =>
    `block text-sm font-semibold uppercase tracking-widest font-raleway ${
      hasError ? 'text-red-600' : 'text-gray-700'
    }`

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="space-y-1">
        <label htmlFor="email" className={labelClass(!!errors.email)}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={(e) => {
            setForm({ ...form, email: e.target.value })
            if (errors.email) setErrors((v) => ({ ...v, email: undefined }))
          }}
          className={fieldClass(!!errors.email)}
          placeholder="hola@tuempresa.com"
        />
        <FormError msg={errors.email} />
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className={labelClass(!!errors.password)}>
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={(e) => {
            setForm({ ...form, password: e.target.value })
            if (errors.password) setErrors((v) => ({ ...v, password: undefined }))
          }}
          className={fieldClass(!!errors.password)}
          placeholder="••••••••"
        />
        <FormError msg={errors.password} />
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
