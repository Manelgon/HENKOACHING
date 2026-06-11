import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'

export type CompanySettings = {
  emisor_nombre: string
  emisor_nif: string
  emisor_direccion: string
  emisor_cp: string
  emisor_ciudad: string
  emisor_provincia: string
  emisor_pais: string
  emisor_email: string
  emisor_telefono: string
  emisor_web: string
  emisor_iban: string
  logo_path: string | null
  firma_path: string | null
  header_path: string | null
  footer_path: string | null
  sobre_mi_path: string | null
  iva_default: number
  irpf_default: number
  forma_pago_default: 'transferencia' | 'efectivo' | 'bizum' | 'tarjeta' | 'domiciliacion' | null
  dias_vencimiento_default: number
  serie_default: string
  proximo_numero: number
  prefijo_anio: boolean
  // Verifactu — bloque SistemaInformatico (productor del software)
  verifactu_productor_nombre: string
  verifactu_productor_nif: string
  verifactu_sistema_nombre: string
  verifactu_sistema_id: string
  verifactu_version: string
  verifactu_numero_instalacion: string
  // RGPD — RAT firmado
  rat_firmado_path: string | null
  rat_firmado_at: string | null
}

const DEFAULTS: CompanySettings = {
  emisor_nombre: '',
  emisor_nif: '',
  emisor_direccion: '',
  emisor_cp: '',
  emisor_ciudad: '',
  emisor_provincia: '',
  emisor_pais: 'España',
  emisor_email: '',
  emisor_telefono: '',
  emisor_web: '',
  emisor_iban: '',
  logo_path: null,
  firma_path: null,
  header_path: null,
  footer_path: null,
  sobre_mi_path: null,
  iva_default: 21,
  irpf_default: 0,
  forma_pago_default: 'transferencia',
  dias_vencimiento_default: 30,
  serie_default: 'F',
  proximo_numero: 1,
  prefijo_anio: true,
  verifactu_productor_nombre: '',
  verifactu_productor_nif: '',
  verifactu_sistema_nombre: 'Henkoaching Facturación',
  verifactu_sistema_id: 'HK',
  verifactu_version: '1.0',
  verifactu_numero_instalacion: 'HK-01',
  rat_firmado_path: null,
  rat_firmado_at: null,
}

export async function getCompanySettings(): Promise<CompanySettings> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('company_settings' as never)
    .select('*')
    .eq('id', 1)
    .maybeSingle()

  if (!data) return DEFAULTS
  return { ...DEFAULTS, ...(data as unknown as CompanySettings) }
}

export async function getSignedAssetUrl(path: string | null, expiresInSeconds = 3600): Promise<string | null> {
  if (!path) return null
  const supabase = createAdminClient()
  const { data } = await supabase.storage.from('doc-assets').createSignedUrl(path, expiresInSeconds)
  return data?.signedUrl ?? null
}

// Caché en memoria de los assets de documentos (logo, firma, cabeceras). Cambian
// muy rara vez pero se descargaban de Storage en cada generación de PDF. Un TTL
// corto evita descargas repetidas en ráfagas de PDFs sin servir bytes obsoletos
// más allá de unos minutos tras subir un nuevo asset.
const ASSET_TTL_MS = 5 * 60 * 1000
const assetCache = new Map<string, { bytes: Uint8Array; expira: number }>()

export async function downloadAssetBytes(path: string | null): Promise<Uint8Array | null> {
  if (!path) return null

  const ahora = Date.now()
  const cacheado = assetCache.get(path)
  if (cacheado && cacheado.expira > ahora) return cacheado.bytes

  const supabase = createAdminClient()
  const { data, error } = await supabase.storage.from('doc-assets').download(path)
  if (error || !data) return null
  const bytes = new Uint8Array(await data.arrayBuffer())

  assetCache.set(path, { bytes, expira: ahora + ASSET_TTL_MS })
  return bytes
}
