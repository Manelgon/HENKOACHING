import 'server-only'
import QRCode from 'qrcode'
import { SITE_URL } from '@/features/blog/lib/site-config'

// En F2 el QR apunta a una página propia de verificación. En F4 (envío AEAT
// activo) se reemplazará por la URL oficial de validación de la sede:
//   https://prewww2.aeat.es/wlpl/TIKE-CONT/ValidarQR?...
// El parámetro `h` permite contrastar la huella si se quiere validar manualmente.
export function urlVerificacion(facturaId: string, hashFactura: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.trim() || SITE_URL
  const params = new URLSearchParams({ h: hashFactura.slice(0, 16) })
  return `${base.replace(/\/$/, '')}/verificar/${facturaId}?${params.toString()}`
}

export async function generarQrPng(url: string): Promise<Uint8Array> {
  // Margen mínimo y nivel medio: legible en impresión a tamaño ~22mm.
  const buf = await QRCode.toBuffer(url, {
    errorCorrectionLevel: 'M',
    type: 'png',
    margin: 1,
    width: 320,
  })
  return new Uint8Array(buf)
}
