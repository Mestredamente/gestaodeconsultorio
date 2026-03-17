-- Adiciona colunas para configurações de pagamento e aceite de contrato na tabela pacientes
ALTER TABLE public.pacientes
ADD COLUMN IF NOT EXISTS frequencia_pagamento TEXT DEFAULT 'sessão',
ADD COLUMN IF NOT EXISTS dia_pagamento INTEGER,
ADD COLUMN IF NOT EXISTS contrato_aceito BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS data_aceite_contrato TIMESTAMPTZ;

-- Adiciona coluna para justificativa de falta na tabela agendamentos
ALTER TABLE public.agendamentos
ADD COLUMN IF NOT EXISTS justificativa_falta TEXT;

-- Adiciona colunas para textos legais na tabela usuarios
ALTER TABLE public.usuarios
ADD COLUMN IF NOT EXISTS texto_contrato TEXT,
ADD COLUMN IF NOT EXISTS politica_cancelamento TEXT;

-- Atualiza a função do portal do paciente para retornar os novos dados
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
    v_clinica record;
    v_past_appointments jsonb;
BEGIN
    -- Busca paciente pelo hash
    SELECT p.id, p.nome, p.usuario_id, p.contrato_aceito INTO v_paciente
    FROM public.pacientes p
    WHERE p.hash_anamnese = p_hash LIMIT 1;

    IF v_paciente.id IS NULL THEN
        RETURN '{}'::jsonb;
    END IF;

    -- Busca informações da clínica (incluindo textos legais)
    SELECT nome_consultorio, texto_contrato, politica_cancelamento INTO v_clinica 
    FROM public.usuarios 
    WHERE id = v_paciente.usuario_id LIMIT 1;

    -- Busca agendamentos futuros
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', a.id,
        'data_hora', a.data_hora,
        'status', a.status,
        'especialidade', a.especialidade,
        'valor_total', a.valor_total
    )), '[]'::jsonb) INTO v_agendamentos
    FROM public.agendamentos a
    WHERE a.paciente_id = v_paciente.id AND a.data_hora >= NOW() AND a.status = 'agendado'
    ORDER BY a.data_hora ASC;

    -- Busca último agendamento passado para pesquisa de satisfação
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

    -- Busca histórico de sessões
    SELECT historico_sessoes INTO v_historico
    FROM public.prontuarios
    WHERE paciente_id = v_paciente.id LIMIT 1;

    -- Retorna o JSON final
    RETURN jsonb_build_object(
        'paciente_id', v_paciente.id,
        'paciente_nome', v_paciente.nome,
        'contrato_aceito', v_paciente.contrato_aceito,
        'consultorio', v_clinica.nome_consultorio,
        'texto_contrato', v_clinica.texto_contrato,
        'politica_cancelamento', v_clinica.politica_cancelamento,
        'agendamentos', v_agendamentos,
        'historico', COALESCE(v_historico, '[]'::jsonb),
        'pending_survey', v_past_appointments
    );
END;
$function$;

-- Nova função para aceitar o contrato via portal
CREATE OR REPLACE FUNCTION public.accept_patient_contract(p_hash uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    UPDATE public.pacientes 
    SET contrato_aceito = true, data_aceite_contrato = NOW() 
    WHERE hash_anamnese = p_hash;
    RETURN FOUND;
END;
$function$;

-- Nova função para paciente cancelar agendamento e justificar via portal
CREATE OR REPLACE FUNCTION public.cancel_appointment_portal(p_hash uuid, p_agendamento_id uuid, p_justificativa text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_paciente_id uuid;
BEGIN
    -- Verifica autenticidade do paciente pelo hash
    SELECT id INTO v_paciente_id FROM public.pacientes WHERE hash_anamnese = p_hash LIMIT 1;
    IF v_paciente_id IS NULL THEN
        RETURN false;
    END IF;

    -- Atualiza o status e a justificativa apenas se pertencer ao paciente e estiver agendado
    UPDATE public.agendamentos 
    SET status = 'desmarcou', justificativa_falta = p_justificativa 
    WHERE id = p_agendamento_id AND paciente_id = v_paciente_id AND status = 'agendado';
    
    RETURN FOUND;
END;
$function$;
