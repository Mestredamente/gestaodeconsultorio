-- Add new columns for Clinic Details
ALTER TABLE public.usuarios
ADD COLUMN IF NOT EXISTS endereco_consultorio TEXT,
ADD COLUMN IF NOT EXISTS telefone_consultorio TEXT,
ADD COLUMN IF NOT EXISTS horario_funcionamento JSONB DEFAULT '[]'::jsonb;
