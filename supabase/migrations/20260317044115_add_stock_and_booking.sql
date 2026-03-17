-- Create Estoque Table
CREATE TABLE IF NOT EXISTS public.estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  nome_item TEXT NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 0,
  data_atualizacao TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for estoque
ALTER TABLE public.estoque ENABLE ROW LEVEL SECURITY;

-- Policy for estoque
CREATE POLICY "estoque_policy" ON public.estoque
  FOR ALL TO authenticated USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());

-- Allow anonymous read on usuarios for the public booking page to fetch clinic name
CREATE POLICY "anon_read_usuarios" ON public.usuarios
  FOR SELECT TO anon USING (true);

-- RPC for Public Booking (allows inserting patients and appointments anonymously safely)
CREATE OR REPLACE FUNCTION public.create_public_booking(
  p_clinic_id UUID,
  p_nome TEXT,
  p_telefone TEXT,
  p_data_hora TIMESTAMPTZ
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_paciente_id UUID;
  v_agendamento_id UUID;
BEGIN
  -- Check if patient already exists by phone and clinic
  SELECT id INTO v_paciente_id FROM public.pacientes
  WHERE telefone = p_telefone AND usuario_id = p_clinic_id LIMIT 1;

  -- Create patient if not exists
  IF v_paciente_id IS NULL THEN
    INSERT INTO public.pacientes (usuario_id, nome, telefone)
    VALUES (p_clinic_id, p_nome, p_telefone)
    RETURNING id INTO v_paciente_id;
  END IF;

  -- Create appointment
  INSERT INTO public.agendamentos (usuario_id, paciente_id, data_hora, status)
  VALUES (p_clinic_id, v_paciente_id, p_data_hora, 'agendado')
  RETURNING id INTO v_agendamento_id;

  RETURN jsonb_build_object('success', true, 'agendamento_id', v_agendamento_id);
END;
$$;
