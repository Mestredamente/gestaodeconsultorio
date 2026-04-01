-- Adiciona coluna profissional_id se não existir
ALTER TABLE public.agendamentos ADD COLUMN IF NOT EXISTS profissional_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS profissional_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Atualizar RLS Agendamentos
DROP POLICY IF EXISTS "agendamentos_policy" ON public.agendamentos;
DROP POLICY IF EXISTS "agendamentos_tenant_policy" ON public.agendamentos;
DROP POLICY IF EXISTS "agendamentos_rbac" ON public.agendamentos;

CREATE POLICY "agendamentos_rbac" ON public.agendamentos
  FOR ALL TO authenticated
  USING (
    usuario_id IN (SELECT id FROM public.usuarios WHERE COALESCE(parent_id, id) = public.get_tenant_id())
    AND (
      public.get_user_role() IN ('admin', 'superadmin', 'secretaria') 
      OR 
      (public.get_user_role() = 'profissional' AND (profissional_id = auth.uid() OR usuario_id = auth.uid()))
    )
  )
  WITH CHECK (
    usuario_id IN (SELECT id FROM public.usuarios WHERE COALESCE(parent_id, id) = public.get_tenant_id())
  );

-- Atualizar RLS Pacientes
DROP POLICY IF EXISTS "pacientes_policy" ON public.pacientes;
DROP POLICY IF EXISTS "pacientes_rbac" ON public.pacientes;

CREATE POLICY "pacientes_rbac" ON public.pacientes
  FOR ALL TO authenticated
  USING (
    usuario_id IN (SELECT id FROM public.usuarios WHERE COALESCE(parent_id, id) = public.get_tenant_id())
    AND (
      public.get_user_role() IN ('admin', 'superadmin', 'secretaria') 
      OR 
      (public.get_user_role() = 'profissional' AND (profissional_id = auth.uid() OR usuario_id = auth.uid()))
    )
  )
  WITH CHECK (
    usuario_id IN (SELECT id FROM public.usuarios WHERE COALESCE(parent_id, id) = public.get_tenant_id())
  );

-- Atualizar RLS Financeiro
DROP POLICY IF EXISTS "financeiro_policy" ON public.financeiro;
DROP POLICY IF EXISTS "financeiro_rbac" ON public.financeiro;

CREATE POLICY "financeiro_rbac" ON public.financeiro
  FOR ALL TO authenticated
  USING (
    usuario_id IN (SELECT id FROM public.usuarios WHERE COALESCE(parent_id, id) = public.get_tenant_id())
    AND public.get_user_role() IN ('admin', 'superadmin', 'secretaria')
  )
  WITH CHECK (
    usuario_id IN (SELECT id FROM public.usuarios WHERE COALESCE(parent_id, id) = public.get_tenant_id())
  );

-- Atualizar RLS Prontuarios
DROP POLICY IF EXISTS "prontuarios_policy" ON public.prontuarios;
DROP POLICY IF EXISTS "prontuarios_rbac" ON public.prontuarios;

CREATE POLICY "prontuarios_rbac" ON public.prontuarios
  FOR ALL TO authenticated
  USING (
    usuario_id IN (SELECT id FROM public.usuarios WHERE COALESCE(parent_id, id) = public.get_tenant_id())
    AND (
      public.get_user_role() IN ('admin', 'superadmin') 
      OR 
      (public.get_user_role() = 'profissional' AND (usuario_id = auth.uid() OR paciente_id IN (SELECT id FROM public.pacientes WHERE profissional_id = auth.uid() OR usuario_id = auth.uid())))
    )
  )
  WITH CHECK (
    usuario_id IN (SELECT id FROM public.usuarios WHERE COALESCE(parent_id, id) = public.get_tenant_id())
  );
