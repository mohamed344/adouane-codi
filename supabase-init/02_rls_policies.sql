-- ============================================
-- 02. Row Level Security (RLS) Policies
-- ============================================

-- Helper function to check admin role without triggering RLS recursion.
-- SECURITY DEFINER runs as the function owner (postgres), bypassing RLS.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ---- Users ----
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can read all users" ON public.users
  FOR SELECT USING (public.is_admin());

-- ---- Plans ----
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active plans" ON public.plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can read all plans" ON public.plans
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert plans" ON public.plans
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update plans" ON public.plans
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete plans" ON public.plans
  FOR DELETE USING (public.is_admin());

-- ---- Subscriptions ----
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all subscriptions" ON public.subscriptions
  FOR SELECT USING (public.is_admin());
