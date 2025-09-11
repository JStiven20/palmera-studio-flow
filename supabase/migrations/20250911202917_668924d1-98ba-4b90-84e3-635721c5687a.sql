-- First, let's check if we have the trigger to create profiles automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, full_name, manicurist_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'manicurist_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new users (if it doesn't exist)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a profile for the existing user (assuming they are the first admin)
DO $$
DECLARE
  existing_user_id uuid;
BEGIN
  -- Get the first user from auth.users
  SELECT id INTO existing_user_id
  FROM auth.users
  ORDER BY created_at ASC
  LIMIT 1;
  
  -- If we found a user and they don't have a profile yet, create one
  IF existing_user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = existing_user_id) THEN
    INSERT INTO public.user_profiles (user_id, email, full_name, manicurist_name)
    SELECT 
      id, 
      email, 
      COALESCE(raw_user_meta_data->>'full_name', 'Administrador'),
      COALESCE(raw_user_meta_data->>'manicurist_name', 'Admin')
    FROM auth.users 
    WHERE id = existing_user_id;
    
    -- Make them admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (existing_user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END;
$$;