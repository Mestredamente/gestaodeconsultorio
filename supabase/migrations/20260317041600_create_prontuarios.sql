-- Create prontuarios table for clinical records
CREATE TABLE IF NOT EXISTS public.prontuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    queixa_principal TEXT,
    historico_sessoes JSONB NOT NULL DEFAULT '[]'::jsonb,
    UNIQUE(paciente_id)
);

-- Enable Row Level Security
ALTER TABLE public.prontuarios ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users to manage their own patients' records
CREATE POLICY "prontuarios_policy" ON public.prontuarios
    FOR ALL TO authenticated 
    USING (usuario_id = auth.uid()) 
    WITH CHECK (usuario_id = auth.uid());
