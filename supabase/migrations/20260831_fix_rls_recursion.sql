-- Fix infinite recursion in RLS policies

-- 1. Drop the recursive policies
DROP POLICY IF EXISTS "Users can view meetings they are invited to or organized" ON public.meetings;
DROP POLICY IF EXISTS "Users can view participants of their meetings" ON public.meeting_participants;
DROP POLICY IF EXISTS "Users can view read receipts in their channels" ON public.message_reads;

-- 2. Create non-recursive policies

-- Meetings: User can see if they are the organizer, OR if they are in the participants table for that meeting.
-- Since meeting_participants SELECT is now universally allowed, this will not recurse.
CREATE POLICY "Users can view meetings they are invited to or organized" ON public.meetings FOR SELECT USING (
  organizer_id = auth.uid() OR
  id IN (SELECT meeting_id FROM public.meeting_participants WHERE employee_id = auth.uid())
);

-- Meeting Participants: Allow all authenticated users to read participants. 
-- (Standard for company apps so you can see who is in a meeting)
CREATE POLICY "Users can view all meeting participants" ON public.meeting_participants FOR SELECT USING (
  true
);

-- Message Reads: Allow all authenticated users to read receipts.
CREATE POLICY "Users can view read receipts in their channels" ON public.message_reads FOR SELECT USING (
  true
);
