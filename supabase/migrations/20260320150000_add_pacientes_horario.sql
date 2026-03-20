ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS tipo_horario text DEFAULT 'avulso';
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS horario_fixo text;
