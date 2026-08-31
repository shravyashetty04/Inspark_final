import React, { useState, useEffect } from 'react';
import { supabase, Meeting, MeetingParticipant, EmployeeProfile } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useCall } from './CallContext';
import { Calendar, Clock, Users, Plus, X, Video, Info, Link as LinkIcon, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { LiveKitRoom, GridLayout, ParticipantTile, useTracks, useLocalParticipant, Chat, FocusLayout } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { Mic, MicOff, Camera, CameraOff, MonitorUp, MessageSquare, Maximize2 } from 'lucide-react';
import '@livekit/components-styles';

export default function Meetings() {
  const { profile } = useAuth();
  const { activeCall, joinMeeting, endCall } = useCall();
  const [meetings, setMeetings] = useState<(Meeting & { participants: MeetingParticipant[] })[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [users, setUsers] = useState<EmployeeProfile[]>([]);
  
  // New Meeting Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Simple Join
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      loadMeetings();
      loadUsers();
    }
  }, [profile]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const roomParam = searchParams.get('room');
    if (roomParam && profile) {
      setRoomName(roomParam);
      joinLiveKitRoom(roomParam);
    }
  }, [profile]);

  // Realtime subscription for meetings
  useEffect(() => {
    if (!profile) return;
    const meetingSub = supabase.channel('meetings_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meetings' }, () => {
        loadMeetings();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meeting_participants', filter: `employee_id=eq.${profile.id}` }, () => {
        loadMeetings();
      })
      .subscribe();
    return () => { supabase.removeChannel(meetingSub); };
  }, [profile]);

  const loadMeetings = async () => {
    if (!profile) return;
    
    // Check if the tables exist to prevent crashing on older DB versions
    const { data, error } = await supabase
      .from('meetings')
      .select('*, participants:meeting_participants(*)')
      .order('start_time', { ascending: true });

    if (!error && data) {
      setMeetings(data as any);
    }
  };

  const loadUsers = async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('employee_profiles')
      .select('*')
      .neq('id', profile.id)
      .order('full_name');
    if (data) setUsers(data);
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time || selectedUsers.length === 0 || !profile) {
      toast.error('Please fill all required fields and select participants.');
      return;
    }

    const startDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);

    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .insert({
        title,
        description,
        organizer_id: profile.id,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        status: 'Scheduled'
      })
      .select()
      .single();

    if (meetingError || !meeting) {
      toast.error('Failed to create meeting');
      return;
    }

    // Insert participants (including organizer)
    const participantsToInsert = [
      { meeting_id: meeting.id, employee_id: profile.id, status: 'Accepted' },
      ...selectedUsers.map(id => ({ meeting_id: meeting.id, employee_id: id, status: 'Invited' }))
    ];

    await supabase.from('meeting_participants').insert(participantsToInsert);

    // Create a group chat channel for the meeting
    const { data: channelData } = await supabase
      .from('chat_channels')
      .insert({
        type: 'group',
        name: `${title}`,
        created_by: profile.id,
        meeting_id: meeting.id
      })
      .select()
      .single();

    if (channelData) {
      const chatMembers = participantsToInsert.map(p => ({
        channel_id: channelData.id,
        employee_id: p.employee_id
      }));
      await supabase.from('chat_members').insert(chatMembers);
    }

    toast.success('Meeting scheduled successfully!');
    setIsCreating(false);
    setTitle('');
    setDescription('');
    setDate('');
    setTime('');
    setSelectedUsers([]);
    loadMeetings();
  };

  const joinLiveKitRoom = async (room: string) => {
    if (!profile) return toast.error('You must be logged in');
    setLoading(true);
    
    // Ensure URL has the room code so refreshes work!
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('room') !== room) {
      window.history.replaceState({}, '', `${window.location.pathname}?room=${room}`);
    }
    
    await joinMeeting(room);
    setLoading(false);
  };

  const handleScheduledJoin = async (meeting: Meeting) => {
    if (!profile) return;
    
    // Find the associated chat channel ID to use as the room ID
    const { data: channelData } = await supabase
      .from('chat_channels')
      .select('id')
      .eq('meeting_id', meeting.id)
      .single();
      
    if (channelData) {
      // Mark as joined
      await supabase
        .from('meeting_participants')
        .update({ status: 'Joined', joined_at: new Date().toISOString() })
        .eq('meeting_id', meeting.id)
        .eq('employee_id', profile.id);

      joinLiveKitRoom(channelData.id);
    } else {
      toast.error("Meeting room not found.");
    }
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomName.trim()) {
      joinLiveKitRoom(roomName.trim());
    }
  };

  const createMeetingLink = () => {
    const randomName = 'InSpark-' + Math.random().toString(36).substring(2, 10);
    const meetingLink = `${window.location.origin}/portal/meetings?room=${randomName}`;
    navigator.clipboard.writeText(meetingLink);
    toast.success('Meeting link copied! You can now share it.');
    setRoomName(randomName);
    setShowJoinInput(false);
  };

  const getMeetingStatus = (meeting: Meeting) => {
    const now = new Date();
    const start = new Date(meeting.start_time);
    const end = new Date(meeting.end_time);

    if (meeting.status === 'Cancelled') return 'Cancelled';
    if (now > end) return 'Completed';
    if (now >= start && now <= end) return 'Live';
    if (start.getTime() - now.getTime() < 15 * 60000) return 'Starting Soon';
    return 'Scheduled';
  };

  if (activeCall && activeCall.isMeeting) {
    return (
      <div className="h-[calc(100vh-8rem)] w-full bg-[#111] rounded-xl overflow-hidden relative border border-white/10 flex flex-col shadow-2xl">
        <div className="bg-black/50 border-b border-white/10 p-4 flex items-center justify-between z-50">
          <div className="flex items-center gap-4">
            <h2 className="text-white font-bold text-sm md:text-base">Meeting Room</h2>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Meeting link copied!');
              }}
              className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              Copy Link
            </button>
          </div>
          <button 
            onClick={() => endCall()}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            Leave Meeting
          </button>
        </div>
        <div className="flex-1 w-full relative overflow-hidden bg-black">
          <MyVideoConference />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Header & Quick Actions */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Meetings</h1>
          <p className="text-gray-400">Schedule and manage your team meetings</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={createMeetingLink}
            className="px-4 py-2.5 bg-[#2A2B2D] border border-[#3E3F42] hover:bg-[#343538] text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <LinkIcon size={16} /> Instant Link
          </button>
          <button 
            onClick={() => { setShowJoinInput(!showJoinInput); setIsCreating(false); }}
            className="px-4 py-2.5 bg-[#2A2B2D] border border-[#3E3F42] hover:bg-[#343538] text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Video size={16} /> Join Code
          </button>
          <button 
            onClick={() => { setIsCreating(!isCreating); setShowJoinInput(false); }}
            className="px-4 py-2.5 bg-[#5458B3] hover:bg-[#4a4d9e] text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Calendar size={16} /> Schedule
          </button>
        </div>
      </div>

      {/* Join Code Input */}
      {showJoinInput && (
        <div className="mb-8 p-6 bg-[#1A1C1E] border border-white/5 rounded-xl max-w-md animate-in slide-in-from-top-4 fade-in duration-200">
          <h3 className="text-white font-medium mb-4">Enter Meeting ID</h3>
          <form onSubmit={handleJoinSubmit} className="flex gap-3">
            <input 
              type="text" 
              placeholder="e.g. InSpark-Daily-Standup"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#5458B3]"
            />
            <button 
              type="submit"
              disabled={!roomName.trim() || loading}
              className="px-6 py-2.5 bg-[#5458B3] hover:bg-[#4a4d9e] disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Join'}
            </button>
          </form>
        </div>
      )}

      {/* Schedule Meeting Form */}
      {isCreating && (
        <div className="mb-8 bg-[#1A1C1E] p-6 rounded-2xl shadow-xl border border-white/10 animate-in slide-in-from-top-4 fade-in duration-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Schedule New Meeting</h2>
            <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
          </div>
          <form onSubmit={handleCreateMeeting} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Meeting Title</label>
                <input 
                  type="text" required
                  value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-[#5458B3]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description (Optional)</label>
                <input 
                  type="text"
                  value={description} onChange={e => setDescription(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-[#5458B3]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Date</label>
                <input 
                  type="date" required
                  value={date} onChange={e => setDate(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-[#5458B3]"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-1">Time</label>
                  <input 
                    type="time" required
                    value={time} onChange={e => setTime(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-[#5458B3]"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-1">Duration (min)</label>
                  <select 
                    value={durationMinutes} onChange={e => setDurationMinutes(Number(e.target.value))}
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white focus:border-[#5458B3]"
                  >
                    <option value={15} className="bg-[#1A1C1E]">15 min</option>
                    <option value={30} className="bg-[#1A1C1E]">30 min</option>
                    <option value={45} className="bg-[#1A1C1E]">45 min</option>
                    <option value={60} className="bg-[#1A1C1E]">1 hour</option>
                    <option value={120} className="bg-[#1A1C1E]">2 hours</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Participants</label>
              <div className="bg-black/30 border border-white/10 rounded-lg p-3 max-h-40 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {users.map(user => (
                  <label key={user.id} className="flex items-center gap-2 text-white cursor-pointer hover:bg-white/5 p-2 rounded">
                    <input 
                      type="checkbox" 
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedUsers([...selectedUsers, user.id]);
                        else setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                      }}
                      className="rounded text-[#5458B3] focus:ring-[#5458B3] bg-white/10 border-white/20"
                    />
                    <span className="truncate text-sm">{user.full_name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" className="bg-[#5458B3] hover:bg-[#4a4d9e] text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
                Schedule Meeting
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Upcoming Meetings */}
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Calendar size={20} className="text-pink-400" /> Upcoming Meetings
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {meetings.length === 0 ? (
          <div className="col-span-full bg-[#1A1C1E] border border-white/5 rounded-2xl p-10 text-center">
            <Calendar className="mx-auto text-gray-600 mb-4" size={48} />
            <h3 className="text-lg font-medium text-white mb-2">No Scheduled Meetings</h3>
            <p className="text-gray-400 text-sm">Create a meeting link or schedule one to get started.</p>
          </div>
        ) : (
          meetings.map(meeting => {
            const status = getMeetingStatus(meeting);
            const isLive = status === 'Live' || status === 'Starting Soon';
            const amIInvited = meeting.participants?.some(p => p.employee_id === profile?.id);
            
            return (
              <div key={meeting.id} className="bg-[#1A1C1E] border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col relative overflow-hidden hover:border-white/10 transition-colors">
                {isLive && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-[#5458B3]"></div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 pr-4">
                    <h3 className="text-lg font-semibold text-white truncate">{meeting.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Calendar size={13} /> {new Date(meeting.start_time).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Clock size={13} /> {new Date(meeting.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <div className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                    status === 'Live' ? 'bg-red-500/10 text-red-400' :
                    status === 'Starting Soon' ? 'bg-blue-500/10 text-blue-400' :
                    status === 'Completed' ? 'bg-gray-500/10 text-gray-400' :
                    status === 'Cancelled' ? 'bg-orange-500/10 text-orange-400' :
                    'bg-[#5458B3]/10 text-[#5458B3]'
                  }`}>
                    {status}
                  </div>
                </div>

                {meeting.description && (
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">{meeting.description}</p>
                )}

                <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                    <Users size={14} />
                    <span>{meeting.participants?.length || 0} participants</span>
                  </div>
                  
                  {amIInvited && (
                    <button 
                      onClick={() => handleScheduledJoin(meeting)}
                      disabled={status === 'Completed' || status === 'Cancelled'}
                      className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isLive 
                          ? 'bg-[#5458B3] hover:bg-[#4a4d9e] text-white' 
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Video size={14} />
                      {isLive ? 'Join Now' : status === 'Completed' ? 'Ended' : status === 'Cancelled' ? 'Cancelled' : 'Join'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// LiveKit Video Conference Component
function MyVideoConference() {
  const [showChat, setShowChat] = useState(false);
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );
  const screenShareTrack = tracks.find(t => t.source === Track.Source.ScreenShare);

  return (
    <div className="flex flex-row h-full w-full relative">
      <div className="flex flex-col flex-1 h-full w-full">
        <div className="flex-1 p-2 w-full h-full overflow-hidden flex flex-col md:flex-row gap-2">
          {screenShareTrack ? (
            <>
              <div className="flex-[3] w-full h-full rounded-xl overflow-hidden shadow-lg border border-white/10 bg-black relative">
                <FocusLayout trackRef={screenShareTrack} />
              </div>
              <div className="flex-1 min-w-[200px] h-full overflow-y-auto">
                <GridLayout tracks={tracks.filter(t => t.publication?.trackSid !== screenShareTrack.publication?.trackSid)} style={{ height: '100%' }}>
                  <ParticipantTile />
                </GridLayout>
              </div>
            </>
          ) : (
            <GridLayout tracks={tracks} style={{ height: '100%' }}>
              <ParticipantTile />
            </GridLayout>
          )}
        </div>
        <div className="shrink-0 bg-[#0B0D21] py-4 border-t border-white/10 z-50">
          <CustomControlBar onToggleChat={() => setShowChat(!showChat)} isChatOpen={showChat} />
        </div>
      </div>
      {showChat && (
        <div className="w-80 md:w-96 flex flex-col bg-[#111] border-l border-white/10 h-full absolute right-0 top-0 bottom-0 z-40 md:relative overflow-hidden">
          <div className="p-3 border-b border-white/10 flex justify-between items-center md:hidden bg-[#1a1b3b]">
            <span className="text-white font-medium">Meeting Chat</span>
            <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
          </div>
          <Chat className="flex-1 lk-chat" />
        </div>
      )}
    </div>
  );
}

function CustomControlBar({ onToggleChat, isChatOpen }: { onToggleChat: () => void, isChatOpen: boolean }) {
  const { localParticipant } = useLocalParticipant();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isScreenOn, setIsScreenOn] = useState(false);

  useEffect(() => {
    if (localParticipant) {
      setIsMicOn(localParticipant.isMicrophoneEnabled);
      setIsCamOn(localParticipant.isCameraEnabled);
    }
  }, [localParticipant?.isMicrophoneEnabled, localParticipant?.isCameraEnabled]);

  const toggleMic = () => {
    if (localParticipant) localParticipant.setMicrophoneEnabled(!isMicOn);
  };

  const toggleCam = () => {
    if (localParticipant) localParticipant.setCameraEnabled(!isCamOn);
  };

  const toggleScreen = () => {
    if (localParticipant) {
      localParticipant.setScreenShareEnabled(!isScreenOn);
      setIsScreenOn(!isScreenOn);
    }
  };

  const togglePiP = async () => {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else {
      const videos = Array.from(document.querySelectorAll('video'));
      const targetVideo = videos.find(v => v.srcObject && (v.srcObject as MediaStream).active) || videos[0];
      if (targetVideo) {
        try { await targetVideo.requestPictureInPicture(); } catch (e) { toast.error('Failed to open PiP'); }
      } else {
        toast.error('No active video found');
      }
    }
  };

  return (
    <div className="flex items-center justify-center gap-4">
      <button 
        onClick={toggleMic}
        className={`p-4 rounded-full flex items-center justify-center transition-colors ${
          isMicOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
      >
        {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
      </button>

      <button 
        onClick={toggleCam}
        className={`p-4 rounded-full flex items-center justify-center transition-colors ${
          isCamOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
      >
        {isCamOn ? <Camera size={24} /> : <CameraOff size={24} />}
      </button>

      <button 
        onClick={toggleScreen}
        className={`p-4 rounded-full flex items-center justify-center transition-colors ${
          isScreenOn ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
        }`}
      >
        <MonitorUp size={24} />
      </button>

      <button 
        onClick={togglePiP}
        className="p-4 rounded-full flex items-center justify-center transition-colors bg-white/10 hover:bg-white/20 text-white"
      >
        <Maximize2 size={24} />
      </button>
      
      <button 
        onClick={onToggleChat}
        className={`p-4 rounded-full flex items-center justify-center transition-colors ${
          isChatOpen ? 'bg-[#5458B3] hover:bg-[#4a4d9e] text-white' : 'bg-white/10 hover:bg-white/20 text-white'
        }`}
      >
        <MessageSquare size={24} />
      </button>
    </div>
  );
}
