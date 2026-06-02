# PRP-006: Panel de Empresa

> **Estado**: PENDIENTE
> **Fecha**: 2026-06-02
> **Proyecto**: Henkoaching — Portal de Empleo

---

## Objetivo

Crear un área privada para el rol `empresa` en `/empresa/dashboard`, con layout propio (sidebar igual al de admin), página de bienvenida, acceso a sus ofertas publicadas, candidatos recibidos en esas ofertas y edición de su perfil de empresa, vinculada mediante `owner_user_id` en la tabla `clientes`.

## Por Qué

| Problema | Solución |
|----------|----------|
| Las empresas clientes no tienen acceso propio al portal; solo el recruiter (Jennifer) puede gestionar sus ofertas | Un panel exclusivo para el rol `empresa` les da autonomía para ver sus procesos activos |
| No existe vinculación entre un usuario `empresa` y su registro en `clientes` | Añadir `owner_user_id uuid REFERENCES auth.users(id)` a `clientes` y RLS específica |
| El flujo de login no distingue `empresa` de `candidato` ni de admin; todos acaban en `/dashboard` o `/candidato/dashboard` | Redirigir `profile.role === 'empresa'` a `/empresa/dashboard` en el layout `(main)` |

**Valor de negocio**: Las empresas que contratan el portal de selección pueden hacer seguimiento en tiempo real de sus candidatos sin depender de Jennifer, lo que reduce fricción y aumenta la percepción de valor del servicio.

## Qué

### Criterios de Éxito
- [ ] Al hacer login con rol `empresa`, el usuario aterriza en `/empresa/dashboard` (no en `/dashboard`)
- [ ] El layout `/empresa/` muestra sidebar con las secciones: Inicio, Mis Ofertas, Candidatos, Mi Perfil
- [ ] La página de Mis Ofertas lista solo las ofertas cuyo `cliente_id` coincide con el `clientes.id` del usuario
- [ ] La página de Candidatos lista las solicitudes de esas ofertas con nombre, estado y fecha
- [ ] La página Mi Perfil permite editar datos básicos del registro en `clientes` (nombre, email, teléfono, descripción, logo)
- [ ] RLS activa: la empresa solo ve `clientes`, `ofertas` y `solicitudes` que le pertenecen
- [ ] `npm run typecheck` y `npm run build` pasan sin errores

### Comportamiento Esperado

1. Usuario con `profiles.role = 'empresa'` hace login desde `/login` (o `/candidato/login`).
2. El layout `(main)` detecta el rol `empresa` y redirige a `/empresa/dashboard`.
3. El layout `/empresa/` lee el `clientes` row con `owner_user_id = user.id`, obtiene `cliente_id`.
4. Muestra sidebar simplificado (Inicio, Mis Ofertas, Candidatos, Mi Perfil).
5. **Inicio**: bienvenida con nombre empresa + resumen (N ofertas activas, M candidatos totales).
6. **Mis Ofertas**: tabla de ofertas de la empresa con título, estado, fecha publicación, N solicitudes.
7. **Candidatos**: tabla de solicitudes cruzando por `oferta.cliente_id = clientes.id`, con nombre candidato, puesto, estado, fecha.
8. **Mi Perfil**: formulario editable con datos de `clientes` (nombre, email, teléfono, descripción, logo_url, ubicacion, web_url).

---

## Contexto

### Referencias
- `src/app/(main)/layout.tsx` — patrón de layout con rol + redirect + DashboardShell
- `src/app/candidato/dashboard/page.tsx` — patrón de redirect por rol al hacer login
- `src/components/DashboardShell.tsx` — componente de shell reutilizable con `sections: NavSection[]`
- `src/features/clientes/components/ClienteFicha.tsx` — formulario existente de edición de cliente (reutilizable parcialmente)
- `src/features/empleo/components/AdminOfertas.tsx` — tabla de ofertas (patrón a seguir)
- `src/features/empleo/components/AdminSolicitudes.tsx` — tabla de solicitudes (patrón a seguir)

### Arquitectura Propuesta (Feature-First)

```
src/
├── app/
│   └── empresa/
│       ├── layout.tsx              # Server component — auth + redirect + DashboardShell
│       ├── dashboard/
│       │   └── page.tsx            # Overview/bienvenida
│       ├── ofertas/
│       │   └── page.tsx            # Mis Ofertas
│       ├── candidatos/
│       │   └── page.tsx            # Candidatos recibidos
│       └── perfil/
│           └── page.tsx            # Mi Perfil (edición)
│
└── features/
    └── empresa/
        ├── components/
        │   ├── EmpresaDashboardOverview.tsx   # Bienvenida + stats
        │   ├── EmpresaOfertasTable.tsx         # Tabla de ofertas
        │   ├── EmpresaCandidatosTable.tsx      # Tabla de solicitudes
        │   └── EmpresaPerfilForm.tsx           # Formulario edición perfil
        ├── actions/
        │   └── empresa.ts                     # Server Actions: updateEmpresaPerfil
        └── types/
            └── index.ts                       # Tipos: EmpresaCliente, EmpresaOferta, etc.
```

### Modelo de Datos

**Cambio en `clientes`**: añadir columna `owner_user_id`.

```sql
-- Migración: añadir owner_user_id a clientes
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_clientes_owner_user_id ON public.clientes(owner_user_id);

-- RLS: empresa solo ve su propio registro
CREATE POLICY "Clientes: empresa ve el suyo"
  ON public.clientes FOR SELECT
  USING (owner_user_id = auth.uid());

CREATE POLICY "Clientes: empresa actualiza el suyo"
  ON public.clientes FOR UPDATE
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

-- RLS ofertas: empresa ve las suyas
CREATE POLICY "Ofertas: empresa ve las suyas"
  ON public.ofertas FOR SELECT
  USING (
    cliente_id IN (
      SELECT id FROM public.clientes WHERE owner_user_id = auth.uid()
    )
  );

-- RLS solicitudes: empresa ve solicitudes de sus ofertas
CREATE POLICY "Solicitudes: empresa ve las suyas"
  ON public.solicitudes FOR SELECT
  USING (
    oferta_id IN (
      SELECT o.id FROM public.ofertas o
      JOIN public.clientes c ON c.id = o.cliente_id
      WHERE c.owner_user_id = auth.uid()
    )
  );
```

**Función helper** (evita repetir subconsulta en RLS):

```sql
CREATE OR REPLACE FUNCTION is_empresa()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE
AS $$ SELECT EXISTS (
  SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'empresa'
) $$;
```

### Notas de arquitectura
- El layout `src/app/(main)/layout.tsx` ya tiene `if (profile?.role === 'candidato') redirect('/candidato/dashboard')`. Hay que añadir `if (profile?.role === 'empresa') redirect('/empresa/dashboard')` antes del bloque de admin.
- El nuevo `src/app/empresa/layout.tsx` es análogo a `(main)/layout.tsx` pero con secciones reducidas y verificando que el usuario tenga rol `empresa`.
- `DashboardShell` es reutilizable tal cual — solo cambia las `sections`.
- La edición de perfil de empresa usa un Server Action en `features/empresa/actions/empresa.ts`, siguiendo el patrón de `actions/clientes.ts`.
- **No crear** un nuevo formulario de login para empresa — usa el mismo flujo de auth de `(auth)/login`. El redirect correcto se gestiona en el layout.

---

## Blueprint (Assembly Line)

> IMPORTANTE: Solo definir FASES. Las subtareas se generan al entrar a cada fase.

### Fase 1: Migración de BD y RLS
**Objetivo**: Columna `owner_user_id` en `clientes` + todas las políticas RLS para el rol `empresa` activas y testeadas.
**Validación**: SQL ejecutado sin errores; `SELECT * FROM pg_policies WHERE tablename IN ('clientes','ofertas','solicitudes')` muestra las nuevas políticas.

### Fase 2: Redirect en layout `(main)` y layout `/empresa/`
**Objetivo**: El flujo de autenticación redirige correctamente según rol. El layout `/empresa/layout.tsx` carga el `cliente` vinculado y renderiza el `DashboardShell` con las secciones de empresa.
**Validación**: Un usuario con rol `empresa` que hace login llega a `/empresa/dashboard`; un admin sigue en `/dashboard`; un candidato en `/candidato/dashboard`.

### Fase 3: Páginas del panel (Overview, Ofertas, Candidatos, Perfil)
**Objetivo**: Las 4 páginas del panel de empresa implementadas con sus componentes en `features/empresa/`.
**Validación**: Cada página carga datos reales desde Supabase, muestra el contenido correcto y no tiene errores TypeScript.

### Fase 4: Server Action — actualizar perfil de empresa
**Objetivo**: El formulario de `EmpresaPerfilForm` guarda cambios en `clientes` mediante un Server Action protegido por `owner_user_id`.
**Validación**: Editar nombre/descripción desde `/empresa/perfil` persiste en BD y la página se refresca con los nuevos datos.

### Fase 5: Validación Final
**Objetivo**: Sistema funcionando end-to-end, tipado correcto, sin regresiones.
**Validación**:
- [ ] `npm run typecheck` pasa sin errores
- [ ] `npm run build` exitoso
- [ ] Playwright screenshot confirma que `/empresa/dashboard` carga con el sidebar correcto
- [ ] Admin, candidato y empresa redirigen cada uno a su dashboard correcto
- [ ] Criterios de éxito del PRP cumplidos

---

## Gotchas

- [ ] La policy de `clientes` existente `"Clientes: recruiter all"` usa `is_recruiter()` (función que comprueba si el role es admin o recruiter). Las nuevas políticas de empresa deben ser adicionales, NO reemplazarlas.
- [ ] La policy `"Clientes: authenticated lee empresas públicas"` permite a cualquier usuario autenticado leer clientes de tipo empresa con `deleted_at IS NULL`. Hay que revisar que no colisione (no debería, Supabase usa OR entre policies del mismo comando).
- [ ] La columna `owner_user_id` no existía antes — al vincular empresas existentes habrá que actualizarlo manualmente desde el panel de admin o mediante un script SQL.
- [ ] `DashboardShell` importa `useEmailStore` y `useCandidatosStore`. El layout de empresa no necesita los pollers. Usar el Shell tal cual (los stores simplemente tendrán count=0).
- [ ] El rol `empresa` ya existe en el enum `user_role` (`admin`, `recruiter`, `candidato`, `empresa`) — no hay que añadirlo.
- [ ] Los Server Actions de empresa deben verificar que `clientes.owner_user_id = auth.uid()` antes de hacer cualquier UPDATE, como segunda línea de defensa además de RLS.

## Anti-Patrones

- NO crear un login separado para empresa — reusar el flujo `(auth)/login` con redirect automático
- NO duplicar `DashboardShell` — pasarle las `sections` correctas para empresa
- NO ignorar errores de TypeScript
- NO hardcodear el `cliente_id` — siempre derivarlo de `owner_user_id` en el Server Component del layout
- NO omitir RLS — las páginas del panel de empresa son Server Components pero RLS es la línea de defensa en BD

---

## Aprendizajes (Self-Annealing)

> Esta sección crece con cada error encontrado durante la implementación.

---

*PRP pendiente aprobación. No se ha modificado código.*
