CREATE TABLE public.lista_espera (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  paciente_id uuid NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  dias_semana text[] NOT NULL,
  periodos text[] NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE public.conquistas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  descricao text NOT NULL,
  icone_name text NOT NULL,
  pontos_valor integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE public.pacientes_conquistas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  conquista_id uuid NOT NULL REFERENCES public.conquistas(id) ON DELETE CASCADE,
  data_conquistada timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT pct_conquista_unique UNIQUE (paciente_id, conquista_id)
);

ALTER TABLE public.lista_espera ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lista_espera_policy" ON public.lista_espera FOR ALL TO authenticated USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());

ALTER TABLE public.conquistas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conquistas_policy" ON public.conquistas FOR ALL TO authenticated USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());

ALTER TABLE public.pacientes_conquistas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pacientes_conquistas_auth" ON public.pacientes_conquistas FOR ALL TO authenticated 
USING (paciente_id IN (SELECT id FROM public.pacientes WHERE usuario_id = auth.uid())) 
WITH CHECK (paciente_id IN (SELECT id FROM public.pacientes WHERE usuario_id = auth.uid()));

CREATE POLICY "pacientes_conquistas_anon" ON public.pacientes_conquistas FOR SELECT TO anon USING (true);

CREATE OR REPLACE FUNCTION public.check_waiting_list_on_cancel()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_dow integer;
  v_hour integer;
  v_periodo text;
  v_dia_semana text;
  v_match_count integer;
  v_msg text;
BEGIN
  IF NEW.status = 'desmarcou' AND OLD.status != 'desmarcou' THEN
    v_dow := EXTRACT(DOW FROM NEW.data_hora AT TIME ZONE 'America/Sao_Paulo');
    v_hour := EXTRACT(HOUR FROM NEW.data_hora AT TIME ZONE 'America/Sao_Paulo');
    
    CASE v_dow
      WHEN 0 THEN v_dia_semana := 'domingo';
      WHEN 1 THEN v_dia_semana := 'segunda';
      WHEN 2 THEN v_dia_semana := 'terca';
      WHEN 3 THEN v_dia_semana := 'quarta';
      WHEN 4 THEN v_dia_semana := 'quinta';
      WHEN 5 THEN v_dia_semana := 'sexta';
      WHEN 6 THEN v_dia_semana := 'sabado';
    END CASE;

    IF v_hour < 12 THEN v_periodo := 'manha';
    ELSIF v_hour < 18 THEN v_periodo := 'tarde';
    ELSE v_periodo := 'noite';
    END IF;

    SELECT COUNT(*) INTO v_match_count
    FROM public.lista_espera
    WHERE usuario_id = NEW.usuario_id
      AND v_dia_semana = ANY(dias_semana)
      AND v_periodo = ANY(periodos);

    IF v_match_count > 0 THEN
      v_msg := 'Um horário foi desmarcado em ' || to_char(NEW.data_hora AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI') || '. Você tem ' || v_match_count || ' paciente(s) na lista de espera para ' || v_dia_semana || ' (' || v_periodo || ').';
      INSERT INTO public.notificacoes (usuario_id, titulo, mensagem)
      VALUES (NEW.usuario_id, 'Oportunidade na Lista de Espera', v_msg);
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS check_waiting_list_trigger ON public.agendamentos;
CREATE TRIGGER check_waiting_list_trigger
AFTER UPDATE ON public.agendamentos
FOR EACH ROW EXECUTE FUNCTION check_waiting_list_on_cancel();

CREATE OR REPLACE FUNCTION public.evaluate_patient_achievements(p_paciente_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_usuario_id uuid;
  v_total_compareceu integer;
  v_consecutive_compareceu integer;
  v_testes_concluidos integer;
  
  v_conq_comprometimento uuid;
  v_conq_explorador uuid;
  v_conq_virada uuid;
BEGIN
  SELECT usuario_id INTO v_usuario_id FROM public.pacientes WHERE id = p_paciente_id;
  IF v_usuario_id IS NULL THEN RETURN; END IF;

  SELECT id INTO v_conq_comprometimento FROM public.conquistas WHERE usuario_id = v_usuario_id AND titulo = 'Comprometimento Total';
  IF v_conq_comprometimento IS NULL THEN
    INSERT INTO public.conquistas (usuario_id, titulo, descricao, icone_name, pontos_valor)
    VALUES (v_usuario_id, 'Comprometimento Total', 'Realizou 4 sessões consecutivas.', 'Star', 50) RETURNING id INTO v_conq_comprometimento;
  END IF;

  SELECT id INTO v_conq_explorador FROM public.conquistas WHERE usuario_id = v_usuario_id AND titulo = 'Explorador de Si';
  IF v_conq_explorador IS NULL THEN
    INSERT INTO public.conquistas (usuario_id, titulo, descricao, icone_name, pontos_valor)
    VALUES (v_usuario_id, 'Explorador de Si', 'Completou 3 testes/formulários.', 'BrainCircuit', 30) RETURNING id INTO v_conq_explorador;
  END IF;

  SELECT id INTO v_conq_virada FROM public.conquistas WHERE usuario_id = v_usuario_id AND titulo = 'Ponto de Virada';
  IF v_conq_virada IS NULL THEN
    INSERT INTO public.conquistas (usuario_id, titulo, descricao, icone_name, pontos_valor)
    VALUES (v_usuario_id, 'Ponto de Virada', 'Completou suas primeiras 10 sessões.', 'TrendingUp', 100) RETURNING id INTO v_conq_virada;
  END IF;

  SELECT COUNT(*) INTO v_total_compareceu FROM public.agendamentos WHERE paciente_id = p_paciente_id AND status = 'compareceu';
  SELECT COUNT(*) INTO v_testes_concluidos FROM public.testes_pacientes WHERE paciente_id = p_paciente_id AND status = 'concluido';
  
  SELECT COUNT(*) INTO v_consecutive_compareceu FROM (
    SELECT status FROM public.agendamentos 
    WHERE paciente_id = p_paciente_id AND data_hora < NOW()
    ORDER BY data_hora DESC LIMIT 4
  ) sub WHERE status = 'compareceu';

  IF v_total_compareceu >= 10 THEN
    INSERT INTO public.pacientes_conquistas (paciente_id, conquista_id)
    VALUES (p_paciente_id, v_conq_virada) ON CONFLICT DO NOTHING;
  END IF;

  IF v_testes_concluidos >= 3 THEN
    INSERT INTO public.pacientes_conquistas (paciente_id, conquista_id)
    VALUES (p_paciente_id, v_conq_explorador) ON CONFLICT DO NOTHING;
  END IF;

  IF v_consecutive_compareceu = 4 THEN
    INSERT INTO public.pacientes_conquistas (paciente_id, conquista_id)
    VALUES (p_paciente_id, v_conq_comprometimento) ON CONFLICT DO NOTHING;
  END IF;
END;
$function$;

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
    v_testes jsonb;
    v_clinica record;
    v_past_appointments jsonb;
    v_all_past jsonb;
    v_conquistas jsonb;
BEGIN
    SELECT p.id, p.nome, p.cpf, p.usuario_id, p.contrato_aceito, p.data_aceite_contrato INTO v_paciente
    FROM public.pacientes p
    WHERE p.hash_anamnese = p_hash LIMIT 1;

    IF v_paciente.id IS NULL THEN
        RETURN '{}'::jsonb;
    END IF;

    PERFORM public.evaluate_patient_achievements(v_paciente.id);

    SELECT nome_consultorio, texto_contrato, politica_cancelamento, chave_pix INTO v_clinica 
    FROM public.usuarios 
    WHERE id = v_paciente.usuario_id LIMIT 1;

    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', c.id,
        'titulo', c.titulo,
        'descricao', c.descricao,
        'icone_name', c.icone_name,
        'pontos', c.pontos_valor,
        'data_conquistada', pc.data_conquistada,
        'conquistada', pc.id IS NOT NULL
    ) ORDER BY pc.data_conquistada DESC NULLS LAST, c.titulo ASC), '[]'::jsonb) INTO v_conquistas
    FROM public.conquistas c
    LEFT JOIN public.pacientes_conquistas pc ON pc.conquista_id = c.id AND pc.paciente_id = v_paciente.id
    WHERE c.usuario_id = v_paciente.usuario_id;

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
        'data_aceite_contrato', v_paciente.data_aceite_contrato,
        'consultorio', v_clinica.nome_consultorio,
        'chave_pix', v_clinica.chave_pix,
        'texto_contrato', v_clinica.texto_contrato,
        'politica_cancelamento', v_clinica.politica_cancelamento,
        'agendamentos', v_agendamentos,
        'historico', COALESCE(v_historico, '[]'::jsonb),
        'documentos', v_documentos,
        'pending_survey', v_past_appointments,
        'past_sessions', v_all_past,
        'testes', v_testes,
        'conquistas', v_conquistas
    );
END;
$function$;

INSERT INTO public.templates_documentos (usuario_id, titulo, conteudo, tipo)
SELECT u.id, 'Foco TCC', 'Olá [Nome], como você se sente após nossa sessão de hoje? Lembre-se de preencher seu RPD no portal.', 'mensagem_rapida'
FROM public.usuarios u
WHERE NOT EXISTS (SELECT 1 FROM public.templates_documentos t WHERE t.usuario_id = u.id AND t.titulo = 'Foco TCC');

INSERT INTO public.templates_documentos (usuario_id, titulo, conteudo, tipo)
SELECT u.id, 'Boas-vindas / Logística', 'Olá [Nome], sua primeira sessão está confirmada. Seguem as orientações de chegada e o link para o nosso portal: [link_portal]', 'mensagem_rapida'
FROM public.usuarios u
WHERE NOT EXISTS (SELECT 1 FROM public.templates_documentos t WHERE t.usuario_id = u.id AND t.titulo = 'Boas-vindas / Logística');

INSERT INTO public.templates_documentos (usuario_id, titulo, conteudo, tipo)
SELECT u.id, 'Manutenção / Acompanhamento', 'Olá [Nome], já faz 15 dias desde nosso último encontro. Como você tem passado com as ferramentas que discutimos?', 'mensagem_rapida'
FROM public.usuarios u
WHERE NOT EXISTS (SELECT 1 FROM public.templates_documentos t WHERE t.usuario_id = u.id AND t.titulo = 'Manutenção / Acompanhamento');

