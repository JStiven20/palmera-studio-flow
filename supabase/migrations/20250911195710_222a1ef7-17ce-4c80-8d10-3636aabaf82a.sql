-- Create a function to make the first registered user an admin
CREATE OR REPLACE FUNCTION public.assign_first_user_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if there are any admin users
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    -- Get the first user (oldest by created_at from user_profiles)
    INSERT INTO public.user_roles (user_id, role)
    SELECT user_id, 'admin'::app_role
    FROM public.user_profiles
    ORDER BY created_at ASC
    LIMIT 1
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END;
$$;

-- Call the function to assign first user as admin
SELECT public.assign_first_user_admin();