import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MfaManager from '@/features/ajustes/components/MfaManager'

export const metadata = { title: 'Mi cuenta — Henkoaching' }
export const dynamic = 'force-dynamic'

export default async function MiCuentaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="p-6 md:p-8 max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 font-raleway mb-1">Mi cuenta</h1>
      <p className="text-sm text-gray-500 font-raleway mb-8">{user.email}</p>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <MfaManager />
      </div>
    </div>
  )
}
