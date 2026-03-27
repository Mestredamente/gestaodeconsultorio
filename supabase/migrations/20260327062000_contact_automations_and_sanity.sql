-- Consolidate cancellation reasons
UPDATE public.agendamentos 
SET motivo_cancelamento = COALESCE(motivo_cancelamento, justificativa_falta) 
WHERE status = 'desmarcou';

-- Update trigger for confirmation to call WhatsApp Edge Function directly
CREATE OR REPLACE FUNCTION public.trigger_agendamento_confirmado()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_usuario record;
    v_paciente record;
    v_msg text;
    req_id bigint;
    base_url text;
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
            
            base_url := 'https://qkxjdsdvxxgtdmlivxue.supabase.co/functions/v1';
            IF v_paciente.telefone IS NOT NULL THEN
              SELECT net.http_post(
                  url:=(base_url || '/enviar_mensagem_whatsapp'),
                  headers:='{"Content-Type": "application/json"}'::jsonb,
                  body:=json_build_object(
                      'tipo_whatsapp', COALESCE(v_usuario.whatsapp_tipo, 'padrao'),
                      'telefone', v_paciente.telefone,
                      'mensagem', v_msg,
                      'usuario_id', NEW.usuario_id
                  )::jsonb
              ) INTO req_id;
            END IF;
        END IF;

        INSERT INTO public.notificacoes (usuario_id, titulo, mensagem)
        VALUES (NEW.usuario_id, 'Consulta Confirmada', 'O paciente ' || (SELECT nome FROM public.pacientes WHERE id = NEW.paciente_id) || ' confirmou a consulta via portal.');
    END IF;
    RETURN NEW;
END;
$function$;
