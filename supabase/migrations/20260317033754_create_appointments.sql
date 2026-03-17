-- Create appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  appointment_time TIMESTAMPTZ NOT NULL,
  session_value NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "authenticated_select" ON public.appointments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_insert" ON public.appointments
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "authenticated_update" ON public.appointments
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_delete" ON public.appointments
  FOR DELETE TO authenticated USING (true);

-- Seed Data
DO $$
DECLARE
  new_user_id uuid;
  today date := CURRENT_DATE;
BEGIN
  -- Seed user
  new_user_id := gen_random_uuid();
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, role, aud,
    confirmation_token, recovery_token, email_change_token_new,
    email_change, email_change_token_current,
    phone, phone_change, phone_change_token, reauthentication_token
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'admin@example.com',
    crypt('StrongPassword123!', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Admin"}',
    false, 'authenticated', 'authenticated',
    '', '', '', '', '',
    NULL, '', '', ''
  );

  -- Seed Appointments
  INSERT INTO public.appointments (patient_name, appointment_time, session_value, status, user_id) VALUES
  ('Sara', today + interval '08:00', 200, 'scheduled', new_user_id),
  ('João', today + interval '09:00', 150, 'scheduled', new_user_id),
  ('Maria', today + interval '10:00', 250, 'scheduled', new_user_id),
  ('Pedro', today + interval '11:00', 200, 'scheduled', new_user_id),
  ('Ana', today + interval '13:00', 180, 'scheduled', new_user_id),
  ('Carlos', today + interval '14:00', 200, 'scheduled', new_user_id),
  ('Beatriz', today + interval '15:00', 220, 'scheduled', new_user_id),
  ('Diego', today + interval '16:00', 200, 'scheduled', new_user_id);
END $$;
