import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getEmailConfig } from '@/actions/email'
import BandejaInbox from '@/features/email/components/BandejaInbox'

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
  const hasImapConfig = !!(config.imap_host && config.hasImapPassword)

  return (
    <div className="w-full">
      <BandejaInbox hasImapConfig={hasImapConfig} emailConfig={config} />
    </div>
  )
}
