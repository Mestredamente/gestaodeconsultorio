-- Migrations for Settings and Address updates

ALTER TABLE public.usuarios 
  ADD COLUMN IF NOT EXISTS cep TEXT,
  ADD COLUMN IF NOT EXISTS rua TEXT,
  ADD COLUMN IF NOT EXISTS numero TEXT,
  ADD COLUMN IF NOT EXISTS complemento TEXT,
  ADD COLUMN IF NOT EXISTS bairro TEXT,
  ADD COLUMN IF NOT EXISTS cidade TEXT,
  ADD COLUMN IF NOT EXISTS estado TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT;

DO $$ 
BEGIN
  -- Permite que usuários atualizem seus próprios dados
  DROP POLICY IF EXISTS "usuarios_update" ON public.usuarios;
  CREATE POLICY "usuarios_update" ON public.usuarios
    FOR UPDATE TO authenticated
    USING (id = auth.uid() OR parent_id = auth.uid())
    WITH CHECK (id = auth.uid() OR parent_id = auth.uid());

  -- Permite que o administrador exclua membros da equipe
  DROP POLICY IF EXISTS "admin_delete_usuarios" ON public.usuarios;
  CREATE POLICY "admin_delete_usuarios" ON public.usuarios
    FOR DELETE TO authenticated
    USING (parent_id = auth.uid());
END $$;
