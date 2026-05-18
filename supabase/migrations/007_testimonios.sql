-- =============================================================================
-- MIGRACIÓN 007 — TESTIMONIOS
-- =============================================================================
-- Sistema editable de testimonios/reseñas para mostrar en la home y otras
-- páginas públicas. Las reseñas se copian manualmente desde Google u otras
-- fuentes y se gestionan desde /dashboard/testimonios.
-- =============================================================================

create table if not exists public.testimonios (
  id              uuid primary key default gen_random_uuid(),
  texto           text not null check (length(trim(texto)) > 0),
  nombre          text not null check (length(trim(nombre)) > 0),
  rol             text,
  sector          text,
  rating          smallint check (rating between 1 and 5),
  fuente          text default 'manual', -- 'google', 'linkedin', 'email', 'manual'
  fecha           date,
  orden           integer not null default 0,
  visible         boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

create index if not exists testimonios_visible_orden_idx
  on public.testimonios (visible, orden)
  where deleted_at is null;

-- Trigger updated_at
create or replace function public.testimonios_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists testimonios_updated_at on public.testimonios;
create trigger testimonios_updated_at
  before update on public.testimonios
  for each row execute function public.testimonios_set_updated_at();

-- RLS
alter table public.testimonios enable row level security;

-- Lectura pública: cualquiera puede leer los visibles y no borrados
drop policy if exists "Testimonios: public read visible" on public.testimonios;
create policy "Testimonios: public read visible" on public.testimonios
  for select
  using (visible = true and deleted_at is null);

-- Escritura: solo admin
drop policy if exists "Testimonios: admin all" on public.testimonios;
create policy "Testimonios: admin all" on public.testimonios
  for all
  using (public.is_admin())
  with check (public.is_admin());
