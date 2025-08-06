-- Function to check if the current user is an admin.
-- This function is a SECURITY DEFINER, meaning it runs with the privileges of the user who created it (the postgres user),
-- allowing it to check the admin_users table, which a regular user might not have access to.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  is_admin_user BOOLEAN;
BEGIN
  -- Check if the user's ID exists in the admin_users table
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE id = auth.uid()
  ) INTO is_admin_user;
  RETURN is_admin_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on the function to all authenticated users so it can be used in RLS policies.
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;
