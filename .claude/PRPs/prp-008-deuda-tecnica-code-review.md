# PRP-008: Deuda Técnica — Code Review

> **Estado**: PENDIENTE
> **Fecha**: 2026-06-04
> **Proyecto**: Henkoaching — Portal de Empleo + CRM

---

## Objetivo

Eliminar la deuda técnica detectada en la revisión de código: 10 issues que van desde crashes en runtime hasta duplicaciones de código y constantes dispersas. El resultado es un codebase más seguro, tipado correctamente y sin duplicaciones.

## Por Qué

| Problema | Solución |
|----------|----------|
| `NextResponse.redirect('/login')` con path relativo causa crash en runtime en las routes de PDF | Reemplazar por URL absoluta o usar `redirect()` de next/navigation |
| `database.types.ts` no incluye tablas RGPD (`rgpd_documentos`, `derechos_arco`) ni campos nuevos (`consent_text`, `acepto_privacidad_at` en `candidato_profiles`) → `as never` casts por todo el código | Regenerar o extender manualmente database.types.ts con las tablas/columnas faltantes |
| `isCompleted` para RoPA devuelve `true` siempre que haya `actualizado_at`, incluso si el contenido real del RAT está vacío | Añadir comprobación específica para `ropa` similar a la de `formacion_ia` |
| `getConsentimientos` no comprueba errores de Supabase — si la query falla, devuelve datos vacíos sin log ni feedback | Añadir comprobación de `candidatosRes.error` / `leadsRes.error` y lanzar/retornar error |
| `getConsentimientos` usa cliente de sesión (RLS) para leads en vez de admin — si el admin tiene RLS restrictivo puede devolver 0 leads | Usar `admin` para ambas queries (candidatos y leads) |
| Dos constantes `CONSENT_TEXT` distintas: una en `CandidatoSignupFlow.tsx` y otra en `contacto/page.tsx` — riesgo de divergencia del texto legal | Centralizar en `src/shared/constants/consent.ts` e importar desde ahí |
| Dos routes de PDF casi idénticas (`/api/runbook-pdf` y `/api/rat-pdf`) comparten estructura boilerplate — auth, permisos, return HTML | Extraer helper `requireAdminHtml()` y/o factorizar la autenticación compartida |
| `DocCard` tiene dos botones distintos para abrir el mismo drawer: el botón principal y el chevron al final, ambos llaman a `onClick` | Eliminar el segundo botón redundante y usar solo el wrapper principal |
| `import()` dinámico de `createAdminClient` dentro de `getConsentimientos` — innecesario en Server Actions, genera overhead de módulo en cada llamada | Cambiar a import estático en el top del archivo |
| El SVG del check-circle (`M9 12l2 2 4-4m6 2...`) está copiado inline en 7+ archivos (`RgpdDashboard.tsx`, `ConsentimientosTable.tsx`, `CandidatoDetalleLayout.tsx`, `LeadDrawer.tsx`, `FallosPanel.tsx`, `layout.tsx`...) | Crear componente `<CheckCircleIcon>` en `src/shared/components/icons/` e importar desde allí |

**Valor de negocio**: Evitar crashes en producción (redirect relativo), eliminar datos silenciosamente erróneos (RoPA completado vacío, leads sin cargar), y reducir el riesgo de divergencia del texto legal de consentimiento que es obligatorio bajo el Art. 7.1 RGPD.

## Qué

### Criterios de Éxito
- [ ] `/api/runbook-pdf` y `/api/rat-pdf` redirigen correctamente cuando no hay sesión (sin crash)
- [ ] `database.types.ts` incluye `rgpd_documentos`, `derechos_arco`, `consent_text` en `candidato_profiles` y `leads` — sin ningún `as never` en queries que ahora tienen tipos correctos
- [ ] RoPA solo muestra "Completado" si tiene datos reales en `contenido` (no solo `actualizado_at`)
- [ ] `getConsentimientos` propaga errores de Supabase en vez de silenciarlos
- [ ] `getConsentimientos` usa cliente admin para leads
- [ ] Una sola constante `CONSENT_TEXT` importada en los dos formularios
- [ ] Las routes de PDF comparten helper de autenticación (sin duplicar lógica)
- [ ] `DocCard` tiene un único botón de acción — sin el chevron redundante
- [ ] `createAdminClient` importado estáticamente en `actions/rgpd.ts`
- [ ] Existe `<CheckCircleIcon>` en shared/icons y todos los usos inline lo referencian
- [ ] `npm run typecheck` pasa sin errores
- [ ] `npm run build` exitoso

### Comportamiento Esperado

Un admin que accede a `/api/runbook-pdf` sin sesión activa es redirigido a `/login` correctamente (no crash). La pantalla RGPD muestra el RoPA como "Pendiente" si su contenido está vacío aunque tenga `actualizado_at`. La tabla de consentimientos muestra tanto candidatos como leads aunque la sesión del admin tenga RLS restrictiva. Los dos formularios (contacto y signup candidato) muestran exactamente el mismo texto de consentimiento (mismo source). El código compilado pasa typecheck y build sin warning de tipos.

---

## Contexto

### Referencias
- `src/app/api/runbook-pdf/route.ts` — route con redirect relativo (crash)
- `src/app/api/rat-pdf/route.ts` — route con redirect relativo (crash) + botón de descarga en `RgpdDashboard`
- `src/lib/supabase/database.types.ts` — tablas `rgpd_documentos` y `derechos_arco` ausentes; `candidato_profiles` sin `acepto_privacidad_at` ni `consent_text`; `leads` sin `consent_text`
- `src/features/rgpd/components/RgpdDashboard.tsx` — `isCompleted()` (L55-62), `DocCard` con doble botón (L77 + L134), SVG check-circle inline (L205)
- `src/actions/rgpd.ts` — `getConsentimientos` con dynamic import, sin comprobación de errores, usando session client para leads (L138-188)
- `src/features/empleo/components/CandidatoSignupFlow.tsx:10` — `CONSENT_TEXT_CANDIDATO` local
- `src/app/(web)/contacto/page.tsx:13` — `CONSENT_TEXT` local (texto diferente)
- `src/features/rgpd/components/ConsentimientosTable.tsx`, `src/features/candidatos/components/CandidatoDetalleLayout.tsx`, `src/features/leads/components/LeadDrawer.tsx`, `src/features/email/components/FallosPanel.tsx`, `src/app/(main)/layout.tsx` — SVG check-circle copiado inline
- `src/lib/supabase/admin.ts` — `createAdminClient()` exportado para import estático

### Arquitectura Propuesta

```
src/
├── shared/
│   ├── constants/
│   │   └── consent.ts          # NUEVO: CONSENT_TEXT_CANDIDATO + CONSENT_TEXT_CONTACTO
│   └── components/
│       └── icons/
│           └── CheckCircleIcon.tsx  # NUEVO: SVG check-circle como componente
│
├── lib/
│   ├── supabase/
│   │   └── database.types.ts   # ACTUALIZAR: añadir rgpd_documentos, derechos_arco, consent_text, acepto_privacidad_at
│   └── api/
│       └── require-admin-html.ts  # NUEVO: helper compartido para routes de PDF
│
├── app/api/
│   ├── runbook-pdf/route.ts    # ACTUALIZAR: usar helper + URL absoluta
│   └── rat-pdf/route.ts        # ACTUALIZAR: usar helper + URL absoluta
│
├── actions/
│   └── rgpd.ts                 # ACTUALIZAR: import estático, errores, admin para leads
│
└── features/rgpd/components/
    └── RgpdDashboard.tsx       # ACTUALIZAR: isCompleted ropa, DocCard botón único, import CheckCircleIcon
```

### Modelo de Datos

No hay cambios de esquema en BD. Solo se actualiza `database.types.ts` para reflejar columnas que ya existen en Supabase pero están ausentes del tipo generado:

```typescript
// candidato_profiles — añadir en Row/Insert/Update:
acepto_privacidad_at: string | null
consent_text: string | null

// leads — añadir en Row/Insert/Update:
consent_text: string | null

// rgpd_documentos — tabla nueva completa:
Row: { id: string; titulo: string; descripcion: string | null; contenido: Json; actualizado_at: string | null; actualizado_por: string | null; created_at: string | null }

// derechos_arco — tabla nueva completa:
Row: { id: string; nombre: string; email: string; tipo_derecho: string; descripcion: string; estado: 'pendiente' | 'en_proceso' | 'resuelta'; notas_admin: string | null; resolucion_at: string | null; created_at: string | null }
```

---

## Blueprint (Assembly Line)

> IMPORTANTE: Solo definir FASES. Las subtareas se generan al entrar a cada fase
> siguiendo el bucle agéntico (mapear contexto → generar subtareas → ejecutar)

### Fase 1: Infraestructura compartida
**Objetivo**: Crear los ficheros base de los que dependen todas las demás fases — constante CONSENT_TEXT centralizada, componente CheckCircleIcon, y helper `requireAdminHtml` para routes de PDF.
**Validación**: Los tres ficheros nuevos existen y exportan correctamente. No hay cambios funcionales todavía.

### Fase 2: Actualizar database.types.ts
**Objetivo**: Añadir al tipo `Database` las tablas `rgpd_documentos` y `derechos_arco`, y las columnas faltantes en `candidato_profiles` y `leads`. Eliminar el máximo posible de `as never` casts consecuentes.
**Validación**: `npm run typecheck` no reporta errores en los archivos que usaban `as never` para estas tablas/columnas.

### Fase 3: Arreglar routes de PDF
**Objetivo**: Reemplazar `NextResponse.redirect('/login')` por URL absoluta en ambas routes (`runbook-pdf`, `rat-pdf`), usando el helper de la Fase 1 para compartir la lógica de auth + permisos.
**Validación**: Las routes retornan 302 con Location absoluta cuando no hay sesión. `npm run typecheck` pasa.

### Fase 4: Arreglar getConsentimientos
**Objetivo**: Convertir el import dinámico de `createAdminClient` a import estático, usar admin para la query de leads, y añadir comprobación de errores (`candidatosRes.error` / `leadsRes.error`).
**Validación**: `getConsentimientos` usa `admin` para ambas queries. Si hay error de Supabase se lanza/retorna en lugar de silenciarlo. Typecheck pasa.

### Fase 5: Arreglar isCompleted para RoPA y DocCard
**Objetivo**: Añadir comprobación específica para `ropa` en `isCompleted` (verificar que `contenido` tenga al menos una actividad de tratamiento), y eliminar el botón chevron redundante de `DocCard`.
**Validación**: RoPA recién creado sin datos reales muestra "Pendiente". DocCard tiene un solo elemento clicable. No hay regresión visual.

### Fase 6: Reemplazar SVG inline por CheckCircleIcon
**Objetivo**: Importar `<CheckCircleIcon>` en los 7+ archivos que copian el SVG inline y eliminar los bloques `<svg>` duplicados.
**Validación**: Visualmente idéntico. `npm run typecheck` pasa. Grep por el path SVG `M9 12l2 2 4-4m6 2` solo encuentra la definición en `CheckCircleIcon.tsx`.

### Fase 7: Centralizar CONSENT_TEXT y validación final
**Objetivo**: Importar `CONSENT_TEXT_CANDIDATO` y `CONSENT_TEXT_CONTACTO` desde `shared/constants/consent.ts` en `CandidatoSignupFlow.tsx` y `contacto/page.tsx`. Luego ejecutar build completo y verificación final.
**Validación**:
- [ ] Grep por `const CONSENT_TEXT` fuera de `shared/constants/consent.ts` = 0 resultados
- [ ] `npm run typecheck` pasa
- [ ] `npm run build` exitoso sin warnings de tipos
- [ ] Los 10 criterios de éxito están cumplidos

---

## Aprendizajes (Self-Annealing)

> Esta sección CRECE con cada error encontrado durante la implementación.

---

## Gotchas

> Cosas críticas a tener en cuenta ANTES de implementar

- [ ] `NextResponse.redirect` en App Router routes require URL absoluta — usar `new URL('/login', request.url).toString()` o `process.env.NEXT_PUBLIC_SITE_URL`. En las routes actuales no se recibe `request` como param en GET sin argumentos; la forma más simple es `redirect()` de `next/navigation` (que lanza internamente) o construir URL con `process.env.NEXT_PUBLIC_SITE_URL`.
- [ ] Al actualizar `database.types.ts` manualmente, las `as never` casts en código existente desaparecen pero pueden aparecer errores de tipo reales que antes estaban ocultos — revisar y corregir uno a uno.
- [ ] `rgpd_documentos` usa `id` como string enum (`'ropa' | 'runbook' | ...`), no UUID — asegurarse de reflejarlo en los tipos.
- [ ] El `DocCard` tiene el chevron como `<button type="button" onClick={onClick}>` en L134 — basta con eliminar ese elemento, no el botón interior que es el principal.
- [ ] Los textos de CONSENT_TEXT en candidato y contacto son actualmente distintos — no unificarlos en un solo string; crear dos constantes nombradas correctamente desde el mismo archivo.

## Anti-Patrones

- NO usar `as never` para bypassear TypeScript — si el tipo no existe, añadirlo
- NO usar `import()` dinámico para módulos de servidor que no necesitan lazy loading
- NO duplicar SVGs inline cuando hay un componente compartido disponible
- NO silenciar errores de Supabase con `?? []` sin al menos un log
- NO hardcodear `/login` como path relativo en redirect de API routes

---

*PRP pendiente aprobación. No se ha modificado código.*
