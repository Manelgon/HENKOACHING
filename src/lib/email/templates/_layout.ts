// Layout HTML compartido por todas las plantillas de email transaccional.
// Un solo sitio para el branding (logo, cabecera, pie) y el escape de HTML.

const LOGO_URL = 'https://henkoaching.com/henkologo.png'

const HEADER = `
  <tr>
    <td style="padding:36px 48px 28px;border-bottom:1px solid #ede9e4;text-align:center;">
      <img src="${LOGO_URL}" width="180" alt="HenKoaching" style="display:block;margin:0 auto;max-width:180px;">
    </td>
  </tr>`

const FOOTER = `
  <tr>
    <td style="padding:20px 48px;border-top:1px solid #ede9e4;background:#faf8f5;">
      <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#aaa;line-height:1.6;text-align:center;">HenKoaching · Jennifer Cervera · <a href="https://henkoaching.com" style="color:#1f8f9b;text-decoration:none;">henkoaching.com</a></p>
    </td>
  </tr>`

/** Envuelve el cuerpo del email en la maquetación común (tabla responsive 560px). */
export function wrapper(body: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0ece6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ece6;padding:48px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:560px;width:100%;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        ${HEADER}
        ${body}
        ${FOOTER}
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

/** Escapa caracteres peligrosos antes de interpolar texto de usuario en el HTML. */
export function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
