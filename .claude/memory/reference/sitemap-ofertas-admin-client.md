---
name: sitemap-ofertas-admin-client
description: El sitemap de ofertas necesita createAdminClient — createClient (RLS) devuelve vacío sin sesión
metadata:
  type: reference
---

# El sitemap de ofertas debe usar createAdminClient

`getOfertasSlugsPublicados()` en `src/features/empleo/queries.ts` (alimenta `src/app/sitemap.ts`) debe usar `createAdminClient()`, NO `createClient()`.

**Por qué:** el sitemap se genera server-side **sin sesión de usuario**. Con `createClient()` las políticas RLS de la tabla `ofertas` bloquean la lectura anónima → devuelve `[]` → ninguna oferta entra al `sitemap.xml` → Google nunca descubre las ofertas individuales (`/empleo/[slug]`).

**Bug corregido** el 2026-06-10 (commit `ea419ff`). Antes el sitemap solo tenía `/empleo` (listado) pero ninguna oferta.

Las demás queries públicas de ofertas (`getOfertasPublicadas`, `getOfertaPorSlug`) ya usaban `createAdminClient()` correctamente — solo el sitemap se quedó atrás.

Mismo patrón RLS que [[verifactu_f4_service_role]]: lecturas/escrituras sin sesión necesitan service_role/admin client.

Relacionado: [[indexacion-google-ofertas-empleo]].
