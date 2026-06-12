
-- 1) Restrict reviews SELECT to authenticated users (was anon+authenticated)
DROP POLICY IF EXISTS "Anyone view reviews" ON public.reviews;
CREATE POLICY "Authenticated view reviews"
  ON public.reviews FOR SELECT
  TO authenticated
  USING (true);

-- 2) Prevent privilege escalation: explicit admin-only management of user_roles
CREATE POLICY "Admins insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3) Restrict has_role EXECUTE so it cannot be called as RPC by anon/public.
--    Authenticated keeps EXECUTE because RLS policy expressions evaluate as the caller.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
