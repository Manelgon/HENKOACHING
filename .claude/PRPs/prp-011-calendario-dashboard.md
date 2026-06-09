# PRP-011: Calendario Dashboard — Vista completa con Google Calendar

> **Estado**: PENDIENTE
> **Fecha**: 2026-06-09
> **Proyecto**: Henkoaching

---

## Objetivo

Crear la página `/dashboard/calendario` con una vista de calendario completa (mes/semana/día) bidireccional con Google Calendar: Jennifer puede crear, editar, eliminar y reorganizar eventos directamente desde el dashboard, todo sincronizado en tiempo real con su Google Calendar.

## Por Qué

| Problema | Solución |
|----------|----------|
| El widget actual del dashboard es solo lectura (8 eventos próximos, sin crear ni editar) | Vista completa FullCalendar con todas las operaciones CRUD |
| Para crear/editar se necesita abrir Google Calendar por separado | Gestión completa desde el propio dashboard sin salir |
| El scope `calendar.readonly` no permite escritura | Re-autorización con scope `calendar` (lectura + escritura) |
| No hay drag & drop ni resize de eventos | FullCalendar + plugins `interaction` + `timegrid` lo resuelven nativamente |

**Valor de negocio**: Jennifer gestiona su agenda de coaching desde un único panel, reduciendo fricción y evitando errores de doble agenda.

## Qué

### Criterios de Éxito
- [ ] `/dashboard/calendario` carga y muestra todos los eventos del mes actual desde Google Calendar real
- [ ] Click en un slot vacío abre modal para crear evento (título, fecha/hora inicio, fin, descripción)
- [ ] Click en un evento existente abre modal para editar o eliminar
- [ ] Drag & drop de evento actualiza fecha/hora en Google Calendar
- [ ] Resize de evento (arrastrar borde inferior) actualiza duración en Google Calendar
- [ ] Vistas mes / semana / día intercambiables con botones en la cabecera
- [ ] Estilo visual coherente con el dashboard (font-roxborough, font-raleway, colores henko-*)
- [ ] `npm run build` pasa sin errores TypeScript

### Comportamiento Esperado

**Happy Path — Crear evento:**
1. Jennifer accede a `/dashboard/calendario`
2. El calendario muestra el mes actual con todos sus eventos de Google Calendar
3. Hace click en un día/hora del slot vacío
4. Se abre un modal con formulario: Título (requerido), Fecha/hora inicio (pre-rellenada), Fecha/hora fin, Descripción (opcional)
5. Pulsa "Guardar" → Server Action llama a `calendar.events.insert` → evento aparece en el calendario y en Google Calendar

**Happy Path — Editar evento:**
1. Click sobre un evento existente
2. Modal se abre con datos pre-cargados
3. Edita campo(s) → Pulsa "Guardar" → Server Action llama a `calendar.events.patch`

**Happy Path — Eliminar evento:**
1. Click sobre evento → Modal abierto → Click "Eliminar"
2. Confirmación → Server Action llama a `calendar.events.delete` → evento desaparece del calendario

**Happy Path — Mover evento:**
1. Drag & drop de evento a nueva fecha/hora
2. FullCalendar dispara callback `eventDrop` → Server Action llama a `calendar.events.patch` con nuevas fechas

**Happy Path — Resize evento:**
1. Arrastrar borde inferior del evento
2. Callback `eventResize` → Server Action `calendar.events.patch` con nuevo `end`

---

## Contexto

### Referencias
- `src/actions/google-calendar.ts` — Server Action existente con `getCalendarEvents` (readonly). Se amplía aquí con operaciones de escritura
- `src/features/dashboard/components/CalendarWidget.tsx` — Widget actual de próximos eventos (solo lectura, se mantiene en el dashboard principal)
- `src/app/(main)/dashboard/page.tsx` — Patrón de página dashboard: `DashboardShell` implícito, `font-roxborough` títulos, cards `rounded-[2rem] border border-gray-100`
- Docs FullCalendar React: https://fullcalendar.io/docs/react
- Docs Google Calendar API Events: https://developers.google.com/calendar/api/v3/reference/events

### Arquitectura Propuesta (Feature-First)

```
src/features/calendario/
├── components/
│   ├── CalendarioView.tsx        # Componente client con FullCalendar
│   ├── EventoModal.tsx           # Modal crear/editar evento (Zod validation)
│   └── CalendarioToolbar.tsx     # Cabecera con vistas + navegación mes/sem/día
├── hooks/
│   └── useCalendario.ts          # Estado local: eventos, modal open/close, optimistic updates
├── services/
│   └── calendar-api.ts           # Wrappers para llamar a las Server Actions
└── types/
    └── index.ts                   # CalendarEvent extendido, EventoFormData, ModalState
```

```
src/app/(main)/dashboard/calendario/
└── page.tsx                       # Server Component: carga eventos iniciales, renderiza CalendarioView
```

```
src/actions/google-calendar.ts     # Añadir: createCalendarEvent, updateCalendarEvent, deleteCalendarEvent
```

### Dependencias npm a instalar

```bash
npm install @fullcalendar/react @fullcalendar/core @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction @fullcalendar/list
```

| Paquete | Propósito |
|---------|-----------|
| `@fullcalendar/react` | Wrapper React de FullCalendar |
| `@fullcalendar/daygrid` | Vista mensual (cuadrícula de días) |
| `@fullcalendar/timegrid` | Vistas semana/día con línea de tiempo |
| `@fullcalendar/interaction` | Drag & drop + resize + selección de slots |
| `@fullcalendar/list` | Vista agenda (lista de próximos eventos) — opcional |

### Re-autorización Google OAuth

El `GOOGLE_REFRESH_TOKEN` actual fue generado con scope `calendar.readonly`. Para escritura hay que regenerarlo con scope `https://www.googleapis.com/auth/calendar`.

**Proceso (manual, una vez):**
1. Generar URL de autorización con scope `calendar` (no `calendar.readonly`)
2. Jennifer/Manel autoriza → obtiene nuevo `refresh_token`
3. Actualizar `GOOGLE_REFRESH_TOKEN` en `.env.local` y en Vercel

El script de generación de token se crea en `scripts/get-google-token.mjs` y se documenta en el PRP. No afecta a la producción actual hasta que se reemplace el token.

### Modelo de Datos

No hay modelo en Supabase. Todos los eventos viven exclusivamente en Google Calendar. El flujo es:

```
FullCalendar (UI) ↔ Server Actions ↔ Google Calendar API
```

### Patrón de Server Actions

```typescript
// src/actions/google-calendar.ts (ampliado)

export async function createCalendarEvent(data: CreateEventInput): Promise<CalendarEvent>
export async function updateCalendarEvent(id: string, data: UpdateEventInput): Promise<CalendarEvent>
export async function deleteCalendarEvent(id: string): Promise<void>
export async function getCalendarEventsRange(from: Date, to: Date): Promise<CalendarEvent[]>
```

`getCalendarEventsRange` reemplaza a `getCalendarEvents` para el calendario completo (rango configurable según la vista activa).

### Validación Zod

```typescript
const CreateEventSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200),
  start: z.string().datetime(),
  end: z.string().datetime(),
  description: z.string().max(2000).optional(),
  location: z.string().max(300).optional(),
})
```

---

## Blueprint (Assembly Line)

> Solo FASES. Las subtareas se generan just-in-time al entrar en cada fase.

### Fase 1: Dependencias + Re-autorización Google OAuth
**Objetivo**: Instalar paquetes FullCalendar, crear script de re-autorización OAuth con scope `calendar` (lectura+escritura), documentar el proceso para que Manel pueda ejecutarlo y obtener el nuevo `GOOGLE_REFRESH_TOKEN`.
**Validación**: `package.json` contiene los 5 paquetes FullCalendar; existe `scripts/get-google-token.mjs` con instrucciones claras; `npm run build` no rompe.

### Fase 2: Ampliar Server Actions de Google Calendar
**Objetivo**: Añadir a `src/actions/google-calendar.ts` las funciones `createCalendarEvent`, `updateCalendarEvent`, `deleteCalendarEvent` y `getCalendarEventsRange` con validación Zod y tipado correcto.
**Validación**: `npm run typecheck` pasa; las 4 funciones están exportadas con tipos correctos; errores de API son capturados y relanzados con mensajes descriptivos.

### Fase 3: Feature calendario — tipos, hooks y servicios
**Objetivo**: Crear la estructura `src/features/calendario/` con los tipos, el hook `useCalendario` (estado de eventos, modal, optimistic updates) y el servicio que llama a las Server Actions.
**Validación**: TypeScript sin errores; el hook gestiona correctamente el estado `events`, `modalState`, `isLoading`; los optimistic updates revierten en caso de error.

### Fase 4: Componentes UI — CalendarioView + EventoModal
**Objetivo**: Construir `CalendarioView.tsx` (FullCalendar con plugins daygrid/timegrid/interaction, estilo henko) y `EventoModal.tsx` (formulario crear/editar con validación Zod, colores y tipografía del design system).
**Validación**: El calendario renderiza sin errores en client-side; el modal abre con datos pre-cargados al editar; drag & drop y resize disparan callbacks correctamente; estilo coherente con el dashboard.

### Fase 5: Página `/dashboard/calendario`
**Objetivo**: Crear `src/app/(main)/dashboard/calendario/page.tsx` como Server Component que carga los eventos del mes actual como initial state y renderiza `CalendarioView`. Añadir enlace en la navegación del dashboard.
**Validación**: La ruta `/dashboard/calendario` carga sin errores 500; muestra eventos reales de Google Calendar; la navegación del sidebar incluye el enlace.

### Fase 6: Validación Final
**Objetivo**: Sistema funcionando end-to-end con las 5 operaciones (leer, crear, editar, eliminar, mover/resize).
**Validación**:
- [ ] `npm run typecheck` pasa sin errores
- [ ] `npm run build` exitoso
- [ ] Playwright screenshot confirma que el calendario renderiza con eventos
- [ ] Crear un evento de prueba → aparece en Google Calendar real
- [ ] Mover un evento → fecha actualizada en Google Calendar
- [ ] Eliminar el evento de prueba → desaparece del calendario

---

## Gotchas

- [ ] **FullCalendar requiere `dynamic import` o `'use client'`** — sus paquetes usan APIs de browser (DOM). Todo el árbol de FullCalendar debe estar en componentes client. El Server Component solo pasa `initialEvents` como prop.
- [ ] **El `GOOGLE_REFRESH_TOKEN` actual es readonly** — NO intentar crear/editar eventos hasta que se haya reemplazado con el nuevo token (scope `calendar`). Las Server Actions de escritura fallarán con 403 hasta entonces.
- [ ] **FullCalendar CSS** — importar `@fullcalendar/common/main.css` o los CSS de cada plugin. En Next.js 16 con Turbopack, verificar que el import de CSS no rompa el build.
- [ ] **getCalendarEventsRange para vistas distintas** — la vista mensual necesita eventos de todo el mes (no solo futuros). Pasar `timeMin` y `timeMax` dinámicos según el rango visible de FullCalendar (callback `datesSet`).
- [ ] **Optimistic updates** — actualizar el estado local de FullCalendar antes de confirmar con la API para UX fluida; revertir si la Server Action falla.
- [ ] **Zona horaria** — Google Calendar devuelve fechas en ISO 8601. FullCalendar maneja timezone nativo; configurar `timeZone: 'Europe/Madrid'` en la instancia.
- [ ] **No hay Supabase en esta feature** — zero DB. Todo es Google Calendar API. No añadir RLS ni tablas.

## Anti-Patrones

- NO crear Server Components dentro de la carpeta `features/calendario/components/` — FullCalendar es puramente client-side
- NO ignorar errores de TypeScript
- NO hardcodear calendarId (usar constante `'primary'`)
- NO omitir validación Zod en los inputs del modal antes de llamar a la Server Action
- NO hacer `any` en los tipos de eventos de FullCalendar — usar `EventInput` del paquete `@fullcalendar/core`
- NO reutilizar `getCalendarEvents` (retorna solo 8 eventos próximos) para el calendario completo — usar la nueva `getCalendarEventsRange`

---

## Aprendizajes (Self-Annealing)

> Esta sección crece durante la implementación.

---

*PRP pendiente aprobación. No se ha modificado código.*
