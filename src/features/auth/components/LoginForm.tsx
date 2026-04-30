'use client'

import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { login } from '@/actions/auth'
import { useAction, useToast } from '@/shared/feedback/FeedbackContext'
import { FormError } from '@/components/FormError'

type Errors = { email?: string; password?: string }

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const oauthError = searchParams.get('error')
  const runAction = useAction()
  const pushToast = useToast()
  const [warned, setWarned] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [showPassword, setShowPassword] = useState(false)

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

    const res = await runAction(
      'Iniciando sesión',
      async () => {
        const result = await login(fd)
        if (result?.error) throw new Error('Email o contraseña incorrectos.')
        return result?.redirectTo ?? '/dashboard'
      },
      { silentSuccess: true },
    )

    if (res.ok) {
      router.push(res.data)
      router.refresh()
    }
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
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={(e) => {
              setForm({ ...form, password: e.target.value })
              if (errors.password) setErrors((v) => ({ ...v, password: undefined }))
            }}
            className={`${fieldClass(!!errors.password)} pr-12`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-henko-turquoise transition-colors p-1"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
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
