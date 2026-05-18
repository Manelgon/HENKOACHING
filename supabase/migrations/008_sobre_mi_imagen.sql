-- =============================================================================
-- MIGRACIÓN 008 — IMAGEN "SOBRE MÍ"
-- =============================================================================
-- Añade columna sobre_mi_path a company_settings para guardar la foto de
-- Jennifer que se muestra en /sobre-mi. Se sube desde /dashboard/ajustes y
-- reutiliza el bucket existente "doc-assets".
-- =============================================================================

alter table public.company_settings
  add column if not exists sobre_mi_path text;
