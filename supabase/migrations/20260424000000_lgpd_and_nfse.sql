CREATE TABLE IF NOT EXISTS public.nfse_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  nfse_number TEXT,
  status TEXT NOT NULL DEFAULT 'processing',
  xml_data TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lgpd_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  performed_by UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.nfse_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lgpd_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "nfse_records_policy" ON public.nfse_records;
CREATE POLICY "nfse_records_policy" ON public.nfse_records FOR ALL TO authenticated
USING (clinic_id IN (SELECT id FROM public.usuarios WHERE COALESCE(parent_id, id) = public.get_tenant_id()));

DROP POLICY IF EXISTS "lgpd_logs_policy" ON public.lgpd_logs;
CREATE POLICY "lgpd_logs_policy" ON public.lgpd_logs FOR ALL TO authenticated
USING (clinic_id IN (SELECT id FROM public.usuarios WHERE COALESCE(parent_id, id) = public.get_tenant_id()));

CREATE OR REPLACE FUNCTION public.log_lgpd_action()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_user_id UUID;
  v_action TEXT;
  v_clinic_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN RETURN NULL; END IF;

  SELECT COALESCE(parent_id, id) INTO v_clinic_id FROM public.usuarios WHERE id = v_user_id;

  IF TG_OP = 'INSERT' THEN v_action := 'CREATE_PATIENT_DATA';
  ELSIF TG_OP = 'UPDATE' THEN v_action := 'UPDATE_PATIENT_DATA';
  ELSIF TG_OP = 'DELETE' THEN v_action := 'DELETE_PATIENT_DATA';
  ELSIF TG_OP = 'SELECT' THEN v_action := 'READ_PATIENT_DATA';
  END IF;

  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.lgpd_logs (clinic_id, patient_id, action, details, performed_by)
    VALUES (v_clinic_id, OLD.id, v_action, jsonb_build_object('table', TG_TABLE_NAME), v_user_id);
    RETURN OLD;
  ELSE
    INSERT INTO public.lgpd_logs (clinic_id, patient_id, action, details, performed_by)
    VALUES (v_clinic_id, NEW.id, v_action, jsonb_build_object('table', TG_TABLE_NAME), v_user_id);
    RETURN NEW;
  END IF;
END;
$function$;

DROP TRIGGER IF EXISTS trg_log_lgpd_pacientes ON public.pacientes;
CREATE TRIGGER trg_log_lgpd_pacientes
  AFTER INSERT OR UPDATE OR DELETE ON public.pacientes
  FOR EACH ROW EXECUTE FUNCTION public.log_lgpd_action();
