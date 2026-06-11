/** Formatea un número como importe en euros con la convención española (1.234,56 €). */
export function formatEur(n: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)
}
