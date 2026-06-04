# PRP-009: Remediación auditoría RGPD / EU AI Act

> **Estado**: PENDIENTE
> **Fecha**: 2026-06-04
> **Proyecto**: Henkoaching — Portal de empleo Jennifer Cervera

---

## Objetivo

Remediar todos los hallazgos priorizados de la auditoría de cumplimiento RGPD/EU AI Act:
headers de seguridad HTTP en `next.config.ts`, purga de la tabla `email_envios` en el cron de retención, vinculación de `email_confirmed_at` de Supabase Auth con `consent_confirmed_at` en `candidato_profiles`, y actualización de la política de privacidad para reflejar el DPA firmado con Piensa Solutions.

---

## Por Qué

| Problema | Solución |
|----------|----------|
| El servidor no envía headers CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy ni Permissions-Policy; cualquier auditoría HTTP o inspector de seguridad lo marca como crítico | Añadir `headers()` en `next.config.ts` con la política completa |
| La tabla `email_envios` almacena el HTML completo de los emails (datos personales) indefinidamente; viola el principio de limitación del plazo de conservación (art. 5.1.e RGPD) | Ampliar el cron de retención para purgar registros de `email_envios` con más de 12 meses |
| Cuando un candidato confirma su email en Supabase Auth, el campo `email_confirmed_at` no se sincroniza con `candidato_profiles`, por lo que el registro de consentimiento queda incompleto | Añadir un trigger de base de datos que escriba `consent_confirmed_at` en `candidato_profiles` cuando el usuario confirma el email en Auth |
| La política de privacidad muestra a Piensa Solutions sin la mención explícita de "DPA firmado", a diferencia de Supabase y Vercel que sí lo tienen; genera riesgo de reproche regulatorio | Actualizar la celda de garantía de Piensa Solutions en `src/app/(web)/legal/page.tsx` para indicar DPA firmado |

**Valor de negocio**: Eliminar los 4 hallazgos de riesgo alto/medio de la auditoría de cumplimiento, dejar la aplicación lista para una inspección de la AEPD y cumplir con el EU AI Act (art. 4 — obligación de alfabetización IA ya operativa desde febrero 2025).

---

## Qué

### Criterios de Éxito

- [ ] `curl -I https://henkoaching.com` devuelve `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy` y `Permissions-Policy`
- [ ] El cron `/api/cron/retencion` elimina registros de `email_envios` con más de 12 meses y lo registra en el log de auditoría
- [ ] Al confirmar el email de un candidato de prueba, `candidato_profiles.consent_confirmed_at` se actualiza automáticamente vía trigger de BD
- [ ] La política de privacidad en `/legal#privacidad` muestra "DPA firmado" con enlace para Piensa Solutions (coherente con Supabase y Vercel)
- [ ] `npm run typecheck` pasa sin errores
- [ ] `npm run build` exitoso

### Comportamiento Esperado

**Happy Path — Headers:**
El navegador recibe los headers de seguridad en cada respuesta HTTP de la app. El CSP permite los dominios de Supabase y las fuentes de Tailwind. X-Frame-Options impide que la app se embeba en iframes de terceros.

**Happy Path — Retención email_envios:**
El cron diario de las 03:00 UTC detecta filas en `email_envios` con `created_at < NOW() - INTERVAL '12 months'`, las elimina y añade una entrada en `audit_logs` con `accion: 'rgpd.purga_email_envios'` y el recuento de filas borradas.

**Happy Path — Consent confirmado:**
Un candidato hace clic en el enlace de confirmación de email de Supabase. El trigger `on_user_email_confirmed` detecta la actualización de `email_confirmed_at` en `auth.users` y escribe `NOW()` en `candidato_profiles.consent_confirmed_at` para ese `user_id`.

**Happy Path — Política privacidad:**
La tabla de destinatarios en `/legal#privacidad` muestra para Piensa Solutions: enlace "DPA firmado" a `https://www.piensasolutions.com/legal/privacidad` y el texto complementario de que es empresa española sujeta a RGPD/LOPDGDD.

---

## Contexto

### Referencias clave

- `next.config.ts` — donde van los headers HTTP (actualmente sin `headers()`)
- `src/app/api/cron/retencion/route.ts` — cron de purga (añadir sección `email_envios`)
- `src/lib/email/send.ts` — para entender qué contiene `email_envios` (campos: `para`, `asunto`, `html`, `tipo`, `estado`, `sent_at`)
- `src/app/(web)/legal/page.tsx` — política de privacidad (tabla de destinatarios, fila Piensa Solutions)
- `src/lib/supabase/database.types.ts` — para comprobar si `consent_confirmed_at` ya existe en `candidato_profiles`

### Arquitectura Propuesta

No se crean nuevas features ni carpetas. Los cambios son quirúrgicos en archivos existentes + una migración SQL:

```
next.config.ts                          ← Fase 1: headers CSP completo
src/app/api/cron/retencion/route.ts     ← Fase 2: añadir purgarEmailEnvios()
supabase/migrations/                    ← Fase 3: trigger consent_confirmed_at
src/app/(web)/legal/page.tsx            ← Fase 4: DPA Piensa Solutions
```

### Modelo de Datos

**Fase 2 — email_envios** (tabla existente, sin cambios de schema):
- Purga: `DELETE FROM email_envios WHERE created_at < NOW() - INTERVAL '12 months'`
- La columna `html` contiene el cuerpo del email (dato personal); su eliminación a los 12 meses es la medida de privacidad.

**Fase 3 — candidato_profiles.consent_confirmed_at** (columna puede no existir):

```sql
-- Verificar si la columna existe; si no, añadirla
ALTER TABLE public.candidato_profiles
  ADD COLUMN IF NOT EXISTS consent_confirmed_at TIMESTAMPTZ;

-- Trigger en auth.users para propagar email_confirmed_at
CREATE OR REPLACE FUNCTION public.sync_email_confirmed_to_candidato()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Solo actuar cuando email_confirmed_at pasa de NULL a un valor
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    UPDATE public.candidato_profiles
    SET consent_confirmed_at = NEW.email_confirmed_at
    WHERE user_id = NEW.id
      AND consent_confirmed_at IS NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_user_email_confirmed ON auth.users;
CREATE TRIGGER on_user_email_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_email_confirmed_to_candidato();
```

### Notas sobre CSP (Fase 1)

La directiva `Content-Security-Policy` debe permitir:
- `self` para todos los orígenes propios
- `cardgrqwqktjsssodtzp.supabase.co` para fetch (API + storage)
- `'unsafe-inline'` en `style-src` por Tailwind (clases dinámicas) — o usar `nonce` si se quiere más estricto
- `data:` en `img-src` para base64 y `blob:` para los PDFs generados client-side
- Vercel Live (`vercel.live`) solo en desarrollo

Política conservadora (sin romper la app):
```
default-src 'self';
script-src 'self' 'unsafe-eval' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: https://cardgrqwqktjsssodtzp.supabase.co https://images.unsplash.com;
font-src 'self';
connect-src 'self' https://cardgrqwqktjsssodtzp.supabase.co wss://cardgrqwqktjsssodtzp.supabase.co https://api.openrouter.ai;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

---

## Blueprint (Assembly Line)

> IMPORTANTE: Solo se definen FASES. Las subtareas se generan al entrar a cada fase
> siguiendo el bucle agéntico (mapear contexto → generar subtareas → ejecutar).

### Fase 1: Headers de seguridad HTTP en next.config.ts
**Objetivo**: Añadir la función `headers()` en `next.config.ts` con CSP, X-Frame-Options (`DENY`), X-Content-Type-Options (`nosniff`), Referrer-Policy (`strict-origin-when-cross-origin`) y Permissions-Policy (deshabilitar cámara, micrófono, geolocalización). Aplicar a todas las rutas (`source: '/(.*)'`).
**Validación**: `npm run build` exitoso. En dev, las DevTools del navegador muestran los headers en la pestaña Network de cualquier respuesta HTML.

### Fase 2: Purga de email_envios en el cron de retención
**Objetivo**: Añadir la función `purgarEmailEnviosAntiguos(admin)` en `src/app/api/cron/retencion/route.ts` que elimine filas con `created_at < NOW() - 12 meses` y registre el resultado en `audit_logs` con `accion: 'rgpd.purga_email_envios'`. Integrar la llamada y el log en el objeto de respuesta del GET handler.
**Validación**: Invocar el endpoint localmente con el header `Authorization: Bearer [CRON_SECRET]` y verificar que el JSON de respuesta incluye `email_envios_purgados`.

### Fase 3: Trigger BD para consent_confirmed_at
**Objetivo**: Crear la migración SQL que (1) añade `consent_confirmed_at TIMESTAMPTZ` a `candidato_profiles` si no existe, y (2) crea la función trigger `sync_email_confirmed_to_candidato` + el trigger `on_user_email_confirmed` sobre `auth.users`. Aplicar con `mcp__supabase__apply_migration`.
**Validación**: Ejecutar `SELECT consent_confirmed_at FROM candidato_profiles LIMIT 5` con `mcp__supabase__execute_sql`. Verificar que la columna existe. Si hay usuarios ya confirmados, actualizar retroactivamente los que tienen `email_confirmed_at` pero no `consent_confirmed_at`.

### Fase 4: Política de privacidad — DPA Piensa Solutions
**Objetivo**: En `src/app/(web)/legal/page.tsx`, en la fila de Piensa Solutions dentro de la tabla de destinatarios, actualizar la celda de "Garantía" para añadir el enlace "DPA firmado" apuntando a `https://www.piensasolutions.com/legal/privacidad` y mantener la mención de empresa española sujeta a RGPD/LOPDGDD. El formato debe ser coherente con las filas de Supabase y Vercel.
**Validación**: Revisar visualmente en dev que la celda muestra "DPA firmado · Política de privacidad" con los enlaces correspondientes.

### Fase 5: Validación Final
**Objetivo**: Sistema con todos los hallazgos remediados y funcionando end-to-end.
**Validación**:
- [ ] `npm run typecheck` pasa sin errores
- [ ] `npm run build` exitoso
- [ ] Headers presentes: verificar con `curl -I http://localhost:3000` (en dev) o en browser DevTools
- [ ] Cron devuelve campo `email_envios_purgados` en la respuesta JSON
- [ ] `candidato_profiles.consent_confirmed_at` columna existe en Supabase
- [ ] Fila Piensa Solutions en `/legal#privacidad` tiene enlace "DPA firmado"

---

## Aprendizajes (Self-Annealing)

> Esta sección CRECE con cada error encontrado durante la implementación.
> El conocimiento persiste para futuros PRPs. El mismo error NUNCA ocurre dos veces.

_(vacío — se completa durante la implementación)_

---

## Gotchas

- [ ] El trigger `on_user_email_confirmed` debe crearse sobre `auth.users`, que es un schema interno de Supabase. Requiere privilegios de superuser (disponibles via `apply_migration`). NO usar `execute_sql` para esto (permisos insuficientes).
- [ ] El CSP con `'unsafe-inline'` en `script-src` es necesario por Next.js App Router (inline scripts de hidratación). Si se pone `nonce`, Next.js 16 lo soporta pero requiere middleware adicional — postponer para una fase posterior.
- [ ] `email_envios` puede no existir en `database.types.ts` porque se accede via `as never`. No añadir tipos ahora; solo la lógica de purga.
- [ ] La retención de `email_envios` a 12 meses debe coincidir con lo declarado en la política de privacidad. Si se añade a la política, verificar que el período es consistente con el cron.
- [ ] El trigger retroactivo (Fase 3) para usuarios ya confirmados debe ejecutarse como SQL manual tras crear el trigger, no en el trigger mismo (para evitar afectar usuarios futuros con lógica del pasado).

## Anti-Patrones

- NO crear nuevos patrones si los existentes funcionan
- NO ignorar errores de TypeScript
- NO hardcodear valores (usar constantes para los meses de retención)
- NO omitir validación Zod en inputs de usuario
- NO poner `frame-ancestors 'none'` en `X-Frame-Options` Y en CSP duplicado — usar uno de los dos (CSP `frame-ancestors` es más moderno y prevalece)

---

*PRP pendiente aprobación. No se ha modificado código.*
