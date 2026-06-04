import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>RAT — Registro de Actividades de Tratamiento</title>
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
  h3 { font-size: 11pt; font-weight: bold; margin: 16px 0 8px; }
  p { margin-bottom: 8px; line-height: 1.5; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 9.5pt; }
  th { background: #f0f0f0; text-align: left; padding: 5px 8px; font-weight: bold; border: 1px solid #bbb; width: 32%; }
  td { padding: 5px 8px; border: 1px solid #bbb; vertical-align: top; line-height: 1.4; }
  ul { margin: 6px 0 10px 18px; }
  li { margin-bottom: 3px; line-height: 1.5; }
  .firma-block { margin-top: 48px; border-top: 1px solid #ccc; padding-top: 20px; }
  .firma-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 32px; margin-top: 32px; }
  .firma-item label { font-size: 8.5pt; color: #555; display: block; margin-bottom: 4px; }
  .firma-item .linea { border-bottom: 1px solid #333; height: 32px; margin-top: 4px; }
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
  <h1>Registro de Actividades de Tratamiento (RAT)</h1>
  <p class="subtitle">Documento obligatorio según el artículo 30 del Reglamento (UE) 2016/679 (RGPD) y artículo 31 de la LOPDGDD.</p>
  <div class="meta">
    <strong>Versión:</strong> 1.0 &nbsp;·&nbsp;
    <strong>Fecha de última actualización:</strong> 15 de mayo de 2026 &nbsp;·&nbsp;
    <strong>Próxima revisión:</strong> mayo de 2027
  </div>

  <h2>1. Identificación del responsable del tratamiento</h2>
  <table>
    <tr><th>Campo</th><th>Valor</th></tr>
    <tr><td>Nombre / Razón social</td><td>Jennifer Cervera Alzate</td></tr>
    <tr><td>NIF</td><td>43209692Y</td></tr>
    <tr><td>Domicilio</td><td>Calle Pere Quintana 25, 07008 Palma de Mallorca, Illes Balears, España</td></tr>
    <tr><td>Email de contacto (protección de datos)</td><td>info@henkoaching.com</td></tr>
    <tr><td>Nombre comercial</td><td>Henkoaching</td></tr>
    <tr><td>Delegado de Protección de Datos (DPO)</td><td>No designado (no concurren los supuestos del art. 37 RGPD)</td></tr>
  </table>

  <h2>2. Actividades de tratamiento</h2>

  <h3>2.1 — Gestión de candidaturas y bolsa de empleo</h3>
  <table>
    <tr><th>Campo</th><th>Detalle</th></tr>
    <tr><td>Finalidad</td><td>Gestionar el registro de candidatos, recibir y evaluar CVs, tramitar candidaturas a las ofertas de empleo publicadas y comunicar el estado de los procesos de selección.</td></tr>
    <tr><td>Base jurídica</td><td>Consentimiento del interesado (art. 6.1.a RGPD) prestado al registrarse marcando la casilla correspondiente, y ejecución de medidas precontractuales (art. 6.1.b RGPD) al aplicar a una oferta.</td></tr>
    <tr><td>Categorías de interesados</td><td>Personas físicas que se registran como candidatos en el portal de empleo.</td></tr>
    <tr><td>Categorías de datos personales</td><td>Identificativos (nombre, apellidos, email, teléfono), profesionales (CV en PDF, experiencia laboral, formación, idiomas, ubicación, cargo objetivo, pretensión salarial, enlaces a LinkedIn / web).</td></tr>
    <tr><td>Categorías de destinatarios</td><td>Únicamente el responsable del tratamiento (Jennifer Cervera Alzate). No se ceden datos a terceros.</td></tr>
    <tr><td>Encargados del tratamiento</td><td>• Supabase Inc. (alojamiento de base de datos y archivos, infraestructura en la UE — región Irlanda eu-west-1)<br>• Vercel Inc. (alojamiento del sitio web)</td></tr>
    <tr><td>Transferencias internacionales</td><td>No. Los datos se almacenan en la Unión Europea.</td></tr>
    <tr><td>Plazo de conservación</td><td>Máximo 12 meses desde la última actividad del candidato en la cuenta (último login). Pasado este plazo, los datos se eliminan automáticamente mediante proceso programado. El interesado puede solicitar la supresión anticipada en cualquier momento desde su área privada o por email.</td></tr>
    <tr><td>Medidas de seguridad</td><td>Cifrado HTTPS en tránsito, cifrado en reposo de la base de datos, autenticación de doble vía con tokens rotativos, control de acceso basado en roles (RLS de Supabase), almacenamiento de CVs en bucket privado, registro de auditoría de accesos y modificaciones (audit_logs), purga automática programada de datos vencidos.</td></tr>
    <tr><td>Decisiones automatizadas</td><td>No se aplican. La valoración de candidaturas es individual y humana.</td></tr>
  </table>

  <h3>2.2 — Atención de consultas (formulario de contacto)</h3>
  <table>
    <tr><th>Campo</th><th>Detalle</th></tr>
    <tr><td>Finalidad</td><td>Atender las consultas recibidas a través del formulario de contacto del sitio web y, en su caso, prestar los servicios de coaching solicitados.</td></tr>
    <tr><td>Base jurídica</td><td>Consentimiento del interesado (art. 6.1.a RGPD).</td></tr>
    <tr><td>Categorías de interesados</td><td>Personas que envían un mensaje a través del formulario de contacto.</td></tr>
    <tr><td>Categorías de datos personales</td><td>Nombre, email, teléfono (opcional), asunto, contenido del mensaje, servicio de interés.</td></tr>
    <tr><td>Categorías de destinatarios</td><td>Únicamente el responsable.</td></tr>
    <tr><td>Encargados del tratamiento</td><td>Supabase Inc., Vercel Inc. (ver actividad 2.1).</td></tr>
    <tr><td>Transferencias internacionales</td><td>No.</td></tr>
    <tr><td>Plazo de conservación</td><td>24 meses desde el último contacto, salvo solicitud previa de supresión. Purga automática programada.</td></tr>
    <tr><td>Medidas de seguridad</td><td>Las mismas que en la actividad 2.1.</td></tr>
    <tr><td>Decisiones automatizadas</td><td>No se aplican.</td></tr>
  </table>

  <h3>2.3 — Gestión de clientes contratantes de servicios de coaching</h3>
  <table>
    <tr><th>Campo</th><th>Detalle</th></tr>
    <tr><td>Finalidad</td><td>Gestionar la relación contractual con clientes que contratan servicios de coaching: facturación, seguimiento de sesiones, archivos contractuales.</td></tr>
    <tr><td>Base jurídica</td><td>Ejecución de un contrato (art. 6.1.b RGPD) y cumplimiento de obligaciones legales fiscales y mercantiles (art. 6.1.c RGPD).</td></tr>
    <tr><td>Categorías de interesados</td><td>Personas físicas o representantes de personas jurídicas que contratan servicios.</td></tr>
    <tr><td>Categorías de datos personales</td><td>Identificativos, fiscales (NIF/CIF, dirección fiscal), de contacto, financieros (importe, tarifa), de sesiones (fechas, notas, archivos adjuntos).</td></tr>
    <tr><td>Categorías de destinatarios</td><td>Únicamente el responsable. Agencia Tributaria y entidades bancarias cuando proceda por obligación legal.</td></tr>
    <tr><td>Encargados del tratamiento</td><td>Supabase Inc., Vercel Inc.</td></tr>
    <tr><td>Transferencias internacionales</td><td>No.</td></tr>
    <tr><td>Plazo de conservación</td><td>Durante la relación contractual y, una vez finalizada, durante los plazos legales aplicables (6 años fiscal, art. 30 Código de Comercio).</td></tr>
    <tr><td>Medidas de seguridad</td><td>Las mismas que en la actividad 2.1, más bucket privado de Storage exclusivo para archivos de clientes con acceso restringido a personal autorizado.</td></tr>
    <tr><td>Decisiones automatizadas</td><td>No se aplican.</td></tr>
  </table>

  <h2>3. Derechos de los interesados</h2>
  <p>Los interesados pueden ejercer en cualquier momento sus derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento, portabilidad y a no ser objeto de decisiones automatizadas, así como retirar el consentimiento prestado.</p>
  <ul>
    <li><strong>Vía electrónica para candidatos:</strong> pestaña «Privacidad y datos» dentro de su área privada (descarga directa de datos en JSON y eliminación de cuenta).</li>
    <li><strong>Vía general:</strong> email a info@henkoaching.com adjuntando copia de documento que acredite la identidad. Plazo de respuesta: 1 mes.</li>
    <li><strong>Reclamación ante la autoridad de control:</strong> Agencia Española de Protección de Datos — www.aepd.es.</li>
  </ul>

  <h2>4. Medidas técnicas y organizativas implementadas</h2>
  <p><strong>Técnicas:</strong></p>
  <ul>
    <li>HTTPS obligatorio (certificado SSL gestionado por Vercel).</li>
    <li>Cifrado AES-256 en reposo de la base de datos (Supabase).</li>
    <li>Row Level Security (RLS) habilitado en todas las tablas con políticas que restringen el acceso por rol y propiedad del dato.</li>
    <li>Almacenamiento de CVs en bucket privado con políticas de acceso por propietario y rol reclutador.</li>
    <li>Autenticación con tokens JWT rotativos (acceso 1 h, refresco 30 días).</li>
    <li>Contraseñas almacenadas mediante hash bcrypt (gestionado por Supabase Auth).</li>
    <li>Registro de auditoría (tabla <code>audit_logs</code>) que capta toda acción mutativa: quién, cuándo, qué.</li>
    <li>Proceso programado de retención que purga datos vencidos automáticamente.</li>
    <li>Eliminación física de archivos en Storage al eliminar la cuenta del usuario.</li>
  </ul>
  <p><strong>Organizativas:</strong></p>
  <ul>
    <li>Acceso exclusivo del responsable a los datos personales.</li>
    <li>Encargados del tratamiento sujetos a sus propias políticas RGPD verificadas (DPA de Supabase y Vercel).</li>
    <li>Documentación de cumplimiento accesible desde el sitio web (Aviso Legal, Política de Privacidad, Política de Cookies).</li>
    <li>Página específica de derechos ARCO disponible para los candidatos registrados.</li>
  </ul>

  <h2>5. Análisis de riesgos y necesidad de Evaluación de Impacto (EIPD)</h2>
  <p>Conforme al artículo 35 RGPD, una Evaluación de Impacto es obligatoria cuando el tratamiento implica un alto riesgo para los derechos y libertades de los interesados.</p>
  <p><strong>Conclusión:</strong> las actividades aquí registradas <strong>no requieren EIPD</strong> porque:</p>
  <ul>
    <li>No se tratan categorías especiales de datos (art. 9 RGPD).</li>
    <li>No hay evaluación sistemática mediante decisiones automatizadas.</li>
    <li>No hay observación sistemática a gran escala.</li>
    <li>El volumen de datos es bajo (portal de empleo de una profesional autónoma).</li>
  </ul>
  <p>Esta evaluación se revisará anualmente o cuando se introduzcan cambios sustanciales en los tratamientos.</p>

  <h2>6. Brechas de seguridad</h2>
  <p>En caso de brecha de seguridad que afecte a datos personales:</p>
  <ol style="margin-left:18px;margin-top:6px;">
    <li style="margin-bottom:4px;">Notificar a la AEPD en un plazo máximo de 72 horas desde su conocimiento (art. 33 RGPD), salvo que sea improbable que entrañe riesgo.</li>
    <li style="margin-bottom:4px;">Comunicar a los interesados afectados sin dilación cuando suponga un alto riesgo para sus derechos (art. 34 RGPD).</li>
    <li style="margin-bottom:4px;">Documentar la brecha en este registro con detalle de hechos, efectos y medidas correctivas.</li>
  </ol>
  <p style="margin-top:8px;"><strong>Histórico de brechas:</strong> ninguna a la fecha de esta revisión.</p>

  <div class="firma-block">
    <h2 style="border:none;margin-top:0;">7. Firma del responsable</h2>
    <p>Como responsable del tratamiento, declaro que la información contenida en este registro es veraz y refleja las actividades de tratamiento de datos personales realizadas en el marco de mi actividad profesional.</p>
    <div class="firma-row">
      <div class="firma-item">
        <label>Nombre</label>
        <div style="padding-top:4px;font-weight:bold;">Jennifer Cervera Alzate</div>
      </div>
      <div class="firma-item">
        <label>NIF</label>
        <div style="padding-top:4px;font-weight:bold;">43209692Y</div>
      </div>
      <div class="firma-item">
        <label>Fecha</label>
        <div class="linea"></div>
      </div>
    </div>
    <div style="margin-top:32px;">
      <label style="font-size:8.5pt;color:#555;">Firma</label>
      <div style="border-bottom:1px solid #333;height:64px;margin-top:4px;"></div>
    </div>
    <p style="margin-top:24px;font-size:8.5pt;color:#555;font-style:italic;">
      Este documento debe estar disponible para su consulta por la Agencia Española de Protección de Datos en caso de inspección. Se recomienda conservar una copia impresa y firmada.
    </p>
  </div>
</div>
<script>
  // Auto-abrir diálogo de impresión al cargar la página
  window.onload = function() {
    // Pequeño delay para que cargue el CSS
    setTimeout(function() { window.print(); }, 400);
  };
</script>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
