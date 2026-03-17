-- Add new columns to agendamentos for advanced scheduling and pre-payments
ALTER TABLE public.agendamentos 
ADD COLUMN IF NOT EXISTS especialidade TEXT,
ADD COLUMN IF NOT EXISTS valor_total NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS valor_sinal NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS sinal_pago BOOLEAN DEFAULT false;

-- Add new column to usuarios for available specialties
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS especialidades_disponiveis TEXT[] DEFAULT '{}'::TEXT[];

-- Create RPC function to securely fetch patient portal data by hash
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

    -- Get session history
    SELECT historico_sessoes INTO v_historico
    FROM public.prontuarios
    WHERE paciente_id = v_paciente.id LIMIT 1;

    -- Build final response
    RETURN jsonb_build_object(
        'paciente_nome', v_paciente.nome,
        'consultorio', v_clinica,
        'agendamentos', v_agendamentos,
        'historico', COALESCE(v_historico, '[]'::jsonb)
    );
END;
$function$;
