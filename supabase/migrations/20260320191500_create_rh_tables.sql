CREATE TABLE IF NOT EXISTS public.pontos_eletronicos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data date NOT NULL,
  entrada time,
  saida_almoco time,
  retorno_almoco time,
  saida time,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.solicitacoes_rh (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('atestado', 'ferias')),
  data_inicio date NOT NULL,
  data_fim date NOT NULL,
  anexo_url text,
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.pontos_eletronicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitacoes_rh ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pontos_eletronicos_policy" ON public.pontos_eletronicos;
CREATE POLICY "pontos_eletronicos_policy" ON public.pontos_eletronicos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "solicitacoes_rh_policy" ON public.solicitacoes_rh;
CREATE POLICY "solicitacoes_rh_policy" ON public.solicitacoes_rh
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

