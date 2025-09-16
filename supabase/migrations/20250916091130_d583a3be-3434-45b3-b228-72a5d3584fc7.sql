-- Update RLS policies for income_records to allow admins to manage all records

-- Drop existing policies
DROP POLICY IF EXISTS "Manicurists can create their own income records" ON public.income_records;
DROP POLICY IF EXISTS "Manicurists can update their own income records" ON public.income_records;
DROP POLICY IF EXISTS "Manicurists can delete their own income records" ON public.income_records;

-- Create new policies that allow admins to manage all records
CREATE POLICY "Manicurists can create their own income records OR admins can create any" 
ON public.income_records 
FOR INSERT 
WITH CHECK (
  (manicurist = get_current_manicurist_name() AND auth.uid() = user_id) 
  OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Manicurists can update their own income records OR admins can update any" 
ON public.income_records 
FOR UPDATE 
USING (
  (manicurist = get_current_manicurist_name() AND auth.uid() = user_id) 
  OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Manicurists can delete their own income records OR admins can delete any" 
ON public.income_records 
FOR DELETE 
USING (
  (manicurist = get_current_manicurist_name() AND auth.uid() = user_id) 
  OR 
  has_role(auth.uid(), 'admin'::app_role)
);