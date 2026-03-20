DO $$
BEGIN
  -- Add new columns safely
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='usuarios' AND column_name='plano') THEN
    ALTER TABLE public.usuarios ADD COLUMN plano TEXT DEFAULT 'gratuito';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='usuarios' AND column_name='onboarding_concluido') THEN
    ALTER TABLE public.usuarios ADD COLUMN onboarding_concluido BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='usuarios' AND column_name='stripe_customer_id') THEN
    ALTER TABLE public.usuarios ADD COLUMN stripe_customer_id TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='usuarios' AND column_name='stripe_subscription_id') THEN
    ALTER TABLE public.usuarios ADD COLUMN stripe_subscription_id TEXT;
  END IF;
END $$;

-- Enforce RLS
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pacientes_policy" ON public.pacientes;
CREATE POLICY "pacientes_policy" ON public.pacientes
  FOR ALL TO authenticated USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());

ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "agendamentos_policy" ON public.agendamentos;
CREATE POLICY "agendamentos_policy" ON public.agendamentos
  FOR ALL TO authenticated USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());

ALTER TABLE public.financeiro ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "financeiro_policy" ON public.financeiro;
CREATE POLICY "financeiro_policy" ON public.financeiro
  FOR ALL TO authenticated USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());

ALTER TABLE public.prontuarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "prontuarios_policy" ON public.prontuarios;
CREATE POLICY "prontuarios_policy" ON public.prontuarios
  FOR ALL TO authenticated USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());

-- RPC for updating plan
CREATE OR REPLACE FUNCTION public.confirm_plan_upgrade(p_plano text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.usuarios SET plano = p_plano WHERE id = auth.uid();
END;
$$;
