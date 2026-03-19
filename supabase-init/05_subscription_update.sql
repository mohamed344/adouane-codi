-- ============================================
-- 05. Update subscriptions table for SlickPay integration
-- ============================================

-- Drop the foreign key constraint on plan_id so it can store plan slugs
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_id_fkey;

-- Change plan_id from UUID to TEXT to store plan slugs (e.g., 'free', 'monthly', 'annual')
ALTER TABLE public.subscriptions ALTER COLUMN plan_id TYPE TEXT USING plan_id::TEXT;

-- Update the status check constraint to include 'pending' for SlickPay payment flow
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_status_check
  CHECK (status IN ('active', 'cancelled', 'expired', 'pending'));
