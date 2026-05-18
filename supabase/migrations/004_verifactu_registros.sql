-- =============================================================================
-- MIGRACIÓN 004 — VERIFACTU REGISTROS (F2: hash encadenado local)
-- =============================================================================
-- Crea el "libro" inmutable de registros de facturación, encadenados mediante
-- SHA-256. Cada registro contiene los datos congelados que se hashean (NIF,
-- numero, fecha, tipo, cuota, total, huella anterior, fecha-hora) y la
-- huella resultante.
--
--   · Tabla verifactu_registros (append-only).
--   · Trigger de inmutabilidad: nadie modifica campos críticos ni borra.
--   · Índices únicos: solo un registro inicial (huella_anterior NULL) y cada
--     huella_anterior posterior es única (linealiza la cadena bajo concurrencia).
--   · Columnas en facturas: verifactu_alta_id, verifactu_anulacion_id, qr_url.
--   · Trigger F1 ampliado: una vez asignados verifactu_*_id son inmutables.
--   · Backfill: registros de alta para todas las facturas existentes en
--     orden de created_at usando pgcrypto.
-- =============================================================================

create extension if not exists pgcrypto;


-- =============================================================================
-- TABLA verifactu_registros
-- =============================================================================
create table if not exists public.verifactu_registros (
  id uuid primary key default uuid_generate_v4(),

  -- Vinculación con factura
  factura_id uuid not null references public.facturas(id) on delete restrict,
  tipo text not null check (tipo in ('alta','anulacion')),

  -- Encadenamiento
  num_registro bigint generated always as identity,
  huella text not null,            -- SHA-256 hex MAYÚSCULAS de este registro
  huella_anterior text,            -- huella del registro previo (NULL solo en el primero)
  hash_factura text not null,      -- igual a `huella` para alta (el QR usa este)

  -- Datos congelados al generar el registro (necesarios para reproducir el hash)
  nif_emisor text not null,
  numero_factura text not null,
  fecha_emision date not null,
  tipo_factura_aeat text not null check (tipo_factura_aeat in ('F1','F2','F3','R1','R2','R3','R4','R5')),
  cuota_total numeric(12,2) not null,
  importe_total numeric(12,2) not null,
  fecha_hora_generacion timestamptz not null,

  -- XML del registro (lo rellena F3)
  xml_payload text,

  -- Envío AEAT (lo rellena F4)
  estado_envio text not null default 'pendiente'
    check (estado_envio in ('pendiente','enviado','aceptado','rechazado','error')),
  csv_aeat text,
  respuesta_aeat jsonb,
  intentos int not null default 0,
  ultimo_error text,
  enviado_at timestamptz,

  created_at timestamptz not null default now()
);

create index if not exists idx_verifactu_factura on public.verifactu_registros(factura_id, tipo);
create index if not exists idx_verifactu_num_registro on public.verifactu_registros(num_registro);

-- Linealización de la cadena bajo concurrencia
create unique index if not exists verifactu_huella_anterior_uniq
  on public.verifactu_registros(huella_anterior)
  where huella_anterior is not null;
create unique index if not exists verifactu_first_uniq
  on public.verifactu_registros((1))
  where huella_anterior is null;


-- =============================================================================
-- INMUTABILIDAD verifactu_registros
-- =============================================================================
create or replace function public.verifactu_prevent_update()
returns trigger
language plpgsql
as $$
begin
  if new.factura_id            is distinct from old.factura_id            then raise exception 'verifactu_registros: factura_id inmutable'            using errcode = 'check_violation'; end if;
  if new.tipo                  is distinct from old.tipo                  then raise exception 'verifactu_registros: tipo inmutable'                  using errcode = 'check_violation'; end if;
  if new.num_registro          is distinct from old.num_registro          then raise exception 'verifactu_registros: num_registro inmutable'          using errcode = 'check_violation'; end if;
  if new.huella                is distinct from old.huella                then raise exception 'verifactu_registros: huella inmutable'                using errcode = 'check_violation'; end if;
  if new.huella_anterior       is distinct from old.huella_anterior       then raise exception 'verifactu_registros: huella_anterior inmutable'       using errcode = 'check_violation'; end if;
  if new.hash_factura          is distinct from old.hash_factura          then raise exception 'verifactu_registros: hash_factura inmutable'          using errcode = 'check_violation'; end if;
  if new.nif_emisor            is distinct from old.nif_emisor            then raise exception 'verifactu_registros: nif_emisor inmutable'            using errcode = 'check_violation'; end if;
  if new.numero_factura        is distinct from old.numero_factura        then raise exception 'verifactu_registros: numero_factura inmutable'        using errcode = 'check_violation'; end if;
  if new.fecha_emision         is distinct from old.fecha_emision         then raise exception 'verifactu_registros: fecha_emision inmutable'         using errcode = 'check_violation'; end if;
  if new.tipo_factura_aeat     is distinct from old.tipo_factura_aeat     then raise exception 'verifactu_registros: tipo_factura_aeat inmutable'     using errcode = 'check_violation'; end if;
  if new.cuota_total           is distinct from old.cuota_total           then raise exception 'verifactu_registros: cuota_total inmutable'           using errcode = 'check_violation'; end if;
  if new.importe_total         is distinct from old.importe_total         then raise exception 'verifactu_registros: importe_total inmutable'         using errcode = 'check_violation'; end if;
  if new.fecha_hora_generacion is distinct from old.fecha_hora_generacion then raise exception 'verifactu_registros: fecha_hora_generacion inmutable' using errcode = 'check_violation'; end if;
  if new.created_at            is distinct from old.created_at            then raise exception 'verifactu_registros: created_at inmutable'            using errcode = 'check_violation'; end if;
  return new;
end;
$$;

drop trigger if exists verifactu_prevent_update on public.verifactu_registros;
create trigger verifactu_prevent_update
  before update on public.verifactu_registros
  for each row execute function public.verifactu_prevent_update();

create or replace function public.verifactu_prevent_delete()
returns trigger
language plpgsql
as $$
begin
  raise exception 'verifactu_registros es append-only. No se pueden eliminar registros.'
    using errcode = 'check_violation';
end;
$$;

drop trigger if exists verifactu_prevent_delete on public.verifactu_registros;
create trigger verifactu_prevent_delete
  before delete on public.verifactu_registros
  for each row execute function public.verifactu_prevent_delete();


-- =============================================================================
-- RLS
-- =============================================================================
alter table public.verifactu_registros enable row level security;

drop policy if exists "Verifactu: admin read" on public.verifactu_registros;
create policy "Verifactu: admin read" on public.verifactu_registros
  for select using (public.is_admin());

drop policy if exists "Verifactu: admin insert" on public.verifactu_registros;
create policy "Verifactu: admin insert" on public.verifactu_registros
  for insert with check (public.is_admin());

-- No hay policies de UPDATE/DELETE: los triggers ya los bloquean, pero RLS
-- también niega por defecto (sin policy = denegado).


-- =============================================================================
-- COLUMNAS NUEVAS EN facturas
-- =============================================================================
alter table public.facturas
  add column if not exists verifactu_alta_id uuid references public.verifactu_registros(id),
  add column if not exists verifactu_anulacion_id uuid references public.verifactu_registros(id),
  add column if not exists qr_url text;


-- =============================================================================
-- AMPLIAR TRIGGER F1: verifactu_*_id inmutables una vez asignados
-- =============================================================================
-- El trigger 003 (facturas_prevent_fiscal_update) no conocía estas columnas.
-- Las añadimos como "fiscales blandas": permiten NULL → valor (asignación),
-- pero rechazan cambios posteriores.
create or replace function public.facturas_prevent_fiscal_update()
returns trigger
language plpgsql
as $$
begin
  if new.numero               is distinct from old.numero               then raise exception 'Campo fiscal inmutable: numero (factura %)', old.numero               using errcode = 'check_violation'; end if;
  if new.serie                is distinct from old.serie                then raise exception 'Campo fiscal inmutable: serie (factura %)', old.numero                using errcode = 'check_violation'; end if;
  if new.anio                 is distinct from old.anio                 then raise exception 'Campo fiscal inmutable: anio (factura %)', old.numero                 using errcode = 'check_violation'; end if;
  if new.correlativo          is distinct from old.correlativo          then raise exception 'Campo fiscal inmutable: correlativo (factura %)', old.numero          using errcode = 'check_violation'; end if;
  if new.cliente_id           is distinct from old.cliente_id           then raise exception 'Campo fiscal inmutable: cliente_id (factura %)', old.numero           using errcode = 'check_violation'; end if;
  if new.cliente_nombre       is distinct from old.cliente_nombre       then raise exception 'Campo fiscal inmutable: cliente_nombre (factura %)', old.numero       using errcode = 'check_violation'; end if;
  if new.cliente_nif          is distinct from old.cliente_nif          then raise exception 'Campo fiscal inmutable: cliente_nif (factura %)', old.numero          using errcode = 'check_violation'; end if;
  if new.cliente_direccion    is distinct from old.cliente_direccion    then raise exception 'Campo fiscal inmutable: cliente_direccion (factura %)', old.numero    using errcode = 'check_violation'; end if;
  if new.cliente_email        is distinct from old.cliente_email        then raise exception 'Campo fiscal inmutable: cliente_email (factura %)', old.numero        using errcode = 'check_violation'; end if;
  if new.fecha_emision        is distinct from old.fecha_emision        then raise exception 'Campo fiscal inmutable: fecha_emision (factura %)', old.numero        using errcode = 'check_violation'; end if;
  if new.base_imponible       is distinct from old.base_imponible       then raise exception 'Campo fiscal inmutable: base_imponible (factura %)', old.numero       using errcode = 'check_violation'; end if;
  if new.iva_porcentaje       is distinct from old.iva_porcentaje       then raise exception 'Campo fiscal inmutable: iva_porcentaje (factura %)', old.numero       using errcode = 'check_violation'; end if;
  if new.iva_importe          is distinct from old.iva_importe          then raise exception 'Campo fiscal inmutable: iva_importe (factura %)', old.numero          using errcode = 'check_violation'; end if;
  if new.irpf_porcentaje      is distinct from old.irpf_porcentaje      then raise exception 'Campo fiscal inmutable: irpf_porcentaje (factura %)', old.numero      using errcode = 'check_violation'; end if;
  if new.irpf_importe         is distinct from old.irpf_importe         then raise exception 'Campo fiscal inmutable: irpf_importe (factura %)', old.numero         using errcode = 'check_violation'; end if;
  if new.total                is distinct from old.total                then raise exception 'Campo fiscal inmutable: total (factura %)', old.numero                using errcode = 'check_violation'; end if;
  if new.factura_rectificada_id is distinct from old.factura_rectificada_id then raise exception 'Campo fiscal inmutable: factura_rectificada_id (factura %)', old.numero using errcode = 'check_violation'; end if;
  if new.motivo_rectificacion is distinct from old.motivo_rectificacion then raise exception 'Campo fiscal inmutable: motivo_rectificacion (factura %)', old.numero using errcode = 'check_violation'; end if;

  -- Una vez asignado el registro Verifactu, no se sobrescribe ni se borra.
  if old.verifactu_alta_id is not null and new.verifactu_alta_id is distinct from old.verifactu_alta_id then
    raise exception 'Campo fiscal inmutable: verifactu_alta_id (factura %)', old.numero using errcode = 'check_violation';
  end if;
  if old.verifactu_anulacion_id is not null and new.verifactu_anulacion_id is distinct from old.verifactu_anulacion_id then
    raise exception 'Campo fiscal inmutable: verifactu_anulacion_id (factura %)', old.numero using errcode = 'check_violation';
  end if;

  return new;
end;
$$;


-- =============================================================================
-- BACKFILL: registros de alta para facturas existentes
-- =============================================================================
-- Calcula la cadena de huellas en orden cronológico (created_at, correlativo).
-- Usa la misma fórmula que usará el código TS: SHA-256 sobre el payload AEAT.
-- Se ejecuta solo si NO hay registros previos.
do $$
declare
  rec record;
  v_anterior text;
  v_tipo text;
  v_payload text;
  v_huella text;
  v_fecha_hora timestamptz;
  v_id uuid;
begin
  -- Si ya hay registros, no hacer backfill
  if exists (select 1 from public.verifactu_registros) then
    raise notice 'verifactu_registros ya tiene datos: saltando backfill';
    return;
  end if;

  for rec in
    select f.id, f.numero, f.serie, f.fecha_emision, f.base_imponible, f.iva_importe, f.created_at,
           coalesce(cs.emisor_nif, '') as nif,
           round((f.base_imponible + f.iva_importe)::numeric, 2) as importe_aeat
    from public.facturas f
    cross join public.company_settings cs
    where cs.id = 1
    order by f.created_at asc nulls last, f.correlativo asc
  loop
    -- Mapear serie a tipo AEAT
    v_tipo := case rec.serie
      when 'F' then 'F1'
      when 'R' then 'R1'
      when 'A' then 'R4'
      else 'F1'
    end;

    v_fecha_hora := coalesce(rec.created_at, rec.fecha_emision::timestamptz);

    -- Payload según AEAT (formato y orden de campos crítico).
    -- ImporteTotal AEAT = base + IVA (sin restar IRPF: la retención no
    -- forma parte del importe fiscal de la operación).
    v_payload :=
      'IDEmisorFactura=' || rec.nif ||
      '&NumSerieFactura=' || rec.numero ||
      '&FechaExpedicionFactura=' || to_char(rec.fecha_emision, 'DD-MM-YYYY') ||
      '&TipoFactura=' || v_tipo ||
      '&CuotaTotal=' || to_char(rec.iva_importe, 'FM999999990.00') ||
      '&ImporteTotal=' || to_char(rec.importe_aeat, 'FM999999990.00') ||
      '&Huella=' || coalesce(v_anterior, '') ||
      '&FechaHoraHusoGenRegistro=' || to_char(v_fecha_hora at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"');

    v_huella := upper(encode(digest(v_payload, 'sha256'), 'hex'));

    insert into public.verifactu_registros (
      factura_id, tipo, huella, huella_anterior, hash_factura,
      nif_emisor, numero_factura, fecha_emision, tipo_factura_aeat,
      cuota_total, importe_total, fecha_hora_generacion, created_at
    ) values (
      rec.id, 'alta', v_huella, v_anterior, v_huella,
      rec.nif, rec.numero, rec.fecha_emision, v_tipo,
      rec.iva_importe, rec.importe_aeat, v_fecha_hora, v_fecha_hora
    ) returning id into v_id;

    update public.facturas set verifactu_alta_id = v_id where id = rec.id;

    v_anterior := v_huella;
  end loop;
end $$;


-- =============================================================================
-- FIN
-- =============================================================================
