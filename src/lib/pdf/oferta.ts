import 'server-only'
import { PDFDocument, StandardFonts, type PDFFont, type PDFPage, type PDFImage } from 'pdf-lib'
import { HENKO, A4, drawText, drawTextRight, drawTextCenter, tryEmbedImage } from './_helpers'

const MARGIN_X = 48
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
}

export type OfertaAssets = {
  logoBytes?: Uint8Array | null
}

// =============================================================================
// HELPERS
// =============================================================================
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

// =============================================================================
// PAGE FACTORY: cada página arranca con el logo arriba a la izquierda
// =============================================================================
type PageCtx = {
  pdf: PDFDocument
  font: PDFFont
  bold: PDFFont
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

  // -------- CABECERA: sólo logo arriba a la izquierda --------
  let topUsed = 50
  if (ctx.logoImg) {
    const maxH = 80
    const ratio = ctx.logoImg.width / ctx.logoImg.height
    const h = maxH
    const w = h * ratio
    page.drawImage(ctx.logoImg, { x: MARGIN_X, y: A4.h - 36 - h, width: w, height: h })
    topUsed = 36 + h + 14
  } else {
    // Sin logo, dejamos un margen superior limpio.
    topUsed = 60
  }

  // -------- PIE: reservamos espacio para línea + texto institucional --------
  // El contenido del pie (firma corporativa + paginación + fecha) se pinta
  // en una segunda pasada al final, cuando ya conocemos el total de páginas.
  const bottomUsed = 42

  const cursorY = A4.h - topUsed
  const contentBottom = bottomUsed + BOTTOM_BEFORE_FOOTER

  void isFirst
  return { page, cursorY, contentBottom }
}

function fechaLargaES(d: Date): string {
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

// =============================================================================
// PDF BUILDER
// =============================================================================
export async function buildOfertaPdf(data: OfertaPdfData, emisor: EmisorOfertaPdf, assets: OfertaAssets): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique)

  const logoImg = await tryEmbedImage(pdf, assets.logoBytes)

  const ctx: PageCtx = { pdf, font, bold, logoImg, emisor }
  let state = addBrandedPage(ctx, true)
  const contentW = A4.w - MARGIN_X * 2

  // -------------------------------------------------------------------------
  // 1) CABECERA DE OFERTA: título + empresa/ubicación + meta
  //    El estado interno (borrador/publicada/...) no se muestra: el PDF es
  //    un documento que el admin comparte con candidatos.
  // -------------------------------------------------------------------------

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
    const cellW = contentW / meta.length
    // Pre-calcular el wrap (max 2 líneas) para que el alto de la banda se ajuste
    // al contenido y el salario largo no se trunque.
    const wrappedValues = meta.map((m) => wrap(m.value, font, 9.5, cellW - 18).slice(0, 2))
    const maxLines = Math.max(1, ...wrappedValues.map((l) => l.length))
    const labelGap = 16
    const lineH = 13
    const padBottom = 10
    const bandH = labelGap + maxLines * lineH + padBottom

    state.page.drawRectangle({
      x: MARGIN_X,
      y: state.cursorY - bandH,
      width: contentW,
      height: bandH,
      color: HENKO.cream,
    })
    for (let i = 0; i < meta.length; i++) {
      const cellX = MARGIN_X + cellW * i
      drawText(state.page, meta[i].label.toUpperCase(), cellX + 12, state.cursorY - 12, {
        font: bold, size: 7.5, color: HENKO.turquoise,
      })
      let vy = state.cursorY - labelGap - 10
      for (const l of wrappedValues[i]) {
        drawText(state.page, l, cellX + 12, vy, { font, size: 9.5, color: HENKO.ink })
        vy -= lineH
      }
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
  // 3) SECCIONES (descripción + listas), con pagination que evita cortes feos
  // -------------------------------------------------------------------------
  const FONT_BODY = 10.5
  const LINE_H = 14
  const HEADING_H = 30           // alto reservado por el título de sección
  const SECTION_TAIL = 8         // separación tras la sección
  const BULLET_PAD = 2

  // Capacidad útil de una página recién creada (para decidir page-break previo)
  const freshPageCapacity = () => {
    const ghost = addBrandedPage(ctx, false)
    const cap = ghost.cursorY - ghost.contentBottom
    // descartamos la página fantasma
    ctx.pdf.removePage(ctx.pdf.getPageCount() - 1)
    return cap
  }
  const PAGE_CAPACITY = freshPageCapacity()

  const measureParagraph = (texto: string): number => {
    const lines = wrap(texto, font, FONT_BODY, contentW)
    return lines.reduce((sum, l) => sum + (l === '' ? 8 : LINE_H), 0) + SECTION_TAIL
  }
  const measureBulletItem = (item: string): number => {
    const lines = wrap(item, font, FONT_BODY, contentW - 16)
    return Math.max(lines.length, 1) * LINE_H + BULLET_PAD
  }
  const measureBullets = (items: string[]): number => {
    return items.reduce((sum, it) => sum + measureBulletItem(it), 0) + 6
  }

  const ensureSpace = (needed: number) => {
    if (state.cursorY - needed < state.contentBottom) {
      state = addBrandedPage(ctx, false)
    }
  }

  // Decide si conviene saltar de página ANTES de empezar la sección,
  // para que título y al menos N líneas/items queden juntos.
  const planSection = (totalH: number, minBlockH: number) => {
    const remaining = state.cursorY - state.contentBottom
    if (totalH <= remaining) return                  // cabe entera aquí
    if (totalH <= PAGE_CAPACITY) {                   // cabe en página fresca → salto
      state = addBrandedPage(ctx, false)
      return
    }
    if (minBlockH > remaining) {                     // no cabe nada decente aquí
      state = addBrandedPage(ctx, false)
    }
  }

  const drawHeading = (titulo: string) => {
    drawText(state.page, titulo, MARGIN_X, state.cursorY - 16, {
      font: bold, size: 13.5, color: HENKO.turquoise,
    })
    state.page.drawLine({
      start: { x: MARGIN_X, y: state.cursorY - 22 },
      end: { x: MARGIN_X + 38, y: state.cursorY - 22 },
      thickness: 1.5,
      color: HENKO.turquoise,
    })
    state.cursorY -= HEADING_H
  }

  const drawParagraph = (texto: string) => {
    const lines = wrap(texto, font, FONT_BODY, contentW)
    for (const l of lines) {
      ensureSpace(LINE_H)
      if (l === '') { state.cursorY -= 8; continue }
      drawText(state.page, l, MARGIN_X, state.cursorY - 12, { font, size: FONT_BODY, color: HENKO.ink })
      state.cursorY -= LINE_H
    }
    state.cursorY -= SECTION_TAIL
  }

  const drawBullets = (items: string[]) => {
    const bulletX = MARGIN_X + 4
    const textX = MARGIN_X + 16
    const textW = contentW - 16
    for (const item of items) {
      const lines = wrap(item, font, FONT_BODY, textW)
      const itemH = Math.max(lines.length, 1) * LINE_H + BULLET_PAD
      ensureSpace(itemH)
      state.page.drawCircle({
        x: bulletX + 1,
        y: state.cursorY - 7,
        size: 1.6,
        color: HENKO.turquoise,
      })
      let ly = state.cursorY - 12
      for (const l of lines) {
        drawText(state.page, l, textX, ly, { font, size: FONT_BODY, color: HENKO.ink })
        ly -= LINE_H
      }
      state.cursorY -= itemH
    }
    state.cursorY -= 6
  }

  // Descripción
  if (data.descripcion.trim()) {
    const total = HEADING_H + measureParagraph(data.descripcion)
    const minBlock = HEADING_H + LINE_H * 3       // título + ~3 líneas mínimo
    planSection(total, minBlock)
    drawHeading('Descripción del puesto')
    drawParagraph(data.descripcion)
  }

  // Listas: medir total y planificar antes de dibujar
  const renderList = (titulo: string, items: string[]) => {
    if (items.length === 0) return
    const total = HEADING_H + measureBullets(items)
    // mínimo aceptable en página: título + 2 primeros items
    const minBlock = HEADING_H + items.slice(0, 2).reduce((s, i) => s + measureBulletItem(i), 0)
    planSection(total, minBlock)
    drawHeading(titulo)
    drawBullets(items)
  }

  renderList('Funciones principales', data.funciones)
  renderList('Requisitos', data.requisitos)
  renderList('Competencias clave', data.competencias)
  renderList('Se ofrece', data.ofrecemos)

  // -------------------------------------------------------------------------
  // 4) PIE: firma corporativa (izq) + paginación (centro) + fecha (der)
  //    Se pinta al final para conocer ya el total de páginas.
  // -------------------------------------------------------------------------
  const fechaDoc = fechaLargaES(new Date())
  const firma = [emisor.nombre, emisor.web].filter(Boolean).join(' · ')

  const pages = pdf.getPages()
  const FOOTER_LINE_Y = 36
  const FOOTER_TEXT_Y = 22
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i]
    // Línea separadora fina
    p.drawLine({
      start: { x: MARGIN_X, y: FOOTER_LINE_Y },
      end: { x: A4.w - MARGIN_X, y: FOOTER_LINE_Y },
      thickness: 0.5,
      color: HENKO.greenblue,
    })
    // Izquierda: firma
    if (firma) {
      drawText(p, firma, MARGIN_X, FOOTER_TEXT_Y, { font, size: 8, color: HENKO.inkSoft })
    }
    // Centro: paginación
    drawTextCenter(p, `Página ${i + 1} de ${pages.length}`, A4.w / 2, FOOTER_TEXT_Y, {
      font, size: 8, color: HENKO.inkSoft,
    })
    // Derecha: fecha del documento
    drawTextRight(p, fechaDoc, A4.w - MARGIN_X, FOOTER_TEXT_Y, {
      font, size: 8, color: HENKO.inkSoft,
    })
  }

  return await pdf.save()
}
