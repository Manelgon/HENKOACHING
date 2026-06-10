import { wrapper, escHtml } from './_layout'

export function templateLeadConfirmacion(params: {
  nombre: string
  asunto: string
  servicio: string
  siteUrl: string
}): string {
  const body = `
  <tr>
    <td style="padding:40px 48px;">
      <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:26px;font-weight:700;color:#1a1a1a;line-height:1.3;">Hemos recibido<br>tu mensaje</h1>
      <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:15px;color:#444;line-height:1.7;">Hola ${escHtml(params.nombre)},</p>
      <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:15px;color:#444;line-height:1.7;">
        Gracias por ponerte en contacto con HenKoaching. He recibido tu consulta y me pondré en contacto contigo en las próximas <strong style="color:#1a1a1a;">24–48 horas</strong>.
      </p>
      ${params.asunto ? `
      <div style="background:#f8f9fa;border-left:3px solid #1f8f9b;border-radius:0 8px 8px 0;padding:16px 20px;margin:0 0 28px;">
        <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;">Tu consulta</p>
        <p style="margin:0;font-family:Arial,sans-serif;font-size:15px;color:#1a1a1a;font-weight:600;">${escHtml(params.asunto)}</p>
        ${params.servicio ? `<p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:13px;color:#666;">${escHtml(params.servicio)}</p>` : ''}
      </div>` : ''}
      <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#aaa;line-height:1.6;">
        Si tienes alguna pregunta urgente, puedes escribirme directamente a <a href="mailto:info@henkoaching.com" style="color:#1f8f9b;text-decoration:none;">info@henkoaching.com</a>.
      </p>
    </td>
  </tr>`
  return wrapper(body)
}
