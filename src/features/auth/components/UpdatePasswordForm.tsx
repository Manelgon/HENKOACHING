'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import { updatePassword } from '@/actions/auth'
import { useAction } from '@/shared/feedback/FeedbackContext'
import { FormError } from '@/components/FormError'

export function UpdatePasswordForm() {
  const runAction = useAction()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!password) {
      setError('Introduce una contraseña')
      return
    }
    if (password.length < 6) {
      setError('Mínimo 6 caracteres')
      return
    }
    setError(null)

    const fd = new FormData()
    fd.append('password', password)

    await runAction(
      'Actualizando contraseña',
      async () => {
        const result = await updatePassword(fd)
        if (result?.error) throw new Error(result.error)
        return null
      },
      { silentSuccess: true },
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
        <label htmlFor="password" className={labelClass}>
          Nueva contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            if (error) setError(null)
          }}
          className={fieldClass}
          placeholder="Mínimo 6 caracteres"
        />
        <FormError msg={error} />
      </div>

      <button
        type="submit"
        className="w-full bg-henko-turquoise text-white px-6 py-3 rounded-2xl font-bold font-raleway hover:bg-henko-greenblue transition-all shadow-md flex items-center justify-center gap-2"
      >
        Actualizar contraseña
      </button>
    </form>
  )
}
