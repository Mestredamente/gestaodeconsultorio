CREATE TABLE IF NOT EXISTS public.casos_supervisao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  titulo_anonimizado TEXT NOT NULL,
  descricao_caso TEXT NOT NULL,
  area_atuacao TEXT,
  data_criacao TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pendente'
);

ALTER TABLE public.casos_supervisao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "casos_supervisao_policy" ON public.casos_supervisao
  FOR ALL TO authenticated USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());
