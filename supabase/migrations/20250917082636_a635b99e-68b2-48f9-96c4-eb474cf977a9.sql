-- Allow admins to select all income records and user profiles

-- Income records SELECT for admins
DROP POLICY IF EXISTS "Admins can view all income records" ON public.income_records;
CREATE POLICY "Admins can view all income records"
ON public.income_records
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- User profiles SELECT for admins
DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.user_profiles;
CREATE POLICY "Admins can view all user profiles"
ON public.user_profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));