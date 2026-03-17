-- Add online consultation and room_id fields
ALTER TABLE public.agendamentos
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS room_id TEXT;

-- Seed default specialties for psychologists
DO $$
DECLARE
  v_user record;
BEGIN
  FOR v_user IN SELECT id FROM public.usuarios LOOP
    UPDATE public.usuarios 
    SET especialidades_disponiveis = ARRAY[
      'Terapia Cognitivo-Comportamental (TCC)',
      'Psicanálise',
      'Gestalt-terapia',
      'Fenomenologia',
      'Psicodrama',
      'Abordagem Centrada na Pessoa (ACP)',
      'Terapia Analítico-Comportamental (TAC)',
      'Psicologia Junguiana',
      'Terapia Sistêmica',
      'Neuropsicologia'
    ]
    WHERE id = v_user.id AND (especialidades_disponiveis IS NULL OR array_length(especialidades_disponiveis, 1) = 0);
  END LOOP;
END $$;

-- Update RPC to fetch more portal data (including chave_pix and is_online)
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
    v_documentos jsonb;
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

    SELECT nome_consultorio, texto_contrato, politica_cancelamento, chave_pix INTO v_clinica 
    FROM public.usuarios 
    WHERE id = v_paciente.usuario_id LIMIT 1;

    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', a.id,
        'data_hora', a.data_hora,
        'status', a.status,
        'especialidade', a.especialidade,
        'valor_total', a.valor_total,
        'sinal_pago', a.sinal_pago,
        'is_online', a.is_online,
        'room_id', a.room_id,
        'convenio_id', a.convenio_id
    ) ORDER BY a.data_hora ASC), '[]'::jsonb) INTO v_agendamentos
    FROM public.agendamentos a
    WHERE a.paciente_id = v_paciente.id AND a.data_hora >= NOW() AND a.status = 'agendado';

    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', a.id,
        'data_hora', a.data_hora,
        'especialidade', a.especialidade
    ) ORDER BY a.data_hora DESC), '[]'::jsonb) INTO v_past_appointments
    FROM public.agendamentos a
    LEFT JOIN public.avaliacoes av ON a.id = av.agendamento_id
    WHERE a.paciente_id = v_paciente.id 
      AND a.status = 'compareceu'
      AND a.data_hora < NOW()
      AND av.id IS NULL
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

    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', pr.id,
        'data_emissao', pr.data_emissao,
        'hash_verificacao', pr.hash_verificacao,
        'conteudo_json', pr.conteudo_json
    ) ORDER BY pr.data_emissao DESC), '[]'::jsonb) INTO v_documentos
    FROM public.prescricoes pr
    WHERE pr.paciente_id = v_paciente.id;

    RETURN jsonb_build_object(
        'usuario_id', v_paciente.usuario_id,
        'paciente_id', v_paciente.id,
        'paciente_nome', v_paciente.nome,
        'paciente_cpf', v_paciente.cpf,
        'contrato_aceito', v_paciente.contrato_aceito,
        'consultorio', v_clinica.nome_consultorio,
        'chave_pix', v_clinica.chave_pix,
        'texto_contrato', v_clinica.texto_contrato,
        'politica_cancelamento', v_clinica.politica_cancelamento,
        'agendamentos', v_agendamentos,
        'historico', COALESCE(v_historico, '[]'::jsonb),
        'documentos', v_documentos,
        'pending_survey', v_past_appointments,
        'past_sessions', v_all_past
    );
END;
$function$;

CREATE OR REPLACE FUNCTION public.pay_appointment_portal(p_hash uuid, p_agendamento_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_paciente_id uuid;
    v_usuario_id uuid;
    v_agendamento record;
    v_month integer;
    v_year integer;
BEGIN
    SELECT id, usuario_id INTO v_paciente_id, v_usuario_id FROM public.pacientes WHERE hash_anamnese = p_hash LIMIT 1;
    IF v_paciente_id IS NULL THEN
        RETURN false;
    END IF;

    SELECT * INTO v_agendamento FROM public.agendamentos 
    WHERE id = p_agendamento_id AND paciente_id = v_paciente_id AND status = 'agendado';

    IF v_agendamento.id IS NULL THEN
        RETURN false;
    END IF;

    UPDATE public.agendamentos 
    SET sinal_pago = true 
    WHERE id = p_agendamento_id;
    
    v_month := EXTRACT(MONTH FROM v_agendamento.data_hora);
    v_year := EXTRACT(YEAR FROM v_agendamento.data_hora);

    INSERT INTO public.financeiro (usuario_id, paciente_id, mes, ano, valor_recebido, valor_a_receber)
    VALUES (v_usuario_id, v_paciente_id, v_month, v_year, v_agendamento.valor_total, 0)
    ON CONFLICT (usuario_id, paciente_id, mes, ano) 
    DO UPDATE SET valor_recebido = financeiro.valor_recebido + EXCLUDED.valor_recebido;

    RETURN FOUND;
END;
$function$;
