DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='financeiro' AND column_name='status') THEN
    ALTER TABLE public.financeiro ADD COLUMN status text DEFAULT 'pendente';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='financeiro' AND column_name='metodo_pagamento') THEN
    ALTER TABLE public.financeiro ADD COLUMN metodo_pagamento text;
  END IF;
END $$;
