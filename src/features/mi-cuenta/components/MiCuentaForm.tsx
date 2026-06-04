'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useAction } from '@/shared/feedback/FeedbackContext'
import MfaManager from '@/features/ajustes/components/MfaManager'

const TABS = [
  { key: 'seguridad',  label: 'Seguridad' },
  { key: 'password',   label: 'Contraseña' },
  { key: 'email',      label: 'Email' },
  { key: 'sesiones',   label: 'Sesiones' },
] as const

type TabKey = typeof TABS[number]['key']

export default function MiCuentaForm({ currentEmail }: { currentEmail: string }) {
  const router = useRouter()
  const runAction = useAction()
  const [tab, setTab] = useState<TabKey>('seguridad')

  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [newEmail, setNewEmail] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handlePassword = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (password.length < 8) return
    if (password !== passwordConfirm) return
    await runAction(
      'Cambiando contraseña',
      async () => {
        const { error } = await supabase.auth.updateUser({ password })
        if (error) throw new Error(error.message)
        setPassword('')
        setPasswordConfirm('')
      },
      { successMessage: 'Contraseña actualizada.' }
    )
  }

  const handleEmail = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!newEmail) return
    await runAction(
      'Cambiando email',
      async () => {
        const { error } = await supabase.auth.updateUser({ email: newEmail })
        if (error) throw new Error(error.message)
        setNewEmail('')
      },
      { successMessage: 'Revisa tu bandeja: te hemos enviado un enlace de confirmación.' }
    )
  }

  const handleSignOutAll = async () => {
    await runAction(
      'Cerrando todas las sesiones',
      async () => {
        const { error } = await supabase.auth.signOut({ scope: 'global' })
        if (error) throw new Error(error.message)
      },
      { successMessage: 'Sesiones cerradas.' }
    )
    window.location.replace('/login')
  }

  const passwordError = password && passwordConfirm && password !== passwordConfirm
    ? 'Las contraseñas no coinciden'
    : password && password.length < 8
    ? 'Mínimo 8 caracteres'
    : null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-gray-100 px-6 pt-5 gap-1 flex-wrap">
        {TABS.map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-t-xl font-raleway text-sm font-semibold transition-colors ${
              tab === t.key
                ? 'bg-gray-50 text-henko-turquoise border border-b-0 border-gray-100'
                : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-6 md:p-8">

        {/* ── Seguridad (MFA) ── */}
        {tab === 'seguridad' && <MfaManager />}

        {/* ── Contraseña ── */}
        {tab === 'password' && (
          <form onSubmit={handlePassword} className="flex flex-col gap-4 max-w-sm">
            <div>
              <label className="block text-xs font-semibold text-gray-600 font-raleway mb-1">Nueva contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-raleway focus:outline-none focus:ring-2 focus:ring-henko-turquoise/30"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 font-raleway mb-1">Confirmar contraseña</label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={e => setPasswordConfirm(e.target.value)}
                placeholder="Repite la contraseña"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-raleway focus:outline-none focus:ring-2 focus:ring-henko-turquoise/30"
                autoComplete="new-password"
              />
            </div>
            {passwordError && <p className="text-red-500 text-xs font-raleway">{passwordError}</p>}
            <button
              type="submit"
              disabled={!password || !passwordConfirm || !!passwordError}
              className="px-5 py-2.5 rounded-xl bg-henko-turquoise text-white font-raleway font-semibold text-sm hover:bg-henko-turquoise-light transition-colors disabled:opacity-40 w-fit"
            >
              Actualizar contraseña
            </button>
          </form>
        )}

        {/* ── Email ── */}
        {tab === 'email' && (
          <form onSubmit={handleEmail} className="flex flex-col gap-4 max-w-sm">
            <div>
              <label className="block text-xs font-semibold text-gray-600 font-raleway mb-1">Email actual</label>
              <p className="text-sm text-gray-500 font-raleway bg-gray-50 rounded-xl px-4 py-2.5">{currentEmail}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 font-raleway mb-1">Nuevo email</label>
              <input
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="nuevo@email.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-raleway focus:outline-none focus:ring-2 focus:ring-henko-turquoise/30"
              />
            </div>
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-blue-700 font-raleway">Recibirás un enlace de confirmación en el nuevo email. El cambio no será efectivo hasta que lo confirmes.</p>
            </div>
            <button
              type="submit"
              disabled={!newEmail}
              className="px-5 py-2.5 rounded-xl bg-henko-turquoise text-white font-raleway font-semibold text-sm hover:bg-henko-turquoise-light transition-colors disabled:opacity-40 w-fit"
            >
              Enviar confirmación
            </button>
          </form>
        )}

        {/* ── Sesiones ── */}
        {tab === 'sesiones' && (
          <div className="flex flex-col gap-5 max-w-sm">
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-xs text-amber-700 font-raleway">Usa esta opción si crees que alguien más tiene acceso a tu cuenta, o si dejaste la sesión abierta en otro dispositivo.</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 font-raleway mb-1">Cerrar sesión en todos los dispositivos</p>
              <p className="text-xs text-gray-500 font-raleway mb-4">Invalida todas las sesiones activas, incluida la actual. Tendrás que volver a iniciar sesión.</p>
              <button
                type="button"
                onClick={handleSignOutAll}
                className="px-5 py-2.5 rounded-xl bg-red-500 text-white font-raleway font-semibold text-sm hover:bg-red-600 transition-colors"
              >
                Cerrar todas las sesiones
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
