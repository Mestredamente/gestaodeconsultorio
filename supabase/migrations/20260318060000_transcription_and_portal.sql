-- Ensure the pacientes table has RLS policies allowing public SELECT access
-- Useful for portal integration if queried directly from client side
CREATE POLICY "anon_select_pacientes" ON public.pacientes
  FOR SELECT TO anon
  USING (true);
