import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getEmailConfig } from '@/actions/email'
import EmailPageClient from '@/features/email/components/EmailPageClient'

export const metadata = {
  title: 'Email — Henkoaching',
}

export const dynamic = 'force-dynamic'

export default async function EmailPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const config = await getEmailConfig()

  return (
    <div className="w-full max-w-4xl">
      <div className="mb-8 md:mb-10">
        <h1 className="font-roxborough text-2xl md:text-3xl text-gray-900 mb-2">Email</h1>
        <p className="font-raleway text-gray-500 font-light">
          Configura el servidor de correo y consulta la bandeja de entrada.
        </p>
      </div>

      <EmailPageClient config={config} />
    </div>
  )
}
