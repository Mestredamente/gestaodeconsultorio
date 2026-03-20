CREATE OR REPLACE FUNCTION public.cancel_appointment_portal(p_hash uuid, p_agendamento_id uuid, p_justificativa text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_paciente_id uuid;
    v_data_hora timestamptz;
BEGIN
    -- Verifica autenticidade do paciente pelo hash
    SELECT id INTO v_paciente_id FROM public.pacientes WHERE hash_anamnese = p_hash LIMIT 1;
    IF v_paciente_id IS NULL THEN
        RETURN false;
    END IF;

    -- Pega os dados do agendamento
    SELECT data_hora INTO v_data_hora FROM public.agendamentos 
    WHERE id = p_agendamento_id AND paciente_id = v_paciente_id AND status = 'agendado';
    
    IF v_data_hora IS NULL THEN
        RETURN false;
    END IF;

    -- Verifica regra de 24 horas
    IF v_data_hora < (NOW() + interval '24 hours') THEN
        RAISE EXCEPTION 'Cancelamento permitido apenas com 24 horas de antecedência.';
    END IF;

    -- Atualiza o status e a justificativa
    UPDATE public.agendamentos 
    SET status = 'desmarcou', justificativa_falta = p_justificativa 
    WHERE id = p_agendamento_id;
    
    RETURN FOUND;
END;
$function$;

