# PRP-012: Google Tasks + Gmail API — Panel de tareas y bandeja nativa

> **Estado**: PENDIENTE
> **Fecha**: 2026-06-09
> **Proyecto**: Henkoaching

---

## Objetivo

Integrar Google Tasks como panel lateral en `/dashboard/calendario` (tareas con fecha aparecen como eventos all-day de color diferente) y reemplazar la lectura IMAP en `/dashboard/email` por Gmail API con soporte de hilos, etiquetas, archivar, buscar y marcar como leído — manteniendo siempre SMTP/nodemailer para el envío.

## Por Qué

| Problema | Solución |
|----------|----------|
| No hay gestión de tareas en el dashboard; Jennifer usa Google Tasks por separado | Panel lateral derecho en el calendario mostrando task lists + tareas, con CRUD completo |
| Las tareas con fecha no son visibles en el calendario | Tareas con `due` date se inyectan como eventos all-day (color distinto: amber/orange) |
| IMAP es frágil: timeouts, conexiones colgadas, sin soporte de hilos | Gmail API es la fuente de verdad: hilos nativos, etiquetas, sin timeouts TCP |
| La lectura IMAP no soporta archivar, etiquetar ni buscar server-side | Gmail API tiene `threads.list`, `threads.get`, `messages.modify`, `messages.trash` y query nativa |
| IMAP no devuelve snippets reales | `threads.list` incluye snippet del último mensaje automáticamente |

**Valor de negocio**: Jennifer gestiona tareas y email desde el mismo dashboard sin saltar entre Google Tasks, Gmail y el panel; menos fricción = más foco en el trabajo de coaching.

## Qué

### Criterios de Éxito

**Google Tasks:**
- [ ] Panel derecho en `/dashboard/calendario` lista las task lists del usuario
- [ ] Se pueden ver las tareas de cada lista con checkbox para completar/descompletar
- [ ] Crear tarea (título + fecha vencimiento opcional) funciona y actualiza la lista
- [ ] Eliminar tarea funciona con confirmación
- [ ] Las tareas con `due` aparecen en el calendario como eventos all-day de color amber (no editables por drag)

**Gmail API:**
- [ ] La bandeja muestra hilos (threads) reales con snippet, from, asunto y fecha
- [ ] Abrir un hilo muestra todos sus mensajes con HTML sanitizado
- [ ] Eliminar hilo (mover a Trash) funciona
- [ ] Archivar hilo (quitar label INBOX) funciona
- [ ] Marcar como leído/no leído funciona
- [ ] Buscar por query (Gmail search syntax) funciona server-side
- [ ] Etiquetar hilo con labels de Gmail del usuario funciona
- [ ] El envío SIEMPRE usa SMTP/nodemailer (sin cambios en `enviarEmail`)
- [ ] La configuración IMAP deja de ser necesaria para leer (pero los campos SMTP permanecen)

### Comportamiento Esperado

**Happy Path — Tareas:**
1. Jennifer abre `/dashboard/calendario`
2. Panel derecho muestra "Mis Tareas" con lista de task lists
3. Selecciona una lista → ve tareas ordenadas por fecha
4. Marca una tarea como completada → checkbox animado, tarea tachada
5. Pulsa "+" → modal con título y fecha → tarea aparece en lista y en calendario si tiene fecha
6. Icono papelera → confirma → tarea eliminada
7. Tareas con fecha aparecen en el calendario como eventos amber "📌 Tarea: título"

**Happy Path — Gmail:**
1. Jennifer abre `/dashboard/email`
2. Lista de hilos carga inmediatamente (sin "Conectando…" largo de IMAP)
3. Sidebar muestra labels: Recibidos, Enviados, Spam, Papelera + labels personales
4. Abre un hilo → drawer muestra todos los mensajes del hilo
5. Pulsa "Archivar" → hilo desaparece de Recibidos
6. Busca "coaching" → resultados instantáneos del servidor Gmail
7. Etiqueta un hilo → label badge aparece en la fila
8. Redacta y envía → SMTP como siempre, sin cambios

---

## Contexto

### Referencias

- `src/actions/google-calendar.ts` — Patrón exacto a replicar: `createAuth()` con `google.auth.OAuth2` + `refresh_token`, exports async con try/catch, Zod validation
- `src/features/email/` — Estructura existente a mantener; solo reemplazar `services/imap.ts` por `services/gmail.ts` y actualizar `actions/email.ts`
- `src/features/calendario/components/CalendarioView.tsx` — Donde agregar el panel lateral de tareas; usa FullCalendar con `events` array
- `src/features/calendario/hooks/useCalendario.ts` — Hook de estado del calendario a extender con `taskEvents`
- `googleapis` npm package — ya instalado (usado en google-calendar.ts); Tasks y Gmail son clientes del mismo SDK
- Docs Google Tasks API: `https://developers.google.com/tasks/reference/rest`
- Docs Gmail API threads: `https://developers.google.com/gmail/api/reference/rest/v1/users.threads`

### Arquitectura Propuesta (Feature-First)

```
src/
├── actions/
│   ├── google-calendar.ts          # Sin cambios
│   ├── google-tasks.ts             # NUEVO — CRUD de tasks + task lists (mismo patrón que google-calendar.ts)
│   └── email.ts                    # MODIFICAR — reemplazar listarEmailsBandeja/leerEmailBandeja/eliminarEmailsBandeja
│                                   #             por versiones Gmail API; añadir archivarThread, toggleLeido,
│                                   #             buscarThreads, listarLabels, etiquetarThread
│
├── features/
│   ├── calendario/
│   │   ├── components/
│   │   │   ├── CalendarioView.tsx  # MODIFICAR — layout flex con panel tareas a la derecha
│   │   │   └── TasksPanel.tsx      # NUEVO — panel lateral de tareas
│   │   ├── hooks/
│   │   │   └── useCalendario.ts    # MODIFICAR — aceptar taskEvents como prop/merge en events array
│   │   └── types/index.ts          # MODIFICAR — añadir TaskList, Task types
│   │
│   └── email/
│       ├── services/
│       │   ├── imap.ts             # DEPRECAR (mantener archivo, no llamar más)
│       │   └── gmail.ts            # NUEVO — wrappers sobre googleapis gmail v1
│       ├── store/
│       │   └── emailStore.ts       # MODIFICAR — reemplazar FolderType/ImapFolder por GmailLabel
│       ├── types/
│       │   └── index.ts            # MODIFICAR — reemplazar ImapFolder/FolderType por GmailThread, GmailMessage, GmailLabel
│       └── components/
│           └── BandejaInbox.tsx    # MODIFICAR — adaptar a threads + nuevas acciones (archivar, etiquetar, buscar)
│           └── EmailDrawer.tsx     # MODIFICAR — mostrar todos los mensajes del hilo (expandible)
```

### Modelo de Datos (solo tipos, sin BD nueva)

```typescript
// types/index.ts — nuevos tipos Gmail
export type GmailLabel = {
  id: string           // ej: "INBOX", "SENT", "Label_123"
  name: string         // ej: "Recibidos", "Mi etiqueta"
  type: 'system' | 'user'
  unread: number
}

export type GmailThread = {
  id: string
  snippet: string
  subject: string
  from: string
  date: Date
  unread: boolean
  labels: string[]     // label IDs
  messageCount: number
}

export type GmailMessage = {
  id: string
  from: string
  to: string
  date: Date
  subject: string
  bodyHtml: string | null
  bodyText: string | null
  unread: boolean
}

// types de Google Tasks
export type TaskList = {
  id: string
  title: string
}

export type Task = {
  id: string
  title: string
  status: 'needsAction' | 'completed'
  due: string | null    // ISO date string
  notes: string | null
}
```

### Detalles técnicos clave

**Autenticación Google Tasks/Gmail:**
```typescript
// mismo patrón que google-calendar.ts
function createAuth() {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  )
  auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })
  return auth
}
// google.tasks({ version: 'v1', auth: createAuth() })
// google.gmail({ version: 'v1', auth: createAuth() })
```

**Gmail API — decodificar body:**
Los mensajes de Gmail tienen el body en `data` como base64url. Hay que decodificar con `Buffer.from(data, 'base64url').toString('utf-8')`. El HTML viene en `parts` (multipart/alternative) → buscar `mimeType: 'text/html'` recursivamente.

**Tareas en calendario — color amber:**
Las task-events se inyectan en FullCalendar con `color: '#f59e0b'` y `classNames: ['fc-task-event']` para distinguirlas de eventos normales. Son `editable: false` (no drag).

**Scope de tokens:**
El token actual ya tiene `tasks` y `gmail.modify`. No se necesita reautorizar.

---

## Blueprint (Assembly Line)

> IMPORTANTE: Solo definir FASES. Las subtareas se generan al entrar a cada fase siguiendo el bucle agéntico.

### Fase 1: Google Tasks — Server Actions
**Objetivo**: Crear `src/actions/google-tasks.ts` con todas las operaciones CRUD sobre Google Tasks API usando el mismo patrón de `google-calendar.ts`. Cubrir: listar task lists, listar tareas de una lista, crear tarea, completar/descompletar tarea, eliminar tarea.
**Validación**: Ejecutar `npm run typecheck` sin errores; las acciones exportan tipos correctos.

### Fase 2: TasksPanel — Componente UI
**Objetivo**: Crear `src/features/calendario/components/TasksPanel.tsx` — panel lateral con selector de lista, lista de tareas con checkbox, botón crear (modal inline), botón eliminar. Integrar en `CalendarioView.tsx` como columna derecha (oculta en móvil, visible en lg+).
**Validación**: El panel aparece a la derecha del calendario en desktop; las tareas se listan y se pueden marcar como completadas visualmente.

### Fase 3: Tareas con fecha → eventos en calendario
**Objetivo**: Cargar tareas con `due` date desde la task list activa y merge-arlas en el array `events` de FullCalendar con color amber y sin edición. Actualizar `useCalendario.ts` para aceptar `taskEvents` y combinarlos.
**Validación**: Una tarea con fecha aparece en el día correcto del calendario con color amber y prefijo "📌".

### Fase 4: Gmail API — Servicio y tipos
**Objetivo**: Crear `src/features/email/services/gmail.ts` con funciones: `listarThreads(labelId, q?)`, `leerThread(threadId)`, `modificarThread(threadId, addLabels, removeLabels)`, `eliminarThread(threadId)`, `listarLabels()`. Actualizar tipos en `src/features/email/types/index.ts` a `GmailThread`, `GmailMessage`, `GmailLabel`.
**Validación**: `npm run typecheck` pasa; los tipos exportados son coherentes.

### Fase 5: Gmail API — Server Actions en email.ts
**Objetivo**: Reemplazar en `src/actions/email.ts` las funciones IMAP (`listarEmailsBandeja`, `leerEmailBandeja`, `eliminarEmailsBandeja`, `listarCarpetasImap`) por versiones Gmail API. Añadir nuevas acciones: `archivarThread`, `toggleLeidoThread`, `buscarThreads`, `listarLabelsGmail`, `etiquetarThread`. El SMTP (`enviarEmail`, `reintentarEmail`) NO se toca.
**Validación**: Las nuevas acciones compilan sin errores; las funciones IMAP antiguas pueden eliminarse o dejarse con comentario `// DEPRECATED`.

### Fase 6: BandejaInbox — Migración a Gmail API
**Objetivo**: Actualizar `BandejaInbox.tsx` para usar `GmailThread` en lugar de `EmailMessage`: mostrar snippet, labels badge, número de mensajes en hilo. Añadir botones "Archivar" y "Leído/No leído" en cada fila. Sidebar usa `GmailLabel` en lugar de `ImapFolder`. Buscar llama a `buscarThreads` con query del servidor.
**Validación**: La bandeja carga threads reales de Gmail; archivar y marcar funcionan.

### Fase 7: EmailDrawer — Vista de hilo completo
**Objetivo**: Actualizar `EmailDrawer.tsx` para mostrar todos los mensajes del hilo (`GmailMessage[]`) en acordeón expandible (el último expandido por defecto). Cada mensaje muestra from, fecha, y body HTML sanitizado.
**Validación**: Abrir un hilo con 3 mensajes muestra los 3; el body HTML renderiza correctamente.

### Fase 8: Validación Final
**Objetivo**: Sistema completo funcionando end-to-end en desarrollo.
**Validación**:
- [ ] `npm run typecheck` pasa sin errores
- [ ] `npm run build` exitoso
- [ ] Playwright screenshot confirma panel de tareas visible en calendario
- [ ] Playwright screenshot confirma bandeja Gmail con hilos reales
- [ ] Crear tarea con fecha → aparece en calendario amber
- [ ] Archivar hilo → desaparece de Recibidos
- [ ] Enviar email → sigue usando SMTP (sin regresión)

---

## Aprendizajes (Self-Annealing)

> Esta sección CRECE con cada error encontrado durante la implementación.

### 2026-06-09: No importar server modules en client
- **Error**: Importar `imap.ts` (que usa `imapflow`) desde componentes client causa ChunkLoadError en Turbopack
- **Fix**: Todos los wrappers de googleapis deben estar en `services/gmail.ts` con `import 'server-only'` y solo llamarse desde Server Actions
- **Aplicar en**: `gmail.ts`, `google-tasks.ts` — siempre `'use server'` en actions, `import 'server-only'` en services

---

## Gotchas

> Cosas críticas a tener en cuenta ANTES de implementar

- [ ] **Gmail body es base64url**: `Buffer.from(part.body.data, 'base64url').toString('utf-8')` — NO base64 estándar. El carácter `-` y `_` son diferentes en base64url.
- [ ] **Multipart MIME**: El body HTML puede estar anidado en `parts[].parts[]`. Necesita función recursiva `findHtmlPart(parts)` para localizar `mimeType === 'text/html'`.
- [ ] **Tasks API due date**: El campo `due` es un datetime RFC 3339 pero Tasks ignora la hora (siempre medianoche UTC). Al mostrar en FullCalendar usar solo la parte date (`due.split('T')[0]`).
- [ ] **Task events no editables**: Las tareas inyectadas en FullCalendar deben tener `editable: false` y `id` con prefijo `task-{id}` para distinguirlas de eventos de Google Calendar al hacer click.
- [ ] **gmail.modify scope**: `gmail.modify` permite leer, etiquetar y modificar. NO permite enviar (necesita `gmail.send`). El envío sigue siendo SMTP.
- [ ] **Rate limits Gmail**: `threads.list` tiene límite de 250 por request. Usar `maxResults: 50` para la bandeja y paginación con `pageToken` si se implementa en el futuro.
- [ ] **Sanitizar HTML de Gmail**: Usar `sanitize-html` (ya en proyecto) con la misma config que el IMAP actual para evitar XSS. Gmail puede incluir `<script>` en algunos emails.
- [ ] **emailStore.ts — FolderType obsoleta**: El store usa `FolderType = 'inbox' | 'sent' | ...`. Con Gmail API los labels son strings arbitrarios. Migrar `activeFolder: FolderType` a `activeLabelId: string`.
- [ ] **No romper SMTP**: `enviarEmail`, `reintentarEmail`, `contarEmailsFallidos`, `listarEmailsFallidos` en `email.ts` NO se modifican. Solo las funciones IMAP se reemplazan.

## Anti-Patrones

- NO llamar a Gmail API desde componentes client (siempre via Server Actions)
- NO usar `gmail.users.messages.send` — el envío ES SIEMPRE SMTP via nodemailer
- NO hardcodear label IDs como `"INBOX"` en el cliente — usar las constantes del servidor
- NO omitir `sanitize-html` al renderizar body de emails
- NO crear tabla en Supabase para tareas — Google Tasks es la fuente de verdad
- NO modificar las funciones SMTP/transaccionales existentes

---

*PRP pendiente aprobación. No se ha modificado código.*
