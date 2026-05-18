-- =============================================================================
-- MIGRACIÓN 005 — DATOS DEL SISTEMA INFORMÁTICO VERIFACTU
-- =============================================================================
-- Añade a company_settings los campos del bloque SistemaInformatico que AEAT
-- exige en cada registro Verifactu. Si productor_nombre / productor_nif quedan
-- vacíos, se usan los del emisor (caso típico: software interno).
-- =============================================================================

alter table public.company_settings
  add column if not exists verifactu_productor_nombre text default '',
  add column if not exists verifactu_productor_nif text default '',
  add column if not exists verifactu_sistema_nombre text default 'Henkoaching Facturación',
  add column if not exists verifactu_sistema_id text default 'HK',
  add column if not exists verifactu_version text default '1.0',
  add column if not exists verifactu_numero_instalacion text default 'HK-01';
