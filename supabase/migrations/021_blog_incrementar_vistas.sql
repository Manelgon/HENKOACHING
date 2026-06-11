-- =============================================================================
-- MIGRACIÓN 021 — Contador de vistas de blog atómico
-- =============================================================================
-- El contador de vistas se incrementaba con un patrón read-modify-write desde la
-- aplicación (leer vistas, sumar 1, escribir), que pierde incrementos bajo
-- concurrencia (dos lectores leen el mismo valor y ambos escriben el mismo +1).
-- Esta función hace el incremento atómicamente en la base de datos.
-- =============================================================================

create or replace function public.incrementar_vistas_blog(post_id uuid)
returns void
language sql
security definer
as $$
  update public.blog_posts
    set vistas = coalesce(vistas, 0) + 1
  where id = post_id;
$$;

-- Lectura pública: la página del artículo (anónima) puede registrar la visita
grant execute on function public.incrementar_vistas_blog(uuid) to anon, authenticated;
