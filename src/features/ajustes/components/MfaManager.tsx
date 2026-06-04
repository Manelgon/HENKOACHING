'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useAction, useConfirm } from '@/shared/feedback/FeedbackContext'

type Factor = {
  id: string
  status: string
  created_at: string
  last_challenged_at: string | null
}

export default function MfaManager() {
  const router = useRouter()
  const runAction = useAction()
  const confirm = useConfirm()
  const [factors, setFactors] = useState<Factor[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const loadFactors = async () => {
    setLoading(true)
    const { data } = await supabase.auth.mfa.listFactors()
    setFactors((data?.all ?? []).filter(f => f.factor_type === 'totp') as Factor[])
    setLoading(false)
  }

  useEffect(() => { loadFactors() }, [])

  const handleUnenroll = async (factorId: string) => {
    const ok = await confirm({
      description: '¿Eliminar este autenticador? Necesitarás configurar uno nuevo para acceder.',
      confirmLabel: 'Eliminar',
      variant: 'danger',
    })
    if (!ok) return
    await runAction(
      'Eliminando autenticador',
      async () => {
        const { error } = await supabase.auth.mfa.unenroll({ factorId })
        if (error) throw new Error(error.message)
        await loadFactors()
      },
      { successMessage: 'Autenticador eliminado.' }
    )
  }

  const handleReenroll = () => router.push('/setup-mfa?enroll=1')

  if (loading) {
    return <p className="text-sm text-gray-400 font-raleway">Cargando...</p>
  }

  const verified = factors.filter(f => f.status === 'verified')
  const pending = factors.filter(f => f.status === 'unverified')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 font-raleway mb-1">Verificación en dos pasos (2FA)</h3>
        <p className="text-xs text-gray-500 font-raleway">
          Usa una app autenticadora (Google Authenticator, Authy…) para proteger tu cuenta.
        </p>
      </div>

      {verified.length === 0 && pending.length === 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <span className="text-amber-500 text-lg">⚠️</span>
          <p className="text-sm text-amber-700 font-raleway">No tienes ningún autenticador configurado.</p>
        </div>
      )}

      {verified.map(f => (
        <div key={f.id} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-green-600 text-lg">🔐</span>
            <div>
              <p className="text-sm font-semibold text-gray-800 font-raleway">Autenticador activo</p>
              <p className="text-xs text-gray-500 font-raleway">
                Configurado el {new Date(f.created_at).toLocaleDateString('es-ES')}
                {f.last_challenged_at && ` · Último uso: ${new Date(f.last_challenged_at).toLocaleDateString('es-ES')}`}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleUnenroll(f.id)}
            className="text-xs text-red-600 hover:text-red-700 font-raleway font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            Eliminar
          </button>
        </div>
      ))}

      {pending.map(f => (
        <div key={f.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-lg">⏳</span>
            <p className="text-sm text-gray-500 font-raleway">Autenticador pendiente de verificar</p>
          </div>
          <button
            onClick={() => handleUnenroll(f.id)}
            className="text-xs text-red-600 hover:text-red-700 font-raleway font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            Eliminar
          </button>
        </div>
      ))}

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleReenroll}
          className="px-4 py-2 rounded-xl bg-henko-greenblue text-white font-raleway font-semibold text-sm hover:bg-henko-greenblue/90 transition-colors"
        >
          {verified.length > 0 ? 'Cambiar dispositivo' : 'Configurar autenticador'}
        </button>
      </div>
    </div>
  )
}
