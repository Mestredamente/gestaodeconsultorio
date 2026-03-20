DO $$
BEGIN
  DROP FUNCTION IF EXISTS public.get_clinic_slots(uuid, text);
END $$;

CREATE OR REPLACE FUNCTION public.get_clinic_slots(p_clinic_id uuid, p_date text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
DECLARE
    v_ativo boolean;
    v_agendamentos jsonb;
    v_bloqueios jsonb;
    v_start timestamptz;
    v_end timestamptz;
BEGIN
    SELECT agendamento_publico_ativo INTO v_ativo
    FROM public.usuarios
    WHERE id = p_clinic_id;

    IF v_ativo IS NOT TRUE THEN
        RETURN jsonb_build_object('ativo', false);
    END IF;

    -- p_date is expected as YYYY-MM-DD
    v_start := (p_date || ' 00:00:00-03')::timestamptz;
    v_end := (p_date || ' 23:59:59-03')::timestamptz;

    SELECT COALESCE(jsonb_agg(jsonb_build_object('data_hora', data_hora)), '[]'::jsonb) INTO v_agendamentos
    FROM public.agendamentos
    WHERE usuario_id = p_clinic_id 
      AND data_hora >= v_start
      AND data_hora <= v_end
      AND status != 'desmarcou'
      AND status != 'faltou';

    SELECT COALESCE(jsonb_agg(jsonb_build_object('data_inicio', data_inicio, 'data_fim', data_fim)), '[]'::jsonb) INTO v_bloqueios
    FROM public.bloqueios_agenda
    WHERE usuario_id = p_clinic_id
      AND data_inicio >= v_start
      AND data_inicio <= v_end;

    RETURN jsonb_build_object('ativo', true, 'agendamentos', v_agendamentos, 'bloqueios', v_bloqueios);
END;
$$;
