-- 1. Create meetings table
CREATE TABLE public.meetings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  organizer_id uuid REFERENCES public.employee_profiles(id) ON DELETE CASCADE,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  status text DEFAULT 'Scheduled' NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create meeting_participants table
CREATE TABLE public.meeting_participants (
  meeting_id uuid REFERENCES public.meetings(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES public.employee_profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'Invited' NOT NULL,
  joined_at timestamp with time zone,
  left_at timestamp with time zone,
  PRIMARY KEY (meeting_id, employee_id)
);

-- 3. Modify chat_channels table
ALTER TABLE public.chat_channels ADD COLUMN IF NOT EXISTS meeting_id uuid REFERENCES public.meetings(id) ON DELETE CASCADE;
ALTER TABLE public.chat_channels ADD COLUMN IF NOT EXISTS last_message text;
ALTER TABLE public.chat_channels ADD COLUMN IF NOT EXISTS last_message_at timestamp with time zone DEFAULT timezone('utc'::text, now());
ALTER TABLE public.chat_channels ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now());

-- 4. Modify chat_members table
ALTER TABLE public.chat_members ADD COLUMN IF NOT EXISTS unread_count integer DEFAULT 0;
ALTER TABLE public.chat_members ADD COLUMN IF NOT EXISTS last_read_at timestamp with time zone DEFAULT timezone('utc'::text, now());

-- 5. Create message_reads table
CREATE TABLE public.message_reads (
  message_id uuid REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES public.employee_profiles(id) ON DELETE CASCADE,
  read_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (message_id, employee_id)
);

-- 6. Create notifications table
CREATE TABLE public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.employee_profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  related_meeting_id uuid REFERENCES public.meetings(id) ON DELETE CASCADE,
  related_channel_id uuid REFERENCES public.chat_channels(id) ON DELETE CASCADE,
  is_read boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Meetings Policies
CREATE POLICY "Users can view meetings they are invited to or organized" ON public.meetings FOR SELECT USING (
  organizer_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.meeting_participants WHERE meeting_id = id AND employee_id = auth.uid())
);
CREATE POLICY "Users can insert meetings" ON public.meetings FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Users can update their own meetings" ON public.meetings FOR UPDATE USING (organizer_id = auth.uid());

-- Meeting Participants Policies
CREATE POLICY "Users can view participants of their meetings" ON public.meeting_participants FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.meeting_participants mp WHERE mp.meeting_id = meeting_id AND mp.employee_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.meetings m WHERE m.id = meeting_id AND m.organizer_id = auth.uid())
);
CREATE POLICY "Users can insert participants" ON public.meeting_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own participant status" ON public.meeting_participants FOR UPDATE USING (employee_id = auth.uid());

-- Message Reads Policies
CREATE POLICY "Users can view read receipts in their channels" ON public.message_reads FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.chat_messages cm
    JOIN public.chat_members c_mem ON c_mem.channel_id = cm.channel_id
    WHERE cm.id = public.message_reads.message_id AND c_mem.employee_id = auth.uid()
  )
);
CREATE POLICY "Users can mark messages as read" ON public.message_reads FOR INSERT WITH CHECK (employee_id = auth.uid());

-- Notifications Policies
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Trigger: When a new message is inserted
CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS trigger AS $$
BEGIN
  -- 1. Update the channel's last_message and last_message_at
  UPDATE public.chat_channels
  SET last_message = NEW.content,
      last_message_at = NEW.created_at,
      updated_at = now()
  WHERE id = NEW.channel_id;

  -- 2. Increment unread_count for all members EXCEPT the sender
  UPDATE public.chat_members
  SET unread_count = unread_count + 1
  WHERE channel_id = NEW.channel_id AND employee_id != NEW.sender_id;

  -- 3. We will handle notifications purely in the frontend for simplicity, 
  -- but we can optionally insert notifications here. Let's insert a notification.
  INSERT INTO public.notifications (user_id, type, title, message, related_channel_id)
  SELECT employee_id, 'new_message', 'New Message', substring(NEW.content from 1 for 50), NEW.channel_id
  FROM public.chat_members
  WHERE channel_id = NEW.channel_id AND employee_id != NEW.sender_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_chat_message_inserted
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_message();

-- Realtime Configuration
ALTER PUBLICATION supabase_realtime ADD TABLE public.meetings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meeting_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reads;
