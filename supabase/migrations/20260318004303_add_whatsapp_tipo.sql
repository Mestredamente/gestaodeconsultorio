ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS whatsapp_tipo text DEFAULT 'personal';
