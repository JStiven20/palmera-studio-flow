-- Fix security warnings by updating functions with proper search_path
CREATE OR REPLACE FUNCTION public.track_income_modification()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If price is being changed and it's different from original
  IF OLD.price IS DISTINCT FROM NEW.price THEN
    NEW.modified_by_manicurist = true;
    -- Store original price if not already stored
    IF OLD.original_price IS NULL THEN
      NEW.original_price = OLD.price;
    END IF;
  END IF;
  
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;