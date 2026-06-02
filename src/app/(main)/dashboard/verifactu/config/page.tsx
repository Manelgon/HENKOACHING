import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCompanySettings } from '@/lib/company-settings'
import ConfigVerifactuForm from '@/features/verifactu/components/ConfigVerifactuForm'

export const metadata = {
  title: 'Config Veri*factu — Henkoaching',
}

export const dynamic = 'force-dynamic'

export default async function ConfigVerifactuPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const settings = await getCompanySettings()

  return (
    <div className="w-full max-w-3xl">
      <div className="mb-8 md:mb-10">
        <h1 className="font-roxborough text-2xl md:text-3xl text-gray-900 mb-2">Config Veri*factu</h1>
        <p className="font-raleway text-gray-500 font-light">
          Configuración técnica del sistema informático de facturación verificable (RD 1007/2023).
        </p>
      </div>

      <ConfigVerifactuForm
        initial={{
          verifactu_productor_nombre: settings.verifactu_productor_nombre,
          verifactu_productor_nif: settings.verifactu_productor_nif,
          verifactu_sistema_nombre: settings.verifactu_sistema_nombre,
          verifactu_sistema_id: settings.verifactu_sistema_id,
          verifactu_version: settings.verifactu_version,
          verifactu_numero_instalacion: settings.verifactu_numero_instalacion,
        }}
        emisorNombre={settings.emisor_nombre}
        emisorNif={settings.emisor_nif}
      />

      <section className="mt-8 rounded-2xl border border-gray-100 bg-gray-50 p-5 text-xs text-gray-500 font-raleway leading-relaxed">
        <p className="font-semibold text-gray-700 mb-2">Notas técnicas</p>
        <ul className="space-y-1 list-disc pl-5">
          <li>Las facturas emitidas son inmutables (RD 1007/2023, art. 8). Para corregir importes o datos del cliente, emite una rectificativa o un abono desde Facturas.</li>
          <li>Cada nueva factura genera un registro encadenado por SHA-256 con el anterior.</li>
          <li>El envío automático a la Agencia Tributaria requiere certificado FNMT y se activa en una fase posterior.</li>
        </ul>
      </section>
    </div>
  )
}
