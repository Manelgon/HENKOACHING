import type { EstadoSolicitud } from '@/lib/supabase/database.types'
import { wrapper, escHtml } from './_layout'

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
  return wrapper(body)
}
