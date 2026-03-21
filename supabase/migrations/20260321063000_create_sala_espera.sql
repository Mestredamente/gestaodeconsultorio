CREATE TABLE IF NOT EXISTS public.sala_espera (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agendamento_id UUID NOT NULL REFERENCES public.agendamentos(id) ON DELETE CASCADE,
    paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'aguardando' CHECK (status IN ('aguardando', 'aprovado', 'rejeitado', 'finalizado')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(agendamento_id)
);

ALTER TABLE public.sala_espera ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon insert sala_espera" ON public.sala_espera;
CREATE POLICY "Anon insert sala_espera" ON public.sala_espera FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Anon select sala_espera" ON public.sala_espera;
CREATE POLICY "Anon select sala_espera" ON public.sala_espera FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Anon update sala_espera" ON public.sala_espera;
CREATE POLICY "Anon update sala_espera" ON public.sala_espera FOR UPDATE TO public USING (true);

DROP POLICY IF EXISTS "Auth ALL sala_espera" ON public.sala_espera;
CREATE POLICY "Auth ALL sala_espera" ON public.sala_espera FOR ALL TO authenticated USING (true) WITH CHECK (true);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'sala_espera'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.sala_espera;
    END IF;
END $$;
