-- Tighten RLS: prevent spoofed user_id on insert
-- Users can only insert with their own user_id or null (anonymous)

DROP POLICY IF EXISTS "Anyone can insert generations" ON public.generations;

CREATE POLICY "Insert own or anonymous" ON public.generations
  FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());
