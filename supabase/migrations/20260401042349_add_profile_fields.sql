ALTER TABLE public.usuarios
ADD COLUMN IF NOT EXISTS especialidade TEXT,
ADD COLUMN IF NOT EXISTS cpf TEXT,
ADD COLUMN IF NOT EXISTS dados_bancarios JSONB,
ADD COLUMN IF NOT EXISTS valor_sessao_padrao NUMERIC;

ALTER TABLE public.pacientes
ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $
BEGIN
  INSERT INTO public.usuarios (id, email, nome_consultorio, nome, especialidade)
  VALUES (
    new.id, 
    new.email,
    new.raw_user_meta_data->>'nome_consultorio',
    new.raw_user_meta_data->>'nome',
    new.raw_user_meta_data->>'especialidade'
  )
  ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    nome_consultorio = COALESCE(EXCLUDED.nome_consultorio, public.usuarios.nome_consultorio),
    nome = COALESCE(EXCLUDED.nome, public.usuarios.nome),
    especialidade = COALESCE(EXCLUDED.especialidade, public.usuarios.especialidade);

  RETURN new;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;
