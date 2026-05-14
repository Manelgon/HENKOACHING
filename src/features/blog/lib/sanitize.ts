import 'server-only'
import DOMPurify from 'isomorphic-dompurify'

const TAGS_PERMITIDOS = [
  'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote',
  'a', 'img',
  'hr',
  'span',
]

const ATTRS_PERMITIDOS = ['href', 'target', 'rel', 'src', 'alt', 'title', 'class']

export function sanitizarHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: TAGS_PERMITIDOS,
    ALLOWED_ATTR: ATTRS_PERMITIDOS,
    ALLOW_DATA_ATTR: false,
  })
}
