-- Añade consent_confirmed_at a candidato_profiles para registrar
-- el momento exacto en que el candidato confirma su email (art. 7.1 RGPD).
-- Un trigger en auth.users sincroniza el valor automáticamente al confirmar.

ALTER TABLE public.candidato_profiles
  ADD COLUMN IF NOT EXISTS consent_confirmed_at TIMESTAMPTZ;

-- Función trigger: cuando email_confirmed_at pasa de NULL a un valor
-- en auth.users, escribe ese timestamp en candidato_profiles.
CREATE OR REPLACE FUNCTION public.sync_email_confirmed_to_candidato()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    UPDATE public.candidato_profiles
    SET consent_confirmed_at = NEW.email_confirmed_at
    WHERE user_id = NEW.id
      AND consent_confirmed_at IS NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_user_email_confirmed ON auth.users;
CREATE TRIGGER on_user_email_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_email_confirmed_to_candidato();

-- Relleno retroactivo: candidatos que ya tienen email confirmado
-- pero aún no tienen consent_confirmed_at.
UPDATE public.candidato_profiles cp
SET consent_confirmed_at = u.email_confirmed_at
FROM auth.users u
WHERE cp.user_id = u.id
  AND u.email_confirmed_at IS NOT NULL
  AND cp.consent_confirmed_at IS NULL;
