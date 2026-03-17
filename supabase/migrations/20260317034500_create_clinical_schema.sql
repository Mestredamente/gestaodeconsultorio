-- Create specific clinical management tables requested
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  nome_consultorio TEXT,
  chave_pix TEXT
);

CREATE TABLE IF NOT EXISTS public.pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cpf TEXT,
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  valor_sessao NUMERIC,
  data_criacao TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  data_hora TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'agendado',
  CONSTRAINT valid_status CHECK (status IN ('agendado', 'compareceu', 'faltou', 'desmarcou'))
);

-- Enable RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "usuarios_policy" ON public.usuarios
  FOR ALL TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "pacientes_policy" ON public.pacientes
  FOR ALL TO authenticated USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "agendamentos_policy" ON public.agendamentos
  FOR ALL TO authenticated USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());

-- Trigger to automatically create a user profile in usuarios table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.usuarios (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed some initial data to avoid empty states
DO $$
DECLARE
  v_user_id uuid;
  v_paciente_id_1 uuid := gen_random_uuid();
  v_paciente_id_2 uuid := gen_random_uuid();
  today date := CURRENT_DATE;
BEGIN
  -- Try to get the first existing user to seed data for
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- Ensure the user is in the new usuarios table
    INSERT INTO public.usuarios (id, email) VALUES (v_user_id, 'admin@example.com') ON CONFLICT (id) DO NOTHING;

    -- Insert Pacientes only if they don't exist for this user to avoid duplicates
    IF NOT EXISTS (SELECT 1 FROM public.pacientes WHERE usuario_id = v_user_id) THEN
        INSERT INTO public.pacientes (id, usuario_id, nome, telefone, valor_sessao) VALUES
        (v_paciente_id_1, v_user_id, 'Ana Silva', '(11) 98765-4321', 150),
        (v_paciente_id_2, v_user_id, 'Carlos Santos', '(11) 91234-5678', 200);

        -- Insert Agendamentos for today with different statuses
        INSERT INTO public.agendamentos (usuario_id, paciente_id, data_hora, status) VALUES
        (v_user_id, v_paciente_id_1, today + interval '09:00', 'agendado'),
        (v_user_id, v_paciente_id_2, today + interval '11:00', 'agendado'),
        (v_user_id, v_paciente_id_1, today + interval '14:00', 'compareceu'),
        (v_user_id, v_paciente_id_2, today + interval '16:00', 'faltou');
    END IF;
  END IF;
END $$;
