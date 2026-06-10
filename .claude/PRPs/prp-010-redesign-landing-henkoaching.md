# PRP-010: Rediseño Landing Henkoaching

> **Estado**: COMPLETADO (2026-06-10) — último pendiente (blobs decorativos de la franja turquesa) eliminado
> **Fecha**: 2026-06-08
> **Proyecto**: Henkoaching (Jennifer Cervera)

---

## Objetivo

Refinar la landing principal (`/`) para que comunique con mayor claridad el posicionamiento de Jennifer como consultora de orden organizacional, liderazgo y equipos; eliminando referencias a coaching/mindfulness, simplificando la estructura visual, y activando solo los testimonios empresariales relevantes desde el dashboard.

## Por Qué

| Problema | Solución |
|----------|----------|
| El subtítulo "coaching & mindfulness empresarial" no refleja el servicio real | Cambiar a "orden, liderazgo y equipos" |
| Las burbujas decorativas azules distraen y pesan visualmente | Eliminar todos los blobs decorativos; fondo limpio blanco/crema |
| Hay secciones después del resumen de servicios que alargan la página sin añadir conversión | Eliminar secciones innecesarias y concentrar el foco en el CTA |
| El banner de síntomas tiene "Hablemos →" como único CTA | Reemplazar por dos botones: "Trabaja conmigo" (primario) y "Ver más" (secundario) |
| Testimonios de meditación/bienestar personal descuadran la propuesta empresarial | Desactivarlos desde el dashboard (visible = false) — sin código nuevo |

**Valor de negocio**: Una landing más limpia y con copy alineado al posicionamiento real mejora la tasa de conversión de visitas orgánicas en LinkedIn y Google, y reduce el tiempo que Jennifer invierte explicando qué hace exactamente.

## Qué

### Criterios de Éxito
- [ ] No hay ningún blob/burbuja azul visible en la landing
- [ ] El fondo de todas las secciones es blanco o `gray-50` (sin gradientes de color henko-turquoise)
- [ ] El subtítulo del hero dice "orden, liderazgo y equipos" (sin "coaching & mindfulness")
- [ ] El headline del hero y el subtítulo tienen el nuevo texto aprobado
- [ ] El banner de síntomas tiene dos botones: "Trabaja conmigo" (primario) y "Ver más" (secundario)
- [ ] No hay secciones entre el resumen de servicios y los testimonios excepto las definidas en el blueprint
- [ ] `npm run build` exitoso sin errores TypeScript

### Comportamiento Esperado

El visitante llega a la landing, ve un hero limpio con logo + headline directo + subtítulo "orden, liderazgo y equipos" y dos botones. Hace scroll y ve los síntomas del negocio, el resumen de servicios, los testimonios empresariales activos, y un CTA final. La experiencia es limpia, profesional y sin distracciones de fondo.

---

## Contexto

### Referencias
- `src/app/(web)/page.tsx` — Archivo principal de la landing (único archivo a editar en fases 1-3)
- `src/features/testimonios/components/TestimoniosCarousel.tsx` — Carousel de testimonios (sin cambios de código)
- Dashboard de testimonios: `/dashboard/testimonios` — Panel para activar/desactivar testimonios

### Arquitectura Propuesta

Todo el trabajo de código se concentra en un solo archivo: `src/app/(web)/page.tsx`.

No se crean componentes nuevos ni se modifica la estructura de features.

### Estructura actual de secciones (en orden)
1. HERO — fondo white + blobs
2. SÍNTOMAS — fondo gray-50 + banner con "Hablemos →"
3. SERVICIOS — fondo white
4. QUOTE — border-y + imágenes oruga/mariposa
5. PARA QUIÉN — fondo gray-50
6. ENFOQUE — fondo white + pills
7. TESTIMONIOS — fondo gray-50 (condicional)
8. CTA FINAL — fondo henko-turquoise
9. BLOG — fondo gray-50 (condicional)

### Secciones a conservar después del rediseño
1. HERO
2. SÍNTOMAS (con botones actualizados)
3. SERVICIOS
4. TESTIMONIOS
5. CTA FINAL

Las secciones QUOTE, PARA QUIÉN, ENFOQUE y BLOG se eliminan.

### Modelo de Datos
No aplica. Los testimonios ya tienen campo `visible` en la tabla `testimonios`. Solo se gestiona desde el dashboard, sin migraciones.

---

## Blueprint (Assembly Line)

> IMPORTANTE: Solo definir FASES. Las subtareas se generan al entrar a cada fase
> siguiendo el bucle agéntico (mapear contexto → generar subtareas → ejecutar)

### Fase 1: Estética — Eliminar blobs y limpiar fondos
**Objetivo**: Quitar todos los `div` con clase `blob-*` y los `bg-henko-turquoise/[0.XX]` decorativos del hero y del CTA final. Dejar el hero con fondo `bg-white` puro. Verificar que ninguna sección tenga gradientes de color turquesa de fondo.
**Validación**: Screenshot de la landing sin ninguna burbuja/gradiente de color turquesa visible en el fondo.

### Fase 2: Copy y textos — Nuevo headline y subtítulo
**Objetivo**: Actualizar el subtítulo del hero de "coaching & mindfulness empresarial" a "orden, liderazgo y equipos". Actualizar también el headline principal (frase en italic) con el nuevo texto que defina Jennifer — si no se ha especificado aún, usar "Cuando una empresa crece, el orden deja de ser opcional." manteniendo el tono actual.
**Validación**: El texto "coaching" y "mindfulness" no aparece en ningún lugar visible de la landing.

### Fase 3: Estructura — Eliminar secciones y actualizar CTAs
**Objetivo**: Eliminar las secciones QUOTE, PARA QUIÉN, ENFOQUE y BLOG del JSX de `page.tsx`. En el banner de la sección SÍNTOMAS, reemplazar el único botón "Hablemos →" por dos botones: "Trabaja conmigo" (primario, `bg-henko-turquoise text-white`) y "Ver más" (secundario, `border-2 border-henko-turquoise text-henko-turquoise`). El botón "Ver más" enlaza a `/servicios`.
**Validación**: La página muestra solo las 5 secciones definidas (HERO, SÍNTOMAS, SERVICIOS, TESTIMONIOS, CTA FINAL). El banner tiene dos botones correctamente estilizados.

### Fase 4: Testimonios — Instrucciones de limpieza (sin código)
**Objetivo**: Documentar de forma clara las instrucciones para que Jennifer desactive desde el dashboard los testimonios que no sean de clientes empresariales (p. ej. los de meditación o bienestar personal).
**Validación**: Las instrucciones están escritas y Jennifer confirma que ha desactivado los testimonios no relevantes desde el panel.

> Nota: No se escribe ningún código en la Fase 4. Se redactan las instrucciones y se entregan al usuario.

### Fase 5: Validación Final
**Objetivo**: Sistema funcionando end-to-end con la landing rediseñada.
**Validación**:
- [ ] `npm run typecheck` pasa
- [ ] `npm run build` exitoso
- [ ] Playwright screenshot confirma UI limpia (sin blobs, con nuevos textos y secciones)
- [ ] Solo aparecen testimonios empresariales activos

---

## Instrucciones para Fase 4 (Testimonios desde Dashboard)

> Estas instrucciones son para Jennifer, no requieren código.

1. Ir a `/dashboard/testimonios` (panel de admin)
2. Identificar los testimonios relacionados con meditación, mindfulness o coaching personal
3. Para cada uno, hacer clic en la acción "Desactivar" o cambiar el campo `visible` a `false`
4. Los testimonios desactivados dejan de aparecer en la landing de forma inmediata (sin deploy)
5. Solo deben quedar activos los testimonios de clientes empresariales que hablen de orden organizacional, liderazgo o trabajo en equipos

---

## Aprendizajes (Self-Annealing)

> Esta sección CRECE con cada error encontrado durante la implementación.

*(Vacío — se actualizará durante la ejecución)*

---

## Gotchas

- [ ] Los blobs están en dos lugares: en el HERO y en el CTA FINAL — revisar ambos antes de dar por limpia la fase 1
- [ ] El CTA FINAL tiene fondo `bg-henko-turquoise` que es intencional (CTA de color) — NO eliminar ese fondo, solo los blobs dentro de él
- [ ] Las secciones condicionales (`latestPosts.length > 0` y `testimonios.length > 0`) usan datos de Supabase — al eliminar la sección BLOG, también eliminar la query de `blog_posts` del `Promise.all` para no hacer fetches innecesarios
- [ ] El import de `BlogCard` y `BlogCardData` se vuelve innecesario al eliminar la sección BLOG — eliminarlo para evitar error de TypeScript
- [ ] Las constantes `AUDIENCE` y `ENFOQUE_PILLS` se vuelven innecesarias al eliminar PARA QUIÉN y ENFOQUE — eliminarlas para mantener el archivo limpio

## Anti-Patrones

- NO crear nuevos componentes si los cambios son solo en JSX de page.tsx
- NO ignorar errores de TypeScript al eliminar imports
- NO eliminar el fondo turquesa del CTA FINAL (es intencional)
- NO tocar `TestimoniosCarousel.tsx` — solo gestionar qué testimonios están activos vía dashboard

---

*PRP pendiente aprobación. No se ha modificado código.*
