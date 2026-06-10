---
name: indexacion-google-ofertas-empleo
description: Cómo se indexan las ofertas de empleo en Google — automático vía sitemap; el botón manual solo acelera
metadata:
  type: reference
---

# Indexación de ofertas de empleo en Google (Henkoaching)

Las ofertas publicadas se indexan en Google de forma **automática**. No hay que hacer nada manual por cada oferta.

**Flujo automático:** publicar oferta (`estado = 'publicada'`) → entra sola a `sitemap.xml` → Google la rastrea e indexa por su cuenta (días a ~2-3 semanas).

**"Solicitar indexación"** en Search Console (Inspección de URL) es solo un **acelerador opcional** para ofertas urgentes (horas/días). NO es obligatorio.

**Requisitos (ya cumplidos):**
- `sitemap.xml` enviado en Google Search Console para `henkoaching.com`.
- El sitemap genera las URLs de ofertas automáticamente — ver [[sitemap-ofertas-admin-client]].
- Schema `JobPosting` válido (incluye `validThrough` si la oferta tiene `fecha_expiracion`).

**Para que una oferta DEJE de salir:** despublicarla. La `fecha_expiracion` (→ `validThrough`) hace que Google la retire sola al caducar. Conviene ponerle siempre fecha de caducidad (Google Jobs penaliza ofertas "eternas").

**Comprobar si ya están indexadas:** buscar en Google `site:henkoaching.com/empleo`.
