import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/features/auth/components'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Acceder — Henkoaching',
}

export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role === 'candidato') redirect('/candidato/dashboard')
    if (profile?.role === 'empresa') redirect('/empresa/dashboard')
    redirect('/dashboard')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-roxborough text-3xl text-gray-900 mb-2">Bienvenida de nuevo</h1>
        <p className="font-raleway text-gray-500 font-light">Accede a tu panel de gestión</p>
      </div>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
