import type { EstadoSolicitud } from '@/lib/supabase/database.types'

const LOGO_URL = 'https://henkoaching.com/henkologo.png'

const HEADER = (_siteUrl: string) => `
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

function wrapper(body: string, siteUrl: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0ece6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ece6;padding:48px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:560px;width:100%;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        ${HEADER(siteUrl)}
        ${body}
        ${FOOTER}
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

type EstadoConfig = {
  titulo: string
  accentColor: string
  etiqueta: string
  mensaje: string
}

const ESTADO_CONFIG: Record<string, EstadoConfig> = {
  revisando: {
    titulo: 'Estamos revisando<br>tu candidatura',
    accentColor: '#e8a800',
    etiqueta: 'En revisión',
    mensaje: 'Hemos recibido tu candidatura y nuestro equipo la está evaluando con detalle. Te avisaremos cuando tengamos novedades.',
  },
  entrevista: {
    titulo: '¡Te hemos seleccionado<br>para una entrevista!',
    accentColor: '#1f8f9b',
    etiqueta: 'Entrevista',
    mensaje: 'Buenas noticias: queremos conocerte mejor. En breve nos pondremos en contacto contigo para concretar los detalles de la entrevista.',
  },
  contratado: {
    titulo: '¡Enhorabuena,<br>has sido seleccionado!',
    accentColor: '#2e7d32',
    etiqueta: 'Seleccionado',
    mensaje: '¡Felicidades! Has superado el proceso de selección. Nos pondremos en contacto contigo muy pronto para los próximos pasos.',
  },
  descartado: {
    titulo: 'Actualización sobre<br>tu candidatura',
    accentColor: '#888888',
    etiqueta: 'Proceso cerrado',
    mensaje: 'Gracias por tu interés y por el tiempo dedicado al proceso. En esta ocasión hemos decidido avanzar con otro perfil, pero te animamos a seguir explorando oportunidades.',
  },
}

export function templateEstadoSolicitud(params: {
  candidatoNombre: string
  ofertaTitulo: string
  estado: EstadoSolicitud
  siteUrl: string
}): string {
  const cfg = ESTADO_CONFIG[params.estado] ?? ESTADO_CONFIG.revisando
  const body = `
  <tr>
    <td style="padding:40px 48px;">
      <div style="display:inline-block;background:${cfg.accentColor}1a;color:${cfg.accentColor};font-family:Arial,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding:4px 10px;border-radius:4px;margin:0 0 20px;">${cfg.etiqueta}</div>
      <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:26px;font-weight:700;color:#1a1a1a;line-height:1.3;">${cfg.titulo}</h1>
      <p style="margin:0 0 20px;font-family:Arial,sans-serif;font-size:15px;color:#444;line-height:1.7;">Hola ${escHtml(params.candidatoNombre)},</p>
      <div style="background:#f8f9fa;border-left:3px solid ${cfg.accentColor};border-radius:0 8px 8px 0;padding:16px 20px;margin:0 0 24px;">
        <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;">Oferta</p>
        <p style="margin:0;font-family:Arial,sans-serif;font-size:15px;color:#1a1a1a;font-weight:600;">${escHtml(params.ofertaTitulo)}</p>
      </div>
      <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:15px;color:#444;line-height:1.7;">${cfg.mensaje}</p>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#aaa;line-height:1.6;">
        Puedes consultar el estado de todas tus candidaturas en tu área personal.
      </p>
    </td>
  </tr>`
  return wrapper(body, params.siteUrl)
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
