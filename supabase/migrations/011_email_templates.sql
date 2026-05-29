-- =============================================================================
-- MIGRACIÓN 011 — EMAIL TEMPLATES
-- =============================================================================
-- Añade columnas para almacenar los templates HTML de emails de auth de Supabase.
-- Solo ADD COLUMN — totalmente reversible, no modifica columnas existentes.
-- =============================================================================

alter table public.email_settings
  add column if not exists subject_confirmation text default 'Confirma tu cuenta en HenKoaching',
  add column if not exists subject_recovery     text default 'Recupera tu contraseña de HenKoaching',
  add column if not exists template_confirmation text,
  add column if not exists template_recovery     text;
