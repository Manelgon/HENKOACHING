const PALABRAS_POR_MINUTO = 220

export function calcularTiempoLectura(htmlOrText: string): number {
  if (!htmlOrText) return 1
  const sinHtml = htmlOrText.replace(/<[^>]+>/g, ' ')
  const palabras = sinHtml
    .split(/\s+/)
    .map((p) => p.trim())
    .filter(Boolean).length
  return Math.max(1, Math.ceil(palabras / PALABRAS_POR_MINUTO))
}
