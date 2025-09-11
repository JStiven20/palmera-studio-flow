-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  default_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on services table
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to view services (public catalog)
CREATE POLICY "Services are publicly viewable" 
ON public.services 
FOR SELECT 
USING (true);

-- Only admins can manage services
CREATE POLICY "Only admins can manage services" 
ON public.services 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert all the services data
INSERT INTO public.services (name, category, default_price) VALUES
-- Manicura services (18 servicios)
('Extensión De Gel - Uña Corta', 'Manicura', 65),
('Extensión De Gel - Uña Larga', 'Manicura', 70),
('Uñas Mordidas En Acrílico', 'Manicura', 70),
('Retiro De Gel /Acrílico / Acrigel Sin Esmaltar', 'Manicura', 35),
('Retiro De Acrílico y Uñas Nuevas - Cortas', 'Manicura', 75),
('Retiro De Acrílico y Uñas Nuevas - Largas', 'Manicura', 80),
('Retiro De Acrílico o Gel De Otro Sitio', 'Manicura', 10),
('Manicura Combinada (Rusa) - Corta', 'Manicura', 45),
('Manicura Combinada (Rusa) - Larga', 'Manicura', 50),
('Acrílico Nuevas', 'Manicura', 60),
('Reparación Una Uña', 'Manicura', 2.50),
('Extensión Una Uña', 'Manicura', 5),
('Manicura Completa Semi-Permanente', 'Manicura', 40),
('Manicura Completa Sin Esmaltar', 'Manicura', 35),
('Manicura Hombre Sin Esmaltar', 'Manicura', 35),
('Retiro Semi-Permanente Otro Sitio', 'Manicura', 5),
('Retiro Semi-Permanente + Manicura Sin Esmalte', 'Manicura', 40),
('Retirar Semi-Permanente + Manicura Completa', 'Manicura', 30),

-- Pedicura services (8 servicios)
('Pedicura Completa', 'Pedicura', 50),
('Pedicura Completa Spa', 'Pedicura', 65),
('Pedicura Completa Sin Esmaltar', 'Pedicura', 45),
('Pedicura Express Con Esmalte Semi-Permanente', 'Pedicura', 45),
('Pedicura Hombre', 'Pedicura', 60),
('Extensión Uña Del Pie', 'Pedicura', 6),
('Retiro Solo Esmalte Pedicura', 'Pedicura', 10),
('Retiro De Esmalte + Pedicura Completa', 'Pedicura', 60),

-- Extras services (8 servicios)
('Francesa Doble', 'Extras', 12),
('Glaseado', 'Extras', 10),
('Baby Boomer', 'Extras', 10),
('Efecto Aura', 'Extras', 10),
('Ojo De Gato', 'Extras', 10),
('Encapsulado Por Uña', 'Extras', 3),
('Decoración Por Uña', 'Extras', 1),
('Decoración Por Una Uña Premium', 'Extras', 5);

-- Create trigger for updating timestamps
CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();