'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function SetupMfaContent() {
  const searchParams = useSearchParams()
  const enroll = searchParams.get('enroll') === '1'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-gray-900 font-raleway mb-2">
          {enroll ? 'Configura la verificación en dos pasos' : 'Verificación en dos pasos requerida'}
        </h1>

        <p className="text-gray-600 text-sm font-raleway mb-6">
          {enroll
            ? 'El acceso al panel de administración requiere autenticación en dos factores (MFA). Necesitas configurar una app autenticadora antes de continuar.'
            : 'Tu sesión requiere verificación adicional. Abre tu app autenticadora (Google Authenticator, Authy, etc.) e introduce el código para acceder al panel.'}
        </p>

        {enroll && (
          <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-blue-800 font-raleway mb-2">Cómo configurarlo:</p>
            <ol className="text-sm text-blue-700 font-raleway space-y-1 list-decimal list-inside">
              <li>Cierra sesión y vuelve a entrar</li>
              <li>En la pantalla de login, busca la opción «Configurar autenticación en dos pasos»</li>
              <li>Escanea el código QR con Google Authenticator o Authy</li>
              <li>Introduce el código de 6 dígitos para confirmar</li>
            </ol>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="w-full px-5 py-3 rounded-xl bg-henko-greenblue text-white font-raleway font-semibold text-sm hover:bg-henko-greenblue/90 transition-colors"
          >
            Volver al inicio de sesión
          </Link>
          <a
            href="https://supabase.com/docs/guides/auth/auth-mfa"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-gray-600 font-raleway transition-colors"
          >
            ¿Necesitas ayuda? Consulta la documentación →
          </a>
        </div>
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
