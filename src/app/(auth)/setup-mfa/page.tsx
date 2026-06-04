'use client'

import { useEffect, useState, useCallback, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

function SetupMfaContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const enroll = searchParams.get('enroll') === '1'

  const [qrSvg, setQrSvg] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [factorId, setFactorId] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'loading' | 'qr' | 'code' | 'done'>('loading')
  const enrolledRef = useRef(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const initEnroll = useCallback(async () => {
    // Guard contra React Strict Mode doble-invocación
    if (enrolledRef.current) return
    enrolledRef.current = true

    // Limpiar todos los factores TOTP desde `all` (el campo `totp` puede estar vacío)
    const { data: existing } = await supabase.auth.mfa.listFactors()
    const totpFactors = (existing?.all ?? []).filter(f => f.factor_type === 'totp')
    for (const factor of totpFactors) {
      await supabase.auth.mfa.unenroll({ factorId: factor.id })
    }

    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
    if (error || !data) {
      enrolledRef.current = false
      setError(`Error al iniciar MFA: ${error?.message ?? 'inténtalo de nuevo'}`)
      setStep('code')
      return
    }

    // qr_code es un SVG ya renderizado — se inyecta directamente como inline SVG
    setQrSvg(data.totp.qr_code)
    setSecret(data.totp.secret)
    setFactorId(data.id)
    setStep('qr')
  }, [supabase])

  const initVerify = useCallback(async () => {
    const { data } = await supabase.auth.mfa.listFactors()
    const totp = data?.totp?.find(f => f.status === 'verified')
    if (totp) {
      setFactorId(totp.id)
      setStep('code')
    } else {
      router.replace('/setup-mfa?enroll=1')
    }
  }, [supabase, router])

  useEffect(() => {
    if (enroll) {
      initEnroll()
    } else {
      initVerify()
    }
  }, [enroll, initEnroll, initVerify])

  const handleVerify = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!factorId || code.length !== 6) return
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code })
    setLoading(false)
    if (error) {
      setError('Código incorrecto. Comprueba tu app autenticadora e inténtalo de nuevo.')
      return
    }
    setStep('done')
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-gray-900 font-raleway mb-2">
          {enroll ? 'Configura la verificación en dos pasos' : 'Verificación en dos pasos'}
        </h1>

        {step === 'loading' && (
          <p className="text-gray-500 text-sm font-raleway">Cargando...</p>
        )}

        {step === 'qr' && qrSvg && (
          <>
            <p className="text-gray-600 text-sm font-raleway mb-5">
              Escanea el código QR con <strong>Google Authenticator</strong>, <strong>Authy</strong> u otra app autenticadora.
            </p>
            <div
              className="flex justify-center mb-4 [&>svg]:w-48 [&>svg]:h-48 [&>svg]:rounded-xl [&>svg]:border [&>svg]:border-gray-200"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
            {secret && (
              <div className="bg-gray-50 rounded-xl px-4 py-3 mb-5 text-left">
                <p className="text-xs text-gray-500 font-raleway mb-1">O introduce la clave manualmente:</p>
                <code className="text-xs text-gray-800 break-all font-mono">{secret}</code>
              </div>
            )}
            <button
              onClick={() => setStep('code')}
              className="w-full px-5 py-3 rounded-xl bg-henko-greenblue text-white font-raleway font-semibold text-sm hover:bg-henko-greenblue/90 transition-colors"
            >
              Ya escaneé el código →
            </button>
          </>
        )}

        {step === 'code' && (
          <>
            <p className="text-gray-600 text-sm font-raleway mb-6">
              {enroll
                ? 'Introduce el código de 6 dígitos de tu app autenticadora para confirmar el registro.'
                : 'Abre tu app autenticadora e introduce el código de 6 dígitos para acceder al panel.'}
            </p>
            <form onSubmit={handleVerify} className="flex flex-col gap-4">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full text-center text-2xl tracking-widest font-mono border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-henko-greenblue/30"
                autoFocus
              />
              {error && <p className="text-red-600 text-sm font-raleway">{error}</p>}
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full px-5 py-3 rounded-xl bg-henko-greenblue text-white font-raleway font-semibold text-sm hover:bg-henko-greenblue/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Verificando...' : 'Verificar y acceder'}
              </button>
            </form>
          </>
        )}

        {step === 'done' && (
          <p className="text-green-600 text-sm font-raleway">Verificado. Redirigiendo al panel...</p>
        )}
      </div>
    </div>
  )
}

export default function SetupMfaPage() {
  return (
    <Suspense>
      <SetupMfaContent />
    </Suspense>
  )
}
