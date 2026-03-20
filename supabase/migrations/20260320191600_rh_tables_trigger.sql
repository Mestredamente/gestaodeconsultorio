-- Make sure the HR functionality has full access
ALTER TABLE public.pontos_eletronicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitacoes_rh ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pontos_eletronicos_policy" ON public.pontos_eletronicos;
CREATE POLICY "pontos_eletronicos_policy" ON public.pontos_eletronicos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "solicitacoes_rh_policy" ON public.solicitacoes_rh;
CREATE POLICY "solicitacoes_rh_policy" ON public.solicitacoes_rh
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

