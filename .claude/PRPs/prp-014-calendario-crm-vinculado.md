# PRP-014: Calendario vinculado al CRM (citas e historial)

> **Estado**: IMPLEMENTADO (2026-06-10) — typecheck y build OK; QA visual en navegador pendiente (sesión bloqueada por setup MFA)
> **Fecha**: 2026-06-10
> **Proyecto**: Henkoaching — Panel de Jennifer Cervera

---

## Objetivo

Conectar el calendario con el CRM en ambas direcciones: (a) cada Lead, Cliente y Candidato muestra su historial de citas y tareas en su ficha de detalle, y (b) desde el propio calendario se puede **opcionalmente** vincular un evento o tarea a un lead/cliente/candidato existente, eligiendo tipo de cita y usando automáticamente el email guardado en la BD para la invitación de Google Calendar. **La vinculación es siempre opcional: el calendario sigue permitiendo crear eventos y tareas sueltos, sin relacionar con nadie, exactamente como hoy.**

## Por Qué

| Problema | Solución |
|----------|----------|
| Las citas agendadas via "Agendar cita" solo viven en Google Calendar; en la ficha del contacto no queda rastro consultable | Tabla `citas` propia: cada cita/tarea agendada se persiste y se muestra como historial en el detalle del recurso |
| Desde el calendario, Jennifer tiene que teclear a mano el título y el email del invitado, con riesgo de error | Selector de contacto (opcional) en el modal del calendario: busca en leads/clientes/candidatos, autocompone el título y usa el email de la BD |
| El flujo "Agendar cita" existe en tablas y detalles, pero no desde el calendario, que es donde Jennifer mira su disponibilidad | El modal de evento del calendario replica el patrón `agendarCita` (tipo + vinculación + invitación + tarea de seguimiento) sin perder el flujo libre actual |
| `TIPOS_CITA_*` / `TIPOS_TAREA_*` están duplicados en 7 ficheros | Constantes centralizadas en un único módulo compartido, keyed por tipo de recurso |

**Valor de negocio**: Jennifer trabaja con el calendario delante; poder agendar desde ahí sin salir, sin copiar emails a mano, y ver luego en cada ficha qué citas hubo y habrá, reduce errores de invitación y le da trazabilidad comercial (cuántas sesiones/llamadas ha tenido cada lead o cliente).

## Qué

### Criterios de Éxito
- [ ] En el detalle de Cliente y de Candidato hay una pestaña "Citas" con el historial (próximas y pasadas) y botón para agendar una nueva
- [ ] En el drawer de Lead hay una sección equivalente de historial de citas
- [ ] Toda cita creada via `agendarCita` (desde tablas, detalles o calendario) queda registrada en la BD y aparece en el historial del recurso
- [ ] En el modal de crear evento del calendario se puede buscar y seleccionar un lead/cliente/candidato; al hacerlo aparece el desplegable de tipo de cita, el título se autocompone "{Tipo} con {nombre}" y la invitación usa el email de la BD (toggle invitar + Meet)
- [ ] La pestaña Tarea del mismo modal permite igualmente vincular contacto y elegir tipo de tarea; la tarea vinculada también aparece en el historial del recurso
- [ ] **Crear un evento/tarea SIN vincular contacto sigue funcionando exactamente igual que hoy** (título libre, invitados manuales, sin registro en historial): la vinculación es un añadido opcional, no un requisito
- [ ] `npm run typecheck` y `npm run build` pasan

### Comportamiento Esperado

**Desde el calendario, con vínculo (happy path)**: Jennifer hace click en un hueco del calendario → se abre `EventoModal` con la franja preseleccionada → en la fila "Vincular contacto" escribe "Mar..." → el buscador muestra resultados agrupados (Leads / Clientes / Candidatos) con nombre y email → selecciona "María García (cliente)" → aparece el desplegable TIPO con los tipos de cita de cliente ("Sesión de coaching", "Llamada"…) → el título se autocompone "Sesión de coaching con María García" (editable eligiendo "Otro") → el toggle "Invitar por email + Google Meet" muestra el email de María leído de la BD → Guardar → se crea el evento en Google Calendar con invitación + Meet, se persiste la cita en la tabla `citas`, y se escribe el audit log. El evento aparece en el calendario al instante. El vínculo puede quitarse antes de guardar (botón ×), volviendo al modo libre.

**Desde el calendario, sin vínculo**: Jennifer hace click en un hueco, escribe un título libre ("Médico", "Comida con Ana"), añade invitados a mano si quiere, y guarda. Flujo idéntico al actual: ni tipo de cita, ni registro en `citas`, ni audit log.

**Desde la ficha (happy path)**: Jennifer abre el detalle de María → pestaña "Citas" → ve la lista: próxima "Sesión de coaching — mañana 10:00 (invitada ✓)" y el histórico anterior → pulsa "Agendar cita" → se abre el `AgendarCitaModal` ya existente → al guardar, la lista se refresca.

**Tareas**: en la pestaña Tarea del modal del calendario, al vincular un contacto (opcional, igual que en eventos) aparece el desplegable de tipo de tarea ("Preparar sesión", "Llamar al lead"…), el título se autocompone "{Tipo} — {nombre}", la tarea se crea en Google Tasks y se registra en `citas` con clase `tarea` (Google Tasks no admite invitados; la vinculación es interna). Sin vínculo, la tarea se crea suelta como hoy.

---

## Contexto

### Referencias (código existente investigado)
- `src/actions/citas.ts` — server action genérica `agendarCita` (Calendar + Tasks + audit log). HOY NO persiste en BD: solo `logAction` a `audit_logs`. Es el punto único a extender.
- `src/shared/components/AgendarCitaModal.tsx` — modal reutilizable de agendar (tipo + título autocompuesto + invitar + tarea). Patrón de UX a replicar en `EventoModal`.
- `src/features/calendario/components/EventoModal.tsx` — modal del calendario con tabs Evento/Tarea; hoy llama directo a `createCalendarEvent`/`createTask` con invitados escritos a mano. Ese camino se conserva intacto para eventos sin vínculo.
- `src/features/calendario/hooks/useCalendario.ts` — `handleCreate` optimista; habrá que enrutar a `agendarCita` solo cuando hay contacto vinculado.
- `src/features/clientes/components/ClienteDetalleLayout.tsx` — tabs `'facturas' | 'empleo' | 'archivos' | 'notas'` con `useUrlState`; patrón a seguir para la pestaña "Citas".
- `src/features/candidatos/components/CandidatoDetalleLayout.tsx` — tabs `'trayectoria' | 'solicitudes' | 'notas'`.
- `src/features/leads/components/LeadDrawer.tsx` — drawer del lead (sin tabs; el historial irá como sección).
- `src/lib/audit/log-action.ts` + tabla `audit_logs` — registro existente de `*.agendar_cita` (no sirve como historial de negocio: metadata insuficiente y es un log, no datos).
- `src/actions/candidatos-admin.ts` — el email del candidato vive en `profiles` (join `candidato_profiles.user_id → profiles.id`), NO en `candidato_profiles`.
- `.claude/memory/reference/agendar-cita-reutilizable.md` — patrón documentado; actualizar al cerrar este PRP.
- Constantes duplicadas hoy en 7 ficheros: `LeadsTable`, `LeadDrawer`, `ClientesTable`, `ClienteDetalleLayout`, `CandidatosTable`, `CandidatoDetalleLayout`, `AdminSolicitudes`.

### Arquitectura Propuesta

```
src/
├── shared/
│   ├── lib/tipos-cita.ts            # NUEVO: TIPOS_CITA / TIPOS_TAREA por recurso ('lead'|'cliente'|'candidato'|'solicitud')
│   └── components/
│       ├── AgendarCitaModal.tsx     # sin cambios funcionales (consume tipos centralizados)
│       └── CitasHistorial.tsx       # NUEVO: lista de citas/tareas de un recurso + botón "Agendar cita"
├── actions/
│   ├── citas.ts                     # EXTENDER: agendarCita persiste en tabla citas;
│   │                                #   + getCitasByRecurso(recursoTipo, recursoId)
│   │                                #   + buscarContactos(query) → leads ∪ clientes ∪ candidatos (admin only)
│   │                                #   + crearTareaVinculada (Tasks + registro en citas, clase 'tarea')
├── features/
│   ├── calendario/components/EventoModal.tsx   # EXTENDER: fila opcional "Vincular contacto" + tipo de cita/tarea
│   ├── clientes/components/ClienteDetalleLayout.tsx     # tab 'citas'
│   ├── candidatos/components/CandidatoDetalleLayout.tsx # tab 'citas'
│   └── leads/components/LeadDrawer.tsx          # sección historial de citas
```

Decisiones clave:
1. **Persistencia propia (tabla `citas`)** en lugar de leer de Google Calendar o de `audit_logs`: el historial debe sobrevivir a borrados en Google, ser filtrable por recurso, y no depender de cuota de API. Es la fuente del historial; Google sigue siendo la fuente de la agenda.
2. **Un solo camino de escritura vinculada, y el camino libre intacto**: `agendarCita` es la única función que crea cita+registro. `EventoModal` con contacto vinculado llama a `agendarCita`; sin contacto, mantiene el flujo actual (`createCalendarEvent`/`createTask` directos, sin registro).
3. **`buscarContactos` es server action admin-only** que busca por nombre/email en `leads` (no archivados), `clientes` (no borrados) y candidatos (`profiles` con `candidato_profiles`), devolviendo `{tipo, id, nombre, email, contexto}` — el mismo shape que `AgendarCitaRecurso`.
4. **Tipos centralizados**: `src/shared/lib/tipos-cita.ts` exporta `TIPOS_CITA: Record<RecursoTipo, string[]>` y `TIPOS_TAREA: …`; los 7 consumidores actuales se refactorizan para importarlos (DRY, y el calendario los necesita dinámicos según el tipo del contacto elegido).

### Modelo de Datos

```sql
-- Migración 019_citas.sql
create table if not exists public.citas (
  id uuid primary key default uuid_generate_v4(),
  recurso_tipo text not null check (recurso_tipo in ('lead','cliente','candidato','solicitud')),
  recurso_id uuid not null,                -- sin FK: apunta a tablas distintas según tipo
  clase text not null default 'cita' check (clase in ('cita','tarea')),
  tipo text,                               -- 'Sesión de coaching', 'Entrevista', … (null si "Otro")
  titulo text not null,
  contacto_nombre text not null,           -- snapshot
  contacto_email text,                     -- snapshot del email usado en la invitación
  start_at timestamptz not null,
  end_at timestamptz,
  invitado boolean not null default false, -- se envió invitación + Meet
  google_event_id text,                    -- clase 'cita'
  calendar_id text,
  google_task_id text,                     -- clase 'tarea'
  task_list_id text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

create index if not exists idx_citas_recurso on public.citas(recurso_tipo, recurso_id, start_at desc);
create index if not exists idx_citas_start on public.citas(start_at desc);

alter table public.citas enable row level security;
-- Solo admin (Jennifer) lee y escribe; mismo patrón que audit_logs/clientes
create policy "Citas: admin todo" on public.citas
  for all using (public.is_admin()) with check (public.is_admin());
```

Notas:
- Los eventos/tareas creados SIN vínculo no generan fila en `citas` (no hay recurso al que asociarlos).
- NO se reutiliza `cliente_sesiones` (registro manual de sesiones realizadas, otro propósito); no mezclar.

---

## Blueprint (Assembly Line)

> Solo FASES. Las subtareas se generan al entrar a cada fase con `/bucle-agentico`.

### Fase 1: Base de datos y tipos centralizados
**Objetivo**: Migración `019_citas.sql` aplicada (tabla + índices + RLS), `schema.sql` sincronizado, y `src/shared/lib/tipos-cita.ts` creado con los 7 consumidores refactorizados para importar de ahí.
**Validación**: tabla visible en Supabase con RLS activa; `npm run typecheck` pasa; las tablas/detalles siguen mostrando los mismos tipos de cita que antes.

### Fase 2: Backend — persistencia y nuevas actions
**Objetivo**: `agendarCita` inserta en `citas` (con `google_event_id` devuelto por `createCalendarEvent`); nuevas actions `getCitasByRecurso`, `buscarContactos` (Zod, admin-only, búsqueda por nombre/email en leads/clientes/candidatos) y `crearTareaVinculada` (Tasks + registro clase `tarea` + audit log).
**Validación**: agendar una cita desde una tabla existente crea fila en `citas`; `buscarContactos('mar')` devuelve resultados de las tres fuentes con email correcto (candidato desde `profiles`).

### Fase 3: Historial de citas en las fichas
**Objetivo**: Componente compartido `CitasHistorial` (próximas/pasadas, distintivo cita vs tarea, invitado sí/no, botón "Agendar cita" que abre `AgendarCitaModal` y refresca). Integrado como pestaña "Citas" en `ClienteDetalleLayout` y `CandidatoDetalleLayout`, y como sección en `LeadDrawer`. Las páginas server de detalle cargan las citas iniciales.
**Validación**: screenshot Playwright de la pestaña Citas en cliente y candidato y de la sección en el drawer de lead; agendar desde ahí refresca la lista.

### Fase 4: Calendario — vincular contacto (opcional) en EventoModal
**Objetivo**: En la pestaña Evento, fila "Vincular contacto" con buscador (debounce sobre `buscarContactos`) y botón × para desvincular; al seleccionar: desplegable de tipo de cita según el recurso, título autocompuesto "{Tipo} con {nombre}" (editable con "Otro"), email del contacto en invitados con toggle Meet, y submit enrutado a `agendarCita` con refresco del calendario. En la pestaña Tarea: mismo selector + tipo de tarea + submit a `crearTareaVinculada`. Sin contacto vinculado, ambos flujos quedan EXACTAMENTE como hoy (regresión cero).
**Validación**: crear evento vinculado desde el calendario → evento en Google con invitación al email de la BD + fila en `citas` visible en la ficha del contacto; crear evento y tarea sin vínculo → comportamiento idéntico al actual y sin fila en `citas`.

### Fase 5: Validación final
**Objetivo**: Sistema funcionando end-to-end.
**Validación**:
- [ ] `npm run typecheck` pasa
- [ ] `npm run build` exitoso
- [ ] Playwright: flujo calendario→ficha (con y sin vínculo) y ficha→calendario verificados con screenshots
- [ ] Criterios de éxito cumplidos
- [ ] Memoria `agendar-cita-reutilizable.md` actualizada con el nuevo patrón

---

## 🧠 Aprendizajes (Self-Annealing / Neural Network)

> Esta sección CRECE con cada error encontrado durante la implementación.

### 2026-06-10: No existe `npm run typecheck` en este repo
- **Error**: el PRP asumía `npm run typecheck`; el package.json solo tiene dev/build/start/lint
- **Fix**: usar `npx tsc --noEmit`
- **Aplicar en**: todas las validaciones de este proyecto

### 2026-06-10: El MCP de Supabase de claude.ai no ve este proyecto
- **Error**: `apply_migration` del MCP claude.ai devuelve "You do not have permission" (otra cuenta/org); el MCP local de `.mcp.json` no estaba conectado en la sesión
- **Fix**: aplicar SQL via Management API con el `SUPABASE_ACCESS_TOKEN` de `.env.local`: `POST https://api.supabase.com/v1/projects/cardgrqwqktjsssodtzp/database/query` y registrar a mano la fila en `supabase_migrations.schema_migrations`
- **Aplicar en**: cualquier migración futura de este proyecto cuando el MCP local no esté disponible

### 2026-06-10: Decisiones de implementación que difieren del plan
- **CitasHistorial es autosuficiente** (carga sus citas con useEffect al montar) en vez de recibir citas iniciales desde las páginas server: menos superficie tocada y datos siempre frescos al abrir la pestaña.
- **agendarCita devuelve `evento`** (el CalendarEvent creado) para que `useCalendario.handleCreate` pueda reemplazar el evento optimista sin refetch.
- **EventoModal pasaba de 500 líneas**: se extrajeron `EventoModalUI.tsx` (Row + iconos) y `VinculoTipoSelect`/`VinculoInvitarToggle`/`TIPO_OTRO` a `ContactoSelector.tsx`.
- **Limitación conocida**: un evento "Todo el día" con contacto vinculado se crea como evento con horas (agendarCita no soporta isAllDay). Caso raro; documentado, no bloqueante.
- **QA visual pendiente**: el navegador del MCP redirige a /setup-mfa (la cuenta admin exige enrolar MFA); validar manualmente el flujo calendario→ficha cuando Jennifer/Manel tengan sesión.

---

## Gotchas

> Cosas críticas a tener en cuenta ANTES de implementar

- [ ] La vinculación es OPCIONAL: cualquier cambio en `EventoModal` debe dejar el flujo sin contacto byte-a-byte equivalente al actual (título libre, invitados manuales, `createCalendarEvent` directo)
- [ ] El email del candidato está en `profiles`, NO en `candidato_profiles` (join `candidato_profiles.user_id → profiles.id`); ver memoria `solicitudes-join-candidato-profiles.md`
- [ ] NUNCA importar módulos server en componentes client (ChunkLoadError en Turbopack); los tipos compartidos (`AgendarCitaRecurso`, shape de `buscarContactos`) deben definirse en módulos sin `'use server'`/`'server-only'` o localmente
- [ ] `agendarCita` y `EventoModal` usan fechas naive local Europe/Madrid (`YYYY-MM-DDTHH:mm:ss`); al persistir en `citas` (timestamptz) convertir de forma consistente con `createCalendarEvent`
- [ ] `createCalendarEvent` debe devolver el id del evento creado para guardarlo en `citas.google_event_id` (verificar que ya lo devuelve; si no, extenderlo)
- [ ] Las citas agendadas ANTES de esta feature no aparecerán en el historial (solo existen en audit_logs/Google); backfill fuera de alcance salvo petición
- [ ] Si Jennifer borra un evento desde Google Calendar, la fila en `citas` no se entera: el historial es registro de "lo agendado", no espejo de la agenda. Si se borra desde la app (modo edit del calendario), borrar también la fila por `google_event_id` es deseable pero best-effort
- [ ] `clientes.email` es nullable (empresas sin email): el toggle de invitación debe deshabilitarse como ya hace `AgendarCitaModal` (`sinEmail`)
- [ ] El idioma del email de invitación lo decide la cuenta de Google, no el código
- [ ] `agendarCita` NO cambia el estado del recurso — mantener esa invariante
- [ ] La tarea de seguimiento nunca aborta la creación del evento (patrón actual: try/catch sin propagar)

## Anti-Patrones

- NO hacer obligatoria la vinculación ni degradar el flujo libre del calendario
- NO crear un segundo camino de escritura de citas vinculadas: todo pasa por `agendarCita` / `crearTareaVinculada`
- NO leer el historial de `audit_logs` ni de la API de Google
- NO duplicar los arrays de tipos: importar siempre de `shared/lib/tipos-cita.ts`
- NO tocar `cliente_sesiones` (propósito distinto)
- NO omitir validación Zod en `buscarContactos` ni en las nuevas actions
- NO olvidar RLS en la tabla `citas` (admin-only)

---

*PRP aprobado e implementado el 2026-06-10. Fases 1-4 completas; validación: typecheck + build OK, QA visual manual pendiente (MFA).*
