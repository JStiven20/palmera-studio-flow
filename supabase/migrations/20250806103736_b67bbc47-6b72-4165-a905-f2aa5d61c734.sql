-- Fix the handle_new_user function to remove the name column reference
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_count INTEGER;
BEGIN
  -- Count existing users
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  -- Insert new profile with role based on user count (removed name column)
  INSERT INTO public.profiles (user_id, email, user_role)
  VALUES (
    new.id, 
    new.email,
    CASE WHEN user_count = 0 THEN 'admin'::user_role ELSE 'employee'::user_role END
  );
  RETURN new;
END;
$function$;