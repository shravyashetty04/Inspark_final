-- Fix infinite recursion in chat RLS policies

-- 1. Drop the recursive policies
DROP POLICY IF EXISTS "Users can view channels they are members of" ON public.chat_channels;
DROP POLICY IF EXISTS "Users can view members of their channels" ON public.chat_members;
DROP POLICY IF EXISTS "Users can view messages in their channels" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert messages in their channels" ON public.chat_messages;

-- 2. Create non-recursive policies

-- Chat Members: Allow all authenticated users to read who is in which channel
-- This breaks the infinite recursion chain.
CREATE POLICY "Users can view all chat members" ON public.chat_members FOR SELECT USING (
  true
);

-- Chat Channels: User can view if they are in the channel
CREATE POLICY "Users can view channels they are members of" ON public.chat_channels FOR SELECT USING (
  id IN (SELECT channel_id FROM public.chat_members WHERE employee_id = auth.uid())
);

-- Chat Messages: User can view and insert if they are in the channel
CREATE POLICY "Users can view messages in their channels" ON public.chat_messages FOR SELECT USING (
  channel_id IN (SELECT channel_id FROM public.chat_members WHERE employee_id = auth.uid())
);

CREATE POLICY "Users can insert messages in their channels" ON public.chat_messages FOR INSERT WITH CHECK (
  channel_id IN (SELECT channel_id FROM public.chat_members WHERE employee_id = auth.uid())
);
