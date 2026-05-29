# PRP-005: Sistema de emails transaccionales — Portal de empleo

> **Estado**: PENDIENTE
> **Fecha**: 2026-05-29
> **Proyecto**: Henkoaching / Jennifer Cervera

---

## Objetivo

Implementar un sistema de emails transaccionales para el portal de empleo que notifique automáticamente a candidatos y a Jennifer cuando se produce una candidatura o un cambio de estado, usando el SMTP ya configurado en `email_settings` como infraestructura compartida. **Adicionalmente**, registrar cada intento de envío en la tabla `email_envios`, mostrar los fallos en una sección "Fallos" dentro de `/dashboard/email`, y añadir indicadores visuales (badge rojo + banner) cuando hay emails sin enviar.

## Por Qué

| Problema | Solución |
|----------|----------|
| Los candidatos aplican a ofertas y no reciben ninguna confirmación — se van sin saber si su candidatura llegó | Email automático al candidato al aplicar con confirmación y próximos pasos |
| Jennifer no se entera en tiempo real de nuevas candidaturas — debe revisar el panel manualmente | Email a Jennifer al recibir cada nueva candidatura con datos del candidato y enlace directo al perfil |
| Los cambios de estado (entrevista, contratado, descartado…) no se comunican al candidato — experiencia profesional deteriorada | Email automático al candidato cuando el estado cambia, con tono adaptado al estado (positivo/neutro/negativo) |
| La lógica de envío SMTP está duplicada y acoplada en `enviarEmail` (acción admin-only) — los hooks de `aplicarAOferta` no pueden usarla | Servicio compartido `src/lib/email/send.ts` — server-only, lee credenciales via `createAdminClient`, falla silenciosamente si no hay SMTP |
| Los envíos fallidos son invisibles — solo hay un `console.error` y no hay forma de reintentarlos | Tabla `email_envios` que persiste cada intento; UI de fallos con botón "Reintentar"; badge rojo + banner en dashboard |

**Valor de negocio**: Mejora la experiencia candidato (confianza, profesionalidad), reduce la carga manual de Jennifer (menos consultas "¿recibiste mi CV?"), diferencia a Henkoaching de portales genéricos, y garantiza que ningún email transaccional se pierda silenciosamente.

## Qué

### Criterios de Éxito
- [ ] Al aplicar a una oferta, el candidato recibe email de confirmación con nombre de la oferta y próximos pasos
- [ ] Al aplicar a una oferta, Jennifer recibe email con nombre del candidato, oferta y enlace al perfil en `/dashboard/candidatos/[id]`
- [ ] Al cambiar estado a `revisando`, `entrevista`, `contratado` o `descartado`, el candidato recibe email con tono apropiado al estado
- [ ] Cada intento de envío queda registrado en `email_envios` (estado: enviado/error)
- [ ] La sección "Fallos" en `/dashboard/email` muestra emails con estado `error` y permite reintentarlos
- [ ] El badge rojo aparece en el ítem "Email" del sidebar cuando hay fallos en las últimas 24h
- [ ] El banner aparece en la bandeja cuando hay fallos recientes
- [ ] Si no hay SMTP configurado, las acciones (`aplicarAOferta`, `cambiarEstadoSolicitud`) siguen funcionando sin error
- [ ] `npm run typecheck` y `npm run build` pasan sin errores
- [ ] Los templates HTML siguen el mismo diseño que los de auth (tabla centrada, logo HenKoaching, botón turquesa)

### Comportamiento Esperado

**Candidatura nueva:**
1. Candidato hace clic en "Aplicar" en `/empleo/[slug]`
2. `aplicarAOferta` inserta en `solicitudes` (comportamiento actual, sin cambio)
3. Fire-and-forget: `sendTransactional` al candidato ("Tu candidatura ha sido recibida")
4. Fire-and-forget: `sendTransactional` a Jennifer ("Nueva candidatura — [Nombre candidato]")
5. Cada llamada a `sendTransactional` inserta en `email_envios` con estado `pendiente`, luego actualiza a `enviado` o `error`
6. Si algún envío falla, el error se registra en `email_envios` y en `audit_logs`, pero la candidatura ya está guardada — no se muestra error al candidato

**Cambio de estado:**
1. Jennifer cambia el estado en el panel de solicitudes
2. `cambiarEstadoSolicitud` actualiza en BD (comportamiento actual, sin cambio)
3. Si el nuevo estado es `revisando | entrevista | contratado | descartado`: fire-and-forget al candidato
4. Template y tono varían por estado: positivo (contratado/entrevista), neutro (revisando), negativo (descartado)
5. Intento registrado en `email_envios`

**Reintentar email fallido:**
1. Jennifer accede a `/dashboard/email` → sección "Fallos" en el sidebar de carpetas
2. Ve lista de emails con estado `error`: destinatario, asunto, tipo, fecha, mensaje de error
3. Hace clic en "Reintentar" en un email
4. Server Action `reintentarEmail(id)` lee los campos `para/asunto/html` del registro en `email_envios`, llama a `sendTransactional` directamente (sin re-insertar), y actualiza el estado del registro existente

**Badge rojo + banner:**
- `EmailPoller` (cada 120s) también llama a una Server Action `contarEmailsFallidos()` que devuelve el count de `email_envios` con estado `error` y `created_at > now() - interval '24 hours'`
- `emailStore` almacena `failedCount`; `DashboardShell` muestra un badge rojo (adicional al turquesa de no leídos) en el ítem "Email"
- `BandejaInbox` muestra un banner amarillo/rojo en la parte superior cuando `failedCount > 0`

---

## Contexto

### Referencias
- `src/actions/email.ts` — `enviarEmail` y `getDecryptedPasswords()` — patrón de lectura SMTP + nodemailer a replicar en el servicio
- `src/actions/solicitudes.ts` — puntos de hook: `aplicarAOferta` (línea 43-63) y `cambiarEstadoSolicitud` (línea 66-92)
- `src/lib/supabase/admin.ts` — `createAdminClient()` para acceder a `email_settings` sin RLS
- Templates HTML de auth en `src/actions/email.ts` (líneas 68-196) — misma estructura de tabla a reutilizar en los nuevos templates
- `src/lib/supabase/database.types.ts` — tipos relevantes: `EstadoSolicitud`, `profiles.email`, `candidato_profiles`, `ofertas.titulo/empresa_oculta`
- `src/features/email/store/emailStore.ts` — store Zustand con `unreadCount`; añadir `failedCount`
- `src/features/email/components/EmailPoller.tsx` — polling de 120s; añadir llamada a `contarEmailsFallidos()`
- `src/features/email/components/BandejaInbox.tsx` — sidebar de carpetas y panel principal; añadir ítem "Fallos" y banner
- `src/components/DashboardShell.tsx` — badge turquesa en ítem "Email" (líneas 139-143); añadir badge rojo de fallos
- `src/app/(main)/layout.tsx` — pasa `hasImapConfig` a `EmailPoller`; no requiere cambios para fallos (el store lo maneja)
- `supabase/migrations/010_email_settings.sql` — patrón de RLS admin-only a replicar en `email_envios`
- `supabase/schema.sql` — tabla `audit_logs` (líneas 490-505) — estructura de referencia para `email_envios`

### Arquitectura Propuesta

```
src/lib/email/
├── send.ts                          # Servicio base: sendTransactional() — inserta en email_envios
└── templates/
    ├── candidatura-candidato.ts     # Template HTML: "Tu candidatura ha sido recibida"
    ├── candidatura-admin.ts         # Template HTML: "Nueva candidatura — [Candidato]"
    └── estado-solicitud.ts          # Template HTML: estado cambiado (variantes por estado)

src/features/email/
├── store/emailStore.ts              # Añadir failedCount + setFailedCount
├── components/
│   ├── EmailPoller.tsx              # Añadir polling de contarEmailsFallidos()
│   ├── BandejaInbox.tsx             # Añadir ítem "Fallos" en sidebar + banner
│   └── FallosPanel.tsx              # NUEVO: lista de email_envios con estado error + botón Reintentar

src/actions/email.ts                 # Añadir: contarEmailsFallidos(), reintentarEmail(id)

src/components/DashboardShell.tsx    # Añadir badge rojo de failedCount sobre ítem Email

supabase/migrations/013_email_envios.sql   # NUEVA migración
```

**Decisión clave — número de migración**: La última migración es `012_email_templates_invite_magic.sql`. La nueva migración es `013_email_envios.sql`.

**Decisión clave — reintentar**: `reintentarEmail(id)` NO inserta un nuevo registro en `email_envios`; actualiza el registro existente (incrementa `intentos`, resetea `estado` a `pendiente`, intenta envío, actualiza a `enviado`/`error`). Esto evita duplicar la historia del intento.

**Decisión clave — `sendTransactional` vs reintentar**: El servicio `sendTransactional` siempre inserta un nuevo registro. La Server Action `reintentarEmail` opera sobre un registro existente por ID. Son flujos separados.

### Modelo de Datos

```sql
-- Migración 013: tabla email_envios
CREATE TABLE public.email_envios (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  para        text NOT NULL,
  asunto      text NOT NULL,
  html        text NOT NULL,
  estado      text NOT NULL DEFAULT 'pendiente'
              CHECK (estado IN ('pendiente', 'enviado', 'error')),
  error       text,
  intentos    integer NOT NULL DEFAULT 0,
  tipo        text,        -- 'candidatura.candidato' | 'candidatura.admin' | 'cambio_estado'
  metadata    jsonb DEFAULT '{}'::jsonb,  -- candidato_id, oferta_id, solicitud_id
  created_at  timestamptz DEFAULT now(),
  sent_at     timestamptz
);

CREATE INDEX idx_email_envios_estado  ON public.email_envios(estado);
CREATE INDEX idx_email_envios_created ON public.email_envios(created_at DESC);

-- RLS: solo admins leen/escriben desde cliente; inserts desde service role bypasan RLS
ALTER TABLE public.email_envios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "email_envios: admin only" ON public.email_envios;
CREATE POLICY "email_envios: admin only" ON public.email_envios
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
```

**Consultas de hooks en acciones** (sin migración, son runtime):

```sql
-- En aplicarAOferta: obtener datos para el email
SELECT p.email, p.nombre, p.apellidos,
       o.titulo, o.empresa_oculta, c.nombre as empresa_nombre
FROM profiles p
JOIN solicitudes s ON s.candidato_id = p.id
JOIN ofertas o ON o.id = s.oferta_id
JOIN clientes c ON c.id = o.cliente_id
WHERE s.id = $nueva_solicitud_id

-- En cambiarEstadoSolicitud: obtener email del candidato y datos de la oferta
SELECT p.email, p.nombre, o.titulo
FROM solicitudes s
JOIN profiles p ON p.id = s.candidato_id
JOIN ofertas o ON o.id = s.oferta_id
WHERE s.id = $solicitud_id

-- contarEmailsFallidos: últimas 24h
SELECT count(*) FROM email_envios
WHERE estado = 'error'
  AND created_at > now() - interval '24 hours'
```

El email de Jennifer se obtiene de `process.env.ADMIN_NOTIFICATION_EMAIL` (nueva variable de entorno, con fallback al `smtp_user` del SMTP configurado).

---

## Blueprint (Assembly Line)

> IMPORTANTE: Solo definir FASES. Las subtareas se generan al entrar a cada fase
> siguiendo el bucle agéntico (mapear contexto → generar subtareas → ejecutar)

### Fase 1: Migración `013_email_envios.sql`
**Objetivo**: Crear la tabla `email_envios` con sus índices y policy RLS admin-only; aplicar la migración al esquema local y añadir el tipo generado a `database.types.ts`
**Validación**: La tabla existe en Supabase (verificable con `list_tables`); `database.types.ts` incluye el tipo `EmailEnvios`; `npm run typecheck` pasa

### Fase 2: Servicio base `src/lib/email/send.ts`
**Objetivo**: Crear la función `sendTransactional({ to, subject, html, tipo?, metadata? })` que: (1) inserta en `email_envios` con estado `pendiente` vía `createAdminClient`; (2) construye el transporter nodemailer leyendo credenciales de `email_settings`; (3) si envía OK → actualiza a `enviado` + `sent_at`; (4) si falla → actualiza a `error` + mensaje; (5) siempre loggea en `audit_logs`. El archivo empieza con `'server-only'`
**Validación**: Archivo existe en `src/lib/email/send.ts`, exporta `sendTransactional`, TypeScript sin errores, marcado `server-only`

### Fase 3: Templates HTML
**Objetivo**: Crear los tres templates (`candidatura-candidato.ts`, `candidatura-admin.ts`, `estado-solicitud.ts`) como funciones TypeScript que reciben variables tipadas y devuelven HTML string con el mismo diseño visual que los templates de auth (tabla centrada, logo, botón turquesa `#1f8f9b`, footer HenKoaching)
**Validación**: Los tres archivos existen en `src/lib/email/templates/`, cada uno exporta una función tipada, `npm run typecheck` pasa

### Fase 4: Hook en `aplicarAOferta`
**Objetivo**: Añadir las consultas necesarias para obtener datos del candidato y la oferta tras insertar la solicitud, y llamar `sendTransactional` dos veces (candidato + admin) en modo fire-and-forget; si `empresa_oculta === true` usar "empresa confidencial"
**Validación**: Al aplicar a una oferta, dos registros aparecen en `email_envios`; la acción devuelve `{ ok: true }` aunque fallen los envíos

### Fase 5: Hook en `cambiarEstadoSolicitud`
**Objetivo**: Añadir consulta para obtener email del candidato, nombre y título de la oferta, y enviar email transaccional solo cuando el nuevo estado es `revisando | entrevista | contratado | descartado`
**Validación**: Al cambiar estado, un registro aparece en `email_envios` para los estados que corresponde; no se inserta para `nuevo`; la acción devuelve `{ ok: true }` aunque falle el envío

### Fase 6: Server Actions de fallos (`contarEmailsFallidos`, `reintentarEmail`)
**Objetivo**: Añadir a `src/actions/email.ts` la función `contarEmailsFallidos()` que devuelve el count de `email_envios` con estado `error` en las últimas 24h; y `reintentarEmail(id)` que lee el registro, incrementa `intentos`, resetea a `pendiente`, reintenta el envío vía nodemailer (sin llamar a `sendTransactional` para evitar duplicar el registro), y actualiza el estado final. Ambas requieren admin
**Validación**: TypeScript pasa; `contarEmailsFallidos()` devuelve number; `reintentarEmail(id)` devuelve `{ ok: true }` o `{ error: string }`

### Fase 7: Store + Poller (badge rojo)
**Objetivo**: Añadir `failedCount: number` y `setFailedCount` al `emailStore`; actualizar `EmailPoller` para llamar a `contarEmailsFallidos()` en cada poll (junto al de emails no leídos) y actualizar el store
**Validación**: Al haber registros con estado `error` en las últimas 24h, `failedCount` se actualiza en el store; TypeScript pasa

### Fase 8: Badge rojo en `DashboardShell`
**Objetivo**: En `DashboardShell.tsx`, leer `failedCount` del store y cuando sea > 0 mostrar un segundo badge rojo (bg-red-500, texto blanco) sobre el ítem "Email", posicionado a la derecha del badge turquesa (o en su lugar si `unreadCount === 0`)
**Validación**: Con `failedCount > 0` en el store, el badge rojo aparece sobre el icono de Email en el sidebar; el badge turquesa sigue funcionando independientemente

### Fase 9: Sección "Fallos" en `BandejaInbox` + `FallosPanel`
**Objetivo**: En `BandejaInbox`, añadir un ítem "Fallos" al sidebar de carpetas (debajo de las carpetas IMAP existentes, icono de alerta, sin tipo IMAP — es una vista especial). Cuando `activeFolder` es `fallos` (tipo especial), renderizar `FallosPanel` en lugar de la lista de mensajes. Crear `FallosPanel.tsx` que carga `email_envios` con estado `error`, muestra tabla (destinatario, asunto, tipo, fecha, error), y botón "Reintentar" que llama a `reintentarEmail(id)` con feedback toast. Añadir el banner en la parte superior de `BandejaInbox` cuando `failedCount > 0`: "X emails no se enviaron · Ver fallos" con link/click a la sección Fallos
**Validación**: La sección Fallos aparece en el sidebar; muestra los registros con estado `error`; el botón Reintentar funciona y actualiza el estado visualmente; el banner aparece cuando hay fallos

### Fase 10: Variable de entorno y validación final
**Objetivo**: Añadir `ADMIN_NOTIFICATION_EMAIL` a `.env.local.example` con comentario; verificar el fallback en `send.ts`; actualizar `database.types.ts` si hay drift
**Validación**:
- [ ] `.env.local.example` tiene `ADMIN_NOTIFICATION_EMAIL` documentada
- [ ] `npm run typecheck` pasa sin errores
- [ ] `npm run build` exitoso
- [ ] Criterios de éxito del PRP cumplidos (10 checkboxes)
- [ ] Fire-and-forget verificado: una excepción en el envío no rompe la acción principal

---

## Aprendizajes (Self-Annealing)

> Esta sección CRECE con cada error encontrado durante la implementación.

---

## Gotchas

- [ ] `'server-only'` al inicio de `src/lib/email/send.ts` — imprescindible para evitar que el bundle del cliente incluya credenciales SMTP
- [ ] `aplicarAOferta` usa `createClient()` (RLS del usuario), pero para leer `email_settings` y escribir en `email_envios` hay que usar `createAdminClient()` — mezclar los dos clients en la misma acción es correcto
- [ ] `email_envios` NO tiene policy de INSERT anónima — el insert siempre usa `createAdminClient` que bypasa RLS. Nunca intentar insertar con el client de usuario
- [ ] `ofertas.empresa_oculta === true` → mostrar "empresa confidencial" en el email del candidato, nunca el nombre real
- [ ] Las llamadas a `sendTransactional` deben ser fire-and-forget en los hooks: `sendTransactional(...).catch(e => console.error('[email]', e))` — NO usar `await` ni propagar errores
- [ ] `reintentarEmail` actualiza el registro EXISTENTE (no crea uno nuevo) — incrementar `intentos`, usar `sent_at = now()` al éxito
- [ ] El ítem "Fallos" en el sidebar de `BandejaInbox` NO es una `ImapFolder` (no tiene `path` de servidor IMAP) — usar un discriminador de tipo o un estado separado `activeFolderType: 'imap' | 'fallos'`
- [ ] El tipo `FolderType` en `src/features/email/types/index.ts` NO debe extenderse con `'fallos'` si `FolderType` se usa en `FOLDER_ICONS` — crear una unión separada o manejar el caso fuera del mapa de iconos
- [ ] `candidato_profiles` puede no tener nombre/apellidos — nunca crashear, usar `"Candidato"` como fallback
- [ ] El email de Jennifer (admin): usar `ADMIN_NOTIFICATION_EMAIL` o buscar el primer usuario con `role === 'admin'` en `profiles` como último fallback
- [ ] `contarEmailsFallidos()` se llama en cada poll de 120s — debe ser una query muy ligera (COUNT con índice sobre `estado` + `created_at`)
- [ ] El banner de fallos en `BandejaInbox` debe leer `failedCount` del `emailStore` (no hacer fetch propio) — evitar doble fetching

## Anti-Patrones

- NO crear templates como archivos `.html` independientes — son funciones TypeScript con variables tipadas
- NO bloquear `aplicarAOferta` o `cambiarEstadoSolicitud` esperando los emails — siempre fire-and-forget
- NO duplicar la lógica de construcción del transporter nodemailer — todo pasa por `sendTransactional` o, en el caso de reintentar, por el transporter reconstruido en `reintentarEmail`
- NO hardcodear el email de Jennifer en el código — usar variable de entorno con fallback dinámico
- NO usar `any` en las funciones de template ni en las Server Actions — tipar explícitamente
- NO extender `FolderType` con `'fallos'` — rompe el Record `FOLDER_ICONS` y confunde el tipo semántico de carpeta IMAP
- NO crear un segundo `EmailPoller` para los fallos — reutilizar el intervalo existente de 120s

---

*PRP pendiente aprobación. No se ha modificado código.*
