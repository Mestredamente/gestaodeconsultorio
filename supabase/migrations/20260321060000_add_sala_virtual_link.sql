-- Add columns to agendamentos to store virtual room secure link and token details
ALTER TABLE public.agendamentos
ADD COLUMN IF NOT EXISTS link_sala_virtual TEXT,
ADD COLUMN IF NOT EXISTS sala_virtual_token TEXT,
ADD COLUMN IF NOT EXISTS sala_virtual_token_valid_from TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS sala_virtual_token_expires_at TIMESTAMPTZ;
