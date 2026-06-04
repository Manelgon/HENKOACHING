'use client'

import { useRef, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useAction } from '@/shared/feedback/FeedbackContext'
import { uploadAdminAvatar } from '@/actions/mi-cuenta'
import MfaManager from '@/features/ajustes/components/MfaManager'

type Props = {
  currentEmail: string
  avatarUrl: string | null
  userInitial: string
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 flex flex-col gap-5">
      <div>
        <h2 className="text-base font-bold text-gray-900 font-raleway">{title}</h2>
        {description && <p className="text-xs text-gray-500 font-raleway mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  )
}

export default function MiCuentaForm({ currentEmail, avatarUrl, userInitial }: Props) {
  const runAction = useAction()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl)
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [newEmail, setNewEmail] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreviewUrl(URL.createObjectURL(file))
    const formData = new FormData()
    formData.append('avatar', file)
    await runAction(
      'Subiendo foto',
      async () => {
        const result = await uploadAdminAvatar(formData)
        if (result.error) throw new Error(result.error)
        if (result.url) setPreviewUrl(result.url)
      },
      { successMessage: 'Foto actualizada.' }
    )
  }

  const handlePassword = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (password.length < 8 || password !== passwordConfirm) return
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
    : password && password.length < 8 ? 'Mínimo 8 caracteres' : null

  return (
    <div className="flex flex-col gap-6">

      {/* ── Avatar ── */}
      <Section title="Foto de perfil">
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative group shrink-0"
          >
            <div className="w-20 h-20 rounded-full overflow-hidden bg-henko-turquoise/20 flex items-center justify-center">
              {previewUrl
                ? <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                : <span className="text-2xl font-bold text-henko-turquoise">{userInitial}</span>
              }
            </div>
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </button>
          <div>
            <p className="text-sm font-semibold text-gray-800 font-raleway">{currentEmail}</p>
            <p className="text-xs text-gray-400 font-raleway mt-0.5">JPG o PNG · Máx 2MB</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-xs text-henko-turquoise font-raleway font-semibold hover:underline"
            >
              Cambiar foto
            </button>
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
      </Section>

      {/* ── Seguridad / MFA ── */}
      <Section title="Verificación en dos pasos" description="Protege tu cuenta con una app autenticadora.">
        <MfaManager />
      </Section>

      {/* ── Contraseña ── */}
      <Section title="Contraseña">
        <form onSubmit={handlePassword} className="flex flex-col gap-4 max-w-sm">
          <div>
            <label className="block text-xs font-semibold text-gray-600 font-raleway mb-1">Nueva contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-raleway focus:outline-none focus:ring-2 focus:ring-henko-turquoise/30"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 font-raleway mb-1">Confirmar contraseña</label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={e => setPasswordConfirm(e.target.value)}
              placeholder="Repite la contraseña"
              autoComplete="new-password"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-raleway focus:outline-none focus:ring-2 focus:ring-henko-turquoise/30"
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
      </Section>

      {/* ── Email ── */}
      <Section title="Dirección de email">
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
      </Section>

      {/* ── Sesiones ── */}
      <Section title="Sesiones activas" description="Cierra todas las sesiones si crees que alguien más tiene acceso a tu cuenta.">
        <div className="flex flex-col gap-3 max-w-sm">
          <p className="text-sm text-gray-500 font-raleway">Invalida todas las sesiones activas, incluida la actual. Tendrás que volver a iniciar sesión.</p>
          <button
            type="button"
            onClick={handleSignOutAll}
            className="px-5 py-2.5 rounded-xl bg-red-500 text-white font-raleway font-semibold text-sm hover:bg-red-600 transition-colors w-fit"
          >
            Cerrar todas las sesiones
          </button>
        </div>
      </Section>

    </div>
  )
}
