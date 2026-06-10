# Informe de Auditoría GEO: Henkoaching

**Fecha de auditoría:** 10/06/2026
**URL:** https://henkoaching.com
**Tipo de negocio:** Servicio profesional local — Coaching y consultoría empresarial (híbrido: Local + Agencia + Blog)
**Páginas analizadas:** 12 (sitemap completo) + verificación del schema y metadatos directamente en el código fuente

> **¿Qué es GEO?** El SEO tradicional optimiza para aparecer en Google. El GEO (Generative Engine Optimization) optimiza para que las IA (ChatGPT, Claude, Perplexity, Gemini, los resúmenes de IA de Google) puedan **encontrar, entender, citar y recomendar** tu web. Es donde se está yendo el tráfico.

---

## Resumen Ejecutivo

**Puntuación GEO Global: 54/100 (Bajo — casi Aceptable)**

Henkoaching tiene una **base técnica y de datos estructurados realmente sólida** — renderizado en servidor (Next.js), JSON-LD válido de Organization / BlogPosting / FAQPage / JobPosting, metadatos completos con Open Graph y Twitter Cards, robots.txt abierto y sitemap. En la mecánica de la propia página, vas por delante de la mayoría de coaches de la competencia.

La nota baja por las dos cosas que más pesan para que una IA te *recomiende*: **la autoridad de marca es casi nula** (cero menciones de terceros, sin presencia en Wikipedia/Reddit/prensa, la IA todavía no reconoce la marca como una "entidad") y **el contenido es escaso** (un solo artículo de blog publicado, sin llms.txt, sin schema de Person ni de LocalBusiness). Las IA pueden *leer y entender* tu web sin problema — pero ahora mismo no tienen ninguna confirmación externa que las lleve a *citarte o recomendarte*.

**Mayor fortaleza:** Higiene técnica + datos estructurados.
**Mayor carencia:** Autoridad externa de la marca + volumen de contenido.

### Desglose de la puntuación

| Categoría | Nota | Peso | Nota ponderada |
|---|---|---|---|
| Citabilidad por IA | 58/100 | 25% | 14,5 |
| Autoridad de marca | 25/100 | 20% | 5,0 |
| Contenido E-E-A-T | 62/100 | 20% | 12,4 |
| Técnico GEO | 74/100 | 15% | 11,1 |
| Datos estructurados (Schema) | 70/100 | 10% | 7,0 |
| Optimización por plataforma | 35/100 | 10% | 3,5 |
| **Puntuación GEO Global** | | | **54/100** |

---

## Problemas Críticos (Arreglar de inmediato)

Ninguno. No hay bloqueos a nivel de sitio — todos los bots de IA tienen acceso, el contenido se renderiza en servidor, no hay noindex de dominio, ni errores 5xx en páginas clave, y hay datos estructurados. Es un punto de partida sano.

---

## Prioridad Alta (Arreglar esta semana)

1. **No existe el archivo `llms.txt`** — `https://henkoaching.com/llms.txt` devuelve error 404. Es el estándar emergente que le dice a las IA cómo leer tu web, quién es la entidad y qué páginas importan. Para una marca sin presencia externa, es la forma más rápida de darle a las IA una "ficha" limpia de quién eres.
2. **La IA y los buscadores no reconocen la marca** — Las búsquedas de "Henkoaching" y "Jennifer Cervera coaching Mallorca" devuelven **cero** resultados; solo aparecen competidores genéricos. Las IA no tienen ninguna señal de que este negocio existe. Es lo que más lastra toda la puntuación.
3. **Sin schema `Person` / `ProfilePage` para Jennifer Cervera** — La página `/sobre-mi` tiene un E-E-A-T humano fuerte (credenciales, foto, biografía) pero nada de eso es legible por máquina como una entidad `Person` con `alumniOf`, `knowsAbout`, `sameAs`. La IA no puede conectar a la fundadora con la organización como entidad estructurada.
4. **Schema `Organization` genérico en lugar de `LocalBusiness` / `ProfessionalService`** — Es un servicio local de Palma. El schema actual omite `geo` (coordenadas), `openingHours` (horario), `areaServed` (zona de servicio) y `priceRange`, datos que alimentan las respuestas locales de los resúmenes de IA de Google.

---

## Prioridad Media (Arreglar este mes)

1. **Poco volumen de contenido** — Solo **un** artículo de blog publicado (`/blog/lo-que-aprendi...`). Las IA premian la autoridad temática construida con un corpus de contenido. Un artículo no basta para que te traten como fuente experta en liderazgo/RRHH/coaching.
2. **Sin schema `BreadcrumbList`** — Los artículos muestran las migas de pan visuales (Inicio / Blog / Categoría) pero no emiten el JSON-LD `BreadcrumbList`, así que la IA no puede reconstruir la jerarquía del sitio.
3. **Sin schema `Service` en `/servicios`** — Las tres líneas de servicio (Orden y Estructura, Reclutamiento Consciente, Liderazgo) son solo texto de marketing; ninguna está expuesta como entidad `Service`/`OfferCatalog`.
4. **El contenido del blog es reflexivo y sin citas** — El artículo es auténtico y vivencial (bueno para la "Experiencia" del E-E-A-T) pero no cita datos, estudios ni fuentes externas, lo que limita su peso como referencia *autorizada* que una IA citaría.
5. **Sin presencia fuera de la web propia** — Ni YouTube, ni Reddit, ni Wikipedia, ni artículos invitados o directorios más allá de un Perfil de Google Business (~12 reseñas). Las IA se apoyan en estas menciones (Ahrefs, dic. 2025: las menciones correlacionan 3× más que los backlinks).

---

## Prioridad Baja (Optimizar cuando se pueda)

1. `/servicios` y `/contacto` no tienen imagen Open Graph propia (tampoco hay una `og:image` por defecto en la raíz — no hay `og:image` configurada en ningún sitio).
2. Sin horario comercial ni mapa embebido en `/contacto` (refuerza la falta de señales de LocalBusiness).
3. Las respuestas FAQ de `/servicios` se renderizan dentro de un componente cliente y están plegadas — están en el HTML del servidor (bien), pero conviene confirmar que siguen siendo rastreables sin interacción JS.
4. La firma del autor en el blog es texto plano, no enlaza a una página de perfil del autor.
5. El `sameAs` solo lista Instagram + LinkedIn — añade el Perfil de Google Business y, en el futuro, YouTube/Facebook para reforzar la identificación de la entidad.

---

## Análisis por Categoría

### Citabilidad por IA (58/100)
**Bien:** `/servicios` usa encabezados en forma de pregunta (`¿Cómo trabajo?`, `¿Por dónde empezamos?`) con un schema `FAQPage` real y bloques de pregunta-respuesta — es la estructura más citable de la web. El artículo del blog tiene buena jerarquía de encabezados y una voz propia y citable.
**Flojo:** La mayoría del texto de inicio y servicios es prosa persuasiva de marketing ("Cuando una empresa crece o cambia, el orden deja de ser opcional") en lugar de pasajes factuales y autocontenidos. El poco volumen de contenido deja pocos pasajes que citar. No hay estadísticas, definiciones ni bloques tipo "qué es X" que tanto le gustan a la IA.
**Acción:** Añade pasajes de definición/explicación ("¿Qué es el reclutamiento consciente?", "¿Qué incluye una consultoría de operaciones?") escritos como unidades de respuesta independientes.

### Autoridad de marca (25/100)
**Realidad:** Hoy la marca es prácticamente invisible para la IA. Las búsquedas concretas solo sacan competidores (Capital Humano Consulting, Instituto de Excelencia Humana, Malagrava, coachpalma.com) — nunca Henkoaching. Activos actuales: web propia, Instagram (@henkoaching), LinkedIn (Jennifer Cervera) y un Perfil de Google Business con ~12 reseñas de 5 estrellas.
**Falta:** Entidad en Wikipedia/Wikidata, menciones en Reddit/foros, cobertura en prensa o medios locales, apariciones en podcast/YouTube, fichas en directorios (Doctoralia, TopDoctors, Cámara de Comercio, infoisinfo), artículos invitados.
**Acción:** Es el área de mayor impacto. Construye fichas y menciones ganadas (ver plan de 30 días).

### Contenido E-E-A-T (62/100)
**Experiencia/Pericia — fuerte:** Fundadora con nombre y credenciales verificables — Programa Avanzado de Coaching (EAE Business School 2022–2023), Grado en ADE por la Universitat de les Illes Balears, roles de RRHH/bienestar/operaciones en Iberostar (2020–2024), instructora de meditación. Foto, biografía y valores presentes.
**Autoridad/Confianza — escaso:** Solo un artículo, sin entidad de autor, sin citas de fuentes, sin validación de terceros, sin casos de éxito con resultados concretos. Existe página legal (`/legal`).
**Acción:** Publica con regularidad, añade casos de éxito, expón a la autora como `Person` estructurada, añade testimonios con schema.

### Técnico GEO (74/100)
**Fuerte:** Renderizado en servidor (Next.js App Router, `force-dynamic` en páginas dinámicas) — las IA reciben el HTML completo. `robots.txt` permite todos los agentes (`User-Agent: *  Allow: /`) y solo bloquea zonas de login/dashboard — GPTBot, ClaudeBot, PerplexityBot y Google-Extended tienen acceso. Sitemap declarado. `metadataBase` configurado, título/descripción completos, Open Graph + Twitter Cards, favicon, `lang="es"`, canonicals en el blog.
**Carencias:** Sin `llms.txt`; sin `og:image` por defecto; sin bloque explícito de permiso a bots de IA (no obligatorio, pero es una señal clara). Responsive con Tailwind.
**Acción:** Publica `llms.txt` y añade una imagen por defecto para compartir.

### Datos estructurados / Schema (70/100)
**Presentes y válidos:**
- `Organization` (raíz, todas las páginas) — nombre, razón social, dirección, fundadora, contacto, logo, `sameAs`
- `BlogPosting` (artículos) — autor, editor, fechas, imagen, mainEntityOfPage
- `FAQPage` (servicios)
- `JobPosting` (detalle de empleo) — apto para Google for Jobs, bien construido (tipo de empleo, ubicación, salario)
**Falta/Mejorar:**
- Subir `Organization` → `ProfessionalService` o `LocalBusiness` (añadir `geo`, `openingHoursSpecification`, `areaServed`, `priceRange`)
- Añadir schema `Person` para Jennifer (enlazar `worksFor` → Organization, `alumniOf`, `knowsAbout`)
- Añadir `BreadcrumbList` en blog y categorías
- Añadir `Service` / `OfferCatalog` en `/servicios`

### Optimización por plataforma (35/100)
**Resúmenes de IA de Google:** El canal mejor posicionado — el Perfil de Google Business + schema local pueden ganar búsquedas locales de coaching en cuanto escalen el marcado LocalBusiness y las reseñas.
**ChatGPT / Perplexity / Gemini:** Ahora mismo sin vía a la cita — dependen del corpus web + menciones de marca que aún no existen. El acceso de los bots está abierto, así que a medida que crezca la autoridad, llegará la indexación.
**Acción:** Trata el Perfil de Google Business + fichas en directorios como la victoria a corto plazo; las menciones ganadas desbloquean los motores de chat.

---

## Victorias Rápidas (Implementar esta semana)

1. **Publicar `llms.txt`** en la raíz del sitio — define la entidad (Henkoaching, Jennifer Cervera, Palma de Mallorca), resume los tres servicios y lista las URLs clave. (Ejecuta `/geo llmstxt https://henkoaching.com` para generarlo automáticamente.)
2. **Añadir schema `Person`** para Jennifer Cervera en `/sobre-mi`, enlazado a la Organización vía `worksFor`/`founder`.
3. **Subir `Organization` → `ProfessionalService`** con `geo`, `openingHours`, `areaServed: "Illes Balears"`, `priceRange`.
4. **Añadir una `og:image` por defecto** en los metadatos de la raíz (ahora no hay — cada vez que se comparte en redes/IA no aparece imagen).
5. **Reclamar/optimizar fichas en directorios** — Doctoralia, TopDoctors, infoisinfo, Cámara de Comercio de Mallorca, Perfil de Google Business — con NAP idéntico (Calle Pere Quintana 25, 07008 Palma; 633 65 76 65; info@henkoaching.com).

## Plan de Acción a 30 Días

### Semana 1: Entidad legible por máquina
- [ ] Generar y publicar `llms.txt`
- [ ] Añadir schema `Person` (Jennifer) + subir Organization → ProfessionalService/LocalBusiness
- [ ] Añadir schema `BreadcrumbList` y `Service`
- [ ] Añadir `og:image` por defecto

### Semana 2: Profundidad de contenido
- [ ] Publicar 2 artículos nuevos orientados a preguntas ("¿Cómo estructurar una empresa que crece demasiado rápido?", "Qué es el reclutamiento consciente")
- [ ] Añadir 2–3 bloques de definición/explicación a `/servicios` como pasajes de respuesta independientes
- [ ] Añadir 1 caso de éxito (resultado de cliente anonimizado con antes/después concreto)

### Semana 3: Autoridad externa
- [ ] Crear fichas consistentes en 5+ directorios (NAP idéntico)
- [ ] Publicar 1 artículo invitado o mención en medio local (Cámara de Comercio, prensa de empresa local)
- [ ] Optimizar la página de empresa en LinkedIn + el perfil de Jennifer; enlazar a la web
- [ ] Crear una entrada en Wikidata para Henkoaching como organización

### Semana 4: Reseñas y refuerzo
- [ ] Conseguir nuevas reseñas en Google (objetivo 25+) — la señal local más fuerte para los resúmenes de IA
- [ ] Añadir schema de reseñas/testimonios a la web
- [ ] Publicar 1 artículo más; establecer una cadencia semanal
- [ ] Repetir `/geo audit` para medir la mejora

---

## Anexo: Páginas Analizadas

| URL | Título | Notas GEO |
|---|---|---|
| / | Henkoaching — Coaching & Mindfulness Empresarial | Schema Org, metadatos completos; H1 de marketing |
| /servicios | Servicios — Henkoaching | Schema FAQPage ✅; añadir Service |
| /sobre-mi | Sobre mí — Henkoaching | E-E-A-T humano fuerte; sin schema Person |
| /contacto | Contacto — Henkoaching | NAP presente; sin horario/mapa/LocalBusiness |
| /empleo | Empleo — Henkoaching | Schema JobPosting en detalle ✅ |
| /blog | Blog — Henkoaching | Solo 1 artículo publicado (escaso) |
| /blog/lo-que-aprendi-escuchando-lideres... | Artículo | Schema BlogPosting ✅; vivencial, sin citas |
| /blog/categoria/liderazgo | Categoría | Sin schema BreadcrumbList |
| /blog/categoria/coaching | Categoría | Sin schema BreadcrumbList |
| /blog/categoria/rrhh | Categoría | Sin schema BreadcrumbList |
| /blog/categoria/cultura | Categoría | Sin schema BreadcrumbList |
| /legal | Aviso legal | Señal de confianza presente ✅ |

---

*Generado por la skill de auditoría GEO-SEO. Metodología: GEO primero (cita y recomendación por IA), SEO de apoyo. Puntuación verificada contra la web en vivo + el código fuente desplegado.*
