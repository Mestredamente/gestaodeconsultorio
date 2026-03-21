DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='usuarios' AND column_name='data_proxima_cobranca') THEN
    ALTER TABLE public.usuarios ADD COLUMN data_proxima_cobranca TIMESTAMPTZ;
  END IF;
END $$;
