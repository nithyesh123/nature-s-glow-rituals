
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, app_role) FROM anon, PUBLIC;
-- has_role is used in RLS policies so authenticated needs EXECUTE; keep it.
GRANT EXECUTE ON FUNCTION public.has_role(UUID, app_role) TO authenticated;
