DO $
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='pacientes' AND column_name='consentimento_lgpd') THEN
    ALTER TABLE public.pacientes ADD COLUMN consentimento_lgpd BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='pacientes' AND column_name='data_consentimento_lgpd') THEN
    ALTER TABLE public.pacientes ADD COLUMN data_consentimento_lgpd TIMESTAMPTZ;
  END IF;
END $;

