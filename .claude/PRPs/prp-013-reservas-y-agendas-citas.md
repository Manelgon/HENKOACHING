# PRP-013: Sistema de Reservas Nativo + Gestión de Agendas Google Calendar

> **Estado**: PENDIENTE
> **Fecha**: 2026-06-09
> **Proyecto**: Henkoaching — Jennifer Cervera

---

## Objetivo

Construir un sistema de reservas propio integrado con Google Calendar que permita a los clientes de Jennifer reservar sesiones de coaching desde una página pública (`/reservar?tipo=uuid`), mientras Jennifer gestiona los tipos de sesión, su disponibilidad horaria y las agendas de Google Calendar desde el dashboard — todo dentro del módulo de Calendario existente.

## Por Qué

| Problema | Solución |
|----------|----------|
| Jennifer no tiene forma nativa de recibir reservas online de sus clientes | Página pública `/reservar` donde el cliente elige tipo + horario disponible y confirma |
| Los slots disponibles se calculan manualmente sin ver qué tiene en Google Calendar | Disponibilidad = horario laboral configurable menos eventos reales de GCal |
| El panel de agendas GCal es de solo lectura (solo muestra el link externo) | Edición básica inline: título, descripción, duración y disponibilidad horaria via PATCH |
| Al confirmar una reserva no hay evento en Google Calendar ni emails | Creación automática de evento en GCal + emails al cliente y a Jennifer |
| No hay un lugar en el dashboard para ver y gestionar citas propias | Panel `/dashboard/citas` con listado, filtros por estado y acciones confirmar/cancelar |

**Valor de negocio**: Elimina la fricción de coordinar citas por WhatsApp/email. Jennifer tiene un enlace por tipo de sesión que comparte con clientes y todo queda sincronizado automáticamente.

## Qué

### Criterios de Éxito
- [ ] El modal "Agendas de citas" muestra las agendas GCal con campos editables inline (título, descripción, duración, horario semanal)
- [ ] Existe la página pública `/reservar?tipo=uuid` donde el cliente selecciona fecha/hora y confirma reserva sin login
- [ ] La disponibilidad mostrada en `/reservar` excluye eventos existentes en Google Calendar del día seleccionado
- [ ] Al confirmar reserva se crea automáticamente evento en Google Calendar con los datos del cliente
- [ ] El cliente recibe email de confirmación con enlace de cancelación; Jennifer recibe email de nueva reserva
- [ ] `/dashboard/citas` muestra todas las citas con filtro por estado y permite confirmar/cancelar manualmente
- [ ] El modal "Agendas de citas" en el calendario muestra ambas secciones: gestión GCal (parte 1) y tipos de sesión propios (parte 2)
- [ ] `npm run build` pasa sin errores de TypeScript

### Comportamiento Esperado (Happy Path)

**Flujo cliente:**
1. Jennifer comparte el enlace `/reservar?tipo=<uuid-sesion-individual>` con su cliente
2. El cliente ve el nombre, duración y precio de la sesión
3. Selecciona una fecha en el calendario; ve los slots libres calculados
4. Elige un slot, rellena nombre y email, confirma
5. Recibe email con confirmación y enlace único de cancelación (`/reservar/cancelar?token=xxx`)
6. Jennifer recibe email de alerta con los datos del cliente

**Flujo dashboard — panel citas:**
1. Jennifer abre `/dashboard/citas`
2. Ve lista de reservas (pendiente/confirmada/cancelada), puede filtrar
3. Puede confirmar o cancelar una cita manualmente (actualiza estado en BD + el evento GCal si existe)

**Flujo gestión agendas GCal:**
1. Jennifer abre el menú "Agenda de citas" en el calendario
2. Ve dos tabs: "Agendas Google" y "Tipos de sesión"
3. En "Agendas Google" puede editar inline título, descripción, duración y horario semanal de cada agenda GCal, con botón "Abrir en Google Calendar" para config avanzada
4. En "Tipos de sesión" puede crear/editar/activar los tipos de sesión propios (session_types)

---

## Contexto

### Referencias
- `src/actions/google-calendar.ts` — `createAuth()`, `getAppointmentSchedules()` (fetch manual con token), base para PATCH de agendas
- `src/features/calendario/components/CalendarioView.tsx` — Modal "Agendas de citas" existente (`showAgendas` state), punto de extensión principal
- `src/features/calendario/hooks/useCalendario.ts` — Patrón hook optimista para GCal
- `src/lib/email/send.ts` — `sendTransactional()` + nodemailer SMTP ya configurado
- `src/lib/email/templates/candidatura.ts` — Patrón HTML email (wrapper + HEADER + FOOTER)
- `src/lib/supabase/admin.ts` + `src/lib/supabase/server.ts` — Clientes Supabase
- `src/lib/supabase/database.types.ts` — Tipos actuales de BD (bookings y session_types son nuevas)
- `.claude/PRPs/prp-011-calendario-dashboard.md` — Contexto del módulo de calendario

### Arquitectura Propuesta (Feature-First)

```
src/
├── features/
│   ├── calendario/
│   │   └── components/
│   │       ├── CalendarioView.tsx          — MODIFICAR: pasar agendas a AgendasModal
│   │       └── AgendasModal.tsx            — NUEVO: modal con dos tabs (GCal + Tipos sesión)
│   └── reservas/                           — NUEVA FEATURE
│       ├── components/
│       │   ├── ReservaPublicaView.tsx      — Vista pública /reservar
│       │   ├── SlotsGrid.tsx               — Grid de slots disponibles
│       │   └── ReservaForm.tsx             — Formulario nombre+email
│       ├── hooks/
│       │   └── useDisponibilidad.ts        — Calcular slots libres
│       ├── services/
│       │   └── disponibilidad.ts           — Lógica: horario laboral - eventos GCal
│       └── types/
│           └── index.ts
│
├── app/
│   ├── reservar/
│   │   ├── page.tsx                        — Página pública (SSR, params tipo=uuid)
│   │   └── cancelar/
│   │       └── page.tsx                    — Cancelación via token
│   └── (main)/dashboard/
│       └── citas/
│           └── page.tsx                    — Panel de citas para Jennifer
│
├── actions/
│   ├── google-calendar.ts                  — AMPLIAR: patchAppointmentSchedule()
│   └── reservas.ts                         — NUEVO: Server Actions para bookings
│
└── lib/
    └── email/
        └── templates/
            └── reserva.ts                  — NUEVO: templates confirmación y alerta
```

### Modelo de Datos

```sql
-- Tipos de sesión de Jennifer
CREATE TABLE session_types (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      TEXT NOT NULL,
  duracion    INTEGER NOT NULL,           -- minutos
  precio      NUMERIC(10,2),
  descripcion TEXT,
  activo      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE session_types ENABLE ROW LEVEL SECURITY;
-- Solo admin puede gestionar tipos; lectura pública para /reservar
CREATE POLICY "admin_all" ON session_types FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "public_read_activo" ON session_types FOR SELECT USING (activo = TRUE);

-- Reservas de clientes
CREATE TABLE bookings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_type_id     UUID REFERENCES session_types(id) ON DELETE SET NULL,
  cliente_nombre      TEXT NOT NULL,
  cliente_email       TEXT NOT NULL,
  fecha_hora          TIMESTAMPTZ NOT NULL,
  estado              TEXT NOT NULL DEFAULT 'pendiente'
                        CHECK (estado IN ('pendiente','confirmada','cancelada')),
  google_event_id     TEXT,
  token_cancelacion   TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
  notas_internas      TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
-- Solo admin puede leer/editar todo; inserción pública para la reserva
CREATE POLICY "admin_all"     ON bookings FOR ALL   USING (auth.role() = 'authenticated');
CREATE POLICY "public_insert" ON bookings FOR INSERT WITH CHECK (TRUE);
-- Cancelación por token: se gestiona desde Server Action con service_role (sin policy)
```

### Lógica de Disponibilidad

```
horario_laboral[diaSemana] = { inicio: "09:00", fin: "18:00" }  -- configurable en ajustes o session_type
slots_posibles = generar cada N minutos (duracion del tipo) dentro del horario
eventos_gcal = getCalendarEventsRange(fechaSeleccionada 00:00 → 23:59)
slots_libres = slots_posibles.filter(slot => no solapan con ningún evento GCal)
```

El horario laboral se almacena en `ajustes` (tabla existente) como JSON bajo la clave `horario_laboral`, o en una tabla `horario_laboral` si se prefiere más estructura.

### API Google Calendar — Appointment Schedules PATCH

```
PATCH https://www.googleapis.com/calendar/v3/users/me/appointmentSchedules/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "...",
  "description": "...",
  "appointmentDuration": { "minutes": 60 },
  "schedulingWindow": {
    "weeklyAvailability": [
      { "dayOfWeek": "MONDAY", "startTime": "09:00", "endTime": "18:00" }
    ]
  }
}
```

Referencia: https://developers.google.com/calendar/api/v3/reference/appointmentSchedules/patch

---

## Blueprint (Assembly Line)

> Solo se definen FASES. Las subtareas se generan al entrar a cada fase con el bucle agéntico.

### Fase 1: Modelo de Datos — Supabase
**Objetivo**: Crear las tablas `session_types` y `bookings` con RLS correcto, migración aplicada y tipos TypeScript regenerados.
**Validación**: `mcp__claude_ai_Supabase__list_tables` muestra las dos tablas; `mcp__claude_ai_Supabase__generate_typescript_types` produce tipos correctos en `database.types.ts`.

### Fase 2: Server Actions de Reservas
**Objetivo**: `src/actions/reservas.ts` con todas las acciones necesarias: crear reserva, cancelar por token, listar bookings (admin), confirmar/cancelar booking (admin). Validación Zod en todas las entradas.
**Validación**: `npm run typecheck` pasa; funciones testables desde la consola.

### Fase 3: Ampliación google-calendar.ts — PATCH Agendas
**Objetivo**: Añadir `patchAppointmentSchedule(id, data)` a `google-calendar.ts` que llame al endpoint REST PATCH con los campos editables (título, descripción, duración, disponibilidad semanal). Tipado completo.
**Validación**: `npm run typecheck` pasa; función invocable desde Server Action.

### Fase 4: Templates de Email de Reservas
**Objetivo**: `src/lib/email/templates/reserva.ts` con dos templates: `templateReservaCliente` (confirmación + enlace cancelación) y `templateReservaJennifer` (alerta nueva reserva). Mismo patrón estético que `candidatura.ts`.
**Validación**: Templates renderizan HTML válido; `npm run typecheck` pasa.

### Fase 5: Modal Agendas — Refactor + Edición GCal
**Objetivo**: Extraer el panel "Agendas de citas" de `CalendarioView.tsx` a `AgendasModal.tsx` con dos tabs. Tab "Agendas Google": lista las agendas GCal con campos editables inline (título, descripción, duración, horario semanal por día) + botón "Abrir en Google Calendar". Tab "Tipos de sesión": CRUD de `session_types` (crear, editar nombre/duración/precio, activar/desactivar) con enlace copiable a `/reservar?tipo=uuid`.
**Validación**: El modal se abre desde el menú "Agenda de citas" del calendario; se pueden editar campos y ver los cambios reflejados.

### Fase 6: Lógica de Disponibilidad
**Objetivo**: `src/features/reservas/services/disponibilidad.ts` con la función `calcularSlotsLibres(sessionTypeId, fecha)` que genera slots cada N minutos según duración del tipo, consulta el horario laboral configurable y descuenta los eventos reales de GCal del día.
**Validación**: Función retorna array de slots `{ inicio: string; fin: string; disponible: boolean }` coherentes con los eventos de GCal.

### Fase 7: Página Pública `/reservar`
**Objetivo**: `src/app/reservar/page.tsx` (SSR) que lee `?tipo=uuid`, carga el `session_type`, muestra un calendariito para elegir fecha, llama a la lógica de disponibilidad para el día seleccionado, y renderiza `SlotsGrid` + `ReservaForm`. Al confirmar, llama a la Server Action que crea la reserva, crea el evento en GCal y envía los dos emails. Página completamente pública sin login.
**Validación**: Se puede completar una reserva de principio a fin; el evento aparece en Google Calendar; ambos emails llegan (visible en `email_envios` en Supabase).

### Fase 8: Página de Cancelación `/reservar/cancelar`
**Objetivo**: `src/app/reservar/cancelar/page.tsx` que recibe `?token=xxx`, busca la reserva, muestra un botón de confirmación y al confirmar cancela la reserva (estado → cancelada) y elimina el evento de GCal si `google_event_id` existe.
**Validación**: El enlace del email de confirmación cancela correctamente la reserva y elimina el evento de GCal.

### Fase 9: Panel Dashboard `/dashboard/citas`
**Objetivo**: `src/app/(main)/dashboard/citas/page.tsx` con tabla de reservas (SSR prefetch), filtros por estado (todas/pendiente/confirmada/cancelada), y acciones inline para confirmar o cancelar cada cita manualmente. Misma estética que el resto del dashboard.
**Validación**: El panel muestra las reservas correctamente filtradas; confirmar/cancelar actualiza el estado en tiempo real.

### Fase 10: Validación Final
**Objetivo**: Sistema funcionando end-to-end, sin errores de tipos ni build.
**Validación**:
- [ ] `npm run typecheck` pasa sin errores
- [ ] `npm run build` exitoso
- [ ] Flujo completo de reserva verificado (Playwright screenshot de `/reservar?tipo=<id>`)
- [ ] Flujo de cancelación verificado
- [ ] Panel `/dashboard/citas` muestra y gestiona citas
- [ ] Modal "Agendas de citas" edita agendas GCal y muestra tipos de sesión
- [ ] Emails de reserva y alerta registrados en `email_envios`

---

## Gotchas

- [ ] **appointmentSchedules API requiere permiso `https://www.googleapis.com/auth/calendar`** — el token de refresh ya lo tiene para eventos, verificar que el scope incluya el recurso `appointmentSchedules` antes de hacer el PATCH
- [ ] **`token_cancelacion` no debe usarse como PK ni query param filtrable en Supabase con anon key** — la cancelación debe ir por Server Action con `createAdminClient()` (service_role) para evitar exponer la tabla con policy pública de SELECT
- [ ] **Zona horaria**: toda la lógica de slots usa `Europe/Madrid`; `getCalendarEventsRange` también; mantener consistencia al comparar ISO strings
- [ ] **No importar módulos server (`server-only`) en componentes client** — patrón ya documentado en MEMORY (`reference/no-import-server-modules-in-client.md`)
- [ ] **CalendarioView.tsx es client component** — el refactor del modal debe extraerlo como componente separado pero seguir siendo client; los datos de agendas se cargan con `useEffect` + Server Action (ya existe el patrón con `getAppointmentSchedules`)
- [ ] **`session_types` es pública (lectura de activos)** — la política RLS de SELECT sin `auth.role()` exige `USING (activo = TRUE)` para no exponer sesiones inactivas
- [ ] **Formulario `/reservar` no tiene login** — validación solo por Zod en Server Action; no RLS de usuario; la inserción pública en `bookings` es deliberada
- [ ] **Horario laboral configurable** — si se guarda en tabla `ajustes` como JSON, usar `createAdminClient` para leerlo desde la ruta pública `/reservar` (anon key no tiene acceso a `ajustes`)

## Anti-Patrones

- NO crear un calendario visual complejo en `/reservar` — usar un date picker simple (nativo HTML o componente ligero)
- NO duplicar la lógica de disponibilidad entre servidor y cliente — calcularla siempre en servidor
- NO hardcodear el email de Jennifer — leerlo de `email_settings` o de una variable de entorno
- NO omitir validación Zod en Server Actions de `/reservar` (input público no confiable)
- NO usar `any` — tipar correctamente el response de la API de appointmentSchedules

---

## Aprendizajes (Self-Annealing)

> Se poblará durante la implementación.

---

*PRP-013 pendiente aprobación. No se ha modificado código.*
