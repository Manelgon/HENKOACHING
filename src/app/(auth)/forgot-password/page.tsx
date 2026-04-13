import Link from 'next/link'
import { ForgotPasswordForm } from '@/features/auth/components'

export const metadata = {
  title: 'Recuperar contraseña — Henkoaching',
}

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-roxborough text-4xl text-gray-900 mb-2">Recuperar acceso</h1>
        <p className="font-raleway text-gray-500 font-light">Te enviamos un enlace a tu email</p>
      </div>

      <ForgotPasswordForm />

      <p className="text-center text-sm text-gray-400 font-raleway">
        <Link href="/login" className="text-henko-turquoise hover:underline">
          ← Volver al login
        </Link>
      </p>
    </div>
  )
}
