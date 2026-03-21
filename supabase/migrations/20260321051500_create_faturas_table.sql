CREATE TABLE IF NOT EXISTS public.faturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data_vencimento TIMESTAMPTZ NOT NULL,
  plano TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  url_recibo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS cartao_final TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS cartao_bandeira TEXT;

ALTER TABLE public.faturas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "faturas_policy" ON public.faturas;
CREATE POLICY "faturas_policy" ON public.faturas
  FOR ALL TO authenticated USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  FOR v_user_id IN SELECT id FROM auth.users LOOP
    IF NOT EXISTS (SELECT 1 FROM public.faturas WHERE usuario_id = v_user_id) THEN
      INSERT INTO public.faturas (usuario_id, data_vencimento, plano, valor, status)
      VALUES 
        (v_user_id, NOW() - interval '1 month', 'basico', 39.90, 'pago'),
        (v_user_id, NOW() - interval '2 months', 'basico', 39.90, 'pago');
    END IF;
    
    UPDATE public.usuarios SET cartao_final = '4242', cartao_bandeira = 'visa' WHERE id = v_user_id AND cartao_final IS NULL;
  END LOOP;
END $$;
