-- Adiciona a coluna nova_nota na tabela prontuarios para suportar auto-save (debounce)
ALTER TABLE public.prontuarios ADD COLUMN IF NOT EXISTS nova_nota TEXT DEFAULT '';
