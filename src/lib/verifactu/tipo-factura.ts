// Mapeo de nuestras series internas a los códigos de tipo de factura AEAT
// definidos en el Anexo I de la Orden HAC/1177/2024.
//
//   F1  Factura completa
//   F2  Factura simplificada (ticket)
//   F3  Sustitutiva
//   R1  Rectificativa por error fundado en derecho o art. 80.1/80.2/80.6 LIVA
//   R2  Rectificativa por concurso de acreedores (art. 80.3 LIVA)
//   R3  Rectificativa por créditos incobrables (art. 80.4 LIVA)
//   R4  Rectificativa, resto de causas
//   R5  Rectificativa sobre facturas simplificadas (solo si la original fue F2)
//
// Henkoaching emite únicamente F1 (completas). Por eso los abonos (serie 'A')
// se mapean a R4 — rectificativa de F1 por causa no encajable en R1/R2/R3 —
// NUNCA a R5, que solo es válido si la factura original fue una simplificada.

export type TipoFacturaAeat = 'F1' | 'F2' | 'F3' | 'R1' | 'R2' | 'R3' | 'R4' | 'R5'

export function tipoFacturaAeatDeSerie(serie: string): TipoFacturaAeat {
  switch (serie) {
    case 'F': return 'F1'
    case 'R': return 'R1'
    case 'A': return 'R4'
    default:  return 'F1'
  }
}
