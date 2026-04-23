'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function CandidatoLoginForm() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => router.push('/candidato/dashboard'), 600)
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-raleway">
      {/* Panel izquierdo amarillo */}
      <div className="relative hidden lg:flex flex-col justify-between p-14 bg-henko-yellow overflow-hidden">
        <div
          className="absolute pointer-events-none"
          style={{
            width: 200, height: 260, top: -50, right: -50,
            background: '#addbd2', opacity: 0.5,
            borderRadius: '60% 40% 70% 30% / 50% 60% 40% 60%',
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            width: 150, height: 195, bottom: -40, left: -40,
            background: '#d69494', opacity: 0.4,
            borderRadius: '60% 40% 70% 30% / 50% 60% 40% 60%',
          }}
        />
        <Link href="/" className="relative z-10">
          <Image src="/henkologo.png" alt="Henkoaching" width={180} height={50} className="object-contain" />
        </Link>
        <div className="relative z-10">
          <p className="font-roxborough italic text-3xl text-gray-900 leading-tight mb-4">
            Portal de Empleo
          </p>
          <p className="text-sm text-gray-700 leading-relaxed max-w-sm">
            Accede a tu perfil de candidato y gestiona tus solicitudes.
          </p>
        </div>
      </div>

      {/* Panel derecho formulario */}
      <div className="flex items-center justify-center bg-henko-white p-8 md:p-14">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Link href="/">
              <Image src="/henkologo.png" alt="Henkoaching" width={160} height={50} className="mx-auto" />
            </Link>
          </div>
          <p className="font-raleway font-bold text-henko-turquoise tracking-[0.18em] uppercase text-[11px] mb-4">
            Área de candidatos
          </p>
          <h1 className="font-roxborough text-4xl text-gray-900 mb-2">Accede</h1>
          <p className="text-sm text-gray-500 mb-9 leading-relaxed">
            Entra en tu perfil y aplica a las ofertas disponibles.
          </p>

          <form onSubmit={submit}>
            <div className="mb-4">
              <label className="text-[11px] tracking-[0.12em] font-bold text-henko-turquoise mb-1.5 block">EMAIL</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="tu@email.com"
                className="w-full px-4 py-3 rounded-xl text-sm border-[1.5px] border-black/10 bg-white outline-none focus:border-henko-turquoise transition-colors"
              />
            </div>
            <div className="mb-8">
              <label className="text-[11px] tracking-[0.12em] font-bold text-henko-turquoise mb-1.5 block">CONTRASEÑA</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-sm border-[1.5px] border-black/10 bg-white outline-none focus:border-henko-turquoise transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-henko-turquoise text-white px-6 py-3.5 rounded-full text-sm font-semibold hover:bg-henko-turquoise-light hover:shadow-lg disabled:opacity-70 transition-all"
            >
              {loading ? 'Entrando...' : 'Acceder'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            ¿No tienes cuenta?{' '}
            <Link href="/candidato/signup" className="text-henko-turquoise font-semibold hover:underline">
              Crear perfil
            </Link>
          </p>
          <div className="text-center mt-3">
            <Link href="/empleo" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              ← Volver a ofertas
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
