-- Añade fecha de nacimiento al perfil del candidato
ALTER TABLE candidato_profiles ADD COLUMN IF NOT EXISTS fecha_nacimiento date;
