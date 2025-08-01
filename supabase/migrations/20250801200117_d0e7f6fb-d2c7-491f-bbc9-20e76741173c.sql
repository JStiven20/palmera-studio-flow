-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('admin', 'employee');

-- Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN user_role user_role DEFAULT 'admin';

-- Create security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT user_role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Update the handle_new_user function to set default role as admin for first user, employee for others
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $function$
DECLARE
  user_count INTEGER;
BEGIN
  -- Count existing users
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  -- Insert new profile with role based on user count
  INSERT INTO public.profiles (user_id, name, email, user_role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'name', 
    new.email,
    CASE WHEN user_count = 0 THEN 'admin'::user_role ELSE 'employee'::user_role END
  );
  RETURN new;
END;
$function$;