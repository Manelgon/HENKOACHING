import { wrapper, escHtml } from './_layout'

export function templateCandidaturaCandidato(params: {
  candidatoNombre: string
  ofertaTitulo: string
  empresaNombre: string
  siteUrl: string
}): string {
  const body = `
  <tr>
    <td style="padding:40px 48px;">
      <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:26px;font-weight:700;color:#1a1a1a;line-height:1.3;">Tu candidatura<br>ha sido recibida</h1>
      <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:15px;color:#444;line-height:1.7;">Hola ${escHtml(params.candidatoNombre)},</p>
      <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:15px;color:#444;line-height:1.7;">
        Hemos recibido tu candidatura para el puesto de <strong style="color:#1a1a1a;">${escHtml(params.ofertaTitulo)}</strong> en <strong style="color:#1a1a1a;">${escHtml(params.empresaNombre)}</strong>.
      </p>
      <div style="background:#f8f9fa;border-left:3px solid #1f8f9b;border-radius:0 8px 8px 0;padding:16px 20px;margin:0 0 28px;">
        <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#555;line-height:1.6;">
          <strong>Próximos pasos:</strong> El equipo de Henkoaching revisará tu perfil y se pondrá en contacto contigo si tu candidatura avanza en el proceso.
        </p>
      </div>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#aaa;line-height:1.6;">
        Puedes consultar el estado de tus candidaturas en tu área personal.
      </p>
    </td>
  </tr>`
  return wrapper(body)
}

export function templateCandidaturaAdmin(params: {
  candidatoNombre: string
  candidatoEmail: string
  ofertaTitulo: string
  perfilUrl: string
  siteUrl: string
}): string {
  const body = `
  <tr>
    <td style="padding:40px 48px;">
      <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:24px;font-weight:700;color:#1a1a1a;line-height:1.3;">Nueva candidatura recibida</h1>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #f0ece6;">
            <span style="font-family:Arial,sans-serif;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;">Candidato</span>
            <p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:15px;color:#1a1a1a;font-weight:600;">${escHtml(params.candidatoNombre)}</p>
            <p style="margin:2px 0 0;font-family:Arial,sans-serif;font-size:13px;color:#1f8f9b;">${escHtml(params.candidatoEmail)}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 0;">
            <span style="font-family:Arial,sans-serif;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;">Oferta</span>
            <p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:15px;color:#1a1a1a;font-weight:600;">${escHtml(params.ofertaTitulo)}</p>
          </td>
        </tr>
      </table>
      <a href="${params.perfilUrl}" style="display:inline-block;background:#1f8f9b;color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:8px;">
        Ver perfil del candidato →
      </a>
    </td>
  </tr>`
  return wrapper(body)
}
