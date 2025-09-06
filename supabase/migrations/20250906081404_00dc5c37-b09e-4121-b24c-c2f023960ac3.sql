-- Arreglar función de seguridad
CREATE OR REPLACE FUNCTION public.get_current_manicurist_name()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER STABLE SET search_path = public
AS $$
  SELECT manicurist_name FROM public.user_profiles WHERE user_id = auth.uid();
$$;