-- Table: movimentacao_estoque
CREATE TABLE IF NOT EXISTS public.movimentacao_estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.estoque(id) ON DELETE CASCADE,
  quantidade_mudanca INTEGER NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  data_movimentacao TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.movimentacao_estoque ENABLE ROW LEVEL SECURITY;

CREATE POLICY "movimentacao_estoque_policy" ON public.movimentacao_estoque
  FOR ALL TO authenticated USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());

-- Table: logs_auditoria
CREATE TABLE IF NOT EXISTS public.logs_auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  acao TEXT NOT NULL,
  tabela_afetada TEXT NOT NULL,
  registro_id UUID NOT NULL,
  detalhes JSONB NOT NULL DEFAULT '{}'::jsonb,
  data_criacao TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.logs_auditoria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "logs_auditoria_policy" ON public.logs_auditoria
  FOR ALL TO authenticated USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());

-- Audit Trigger Function
CREATE OR REPLACE FUNCTION public.log_audit_action()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_details JSONB;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL AND TG_OP != 'DELETE' THEN
    v_user_id := NEW.usuario_id;
  ELSIF v_user_id IS NULL AND TG_OP = 'DELETE' THEN
    v_user_id := OLD.usuario_id;
  END IF;

  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  IF TG_OP = 'INSERT' THEN
    v_details := jsonb_build_object('new', row_to_json(NEW));
    INSERT INTO public.logs_auditoria (usuario_id, acao, tabela_afetada, registro_id, detalhes)
    VALUES (v_user_id, TG_OP, TG_TABLE_NAME, NEW.id, v_details);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    v_details := jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW));
    INSERT INTO public.logs_auditoria (usuario_id, acao, tabela_afetada, registro_id, detalhes)
    VALUES (v_user_id, TG_OP, TG_TABLE_NAME, NEW.id, v_details);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    v_details := jsonb_build_object('old', row_to_json(OLD));
    INSERT INTO public.logs_auditoria (usuario_id, acao, tabela_afetada, registro_id, detalhes)
    VALUES (v_user_id, TG_OP, TG_TABLE_NAME, OLD.id, v_details);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Apply Audit triggers
CREATE TRIGGER audit_agendamentos_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.agendamentos
FOR EACH ROW EXECUTE FUNCTION public.log_audit_action();

CREATE TRIGGER audit_financeiro_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.financeiro
FOR EACH ROW EXECUTE FUNCTION public.log_audit_action();

-- Stock Trigger Function
CREATE OR REPLACE FUNCTION public.log_stock_movement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  diff INTEGER;
  m_tipo TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.quantidade > 0 THEN
      INSERT INTO public.movimentacao_estoque (usuario_id, item_id, quantidade_mudanca, tipo)
      VALUES (NEW.usuario_id, NEW.id, NEW.quantidade, 'entrada');
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    diff := NEW.quantidade - OLD.quantidade;
    IF diff > 0 THEN
      m_tipo := 'entrada';
      INSERT INTO public.movimentacao_estoque (usuario_id, item_id, quantidade_mudanca, tipo)
      VALUES (NEW.usuario_id, NEW.id, diff, m_tipo);
    ELSIF diff < 0 THEN
      m_tipo := 'saida';
      INSERT INTO public.movimentacao_estoque (usuario_id, item_id, quantidade_mudanca, tipo)
      VALUES (NEW.usuario_id, NEW.id, abs(diff), m_tipo);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Apply Stock trigger
CREATE TRIGGER stock_movement_trigger
AFTER INSERT OR UPDATE ON public.estoque
FOR EACH ROW EXECUTE FUNCTION public.log_stock_movement();
