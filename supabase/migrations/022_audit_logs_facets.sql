-- =============================================================================
-- MIGRACIÓN 022 — Facets de audit_logs vía DISTINCT en SQL
-- =============================================================================
-- La pantalla de logs cargaba 500 filas de audit_logs en cada visita solo para
-- derivar en memoria la lista de acciones y tipos de recurso de los filtros.
-- Esta función devuelve los valores distintos directamente desde la BD, sin
-- transferir filas, y se mantiene constante por más que crezca la tabla.
-- =============================================================================

create or replace function public.audit_logs_facets()
returns json
language plpgsql
security definer
as $$
declare
  resultado json;
begin
  -- Solo administradores pueden consultar los facets de auditoría
  if not public.is_admin() then
    raise exception 'No autorizado';
  end if;

  select json_build_object(
    'acciones', coalesce((select array_agg(a order by a)
                          from (select distinct accion as a from public.audit_logs where accion is not null) s), '{}'),
    'recursos', coalesce((select array_agg(r order by r)
                          from (select distinct recurso_tipo as r from public.audit_logs where recurso_tipo is not null) s), '{}')
  ) into resultado;

  return resultado;
end;
$$;

grant execute on function public.audit_logs_facets() to authenticated;
