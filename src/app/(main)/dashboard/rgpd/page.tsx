import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCompanySettings, getSignedAssetUrl } from '@/lib/company-settings'
import { getRgpdDocumentos, getDerechosArco, getConsentimientos } from '@/actions/rgpd'
import RgpdDashboard from '@/features/rgpd/components/RgpdDashboard'

export const metadata = {
  title: 'Cumplimiento RGPD — Henkoaching',
}

export const dynamic = 'force-dynamic'

export default async function RgpdPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const [documentos, solicitudes, settings] = await Promise.all([
    getRgpdDocumentos(),
    getDerechosArco(),
    getCompanySettings(),
  ])

  let consentimientos: Awaited<ReturnType<typeof getConsentimientos>> = []
  try {
    consentimientos = await getConsentimientos()
  } catch (err) {
    console.error('[RgpdPage] Error cargando consentimientos:', err)
  }

  const ratFirmadoUrl = await getSignedAssetUrl(settings.rat_firmado_path)

  return (
    <RgpdDashboard
      documentos={documentos}
      solicitudes={solicitudes}
      consentimientos={consentimientos}
      ratFirmadoUrl={ratFirmadoUrl}
      ratFirmadoAt={settings.rat_firmado_at}
    />
  )
}
