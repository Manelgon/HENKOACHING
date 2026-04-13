import { Suspense } from 'react'
import { LoginForm } from '@/features/auth/components'

export const metadata = {
  title: 'Acceder — Henkoaching',
}

export default function LoginPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-roxborough text-4xl text-gray-900 mb-2">Bienvenida de nuevo</h1>
        <p className="font-raleway text-gray-500 font-light">Accede a tu panel de gestión</p>
      </div>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
