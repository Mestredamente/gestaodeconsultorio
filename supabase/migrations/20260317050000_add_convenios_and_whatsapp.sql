-- Create Convênios table
CREATE TABLE IF NOT EXISTS public.convenios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  registro_ans TEXT,
  contato TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS and create policy for Convênios
ALTER TABLE public.convenios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "convenios_policy" ON public.convenios
  FOR ALL TO authenticated USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());

-- Add new columns to Pacientes
ALTER TABLE public.pacientes
  ADD COLUMN IF NOT EXISTS convenio_id UUID REFERENCES public.convenios(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS numero_carteira TEXT;

-- Add new columns to Agendamentos
ALTER TABLE public.agendamentos
  ADD COLUMN IF NOT EXISTS tipo_pagamento TEXT DEFAULT 'particular',
  ADD COLUMN IF NOT EXISTS convenio_id UUID REFERENCES public.convenios(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS codigo_autorizacao TEXT,
  ADD COLUMN IF NOT EXISTS status_reembolso TEXT DEFAULT 'pendente',
  ADD COLUMN IF NOT EXISTS data_faturamento DATE;

-- Add new columns to Usuarios for WhatsApp
ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS whatsapp_confirmacao_ativa BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS template_confirmacao TEXT DEFAULT 'Olá [Nome], sua consulta foi agendada para [data] às [hora].';

-- Update get_patient_portal_data function to include Prescrições/Laudos
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
        'texto_contrato', v_clinica.texto_contrato,
        'politica_cancelamento', v_clinica.politica_cancelamento,
        'agendamentos', v_agendamentos,
        'historico', COALESCE(v_historico, '[]'::jsonb),
        'documentos', v_documentos,
        'pending_survey', v_past_appointments,
        'past_sessions', v_all_past
    );
END;
$$;
