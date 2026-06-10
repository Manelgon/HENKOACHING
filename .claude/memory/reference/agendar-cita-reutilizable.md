---
name: agendar-cita-reutilizable
description: Patrón compartido para agendar citas (Google Calendar + Tasks) desde cualquier tabla del dashboard
metadata:
  type: reference
---

Para agendar citas/eventos desde cualquier recurso del dashboard hay un patrón único y reutilizable — NO duplicar:

- **Server action**: `agendarCita` en [src/actions/citas.ts](../../src/actions/citas.ts). Genérico: `recursoTipo: 'solicitud'|'lead'|'cliente'|'candidato'`, `recursoId`, `tipo?`, `titulo`, `contactoNombre`, `contactoEmail?`, `contexto?`, `start`/`end` (naive local Europe/Madrid), `invitar`, `crearTarea`, `taskListId?`, `tareaTitulo?`. Crea evento en Google Calendar (+ Meet si invita), opcional tarea en Google Tasks, **registra la cita en la tabla `citas`** (historial por recurso, migración 019) y devuelve `{ok, tareaCreada, evento}` (el `CalendarEvent` creado, para refresco optimista del calendario). **No cambia el estado** del recurso. Requiere rol admin.
- **Modal**: `src/shared/components/AgendarCitaModal.tsx`. Props: `recurso{tipo,id,nombre,email?,contexto?}`, `tiposCita[]`, `tiposTarea[]`, `onClose`, `onDone`. El título se compone como `"{Tipo} con {nombre}"` (Tipo = desplegable de `tiposCita` + "Otro"); con "Otro" el título es libre. Vista previa en vivo.
- **Historial**: `src/shared/components/CitasHistorial.tsx` (`recurso`, `tiposCita`, `tiposTarea`, `compact?`). Autosuficiente: carga via `getCitasByRecurso`, separa próximas/anteriores, distingue cita/tarea, botón "Agendar cita" integrado. Como pestaña "Citas" en ClienteDetalleLayout y CandidatoDetalleLayout, y sección en LeadDrawer.
- **Desde el calendario**: `EventoModal` tiene fila opcional "Vincular contacto" (`ContactoSelector` + `buscarContactos`, que busca en leads ∪ clientes ∪ candidatos — el email del candidato vive en `profiles`). Con vínculo, el evento va por `agendarCita` y la tarea por `crearTareaVinculada` (registro clase 'tarea'); sin vínculo, el flujo libre queda intacto y NO se registra en `citas`.
- **Menú de acciones**: `src/shared/components/AccionesMenu.tsx` (kebab ⋯). Recibe `items: AccionItem[]` (`label, onClick?, iconPath?, disabled?, disabledHint?, danger?, divider?`). Blindado con preventDefault para funcionar dentro de un `<Link>` de fila (clientes).

Los tipos de cita/tarea están centralizados en `src/shared/lib/tipos-cita.ts` (`TIPOS_CITA` / `TIPOS_TAREA`, `Record<RecursoTipo, string[]>`) — importar de ahí, no redefinir constantes locales.

Requiere envs Google en el entorno: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` (con scopes de escritura de Calendar + Tasks). El idioma del email de invitación lo decide el idioma de la cuenta de Google, no el código. Relacionado: [[portal-empleo-estado]].
