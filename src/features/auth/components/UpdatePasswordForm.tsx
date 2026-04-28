'use client'

import { updatePassword } from '@/actions/auth'
import { useAction } from '@/shared/feedback/FeedbackContext'

export function UpdatePasswordForm() {
  const runAction = useAction()

  async function handleSubmit(formData: FormData) {
    await runAction(
      'Actualizando contraseña',
      async () => {
        const result = await updatePassword(formData)
        if (result?.error) throw new Error(result.error)
        return null
      },
      { silentSuccess: true },
    )
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 uppercase tracking-widest font-raleway">
          Nueva contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-2xl text-gray-800 outline-none focus:border-henko-turquoise focus:bg-white focus:ring-4 focus:ring-henko-turquoise/10 transition-all font-raleway"
          placeholder="Mínimo 6 caracteres"
        />
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
