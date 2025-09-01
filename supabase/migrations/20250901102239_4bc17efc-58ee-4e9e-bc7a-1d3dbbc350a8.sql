-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  default_price DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create manicurists table
CREATE TABLE public.manicurists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  commission_rate DECIMAL(5,2) DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manicurists ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for services
CREATE POLICY "Users can view their own services and global services" 
ON public.services 
FOR SELECT 
USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can create their own services" 
ON public.services 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own services" 
ON public.services 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own services" 
ON public.services 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for manicurists
CREATE POLICY "Users can view their own manicurists" 
ON public.manicurists 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own manicurists" 
ON public.manicurists 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own manicurists" 
ON public.manicurists 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own manicurists" 
ON public.manicurists 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_manicurists_updated_at
  BEFORE UPDATE ON public.manicurists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add service_id column to income_records for relationship
ALTER TABLE public.income_records 
ADD COLUMN service_id UUID REFERENCES public.services(id);

-- Insert some default services (these will be available to all users)
INSERT INTO public.services (name, category, default_price, user_id) VALUES
('Manicura básica', 'Manicura', 25.00, NULL),
('Manicura semipermanente', 'Manicura', 35.00, NULL),
('Pedicura básica', 'Pedicura', 30.00, NULL),
('Pedicura semipermanente', 'Pedicura', 40.00, NULL),
('Uñas esculpidas', 'Uñas artificiales', 50.00, NULL),
('Relleno uñas', 'Uñas artificiales', 35.00, NULL);