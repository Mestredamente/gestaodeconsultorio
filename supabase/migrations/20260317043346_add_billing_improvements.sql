-- Add customizable template column
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS template_cobranca TEXT;

-- Create billing history table
CREATE TABLE IF NOT EXISTS public.historico_cobrancas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  data_envio TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valor_cobrado NUMERIC NOT NULL,
  mes_referencia INTEGER NOT NULL,
  ano_referencia INTEGER NOT NULL
);

-- Enable RLS
ALTER TABLE public.historico_cobrancas ENABLE ROW LEVEL SECURITY;

-- Create policy
DO $$ BEGIN
  CREATE POLICY "historico_cobrancas_policy"
    ON public.historico_cobrancas
    FOR ALL
    TO authenticated
    USING (usuario_id = auth.uid())
    WITH CHECK (usuario_id = auth.uid());
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
