ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS whatsapp_api_key TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_business_phone_id TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_business_account_id TEXT;
