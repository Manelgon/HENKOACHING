# Registro de Actividades de Tratamiento (RAT)

> Documento obligatorio según el artículo 30 del Reglamento (UE) 2016/679 (RGPD) y artículo 31 de la LOPDGDD.

**Versión:** 1.0
**Fecha de última actualización:** 15 de mayo de 2026
**Próxima revisión:** mayo de 2027

---

## 1. Identificación del responsable del tratamiento

| Campo | Valor |
|---|---|
| Nombre / Razón social | Jennifer Cervera Alzate |
| NIF | 43209692Y |
| Domicilio | Calle Pere Quintana 25, 07008 Palma de Mallorca, Illes Balears, España |
| Email de contacto en materia de protección de datos | info@henkoaching.com |
| Nombre comercial | Henkoaching |
| Delegado de Protección de Datos (DPO) | No designado (no concurren los supuestos del art. 37 RGPD) |

---

## 2. Actividades de tratamiento

### 2.1 — Gestión de candidaturas y bolsa de empleo

| Campo | Detalle |
|---|---|
| **Finalidad** | Gestionar el registro de candidatos, recibir y evaluar CVs, tramitar candidaturas a las ofertas de empleo publicadas y comunicar el estado de los procesos de selección. |
| **Base jurídica** | Consentimiento del interesado (art. 6.1.a RGPD) prestado al registrarse marcando la casilla correspondiente, y ejecución de medidas precontractuales (art. 6.1.b RGPD) al aplicar a una oferta. |
| **Categorías de interesados** | Personas físicas que se registran como candidatos en el portal de empleo. |
| **Categorías de datos personales** | Identificativos (nombre, apellidos, email, teléfono), profesionales (CV en PDF, experiencia laboral, formación, idiomas, ubicación, cargo objetivo, pretensión salarial, enlaces a LinkedIn / web). |
| **Categorías de destinatarios** | Únicamente el responsable del tratamiento (Jennifer Cervera Alzate). No se ceden datos a terceros. |
| **Encargados del tratamiento** | • Supabase Inc. (alojamiento de base de datos y archivos, infraestructura en la UE — región Irlanda eu-west-1)<br>• Vercel Inc. (alojamiento del sitio web)<br>• Google LLC (agenda, tareas y correo del responsable: los eventos de cita y los correos pueden contener datos de contacto de candidatos) |
| **Transferencias internacionales** | La base de datos y los archivos se almacenan en la Unión Europea (Supabase, Irlanda). Vercel Inc. y Google LLC (EE. UU.) actúan como encargados amparados en el EU-US Data Privacy Framework y/o Cláusulas Contractuales Tipo (SCCs). |
| **Plazo de conservación** | Máximo 12 meses desde la última actividad del candidato en la cuenta (último login). Pasado este plazo, los datos se eliminan automáticamente mediante proceso programado. El interesado puede solicitar la supresión anticipada en cualquier momento desde su área privada o por email. |
| **Medidas de seguridad** | Cifrado HTTPS en tránsito, cifrado en reposo de la base de datos, autenticación de doble vía con tokens rotativos, control de acceso basado en roles (RLS de Supabase), almacenamiento de CVs en bucket privado, registro de auditoría de accesos y modificaciones (audit_logs), purga automática programada de datos vencidos. |
| **Decisiones automatizadas** | No se aplican. La valoración de candidaturas es individual y humana. |

### 2.2 — Atención de consultas (formulario de contacto)

| Campo | Detalle |
|---|---|
| **Finalidad** | Atender las consultas recibidas a través del formulario de contacto del sitio web y, en su caso, prestar los servicios de coaching solicitados. |
| **Base jurídica** | Consentimiento del interesado (art. 6.1.a RGPD). |
| **Categorías de interesados** | Personas que envían un mensaje a través del formulario de contacto. |
| **Categorías de datos personales** | Nombre, email, teléfono (opcional), asunto, contenido del mensaje, servicio de interés. |
| **Categorías de destinatarios** | Únicamente el responsable. |
| **Encargados del tratamiento** | Supabase Inc., Vercel Inc., Google LLC (ver actividad 2.1). |
| **Transferencias internacionales** | Las indicadas en la actividad 2.1 (Vercel y Google, EE. UU., con DPF/SCCs). |
| **Plazo de conservación** | 24 meses desde el último contacto, salvo solicitud previa de supresión. Purga automática programada. |
| **Medidas de seguridad** | Las mismas que en la actividad 2.1. |
| **Decisiones automatizadas** | No se aplican. |

### 2.3 — Gestión de clientes contratantes de servicios de coaching

| Campo | Detalle |
|---|---|
| **Finalidad** | Gestionar la relación contractual con clientes que contratan servicios de coaching: facturación, seguimiento de sesiones, archivos contractuales. |
| **Base jurídica** | Ejecución de un contrato (art. 6.1.b RGPD) y cumplimiento de obligaciones legales fiscales y mercantiles (art. 6.1.c RGPD). |
| **Categorías de interesados** | Personas físicas o representantes de personas jurídicas que contratan servicios. |
| **Categorías de datos personales** | Identificativos, fiscales (NIF/CIF, dirección fiscal), de contacto, financieros (importe, tarifa), de sesiones (fechas, notas, archivos adjuntos). |
| **Categorías de destinatarios** | Únicamente el responsable. Agencia Tributaria y entidades bancarias cuando proceda por obligación legal. |
| **Encargados del tratamiento** | Supabase Inc., Vercel Inc., Google LLC (agenda y correo del responsable). |
| **Transferencias internacionales** | Las indicadas en la actividad 2.1 (Vercel y Google, EE. UU., con DPF/SCCs). |
| **Plazo de conservación** | Durante la relación contractual y, una vez finalizada, durante los plazos legales aplicables (6 años fiscal, art. 30 Código de Comercio). |
| **Medidas de seguridad** | Las mismas que en la actividad 2.1, más bucket privado de Storage exclusivo para archivos de clientes con acceso restringido a personal autorizado. |
| **Decisiones automatizadas** | No se aplican. |

---

## 3. Derechos de los interesados

Los interesados pueden ejercer en cualquier momento sus derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento, portabilidad y a no ser objeto de decisiones automatizadas, así como retirar el consentimiento prestado.

- **Vía electrónica para candidatos**: pestaña *"Privacidad y datos"* dentro de su área privada (descarga directa de datos en JSON y eliminación de cuenta).
- **Vía general**: email a info@henkoaching.com adjuntando copia de documento que acredite la identidad. Plazo de respuesta: 1 mes.
- **Reclamación ante la autoridad de control**: Agencia Española de Protección de Datos — www.aepd.es.

---

## 4. Medidas técnicas y organizativas implementadas

### Técnicas
- HTTPS obligatorio (certificado SSL gestionado por Vercel).
- Cifrado AES-256 en reposo de la base de datos (Supabase).
- Row Level Security (RLS) habilitado en todas las tablas con políticas que restringen el acceso por rol y propiedad del dato.
- Almacenamiento de CVs en bucket privado con políticas de acceso por propietario y rol reclutador.
- Autenticación con tokens JWT rotativos (acceso 1 h, refresco 30 días).
- Contraseñas almacenadas mediante hash bcrypt (gestionado por Supabase Auth).
- Registro de auditoría (tabla `audit_logs`) que capta toda acción mutativa: quién, cuándo, qué.
- Proceso programado de retención que purga datos vencidos automáticamente.
- Eliminación física de archivos en Storage al eliminar la cuenta del usuario.

### Organizativas
- Acceso exclusivo del responsable a los datos personales.
- Encargados del tratamiento sujetos a sus propias políticas RGPD verificadas (DPA de Supabase, Vercel y Google).
- Documentación de cumplimiento accesible desde el sitio web (Aviso Legal, Política de Privacidad, Política de Cookies).
- Página específica de derechos ARCO disponible para los candidatos registrados.

---

## 5. Análisis de riesgos y necesidad de Evaluación de Impacto (EIPD)

Conforme al artículo 35 RGPD, una Evaluación de Impacto es obligatoria cuando el tratamiento implica un alto riesgo para los derechos y libertades de los interesados.

**Conclusión:** las actividades aquí registradas **no requieren EIPD** porque:
- No se tratan categorías especiales de datos (art. 9 RGPD).
- No hay evaluación sistemática mediante decisiones automatizadas.
- No hay observación sistemática a gran escala.
- El volumen de datos es bajo (portal de empleo de una profesional autónoma).

Esta evaluación se revisará anualmente o cuando se introduzcan cambios sustanciales en los tratamientos.

---

## 6. Brechas de seguridad

En caso de brecha de seguridad que afecte a datos personales:
1. Notificar a la AEPD en un plazo máximo de 72 horas desde su conocimiento (art. 33 RGPD), salvo que sea improbable que entrañe riesgo.
2. Comunicar a los interesados afectados sin dilación cuando suponga un alto riesgo para sus derechos (art. 34 RGPD).
3. Documentar la brecha en este registro con detalle de hechos, efectos y medidas correctivas.

**Histórico de brechas:** ninguna a la fecha de esta revisión.

---

## 7. Firma del responsable

Como responsable del tratamiento, declaro que la información contenida en este registro es veraz y refleja las actividades de tratamiento de datos personales realizadas en el marco de mi actividad profesional.

**Nombre:** Jennifer Cervera Alzate
**NIF:** 43209692Y
**Fecha:** ___ / ___ / ______
**Firma:**



---

*Este documento debe estar disponible para su consulta por la Agencia Española de Protección de Datos en caso de inspección. Se recomienda conservar una copia impresa y firmada.*
