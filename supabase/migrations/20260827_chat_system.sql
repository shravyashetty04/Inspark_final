-- Create Enum for channel type if not exists
DO $$ BEGIN
    CREATE TYPE public.channel_type AS ENUM ('direct', 'group');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Channels table
CREATE TABLE public.chat_channels (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text, -- nullable for direct messages
  type channel_type NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by uuid REFERENCES public.employee_profiles(id)
);

-- Channel Members table
CREATE TABLE public.chat_members (
  channel_id uuid REFERENCES public.chat_channels(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES public.employee_profiles(id) ON DELETE CASCADE,
  joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (channel_id, employee_id)
);

-- Messages table
CREATE TABLE public.chat_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id uuid REFERENCES public.chat_channels(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES public.employee_profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Channel Policies
CREATE POLICY "Users can view channels they are members of" ON public.chat_channels FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chat_members WHERE channel_id = id AND employee_id = auth.uid())
);
CREATE POLICY "Users can insert channels" ON public.chat_channels FOR INSERT WITH CHECK (true);

-- Member Policies
CREATE POLICY "Users can view members of their channels" ON public.chat_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chat_members cm WHERE cm.channel_id = channel_id AND cm.employee_id = auth.uid())
);
CREATE POLICY "Users can insert members" ON public.chat_members FOR INSERT WITH CHECK (true);

-- Message Policies
CREATE POLICY "Users can view messages in their channels" ON public.chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chat_members WHERE channel_id = public.chat_messages.channel_id AND employee_id = auth.uid())
);
CREATE POLICY "Users can insert messages in their channels" ON public.chat_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.chat_members WHERE channel_id = public.chat_messages.channel_id AND employee_id = auth.uid())
);

-- Realtime Setup
-- Add chat_messages to publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_channels;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_members;
