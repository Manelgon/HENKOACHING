import Link from 'next/link'

export const metadata = {
  title: 'Revisa tu email — Henkoaching',
}

export default function CheckEmailPage() {
  return (
    <div className="space-y-8 text-center">
      <div className="w-20 h-20 bg-henko-greenblue/20 rounded-full flex items-center justify-center mx-auto">
        <svg className="w-10 h-10 text-henko-turquoise" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>

      <div>
        <h1 className="font-roxborough text-4xl text-gray-900 mb-2">Revisa tu email</h1>
        <p className="font-raleway text-gray-500 font-light max-w-sm mx-auto">
          Te hemos enviado un enlace de confirmación. Ábrelo para completar el registro.
        </p>
      </div>

      <Link href="/login" className="inline-block text-henko-turquoise hover:underline font-raleway font-semibold text-sm">
        ← Volver al login
      </Link>
    </div>
  )
}
