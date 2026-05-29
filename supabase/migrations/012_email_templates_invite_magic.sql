alter table public.email_settings
  add column if not exists subject_invite     text default 'Te invitan a unirse a HenKoaching',
  add column if not exists subject_magic_link text default 'Tu enlace de acceso a HenKoaching',
  add column if not exists template_invite     text,
  add column if not exists template_magic_link text;
