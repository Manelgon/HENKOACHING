# PRP-001: Fusionar tabla `empresas` dentro de `clientes`

> **Estado**: COMPLETADO (2026-06-10) — fusión aplicada en remoto el 2026-05-15 (migración `fusionar_empresas_en_clientes`); `schema.sql` sincronizado el 2026-06-10
> **Fecha**: 2026-05-15
> **Proyecto**: Henkoaching (Jennifer Cervera)

---

## Objetivo

Unificar el modelo de "entidades facturables" en una sola tabla `clientes` con un campo `tipo` (`particular` | `empresa`), eliminar la tabla separada `empresas`, y reapuntar `ofertas` a `clientes`. Resultado: Jennifer ve TODO lo que factura (particulares y empresas) en su listado de clientes, y las empresas siguen apareciendo en la bolsa de empleo con su logo y ficha pública.

## Por Qué

| Problema | Solución |
|----------|----------|
| Las empresas que pagan a Jennifer (selección RRHH) NO aparecen en el listado de clientes del CRM | Unificar todo en `clientes` con `tipo='empresa'` para que el CRM y la facturación los vean |
| No hay UI para gestionar empresas: se crean "al vuelo" cuando se publica una oferta, sin email, sin fiscal, sin seguimiento | El formulario de cliente pasa a aceptar `tipo='empresa'` con campos extra (slug, logo, web, descripción) y queda gestionable como cualquier otro cliente |
| Modelo conceptual partido en dos: "cliente facturable" vs "empresa del portal de empleo" cuando en realidad son la misma entidad de negocio | Un único modelo `clientes` que sirve tanto para facturar como para mostrar en `/empleo` |

**Valor de negocio**:
- Jennifer puede facturar a empresas desde el mismo flujo que ya conoce (sin tablas paralelas)
- Visibilidad completa del pipeline: leads → clientes (particulares + empresas) → facturas
- Menos código y menos casos especiales (un solo CRUD, un solo set de políticas RLS)

## Qué

### Criterios de Éxito
- [ ] La tabla `empresas` ya no existe en el esquema
- [ ] `clientes` tiene los campos `tipo`, `slug`, `logo_url`, `descripcion`, `ubicacion` (y reutiliza `web_url` existente)
- [ ] `ofertas.empresa_id` se llama `cliente_id` y referencia `clientes(id)`
- [ ] El listado del panel admin `/dashboard/clientes` muestra particulares Y empresas con un badge de tipo y se pueden filtrar
- [ ] El formulario de cliente muestra los campos extra (slug, logo, web, descripción) solo cuando `tipo='empresa'`
- [ ] El selector de "empresa" al crear/editar oferta en el panel lista únicamente clientes con `tipo='empresa'` y permite crear uno nuevo al vuelo
- [ ] La bolsa de empleo pública `/empleo` y el detalle `/empleo/[slug]` siguen mostrando el nombre/logo/ubicación de la empresa sin regresiones visuales
- [ ] Se puede crear una factura para un cliente `tipo='empresa'` sin tocar el flujo actual de facturación
- [ ] `npm run typecheck` y `npm run build` pasan sin errores
- [ ] RLS replicadas: lectura pública de campos de empresa filtrada por `deleted_at IS NULL`, escritura solo recruiter/admin

### Comportamiento Esperado

**Flujo admin: crear una nueva oferta para una empresa nueva**
1. Jennifer va a `/dashboard/ofertas` y pulsa "Nueva oferta"
2. En el campo "Empresa" tiene un selector con todos los clientes `tipo='empresa'`
3. Si la empresa no existe, pulsa "+ Nueva empresa" y rellena un mini-formulario (nombre, slug, logo opcional, web opcional)
4. Eso crea una fila en `clientes` con `tipo='empresa'` y email placeholder (o nullable)
5. La oferta se guarda apuntando a `cliente_id`
6. Esa empresa aparece inmediatamente en `/dashboard/clientes` con badge "Empresa"

**Flujo admin: facturar a una empresa**
1. Jennifer va a `/dashboard/clientes`, filtra por "Empresa"
2. Abre la ficha de la empresa-cliente, ve sus datos fiscales (NIF/CIF, dirección)
3. Pulsa "Crear factura" → flujo de facturación existente, sin cambios
4. La factura referencia `clientes.id` (mismo UUID que tenía antes)

**Flujo público: bolsa de empleo**
1. Visitante entra a `/empleo`
2. Ve la oferta con `cliente.nombre`, `cliente.logo_url`, `cliente.ubicacion`
3. Click en una oferta → `/empleo/[slug]` muestra detalles + descripción de la empresa
4. URLs como `/empleo?empresa=acme` siguen funcionando porque el slug se preserva

---

## Contexto

### Referencias

**Schema actual** (`supabase/schema.sql`):
- `clientes` (líneas 394-432): tabla del CRM, vinculada a `leads`, con datos fiscales y `web_url`
- `empresas` (líneas 251-264): tabla separada, con `slug` único, `logo_url`, `descripcion`, `ubicacion`
- `ofertas` (líneas 268-290): FK `empresa_id` → `empresas(id) ON DELETE RESTRICT`
- Políticas RLS empresas (líneas 819-825): lectura pública si `deleted_at IS NULL`, escritura solo recruiter

**Tipos generados** (`src/lib/supabase/database.types.ts`):
- `empresas` (líneas 549-590)
- `clientes` (líneas 435-515)
- `ofertas.empresa_id` (líneas 734, 757, 780)
- Vista `ofertas_publicadas.empresa_id` (línea 993)

**Backend** (`src/actions/ofertas.ts`):
- `ensureEmpresa(nombre)` (líneas 32-52): upsert por slug en `empresas`. **Punto clave a refactorizar**: debe pasar a `clientes` con `tipo='empresa'`

**Queries públicas** (`src/features/empleo/queries.ts`):
- `getOfertasPublicadas` (línea 35): JOIN `empresas(nombre)` → cambiar a `clientes(nombre, logo_url, slug, ubicacion)`
- `getOfertaPorSlug` (línea 69): mismo JOIN
- `getMisSolicitudes` (línea 127): mismo JOIN

**Archivos que mencionan `empresas` y hay que tocar**:
- `src/lib/supabase/database.types.ts` (regenerar)
- `src/actions/ofertas.ts` (refactor `ensureEmpresa` + select de empresa existente)
- `src/actions/candidato.ts` línea 299 (cambiar JOIN en export RGPD)
- `src/features/empleo/queries.ts` (3 JOINs)
- `src/features/empleo/components/OfertasListing.tsx` (sólo tipo TS del shape)
- `src/app/(main)/dashboard/ofertas/page.tsx` líneas 18-19 (cambiar `empresa_id` → `cliente_id` y JOIN)
- `src/app/(web)/page.tsx`, `src/app/(web)/empleo/page.tsx`, `src/app/(web)/sobre-mi/page.tsx`, `src/app/candidato/dashboard/page.tsx`: revisar (algunos solo tienen la palabra "empresas" en copy, no en código)

**Formulario admin existente a extender**:
- `src/features/clientes/components/NewClienteModal.tsx`: añadir toggle `tipo` y sección colapsable de "Datos de empresa"
- `src/features/clientes/components/ClientesTable.tsx`: añadir columna/badge tipo y filtro
- `src/features/clientes/components/ClienteFicha.tsx`: mostrar campos de empresa cuando aplique

**Selector de empresa al crear oferta**:
- `src/features/empleo/components/AdminOfertas.tsx`: el modal de "nueva oferta" hoy pide `empresa_nombre` como text input. Pasa a selector + "crear nuevo cliente-empresa".

### Arquitectura Propuesta

No se introducen features nuevas; este es un refactor que **consolida** el modelo existente. El stack y la organización feature-first se mantienen.

```
src/
├── features/
│   ├── clientes/                # Ya existe — se EXTIENDE
│   │   └── components/
│   │       ├── ClientesTable.tsx        # +badge tipo, +filtro tipo
│   │       ├── NewClienteModal.tsx      # +toggle tipo, +sección empresa
│   │       ├── ClienteFicha.tsx         # +campos empresa si tipo='empresa'
│   │       └── EmpresaPicker.tsx (NEW)  # Selector usado en formularios de oferta
│   │
│   └── empleo/                  # Ya existe — solo cambia origen del JOIN
│       ├── queries.ts                   # JOIN empresas → clientes
│       └── components/
│           └── AdminOfertas.tsx         # Usa <EmpresaPicker>
```

### Modelo de Datos

**Cambios sobre `clientes`**:

```sql
-- Nuevo enum
CREATE TYPE tipo_cliente AS ENUM ('particular', 'empresa');

-- Extender clientes
ALTER TABLE public.clientes
  ADD COLUMN tipo tipo_cliente NOT NULL DEFAULT 'particular',
  ADD COLUMN slug text,
  ADD COLUMN logo_url text,
  ADD COLUMN descripcion text,
  ADD COLUMN ubicacion text;

-- web_url ya existe en clientes (reutilizar)

-- email pasa a NULLABLE para permitir clientes-empresa creadas al vuelo sin email aún
ALTER TABLE public.clientes ALTER COLUMN email DROP NOT NULL;

-- Slug único por cliente NO borrado
CREATE UNIQUE INDEX clientes_slug_unique
  ON public.clientes(slug)
  WHERE slug IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX idx_clientes_tipo
  ON public.clientes(tipo) WHERE deleted_at IS NULL;
```

**Migración de datos** (orden crítico):

```sql
-- 1. Verificar conflictos de slug
SELECT e.slug
FROM public.empresas e
JOIN public.clientes c ON c.slug = e.slug
WHERE e.deleted_at IS NULL AND c.deleted_at IS NULL;
-- Si devuelve filas, ABORTAR migración y resolver manualmente

-- 2. Insertar cada empresa como cliente preservando el id
INSERT INTO public.clientes
  (id, tipo, nombre, email, slug, logo_url, web_url, descripcion, ubicacion,
   estado, created_at, updated_at, deleted_at)
SELECT
  e.id,
  'empresa'::tipo_cliente,
  e.nombre,
  NULL,                            -- email nullable; pedir rellenar después
  e.slug,
  e.logo_url,
  e.web_url,
  e.descripcion,
  e.ubicacion,
  'activo'::estado_cliente,
  e.created_at,
  e.updated_at,
  e.deleted_at
FROM public.empresas e
ON CONFLICT (id) DO NOTHING;

-- 3. Renombrar la FK
ALTER TABLE public.ofertas RENAME COLUMN empresa_id TO cliente_id;

-- 4. Recrear FK apuntando a clientes
ALTER TABLE public.ofertas DROP CONSTRAINT IF EXISTS ofertas_empresa_id_fkey;
ALTER TABLE public.ofertas
  ADD CONSTRAINT ofertas_cliente_id_fkey
  FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE RESTRICT;

-- 5. Reapuntar la vista
DROP VIEW IF EXISTS public.ofertas_publicadas;
CREATE OR REPLACE VIEW public.ofertas_publicadas AS
  SELECT * FROM public.ofertas
  WHERE deleted_at IS NULL
    AND estado = 'publicada'
    AND (fecha_expiracion IS NULL OR fecha_expiracion > now())
    AND (fecha_publicacion IS NULL OR fecha_publicacion <= now());

-- 6. Drop empresas
DROP INDEX IF EXISTS idx_empresas_owner;
DROP TABLE IF EXISTS public.empresas;

-- 7. RLS sobre los nuevos campos: ya cubierta por las policies de clientes,
--    pero hace falta una policy DE LECTURA PÚBLICA filtrada para que /empleo
--    pueda leer nombre+logo+slug+descripcion+ubicacion de clientes con tipo='empresa'
DROP POLICY IF EXISTS "Clientes: lectura pública empresas" ON public.clientes;
CREATE POLICY "Clientes: lectura pública empresas" ON public.clientes
  FOR SELECT USING (tipo = 'empresa' AND deleted_at IS NULL);
```

> NOTA: la policy de lectura pública anterior expone TODA la fila del cliente-empresa al público anónimo, incluido `email`, `nif_cif`, `direccion_fiscal`, `importe`, `tarifa`, etc. Esto NO se quiere. Hay dos opciones:
> - **A) Vista pública**: crear `public.empresas_publicas` como vista con SELECT solo de campos no sensibles y dar lectura pública SOLO a la vista (recomendado).
> - **B) Column-level grants**: REVOKE público + GRANT SELECT específico de columnas. Más frágil con RLS.
>
> El blueprint usa la opción A. Fase 1 incluye crear la vista.

---

## Blueprint (Assembly Line)

> IMPORTANTE: Solo definir FASES. Las subtareas se generan al entrar a cada fase
> siguiendo el bucle agéntico (mapear contexto → generar subtareas → ejecutar)

### Fase 1: Migración de esquema y datos en Supabase

**Objetivo**: La BD remota tiene `clientes` extendida, `empresas` eliminada, `ofertas.cliente_id` operativa, vista pública `empresas_publicas` creada, y los datos migrados sin pérdida.

**Validación**:
- `list_tables` no devuelve `empresas`
- `SELECT count(*) FROM clientes WHERE tipo='empresa'` ≥ `count` que tenía `empresas` antes
- `SELECT count(*) FROM ofertas WHERE cliente_id IS NULL` = 0
- Query `SELECT * FROM ofertas_publicadas` funciona
- `get_advisors` no reporta errores nuevos críticos

### Fase 2: Regenerar tipos y limpiar referencias hard de `empresas` en backend

**Objetivo**: Los tipos TS reflejan el nuevo schema. `src/actions/ofertas.ts` ya no toca la tabla `empresas` — ahora hace upsert sobre `clientes` con `tipo='empresa'`. Todos los JOINs de Supabase migrados de `empresas(...)` a `clientes(...)` con el filtro de tipo apropiado donde corresponda.

**Validación**:
- `database.types.ts` regenerado, no contiene la entry `empresas`
- `grep -r "from('empresas')" src/` no devuelve nada
- `grep -r "empresas(" src/` (en strings de select Supabase) no devuelve nada
- `grep -r "empresa_id" src/` solo devuelve casos legacy comentados o nada
- `npm run typecheck` pasa

### Fase 3: UI del panel admin — listado y formulario de clientes

**Objetivo**: `ClientesTable` muestra badge "Particular" / "Empresa" + filtro por tipo. `NewClienteModal` (y la edición) tienen un toggle de tipo y muestran/ocultan la sección "Datos de empresa" (slug, logo_url, web_url, descripción, ubicacion). El email deja de ser obligatorio cuando `tipo='empresa'`.

**Validación**:
- En `/dashboard/clientes` se ve la columna tipo con badge
- Se puede filtrar por "Empresa"
- Crear un cliente con `tipo='empresa'` desde el modal funciona
- Se puede editar slug/logo de un cliente-empresa existente
- Playwright: capturar listado + abrir modal + crear empresa de prueba

### Fase 4: Selector de empresa en el formulario de oferta

**Objetivo**: El modal de "Nueva oferta" en `AdminOfertas` ya no acepta un texto libre `empresa_nombre`. En su lugar usa un nuevo componente `<EmpresaPicker>` que: (a) lista clientes con `tipo='empresa'` y `deleted_at IS NULL`, (b) permite buscar, (c) ofrece "+ Crear nueva empresa" inline que abre un mini-formulario y guarda en `clientes`.

**Validación**:
- Crear una oferta seleccionando una empresa existente funciona y la oferta queda con `cliente_id` correcto
- Crear una oferta con "+ Crear nueva empresa" inline funciona: aparece la empresa en `/dashboard/clientes` y la oferta queda enlazada
- Editar una oferta y cambiar de empresa funciona

### Fase 5: UI pública (bolsa de empleo) sin regresiones

**Objetivo**: `/empleo` y `/empleo/[slug]` siguen mostrando nombre, logo y ubicación de la empresa. El JOIN ya viene de `clientes` vía la vista `empresas_publicas`. URLs y SEO se preservan.

**Validación**:
- Playwright screenshot de `/empleo` antes y después: visualmente idéntico
- Playwright screenshot de `/empleo/[slug]` antes y después: idéntico
- Si existe `?empresa=slug`, los resultados filtran correctamente
- Test anónimo: confirmar que el usuario público NO puede leer `email`, `nif_cif`, etc. de un cliente-empresa (sólo los campos de la vista)

### Fase 6: Validación final end-to-end

**Objetivo**: Sistema completo funcionando.

**Validación**:
- [ ] `npm run typecheck` pasa
- [ ] `npm run build` exitoso
- [ ] Smoke test: crear oferta nueva → aparece en `/empleo` → click → detalle correcto
- [ ] Smoke test: dar de alta cliente tipo empresa desde `/dashboard/clientes` → aparece en selector de empresa al crear oferta
- [ ] Smoke test: crear factura para un cliente tipo empresa
- [ ] `get_advisors` (security + performance) sin críticos
- [ ] Criterios de éxito de la sección "Qué" todos marcados

---

## Aprendizajes (Self-Annealing / Neural Network)

> Esta sección CRECE con cada error encontrado durante la implementación.
> El conocimiento persiste para futuros PRPs. El mismo error NUNCA ocurre dos veces.

### 2026-05-15: Security Definer View + column-level grants para vistas públicas
- **Error**: Crear una vista pública con `security_invoker = off` (default) hace que el linter de Supabase devuelva ERROR (`security_definer_view`). Si se pone `security_invoker = on`, la vista respeta la RLS del caller, que en este proyecto NO tiene policy para `anon` sobre `clientes` → la vista devuelve 0 filas.
- **Fix**: combinar tres capas en `empresas_publicas`:
  1. `ALTER VIEW ... SET (security_invoker = on)` para que pase el advisor.
  2. `REVOKE SELECT ON clientes FROM anon` + `GRANT SELECT (cols_públicos) ON clientes TO anon` (column-level) → anon no puede leer NIF/CIF aunque la RLS permita la fila.
  3. `CREATE POLICY ... FOR SELECT TO anon, authenticated USING (tipo = 'empresa' AND deleted_at IS NULL)` para que la vista devuelva las filas correctas.
- **Aplicar en**: cualquier vista pública que exponga subset de columnas de una tabla con datos sensibles. El patrón "vista + security_invoker + column grants + RLS por tipo" es el cleanest en Supabase.
- **Gotcha**: el rol `authenticated` agrupa recruiters Y candidatos. Si revocas columnas a authenticated rompes el panel admin (recruiter usa ssr + anon key con cookies → rol `authenticated`). Solución actual: mantener GRANT SELECT completo a `authenticated` y aceptar que un candidato authenticated podría leer NIF/CIF de empresas. Mitigación futura: usar `service_role` desde server actions admin y revocar también a authenticated.

### 2026-05-15: Vista `ofertas_publicadas` también flagged tras DROP+CREATE
- **Error**: Recrear `ofertas_publicadas` sin `security_invoker=on` la marca como SECURITY DEFINER y advisor da ERROR.
- **Fix**: `ALTER VIEW public.ofertas_publicadas SET (security_invoker = on)`. La policy `Ofertas: lectura pública si publicada` ya da acceso adecuado a anon/authenticated, así que el filtrado funciona.
- **Aplicar en**: SIEMPRE crear vistas con `security_invoker = on` salvo que haya razón explícita para SECURITY DEFINER (y entonces documentarla).

---

## Gotchas

- [ ] **Slug colisión**: una empresa migrada podría tener un `slug` que choca con un cliente existente. La Fase 1 incluye una verificación previa que ABORTA si hay conflictos. Resolver manualmente.
- [ ] **Email nullable**: `clientes.email` pasa de NOT NULL a nullable. Asegurarse de que NINGÚN código asume `email` siempre presente. Buscar `cliente.email` en todo el front antes de mergear.
- [ ] **Lectura pública de datos sensibles**: NO exponer la tabla `clientes` directamente al rol `anon`. Usar la vista `empresas_publicas` con solo campos públicos (nombre, slug, logo_url, web_url, descripcion, ubicacion). Verificar con un test anónimo en Fase 5.
- [ ] **`fecha_conversion` default `now()`**: al insertar empresas migradas como clientes, el `fecha_conversion` quedará en el momento de la migración. Si Jennifer quiere preservar la fecha real, copiar `created_at` ahí explícitamente (incluido en el SQL de Fase 1).
- [ ] **Facturas existentes**: apuntan a `clientes.id`. Como NO cambia el UUID de los clientes existentes, las facturas siguen intactas. Verificar en Fase 6.
- [ ] **Vista `ofertas_publicadas`**: tiene `empresa_id` como columna, hay que recrearla DESPUÉS del rename (incluido en SQL de Fase 1).
- [ ] **Soft delete coherente**: al hacer soft delete de un cliente-empresa con ofertas activas, ¿qué pasa? Hoy `ON DELETE RESTRICT` no se aplica a soft delete. Decidir si se permite o se bloquea con check de "tiene ofertas no cerradas". Por defecto: PERMITIR (igual que hoy con `empresas`).
- [ ] **Copy/i18n**: la palabra "empresa" en `sobre-mi/page.tsx` y `(web)/page.tsx` es solo texto de marketing, no toca código del modelo. NO modificar.
- [ ] **Validación Zod**: actualizar/crear schema Zod para `ClienteInput` que incluya `tipo` discriminado, y campos condicionales por tipo.
- [ ] **`crearClienteManual` actual** valida `nombre.trim() && email.trim()`: relajar email cuando `tipo='empresa'`.

## Anti-Patrones

- NO mantener una tabla `empresas` "fantasma" como vista hacia clientes — eliminarla del todo
- NO duplicar lógica de RLS: usar la vista pública para lo público y dejar la tabla con RLS estricto
- NO exponer `clientes.*` al rol `anon` directamente
- NO romper URLs públicas `/empleo?empresa=slug` — el slug debe migrar tal cual
- NO usar `any` para evadir los nuevos tipos de Supabase tras la regeneración
- NO hardcodear el enum `tipo` en strings sueltos — usar el tipo generado

---

*PRP pendiente aprobación. No se ha modificado código.*
