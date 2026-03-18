-- Drop and recreate the valid_status constraint to include 'confirmado'
ALTER TABLE public.agendamentos DROP CONSTRAINT IF EXISTS valid_status;
ALTER TABLE public.agendamentos ADD CONSTRAINT valid_status CHECK (status IN ('agendado', 'confirmado', 'compareceu', 'faltou', 'desmarcou'));

-- Create historico_mensagens table
CREATE TABLE IF NOT EXISTS public.historico_mensagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    status_envio TEXT NOT NULL DEFAULT 'enviado',
    data_envio TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for historico_mensagens
ALTER TABLE public.historico_mensagens ENABLE ROW LEVEL SECURITY;

-- Add RLS policy
CREATE POLICY "historico_mensagens_policy" ON public.historico_mensagens
    FOR ALL TO authenticated USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());

-- Create RPC function to confirm appointments via public portal
CREATE OR REPLACE FUNCTION public.confirm_appointment_portal(p_hash uuid, p_agendamento_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $
DECLARE
    v_paciente record;
    v_clinica text;
BEGIN
    SELECT p.id, p.usuario_id INTO v_paciente FROM public.pacientes p WHERE p.hash_anamnese = p_hash LIMIT 1;
    IF v_paciente.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Link inválido ou paciente não encontrado.');
    END IF;

    SELECT nome_consultorio INTO v_clinica FROM public.usuarios WHERE id = v_paciente.usuario_id;

    UPDATE public.agendamentos
    SET status = 'confirmado'
    WHERE id = p_agendamento_id AND paciente_id = v_paciente.id AND status = 'agendado';

    IF FOUND THEN
        RETURN jsonb_build_object('success', true, 'consultorio', v_clinica);
    ELSE
        RETURN jsonb_build_object('success', false, 'error', 'Agendamento não encontrado, já foi atualizado ou já ocorreu.', 'consultorio', v_clinica);
    END IF;
END;
$;

