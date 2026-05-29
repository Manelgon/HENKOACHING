-- =============================================================================
-- MIGRACIÓN 013 — EMAIL ENVÍOS (tracking de emails transaccionales)
-- =============================================================================
-- Guarda cada intento de envío de email transaccional para:
--   · Auditoría (saber qué se envió y cuándo)
--   · Detección de fallos (estado = 'error')
--   · Reintento desde el panel admin
-- =============================================================================

create table if not exists public.email_envios (
  id          uuid primary key default gen_random_uuid(),
  para        text not null,
  asunto      text not null,
  html        text not null,
  estado      text not null default 'pendiente' check (estado in ('pendiente', 'enviado', 'error')),
  error       text,
  intentos    integer not null default 0,
  tipo        text not null,           -- 'candidatura.candidato' | 'candidatura.admin' | 'estado_solicitud'
  metadata    jsonb default '{}',
  created_at  timestamptz not null default now(),
  sent_at     timestamptz
);

create index if not exists email_envios_estado_idx on public.email_envios (estado, created_at desc);

-- RLS: solo admins
alter table public.email_envios enable row level security;

drop policy if exists "email_envios: admin only" on public.email_envios;
create policy "email_envios: admin only" on public.email_envios
  for all using (public.is_admin()) with check (public.is_admin());
