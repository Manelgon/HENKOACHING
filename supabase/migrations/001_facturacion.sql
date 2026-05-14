-- =============================================================================
-- MIGRACIÓN 001 — FACTURACIÓN Y AJUSTES DEL EMISOR
-- =============================================================================
-- Añade:
--   · Tabla company_settings (single-row con datos del emisor + defaults fiscales)
--   · Tabla facturas + factura_lineas
--   · Enums estado_factura, forma_pago
--   · Función next_numero_factura() para correlativos atómicos
--   · Buckets storage doc-assets (logo/firma/header) y facturas (PDFs)
--   · RLS: solo admins gestionan
-- =============================================================================


-- =============================================================================
-- ENUMS
-- =============================================================================
do $$ begin
  create type estado_factura as enum ('pendiente', 'pagada', 'vencida', 'devuelta', 'anulada');
exception when duplicate_object then null; end $$;

do $$ begin
  create type forma_pago as enum ('transferencia', 'efectivo', 'bizum', 'tarjeta', 'domiciliacion');
exception when duplicate_object then null; end $$;


-- =============================================================================
-- COMPANY SETTINGS (single row, id = 1)
-- =============================================================================
create table if not exists public.company_settings (
  id integer primary key default 1 check (id = 1),

  -- Datos del emisor
  emisor_nombre text default '',
  emisor_nif text default '',
  emisor_direccion text default '',
  emisor_cp text default '',
  emisor_ciudad text default '',
  emisor_provincia text default '',
  emisor_pais text default 'España',
  emisor_email text default '',
  emisor_telefono text default '',
  emisor_web text default '',
  emisor_iban text default '',

  -- Storage paths (bucket: doc-assets)
  logo_path text,
  firma_path text,
  header_path text,

  -- Defaults fiscales (configurables)
  iva_default numeric(5,2) not null default 21.00,
  irpf_default numeric(5,2) not null default 0.00,
  forma_pago_default forma_pago default 'transferencia',
  dias_vencimiento_default integer not null default 30,

  -- Numeración automática
  serie_default text not null default 'F',
  proximo_numero integer not null default 1,
  prefijo_anio boolean not null default true,  -- si true, formato AAAA-NNNN

  -- Pie de página configurable
  pie_pagina text default '',

  updated_at timestamptz default now()
);

-- Asegurar que hay exactamente una fila
insert into public.company_settings (id) values (1)
on conflict (id) do nothing;


-- =============================================================================
-- FACTURAS
-- =============================================================================
create table if not exists public.facturas (
  id uuid primary key default uuid_generate_v4(),

  -- Numeración
  numero text unique not null,        -- "2026-0001" o "F2026-0001"
  serie text not null default 'F',
  anio integer not null,
  correlativo integer not null,

  -- Cliente (referencia + snapshot fiscal congelado al emitir)
  cliente_id uuid references public.clientes(id) on delete restrict,
  cliente_nombre text not null,
  cliente_nif text,
  cliente_direccion text,
  cliente_email text,

  -- Fechas
  fecha_emision date not null default current_date,
  fecha_vencimiento date,

  -- Importes
  base_imponible numeric(12,2) not null default 0,
  iva_porcentaje numeric(5,2) not null default 21,
  iva_importe numeric(12,2) not null default 0,
  irpf_porcentaje numeric(5,2) not null default 0,
  irpf_importe numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,

  -- Estado y pago
  estado estado_factura not null default 'pendiente',
  forma_pago forma_pago,
  fecha_pago date,
  fecha_devolucion date,
  motivo_devolucion text,

  -- Otros
  notas text,
  pdf_path text,  -- storage path en bucket 'facturas'

  -- Auditoría
  creado_por uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique (serie, anio, correlativo)
);

create index if not exists idx_facturas_estado on public.facturas(estado);
create index if not exists idx_facturas_cliente on public.facturas(cliente_id);
create index if not exists idx_facturas_fecha on public.facturas(fecha_emision desc);


-- =============================================================================
-- LÍNEAS DE FACTURA
-- =============================================================================
create table if not exists public.factura_lineas (
  id uuid primary key default uuid_generate_v4(),
  factura_id uuid not null references public.facturas(id) on delete cascade,
  concepto text not null,
  cantidad numeric(10,2) not null default 1,
  precio_unitario numeric(12,2) not null,
  descuento_porcentaje numeric(5,2) not null default 0,
  subtotal numeric(12,2) not null,
  orden integer not null default 0,
  created_at timestamptz default now()
);

create index if not exists idx_factura_lineas on public.factura_lineas(factura_id, orden);


-- =============================================================================
-- FUNCIÓN: SIGUIENTE NÚMERO DE FACTURA (atómica)
-- =============================================================================
-- Devuelve el siguiente correlativo y lo incrementa. Si cambia el año y
-- prefijo_anio = true, reinicia el correlativo a 1.
create or replace function public.next_numero_factura()
returns table (numero text, serie text, anio integer, correlativo integer)
language plpgsql
security definer
as $$
declare
  s text;
  anio_actual integer := extract(year from current_date)::integer;
  ultimo_anio integer;
  siguiente integer;
  usar_prefijo boolean;
  formato text;
begin
  -- Lock fila settings
  select c.serie_default, c.prefijo_anio, c.proximo_numero
    into s, usar_prefijo, siguiente
  from public.company_settings c
  where c.id = 1
  for update;

  -- Detectar si hay que reiniciar correlativo al cambiar de año
  select max(f.anio) into ultimo_anio from public.facturas f where f.serie = s;
  if usar_prefijo and ultimo_anio is not null and ultimo_anio <> anio_actual then
    siguiente := 1;
  end if;

  -- Formato: F2026-0001  o solo  2026-0001  según convención
  if usar_prefijo then
    formato := s || anio_actual::text || '-' || lpad(siguiente::text, 4, '0');
  else
    formato := s || lpad(siguiente::text, 5, '0');
  end if;

  -- Incrementar próximo número en settings
  update public.company_settings
    set proximo_numero = siguiente + 1,
        updated_at = now()
  where id = 1;

  return query select formato, s, anio_actual, siguiente;
end;
$$;


-- =============================================================================
-- TRIGGER updated_at
-- =============================================================================
drop trigger if exists set_updated_at on public.facturas;
create trigger set_updated_at before update on public.facturas
  for each row execute function public.handle_updated_at();

drop trigger if exists set_updated_at on public.company_settings;
create trigger set_updated_at before update on public.company_settings
  for each row execute function public.handle_updated_at();


-- =============================================================================
-- RLS POLICIES (solo admins gestionan facturas y settings)
-- =============================================================================
alter table public.company_settings enable row level security;
alter table public.facturas enable row level security;
alter table public.factura_lineas enable row level security;

drop policy if exists "Settings: admin all" on public.company_settings;
create policy "Settings: admin all" on public.company_settings
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Facturas: admin all" on public.facturas;
create policy "Facturas: admin all" on public.facturas
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "FacturaLineas: admin all" on public.factura_lineas;
create policy "FacturaLineas: admin all" on public.factura_lineas
  for all using (public.is_admin()) with check (public.is_admin());


-- =============================================================================
-- STORAGE BUCKETS
-- =============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('doc-assets', 'doc-assets', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']::text[]),
  ('facturas', 'facturas', false, 10485760, array['application/pdf']::text[])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;


-- Doc-assets: solo admins leen y escriben
drop policy if exists "DocAssets: admin all" on storage.objects;
create policy "DocAssets: admin all" on storage.objects
  for all using (bucket_id = 'doc-assets' and public.is_admin())
  with check (bucket_id = 'doc-assets' and public.is_admin());

-- Facturas storage: solo admins
drop policy if exists "FacturasStorage: admin all" on storage.objects;
create policy "FacturasStorage: admin all" on storage.objects
  for all using (bucket_id = 'facturas' and public.is_admin())
  with check (bucket_id = 'facturas' and public.is_admin());


-- =============================================================================
-- FIN
-- =============================================================================
