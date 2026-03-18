-- 1. Create Psychological Testing Table
CREATE TABLE IF NOT EXISTS public.testes_pacientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES public.templates_documentos(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pendente',
    data_envio TIMESTAMPTZ NOT NULL DEFAULT now(),
    data_conclusao TIMESTAMPTZ,
    respostas_json JSONB DEFAULT '{}'::jsonb
);

-- 2. Create Agenda Blocks Table
CREATE TABLE IF NOT EXISTS public.bloqueios_agenda (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    data_inicio TIMESTAMPTZ NOT NULL,
    data_fim TIMESTAMPTZ NOT NULL,
    descricao TEXT
);

-- 3. Add Pre-Consultation settings to usuarios
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS pre_consulta_ativa BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS template_pre_consulta TEXT DEFAULT 'Olá [Nome], sua consulta está confirmada para [data] às [hora]. Nosso endereço é [Endereco]. Por favor, toque a campainha e aguarde na recepção.';

-- 4. Enable RLS
ALTER TABLE public.testes_pacientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "testes_policy" ON public.testes_pacientes 
    FOR ALL TO authenticated USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());

ALTER TABLE public.bloqueios_agenda ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bloqueios_policy" ON public.bloqueios_agenda 
    FOR ALL TO authenticated USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());

-- 5. RPC to Submit Test from Portal
CREATE OR REPLACE FUNCTION public.submit_patient_test(p_hash uuid, p_test_id uuid, p_respostas jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $
DECLARE
    v_paciente_id uuid;
BEGIN
    SELECT id INTO v_paciente_id FROM public.pacientes WHERE hash_anamnese = p_hash LIMIT 1;
    IF v_paciente_id IS NULL THEN RETURN false; END IF;

    UPDATE public.testes_pacientes 
    SET status = 'concluido', respostas_json = p_respostas, data_conclusao = NOW()
    WHERE id = p_test_id AND paciente_id = v_paciente_id AND status = 'pendente';
    
    RETURN FOUND;
END;
$;

-- 6. Update get_clinic_slots to include blocks
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
    v_blocked_slots text[];
    v_appt_slots text[];
BEGIN
    SELECT agendamento_publico_ativo INTO v_ativo
    FROM public.usuarios
    WHERE id = p_clinic_id;

    IF v_ativo IS NOT TRUE THEN
        RETURN jsonb_build_object('ativo', false);
    END IF;

    v_start := (p_date || ' 00:00:00-03')::timestamptz;
    v_end := (p_date || ' 23:59:59-03')::timestamptz;

    -- Get regular appointments
    SELECT COALESCE(array_agg(to_char(data_hora AT TIME ZONE 'America/Sao_Paulo', 'HH24:MI')), ARRAY[]::text[]) 
    INTO v_appt_slots
    FROM public.agendamentos
    WHERE usuario_id = p_clinic_id 
      AND data_hora >= v_start
      AND data_hora <= v_end
      AND status != 'desmarcou';

    -- Get blocks and expand them into 30-min increments to match slot logic
    SELECT COALESCE(array_agg(to_char(h AT TIME ZONE 'America/Sao_Paulo', 'HH24:MI')), ARRAY[]::text[])
    INTO v_blocked_slots
    FROM public.bloqueios_agenda b,
         generate_series(b.data_inicio, b.data_fim - interval '1 minute', interval '30 minutes') AS h
    WHERE b.usuario_id = p_clinic_id
      AND b.data_inicio < v_end AND b.data_fim > v_start;

    -- Combine them
    SELECT to_jsonb(ARRAY(SELECT DISTINCT unnest(v_appt_slots || v_blocked_slots))) INTO v_occupied;

    RETURN jsonb_build_object('ativo', true, 'occupied', COALESCE(v_occupied, '[]'::jsonb));
END;
$function$;

-- 7. Update get_patient_portal_data to include tests
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
    v_testes jsonb;
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
        'id', a.id, 'data_hora', a.data_hora, 'status', a.status,
        'especialidade', a.especialidade, 'valor_total', a.valor_total,
        'sinal_pago', a.sinal_pago, 'is_online', a.is_online,
        'room_id', a.room_id, 'convenio_id', a.convenio_id
    ) ORDER BY a.data_hora ASC), '[]'::jsonb) INTO v_agendamentos
    FROM public.agendamentos a
    WHERE a.paciente_id = v_paciente.id AND a.data_hora >= NOW() AND a.status = 'agendado';

    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', a.id, 'data_hora', a.data_hora, 'especialidade', a.especialidade
    ) ORDER BY a.data_hora DESC), '[]'::jsonb) INTO v_past_appointments
    FROM public.agendamentos a
    LEFT JOIN public.avaliacoes av ON a.id = av.agendamento_id
    WHERE a.paciente_id = v_paciente.id AND a.status = 'compareceu' AND a.data_hora < NOW() AND av.id IS NULL
    LIMIT 1;

    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', a.id, 'data_hora', a.data_hora, 'status', a.status, 'especialidade', a.especialidade
    ) ORDER BY a.data_hora DESC), '[]'::jsonb) INTO v_all_past
    FROM public.agendamentos a
    WHERE a.paciente_id = v_paciente.id AND a.status = 'compareceu' AND a.data_hora < NOW();

    SELECT historico_sessoes INTO v_historico FROM public.prontuarios WHERE paciente_id = v_paciente.id LIMIT 1;

    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', pr.id, 'data_emissao', pr.data_emissao,
        'hash_verificacao', pr.hash_verificacao, 'conteudo_json', pr.conteudo_json
    ) ORDER BY pr.data_emissao DESC), '[]'::jsonb) INTO v_documentos
    FROM public.prescricoes pr WHERE pr.paciente_id = v_paciente.id;

    -- Fetch pending tests
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', tp.id, 'status', tp.status, 'data_envio', tp.data_envio,
        'titulo', td.titulo, 'conteudo', td.conteudo
    ) ORDER BY tp.data_envio DESC), '[]'::jsonb) INTO v_testes
    FROM public.testes_pacientes tp
    JOIN public.templates_documentos td ON tp.template_id = td.id
    WHERE tp.paciente_id = v_paciente.id AND tp.status = 'pendente';

    RETURN jsonb_build_object(
        'usuario_id', v_paciente.usuario_id, 'paciente_id', v_paciente.id,
        'paciente_nome', v_paciente.nome, 'paciente_cpf', v_paciente.cpf,
        'contrato_aceito', v_paciente.contrato_aceito, 'consultorio', v_clinica.nome_consultorio,
        'chave_pix', v_clinica.chave_pix, 'texto_contrato', v_clinica.texto_contrato,
        'politica_cancelamento', v_clinica.politica_cancelamento,
        'agendamentos', v_agendamentos, 'historico', COALESCE(v_historico, '[]'::jsonb),
        'documentos', v_documentos, 'pending_survey', v_past_appointments,
        'past_sessions', v_all_past, 'testes_pendentes', v_testes
    );
END;
$function$;

