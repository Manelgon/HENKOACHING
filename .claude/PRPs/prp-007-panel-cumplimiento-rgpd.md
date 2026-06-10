# PRP-007: Panel de Cumplimiento RGPD

> **Estado**: CASI COMPLETADO (verificado en auditoría 2026-06-10)
> **Fecha**: 2026-06-04
> **Cierre**: Infraestructura implementada — panel /dashboard/rgpd (RgpdDashboard.tsx), formulario público /legal/derechos-arco + tabla derechos_arco (migración 016), registro de consentimientos, purga de audit_logs en el cron, console.error sanitizados (2026-06-10). PENDIENTE solo contenido: redactar los documentos "Política IA", "Formación IA" y "Subencargados" en las tarjetas del panel.
> **Proyecto**: Henkoaching — Portal de Empleo + SaaS Coaching

---

## Objetivo

Implementar todas las correcciones detectadas en la auditoría de cumplimiento (12 hallazgos) mediante: una nueva sección "Cumplimiento RGPD" en el dashboard admin para gestionar documentos normativos (RoPA, runbook, política IA, formación, DPIA checklist, subencargados, responsable de incidentes), un formulario web público para el ejercicio de derechos RGPD, y correcciones de código (TTL audit_logs, console.error con PII).

## Por Qué

| Problema | Solución |
|----------|----------|
| 12 hallazgos de auditoría (2 críticos, 5 altos, 5 medios) exponen a Henkoaching a sanciones AEPD | Panel admin centralizado + correcciones de código que cierran todos los hallazgos |
| Sin runbook de brecha: si ocurre un incidente, Jennifer no sabe qué hacer en 72h | Plantilla de runbook editable en el admin + guía paso a paso visible en prod |
| Sin RoPA: no existe registro legal de qué datos se tratan y con qué base jurídica | Formulario estructurado en admin para crear y mantener el RoPA |
| audit_logs crece indefinidamente con emails y datos personales | Job de purga TTL integrado en el cron diario existente |
| Ejercicio de derechos solo por email manual, sin acuse de recibo | Formulario público `/legal/derechos-arco` con confirmación automática por email |
| console.error puede filtrar emails/PII en logs de Vercel | Sanitización de objetos antes de loguear en server actions |

**Valor de negocio**: Cierra la brecha legal RGPD + AI Act antes de que la AEPD pueda actuar; elimina el riesgo de multa (hasta 4% facturación global); da confianza a candidatos y empresas de que sus datos están protegidos.

## Qué

### Criterios de Éxito
- [ ] `/dashboard/rgpd` accesible solo para admin, con 7 tarjetas de documentos (RoPA, Runbook, Política IA, Formación IA, DPIA checklist, Subencargados, Responsable incidentes)
- [ ] Jennifer puede editar y guardar cada documento desde la UI, con fecha de última actualización visible
- [ ] Cron diario purga audit_logs con más de 12 meses de antigüedad
- [ ] Formulario `/legal/derechos-arco` funciona públicamente: envía solicitud a BD + email de confirmación automático
- [ ] Los 3 server actions con console.error que exponen objetos con PII usan sanitización
- [ ] `npm run typecheck` y `npm run build` pasan sin errores
- [ ] La sección "Cumplimiento" aparece en el sidebar del dashboard con icono propio

### Comportamiento Esperado

**Happy Path — Panel Admin:**
1. Jennifer entra a `/dashboard/rgpd`
2. Ve un grid de 7 tarjetas, cada una con: título, estado (Completado / Pendiente), fecha de última actualización
3. Hace clic en "RoPA" → se abre un modal/formulario con campos estructurados (actividades de tratamiento, base jurídica, destinatarios, retención)
4. Guarda → se persiste en BD → la tarjeta muestra "Actualizado hoy"
5. Para Runbook/Política: editor de texto enriquecido (textarea markdown) con vista previa
6. Para Formación IA: tabla donde añade filas (persona, fecha, curso)
7. Para Responsable de incidentes: campo simple de nombre + email + teléfono

**Happy Path — Formulario Público:**
1. Candidato/empresa va a `/legal/derechos-arco`
2. Rellena: nombre, email, tipo de derecho (acceso/rectificación/supresión/portabilidad/oposición/limitación), descripción
3. Envía → se guarda en BD `derechos_arco` → email de confirmación automático al solicitante
4. Jennifer ve las solicitudes en `/dashboard/rgpd` en una pestaña "Solicitudes de derechos"
5. Jennifer puede marcar cada solicitud como "Resuelta" con fecha de resolución

---

## Contexto

### Referencias
- `src/app/(main)/layout.tsx` — Patrón de nav: añadir sección "Cumplimiento" al sidebar (sólo admin)
- `src/app/(main)/dashboard/ajustes/page.tsx` + `src/features/ajustes/components/AjustesForm.tsx` — Patrón de página admin con formulario de edición
- `src/app/(main)/dashboard/logs/page.tsx` — Patrón de página admin con tabla y filtros
- `src/app/api/cron/retencion/route.ts` — Cron existente; aquí se añade la purga de audit_logs
- `src/lib/audit/log-action.ts` — Tabla `audit_logs` a purgar
- `src/lib/email/send.ts` + `src/lib/email/templates/` — Patrón para email de confirmación derechos ARCO
- `src/app/(web)/contacto/` — Patrón de formulario público
- `src/actions/leads.ts` — Patrón de server action para formulario público con email

### Arquitectura Propuesta (Feature-First)

```
src/features/rgpd/
├── components/
│   ├── RgpdDashboard.tsx        # Grid de 7 tarjetas de estado
│   ├── DocumentoEditor.tsx      # Modal/formulario edición de documento
│   ├── RopaForm.tsx             # Formulario estructurado para el RoPA
│   ├── FormacionTable.tsx       # Tabla de registros de formación IA
│   ├── DerechosArcoTable.tsx    # Tabla de solicitudes de derechos en admin
│   └── DerechosArcoForm.tsx     # Formulario público (usado en web)
├── actions/
│   └── rgpd.ts                  # Server actions: guardar documentos, resolver solicitudes
└── types/
    └── index.ts

src/app/(main)/dashboard/rgpd/
└── page.tsx                     # Página admin del panel RGPD

src/app/(web)/legal/derechos-arco/
└── page.tsx                     # Formulario público ejercicio derechos
```

### Modelo de Datos

```sql
-- Tabla para documentos normativos (RoPA, runbook, políticas, etc.)
CREATE TABLE rgpd_documentos (
  id          TEXT PRIMARY KEY,         -- slug: 'ropa', 'runbook', 'politica_ia', etc.
  titulo      TEXT NOT NULL,
  contenido   JSONB NOT NULL DEFAULT '{}',  -- estructura libre por tipo de documento
  actualizado_at TIMESTAMPTZ,
  actualizado_por TEXT,                 -- email del admin
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE rgpd_documentos ENABLE ROW LEVEL SECURITY;
-- Solo admin puede leer/escribir (sin policy pública)
CREATE POLICY "admin_all" ON rgpd_documentos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Tabla para solicitudes de ejercicio de derechos ARCO
CREATE TABLE derechos_arco (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre        TEXT NOT NULL,
  email         TEXT NOT NULL,
  tipo_derecho  TEXT NOT NULL CHECK (tipo_derecho IN ('acceso','rectificacion','supresion','portabilidad','oposicion','limitacion')),
  descripcion   TEXT NOT NULL,
  estado        TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','en_proceso','resuelta')),
  resolucion_at TIMESTAMPTZ,
  notas_admin   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE derechos_arco ENABLE ROW LEVEL SECURITY;
-- Inserción pública (formulario web sin auth)
CREATE POLICY "insert_anonimo" ON derechos_arco FOR INSERT WITH CHECK (true);
-- Solo admin puede leer y actualizar
CREATE POLICY "admin_read_update" ON derechos_arco
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

**Purga TTL audit_logs** — no requiere nueva tabla, se añade al cron existente:
```sql
-- RPC auxiliar para purga por fecha (o inline en el cron)
DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '12 months';
```

### Hallazgos y cómo se cierran

| ID | Severidad | Cierre |
|----|-----------|--------|
| GOV-03 | CRÍTICO | Documento "Runbook brecha" en `rgpd_documentos` con plantilla prellenada |
| SEC-06b | ALTA | Purga TTL en cron diario: `audit_logs` > 12 meses |
| GOV-01 | ALTA | Documento "Política uso IA equipo" en `rgpd_documentos` |
| IA-08 | ALTA | Tabla de registros de formación IA en `rgpd_documentos.contenido` |
| PD-06 | MEDIA | Formulario público `/legal/derechos-arco` + tabla `derechos_arco` |
| SEC-08 | MEDIA | Documento "DPIA checklist" en `rgpd_documentos` con checklist prellenado |
| SEC-01 | ALTA | Documento "MFA admin" en `rgpd_documentos` (evidencia + checklist manual) |
| GOV-02 | MEDIA | Documento "Responsable incidentes" en `rgpd_documentos` (nombre/email/tel) |
| PD-07 | ALTA | Formulario estructurado RoPA en `rgpd_documentos` |
| INT-02 | MEDIA | Documento "Subencargados" en `rgpd_documentos` (tabla: nombre/servicio/país/contrato) |
| IA-06 | MEDIA | Documento "Política IA en selección" en `rgpd_documentos` |
| SEC-05 | MEDIA | Sanitizar `console.error` en `solicitudes.ts`, `leads.ts`, `email.ts` |

---

## Blueprint (Assembly Line)

> IMPORTANTE: Solo FASES. Las subtareas se generan al entrar a cada fase con bucle-agentico.

### Fase 1: Migración de BD
**Objetivo**: Crear tablas `rgpd_documentos` y `derechos_arco` con RLS en Supabase, e insertar las 7 filas semilla de documentos con plantillas prellenadas en JSONB.
**Validación**: `list_tables` muestra ambas tablas; `execute_sql` confirma los 7 documentos semilla; RLS activo.

### Fase 2: Panel Admin — Documentos Normativos
**Objetivo**: Nueva sección `/dashboard/rgpd` con grid de 7 tarjetas + editor de cada documento (modales con formulario adaptado a cada tipo).
**Validación**: Playwright screenshot muestra el grid; Jennifer puede editar y guardar el runbook; datos persisten en BD.

### Fase 3: Panel Admin — Solicitudes de Derechos ARCO
**Objetivo**: Pestaña "Solicitudes ARCO" en `/dashboard/rgpd` que muestra la tabla `derechos_arco` con filtros de estado y botón "Marcar como resuelta".
**Validación**: Tabla renderiza con estados correctos; acción de resolución actualiza BD y añade timestamp.

### Fase 4: Formulario Público de Derechos ARCO
**Objetivo**: Página pública `/legal/derechos-arco` con formulario validado (Zod), server action que guarda en `derechos_arco` y envía email de confirmación al solicitante.
**Validación**: Playwright rellena y envía el formulario; fila aparece en BD; email de confirmación se dispara (log de `send.ts`).

### Fase 5: Purga TTL de audit_logs + Sanitización console.error
**Objetivo**: Añadir step de purga de `audit_logs` > 12 meses al cron `/api/cron/retencion`, y sanitizar los 3 server actions que hacen `console.error` con objetos que pueden contener PII.
**Validación**: TypeScript compila sin errores; lógica de purga testeable con fecha mock; grep no encuentra `console.error` con objetos PII directos.

### Fase 6: Sidebar + Enlace Legal
**Objetivo**: Añadir entrada "Cumplimiento RGPD" al sidebar del dashboard (solo admin), y añadir enlace a `/legal/derechos-arco` en la página `/legal` existente.
**Validación**: Playwright screenshot del dashboard muestra la nueva entrada en sidebar; enlace en `/legal` funciona.

### Fase 7: Validación Final
**Objetivo**: Sistema funcionando end-to-end, todos los hallazgos cerrados.
**Validación**:
- [ ] `npm run typecheck` pasa sin errores
- [ ] `npm run build` exitoso
- [ ] Playwright screenshot confirma panel `/dashboard/rgpd` con 7 tarjetas
- [ ] Playwright screenshot confirma `/legal/derechos-arco` con formulario
- [ ] Todos los criterios de éxito cumplidos

---

## Aprendizajes (Self-Annealing)

> Se rellena durante la implementación.

---

## Gotchas

- [ ] `rgpd_documentos` usa TEXT como PK (slug) — no UUID; no olvidar excluir de TypeScript autogenerated types o ajustar manualmente
- [ ] El formulario público de derechos ARCO NO requiere auth — la policy INSERT debe ser `WITH CHECK (true)`
- [ ] El email de confirmación al solicitante va con `send.ts` existente — no crear nuevo helper de email
- [ ] La purga de audit_logs DEBE ir en el mismo cron de retención, no en un nuevo endpoint, para no multiplicar las claves CRON_SECRET
- [ ] El sidebar (layout.tsx) reconstruye el array `sections` en cada render — añadir la entrada en el bloque `if (isAdmin)` existente, no crear un nuevo bloque
- [ ] Los 7 documentos semilla deben tener `contenido` JSONB con estructura específica por tipo (runbook distinto a tabla de formación); definir los schemas en `types/index.ts` antes de los formularios
- [ ] Zod para el formulario público: el campo `descripcion` debe tener max 2000 chars para evitar spam

## Anti-Patrones

- NO crear un nuevo cron endpoint para la purga de audit_logs; usar el existente `/api/cron/retencion`
- NO usar `any` en los tipos JSONB de `rgpd_documentos`; definir union types por `id` del documento
- NO ignorar errores de TypeScript en server actions
- NO hardcodear los 7 IDs de documento fuera de una constante compartida
- NO crear formularios sin validación Zod

---

*PRP pendiente aprobación. No se ha modificado código.*
