-- Update manicurist enum with new values
DROP TYPE IF EXISTS public.manicurist CASCADE;

CREATE TYPE public.manicurist AS ENUM (
  'Tamar',
  'Anna', 
  'Yuli',
  'Genesis',
  'Invitada'
);

-- Update income_records table to use new enum
ALTER TABLE public.income_records 
DROP COLUMN IF EXISTS manicurist;

ALTER TABLE public.income_records 
ADD COLUMN manicurist public.manicurist NOT NULL DEFAULT 'Tamar';

-- Ensure payment_method is proper text type for both tables
ALTER TABLE public.expense_records 
ALTER COLUMN payment_method TYPE text;

ALTER TABLE public.income_records 
ALTER COLUMN payment_method TYPE text;