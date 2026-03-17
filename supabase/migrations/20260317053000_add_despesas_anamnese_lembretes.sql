-- Create despesas table
CREATE TABLE IF NOT EXISTS public.despesas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL DEFAULT 0,
  data DATE NOT NULL,
  categoria TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for despesas
ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "despesas_policy" ON public.despesas
  FOR ALL TO authenticated USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());

-- Add anamnesis and whatsapp settings to usuarios
DO $$ BEGIN
  ALTER TABLE public.usuarios 
    ADD COLUMN anamnese_template JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN lembrete_whatsapp_ativo BOOLEAN DEFAULT false,
    ADD COLUMN template_lembrete TEXT DEFAULT 'Olá [Nome], você tem uma consulta amanhã às [hora].';
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- Add anamnesis data to pacientes
DO $$ BEGIN
  ALTER TABLE public.pacientes
    ADD COLUMN anamnese JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN hash_anamnese UUID DEFAULT gen_random_uuid();
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- Function to safely update patient anamnese via public hash
CREATE OR REPLACE FUNCTION update_anamnese(p_hash uuid, p_anamnese jsonb) RETURNS jsonb AS $$
DECLARE
  v_paciente_id uuid;
BEGIN
  UPDATE public.pacientes SET anamnese = p_anamnese WHERE hash_anamnese = p_hash RETURNING id INTO v_paciente_id;
  IF v_paciente_id IS NULL THEN
    RETURN jsonb_build_object('success', false);
  END IF;
  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to fetch anamnesis data via public hash
CREATE OR REPLACE FUNCTION get_anamnese_data(p_hash uuid) RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'paciente_nome', p.nome,
    'anamnese', p.anamnese,
    'template', u.anamnese_template,
    'consultorio', u.nome_consultorio
  ) INTO v_result
  FROM public.pacientes p
  JOIN public.usuarios u ON p.usuario_id = u.id
  WHERE p.hash_anamnese = p_hash LIMIT 1;
  
  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
