-- RBAC Tables
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS public.invitation_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Data
INSERT INTO public.roles (name, description) VALUES
('admin', 'Administrador Geral'),
('clinic_owner', 'Dono da Clínica'),
('professional', 'Profissional de Saúde'),
('secretary', 'Secretária'),
('patient', 'Paciente')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.permissions (name) VALUES
('view_patients'), ('edit_patients'), ('delete_patients'),
('view_schedule'), ('edit_schedule'), ('delete_schedule'),
('view_financial'), ('edit_financial'), ('register_payment'),
('access_prontuario'), ('edit_prontuario'),
('manage_professionals'), ('manage_secretaries'),
('view_reports'), ('manage_settings'),
('manage_clinics'), ('view_audit_logs'), ('manage_plans')
ON CONFLICT (name) DO NOTHING;

-- RLS for audit_log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_view_audit" ON public.audit_log;
CREATE POLICY "admin_view_audit" ON public.audit_log FOR SELECT TO authenticated
USING (
  public.get_user_role() = 'admin' OR 
  public.get_user_role() = 'superadmin' OR 
  (public.get_user_role() = 'admin' AND user_id IN (SELECT id FROM public.usuarios WHERE COALESCE(parent_id, id) = public.get_tenant_id()))
);

DROP POLICY IF EXISTS "auth_insert_audit" ON public.audit_log;
CREATE POLICY "auth_insert_audit" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (true);

-- Create RPC for finalizing invitation
CREATE OR REPLACE FUNCTION public.finalize_invitation(p_token TEXT, p_user_id UUID, p_role_id UUID, p_clinic_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.invitation_links 
  SET used_at = NOW() 
  WHERE token = p_token AND used_at IS NULL AND expires_at > NOW();

  IF FOUND THEN
    INSERT INTO public.user_roles (user_id, role_id) VALUES (p_user_id, p_role_id) ON CONFLICT DO NOTHING;
    UPDATE public.usuarios SET parent_id = p_clinic_id WHERE id = p_user_id;
    RETURN TRUE;
  END IF;
  RETURN FALSE;
END;
$$;

-- Create RPC to get user permissions with backward compatibility
CREATE OR REPLACE FUNCTION public.get_user_permissions(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_role TEXT;
  v_perms JSONB;
BEGIN
  SELECT r.name INTO v_role
  FROM public.user_roles ur
  JOIN public.roles r ON ur.role_id = r.id
  WHERE ur.user_id = p_user_id LIMIT 1;

  IF v_role IS NULL THEN
    SELECT role INTO v_role FROM public.usuarios WHERE id = p_user_id;
    IF v_role = 'superadmin' THEN v_role := 'admin';
    ELSIF v_role = 'admin' THEN v_role := 'clinic_owner';
    ELSIF v_role = 'profissional' THEN v_role := 'professional';
    ELSIF v_role = 'secretaria' THEN v_role := 'secretary';
    END IF;
  END IF;

  SELECT jsonb_agg(p.name) INTO v_perms
  FROM public.roles r
  JOIN public.role_permissions rp ON r.id = rp.role_id
  JOIN public.permissions p ON rp.permission_id = p.id
  WHERE r.name = v_role;

  RETURN jsonb_build_object('role', v_role, 'permissions', COALESCE(v_perms, '[]'::jsonb));
END;
$$;

-- Associate permissions to roles
DO $$
DECLARE
  v_admin_id UUID;
  v_owner_id UUID;
  v_prof_id UUID;
  v_sec_id UUID;
  v_pat_id UUID;
BEGIN
  SELECT id INTO v_admin_id FROM public.roles WHERE name = 'admin';
  SELECT id INTO v_owner_id FROM public.roles WHERE name = 'clinic_owner';
  SELECT id INTO v_prof_id FROM public.roles WHERE name = 'professional';
  SELECT id INTO v_sec_id FROM public.roles WHERE name = 'secretary';
  SELECT id INTO v_pat_id FROM public.roles WHERE name = 'patient';

  INSERT INTO public.role_permissions (role_id, permission_id) SELECT v_admin_id, id FROM public.permissions ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) SELECT v_owner_id, id FROM public.permissions WHERE name IN ('view_patients', 'edit_patients', 'delete_patients', 'view_schedule', 'edit_schedule', 'delete_schedule', 'view_financial', 'edit_financial', 'register_payment', 'access_prontuario', 'edit_prontuario', 'manage_professionals', 'manage_secretaries', 'view_reports', 'manage_settings', 'view_audit_logs') ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) SELECT v_prof_id, id FROM public.permissions WHERE name IN ('view_patients', 'view_schedule', 'access_prontuario', 'edit_prontuario', 'view_reports') ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) SELECT v_sec_id, id FROM public.permissions WHERE name IN ('view_patients', 'view_schedule', 'edit_schedule', 'register_payment') ON CONFLICT DO NOTHING;
END $$;
