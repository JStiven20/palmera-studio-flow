-- Create manicurists table
CREATE TABLE public.manicurists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.manicurists ENABLE ROW LEVEL SECURITY;

-- Create policies for manicurists
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

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_manicurists_updated_at
BEFORE UPDATE ON public.manicurists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update income_records to use manicurist_id instead of enum
ALTER TABLE public.income_records 
ADD COLUMN manicurist_id UUID REFERENCES public.manicurists(id);

-- Update services table to allow user management
ALTER TABLE public.services 
ADD COLUMN user_id UUID;

-- Create policies for services management
CREATE POLICY "Users can insert their own services" 
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

CREATE POLICY "Users can view all services or their own" 
ON public.services 
FOR SELECT 
USING (user_id IS NULL OR auth.uid() = user_id);

-- Create default manicurists for existing users
INSERT INTO public.manicurists (user_id, name) 
SELECT DISTINCT user_id, unnest(ARRAY['Tamar', 'Anna', 'Yuli', 'Genesis', 'Invitada']) as name
FROM public.income_records 
WHERE user_id IS NOT NULL;