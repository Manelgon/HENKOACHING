import 'server-only'
import { PDFDocument, StandardFonts, type PDFFont, type PDFPage, type PDFImage } from 'pdf-lib'
import { HENKO, A4, drawText, drawTextRight, drawTextCenter, tryEmbedImage } from './_helpers'

const MARGIN_X = 48
const BOTTOM_BEFORE_FOOTER = 24

// =============================================================================
// TIPOS
// =============================================================================
export type ExperienciaPdf = {
  empresa: string
  cargo: string
  desde: string | null
  hasta: string | null
  descripcion: string | null
}

export type EducacionPdf = {
  centro: string
  titulo: string
  ano_fin: string | null
}

export type IdiomaPdf = {
  idioma: string
  nivel: string
}

export type CandidatoPdfData = {
  nombre: string
  email: string
  telefono: string | null
  ubicacion: string | null
  cargo: string | null
  resumen: string | null
  linkedin: string | null
  disponibilidad: string | null
  pretension: string | null
  tipoJornada: string | null
  modalidad: string | null
  fechaNacimiento: string | null
  experiencias: ExperienciaPdf[]
  educacion: EducacionPdf[]
  idiomas: IdiomaPdf[]
}

export type EmisorPdf = { nombre: string; web: string }
export type CandidatoAssets = { logoBytes?: Uint8Array | null }

// =============================================================================
// HELPERS
// =============================================================================
function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const paragraphs = String(text ?? '').split(/\r?\n/)
  const out: string[] = []
  for (const para of paragraphs) {
    const words = para.split(/\s+/).filter(Boolean)
    if (words.length === 0) { out.push(''); continue }
    let line = ''
    for (const w of words) {
      const test = line ? `${line} ${w}` : w
      if (font.widthOfTextAtSize(test, size) <= maxWidth) { line = test } else { if (line) out.push(line); line = w }
    }
    if (line) out.push(line)
  }
  return out
}

function fechaLargaES(d: Date): string {
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

// =============================================================================
// PAGE FACTORY
// =============================================================================
type PageCtx = { pdf: PDFDocument; font: PDFFont; bold: PDFFont; logoImg: PDFImage | null; emisor: EmisorPdf }
type PageState = { page: PDFPage; cursorY: number; contentBottom: number }

function addBrandedPage(ctx: PageCtx): PageState {
  const page = ctx.pdf.addPage([A4.w, A4.h])
  let topUsed = 50
  if (ctx.logoImg) {
    const maxH = 80; const ratio = ctx.logoImg.width / ctx.logoImg.height
    const h = maxH; const w = h * ratio
    page.drawImage(ctx.logoImg, { x: MARGIN_X, y: A4.h - 36 - h, width: w, height: h })
    topUsed = 36 + h + 14
  } else { topUsed = 60 }
  return { page, cursorY: A4.h - topUsed, contentBottom: 42 + BOTTOM_BEFORE_FOOTER }
}

// =============================================================================
// PDF BUILDER
// =============================================================================
export async function buildCandidatoPdf(data: CandidatoPdfData, emisor: EmisorPdf, assets: CandidatoAssets): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique)
  const logoImg = await tryEmbedImage(pdf, assets.logoBytes)
  const ctx: PageCtx = { pdf, font, bold, logoImg, emisor }
  let state = addBrandedPage(ctx)
  const contentW = A4.w - MARGIN_X * 2

  const FONT_BODY = 10.5
  const LINE_H = 14
  const HEADING_H = 30
  const SECTION_TAIL = 8

  const ensureSpace = (needed: number) => {
    if (state.cursorY - needed < state.contentBottom) state = addBrandedPage(ctx)
  }

  const drawHeading = (titulo: string) => {
    ensureSpace(HEADING_H)
    drawText(state.page, titulo, MARGIN_X, state.cursorY - 16, { font: bold, size: 13.5, color: HENKO.turquoise })
    state.page.drawLine({ start: { x: MARGIN_X, y: state.cursorY - 22 }, end: { x: MARGIN_X + 38, y: state.cursorY - 22 }, thickness: 1.5, color: HENKO.turquoise })
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

  // ── 1. HEADER CANDIDATO ───────────────────────────────────────────────────

  // Nombre
  const nombreLines = wrap(data.nombre || 'Candidato', bold, 22, contentW)
  for (const l of nombreLines) {
    drawText(state.page, l, MARGIN_X, state.cursorY - 22, { font: bold, size: 22, color: HENKO.ink })
    state.cursorY -= 28
  }
  state.cursorY -= 4

  // Cargo actual
  if (data.cargo) {
    drawText(state.page, data.cargo, MARGIN_X, state.cursorY - 14, { font: italic, size: 12, color: HENKO.turquoise })
    state.cursorY -= 22
  }

  // Datos de contacto en banda cream
  const contactItems = [
    data.email,
    data.telefono,
    data.ubicacion,
    data.linkedin,
  ].filter(Boolean) as string[]

  if (contactItems.length > 0) {
    const contactLine = contactItems.join('   ·   ')
    const bandH = 26
    state.page.drawRectangle({ x: MARGIN_X, y: state.cursorY - bandH, width: contentW, height: bandH, color: HENKO.cream })
    drawText(state.page, contactLine, MARGIN_X + 12, state.cursorY - 10, { font, size: 9, color: HENKO.inkSoft })
    state.cursorY -= bandH + 14
  }

  // Fecha nacimiento en banda de contacto si existe
  const fechaNacDisplay = data.fechaNacimiento
    ? (() => {
        const d = new Date(data.fechaNacimiento + 'T00:00:00')
        const dd = String(d.getDate()).padStart(2, '0')
        const mm = String(d.getMonth() + 1).padStart(2, '0')
        const yyyy = d.getFullYear()
        const age = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
        return `${dd}/${mm}/${yyyy} (${age} años)`
      })()
    : null

  // Disponibilidad / pretensión / jornada / modalidad
  const metaItems = [
    fechaNacDisplay                ? { label: 'Fecha de nacimiento', value: fechaNacDisplay } : null,
    data.disponibilidad ? { label: 'Disponibilidad', value: data.disponibilidad } : null,
    data.pretension     ? { label: 'Pretensión salarial', value: data.pretension } : null,
    data.tipoJornada    ? { label: 'Jornada', value: data.tipoJornada } : null,
    data.modalidad      ? { label: 'Modalidad', value: data.modalidad } : null,
  ].filter(Boolean) as { label: string; value: string }[]

  if (metaItems.length > 0) {
    const cellW = contentW / metaItems.length
    const bandH = 36
    state.page.drawRectangle({ x: MARGIN_X, y: state.cursorY - bandH, width: contentW, height: bandH, color: HENKO.cream })
    for (let i = 0; i < metaItems.length; i++) {
      const cx = MARGIN_X + cellW * i
      drawText(state.page, metaItems[i].label.toUpperCase(), cx + 12, state.cursorY - 10, { font: bold, size: 7.5, color: HENKO.turquoise })
      drawText(state.page, metaItems[i].value, cx + 12, state.cursorY - 23, { font, size: 9.5, color: HENKO.ink })
    }
    state.cursorY -= bandH + 16
  }

  // Resumen
  if (data.resumen?.trim()) {
    drawHeading('Resumen profesional')
    drawParagraph(data.resumen)
  }

  // ── 2. EXPERIENCIA ────────────────────────────────────────────────────────
  if (data.experiencias.length > 0) {
    drawHeading('Experiencia laboral')
    for (const exp of data.experiencias) {
      ensureSpace(50)
      // Cargo · empresa
      const titulo = [exp.cargo, exp.empresa].filter(Boolean).join('  ·  ')
      drawText(state.page, titulo, MARGIN_X, state.cursorY - 13, { font: bold, size: 11, color: HENKO.ink })
      state.cursorY -= 18
      // Fechas
      const desde = exp.desde ? exp.desde.replace('-', '/') : '?'
      const hasta = exp.hasta ? exp.hasta.replace('-', '/') : 'Actualidad'
      drawText(state.page, `${desde} — ${hasta}`, MARGIN_X, state.cursorY - 11, { font: italic, size: 9, color: HENKO.inkSoft })
      state.cursorY -= 16
      // Descripción
      if (exp.descripcion?.trim()) {
        const lines = wrap(exp.descripcion, font, FONT_BODY, contentW)
        for (const l of lines) {
          ensureSpace(LINE_H)
          if (l === '') { state.cursorY -= 6; continue }
          drawText(state.page, l, MARGIN_X + 4, state.cursorY - 12, { font, size: FONT_BODY, color: HENKO.inkSoft })
          state.cursorY -= LINE_H
        }
      }
      state.cursorY -= 10
      // Línea separadora entre empleos
      state.page.drawLine({ start: { x: MARGIN_X, y: state.cursorY + 4 }, end: { x: MARGIN_X + contentW, y: state.cursorY + 4 }, thickness: 0.3, color: HENKO.border })
      state.cursorY -= 8
    }
    state.cursorY -= SECTION_TAIL
  }

  // ── 3. EDUCACIÓN ──────────────────────────────────────────────────────────
  if (data.educacion.length > 0) {
    drawHeading('Educación')
    for (const edu of data.educacion) {
      ensureSpace(32)
      drawText(state.page, edu.titulo, MARGIN_X, state.cursorY - 13, { font: bold, size: 11, color: HENKO.ink })
      state.cursorY -= 17
      const sub = [edu.centro, edu.ano_fin].filter(Boolean).join('  ·  ')
      if (sub) {
        drawText(state.page, sub, MARGIN_X, state.cursorY - 11, { font: italic, size: 9, color: HENKO.inkSoft })
        state.cursorY -= 16
      }
      state.cursorY -= 6
    }
    state.cursorY -= SECTION_TAIL
  }

  // ── 4. IDIOMAS ────────────────────────────────────────────────────────────
  if (data.idiomas.length > 0) {
    drawHeading('Idiomas')
    const colW = Math.min(180, contentW / 3)
    let col = 0
    const rowY = state.cursorY
    for (const idi of data.idiomas) {
      const cx = MARGIN_X + col * colW
      if (col === 0) ensureSpace(22)
      drawText(state.page, idi.idioma, cx, state.cursorY - 12, { font: bold, size: 10.5, color: HENKO.ink })
      drawText(state.page, idi.nivel, cx + font.widthOfTextAtSize(idi.idioma, 10.5) + 6, state.cursorY - 12, { font, size: 9.5, color: HENKO.inkSoft })
      col++
      if (col >= 3) { col = 0; state.cursorY -= 18 }
    }
    if (col > 0) state.cursorY -= 18
    void rowY
    state.cursorY -= SECTION_TAIL
  }

  // ── 5. PIE ────────────────────────────────────────────────────────────────
  const fechaDoc = fechaLargaES(new Date())
  const firma = [emisor.nombre, emisor.web].filter(Boolean).join(' · ')
  const pages = pdf.getPages()
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i]
    p.drawLine({ start: { x: MARGIN_X, y: 36 }, end: { x: A4.w - MARGIN_X, y: 36 }, thickness: 0.5, color: HENKO.greenblue })
    if (firma) drawText(p, firma, MARGIN_X, 22, { font, size: 8, color: HENKO.inkSoft })
    drawTextCenter(p, `Página ${i + 1} de ${pages.length}`, A4.w / 2, 22, { font, size: 8, color: HENKO.inkSoft })
    drawTextRight(p, fechaDoc, A4.w - MARGIN_X, 22, { font, size: 8, color: HENKO.inkSoft })
  }

  return await pdf.save()
}
