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

function wrapper(body: string): string {
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

const TIPO_LABELS: Record<string, string> = {
  acceso: 'Acceso a tus datos',
  rectificacion: 'Rectificación de datos',
  supresion: 'Supresión de datos (derecho al olvido)',
  portabilidad: 'Portabilidad de datos',
  oposicion: 'Oposición al tratamiento',
  limitacion: 'Limitación del tratamiento',
}

export function templateDerechoArcoConfirmacion(params: {
  nombre: string
  tipo_derecho: string
}): string {
  const tipoLabel = TIPO_LABELS[params.tipo_derecho] ?? params.tipo_derecho
  const body = `
  <tr>
    <td style="padding:40px 48px 32px;">
      <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:13px;color:#888;">Hola, ${params.nombre}</p>
      <h1 style="margin:0 0 24px;font-family:Georgia,serif;font-size:24px;color:#1a1a1a;font-weight:normal;line-height:1.3;">
        Hemos recibido tu solicitud
      </h1>
      <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;color:#555;line-height:1.7;">
        Tu solicitud de <strong style="color:#1a1a1a;">${tipoLabel}</strong> ha sido registrada correctamente.
      </p>
      <div style="margin:24px 0;padding:20px 24px;background:#f0fdf4;border-radius:12px;border-left:4px solid #22c55e;">
        <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#15803d;font-weight:600;">¿Qué pasa ahora?</p>
        <p style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:13px;color:#555;line-height:1.6;">
          Responderemos a tu solicitud en un plazo máximo de <strong>1 mes</strong> desde su recepción, conforme al art. 12 del RGPD.
          Si necesitas más información, puedes contactarnos en <a href="mailto:info@henkoaching.com" style="color:#1f8f9b;">info@henkoaching.com</a>.
        </p>
      </div>
      <p style="margin:24px 0 0;font-family:Arial,sans-serif;font-size:13px;color:#888;line-height:1.6;">
        Si no has enviado esta solicitud, ignora este mensaje.<br>
        Puedes reclamar ante la AEPD en <a href="https://www.aepd.es" style="color:#1f8f9b;">www.aepd.es</a>.
      </p>
    </td>
  </tr>`
  return wrapper(body)
}
