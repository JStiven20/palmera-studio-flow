-- Create user for johnztiven@gmail.com as manicurist "tamar"
-- First, let's add tracking fields to income_records
ALTER TABLE public.income_records 
ADD COLUMN created_by_manicurist boolean DEFAULT false,
ADD COLUMN modified_by_manicurist boolean DEFAULT false,
ADD COLUMN original_price numeric,
ADD COLUMN modification_notes text;

-- Create a function to handle price modifications by manicurists
CREATE OR REPLACE FUNCTION public.track_income_modification()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger for tracking modifications
CREATE TRIGGER track_income_price_changes
  BEFORE UPDATE ON public.income_records
  FOR EACH ROW
  EXECUTE FUNCTION public.track_income_modification();