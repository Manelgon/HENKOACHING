import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ContenidoRunbook } from '@/features/rgpd/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'admin') {
    return new NextResponse('Sin permisos', { status: 403 })
  }

  const { data: docRaw } = await supabase
    .from('rgpd_documentos' as never)
    .select('contenido, actualizado_at')
    .eq('id' as never, 'runbook')
    .maybeSingle() as { data: { contenido: Record<string, unknown>; actualizado_at: string | null } | null }

  const contenido = (docRaw?.contenido ?? {}) as Partial<ContenidoRunbook>
  const pasos = contenido.pasos ?? []
  const contacto = contenido.contacto_responsable ?? 'Jennifer Cervera Alzate — info@henkoaching.com'
  const enlaceAepd = contenido.enlace_aepd ?? 'https://www.aepd.es/es/derechos-y-deberes/cumple-tus-deberes/medidas-de-cumplimiento/brechas-de-seguridad'
  const fechaActualizacion = docRaw?.actualizado_at
    ? new Date(docRaw.actualizado_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })

  const pasosHtml = pasos.length > 0
    ? pasos.map((p, i) => `
        <div class="paso">
          <div class="paso-num">${i + 1}</div>
          <div class="paso-body">
            <p class="paso-titulo">${p.titulo}</p>
            <p class="paso-desc">${p.descripcion}</p>
          </div>
        </div>`).join('')
    : '<p style="color:#888;font-style:italic;">No se han definido pasos todavía.</p>'

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Runbook — Protocolo de Brecha de Datos</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Georgia, 'Times New Roman', serif; font-size: 11pt; color: #111; background: #fff; }
  .page { max-width: 800px; margin: 0 auto; padding: 40px 50px; }
  .logo-header { margin-bottom: 28px; padding-bottom: 20px; border-bottom: 2px solid #1f8f9b; }
  .logo-header img { height: 48px; object-fit: contain; }
  h1 { font-size: 16pt; font-weight: bold; margin-bottom: 4px; }
  .subtitle { font-size: 9pt; color: #555; font-style: italic; margin-bottom: 16px; }
  .meta { font-size: 9pt; color: #444; margin-bottom: 24px; border-bottom: 1px solid #ddd; padding-bottom: 12px; }
  h2 { font-size: 13pt; font-weight: bold; margin: 24px 0 10px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
  p { margin-bottom: 8px; line-height: 1.5; }
  .alerta { background: #fff8e1; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin-bottom: 20px; font-size: 10pt; }
  .paso { display: flex; gap: 16px; margin-bottom: 16px; align-items: flex-start; }
  .paso-num { width: 28px; height: 28px; background: #1f8f9b; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-family: sans-serif; font-size: 12px; shrink: 0; flex-shrink: 0; margin-top: 2px; }
  .paso-body { flex: 1; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 14px; }
  .paso-titulo { font-weight: bold; margin-bottom: 4px; font-size: 10.5pt; }
  .paso-desc { color: #444; font-size: 9.5pt; line-height: 1.5; margin: 0; }
  .info-block { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; margin-bottom: 16px; }
  .info-label { font-size: 8pt; color: #1f8f9b; font-weight: bold; font-family: sans-serif; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 4px; }
  .firma-block { margin-top: 48px; border-top: 1px solid #ccc; padding-top: 20px; }
  .firma-linea { border-bottom: 1px solid #333; height: 48px; margin-top: 8px; }
  .print-btn { position: fixed; top: 16px; right: 16px; background: #1f8f9b; color: white; border: none; border-radius: 8px; padding: 10px 20px; font-family: sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; z-index: 9999; }
  @media print {
    .print-btn { display: none; }
    .page { padding: 0; }
  }
</style>
</head>
<body>
<button class="print-btn" onclick="window.print()">🖨 Imprimir / Guardar PDF</button>
<div class="page">
  <div class="logo-header">
    <img src="https://henkoaching.com/henko-pdf-header.png" alt="Henkoaching" />
  </div>
  <h1>Runbook — Protocolo de Brecha de Datos (72h)</h1>
  <p class="subtitle">Procedimiento interno para gestionar brechas de seguridad según el artículo 33 del RGPD.</p>
  <div class="meta">
    <strong>Responsable:</strong> Jennifer Cervera Alzate &nbsp;·&nbsp;
    <strong>Última revisión:</strong> ${fechaActualizacion} &nbsp;·&nbsp;
    <strong>Próxima revisión:</strong> anual
  </div>

  <div class="alerta">
    ⚠️ <strong>Plazo legal:</strong> Tienes <strong>72 horas</strong> desde que detectas la brecha para notificar a la AEPD si entraña riesgo para los interesados (art. 33 RGPD). Sigue los pasos en orden.
  </div>

  <h2>Pasos del protocolo</h2>
  ${pasosHtml}

  <h2>Datos de contacto del responsable</h2>
  <div class="info-block">
    <p class="info-label">Responsable de incidentes</p>
    <p>${contacto}</p>
  </div>

  <h2>Notificación a la AEPD</h2>
  <div class="info-block">
    <p class="info-label">Portal de notificación</p>
    <p>${enlaceAepd}</p>
  </div>
  <p>Solo es obligatorio notificar si la brecha entraña riesgo para los derechos y libertades de los afectados. Si el riesgo es alto, además debes comunicarlo a los propios afectados sin dilación indebida (art. 34 RGPD).</p>

  <div class="firma-block">
    <h2 style="border:none;margin-top:0;">Registro de incidente</h2>
    <p>Completa este apartado cuando se produzca una brecha y archiva el documento.</p>
    <p style="margin-top:16px;font-size:9pt;color:#555;"><strong>Fecha de detección:</strong></p>
    <div class="firma-linea"></div>
    <p style="margin-top:16px;font-size:9pt;color:#555;"><strong>Descripción del incidente:</strong></p>
    <div class="firma-linea" style="height:80px;"></div>
    <p style="margin-top:16px;font-size:9pt;color:#555;"><strong>Medidas adoptadas:</strong></p>
    <div class="firma-linea" style="height:80px;"></div>
    <p style="margin-top:16px;font-size:9pt;color:#555;"><strong>¿Se notificó a la AEPD? Fecha y número de referencia:</strong></p>
    <div class="firma-linea"></div>
    <p style="margin-top:24px;font-size:8.5pt;color:#555;font-style:italic;">
      Conserva este documento completado junto al RAT firmado. Ambos pueden ser requeridos en una inspección de la AEPD.
    </p>
  </div>
</div>
<script>
  window.onload = function() { setTimeout(function() { window.print(); }, 400); };
</script>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
