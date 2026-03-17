-- Add columns
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS agendamento_publico_ativo BOOLEAN DEFAULT false;
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS recorrencia TEXT DEFAULT 'único', ADD COLUMN IF NOT EXISTS dia_fixo TEXT;

-- Update create_public_booking to return hash_anamnese
CREATE OR REPLACE FUNCTION public.create_public_booking(p_clinic_id uuid, p_nome text, p_telefone text, p_data_hora timestamp with time zone)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_paciente record;
  v_agendamento_id UUID;
BEGIN
  SELECT id, hash_anamnese INTO v_paciente FROM public.pacientes
  WHERE telefone = p_telefone AND usuario_id = p_clinic_id LIMIT 1;

  IF v_paciente.id IS NULL THEN
    INSERT INTO public.pacientes (usuario_id, nome, telefone)
    VALUES (p_clinic_id, p_nome, p_telefone)
    RETURNING id, hash_anamnese INTO v_paciente;
  END IF;

  INSERT INTO public.agendamentos (usuario_id, paciente_id, data_hora, status)
  VALUES (p_clinic_id, v_paciente.id, p_data_hora, 'agendado')
  RETURNING id INTO v_agendamento_id;

  RETURN jsonb_build_object('success', true, 'agendamento_id', v_agendamento_id, 'hash_anamnese', v_paciente.hash_anamnese);
END;
$function$;

-- Create get_clinic_slots
CREATE OR REPLACE FUNCTION public.get_clinic_slots(p_clinic_id uuid, p_date text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_ativo boolean;
    v_occupied jsonb;
    v_start timestamptz;
    v_end timestamptz;
BEGIN
    SELECT agendamento_publico_ativo INTO v_ativo
    FROM public.usuarios
    WHERE id = p_clinic_id;

    IF v_ativo IS NOT TRUE THEN
        RETURN jsonb_build_object('ativo', false);
    END IF;

    v_start := (p_date || ' 00:00:00-03')::timestamptz;
    v_end := (p_date || ' 23:59:59-03')::timestamptz;

    SELECT COALESCE(jsonb_agg(to_char(data_hora AT TIME ZONE 'America/Sao_Paulo', 'HH24:MI')), '[]'::jsonb) INTO v_occupied
    FROM public.agendamentos
    WHERE usuario_id = p_clinic_id 
      AND data_hora >= v_start
      AND data_hora <= v_end
      AND status != 'desmarcou';

    RETURN jsonb_build_object('ativo', true, 'occupied', v_occupied);
END;
$function$;

-- Create request_medical_record
CREATE OR REPLACE FUNCTION public.request_medical_record(p_hash uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_paciente record;
BEGIN
    SELECT p.id, p.nome, p.usuario_id INTO v_paciente
    FROM public.pacientes p
    WHERE p.hash_anamnese = p_hash LIMIT 1;

    IF v_paciente.id IS NULL THEN
        RETURN false;
    END IF;

    INSERT INTO public.notificacoes (usuario_id, titulo, mensagem)
    VALUES (v_paciente.usuario_id, 'Solicitação de Prontuário', 'O paciente ' || v_paciente.nome || ' solicitou acesso ao seu prontuário médico pelo Portal do Paciente.');

    RETURN true;
END;
$function$;

-- Update get_patient_portal_data
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
    v_all_past jsonb;
BEGIN
    SELECT p.id, p.nome, p.cpf, p.usuario_id, p.contrato_aceito INTO v_paciente
    FROM public.pacientes p
    WHERE p.hash_anamnese = p_hash LIMIT 1;

    IF v_paciente.id IS NULL THEN
        RETURN '{}'::jsonb;
    END IF;

    SELECT nome_consultorio, texto_contrato, politica_cancelamento INTO v_clinica 
    FROM public.usuarios 
    WHERE id = v_paciente.usuario_id LIMIT 1;

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

    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', a.id,
        'data_hora', a.data_hora,
        'status', a.status,
        'especialidade', a.especialidade
    ) ORDER BY a.data_hora DESC), '[]'::jsonb) INTO v_all_past
    FROM public.agendamentos a
    WHERE a.paciente_id = v_paciente.id AND a.status = 'compareceu' AND a.data_hora < NOW();

    SELECT historico_sessoes INTO v_historico
    FROM public.prontuarios
    WHERE paciente_id = v_paciente.id LIMIT 1;

    RETURN jsonb_build_object(
        'usuario_id', v_paciente.usuario_id,
        'paciente_id', v_paciente.id,
        'paciente_nome', v_paciente.nome,
        'paciente_cpf', v_paciente.cpf,
        'contrato_aceito', v_paciente.contrato_aceito,
        'consultorio', v_clinica.nome_consultorio,
        'texto_contrato', v_clinica.texto_contrato,
        'politica_cancelamento', v_clinica.politica_cancelamento,
        'agendamentos', v_agendamentos,
        'historico', COALESCE(v_historico, '[]'::jsonb),
        'pending_survey', v_past_appointments,
        'past_sessions', v_all_past
    );
END;
$function$;

