-- =============================================================================
-- MIGRACIÓN 020 — next_numero_factura(serie_input)
-- =============================================================================
-- La aplicación (src/actions/facturas.ts) invoca la función con el argumento
-- `serie_input` para permitir elegir la serie en el momento de emitir. Esa
-- sobrecarga existía solo en la base de datos en producción (drift de esquema):
-- nunca se versionó. Esta migración la reproduce EXACTAMENTE como está en
-- producción (extraída con pg_get_functiondef el 2026-06-11) para que
-- reconstruir el entorno desde las migraciones (staging, recuperación, CI) no
-- rompa la emisión de facturas.
--
-- Diferencias respecto a la versión sin argumentos de la migración 001:
--   · Acepta `serie_input` (o usa serie_default si viene vacío/null).
--   · El correlativo se calcula con max(correlativo) por (serie, año si
--     prefijo_anio), no desde company_settings.proximo_numero — eso permite
--     series independientes (F, R, A) sin compartir contador.
--   · proximo_numero se actualiza solo a título informativo.
-- =============================================================================

create or replace function public.next_numero_factura(serie_input text default null::text)
returns table (numero text, serie text, anio integer, correlativo integer)
language plpgsql
security definer
as $$
declare
  s text;
  anio_actual integer := extract(year from current_date)::integer;
  ultimo_correlativo integer;
  siguiente integer;
  usar_prefijo boolean;
  formato text;
begin
  -- Tomar serie indicada o la default de settings
  select coalesce(nullif(trim(serie_input), ''), c.serie_default), c.prefijo_anio
    into s, usar_prefijo
  from public.company_settings c
  where c.id = 1
  for update;

  -- Calcular siguiente correlativo dentro de (serie, año si aplica)
  if usar_prefijo then
    select coalesce(max(f.correlativo), 0) into ultimo_correlativo
    from public.facturas f
    where f.serie = s and f.anio = anio_actual;
  else
    select coalesce(max(f.correlativo), 0) into ultimo_correlativo
    from public.facturas f
    where f.serie = s;
  end if;

  siguiente := ultimo_correlativo + 1;

  if usar_prefijo then
    formato := s || anio_actual::text || '-' || lpad(siguiente::text, 4, '0');
  else
    formato := s || lpad(siguiente::text, 5, '0');
  end if;

  -- Refrescar proximo_numero en settings (informativo)
  update public.company_settings
    set proximo_numero = siguiente + 1,
        updated_at = now()
  where id = 1;

  return query select formato, s, anio_actual, siguiente;
end;
$$;
