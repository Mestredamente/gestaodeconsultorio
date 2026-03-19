-- 1. Disable medical records in existing settings
UPDATE public.usuarios
SET portal_settings = portal_settings - 'show_medical_records'
WHERE portal_settings ? 'show_medical_records';

-- 2. Update get_patient_portal_data to NEVER return medical records (prontuarios/historico)
DROP FUNCTION IF EXISTS public.get_patient_portal_data(uuid);
CREATE OR REPLACE FUNCTION public.get_patient_portal_data(p_hash uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_result jsonb;
    v_paciente record;
    v_agendamentos jsonb := '[]'::jsonb;
    v_documentos jsonb := '[]'::jsonb;
    v_testes jsonb := '[]'::jsonb;
    v_clinica record;
    v_past_appointments jsonb := '[]'::jsonb;
    v_all_past jsonb := '[]'::jsonb;
    v_portal_settings jsonb;
BEGIN
    SELECT p.id, p.nome, p.cpf, p.usuario_id, p.contrato_aceito, p.data_aceite_contrato INTO v_paciente
    FROM public.pacientes p
    WHERE p.hash_anamnese = p_hash LIMIT 1;

    IF v_paciente.id IS NULL THEN
        RETURN '{}'::jsonb;
    END IF;

    SELECT nome_consultorio, texto_contrato, politica_cancelamento, chave_pix, portal_settings INTO v_clinica 
    FROM public.usuarios 
    WHERE id = v_paciente.usuario_id LIMIT 1;

    v_portal_settings := COALESCE(v_clinica.portal_settings, '{"show_tests": true, "show_appointments": true, "show_prescriptions": true}'::jsonb);

    IF COALESCE((v_portal_settings->>'show_appointments')::boolean, true) THEN
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
    END IF;

    IF COALESCE((v_portal_settings->>'show_prescriptions')::boolean, true) THEN
        SELECT COALESCE(jsonb_agg(jsonb_build_object(
            'id', pr.id,
            'data_emissao', pr.data_emissao,
            'hash_verificacao', pr.hash_verificacao,
            'conteudo_json', pr.conteudo_json
        ) ORDER BY pr.data_emissao DESC), '[]'::jsonb) INTO v_documentos
        FROM public.prescricoes pr
        WHERE pr.paciente_id = v_paciente.id;
    END IF;

    IF COALESCE((v_portal_settings->>'show_tests')::boolean, true) THEN
        SELECT COALESCE(jsonb_agg(jsonb_build_object(
            'id', tp.id,
            'status', tp.status,
            'data_envio', tp.data_envio,
            'titulo', td.titulo,
            'conteudo', td.conteudo
        ) ORDER BY tp.data_envio DESC), '[]'::jsonb) INTO v_testes
        FROM public.testes_pacientes tp
        JOIN public.templates_documentos td ON tp.template_id = td.id
        WHERE tp.paciente_id = v_paciente.id;
    END IF;

    RETURN jsonb_build_object(
        'usuario_id', v_paciente.usuario_id,
        'paciente_id', v_paciente.id,
        'paciente_nome', v_paciente.nome,
        'paciente_cpf', v_paciente.cpf,
        'contrato_aceito', v_paciente.contrato_aceito,
        'data_aceite_contrato', v_paciente.data_aceite_contrato,
        'consultorio', v_clinica.nome_consultorio,
        'chave_pix', v_clinica.chave_pix,
        'texto_contrato', v_clinica.texto_contrato,
        'politica_cancelamento', v_clinica.politica_cancelamento,
        'portal_settings', v_portal_settings,
        'agendamentos', v_agendamentos,
        'documentos', v_documentos,
        'pending_survey', v_past_appointments,
        'past_sessions', v_all_past,
        'testes', v_testes
    );
END;
$function$;
