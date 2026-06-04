-- =============================================================================
-- RGPD Panel de Cumplimiento
-- Tablas: rgpd_documentos (7 documentos normativos) + derechos_arco (solicitudes)
-- =============================================================================

-- ── rgpd_documentos ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.rgpd_documentos (
  id              TEXT PRIMARY KEY,  -- slug: 'ropa', 'runbook', 'politica_ia', etc.
  titulo          TEXT NOT NULL,
  descripcion     TEXT NOT NULL,
  contenido       JSONB NOT NULL DEFAULT '{}',
  actualizado_at  TIMESTAMPTZ,
  actualizado_por TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.rgpd_documentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_rgpd_documentos" ON public.rgpd_documentos
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── derechos_arco ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.derechos_arco (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre         TEXT NOT NULL,
  email          TEXT NOT NULL,
  tipo_derecho   TEXT NOT NULL CHECK (tipo_derecho IN ('acceso','rectificacion','supresion','portabilidad','oposicion','limitacion')),
  descripcion    TEXT NOT NULL,
  estado         TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','en_proceso','resuelta')),
  resolucion_at  TIMESTAMPTZ,
  notas_admin    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.derechos_arco ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede insertar (formulario público sin auth)
CREATE POLICY "insert_anonimo_derechos_arco" ON public.derechos_arco
  FOR INSERT WITH CHECK (true);

-- Solo admin puede leer y actualizar
CREATE POLICY "admin_all_derechos_arco" ON public.derechos_arco
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── Seeds: 7 documentos normativos con plantillas prellenadas ─────────────────
INSERT INTO public.rgpd_documentos (id, titulo, descripcion, contenido, created_at)
VALUES
  (
    'ropa',
    'Registro de Actividades de Tratamiento (RoPA)',
    'Inventario legal de qué datos personales tratas, con qué finalidad y base jurídica. La AEPD lo pide primero en cualquier inspección.',
    '{
      "actividades": [
        {
          "nombre": "Gestión de candidatos",
          "finalidad": "Selección de personal y gestión de candidaturas",
          "base_legal": "Consentimiento (art. 6.1.a RGPD)",
          "categorias_datos": "Identificativos, profesionales, CV, pretensión salarial",
          "destinatarios": "Supabase Inc. (cloud), Vercel Inc. (hosting)",
          "transferencias_internacionales": "Supabase región Irlanda (UE). Vercel con SCCs.",
          "plazo_conservacion": "12 meses desde última actividad"
        },
        {
          "nombre": "Gestión de contactos (leads)",
          "finalidad": "Responder consultas de posibles clientes",
          "base_legal": "Consentimiento (art. 6.1.a RGPD)",
          "categorias_datos": "Nombre, email, teléfono, mensaje, empresa",
          "destinatarios": "Supabase Inc.",
          "transferencias_internacionales": "Supabase región Irlanda (UE)",
          "plazo_conservacion": "24 meses desde último contacto"
        },
        {
          "nombre": "Facturación y contabilidad",
          "finalidad": "Emisión de facturas, cumplimiento Veri*factu (RD 1007/2023)",
          "base_legal": "Obligación legal (art. 6.1.c RGPD)",
          "categorias_datos": "Nombre, NIF/CIF, dirección fiscal, importes",
          "destinatarios": "AEAT (Veri*factu), Supabase Inc.",
          "transferencias_internacionales": "No (AEAT: España)",
          "plazo_conservacion": "6 años (art. 30 Código de Comercio)"
        }
      ]
    }'::jsonb,
    NOW()
  ),
  (
    'runbook',
    'Runbook de brecha de datos (72h)',
    'Procedimiento paso a paso para actuar si ocurre una fuga o acceso no autorizado. Tienes 72 horas para notificar a la AEPD.',
    '{
      "pasos": [
        {"orden": 1, "titulo": "Detectar y confirmar", "descripcion": "Verificar que realmente ha ocurrido una brecha. Documentar: qué datos, cuántos afectados, cómo se descubrió, fecha/hora."},
        {"orden": 2, "titulo": "Contener (inmediato)", "descripcion": "Revocar accesos comprometidos, cambiar contraseñas, desactivar tokens. Evitar que la brecha se extienda."},
        {"orden": 3, "titulo": "Evaluar el riesgo (< 24h)", "descripcion": "¿Afecta a datos especiales (salud, ideología)? ¿Cuántas personas? ¿Hay riesgo real para los afectados? Si sí → notificación obligatoria."},
        {"orden": 4, "titulo": "Notificar a la AEPD (< 72h)", "descripcion": "Usar Comunica-Brecha en aepd.es. Incluir: naturaleza de la brecha, datos afectados, consecuencias probables, medidas adoptadas."},
        {"orden": 5, "titulo": "Comunicar a afectados (si alto riesgo)", "descripcion": "Si hay alto riesgo para las personas afectadas, comunicarles directamente. Lenguaje claro, sin tecnicismos."},
        {"orden": 6, "titulo": "Documentar internamente", "descripcion": "Registrar todo aunque no haya obligación de notificar. Responsable: Jennifer Cervera."}
      ],
      "contacto_responsable": "Jennifer Cervera — info@henkoaching.com",
      "enlace_aepd": "https://sedeagpd.gob.es/sede-electronica-web/vistas/formComunicacionAA/inicioSesionComunicacion.jsf"
    }'::jsonb,
    NOW()
  ),
  (
    'politica_ia',
    'Política de uso de IA del equipo',
    'Qué herramientas de IA puede usar el equipo, qué datos NO enviar a modelos externos y quién aprueba nuevas integraciones.',
    '{
      "herramientas_permitidas": [
        {
          "nombre": "Claude (Anthropic)",
          "uso": "Asistencia en desarrollo, redacción y análisis",
          "datos_permitidos": "Código, textos genéricos, borradores sin datos personales",
          "datos_prohibidos": "CVs, NIF/DNI, contraseñas, datos personales de candidatos o clientes identificables"
        }
      ],
      "reglas_generales": [
        "Nunca enviar datos personales identificables a modelos de IA externos sin evaluar el DPA del proveedor.",
        "Anonimizar o pseudonimizar los datos antes de usarlos como contexto en prompts de IA.",
        "Si un nuevo proveedor de IA va a procesar datos personales, debe evaluarse su DPA antes de integrarlo.",
        "No almacenar respuestas de IA que contengan datos personales de terceros."
      ],
      "aprobacion_nuevas_integraciones": "Jennifer Cervera debe aprobar cualquier nueva integración de IA que procese datos personales.",
      "ultima_revision": ""
    }'::jsonb,
    NOW()
  ),
  (
    'formacion_ia',
    'Registro de formación en IA',
    'Obligatorio desde febrero 2025 (art. 4 EU AI Act). Registra las formaciones del equipo sobre uso responsable de IA.',
    '{
      "registros": []
    }'::jsonb,
    NOW()
  ),
  (
    'dpia_checklist',
    'Checklist DPIA (Evaluación de Impacto)',
    'Evaluación de si este sistema requiere una Evaluación de Impacto en Protección de Datos según el art. 35 RGPD.',
    '{
      "decision": "no_requerida",
      "fecha_decision": "",
      "razonamiento": "El sistema gestiona datos de candidatos laborales pero sin tratamiento a gran escala, sin datos especiales (salud, biometría), sin decisiones automatizadas con efectos legales, y sin vigilancia sistemática.",
      "criterios": [
        {"criterio": "Evaluación o puntuación sistemática de personas", "aplica": false, "nota": "No hay scoring ni perfilado automático"},
        {"criterio": "Decisiones automatizadas con efectos legales", "aplica": false, "nota": "Todas las decisiones son humanas"},
        {"criterio": "Vigilancia sistemática a gran escala", "aplica": false, "nota": "Sin seguimiento ni monitorización continua"},
        {"criterio": "Datos sensibles o de naturaleza muy personal", "aplica": false, "nota": "Sin datos de salud, biometría, ideología"},
        {"criterio": "Tratamiento a gran escala", "aplica": false, "nota": "Microempresa / autónoma, volumen reducido"},
        {"criterio": "Combinación de datos de diferentes fuentes", "aplica": false, "nota": "Solo datos recogidos directamente del usuario"},
        {"criterio": "Datos de personas vulnerables", "aplica": false, "nota": "Sin menores ni colectivos especialmente vulnerables"},
        {"criterio": "Uso innovador de tecnología", "aplica": false, "nota": "Sin IA en producción actualmente"}
      ]
    }'::jsonb,
    NOW()
  ),
  (
    'subencargados',
    'Inventario de subencargados',
    'Todos los servicios externos que procesan datos personales de tus usuarios. Necesitas DPA con cada uno.',
    '{
      "subencargados": [
        {
          "nombre": "Supabase Inc.",
          "servicio": "Base de datos y autenticación",
          "pais": "Irlanda (UE)",
          "dpa_firmado": true,
          "enlace_dpa": "https://supabase.com/dpa",
          "datos_tratados": "Perfiles, CVs, solicitudes, facturas, logs de auditoría"
        },
        {
          "nombre": "Vercel Inc.",
          "servicio": "Hosting web y CDN",
          "pais": "EE.UU. (SCCs vigentes)",
          "dpa_firmado": true,
          "enlace_dpa": "https://vercel.com/legal/dpa",
          "datos_tratados": "Cookies de sesión, logs de acceso HTTP"
        },
        {
          "nombre": "AEAT (Veri*factu)",
          "servicio": "Comunicación obligatoria de facturas",
          "pais": "España",
          "dpa_firmado": false,
          "enlace_dpa": "N/A — destinatario legal obligatorio (RD 1007/2023)",
          "datos_tratados": "NIF, datos fiscales de facturas emitidas"
        },
        {
          "nombre": "Proveedor SMTP",
          "servicio": "Envío de emails transaccionales",
          "pais": "Pendiente de confirmar",
          "dpa_firmado": false,
          "enlace_dpa": "",
          "datos_tratados": "Email del destinatario, asunto, cuerpo del mensaje"
        }
      ]
    }'::jsonb,
    NOW()
  ),
  (
    'responsable_incidentes',
    'Responsable de incidentes',
    'Persona designada para gestionar brechas de seguridad y notificaciones a la AEPD.',
    '{
      "nombre": "Jennifer Cervera Alzate",
      "email": "info@henkoaching.com",
      "telefono": "",
      "nif": "43209692Y",
      "rol": "Responsable del tratamiento y gestora de incidentes de seguridad",
      "procedimiento": "En caso de brecha, seguir el Runbook de brecha de datos. Notificar a la AEPD en menos de 72h usando Comunica-Brecha.",
      "ultima_revision": ""
    }'::jsonb,
    NOW()
  )
ON CONFLICT (id) DO NOTHING;
