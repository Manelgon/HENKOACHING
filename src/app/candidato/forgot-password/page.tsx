import Image from 'next/image'
import Link from 'next/link'
import { ForgotPasswordForm } from '@/features/auth/components'

export const metadata = {
  title: 'Recuperar contraseña — Henkoaching',
}

export default function CandidatoForgotPasswordPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-raleway">
      <div className="relative hidden lg:flex flex-col items-center justify-center p-16 bg-gradient-to-br from-henko-turquoise/15 to-henko-purple/15 border-r border-henko-turquoise/15 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-henko-turquoise/5 via-white/50 to-henko-purple/10" />
        <div className="relative z-10 text-center">
          <Link href="/">
            <Image
              src="/henkologo.png"
              alt="Henkoaching"
              width={640}
              height={444}
              className="mx-auto mb-10 drop-shadow-sm w-[320px] h-auto"
            />
          </Link>
          <p className="font-roxborough italic text-2xl text-gray-900 leading-tight mb-3">
            Portal de Empleo
          </p>
          <p className="font-raleway text-gray-500 text-base font-light max-w-sm mx-auto">
            Accede a tu perfil de candidato y gestiona tus solicitudes.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-white p-8 md:p-14">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Link href="/">
              <Image src="/henkologo.png" alt="Henkoaching" width={320} height={222} className="mx-auto w-[160px] h-auto" />
            </Link>
          </div>
          <p className="font-raleway font-bold text-henko-turquoise tracking-[0.18em] uppercase text-[11px] mb-4">
            Área de candidatos
          </p>
          <h1 className="font-roxborough text-3xl text-gray-900 mb-2">Recuperar acceso</h1>
          <p className="text-sm text-gray-500 mb-9 leading-relaxed">
            Te enviamos un enlace a tu email para restablecer tu contraseña.
          </p>

          <ForgotPasswordForm />

          <p className="text-center text-sm text-gray-400 mt-6">
            <Link href="/candidato/login" className="text-henko-turquoise font-semibold hover:underline">
              ← Volver al acceso
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
