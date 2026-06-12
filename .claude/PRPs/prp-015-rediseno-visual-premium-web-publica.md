# PRP-015: Rediseño Visual Premium de la Web Pública

> **Estado**: COMPLETADO (2026-06-12, rama `prp-015-rediseno-visual`, pendiente de validación visual del usuario y merge a master)
> **Fecha**: 2026-06-12
> **Proyecto**: Henkoaching (Jennifer Cervera)

---

## Objetivo

Elevar la estética de toda la web pública (`(web)`: home, servicios, sobre mí, contacto, empleo, blog) de "web cualquiera" a una experiencia visual premium, coherente y memorable — estilo editorial "quiet luxury": tipografía serif oversized, fondo cálido de papel, micro-interacciones refinadas y dirección de arte unificada en todas las páginas.

## Por Qué

| Problema | Solución |
|----------|----------|
| La web es correcta pero genérica: fondos blanco/gris planos, secciones intercambiables con cualquier consultora | Dirección de arte propia: fondo cálido `henko-white` (#f9f3ef, ya en la paleta y sin usar), hairlines finas, asimetría editorial, textura sutil |
| El hero es texto + logo PNG estático; no genera impacto en los primeros 3 segundos | Hero rediseñado con tipografía protagonista a gran escala, reveal de texto por líneas y composición asimétrica |
| Las animaciones son un único fade-up genérico (`data-animate`) | Sistema de motion ampliado: reveals enmascarados para titulares, stagger, parallax sutil, count-ups, micro-hovers con intención |
| Cada subpágina (contacto, empleo, blog) parece de una plantilla distinta; el premium se diluye tras la home | Sistema visual compartido (SectionHeading, botones, cards, PageHeader v2) aplicado de forma coherente a TODAS las páginas públicas |
| La paleta secundaria de marca (yellow, purple, coral, orange, greenblue) no se usa nunca; todo es turquesa sobre blanco | Acentos cromáticos puntuales y disciplinados por sección/página para crear memoria visual sin ruido |

**Valor de negocio**: Jennifer vende orden, criterio y calidad de acompañamiento a CEOs. Una web visualmente premium es la prueba tangible de ese criterio: aumenta la confianza percibida, el tiempo en página y la conversión del CTA "Trabaja conmigo", y diferencia frente a consultoras con webs de plantilla.

## Qué

### Criterios de Éxito
- [ ] Las 8 superficies públicas (home, servicios, sobre-mí, contacto, empleo, empleo/[slug], blog, blog/[slug]) comparten el mismo lenguaje visual (fondos, tipografía, espaciado, botones, cards)
- [ ] El hero de la home produce impacto inmediato: titular serif a gran escala con reveal animado, sin parecer "texto + logo pegado"
- [ ] Los titulares principales usan reveal enmascarado (por líneas) y las secciones tienen motion con stagger, respetando `prefers-reduced-motion`
- [ ] El fondo base de la web es cálido (#f9f3ef o equivalente), no blanco plano, con jerarquía clara de superficies
- [ ] Ningún blob/burbuja decorativa reaparece (aprendizaje de PRP-010); el premium se logra con tipografía, espacio y ritmo, no con decoración
- [ ] Lighthouse: LCP y CLS no empeoran respecto a la versión actual (hero sin layout shift, animaciones solo con `transform`/`opacity`)
- [ ] Contraste AA en todos los textos sobre los nuevos fondos
- [ ] `npm run typecheck` y `npm run build` pasan; ninguna página de servidor se convierte en client component por las animaciones

### Comportamiento Esperado

Un CEO llega desde LinkedIn. En 3 segundos percibe una web cuidada: fondo papel cálido, un titular serif enorme que se revela línea a línea, navegación pill flotante discreta. Al hacer scroll, las secciones entran con ritmo (stagger), los números clave cuentan hacia arriba, las cards responden al hover con sutileza. Navega a Servicios, Sobre mí o Contacto y la experiencia es la misma: no hay "caída de calidad" tras la home. El formulario de contacto se siente como una invitación, no como un trámite. Todo transmite lo que Jennifer vende: orden, calma y criterio.

---

## Contexto

### Estado actual (investigado)

- **Rutas públicas**: `src/app/(web)/` → `page.tsx` (home, RSC con testimonios de Supabase, `revalidate = 300`), `servicios/` (page + `ServiciosClient.tsx` 385 líneas), `sobre-mi/` (286), `contacto/` (320, client form con `crearLead`), `empleo/` (+ `[slug]`, usa `features/empleo`), `blog/` (+ `[slug]` + `categoria/[slug]`), `legal/`, `verificar/[id]`.
- **Shared**: `src/components/Navbar.tsx` (pill flotante con blur), `Footer.tsx` (card redondeada), `PageHeader.tsx` (usado por sobre-mi, contacto, servicios), `ScrollAnimationProvider.tsx` + `src/hooks/useScrollAnimation.ts` (IntersectionObserver que añade `.animate-in` a `[data-animate]`).
- **Design tokens**: `tailwind.config.ts` → paleta `henko` (turquoise #1f8f9b, turquoise-light, greenblue #addbd2, yellow #eddc88, purple #958cba, white #f9f3ef, coral #d69494, orange #efb252). Fuentes: Roxborough CF (serif display, local OTF), Raleway (variable, Google), Hey Gotcha (apenas usada).
- **CSS global**: `src/app/globals.css` → sistema `[data-animate]` (fade/left/right/scale + delays 100-600), keyframes de blobs (en desuso en home tras PRP-010) y mariposa, scrollbar custom turquesa.
- **Stack**: Next 16 + Turbopack, React 19, Tailwind 3.4. **No hay framer-motion ni GSAP** — el motion actual es 100% CSS + IO.
- **Assets**: `public/henkologo.png`, `hk.png`, `public/images/hero-mariposa-*.png`; foto de Jennifer servida por signed URL de Supabase (`sobre_mi_path`).

### Referencias
- `.claude/PRPs/prp-010-redesign-landing-henkoaching.md` — Rediseño previo de la home (COMPLETADO 2026-06-10). **Restricción heredada: Jennifer NO quiere blobs ni burbujas decorativas.** El estilo debe ser limpio.
- `src/app/(web)/page.tsx` — Patrón actual de secciones y uso de `data-animate`
- `src/components/PageHeader.tsx` — Componente compartido: tocarlo propaga a 3+ páginas
- `.claude/memory/reference/no-import-server-modules-in-client.md` — No importar módulos de servidor en client components (ChunkLoadError en Turbopack)

### Decisiones de Arquitectura

1. **Motion sin dependencias nuevas**: se amplía el sistema `data-animate` existente (CSS + IntersectionObserver) en lugar de añadir framer-motion. Razón: casi todas las páginas son Server Components y deben seguir siéndolo (SEO, performance); framer-motion obligaría a client components o wrappers innecesarios. Los reveals enmascarados, stagger y parallax sutil se implementan con CSS moderno + pequeñas extensiones del hook actual.
2. **Design tokens primero**: las nuevas superficies (paper, ink, hairline), escalas tipográficas y sombras se definen en `tailwind.config.ts` + `globals.css` ANTES de tocar páginas, para que todas consuman los mismos tokens.
3. **Componentes compartidos de la web pública** en `src/components/web/`: `SectionHeading`, `CTAButton` (primario/secundario unificados — hoy cada página duplica las clases), `PageHeader` v2, y un wrapper de sección con variantes de fondo. KISS: solo los que eliminen duplicación real.
4. **Acentos cromáticos disciplinados**: la paleta secundaria henko se usa solo como acento puntual (1 acento por sección máximo) — nunca como fondo de sección completo.
5. **Cero cambios de contenido/copy y cero cambios de datos**: este PRP es 100% presentación. No se tocan queries, actions, RGPD ni estructura de rutas.

### Arquitectura Propuesta

```
src/
├── components/
│   ├── web/                      # NUEVO: sistema visual de la web pública
│   │   ├── SectionHeading.tsx    # overline + titular serif con reveal
│   │   ├── CTAButton.tsx         # variantes primario/secundario/ghost
│   │   └── Section.tsx           # wrapper con variantes de superficie
│   ├── PageHeader.tsx            # v2 (mismo API, nueva estética)
│   ├── Navbar.tsx                # refinado
│   └── Footer.tsx                # refinado
├── hooks/
│   └── useScrollAnimation.ts     # ampliado: stagger por grupo, re-trigger opcional
└── app/
    ├── globals.css               # tokens, reveals enmascarados, texturas
    └── (web)/                    # páginas restyled (sin cambios de lógica)
```

### Modelo de Datos

No aplica. Cero migraciones, cero cambios en Supabase.

---

## Blueprint (Assembly Line)

> IMPORTANTE: Solo definir FASES. Las subtareas se generan al entrar a cada fase
> siguiendo el bucle agéntico (mapear contexto → generar subtareas → ejecutar)

### Fase 1: Fundaciones del Design System Premium
**Objetivo**: Definir y dejar operativos los tokens y primitivas que usará todo lo demás: superficies cálidas (paper/ink/hairline) en Tailwind, escala tipográfica display, sombras suaves, sistema de motion ampliado en `globals.css` + `useScrollAnimation` (reveal enmascarado por líneas, stagger por grupo, `prefers-reduced-motion`), y componentes `SectionHeading`, `CTAButton` y `Section` en `src/components/web/`.
**Validación**: Tokens visibles en una página de prueba; typecheck y build pasan; las animaciones nuevas funcionan con JS deshabilitado degradando a contenido visible.

### Fase 2: Home — Hero de Impacto y Ritmo de Secciones
**Objetivo**: Rediseñar la home con el nuevo sistema: hero con titular serif a gran escala y reveal por líneas sobre fondo papel, composición asimétrica, secciones síntomas/franja/servicios/testimonios con el nuevo ritmo visual (hairlines, stagger, acentos puntuales, cards refinadas).
**Validación**: Screenshot desktop + mobile; sin blobs; LCP/CLS sin regresión; los 5 bloques existentes se conservan (solo cambia presentación).

### Fase 3: Chrome Compartido — Navbar y Footer
**Objetivo**: Refinar Navbar (transiciones, estados activos, integración con el fondo papel) y Footer (jerarquía, micro-interacciones) para que el marco de todas las páginas esté al nivel del nuevo hero.
**Validación**: Navbar y Footer coherentes en todas las rutas públicas, desktop y mobile; menú móvil revisado.

### Fase 4: Páginas de Marca — Servicios y Sobre Mí
**Objetivo**: Aplicar el sistema a `/servicios` (cards de servicio, audiencias, pasos del proceso) y `/sobre-mi` (bio, valores, foto con tratamiento editorial), usando PageHeader v2 y los componentes compartidos, eliminando estilos duplicados.
**Validación**: Ambas páginas indistinguibles en calidad de la home; screenshots desktop + mobile.

### Fase 5: Páginas de Conversión y Contenido — Contacto, Empleo y Blog
**Objetivo**: Restyling del formulario de contacto (inputs, focus states, estado enviado) sin tocar su lógica ni el flujo RGPD/anti-spam; listado y detalle de empleo; listado, detalle y categorías de blog (cards, tipografía de prosa con `@tailwindcss/typography` afinada).
**Validación**: Formulario de contacto sigue enviando leads correctamente (test manual/Playwright); filtros de empleo funcionan; blog legible y elegante en mobile.

### Fase 6: Barrido de Coherencia — Legal, Verificar y Detalles
**Objetivo**: Pasar el nuevo sistema por las páginas menores (`/legal`, `/legal/derechos-arco`, `/verificar/[id]`), revisar coherencia total (espaciados, acentos, hovers), limpiar CSS muerto de `globals.css` (blobs si ya no se usan en ninguna parte) y estados 404/empty.
**Validación**: Recorrido completo de la web sin ninguna página "olvidada"; sin clases/keyframes huérfanos.

### Fase 7: Validación Final
**Objetivo**: Sistema funcionando end-to-end con la web premium.
**Validación**:
- [ ] `npm run typecheck` pasa
- [ ] `npm run build` exitoso
- [ ] Playwright: screenshots de las 8 superficies en desktop y mobile
- [ ] Formulario de contacto envía lead de prueba correctamente
- [ ] `prefers-reduced-motion` respetado
- [ ] LCP/CLS sin regresión vs. baseline
- [ ] Criterios de éxito cumplidos

---

## 🧠 Aprendizajes (Self-Annealing / Neural Network)

> Esta sección CRECE con cada error encontrado durante la implementación.
> El conocimiento persiste para futuros PRPs. El mismo error NUNCA ocurre dos veces.

### 2026-06-12: Dirección de arte — fondos de bloque siempre claros
- **Error**: Se propusieron footer/CTA en tinta oscura y después en turquesa a sangre; el usuario rechazó ambos.
- **Fix**: Franjas y CTA en `bg-henko-paper-deep` con hairlines; footer en `henko-card`. Ink solo para texto. Guardado también en memoria (feedback/no-fondos-oscuros-web-publica).
- **Aplicar en**: cualquier sección nueva de la web pública.

### 2026-06-12: Hero descompensado en pantallas grandes
- **Error**: Con padding fijo arriba, en monitores 1080p+ el hero quedaba "ladeado abajo-izquierda" con mucho aire superior.
- **Fix**: Hero con `min-h-[100svh]` + flex `justify-center` y CTAs centrados bajo la composición de dos columnas.
- **Aplicar en**: heroes a viewport completo.

### 2026-06-12: PowerShell 5.1 corrompe UTF-8 al hacer Get-Content/Set-Content sin encoding
- **Error**: `Get-Content $f -Raw` + `Set-Content -Encoding utf8` en PS 5.1 leyó un .tsx UTF-8 como ANSI y lo reescribió con mojibake (Ã­, Ã©…). Hubo que restaurar desde git.
- **Fix**: NUNCA usar PowerShell para search-replace en archivos de código con acentos. Usar siempre el Edit tool (con `replace_all` si hay varias ocurrencias).
- **Aplicar en**: cualquier proyecto en Windows con PS 5.1.

---

## Gotchas

> Cosas críticas a tener en cuenta ANTES de implementar

- [ ] **No blobs**: PRP-010 los eliminó por petición expresa de Jennifer. El premium viene de tipografía + espacio + ritmo, nunca de burbujas/gradientes decorativos.
- [ ] **RSC intactos**: home, servicios (page), sobre-mi, empleo y blog son Server Components. Las animaciones deben seguir siendo CSS + atributos `data-*`; no convertir páginas a `'use client'`.
- [ ] **No importar server modules en client** (memoria del proyecto): causa ChunkLoadError en Turbopack.
- [ ] **PageHeader es compartido**: cambiar su API rompe sobre-mi, contacto y servicios a la vez — mantener compatibilidad o migrar las 3 en la misma fase.
- [ ] **Foto de Jennifer** llega por signed URL de Supabase con fallback ilustrado — el nuevo tratamiento visual debe contemplar ambos estados.
- [ ] **Contacto tiene anti-spam (honeypot `website`) y consentimiento RGPD**: restyling sin tocar ni un name de input ni el flujo de `crearLead`.
- [ ] **`revalidate = 300` en home** y `force-dynamic` en otras: no cambiar estrategias de caching como efecto colateral.
- [ ] **Contraste**: henko-yellow (#eddc88) y greenblue (#addbd2) NO valen para texto sobre claro; solo como acento gráfico.
- [ ] **Reveal por líneas**: medir líneas en CSS puro es frágil; preferir reveal por bloques/palabras con `clip-path`/overflow + stagger, que no requiere JS de medición.
- [ ] **Fuentes locales OTF** (Roxborough): cuidado con FOUT en titulares enormes; `font-display: swap` ya está, vigilar CLS del hero.

## Anti-Patrones

- NO añadir framer-motion/GSAP/lottie — el sistema CSS + IO existente se amplía, no se reemplaza
- NO crear nuevos patrones si los existentes funcionan (extender `data-animate`, no inventar otro sistema paralelo)
- NO tocar copy, datos, queries, actions ni nada de RGPD/seguridad — este PRP es solo presentación
- NO usar la paleta secundaria como fondos de sección — solo acentos puntuales
- NO animar propiedades que disparan layout (top/left/width) — solo `transform` y `opacity`
- NO ignorar errores de TypeScript
- NO hardcodear colores hex en componentes — usar tokens de Tailwind

---

*PRP pendiente aprobación. No se ha modificado código.*
