import 'server-only'
import { PDFDocument, rgb, type PDFFont, type PDFPage, type RGB } from 'pdf-lib'

// =============================================================================
// IDENTIDAD HENKOACHING — paleta y helpers compartidos por todos los PDF
// (factura, oferta, candidato). Un solo sitio para el branding y el dibujado
// básico. NOTA: `wrap` NO se comparte porque diverge entre documentos
// (la factura colapsa saltos de línea; oferta/candidato respetan \n).
// =============================================================================
export const HENKO = {
  turquoise: rgb(0x1f / 255, 0x8f / 255, 0x9b / 255),
  turquoiseLight: rgb(0x2a / 255, 0xa8 / 255, 0xb5 / 255),
  greenblue: rgb(0xad / 255, 0xdb / 255, 0xd2 / 255),
  yellow: rgb(0xed / 255, 0xdc / 255, 0x88 / 255),
  cream: rgb(0xf9 / 255, 0xf3 / 255, 0xef / 255),
  ink: rgb(0.12, 0.14, 0.18),
  inkSoft: rgb(0.38, 0.42, 0.48),
  border: rgb(0.88, 0.88, 0.86),
}

export const A4 = { w: 595.28, h: 841.89 }

export function drawText(page: PDFPage, text: string, x: number, y: number, opts: { font: PDFFont; size?: number; color?: RGB }) {
  if (!text) return
  page.drawText(text, { x, y, size: opts.size ?? 10, font: opts.font, color: opts.color ?? HENKO.ink })
}

export function drawTextRight(page: PDFPage, text: string, xRight: number, y: number, opts: { font: PDFFont; size?: number; color?: RGB }) {
  if (!text) return
  const size = opts.size ?? 10
  const w = opts.font.widthOfTextAtSize(text, size)
  page.drawText(text, { x: xRight - w, y, size, font: opts.font, color: opts.color ?? HENKO.ink })
}

export function drawTextCenter(page: PDFPage, text: string, xCenter: number, y: number, opts: { font: PDFFont; size?: number; color?: RGB }) {
  if (!text) return
  const size = opts.size ?? 10
  const w = opts.font.widthOfTextAtSize(text, size)
  page.drawText(text, { x: xCenter - w / 2, y, size, font: opts.font, color: opts.color ?? HENKO.ink })
}

export async function tryEmbedImage(pdf: PDFDocument, bytes: Uint8Array | null | undefined) {
  if (!bytes) return null
  try {
    return await pdf.embedPng(bytes)
  } catch {
    try {
      return await pdf.embedJpg(bytes)
    } catch {
      return null
    }
  }
}
