# PRP-004: Sección Candidatos en el Panel Admin

> **Estado**: PENDIENTE
> **Fecha**: 2026-05-29
> **Proyecto**: Henkoaching — Portal de Empleo

---

## Objetivo

Crear una sección de gestión de candidatos en el panel admin (`/dashboard/candidatos`) con lista paginada + filtros y una vista de perfil completa (`/dashboard/candidatos/[id]`) que muestre todos los datos del candidato y permita gestionar el estado de sus solicitudes.

## Por Qué

| Problema | Solución |
|----------|----------|
| El admin puede ver solicitudes (`/dashboard/solicitudes`) pero no tiene visión centrada en el candidato: quién es, su CV, su historial completo de aplicaciones | Una sección dedicada donde cada candidato es la entidad central, con todo su contexto (perfil, experiencia, CVs, solicitudes) en una sola vista |
| Para gestionar procesos de selección hay que cruzar manualmente la vista de solicitudes con datos dispersos | Perfil único del candidato con sus solicitudes embebidas y cambio de estado desde ahí mismo |

**Valor de negocio**: Jennifer puede gestionar procesos de selección más rápido, ver el pipeline completo de cada candidato de un vistazo y actuar sobre los estados sin saltar entre pantallas.

## Qué

### Criterios de Éxito
- [ ] `/dashboard/candidatos` carga con tabla paginada (20 por página), búsqueda y filtros funcionales
- [ ] Cada fila de la tabla muestra: nombre completo, email, teléfono, cargo actual, ubicación, fecha de registro y número de solicitudes activas
- [ ] Click en una fila navega a `/dashboard/candidatos/[id]`
- [ ] El perfil muestra todos los campos: header con avatar/iniciales, datos de contacto, experiencia, educación, idiomas y CVs descargables
- [ ] La sección de solicitudes del candidato lista todas sus aplicaciones con badge de estado y permite cambiar el estado con un click (usando `cambiarEstadoSolicitud` existente)
- [ ] La sección "Candidatos" aparece en el sidebar del dashboard bajo "Portal de empleo"
- [ ] `npm run typecheck` y `npm run build` pasan sin errores

### Comportamiento Esperado

**Lista**: Admin entra a `/dashboard/candidatos`. Ve una tabla con todos los usuarios con `role = 'candidato'`. Puede buscar por nombre/email o filtrar por si tienen solicitudes activas (sí/no). Hace click en una fila y navega al perfil.

**Perfil**: Admin ve el header con iniciales/avatar (foto_url si existe en `candidato_profiles`), nombre completo, email, teléfono, ubicación, cargo actual, LinkedIn y web. Debajo, secciones colapsables o apiladas: Resumen profesional, Experiencia laboral, Educación, Idiomas, CVs. Al fondo, la lista de solicitudes del candidato con badge de color por estado. Cada solicitud tiene un `<select>` de estado inline que llama a `cambiarEstadoSolicitud`.

---

## Contexto

### Referencias
- `src/features/clientes/components/ClientesTable.tsx` — Patrón exacto de tabla paginada con filtros: `usePagination`, `useMemo` de filtrado, toolbar con inputs/selects, grid de cabecera, filas con `Link`, estados vacíos. **Copiar estructura, adaptar campos.**
- `src/features/clientes/components/ClienteFicha.tsx` — Patrón de ficha de detalle: componentes locales `Section`, `DL`, `DT`, `DD`. Acciones vía `useAction()`. **Reusar componentes internos como referencia de estilo.**
- `src/app/(main)/dashboard/clientes/page.tsx` — Patrón de Server Component: fetch en el page, pasar array al componente client.
- `src/app/(main)/dashboard/clientes/[id]/page.tsx` — Patrón de página de detalle: fetch en paralelo con `Promise.all`, grid `lg:col-span-2 + col lateral`.
- `src/actions/solicitudes.ts` — `cambiarEstadoSolicitud(solicitudId, estado)` ya existe y hace `revalidatePath`. También `getCvUrl(storagePath)` para generar URL firmada del CV.
- `src/components/TablePagination.tsx` — `usePagination` hook + `TablePagination` component, listo para usar.
- `src/app/(main)/layout.tsx` — Donde se añade la entrada al sidebar bajo "Portal de empleo".
- `src/features/empleo/components/CandidatoDashboard.tsx` — `ESTADO_META` ya define los badges por estado de solicitud (reusar la misma paleta de colores).

### Arquitectura Propuesta (Feature-First)

```
src/features/candidatos/
├── components/
│   ├── CandidatosTable.tsx       // 'use client' — tabla paginada con filtros
│   ├── CandidatoPerfil.tsx       // 'use client' — ficha completa con secciones
│   └── CandidatoSolicitudes.tsx  // 'use client' — lista de solicitudes con cambio de estado
└── types/
    └── index.ts                  // CandidatoRow, CandidatoDetalle, SolicitudCandidato

src/app/(main)/dashboard/candidatos/
├── page.tsx                      // Server Component — fetch lista
└── [id]/
    └── page.tsx                  // Server Component — fetch paralelo del perfil completo
```

### Modelo de Datos

No se requieren cambios en la BD. Todas las tablas existen.

**Query lista** (`/dashboard/candidatos`):
```sql
SELECT
  p.id, p.nombre, p.apellidos, p.email, p.telefono, p.created_at,
  cp.cargo_actual, cp.ubicacion,
  COUNT(s.id) FILTER (WHERE s.estado NOT IN ('descartado', 'contratado')) AS solicitudes_activas
FROM profiles p
LEFT JOIN candidato_profiles cp ON cp.user_id = p.id
LEFT JOIN solicitudes s ON s.candidato_id = p.id
WHERE p.role = 'candidato'
GROUP BY p.id, cp.cargo_actual, cp.ubicacion
ORDER BY p.created_at DESC
```

En Supabase JS (no soporta GROUP BY directamente): fetch `profiles` con `role = 'candidato'`, fetch `candidato_profiles`, fetch count de `solicitudes`. Unir en el Server Component. O usar `select` con join y contar en JS.

**Query detalle** (`/dashboard/candidatos/[id]`) — Promise.all de:
1. `profiles` — datos básicos + teléfono
2. `candidato_profiles` — cargo, ubicación, resumen, linkedin, web, foto_url (si existe la columna)
3. `candidato_experiencias` — ordenadas por `desde DESC`
4. `candidato_educacion` — ordenadas por `ano_fin DESC`
5. `candidato_idiomas`
6. `cvs` — `is('deleted_at', null)`, ordenados por `es_principal DESC, created_at DESC`
7. `solicitudes` con join a `ofertas(id, titulo, slug)` — ordenadas por `created_at DESC`

### Tipos clave

```typescript
// CandidatoRow (para la tabla)
type CandidatoRow = {
  id: string
  nombre: string
  apellidos: string
  email: string | null
  telefono: string | null
  cargo_actual: string | null
  ubicacion: string | null
  created_at: string
  solicitudes_activas: number
}

// SolicitudCandidato (para la ficha)
type SolicitudCandidato = {
  id: string
  estado: EstadoSolicitud
  created_at: string
  oferta: { id: string; titulo: string; slug: string | null }
}
```

---

## Blueprint (Assembly Line)

> Solo fases. Las subtareas se generan just-in-time al entrar a cada fase.

### Fase 1: Types + Server Actions
**Objetivo**: Definir tipos TypeScript en `src/features/candidatos/types/index.ts` y crear `src/actions/candidatos-admin.ts` con las funciones de fetch necesarias (lista y detalle).
**Validación**: `npm run typecheck` pasa. Las funciones exportadas tienen los tipos correctos. No hay `any`.

### Fase 2: Componente CandidatosTable
**Objetivo**: Crear `src/features/candidatos/components/CandidatosTable.tsx` siguiendo el patrón de `ClientesTable`. Toolbar con búsqueda y filtros, tabla con cabecera desktop + filas móvil, paginación con `usePagination` + `TablePagination`.
**Validación**: Componente renderiza sin errores. Filtros funcionan en cliente. Paginación correcta.

### Fase 3: Página lista `/dashboard/candidatos`
**Objetivo**: Crear `src/app/(main)/dashboard/candidatos/page.tsx` como Server Component que fetch los candidatos y renderiza `CandidatosTable`. Añadir "Candidatos" al sidebar en `src/app/(main)/layout.tsx` bajo "Portal de empleo".
**Validación**: `/dashboard/candidatos` carga. La ruta aparece en el sidebar. El link lleva a la página correcta.

### Fase 4: Componentes CandidatoPerfil + CandidatoSolicitudes
**Objetivo**: Crear `CandidatoPerfil.tsx` (header con avatar, secciones: datos, resumen, experiencia, educación, idiomas, CVs con descarga via `getCvUrl`) y `CandidatoSolicitudes.tsx` (lista de solicitudes con badge de estado y `<select>` para cambiar estado via `cambiarEstadoSolicitud`).
**Validación**: Componentes renderizan con datos de prueba. El cambio de estado llama a la acción correcta y hace `router.refresh()`.

### Fase 5: Página perfil `/dashboard/candidatos/[id]`
**Objetivo**: Crear `src/app/(main)/dashboard/candidatos/[id]/page.tsx` como Server Component. Fetch en paralelo de los 7 recursos con `Promise.all`. Layout `lg:col-span-2` (perfil + solicitudes) + columna lateral (CVs). Breadcrumb "← Volver a candidatos".
**Validación**: La ruta carga con datos reales. Los CVs tienen enlace de descarga funcional. Los estados de solicitud se pueden cambiar.

### Fase 6: Validación Final
**Objetivo**: Sistema funcionando end-to-end, sin errores de tipos ni build.
**Validación**:
- [ ] `npm run typecheck` pasa sin errores
- [ ] `npm run build` exitoso
- [ ] Lista de candidatos carga con paginación y filtros
- [ ] Perfil de candidato muestra todos los datos (experiencia, educación, idiomas, CVs)
- [ ] Cambio de estado de solicitud funciona y actualiza la UI
- [ ] Enlace de descarga de CV genera URL firmada de Supabase Storage
- [ ] "Candidatos" aparece en el sidebar bajo "Portal de empleo"

---

## Aprendizajes (Self-Annealing)

> Se completa durante la implementación.

---

## Gotchas

- [ ] **Supabase JS no soporta GROUP BY ni COUNT con filtros en una sola query**. Para contar solicitudes activas por candidato: fetch separado de `solicitudes` con `candidato_id in [ids]` y agrupar en JS, o usar dos selects separados.
- [ ] **`candidato_profiles.foto_url`**: verificar si existe esta columna antes de usarla. Si no existe, usar iniciales del nombre como avatar (patrón ya presente en `CandidatoDashboard`).
- [ ] **RLS en `candidato_profiles`, `candidato_experiencias`, etc.**: las policies RLS existentes pueden restringir el acceso admin. Verificar que el usuario admin puede leer estas tablas con `createClient()` (que usa la sesión del usuario logado). Si hay restricciones, usar `createAdminClient()` (bypass RLS).
- [ ] **`getCvUrl` genera URLs firmadas de 10 minutos**: funciona para descarga on-demand (click del botón), no para pre-cargar. El componente debe llamarla al click, no en el render del Server Component.
- [ ] **`cambiarEstadoSolicitud` hace `revalidatePath('/dashboard/solicitudes')`**: añadir también `revalidatePath('/dashboard/candidatos/[id]')` para que la UI se refresque tras el cambio (o usar `router.refresh()` en el cliente).
- [ ] **Tipos de Supabase**: los joins anidados devuelven `unknown` en TypeScript. Usar castings explícitos `as unknown as { ... }` igual que en `solicitudes/page.tsx`.

## Anti-Patrones

- NO crear nuevos patrones de tabla — copiar exactamente `ClientesTable` y adaptar
- NO ignorar errores de TypeScript — especialmente en los castings de joins Supabase
- NO hardcodear los estados de solicitud — importar `EstadoSolicitud` desde `database.types`
- NO hacer fetch de cada candidato individualmente en la lista — siempre batch

---

*PRP pendiente aprobación. No se ha modificado código.*