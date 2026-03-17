ALTER TABLE public.pacientes
ADD COLUMN IF NOT EXISTS data_nascimento DATE,
ADD COLUMN IF NOT EXISTS contato_emergencia_nome TEXT,
ADD COLUMN IF NOT EXISTS contato_emergencia_telefone TEXT;
