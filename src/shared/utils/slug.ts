/**
 * Normaliza un texto a un slug URL-safe: minúsculas, sin acentos, con guiones.
 * @param s     texto de origen
 * @param maxLen longitud máxima del slug (por defecto 80)
 */
export function slugify(s: string, maxLen = 80): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLen)
}
