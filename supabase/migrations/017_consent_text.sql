-- PD-09: Almacenamiento del texto exacto de consentimiento (art. 7.1 RGPD)
-- El responsable debe poder demostrar QUÉ texto vio el interesado cuando aceptó.

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS consent_text TEXT;

ALTER TABLE public.candidato_profiles
  ADD COLUMN IF NOT EXISTS acepto_privacidad_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consent_text TEXT;
