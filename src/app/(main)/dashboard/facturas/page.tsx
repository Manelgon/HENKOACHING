import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCompanySettings } from '@/lib/company-settings'
import FacturasView from '@/features/facturas/components/FacturasView'

export const metadata = {
  title: 'Facturas — Henkoaching',
}

export const dynamic = 'force-dynamic'

export default async function FacturasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  // Marcar vencidas en vuelo (sin tocar BD aún — solo visual). Si se quiere
  // persistir, hacer un cron job aparte.
  const [{ data: facturasRaw }, { data: clientes }] = await Promise.all([
    supabase
      .from('facturas' as never)
      .select('id, numero, cliente_id, cliente_nombre, cliente_nif, fecha_emision, fecha_vencimiento, total, base_imponible, iva_porcentaje, iva_importe, irpf_porcentaje, irpf_importe, estado, forma_pago, notas, created_at, factura_rectificada_id, motivo_rectificacion')
      .order('fecha_emision', { ascending: false }),
    supabase
      .from('clientes')
      .select('id, nombre, empresa, email, nif_cif, direccion_fiscal')
      .is('deleted_at', null)
      .order('nombre', { ascending: true }),
  ])

  const settings = await getCompanySettings()

  return (
    <div className="w-full">
      <div className="mb-8 md:mb-10">
        <h1 className="font-roxborough text-2xl md:text-3xl text-gray-900 mb-2">Facturas</h1>
        <p className="font-raleway text-gray-500 font-light">
          Emite, descarga y controla el estado de tus facturas.
        </p>
      </div>

      <FacturasView
        facturas={(facturasRaw as unknown as FacturaRow[]) ?? []}
        clientes={(clientes as unknown as ClienteOption[]) ?? []}
        serieDefault={settings.serie_default || 'F'}
        emisorListo={!!settings.emisor_nombre && !!settings.emisor_nif}
      />
    </div>
  )
}

export type FacturaRow = {
  id: string
  numero: string
  cliente_id: string | null
  cliente_nombre: string
  cliente_nif: string | null
  fecha_emision: string
  fecha_vencimiento: string | null
  total: number
  base_imponible: number
  iva_porcentaje: number
  iva_importe: number
  irpf_porcentaje: number
  irpf_importe: number
  estado: 'pendiente' | 'pagada' | 'vencida' | 'devuelta' | 'anulada'
  forma_pago: 'transferencia' | 'efectivo' | 'bizum' | 'tarjeta' | 'domiciliacion' | null
  notas: string | null
  created_at: string | null
  factura_rectificada_id: string | null
  motivo_rectificacion: string | null
}

export type ClienteOption = {
  id: string
  nombre: string
  empresa: string | null
  email: string
  nif_cif: string | null
  direccion_fiscal: string | null
}
