CREATE TABLE IF NOT EXISTS public.ponto_eletronico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    entrada_1 TIME,
    saida_1 TIME,
    entrada_2 TIME,
    saida_2 TIME,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(usuario_id, data)
);

CREATE TABLE IF NOT EXISTS public.solicitacoes_rh (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tipo TEXT NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE,
    descricao TEXT,
    status TEXT NOT NULL DEFAULT 'pendente',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ponto_eletronico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitacoes_rh ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ponto_policy" ON public.ponto_eletronico;
CREATE POLICY "ponto_policy" ON public.ponto_eletronico
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "solicitacoes_policy" ON public.solicitacoes_rh;
CREATE POLICY "solicitacoes_policy" ON public.solicitacoes_rh
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

