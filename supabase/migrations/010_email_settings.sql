-- =============================================================================
-- MIGRACIÓN 010 — EMAIL SETTINGS
-- =============================================================================
-- Tabla single-row para credenciales SMTP e IMAP del panel admin.
-- Las passwords se almacenan cifradas en capa de aplicación (AES-256-GCM).
-- Solo admins pueden leer/escribir.
-- =============================================================================

create table if not exists public.email_settings (
  id integer primary key default 1 check (id = 1),

  -- SMTP (envíos: Supabase Auth + notificaciones desde la app)
  smtp_host        text,
  smtp_port        integer default 587,
  smtp_user        text,
  smtp_password    text,          -- cifrado AES-256-GCM + base64
  smtp_encryption  text default 'starttls',  -- 'starttls' | 'ssl' | 'none'
  smtp_from_name   text,

  -- IMAP (lectura de bandeja de entrada)
  imap_host        text,
  imap_port        integer default 993,
  imap_user        text,
  imap_password    text,          -- cifrado AES-256-GCM + base64
  imap_encryption  text default 'ssl',  -- 'ssl' | 'starttls' | 'none'

  updated_at timestamptz default now()
);

-- Fila única garantizada
insert into public.email_settings (id) values (1)
on conflict (id) do nothing;

-- RLS: solo admins
alter table public.email_settings enable row level security;

drop policy if exists "email_settings: admin only" on public.email_settings;
create policy "email_settings: admin only" on public.email_settings
  for all
  using (public.is_admin())
  with check (public.is_admin());
