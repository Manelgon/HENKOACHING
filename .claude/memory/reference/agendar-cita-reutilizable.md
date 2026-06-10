---
name: agendar-cita-reutilizable
description: Patrón compartido para agendar citas (Google Calendar + Tasks) desde cualquier tabla del dashboard
metadata:
  type: reference
---

Para agendar citas/eventos desde cualquier recurso del dashboard hay un patrón único y reutilizable — NO duplicar:

- **Server action**: `agendarCita` en [src/actions/citas.ts](../../src/actions/citas.ts). Genérico: `recursoTipo: 'solicitud'|'lead'|'cliente'`, `recursoId`, `titulo`, `contactoNombre`, `contactoEmail?`, `contexto?`, `start`/`end` (naive local Europe/Madrid), `invitar`, `crearTarea`, `taskListId?`, `tareaTitulo?`. Crea evento en Google Calendar (+ Meet si invita) y, opcional, tarea en Google Tasks. **No cambia el estado** del recurso. Requiere rol admin.
- **Modal**: `src/shared/components/AgendarCitaModal.tsx`. Props: `recurso{tipo,id,nombre,email?,contexto?}`, `tiposCita[]`, `tiposTarea[]`, `onClose`, `onDone`. El título se compone como `"{Tipo} con {nombre}"` (Tipo = desplegable de `tiposCita` + "Otro"); con "Otro" el título es libre. Vista previa en vivo.
- **Menú de acciones**: `src/shared/components/AccionesMenu.tsx` (kebab ⋯). Recibe `items: AccionItem[]` (`label, onClick?, iconPath?, disabled?, disabledHint?, danger?, divider?`). Blindado con preventDefault para funcionar dentro de un `<Link>` de fila (clientes).

Cada tabla define sus propios `TIPOS_CITA_*` / `TIPOS_TAREA_*` como constantes locales. Ya integrado en solicitudes (AdminSolicitudes + AccionesDropdown), leads (LeadsTable) y clientes (ClientesTable).

Requiere envs Google en el entorno: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` (con scopes de escritura de Calendar + Tasks). El idioma del email de invitación lo decide el idioma de la cuenta de Google, no el código. Relacionado: [[portal-empleo-estado]].
