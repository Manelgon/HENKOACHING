import 'server-only'
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from 'pdf-lib'

// =============================================================================
// IDENTIDAD HENKOACHING
// =============================================================================
const HENKO = {
  turquoise: rgb(0x1f / 255, 0x8f / 255, 0x9b / 255),
  turquoiseLight: rgb(0x2a / 255, 0xa8 / 255, 0xb5 / 255),
  greenblue: rgb(0xad / 255, 0xdb / 255, 0xd2 / 255),
  yellow: rgb(0xed / 255, 0xdc / 255, 0x88 / 255),
  cream: rgb(0xf9 / 255, 0xf3 / 255, 0xef / 255),
  ink: rgb(0.12, 0.14, 0.18),
  inkSoft: rgb(0.38, 0.42, 0.48),
  border: rgb(0.88, 0.88, 0.86),
}

const A4 = { w: 595.28, h: 841.89 }

// =============================================================================
// TIPOS
// =============================================================================
export type FacturaLineaPdf = {
  concepto: string
  cantidad: number
  precio_unitario: number
  descuento_porcentaje: number
  subtotal: number
}

export type EmisorPdf = {
  nombre: string
  nif: string
  direccion: string
  cp: string
  ciudad: string
  provincia: string
  pais: string
  email: string
  telefono: string
  web: string
  iban: string
  pieDePagina: string
}

export type FacturaPdfData = {
  numero: string
  fechaEmision: string  // ISO
  fechaVencimiento: string | null
  cliente: {
    nombre: string
    nif: string | null
    direccion: string | null
    email: string | null
  }
  lineas: FacturaLineaPdf[]
  baseImponible: number
  ivaPorcentaje: number
  ivaImporte: number
  irpfPorcentaje: number
  irpfImporte: number
  total: number
  estado: 'pendiente' | 'pagada' | 'vencida' | 'devuelta' | 'anulada'
  formaPago: string | null
  notas: string | null
  rectificaANumero?: string | null
  motivoRectificacion?: string | null
  tipoDocumento?: 'factura' | 'rectificativa' | 'abono'
}

export type Assets = {
  logoBytes?: Uint8Array | null
  firmaBytes?: Uint8Array | null
  headerBytes?: Uint8Array | null
}

// =============================================================================
// HELPERS
// =============================================================================
function moneyES(n: number): string {
  return n.toFixed(2).replace('.', ',') + ' €'
}

function fechaES(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function drawText(page: PDFPage, text: string, x: number, y: number, opts: { font: PDFFont; size?: number; color?: RGB }) {
  if (!text) return
  page.drawText(text, { x, y, size: opts.size ?? 10, font: opts.font, color: opts.color ?? HENKO.ink })
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = String(text ?? '').split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (font.widthOfTextAtSize(test, size) <= maxWidth) {
      line = test
    } else {
      if (line) lines.push(line)
      line = w
    }
  }
  if (line) lines.push(line)
  return lines.length ? lines : ['']
}

async function tryEmbedImage(pdf: PDFDocument, bytes: Uint8Array | null | undefined) {
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

function estadoLabel(estado: FacturaPdfData['estado']): { texto: string; color: RGB } {
  switch (estado) {
    case 'pagada':
      return { texto: 'PAGADA', color: rgb(0.13, 0.55, 0.40) }
    case 'vencida':
      return { texto: 'VENCIDA', color: rgb(0.84, 0.35, 0.20) }
    case 'devuelta':
      return { texto: 'DEVUELTA', color: rgb(0.84, 0.35, 0.20) }
    case 'anulada':
      return { texto: 'ANULADA', color: rgb(0.45, 0.45, 0.45) }
    default:
      return { texto: 'PENDIENTE', color: HENKO.turquoise }
  }
}

function formaPagoLabel(forma: string | null): string {
  if (!forma) return ''
  const map: Record<string, string> = {
    transferencia: 'Transferencia bancaria',
    bizum: 'Bizum',
    efectivo: 'Efectivo',
    tarjeta: 'Tarjeta',
    domiciliacion: 'Domiciliación',
  }
  return map[forma] ?? forma
}

// =============================================================================
// PDF BUILDER
// =============================================================================
export async function buildFacturaPdf(data: FacturaPdfData, emisor: EmisorPdf, assets: Assets): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  const page = pdf.addPage([A4.w, A4.h])
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)

  const headerImg = await tryEmbedImage(pdf, assets.headerBytes)
  const logoImg = await tryEmbedImage(pdf, assets.logoBytes)
  const firmaImg = await tryEmbedImage(pdf, assets.firmaBytes)

  const marginX = 48
  const contentW = A4.w - marginX * 2

  // -------------------------------------------------------------------------
  // 1) CABECERA (header banner o logo + nombre)
  // -------------------------------------------------------------------------
  let cursorY = A4.h - 50

  if (headerImg) {
    const targetW = A4.w
    const targetH = (headerImg.height / headerImg.width) * targetW
    const h = Math.min(targetH, 110)
    page.drawImage(headerImg, { x: 0, y: A4.h - h, width: targetW, height: h })
    cursorY = A4.h - h - 30
  } else {
    if (logoImg) {
      const maxH = 50
      const ratio = logoImg.width / logoImg.height
      const h = maxH
      const w = h * ratio
      page.drawImage(logoImg, { x: marginX, y: A4.h - 30 - h, width: w, height: h })
    }
    // Nombre emisor a la derecha
    const nameSize = 12
    const nameW = bold.widthOfTextAtSize(emisor.nombre, nameSize)
    drawText(page, emisor.nombre, A4.w - marginX - nameW, A4.h - 50, { font: bold, size: nameSize })
    cursorY = A4.h - 100
  }

  // -------------------------------------------------------------------------
  // 2) BANDA "FACTURA" + nº + fechas + estado
  // -------------------------------------------------------------------------
  const tipo = data.tipoDocumento ?? (data.rectificaANumero ? 'rectificativa' : 'factura')
  const esRectificativa = tipo !== 'factura'
  const colorTipo = tipo === 'abono'
    ? rgb(0.84, 0.40, 0.40)         // coral
    : tipo === 'rectificativa'
      ? rgb(0.94, 0.70, 0.32)       // naranja
      : HENKO.turquoise

  const bandY = cursorY - 50
  const bandH = 60
  page.drawRectangle({
    x: marginX,
    y: bandY,
    width: contentW,
    height: bandH,
    color: HENKO.cream,
    borderColor: esRectificativa ? colorTipo : HENKO.greenblue,
    borderWidth: esRectificativa ? 1.5 : 1,
  })

  const tituloDocumento =
    tipo === 'abono' ? 'FACTURA DE ABONO' :
    tipo === 'rectificativa' ? 'FACTURA RECTIFICATIVA' :
    'FACTURA'
  drawText(page, tituloDocumento, marginX + 16, bandY + bandH - 22, {
    font: bold,
    size: esRectificativa ? 13 : 14,
    color: colorTipo,
  })
  drawText(page, `Nº ${data.numero}`, marginX + 16, bandY + bandH - 38, { font: bold, size: 11 })
  drawText(page, `Emitida el ${fechaES(data.fechaEmision)}`, marginX + 16, bandY + 8, { font, size: 9, color: HENKO.inkSoft })
  if (data.fechaVencimiento) {
    drawText(page, `Vence el ${fechaES(data.fechaVencimiento)}`, marginX + 16 + 170, bandY + 8, { font, size: 9, color: HENKO.inkSoft })
  }

  // Sello de estado a la derecha de la banda
  const estado = estadoLabel(data.estado)
  const estadoSize = 12
  const estadoW = bold.widthOfTextAtSize(estado.texto, estadoSize)
  const estadoPad = 12
  const sealW = estadoW + estadoPad * 2
  const sealH = 26
  const sealX = marginX + contentW - 16 - sealW
  const sealY = bandY + (bandH - sealH) / 2
  page.drawRectangle({
    x: sealX,
    y: sealY,
    width: sealW,
    height: sealH,
    borderColor: estado.color,
    borderWidth: 1.5,
    color: rgb(1, 1, 1),
  })
  drawText(page, estado.texto, sealX + estadoPad, sealY + 8, { font: bold, size: estadoSize, color: estado.color })

  // -------------------------------------------------------------------------
  // 3) BLOQUES EMISOR / CLIENTE
  // -------------------------------------------------------------------------
  const blocksTop = bandY - 30
  const blockW = (contentW - 20) / 2

  function renderBloque(titulo: string, lines: string[], x: number, top: number): number {
    drawText(page, titulo, x, top, { font: bold, size: 9, color: HENKO.turquoise })
    let y = top - 16
    for (const line of lines) {
      if (!line) continue
      drawText(page, line, x, y, { font, size: 10, color: HENKO.ink })
      y -= 14
    }
    return y
  }

  const emisorLines = [
    emisor.nombre,
    emisor.nif ? `NIF: ${emisor.nif}` : '',
    emisor.direccion,
    [emisor.cp, emisor.ciudad].filter(Boolean).join(' '),
    [emisor.provincia, emisor.pais].filter(Boolean).join(', '),
    emisor.email,
    emisor.telefono,
  ].filter(Boolean)

  const clienteLines = [
    data.cliente.nombre,
    data.cliente.nif ? `NIF: ${data.cliente.nif}` : '',
    data.cliente.direccion ?? '',
    data.cliente.email ?? '',
  ].filter(Boolean)

  const emisorEnd = renderBloque('EMISOR', emisorLines, marginX, blocksTop)
  const clienteEnd = renderBloque('CLIENTE', clienteLines, marginX + blockW + 20, blocksTop)
  let blocksEnd = Math.min(emisorEnd, clienteEnd)

  // Aviso de rectificativa / abono (si aplica)
  if (esRectificativa) {
    const avisoY = blocksEnd - 20
    const motivoLines = data.motivoRectificacion ? wrap(data.motivoRectificacion, font, 9.5, contentW - 20) : []
    const avisoH = 28 + motivoLines.length * 12
    page.drawRectangle({
      x: marginX,
      y: avisoY - avisoH,
      width: contentW,
      height: avisoH,
      color: rgb(1, 0.96, 0.93),
      borderColor: colorTipo,
      borderWidth: 1,
    })
    const etiqueta = tipo === 'abono'
      ? `Abona la factura nº ${data.rectificaANumero}`
      : `Rectifica a la factura nº ${data.rectificaANumero}`
    drawText(page, etiqueta, marginX + 10, avisoY - 16, {
      font: bold,
      size: 10,
      color: colorTipo,
    })
    let mY = avisoY - 30
    for (const l of motivoLines) {
      drawText(page, l, marginX + 10, mY, { font, size: 9.5, color: HENKO.inkSoft })
      mY -= 12
    }
    blocksEnd = avisoY - avisoH - 8
  }

  // -------------------------------------------------------------------------
  // 4) TABLA DE LÍNEAS
  // -------------------------------------------------------------------------
  const tableTop = blocksEnd - 24

  const cols = {
    concepto: 230,
    cantidad: 50,
    precio: 75,
    descuento: 55,
    total: 89,
  }
  // total widths: 230 + 50 + 75 + 55 + 89 = 499 ≈ contentW (499.28)

  const headerH = 22
  const rowMinH = 22
  const padX = 8

  // Header row
  page.drawRectangle({
    x: marginX,
    y: tableTop - headerH,
    width: contentW,
    height: headerH,
    color: HENKO.turquoise,
  })

  let hx = marginX
  drawText(page, 'CONCEPTO', hx + padX, tableTop - 15, { font: bold, size: 9, color: rgb(1, 1, 1) })
  hx += cols.concepto
  drawTextRight(page, 'CANT.', hx + cols.cantidad - padX, tableTop - 15, { font: bold, size: 9, color: rgb(1, 1, 1) })
  hx += cols.cantidad
  drawTextRight(page, 'PRECIO', hx + cols.precio - padX, tableTop - 15, { font: bold, size: 9, color: rgb(1, 1, 1) })
  hx += cols.precio
  drawTextRight(page, 'DTO.', hx + cols.descuento - padX, tableTop - 15, { font: bold, size: 9, color: rgb(1, 1, 1) })
  hx += cols.descuento
  drawTextRight(page, 'TOTAL', hx + cols.total - padX, tableTop - 15, { font: bold, size: 9, color: rgb(1, 1, 1) })

  // Filas
  let ry = tableTop - headerH
  let alt = false
  for (const linea of data.lineas) {
    const conceptoLines = wrap(linea.concepto || '', font, 9.5, cols.concepto - padX * 2)
    const rowH = Math.max(rowMinH, conceptoLines.length * 12 + 10)

    if (alt) {
      page.drawRectangle({ x: marginX, y: ry - rowH, width: contentW, height: rowH, color: HENKO.cream })
    }
    alt = !alt

    let x = marginX
    // Concepto multilínea
    let textY = ry - 14
    for (const l of conceptoLines) {
      drawText(page, l, x + padX, textY, { font, size: 9.5, color: HENKO.ink })
      textY -= 12
    }
    x += cols.concepto

    const centerY = ry - rowH / 2 - 3
    drawTextRight(page, String(linea.cantidad ?? 0).replace('.', ','), x + cols.cantidad - padX, centerY, { font, size: 9.5 })
    x += cols.cantidad
    drawTextRight(page, moneyES(linea.precio_unitario ?? 0), x + cols.precio - padX, centerY, { font, size: 9.5 })
    x += cols.precio
    drawTextRight(page, `${(linea.descuento_porcentaje ?? 0).toFixed(0)}%`, x + cols.descuento - padX, centerY, { font, size: 9.5 })
    x += cols.descuento
    drawTextRight(page, moneyES(linea.subtotal ?? 0), x + cols.total - padX, centerY, { font: bold, size: 9.5 })

    // Línea divisoria
    page.drawLine({
      start: { x: marginX, y: ry - rowH },
      end: { x: marginX + contentW, y: ry - rowH },
      thickness: 0.5,
      color: HENKO.border,
    })

    ry -= rowH
  }

  // -------------------------------------------------------------------------
  // 5) TOTALES
  // -------------------------------------------------------------------------
  const totalsTop = ry - 16
  const totalsX = marginX + contentW - 230
  const totalsW = 230

  const totalsRows: { label: string; value: string; emphasis?: boolean }[] = [
    { label: 'Base imponible', value: moneyES(data.baseImponible) },
    { label: `IVA (${data.ivaPorcentaje}%)`, value: moneyES(data.ivaImporte) },
  ]
  if (data.irpfPorcentaje > 0) {
    totalsRows.push({ label: `IRPF (-${data.irpfPorcentaje}%)`, value: '-' + moneyES(data.irpfImporte) })
  }
  totalsRows.push({ label: 'TOTAL', value: moneyES(data.total), emphasis: true })

  let ty = totalsTop
  for (const tr of totalsRows) {
    if (tr.emphasis) {
      page.drawRectangle({
        x: totalsX,
        y: ty - 26,
        width: totalsW,
        height: 26,
        color: HENKO.turquoise,
      })
      drawText(page, tr.label, totalsX + 12, ty - 18, { font: bold, size: 11, color: rgb(1, 1, 1) })
      drawTextRight(page, tr.value, totalsX + totalsW - 12, ty - 18, { font: bold, size: 12, color: rgb(1, 1, 1) })
      ty -= 30
    } else {
      drawText(page, tr.label, totalsX + 12, ty - 14, { font, size: 9.5, color: HENKO.inkSoft })
      drawTextRight(page, tr.value, totalsX + totalsW - 12, ty - 14, { font, size: 10 })
      page.drawLine({
        start: { x: totalsX + 12, y: ty - 20 },
        end: { x: totalsX + totalsW - 12, y: ty - 20 },
        thickness: 0.3,
        color: HENKO.border,
      })
      ty -= 20
    }
  }

  // -------------------------------------------------------------------------
  // 6) FORMA DE PAGO + NOTAS + FIRMA
  // -------------------------------------------------------------------------
  const infoTop = totalsTop - 10
  const infoX = marginX
  const infoW = contentW - 250

  let infoY = infoTop

  if (data.formaPago) {
    drawText(page, 'FORMA DE PAGO', infoX, infoY, { font: bold, size: 9, color: HENKO.turquoise })
    drawText(page, formaPagoLabel(data.formaPago), infoX, infoY - 14, { font, size: 10 })
    infoY -= 32
  }

  if (data.formaPago === 'transferencia' && emisor.iban) {
    drawText(page, 'IBAN', infoX, infoY, { font: bold, size: 9, color: HENKO.turquoise })
    drawText(page, emisor.iban, infoX, infoY - 14, { font, size: 10 })
    infoY -= 32
  }

  if (data.notas) {
    drawText(page, 'NOTAS', infoX, infoY, { font: bold, size: 9, color: HENKO.turquoise })
    const noteLines = wrap(data.notas, font, 9.5, infoW)
    let ny = infoY - 14
    for (const l of noteLines.slice(0, 5)) {
      drawText(page, l, infoX, ny, { font, size: 9.5, color: HENKO.inkSoft })
      ny -= 12
    }
  }

  // Firma abajo a la derecha
  if (firmaImg) {
    const maxH = 60
    const maxW = 180
    const ratio = firmaImg.width / firmaImg.height
    let h = maxH
    let w = h * ratio
    if (w > maxW) {
      w = maxW
      h = w / ratio
    }
    const fx = A4.w - marginX - w
    const fy = 80
    page.drawImage(firmaImg, { x: fx, y: fy, width: w, height: h })
    drawTextRight(page, 'Firma', A4.w - marginX, fy - 12, { font, size: 8, color: HENKO.inkSoft })
  }

  // -------------------------------------------------------------------------
  // 7) PIE DE PÁGINA
  // -------------------------------------------------------------------------
  page.drawLine({
    start: { x: marginX, y: 50 },
    end: { x: A4.w - marginX, y: 50 },
    thickness: 0.5,
    color: HENKO.greenblue,
  })

  if (emisor.pieDePagina) {
    const footLines = wrap(emisor.pieDePagina, font, 8, contentW)
    let fy = 38
    for (const l of footLines.slice(0, 2)) {
      const w = font.widthOfTextAtSize(l, 8)
      drawText(page, l, A4.w / 2 - w / 2, fy, { font, size: 8, color: HENKO.inkSoft })
      fy -= 10
    }
  } else {
    const tagline = `${emisor.nombre || ''}${emisor.nif ? ` · ${emisor.nif}` : ''}${emisor.web ? ` · ${emisor.web}` : ''}`
    if (tagline.trim()) {
      const size = 8
      const w = font.widthOfTextAtSize(tagline, size)
      drawText(page, tagline, A4.w / 2 - w / 2, 35, { font, size, color: HENKO.inkSoft })
    }
  }

  return await pdf.save()
}

function drawTextRight(page: PDFPage, text: string, xRight: number, y: number, opts: { font: PDFFont; size?: number; color?: RGB }) {
  if (!text) return
  const size = opts.size ?? 10
  const w = opts.font.widthOfTextAtSize(text, size)
  page.drawText(text, { x: xRight - w, y, size, font: opts.font, color: opts.color ?? HENKO.ink })
}
