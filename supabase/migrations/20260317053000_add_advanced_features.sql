-- Add address fields to pacientes
ALTER TABLE public.pacientes
ADD COLUMN IF NOT EXISTS cep TEXT,
ADD COLUMN IF NOT EXISTS rua TEXT,
ADD COLUMN IF NOT EXISTS numero TEXT,
ADD COLUMN IF NOT EXISTS complemento TEXT,
ADD COLUMN IF NOT EXISTS bairro TEXT,
ADD COLUMN IF NOT EXISTS cidade TEXT,
ADD COLUMN IF NOT EXISTS estado TEXT;

-- Add dashboard preferences to usuarios
ALTER TABLE public.usuarios
ADD COLUMN IF NOT EXISTS preferencias_dashboard JSONB DEFAULT '{"show_agenda": true, "show_birthdays": true, "show_revenue": true}'::jsonb;

-- Add invoice status to agendamentos
ALTER TABLE public.agendamentos
ADD COLUMN IF NOT EXISTS status_nota_fiscal TEXT DEFAULT 'pendente';

-- Create avaliacoes table
CREATE TABLE IF NOT EXISTS public.avaliacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
    agendamento_id UUID REFERENCES public.agendamentos(id) ON DELETE SET NULL,
    nota INTEGER CHECK (nota >= 1 AND nota <= 5),
    comentario TEXT,
    data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "avaliacoes_insert" ON public.avaliacoes
    FOR INSERT TO public WITH CHECK (true);
    
CREATE POLICY "anon_avaliacoes_insert" ON public.avaliacoes
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "auth_avaliacoes_insert" ON public.avaliacoes
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "avaliacoes_select" ON public.avaliacoes
    FOR SELECT TO authenticated USING (true);

-- Update patient portal data RPC to include pending survey
CREATE OR REPLACE FUNCTION public.get_patient_portal_data(p_hash uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_result jsonb;
    v_paciente record;
    v_agendamentos jsonb;
    v_historico jsonb;
    v_clinica text;
    v_past_appointments jsonb;
BEGIN
    -- Find patient by hash
    SELECT p.id, p.nome, p.usuario_id INTO v_paciente
    FROM public.pacientes p
    WHERE p.hash_anamnese = p_hash LIMIT 1;

    IF v_paciente.id IS NULL THEN
        RETURN '{}'::jsonb;
    END IF;

    -- Get clinic name
    SELECT nome_consultorio INTO v_clinica 
    FROM public.usuarios 
    WHERE id = v_paciente.usuario_id LIMIT 1;

    -- Get upcoming appointments
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', a.id,
        'data_hora', a.data_hora,
        'status', a.status,
        'especialidade', a.especialidade,
        'valor_total', a.valor_total,
        'valor_sinal', a.valor_sinal,
        'sinal_pago', a.sinal_pago
    )), '[]'::jsonb) INTO v_agendamentos
    FROM public.agendamentos a
    WHERE a.paciente_id = v_paciente.id AND a.data_hora >= NOW()
    ORDER BY a.data_hora ASC;

    -- Get past appointments for survey (status = 'compareceu', without evaluation)
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', a.id,
        'data_hora', a.data_hora,
        'especialidade', a.especialidade
    )), '[]'::jsonb) INTO v_past_appointments
    FROM public.agendamentos a
    LEFT JOIN public.avaliacoes av ON a.id = av.agendamento_id
    WHERE a.paciente_id = v_paciente.id 
      AND a.status = 'compareceu'
      AND a.data_hora < NOW()
      AND av.id IS NULL
    ORDER BY a.data_hora DESC
    LIMIT 1;

    -- Get session history
    SELECT historico_sessoes INTO v_historico
    FROM public.prontuarios
    WHERE paciente_id = v_paciente.id LIMIT 1;

    -- Build final response
    RETURN jsonb_build_object(
        'paciente_id', v_paciente.id,
        'paciente_nome', v_paciente.nome,
        'consultorio', v_clinica,
        'agendamentos', v_agendamentos,
        'historico', COALESCE(v_historico, '[]'::jsonb),
        'pending_survey', v_past_appointments
    );
END;
$function$;
