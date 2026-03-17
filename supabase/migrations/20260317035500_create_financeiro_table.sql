CREATE TABLE IF NOT EXISTS public.financeiro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  mes INTEGER NOT NULL,
  ano INTEGER NOT NULL,
  valor_recebido NUMERIC NOT NULL DEFAULT 0,
  valor_a_receber NUMERIC NOT NULL DEFAULT 0,
  data_atualizacao TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT financeiro_usuario_paciente_mes_ano_key UNIQUE (usuario_id, paciente_id, mes, ano)
);

ALTER TABLE public.financeiro ENABLE ROW LEVEL SECURITY;

CREATE POLICY "financeiro_policy" ON public.financeiro
  FOR ALL TO authenticated USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());
