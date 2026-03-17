-- 1. Estoque: Adicionar quantidade_minima
ALTER TABLE public.estoque ADD COLUMN IF NOT EXISTS quantidade_minima INTEGER NOT NULL DEFAULT 0;

-- Trigger para criar notificação quando estoque atingir nível crítico
CREATE OR REPLACE FUNCTION public.check_low_stock()
RETURNS trigger AS $$
BEGIN
  IF NEW.quantidade <= NEW.quantidade_minima AND (OLD.quantidade > OLD.quantidade_minima OR TG_OP = 'INSERT') THEN
    INSERT INTO public.notificacoes (usuario_id, titulo, mensagem)
    VALUES (NEW.usuario_id, 'Alerta de Estoque Baixo', 'O item ' || NEW.nome_item || ' atingiu o nível crítico (' || NEW.quantidade || '/' || NEW.quantidade_minima || ').');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_check_low_stock ON public.estoque;
CREATE TRIGGER trigger_check_low_stock
  AFTER INSERT OR UPDATE OF quantidade, quantidade_minima ON public.estoque
  FOR EACH ROW EXECUTE FUNCTION public.check_low_stock();

-- 2. Marketing Campaigns: Tabela de comunicacoes
CREATE TABLE IF NOT EXISTS public.comunicacoes_campanhas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  data_envio TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tipo TEXT NOT NULL DEFAULT 'newsletter'
);

ALTER TABLE public.comunicacoes_campanhas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campanhas_policy" ON public.comunicacoes_campanhas
  FOR ALL TO authenticated USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());
