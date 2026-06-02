-- Almacena el RAT (Registro de Actividades de Tratamiento) firmado por Jennifer
ALTER TABLE company_settings
  ADD COLUMN IF NOT EXISTS rat_firmado_path TEXT,
  ADD COLUMN IF NOT EXISTS rat_firmado_at TIMESTAMPTZ;
