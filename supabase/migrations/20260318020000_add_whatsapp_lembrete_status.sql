ALTER TABLE public.agendamentos 
ADD COLUMN IF NOT EXISTS status_whatsapp_lembrete text DEFAULT 'pendente';
