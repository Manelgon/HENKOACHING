import { redirect } from 'next/navigation'
import Link from 'next/link'
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
      <div className="mb-6 md:mb-8">
        <h1 className="font-roxborough text-2xl md:text-3xl text-gray-900 mb-1.5">Email</h1>
        <p className="font-raleway text-gray-500 font-light text-sm">
          Gestiona tu bandeja de entrada y envía emails desde el panel.
        </p>
      </div>

      {!hasImapConfig ? (
        <div className="flex flex-col items-center justify-center bg-white rounded-[2rem] border border-gray-100 shadow-sm px-8 py-20 text-center max-w-lg mx-auto">
          <div className="w-20 h-20 rounded-2xl bg-henko-turquoise/10 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-henko-turquoise" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="font-roxborough text-xl text-gray-900 mb-3">Servicio de email no configurado</h2>
          <p className="font-raleway text-gray-500 text-sm font-light mb-8 leading-relaxed">
            Para ver y enviar emails desde el panel, configura las credenciales SMTP e IMAP del servidor de correo.
          </p>
          <Link
            href="/dashboard/email/configuracion"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-henko-turquoise text-white font-raleway font-semibold text-sm hover:bg-henko-turquoise-light transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Ir a configuración
          </Link>
        </div>
      ) : (
        <BandejaInbox hasImapConfig={hasImapConfig} />
      )}
    </div>
  )
}
