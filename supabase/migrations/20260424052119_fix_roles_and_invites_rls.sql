-- Fix RLS for invitation_links
DROP POLICY IF EXISTS "public_read_invitation_links" ON public.invitation_links;
CREATE POLICY "public_read_invitation_links" ON public.invitation_links
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "auth_insert_invitation_links" ON public.invitation_links;
CREATE POLICY "auth_insert_invitation_links" ON public.invitation_links
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_invitation_links" ON public.invitation_links;
CREATE POLICY "auth_update_invitation_links" ON public.invitation_links
  FOR UPDATE TO authenticated USING (true);

-- Fix RLS for roles
DROP POLICY IF EXISTS "public_read_roles" ON public.roles;
CREATE POLICY "public_read_roles" ON public.roles
  FOR SELECT TO public USING (true);

-- Fix RLS for permissions
DROP POLICY IF EXISTS "public_read_permissions" ON public.permissions;
CREATE POLICY "public_read_permissions" ON public.permissions
  FOR SELECT TO public USING (true);

-- Fix RLS for role_permissions
DROP POLICY IF EXISTS "public_read_role_permissions" ON public.role_permissions;
CREATE POLICY "public_read_role_permissions" ON public.role_permissions
  FOR SELECT TO public USING (true);

-- Fix RLS for user_roles
DROP POLICY IF EXISTS "public_read_user_roles" ON public.user_roles;
CREATE POLICY "public_read_user_roles" ON public.user_roles
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "auth_insert_user_roles" ON public.user_roles;
CREATE POLICY "auth_insert_user_roles" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_user_roles" ON public.user_roles;
CREATE POLICY "auth_update_user_roles" ON public.user_roles
  FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_delete_user_roles" ON public.user_roles;
CREATE POLICY "auth_delete_user_roles" ON public.user_roles
  FOR DELETE TO authenticated USING (true);
