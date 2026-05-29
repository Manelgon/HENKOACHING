import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getEmailConfig } from '@/actions/email'
import EmailConfigForm from '@/features/email/components/EmailConfigForm'

export const metadata = {
  title: 'Configuración de Email — Henkoaching',
}

export const dynamic = 'force-dynamic'

export default async function EmailConfigPage() {
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
    <div className="w-full">
      <div className="mb-8 md:mb-10">
        <h1 className="font-roxborough text-2xl md:text-3xl text-gray-900 mb-2">Configuración de Email</h1>
        <p className="font-raleway text-gray-500 font-light">
          Configura el servidor SMTP/IMAP y personaliza los templates de los emails de autenticación.
        </p>
      </div>
      <EmailConfigForm config={config} />
    </div>
  )
}
