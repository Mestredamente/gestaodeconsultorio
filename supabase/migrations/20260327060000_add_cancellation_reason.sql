-- Add the new column for cancellation reason
ALTER TABLE public.agendamentos ADD COLUMN IF NOT EXISTS motivo_cancelamento TEXT;

-- Set replica identity to FULL so we get the 'old' record payload in realtime subscriptions
ALTER TABLE public.agendamentos REPLICA IDENTITY FULL;

-- Ensure the table is in the supabase_realtime publication
DO $BODY$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'agendamentos'
  ) THEN
    -- Only attempt if publication exists
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.agendamentos;
    END IF;
  END IF;
END $BODY$;

-- Update the public portal cancellation function to save the reason
CREATE OR REPLACE FUNCTION public.cancel_appointment_portal(p_hash uuid, p_agendamento_id uuid, p_justificativa text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_paciente_id uuid;
    v_data_hora timestamptz;
BEGIN
    SELECT id INTO v_paciente_id FROM public.pacientes WHERE hash_anamnese = p_hash LIMIT 1;
    IF v_paciente_id IS NULL THEN
        RETURN false;
    END IF;

    SELECT data_hora INTO v_data_hora FROM public.agendamentos 
    WHERE id = p_agendamento_id AND paciente_id = v_paciente_id AND status = 'agendado';
    
    IF v_data_hora IS NULL THEN
        RETURN false;
    END IF;

    IF v_data_hora < (NOW() + interval '24 hours') THEN
        RAISE EXCEPTION 'Cancelamento permitido apenas com 24 horas de antecedência.';
    END IF;

    UPDATE public.agendamentos 
    SET status = 'desmarcou', 
        justificativa_falta = p_justificativa,
        motivo_cancelamento = p_justificativa
    WHERE id = p_agendamento_id;
    
    RETURN FOUND;
END;
$function$;
