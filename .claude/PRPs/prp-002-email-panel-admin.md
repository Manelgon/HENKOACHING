# PRP-002: Sección Email en Panel Admin

> **Estado**: PENDIENTE
> **Fecha**: 2026-05-29
> **Proyecto**: Henkoaching (Jennifer Cervera)

---

## Objetivo

Añadir una sección **Email** al panel admin con dos funcionalidades: (1) configuración de credenciales SMTP/IMAP del servidor de Piensa Solutions, y (2) bandeja de entrada que muestra los emails recibidos en `info@henkoaching.com` dentro del panel, con lista y vista de detalle (solo rol admin).

## Por Qué

| Problema | Solución |
|----------|----------|
| Las credenciales SMTP para Supabase Auth (verificación, reset) están hardcodeadas o sin configurar en el panel | Formulario admin para guardar host/port/user/password/encryption de SMTP, que Supabase usará para enviar emails auth |
| Jennifer debe salir del panel para revisar el correo de `info@henkoaching.com` | Bandeja de entrada integrada en el dashboard: lista de emails + detalle, usando IMAP con `imapflow` |
| No hay forma de cambiar el servidor de correo sin tocar variables de entorno manualmente | Configuración visual persistida en Supabase (`company_settings` o tabla dedicada) |

**Valor de negocio**: Jennifer gestiona su negocio desde un único panel sin cambiar de herramienta. Los emails de contacto/clientes potenciales son visibles junto a leads y clientes.

## Qué

### Criterios de Éxito
- [ ] El admin puede guardar y actualizar credenciales SMTP (host, port, user, password, encryption) desde `/dashboard/email/config`
- [ ] El admin puede guardar y actualizar credenciales IMAP (host, port, user, password, encryption) desde el mismo formulario
- [ ] Las credenciales se almacenan encriptadas en Supabase (columnas `bytea` + función pgcrypto, o bien cifrado en capa de aplicación con `AES-256-GCM` usando `CREDENTIALS_ENCRYPTION_KEY`)
- [ ] La bandeja `/dashboard/email` muestra la lista de emails de la bandeja INBOX: remitente, asunto, fecha, leído/no leído
- [ ] Al hacer clic en un email se abre un panel de detalle con el cuerpo (HTML o texto plano)
- [ ] Solo usuarios con `role = 'admin'` pueden acceder a ambas rutas
- [ ] `npm run typecheck` y `npm run build` pasan sin errores

### Comportamiento Esperado

**Config SMTP/IMAP (Happy Path)**:
1. Admin navega a `/dashboard/email` → pestaña/sección "Configuración"
2. Rellena campos SMTP: host (ej. `mail.piensasolutions.com`), port (587), user (`info@henkoaching.com`), password, encryption (`starttls` | `ssl` | `none`)
3. Rellena campos IMAP: host, port (993), user, password, encryption
4. Guarda → Server Action encripta y persiste en tabla `email_settings`
5. Toast de éxito; al recargar los campos muestran los valores guardados (password enmascarado)

**Bandeja de entrada (Happy Path)**:
1. Admin navega a `/dashboard/email` → pestaña/sección "Bandeja"
2. Server Component (o Server Action) conecta vía IMAP con `imapflow`, obtiene los últimos 50 mensajes del INBOX
3. Se muestra tabla: checkbox leído, remitente, asunto, fecha relativa
4. Al clicar un email → panel lateral (drawer) con cuerpo HTML sanitizado (DOMPurify server-side) o texto plano
5. Si no hay credenciales configuradas → aviso "Configura primero las credenciales IMAP"

---

## Contexto

### Referencias
- `src/features/ajustes/components/AjustesForm.tsx` — Patrón de formulario de configuración con secciones `<Section>` y campos `<Field>`, usando `useAction` + Server Actions
- `src/actions/ajustes.ts` — Patrón `requireAdmin()` + `createAdminClient()` para mutations de solo admin
- `src/app/(main)/layout.tsx` — Cómo se añaden ítems de nav al sidebar (sección "Administración" para `isAdmin`)
- `src/app/(main)/dashboard/ajustes/page.tsx` — Page pattern: `force-dynamic`, check admin, render form
- `src/lib/audit/log-action.ts` — Log de acciones admin
- `src/lib/supabase/admin.ts` — `createAdminClient()` con `SUPABASE_SERVICE_ROLE_KEY`
- `supabase/migrations/001_facturacion.sql` — Patrón de tabla `company_settings` (single-row); seguir mismo estilo de migración
- `npm` package `imapflow` — cliente IMAP moderno, promesas, soporte TLS/STARTTLS

### Arquitectura Propuesta (Feature-First)

```
src/features/email/
├── components/
│   ├── EmailConfigForm.tsx       # Formulario SMTP + IMAP (client component)
│   ├── BandejaList.tsx           # Lista de emails (client component)
│   └── EmailDrawer.tsx           # Detalle de email (drawer lateral)
├── services/
│   └── imap.ts                   # Wrapper imapflow: listar + leer mensaje
└── types/
    └── index.ts                  # EmailMessage, EmailConfig, etc.

src/actions/
└── email.ts                      # guardarEmailConfig, listarEmails, leerEmail

src/app/(main)/dashboard/email/
├── page.tsx                      # Ruta principal: tabs Config + Bandeja
└── config/                       # Opcional: ruta separada si se prefiere
```

### Modelo de Datos

```sql
-- Migración 010: tabla email_settings (single-row, id = 1)
-- Las credenciales se cifran en la capa de aplicación (AES-256-GCM)
-- antes de INSERT/UPDATE, y se descifran en Server Actions al leer.
-- NUNCA se exponen en client components.

CREATE TABLE IF NOT EXISTS public.email_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),

  -- SMTP (para envíos: Supabase Auth + envíos desde la app)
  smtp_host        TEXT,
  smtp_port        INTEGER DEFAULT 587,
  smtp_user        TEXT,
  smtp_password    TEXT,          -- almacenado cifrado (AES-256-GCM + base64)
  smtp_encryption  TEXT DEFAULT 'starttls',  -- 'starttls' | 'ssl' | 'none'

  -- IMAP (para leer bandeja)
  imap_host        TEXT,
  imap_port        INTEGER DEFAULT 993,
  imap_user        TEXT,
  imap_password    TEXT,          -- almacenado cifrado (AES-256-GCM + base64)
  imap_encryption  TEXT DEFAULT 'ssl',  -- 'ssl' | 'starttls' | 'none'

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fila única
INSERT INTO public.email_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- RLS: solo admins pueden leer/escribir
ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_only" ON public.email_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

**Estrategia de cifrado en capa de aplicación**:
- Variable de entorno: `CREDENTIALS_ENCRYPTION_KEY` (32 bytes en hex, solo server-side, sin prefijo `NEXT_PUBLIC_`)
- Función util `src/lib/crypto/encrypt.ts`: `encryptText(plain)` → `iv:ciphertext` en base64
- Función util `src/lib/crypto/encrypt.ts`: `decryptText(encrypted)` → texto plano
- Las passwords nunca salen del servidor; los client components solo reciben un booleano `hasPassword: true/false`

### Consideraciones de arquitectura

**IMAP con imapflow en Next.js**:
- `imapflow` solo funciona en Node.js (no en Edge Runtime). Las Server Actions y Server Components de `/dashboard/email` deben usar `runtime = 'nodejs'` implícito (default en App Router con `force-dynamic`).
- La conexión IMAP se abre y cierra en cada request (sin pool persistente), ya que Next.js serverless no mantiene estado entre requests.
- Timeout: configurar `connectTimeout: 10000` en ImapFlow para no bloquear indefinidamente.
- Sanitización HTML: usar `sanitize-html` (server-side) para el cuerpo del email antes de enviarlo al cliente, evitando XSS.

**SMTP y Supabase Auth (integración automática vía Management API)**:
- Al guardar credenciales SMTP, la Server Action llama automáticamente a `PATCH https://api.supabase.com/v1/projects/{ref}/config/auth` con los datos SMTP.
- Requiere variable de entorno: `SUPABASE_ACCESS_TOKEN` (personal access token de supabase.com → Account → Access Tokens) y `SUPABASE_PROJECT_REF` (referencia del proyecto).
- Al cargar el formulario, hacer primero `GET https://api.supabase.com/v1/projects/{ref}/config/auth` para pre-rellenar los valores actuales (ya tienen config manual).
- Si la llamada a la Management API falla, los datos se guardan igualmente en DB local y se muestra un aviso al admin.
- Las variables `SUPABASE_ACCESS_TOKEN` y `SUPABASE_PROJECT_REF` se añaden a `.env.local` y a Vercel.

---

## Blueprint (Assembly Line)

> Solo fases. Las subtareas se generan just-in-time al entrar a cada fase con `/bucle-agentico`.

### Fase 1: Migración y cifrado base
**Objetivo**: Crear la migración SQL para `email_settings`, aplicarla en Supabase, y crear las utilidades de cifrado AES-256-GCM en `src/lib/crypto/`.
**Validación**: Tabla `email_settings` visible en Supabase con RLS activo; `src/lib/crypto/encrypt.ts` exporta `encryptText` y `decryptText` con tests manuales en un script.

### Fase 2: Server Actions de configuración + Management API
**Objetivo**: Crear `src/actions/email.ts` con:
- `getEmailConfig`: GET a Supabase Management API para leer config actual + lee DB local; devuelve datos sin passwords al cliente (solo flags `hasSmtpPassword`, `hasImapPassword`)
- `guardarEmailConfig`: cifra passwords, upsert en DB local, llama PATCH a Management API para actualizar SMTP en Supabase Auth automáticamente
**Validación**: Server Action guarda y recupera correctamente; passwords no aparecen en ningún response; la config SMTP se actualiza en Supabase Auth al guardar.

### Fase 3: UI de configuración SMTP/IMAP
**Objetivo**: Crear `EmailConfigForm.tsx` con secciones SMTP e IMAP siguiendo el patrón de `AjustesForm.tsx`. Crear page `/dashboard/email` con acceso solo admin.
**Validación**: El formulario carga, guarda, muestra mensaje de éxito; campo password muestra placeholder "••••••••" si ya hay contraseña guardada.

### Fase 4: Servicio IMAP y Server Action de bandeja
**Objetivo**: Crear `src/features/email/services/imap.ts` usando `imapflow` para listar los últimos 50 mensajes del INBOX y leer el cuerpo de un mensaje por UID. Crear Server Actions `listarEmails` y `leerEmail`.
**Validación**: En desarrollo, la Server Action devuelve lista de mensajes con remitente, asunto, fecha y UID. El cuerpo HTML está sanitizado.

### Fase 5: UI de bandeja de entrada
**Objetivo**: Crear `BandejaList.tsx` (lista con columnas: leído, de, asunto, fecha) y `EmailDrawer.tsx` (panel lateral con cuerpo del email). Integrar en la page `/dashboard/email` con tabs o secciones Config / Bandeja.
**Validación**: La bandeja muestra emails reales de `info@henkoaching.com`; el drawer abre y muestra el cuerpo; si no hay credenciales IMAP muestra aviso.

### Fase 6: Navegación y validación final
**Objetivo**: Añadir ítem "Email" en el sidebar de admin (en `src/app/(main)/layout.tsx`), auditar acciones con `logAction`, y pasar todos los checks de calidad.
**Validación**:
- [ ] `npm run typecheck` pasa sin errores
- [ ] `npm run build` exitoso
- [ ] Ítem "Email" visible en sidebar solo para admins
- [ ] Playwright screenshot confirma UI de bandeja y configuración
- [ ] Credenciales SMTP/IMAP guardadas y recuperadas correctamente
- [ ] Bandeja muestra mensajes reales de INBOX

---

## Aprendizajes (Self-Annealing)

> Se actualizará durante la implementación.

---

## Gotchas

- [ ] `imapflow` es solo Node.js — no funciona con Edge Runtime. Asegurarse de que las rutas usan runtime por defecto (nodejs), no `export const runtime = 'edge'`
- [ ] Las passwords cifradas NO deben llegar nunca al cliente (ni como prop, ni en JSON de respuesta). Solo el flag booleano `hasPassword`
- [ ] `CREDENTIALS_ENCRYPTION_KEY` debe ser una variable de entorno **sin** prefijo `NEXT_PUBLIC_`; añadirla a `.env.local` y a Vercel
- [ ] La integración SMTP con Supabase Auth se actualiza automáticamente vía Management API al guardar. Requiere `SUPABASE_ACCESS_TOKEN` y `SUPABASE_PROJECT_REF` en las variables de entorno. Al cargar el form se hace GET para pre-rellenar la config actual
- [ ] Conexión IMAP en serverless: abrir y cerrar en cada request (no pool). Añadir timeout para evitar bloqueos
- [ ] Sanitizar HTML de emails con `sanitize-html` en el servidor antes de enviarlo al cliente (XSS)
- [ ] Paginación IMAP: para el MVP, cargar solo los últimos 50 mensajes del INBOX. No implementar paginación completa en esta fase

## Anti-Patrones

- NO guardar passwords en texto plano en la base de datos
- NO exponer credenciales (ni parciales) en Server Action responses enviadas al cliente
- NO crear nuevos patrones de formulario: seguir el patrón `Section` + `Field` de `AjustesForm.tsx`
- NO ignorar errores de TypeScript
- NO usar `any` (usar `unknown`)
- NO abrir conexión IMAP persistente en servidor serverless

---

*PRP pendiente aprobación. No se ha modificado código.*
