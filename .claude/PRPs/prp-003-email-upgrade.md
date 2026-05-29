# PRP-003: Upgrade cliente de email — Carpetas IMAP, Composer Tiptap, Adjuntos, Loading global

> **Estado**: PENDIENTE
> **Fecha**: 2026-05-29
> **Proyecto**: Henkoaching / Jennifer Cervera

---

## Objetivo

Ampliar el cliente de email del panel admin con soporte de carpetas IMAP (Recibidos, Enviados, Borradores, Spam, Papelera), reemplazar el textarea del ComposeDrawer por un editor Tiptap rico con toolbar, añadir adjuntos al composer, y conectar las cargas de bandeja al spinner global del FeedbackContext.

## Por Qué

| Problema | Solución |
|----------|----------|
| La bandeja solo muestra INBOX; los emails enviados, borradores y spam son invisibles | Listar carpetas IMAP reales y filtrar por ellas via tabs |
| El composer es un textarea plano; los emails quedan sin formato | Editor Tiptap con toolbar (negrita, cursiva, listas, color, tamaño…) que envía HTML + texto plano |
| No es posible adjuntar archivos desde el panel | Selector de ficheros con validación 10 MB, lista removible, pasado a nodemailer como `attachments` |
| Al actualizar la bandeja no hay feedback visual global; solo hay un spinner local | Usar `runAction` del FeedbackContext para que aparezca el spinner turquesa global en todas las cargas de bandeja |

**Valor de negocio**: Jennifer gestiona la comunicación con clientes desde el dashboard; sin estas mejoras hay que salir al cliente de correo externo para leer enviados/borradores o para adjuntar un contrato/presupuesto.

## Qué

### Criterios de Éxito
- [ ] Los tabs de carpeta muestran Recibidos, Enviados, Borradores, Spam y Papelera; cambiar de tab recarga la lista con los mensajes de esa carpeta
- [ ] El ComposeDrawer tiene editor Tiptap con toolbar funcional (negrita, cursiva, subrayado, listas, alineación, color de texto, tamaño de fuente)
- [ ] El HTML generado por Tiptap se envía vía nodemailer (campo `html`) y el texto plano (campo `text`) se deriva del contenido
- [ ] Es posible adjuntar hasta 3 archivos (máx. 10 MB c/u); se listan con botón de quitar; llegan al destinatario como attachments
- [ ] Al llamar a `listarEmailsBandeja()` — tanto inicial, manual como periódico — aparece el spinner turquesa global (FeedbackContext) en lugar de solo el spinner local
- [ ] `npm run typecheck` pasa sin errores
- [ ] `npm run build` exitoso

### Comportamiento Esperado

**Happy Path — Carpetas:**
1. Admin abre la bandeja de email
2. Sobre la lista hay 5 tabs: Recibidos · Enviados · Borradores · Spam · Papelera
3. Al hacer clic en "Enviados", se llama a `listarEmailsBandeja({ folder: 'Enviados' })`; el spinner global aparece y la lista muestra los emails de esa carpeta

**Happy Path — Composer rico:**
1. Admin pulsa "Redactar"
2. Se abre el ComposeDrawer con el editor Tiptap en lugar del textarea
3. Escribe texto con formato (negrita, lista…), añade un PDF adjunto
4. Pulsa "Enviar"; el email llega al destinatario con HTML formateado y el PDF como adjunto

**Happy Path — Loading global:**
1. Admin pulsa "Actualizar" o el poller automático dispara
2. El spinner turquesa del FeedbackContext aparece en la barra/overlay global
3. Cuando la carga termina, el spinner desaparece (sin toast de éxito para no molestar)

---

## Contexto

### Referencias
- `src/features/email/services/imap.ts` — Servicio IMAP actual (solo INBOX, `listarMensajes` y `leerMensaje`)
- `src/actions/email.ts` — Server Actions: `listarEmailsBandeja`, `leerEmailBandeja`, `enviarEmail`
- `src/features/email/components/BandejaInbox.tsx` — UI bandeja (tabs leído/no-leído, paginación, refresh)
- `src/features/email/components/ComposeDrawer.tsx` — Composer actual (textarea + `useAction`)
- `src/features/email/components/EmailPoller.tsx` — Poller cada 2 min
- `src/features/email/store/emailStore.ts` — Zustand store (unreadCount, lastSeenUids)
- `src/features/email/types/index.ts` — `EmailMessage`, `EmailDetail`
- `src/shared/feedback/FeedbackContext.tsx` — `runAction` / `useAction` / spinner global
- `src/features/blog/components/TipTapEditor.tsx` — Patrón Tiptap existente a reutilizar/adaptar
- Tiptap instalado: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-link`, `@tiptap/extension-placeholder`, `@tiptap/extension-typography`
- **Extensiones adicionales a instalar**: `@tiptap/extension-underline`, `@tiptap/extension-text-align`, `@tiptap/extension-color`, `@tiptap/extension-text-style`, `@tiptap/extension-font-family` (o equivalente para tamaño)

### Arquitectura Propuesta

```
src/features/email/
├── components/
│   ├── BandejaInbox.tsx        (MODIFICAR — añadir tabs carpeta, loading global)
│   ├── ComposeDrawer.tsx        (MODIFICAR — Tiptap + adjuntos)
│   ├── EmailComposeTiptap.tsx   (NUEVO — editor adaptado al composer)
│   └── EmailPoller.tsx          (MODIFICAR — pasar folder actual al poll)
├── services/
│   └── imap.ts                  (MODIFICAR — listarMensajes acepta mailbox; añadir listarCarpetas)
├── types/
│   └── index.ts                 (MODIFICAR — añadir ImapFolder, AttachmentInput)
└── store/
    └── emailStore.ts            (MODIFICAR — añadir carpeta activa)

src/actions/email.ts             (MODIFICAR — listarEmailsBandeja acepta folder param; enviarEmail acepta html + attachments)
```

### Mapeo de carpetas IMAP

Los servidores IMAP usan nombres distintos según el proveedor. El servicio debe llamar a `client.list()` y mapear con heurísticas conocidas:

| Nombre estándar | Atributos IMAP / nombres comunes |
|-----------------|----------------------------------|
| Recibidos | INBOX |
| Enviados | `\Sent`, Sent, Sent Messages, Enviados |
| Borradores | `\Drafts`, Drafts, Borradores |
| Spam | `\Junk`, Spam, Junk, Junk E-mail |
| Papelera | `\Trash`, Trash, Deleted, Papelera |

Si una carpeta no existe en el servidor, el tab se deshabilita.

### Adjuntos — flujo técnico

- El usuario selecciona archivos con `<input type="file" multiple>`
- Los archivos se almacenan en estado local del componente como `File[]`
- Al enviar, cada `File` se convierte a `ArrayBuffer` / `Buffer` en el cliente y se serializa en base64 dentro de un objeto `{ name, base64, mimeType }` para enviarse a la Server Action (no se pueden pasar `File` objetos nativos a Server Actions directamente)
- La Server Action reconstruye los buffers y los pasa a nodemailer como `attachments: [{ filename, content: Buffer.from(base64, 'base64'), contentType }]`
- Validación en cliente: tamaño máx. 10 MB por archivo; máx. 3 archivos simultáneos
- Validación en servidor: verificar tamaño del buffer antes de enviar

### Modelo de Datos

No se requieren cambios en la base de datos. La carpeta activa es estado de UI efímero.

---

## Blueprint (Assembly Line)

> Solo FASES. Las subtareas se generan al entrar a cada fase con el bucle agéntico.

### Fase 1: Tipos y store
**Objetivo**: Añadir los tipos `ImapFolder`, `AttachmentInput` y ampliar el Zustand store con la carpeta activa (`activeFolder`), de modo que el resto de fases tenga contratos claros con TypeScript desde el inicio.
**Validación**: `npm run typecheck` pasa; `emailStore.ts` exporta `activeFolder` y `setActiveFolder`.

### Fase 2: Servicio IMAP — carpetas
**Objetivo**: Añadir `listarCarpetas()` a `imap.ts` que devuelve `ImapFolder[]` (nombre estándar + mailbox real), y modificar `listarMensajes()` para aceptar un parámetro `mailbox` (default `INBOX`).
**Validación**: La función compila sin errores; el mapeo cubre los 5 nombres estándar.

### Fase 3: Server Action — folder y adjuntos
**Objetivo**: Modificar `listarEmailsBandeja` para aceptar `folder?: string`; añadir nueva action `listarCarpetasImap()`; modificar `enviarEmail` para aceptar `html?: string` y `attachments?: AttachmentInput[]` y pasarlos a nodemailer.
**Validación**: Las acciones compilan; `enviarEmail` envía `html` + `text` + adjuntos si se proporcionan.

### Fase 4: Loading global en bandeja
**Objetivo**: Modificar `BandejaInbox.tsx` para que la función `cargar()` use `runAction` del FeedbackContext con `silentSuccess: true`, de modo que el spinner turquesa global aparezca durante la carga. El poller en `EmailPoller.tsx` también pasa por `runAction` con `silentSuccess: true`.
**Validación**: Al actualizar la bandeja, el spinner global aparece y desaparece sin toast. El spinner local del botón "Actualizar" puede mantenerse como UX secundario o eliminarse.

### Fase 5: Tabs de carpetas en bandeja
**Objetivo**: Modificar `BandejaInbox.tsx` para mostrar tabs de carpeta (Recibidos, Enviados, Borradores, Spam, Papelera). Al cambiar de tab, se llama a `listarEmailsBandeja({ folder })`. Los tabs deshabilitados se muestran en gris si la carpeta no existe.
**Validación**: Cambiar de tab carga los emails de esa carpeta. El tab activo tiene el estilo turquesa.

### Fase 6: Editor Tiptap en composer
**Objetivo**: Instalar extensiones faltantes de Tiptap (`@tiptap/extension-underline`, `@tiptap/extension-text-align`, `@tiptap/extension-color`, `@tiptap/extension-text-style`). Crear `EmailComposeTiptap.tsx` — editor Tiptap adaptado al composer con toolbar: negrita, cursiva, subrayado, listas, alineación, color de texto. Reemplazar el `<textarea>` en `ComposeDrawer.tsx` por este componente.
**Validación**: El editor renderiza en el drawer; la toolbar funciona; el HTML y texto plano se extraen correctamente al enviar.

### Fase 7: Adjuntos en el composer
**Objetivo**: Añadir selector de archivos al `ComposeDrawer.tsx` con lista de adjuntos (nombre, tamaño, botón quitar). Validar 10 MB máx. por archivo y máx. 3 adjuntos. Serializar a base64 y pasar a `enviarEmail`.
**Validación**: Se pueden adjuntar archivos, quitarlos, y el email enviado incluye los adjuntos; se muestra error si se supera el límite.

### Fase 8: Validación Final
**Objetivo**: Sistema funcionando end-to-end con todas las mejoras activas.
**Validación**:
- [ ] `npm run typecheck` pasa sin errores
- [ ] `npm run build` exitoso
- [ ] Tabs de carpeta visibles y funcionales
- [ ] Composer muestra editor Tiptap con toolbar
- [ ] Adjuntar y enviar un email con adjunto funciona
- [ ] El spinner global aparece al actualizar la bandeja

---

## Aprendizajes (Self-Annealing)

> Esta sección crece con los errores encontrados durante la implementación.

---

## Gotchas

- [ ] **File en Server Actions**: los objetos `File` nativos no son serializables. Los adjuntos deben convertirse a base64 en el cliente antes de llamar a la Server Action.
- [ ] **Tiptap SSR**: Tiptap requiere `immediatelyRender: false` para evitar hidratación errónea (ver patrón en `TipTapEditor.tsx`).
- [ ] **Tiptap texto plano**: usar `editor.getText()` (no `editor.getHTML()`) para obtener la versión texto del email para nodemailer `text`.
- [ ] **imapflow — listar carpetas**: `client.list('', '*')` devuelve todas las carpetas; algunos servidores retornan `\NoSelect` en carpetas padre, hay que filtrarlas.
- [ ] **Carpeta Enviados**: para _leer_ enviados basta abrir el mailbox mapeado. Para _guardar_ una copia del email enviado en Sent hay que hacer un `client.append()` vía IMAP — esto está fuera del alcance de este PRP; solo se lee.
- [ ] **runAction en poller**: `EmailPoller.tsx` es un componente sin UI que vive en el layout; debe poder acceder a `useFeedback()` — verificar que está dentro del `FeedbackProvider` en `app/layout.tsx`.
- [ ] **Extensiones Tiptap de color/tamaño**: `@tiptap/extension-color` requiere `@tiptap/extension-text-style` como peer. Instalar ambas.

## Anti-Patrones

- NO abrir una segunda conexión IMAP para listar carpetas si ya se va a abrir una para listar mensajes — hacer ambas en la misma conexión
- NO pasar `File[]` directamente a una Server Action — siempre serializar a base64 primero
- NO mostrar toast de éxito en la carga automática/periódica de la bandeja — usar `silentSuccess: true`
- NO ignorar errores de TypeScript
- NO duplicar la lógica del toolbar de Tiptap — extraer a un componente compartido si se necesita en más de un lugar

---

*PRP pendiente aprobación. No se ha modificado código.*