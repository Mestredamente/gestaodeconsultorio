-- Drop the policy if it exists to be idempotent
DROP POLICY IF EXISTS "usuarios_update" ON public.usuarios;

-- Create policy allowing authenticated users to UPDATE their own user record
CREATE POLICY "usuarios_update" ON public.usuarios
  FOR UPDATE TO authenticated 
  USING (id = auth.uid()) 
  WITH CHECK (id = auth.uid());
