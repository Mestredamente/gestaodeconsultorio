-- Create Document Templates Library table
CREATE TABLE public.templates_documentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'outro',
    data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.templates_documentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "templates_policy" ON public.templates_documentos 
  FOR ALL TO authenticated USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());

-- Create Prescriptions table
CREATE TABLE public.prescricoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    conteudo_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    hash_verificacao UUID NOT NULL DEFAULT gen_random_uuid(),
    data_emissao TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.prescricoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prescricoes_policy" ON public.prescricoes 
  FOR ALL TO authenticated USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());
CREATE POLICY "anon_read_prescricao" ON public.prescricoes FOR SELECT TO anon USING (true);
CREATE POLICY "public_read_prescricao" ON public.prescricoes FOR SELECT TO public USING (true);

-- Add Service Goals and Calendar Sync fields to Users table
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS meta_mensal_consultas INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS sync_calendarios JSONB DEFAULT '{"google": false, "outlook": false}'::jsonb;

-- Public Function to fetch Prescription for validation
CREATE OR REPLACE FUNCTION public.get_prescricao_publica(p_hash uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_result jsonb;
BEGIN
    SELECT jsonb_build_object(
        'data_emissao', pr.data_emissao,
        'conteudo', pr.conteudo_json,
        'paciente_nome', p.nome,
        'paciente_cpf', p.cpf,
        'medico_nome', u.nome_consultorio,
        'medico_email', u.email
    ) INTO v_result
    FROM public.prescricoes pr
    JOIN public.pacientes p ON pr.paciente_id = p.id
    JOIN public.usuarios u ON pr.usuario_id = u.id
    WHERE pr.hash_verificacao = p_hash LIMIT 1;
    
    RETURN COALESCE(v_result, '{}'::jsonb);
END;
$function$;

-- Update get_patient_portal_data to return patient CPF for template variable replacement
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

    SELECT historico_sessoes INTO v_historico
    FROM public.prontuarios
    WHERE paciente_id = v_paciente.id LIMIT 1;

    RETURN jsonb_build_object(
        'paciente_id', v_paciente.id,
        'paciente_nome', v_paciente.nome,
        'paciente_cpf', v_paciente.cpf,
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

