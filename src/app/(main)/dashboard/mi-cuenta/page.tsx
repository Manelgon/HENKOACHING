import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MiCuentaForm from '@/features/mi-cuenta/components/MiCuentaForm'

export const metadata = { title: 'Mi cuenta — Henkoaching' }
export const dynamic = 'force-dynamic'

export default async function MiCuentaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="w-full p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 font-raleway mb-1">Mi cuenta</h1>
      <p className="text-sm text-gray-500 font-raleway mb-8">{user.email}</p>
      <MiCuentaForm currentEmail={user.email ?? ''} />
    </div>
  )
}
