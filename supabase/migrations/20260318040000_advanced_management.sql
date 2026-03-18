-- Create bloqueios_agenda
CREATE TABLE IF NOT EXISTS public.bloqueios_agenda (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    data_inicio TIMESTAMPTZ NOT NULL,
    data_fim TIMESTAMPTZ NOT NULL,
    descricao TEXT
);
ALTER TABLE public.bloqueios_agenda ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bloqueios_agenda_policy" ON public.bloqueios_agenda FOR ALL TO authenticated USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());

-- Create testes_pacientes
CREATE TABLE IF NOT EXISTS public.testes_pacientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES public.templates_documentos(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pendente',
    respostas_json JSONB DEFAULT '{}'::jsonb,
    data_envio TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    data_conclusao TIMESTAMPTZ
);
ALTER TABLE public.testes_pacientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "testes_pacientes_policy" ON public.testes_pacientes FOR ALL TO authenticated USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());

-- Add fields to usuarios for pre-consultation
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS pre_consulta_ativa BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS template_pre_consulta TEXT DEFAULT 'Olá [Nome], sua consulta está confirmada para [Data] às [Hora]. O endereço é [Endereco]. Te aguardamos!';

-- Trigger for confirmed appointments
CREATE OR REPLACE FUNCTION public.trigger_agendamento_confirmado()
RETURNS trigger AS $$
DECLARE
    v_usuario record;
    v_paciente record;
    v_msg text;
BEGIN
    IF NEW.status = 'confirmado' AND OLD.status != 'confirmado' THEN
        SELECT * INTO v_usuario FROM public.usuarios WHERE id = NEW.usuario_id;
        IF v_usuario.pre_consulta_ativa = true THEN
            SELECT * INTO v_paciente FROM public.pacientes WHERE id = NEW.paciente_id;
            
            v_msg := REPLACE(v_usuario.template_pre_consulta, '[Nome]', COALESCE(v_paciente.nome, ''));
            v_msg := REPLACE(v_msg, '[Data]', to_char(NEW.data_hora AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY'));
            v_msg := REPLACE(v_msg, '[Hora]', to_char(NEW.data_hora AT TIME ZONE 'America/Sao_Paulo', 'HH24:MI'));
            v_msg := REPLACE(v_msg, '[Endereco]', COALESCE(v_paciente.endereco, 'nosso consultório'));
            
            INSERT INTO public.notificacoes (usuario_id, titulo, mensagem)
            VALUES (NEW.usuario_id, 'Mensagem Automática', 'Pré-consulta agendada para ' || COALESCE(v_paciente.nome, ''));
            
            INSERT INTO public.historico_mensagens (usuario_id, paciente_id, tipo, conteudo, status_envio)
            VALUES (NEW.usuario_id, NEW.paciente_id, 'pre_consulta', v_msg, 'enviado');
        END IF;

        INSERT INTO public.notificacoes (usuario_id, titulo, mensagem)
        VALUES (NEW.usuario_id, 'Consulta Confirmada', 'O paciente ' || (SELECT nome FROM public.pacientes WHERE id = NEW.paciente_id) || ' confirmou a consulta via portal.');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS agendamento_confirmado_trigger ON public.agendamentos;
CREATE TRIGGER agendamento_confirmado_trigger
AFTER UPDATE ON public.agendamentos
FOR EACH ROW EXECUTE FUNCTION public.trigger_agendamento_confirmado();

-- RPC get_patient_portal_data updated
CREATE OR REPLACE FUNCTION public.get_patient_portal_data(p_hash uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
DECLARE
    v_result jsonb;
    v_paciente record;
    v_agendamentos jsonb;
    v_historico jsonb;
    v_documentos jsonb;
    v_testes jsonb;
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
        'past_sessions', v_all_past,
        'testes', v_testes
    );
END;
$$;

-- RPC submit_patient_test
CREATE OR REPLACE FUNCTION public.submit_patient_test(p_hash uuid, p_teste_id uuid, p_respostas jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
DECLARE
    v_paciente_id uuid;
BEGIN
    SELECT id INTO v_paciente_id FROM public.pacientes WHERE hash_anamnese = p_hash LIMIT 1;
    IF v_paciente_id IS NULL THEN
        RETURN false;
    END IF;

    UPDATE public.testes_pacientes
    SET status = 'concluido', respostas_json = p_respostas, data_conclusao = NOW()
    WHERE id = p_teste_id AND paciente_id = v_paciente_id;
    
    RETURN FOUND;
END;
$$;

-- RPC get_clinic_slots updated
CREATE OR REPLACE FUNCTION public.get_clinic_slots(p_clinic_id uuid, p_date text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
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
    FROM (
        SELECT data_hora FROM public.agendamentos
        WHERE usuario_id = p_clinic_id 
          AND data_hora >= v_start
          AND data_hora <= v_end
          AND status != 'desmarcou'
        UNION ALL
        SELECT data_inicio as data_hora FROM public.bloqueios_agenda
        WHERE usuario_id = p_clinic_id
          AND data_inicio >= v_start
          AND data_inicio <= v_end
    ) as combined_slots;

    RETURN jsonb_build_object('ativo', true, 'occupied', v_occupied);
END;
$$;
