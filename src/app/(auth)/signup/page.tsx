import Link from 'next/link'

export const metadata = {
  title: 'Crear cuenta — Henkoaching',
}

export default function SignupPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-roxborough text-4xl text-gray-900 mb-2">Crear cuenta</h1>
        <p className="font-raleway text-gray-500 font-light">Accede a tu panel de gestión</p>
      </div>

      <p className="font-raleway text-gray-500 text-sm">
        El acceso al panel es privado. Si necesitas una cuenta,{' '}
        <Link href="/contacto" className="text-henko-turquoise hover:underline font-semibold">
          contacta con nosotros
        </Link>.
      </p>

      <p className="text-center text-sm text-gray-400 font-raleway">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-henko-turquoise hover:underline font-semibold">
          Iniciar sesión
        </Link>
      </p>
    </div>
  )
}
