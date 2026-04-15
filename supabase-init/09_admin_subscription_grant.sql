-- ============================================
-- 09. Allow admins to grant & manage subscriptions
-- ============================================

CREATE POLICY "Admins can insert subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update subscriptions" ON public.subscriptions
  FOR UPDATE USING (public.is_admin());
