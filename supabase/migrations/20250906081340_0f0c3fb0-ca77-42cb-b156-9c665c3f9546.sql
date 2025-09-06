-- Crear tabla de manicuristas con autenticación
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  manicurist_name TEXT NOT NULL, -- nombre que aparecerá en los registros
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(email),
  UNIQUE(manicurist_name)
);

-- Habilitar RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para user_profiles - cada usuario solo ve su propio perfil
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Crear función para manejar nuevos usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
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

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Actualizar políticas de income_records para que cada manicurista solo vea sus registros
DROP POLICY IF EXISTS "Users can view their own income records" ON public.income_records;
DROP POLICY IF EXISTS "Users can create their own income records" ON public.income_records;
DROP POLICY IF EXISTS "Users can update their own income records" ON public.income_records;
DROP POLICY IF EXISTS "Users can delete their own income records" ON public.income_records;

-- Crear función para obtener el nombre de manicurista actual
CREATE OR REPLACE FUNCTION public.get_current_manicurist_name()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER SET search_path = public
AS $$
  SELECT manicurist_name FROM public.user_profiles WHERE user_id = auth.uid();
$$;

-- Nuevas políticas para income_records basadas en manicurist_name
CREATE POLICY "Manicurists can view their own income records" 
ON public.income_records 
FOR SELECT 
USING (manicurist = public.get_current_manicurist_name());

CREATE POLICY "Manicurists can create their own income records" 
ON public.income_records 
FOR INSERT 
WITH CHECK (manicurist = public.get_current_manicurist_name() AND auth.uid() = user_id);

CREATE POLICY "Manicurists can update their own income records" 
ON public.income_records 
FOR UPDATE 
USING (manicurist = public.get_current_manicurist_name() AND auth.uid() = user_id);

CREATE POLICY "Manicurists can delete their own income records" 
ON public.income_records 
FOR DELETE 
USING (manicurist = public.get_current_manicurist_name() AND auth.uid() = user_id);

-- Trigger para actualizar updated_at en user_profiles
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Eliminar tablas innecesarias para simplificar el sistema
DROP TABLE IF EXISTS public.expense_records CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.manicurists CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;