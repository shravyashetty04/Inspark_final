-- Fix infinite recursion on chat_members
DROP POLICY IF EXISTS "Users can view members of their channels" ON public.chat_members;
CREATE POLICY "Users can view members of their channels" ON public.chat_members FOR SELECT USING (
  true
);

-- Fix creator not being able to select channel immediately after insert
DROP POLICY IF EXISTS "Users can view channels they are members of" ON public.chat_channels;
CREATE POLICY "Users can view channels they are members of" ON public.chat_channels FOR SELECT USING (
  created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.chat_members WHERE channel_id = id AND employee_id = auth.uid())
);
