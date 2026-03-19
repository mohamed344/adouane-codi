-- ============================================
-- 06. Fix Subscriptions + Admin User Management
-- ============================================

-- 1. Fix plan_id type: convert from text to uuid (THIS IS THE BUG causing subscriptions not to display)
ALTER TABLE public.subscriptions
  ALTER COLUMN plan_id TYPE uuid USING plan_id::uuid;

-- 2. Add missing foreign key constraints (required for Supabase joins to work)
ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_plan_id_fkey
  FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON DELETE CASCADE;

-- 3. Admin user management policies
CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete users" ON public.users
  FOR DELETE USING (public.is_admin());
