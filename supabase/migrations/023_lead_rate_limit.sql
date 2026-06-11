-- =============================================================================
-- MIGRACIÓN 023 — RATE LIMIT DEL FORMULARIO DE CONTACTO (anti-spam / anti-relay)
-- =============================================================================
-- El formulario público de contacto (crearLead) envía un email de confirmación
-- a la dirección introducida. Sin control, un bot puede usarlo para inundar el
-- buzón y quemar la cuota SMTP (vector de relay/flood).
--
-- Esta tabla registra un HASH de la IP (no la IP en claro → minimización de
-- datos, RGPD art. 5.1.c) por cada envío, para limitar la frecuencia por IP.
-- La acción server-side cuenta los envíos recientes y rechaza si superan el
-- umbral. Se purga en el cron de retención (route /api/cron/retencion).
-- =============================================================================

create table if not exists public.lead_rate_limit (
  id          uuid primary key default gen_random_uuid(),
  ip_hash     text not null,
  created_at  timestamptz not null default now()
);

create index if not exists lead_rate_limit_ip_idx
  on public.lead_rate_limit (ip_hash, created_at desc);

-- RLS: sin policies. Solo el service_role (createAdminClient) accede; anon y
-- usuarios autenticados quedan denegados por defecto.
alter table public.lead_rate_limit enable row level security;
