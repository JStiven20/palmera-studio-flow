-- Create expense_records table
CREATE TABLE public.expense_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.expense_records ENABLE ROW LEVEL SECURITY;

-- Create policies for expense_records
CREATE POLICY "Users can view their own expense records" 
ON public.expense_records 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own expense records" 
ON public.expense_records 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expense records" 
ON public.expense_records 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expense records" 
ON public.expense_records 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_expense_records_updated_at
BEFORE UPDATE ON public.expense_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();