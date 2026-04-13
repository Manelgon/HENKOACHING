import { UpdatePasswordForm } from '@/features/auth/components'

export const metadata = {
  title: 'Nueva contraseña — Henkoaching',
}

export default function UpdatePasswordPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-roxborough text-4xl text-gray-900 mb-2">Nueva contraseña</h1>
        <p className="font-raleway text-gray-500 font-light">Elige una contraseña segura</p>
      </div>

      <UpdatePasswordForm />
    </div>
  )
}
