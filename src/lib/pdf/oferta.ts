import 'server-only'
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB, type PDFImage } from 'pdf-lib'

// =============================================================================
// IDENTIDAD HENKOACHING (mismo paleta que facturas)
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
const MARGIN_X = 48
const HEADER_MAX_H = 110
const FOOTER_MAX_H = 90
const TOP_AFTER_HEADER = 30   // espacio entre cabecera y contenido
const BOTTOM_BEFORE_FOOTER = 24

// =============================================================================
// TIPOS
// =============================================================================
export type OfertaPdfData = {
  titulo: string
  empresa: string             // ya resuelto: si oculta -> "Empresa confidencial"
  empresaOculta: boolean
  ubicacion: string
  modalidad: string
  jornada: string
  sector: string
  salario: string
  reportaA: string
  contrato: string
  descripcion: string
  funciones: string[]
  requisitos: string[]
  competencias: string[]
  ofrecemos: string[]
  estado: 'borrador' | 'publicada' | 'pausada' | 'cerrada'
  fechaPublicacion: string | null  // ISO o null
}

export type EmisorOfertaPdf = {
  nombre: string
  web: string
  pieDePagina: string
}

export type OfertaAssets = {
  headerBytes?: Uint8Array | null
  footerBytes?: Uint8Array | null
  logoBytes?: Uint8Array | null
}

// =============================================================================
// HELPERS
// =============================================================================
function fechaES(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

function drawText(page: PDFPage, text: string, x: number, y: number, opts: { font: PDFFont; size?: number; color?: RGB }) {
  if (!text) return
  page.drawText(text, { x, y, size: opts.size ?? 10, font: opts.font, color: opts.color ?? HENKO.ink })
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  // Soporta saltos de línea explícitos (\n) y wrap por palabras.
  const paragraphs = String(text ?? '').split(/\r?\n/)
  const out: string[] = []
  for (const para of paragraphs) {
    const words = para.split(/\s+/).filter(Boolean)
    if (words.length === 0) { out.push(''); continue }
    let line = ''
    for (const w of words) {
      const test = line ? `${line} ${w}` : w
      if (font.widthOfTextAtSize(test, size) <= maxWidth) {
        line = test
      } else {
        if (line) out.push(line)
        line = w
      }
    }
    if (line) out.push(line)
  }
  return out
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

function estadoLabel(estado: OfertaPdfData['estado']): { texto: string; color: RGB } {
  switch (estado) {
    case 'publicada':
      return { texto: 'PUBLICADA', color: HENKO.turquoise }
    case 'borrador':
      return { texto: 'BORRADOR', color: rgb(0.60, 0.55, 0.20) }
    case 'pausada':
      return { texto: 'PAUSADA', color: rgb(0.84, 0.45, 0.20) }
    case 'cerrada':
      return { texto: 'CERRADA', color: rgb(0.45, 0.45, 0.45) }
  }
}

function drawTextRight(page: PDFPage, text: string, xRight: number, y: number, opts: { font: PDFFont; size?: number; color?: RGB }) {
  if (!text) return
  const size = opts.size ?? 10
  const w = opts.font.widthOfTextAtSize(text, size)
  page.drawText(text, { x: xRight - w, y, size, font: opts.font, color: opts.color ?? HENKO.ink })
}

// =============================================================================
// PAGE FACTORY: garantiza que cada página lleva cabecera y pie
// =============================================================================
type PageCtx = {
  pdf: PDFDocument
  font: PDFFont
  bold: PDFFont
  headerImg: PDFImage | null
  footerImg: PDFImage | null
  logoImg: PDFImage | null
  emisor: EmisorOfertaPdf
}

type PageState = {
  page: PDFPage
  cursorY: number       // próxima Y disponible para escribir (descendente)
  contentBottom: number // Y mínima antes de invadir el pie
}

function addBrandedPage(ctx: PageCtx, isFirst: boolean): PageState {
  const page = ctx.pdf.addPage([A4.w, A4.h])

  // -------- CABECERA --------
  let topUsed = 50
  if (ctx.headerImg) {
    const targetW = A4.w
    const targetH = (ctx.headerImg.height / ctx.headerImg.width) * targetW
    const h = Math.min(targetH, HEADER_MAX_H)
    page.drawImage(ctx.headerImg, { x: 0, y: A4.h - h, width: targetW, height: h })
    topUsed = h + TOP_AFTER_HEADER
  } else {
    // Fallback: logo + nombre arriba (sólo si no hay banner)
    if (ctx.logoImg) {
      const maxH = 38
      const ratio = ctx.logoImg.width / ctx.logoImg.height
      const h = maxH
      const w = h * ratio
      page.drawImage(ctx.logoImg, { x: MARGIN_X, y: A4.h - 24 - h, width: w, height: h })
    }
    const nombre = ctx.emisor.nombre || 'Henkoaching'
    const nameSize = 11
    const nameW = ctx.bold.widthOfTextAtSize(nombre, nameSize)
    drawText(page, nombre, A4.w - MARGIN_X - nameW, A4.h - 40, { font: ctx.bold, size: nameSize, color: HENKO.turquoise })
    // Línea fina divisoria
    page.drawLine({
      start: { x: MARGIN_X, y: A4.h - 70 },
      end: { x: A4.w - MARGIN_X, y: A4.h - 70 },
      thickness: 0.5,
      color: HENKO.greenblue,
    })
    topUsed = 90
  }

  // -------- PIE --------
  let bottomUsed = 24
  if (ctx.footerImg) {
    const targetW = A4.w
    const targetH = (ctx.footerImg.height / ctx.footerImg.width) * targetW
    const h = Math.min(targetH, FOOTER_MAX_H)
    page.drawImage(ctx.footerImg, { x: 0, y: 0, width: targetW, height: h })
    bottomUsed = h
  } else {
    page.drawLine({
      start: { x: MARGIN_X, y: 50 },
      end: { x: A4.w - MARGIN_X, y: 50 },
      thickness: 0.5,
      color: HENKO.greenblue,
    })
    if (ctx.emisor.pieDePagina) {
      const lines = wrap(ctx.emisor.pieDePagina, ctx.font, 8, A4.w - MARGIN_X * 2).slice(0, 2)
      let fy = 38
      for (const l of lines) {
        const w = ctx.font.widthOfTextAtSize(l, 8)
        drawText(page, l, A4.w / 2 - w / 2, fy, { font: ctx.font, size: 8, color: HENKO.inkSoft })
        fy -= 10
      }
      bottomUsed = 50
    } else if (ctx.emisor.web) {
      const tagline = ctx.emisor.web
      const w = ctx.font.widthOfTextAtSize(tagline, 8)
      drawText(page, tagline, A4.w / 2 - w / 2, 35, { font: ctx.font, size: 8, color: HENKO.inkSoft })
      bottomUsed = 50
    }
  }

  const cursorY = A4.h - topUsed
  const contentBottom = bottomUsed + BOTTOM_BEFORE_FOOTER

  // Etiqueta "continúa" en páginas no iniciales
  if (!isFirst) {
    drawText(page, 'Continuación', MARGIN_X, cursorY, { font: ctx.bold, size: 9, color: HENKO.turquoise })
    return { page, cursorY: cursorY - 18, contentBottom }
  }

  return { page, cursorY, contentBottom }
}

// =============================================================================
// PDF BUILDER
// =============================================================================
export async function buildOfertaPdf(data: OfertaPdfData, emisor: EmisorOfertaPdf, assets: OfertaAssets): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique)

  const headerImg = await tryEmbedImage(pdf, assets.headerBytes)
  const footerImg = await tryEmbedImage(pdf, assets.footerBytes)
  const logoImg = await tryEmbedImage(pdf, assets.logoBytes)

  const ctx: PageCtx = { pdf, font, bold, headerImg, footerImg, logoImg, emisor }
  let state = addBrandedPage(ctx, true)
  const contentW = A4.w - MARGIN_X * 2

  // -------------------------------------------------------------------------
  // 1) CABECERA DE OFERTA: badge estado + título + empresa/ubicación + meta
  // -------------------------------------------------------------------------
  // Badge estado
  const estado = estadoLabel(data.estado)
  const estadoSize = 9
  const estadoText = data.estado === 'publicada' && data.fechaPublicacion
    ? `${estado.texto} · ${fechaES(data.fechaPublicacion)}`
    : estado.texto
  const estadoW = bold.widthOfTextAtSize(estadoText, estadoSize)
  const badgePad = 10
  const badgeW = estadoW + badgePad * 2
  const badgeH = 20
  state.page.drawRectangle({
    x: MARGIN_X,
    y: state.cursorY - badgeH,
    width: badgeW,
    height: badgeH,
    color: rgb(1, 1, 1),
    borderColor: estado.color,
    borderWidth: 1.2,
  })
  drawText(state.page, estadoText, MARGIN_X + badgePad, state.cursorY - badgeH + 6, {
    font: bold, size: estadoSize, color: estado.color,
  })
  state.cursorY -= badgeH + 18

  // Título (multilínea si hace falta)
  const tituloLines = wrap(data.titulo || 'Oferta de empleo', bold, 22, contentW)
  for (const l of tituloLines) {
    drawText(state.page, l, MARGIN_X, state.cursorY - 22, { font: bold, size: 22, color: HENKO.ink })
    state.cursorY -= 28
  }
  state.cursorY -= 4

  // Subtítulo: empresa · ubicación
  const subtitle = [data.empresa, data.ubicacion].filter(Boolean).join('  ·  ')
  if (subtitle) {
    drawText(state.page, subtitle, MARGIN_X, state.cursorY - 14, {
      font, size: 11.5, color: HENKO.inkSoft,
    })
    state.cursorY -= 22
  }

  // Aviso si la empresa está oculta
  if (data.empresaOculta) {
    drawText(state.page, 'Identidad de la empresa confidencial — facilitada por Henkoaching al candidato seleccionado.', MARGIN_X, state.cursorY - 11, {
      font: italic, size: 8.5, color: HENKO.inkSoft,
    })
    state.cursorY -= 18
  }

  state.cursorY -= 4

  // Banda meta: Modalidad | Jornada | Sector | Salario
  const meta = [
    { label: 'Modalidad', value: data.modalidad },
    { label: 'Jornada', value: data.jornada },
    { label: 'Sector', value: data.sector },
    { label: 'Salario', value: data.salario },
  ].filter((m) => m.value)
  if (meta.length > 0) {
    const bandH = 44
    state.page.drawRectangle({
      x: MARGIN_X,
      y: state.cursorY - bandH,
      width: contentW,
      height: bandH,
      color: HENKO.cream,
    })
    const cellW = contentW / meta.length
    for (let i = 0; i < meta.length; i++) {
      const cellX = MARGIN_X + cellW * i
      drawText(state.page, meta[i].label.toUpperCase(), cellX + 12, state.cursorY - 14, {
        font: bold, size: 7.5, color: HENKO.turquoise,
      })
      // Valor recortado por ancho
      const valLines = wrap(meta[i].value, font, 10, cellW - 18)
      drawText(state.page, valLines[0] ?? '', cellX + 12, state.cursorY - 30, {
        font, size: 10, color: HENKO.ink,
      })
    }
    state.cursorY -= bandH + 16
  }

  // -------------------------------------------------------------------------
  // 2) BLOQUE "REPORTA A / CONTRATO"
  // -------------------------------------------------------------------------
  if (data.reportaA || data.contrato) {
    const items = [
      { label: 'Reporta a', value: data.reportaA },
      { label: 'Contrato', value: data.contrato },
    ].filter((i) => i.value)
    const colW = contentW / Math.max(items.length, 1)
    let maxH = 0
    for (let i = 0; i < items.length; i++) {
      const x = MARGIN_X + colW * i
      drawText(state.page, items[i].label.toUpperCase(), x, state.cursorY - 10, {
        font: bold, size: 8, color: HENKO.turquoise,
      })
      const lines = wrap(items[i].value, font, 10.5, colW - 16)
      let ly = state.cursorY - 26
      for (const l of lines) {
        drawText(state.page, l, x, ly, { font, size: 10.5, color: HENKO.ink })
        ly -= 13
      }
      const used = (state.cursorY - 26) - ly + 13
      if (used > maxH) maxH = used
    }
    state.cursorY -= (10 + maxH + 14)
    // Línea divisoria fina
    state.page.drawLine({
      start: { x: MARGIN_X, y: state.cursorY + 2 },
      end: { x: MARGIN_X + contentW, y: state.cursorY + 2 },
      thickness: 0.4,
      color: HENKO.border,
    })
    state.cursorY -= 14
  }

  // -------------------------------------------------------------------------
  // 3) SECCIONES (descripción + listas), con salto de página automático
  // -------------------------------------------------------------------------
  const ensureSpace = (needed: number) => {
    if (state.cursorY - needed < state.contentBottom) {
      state = addBrandedPage(ctx, false)
    }
  }

  const drawHeading = (titulo: string) => {
    ensureSpace(28)
    drawText(state.page, titulo, MARGIN_X, state.cursorY - 14, {
      font: bold, size: 13.5, color: HENKO.turquoise,
    })
    // Subrayado sutil
    state.page.drawLine({
      start: { x: MARGIN_X, y: state.cursorY - 20 },
      end: { x: MARGIN_X + 38, y: state.cursorY - 20 },
      thickness: 1.5,
      color: HENKO.turquoise,
    })
    state.cursorY -= 30
  }

  const drawParagraph = (texto: string) => {
    const lines = wrap(texto, font, 10.5, contentW)
    for (const l of lines) {
      ensureSpace(14)
      if (l === '') { state.cursorY -= 8; continue }
      drawText(state.page, l, MARGIN_X, state.cursorY - 12, { font, size: 10.5, color: HENKO.ink })
      state.cursorY -= 14
    }
    state.cursorY -= 8
  }

  const drawBullets = (items: string[]) => {
    const bulletX = MARGIN_X + 4
    const textX = MARGIN_X + 16
    const textW = contentW - 16
    for (const item of items) {
      const lines = wrap(item, font, 10.5, textW)
      const itemH = Math.max(lines.length, 1) * 14 + 2
      ensureSpace(itemH)
      // Punto
      state.page.drawCircle({
        x: bulletX + 1,
        y: state.cursorY - 7,
        size: 1.6,
        color: HENKO.turquoise,
      })
      let ly = state.cursorY - 12
      for (const l of lines) {
        drawText(state.page, l, textX, ly, { font, size: 10.5, color: HENKO.ink })
        ly -= 14
      }
      state.cursorY -= itemH
    }
    state.cursorY -= 6
  }

  // Descripción
  if (data.descripcion.trim()) {
    drawHeading('Descripción del puesto')
    drawParagraph(data.descripcion)
  }

  // Funciones
  if (data.funciones.length > 0) {
    drawHeading('Funciones principales')
    drawBullets(data.funciones)
  }

  // Requisitos
  if (data.requisitos.length > 0) {
    drawHeading('Requisitos')
    drawBullets(data.requisitos)
  }

  // Competencias clave
  if (data.competencias.length > 0) {
    drawHeading('Competencias clave')
    drawBullets(data.competencias)
  }

  // Se ofrece
  if (data.ofrecemos.length > 0) {
    drawHeading('Se ofrece')
    drawBullets(data.ofrecemos)
  }

  // Paginación al pie de cada página (encima del banner): "Página X / Y"
  const pages = pdf.getPages()
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i]
    const label = `${i + 1} / ${pages.length}`
    const size = 7.5
    const yBase = footerImg
      ? Math.min(FOOTER_MAX_H, (footerImg.height / footerImg.width) * A4.w) + 4
      : 56
    drawTextRight(p, label, A4.w - MARGIN_X, yBase, { font, size, color: HENKO.inkSoft })
  }

  return await pdf.save()
}
