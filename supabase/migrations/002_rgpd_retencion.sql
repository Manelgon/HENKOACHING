-- =============================================================================
-- RGPD: función helper para identificar candidatos a purgar por inactividad
-- =============================================================================
-- Usada por el cron de retención (api/cron/retencion).
-- Devuelve candidatos cuya última actividad (login o creación) es anterior
-- al umbral de meses, y que no tienen solicitudes en proceso activo.

create or replace function public.candidatos_inactivos_a_purgar(meses integer)
returns table (
  user_id uuid,
  email text,
  avatar_url text
)
language sql
security definer
set search_path = public, auth
as $$
  select
    p.id as user_id,
    p.email,
    p.avatar_url
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.role = 'candidato'
    and p.deleted_at is null
    -- Inactivo: sin login reciente (o nunca logueado y creado hace mucho)
    and coalesce(u.last_sign_in_at, u.created_at) < now() - (meses || ' months')::interval
    -- Y sin candidaturas en proceso activo
    and not exists (
      select 1
      from public.solicitudes s
      where s.candidato_id = p.id
        and s.estado in ('revisando', 'entrevista')
    )
$$;

-- Acceso: solo service_role la puede llamar (el cron usa admin client).
-- Revocamos a anon/authenticated por defecto.
revoke all on function public.candidatos_inactivos_a_purgar(integer) from public;
revoke all on function public.candidatos_inactivos_a_purgar(integer) from anon;
revoke all on function public.candidatos_inactivos_a_purgar(integer) from authenticated;
grant execute on function public.candidatos_inactivos_a_purgar(integer) to service_role;
