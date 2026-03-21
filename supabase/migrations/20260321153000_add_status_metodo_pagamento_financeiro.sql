ALTER TABLE public.financeiro ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pendente';
ALTER TABLE public.financeiro ADD COLUMN IF NOT EXISTS metodo_pagamento TEXT;
