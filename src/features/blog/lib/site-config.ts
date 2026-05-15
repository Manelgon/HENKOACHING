export const SITE_URL = 'https://henkoaching.com'
export const SITE_NAME = 'Henkoaching'
export const BLOG_AUTHOR = 'Jennifer Cervera'

export function urlAbsoluta(path: string): string {
  if (!path) return SITE_URL
  if (path.startsWith('http')) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
