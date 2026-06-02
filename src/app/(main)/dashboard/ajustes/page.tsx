import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCompanySettings, getSignedAssetUrl } from '@/lib/company-settings'
import AjustesForm from '@/features/ajustes/components/AjustesForm'

export const metadata = {
  title: 'Ajustes del emisor — Henkoaching',
}

export const dynamic = 'force-dynamic'

export default async function AjustesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const settings = await getCompanySettings()
  const [logoUrl, firmaUrl, headerUrl, footerUrl, sobreMiUrl, ratFirmadoUrl] = await Promise.all([
    getSignedAssetUrl(settings.logo_path),
    getSignedAssetUrl(settings.firma_path),
    getSignedAssetUrl(settings.header_path),
    getSignedAssetUrl(settings.footer_path),
    getSignedAssetUrl(settings.sobre_mi_path),
    getSignedAssetUrl(settings.rat_firmado_path),
  ])

  return (
    <div className="w-full max-w-4xl">
      <div className="mb-8 md:mb-10">
        <h1 className="font-roxborough text-2xl md:text-3xl text-gray-900 mb-2">Ajustes del emisor</h1>
        <p className="font-raleway text-gray-500 font-light">
          Datos fiscales, logo y firma que aparecerán en las facturas y documentos generados.
        </p>
      </div>

      <AjustesForm
        settings={settings}
        logoUrl={logoUrl}
        firmaUrl={firmaUrl}
        headerUrl={headerUrl}
        footerUrl={footerUrl}
        sobreMiUrl={sobreMiUrl}
        ratFirmadoUrl={ratFirmadoUrl}
        ratFirmadoAt={settings.rat_firmado_at}
      />
    </div>
  )
}
