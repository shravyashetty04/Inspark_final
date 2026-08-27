import React, { useState, useEffect } from 'react';
import { LiveKitRoom, GridLayout, ParticipantTile, RoomAudioRenderer, useTracks, useLocalParticipant, Chat } from '@livekit/components-react';
import { Track } from 'livekit-client';
import '@livekit/components-styles';
import { Video, ArrowRight, UserPlus, Loader2, Mic, MicOff, Camera, CameraOff, MonitorUp, MessageSquare, X, Link as LinkIcon, Calendar, Hash } from 'lucide-react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

export default function Meetings() {
  const { profile } = useAuth();
  const [roomName, setRoomName] = useState('');
  const [inMeeting, setInMeeting] = useState(false);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  // You must provide this in the .env file!
  const serverUrl = import.meta.env.VITE_LIVEKIT_URL;

  const joinLiveKitRoom = async (room: string) => {
    if (!profile) return toast.error('You must be logged in');
    setLoading(true);
    
    try {
      const response = await fetch('/api/meetings/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: room,
          participantName: profile.full_name || profile.email
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get token');
      }

      setToken(data.token);
      setInMeeting(true);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const roomParam = searchParams.get('room');
    if (roomParam && profile) {
      setRoomName(roomParam);
      joinLiveKitRoom(roomParam);
      
      // Clean up URL to hide the room code
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [profile]);

  const startRandomMeeting = () => {
    const randomName = 'InSpark-' + Math.random().toString(36).substring(2, 10);
    setRoomName(randomName);
    joinLiveKitRoom(randomName);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomName.trim()) {
      joinLiveKitRoom(roomName.trim());
    }
  };

  const [showJoinInput, setShowJoinInput] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  
  // Schedule state
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [generatedInvite, setGeneratedInvite] = useState('');

  const createMeetingLink = () => {
    const randomName = 'InSpark-' + Math.random().toString(36).substring(2, 10);
    const meetingLink = `${window.location.origin}/portal/meetings?room=${randomName}`;
    navigator.clipboard.writeText(meetingLink);
    toast.success('Meeting link copied! You can now share it.');
    setRoomName(randomName);
    setShowJoinInput(false);
    setShowSchedule(false);
  };

  const openSchedule = () => {
    setShowSchedule(!showSchedule);
    setShowJoinInput(false);
    setGeneratedInvite('');
  };

  const openJoin = () => {
    setShowJoinInput(!showJoinInput);
    setShowSchedule(false);
  };

  const handleGenerateInvite = () => {
    if (!scheduleTitle || !scheduleDate || !scheduleTime) {
      toast.error('Please fill in all fields');
      return;
    }
    
    const randomName = 'InSpark-' + Math.random().toString(36).substring(2, 10);
    const dateObj = new Date(`${scheduleDate}T${scheduleTime}`);
    const meetingLink = `${window.location.origin}/portal/meetings?room=${randomName}`;
    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const dateString = dateObj.toLocaleDateString(undefined, dateOptions);
    const timeString = dateObj.toLocaleTimeString(undefined, { timeStyle: 'short' });
    
    const inviteText = `${profile?.full_name || 'A team member'} invited you to an InSpark Meeting:

${scheduleTitle}
${dateString}
${timeString}

Meeting link: ${meetingLink}`;

    setGeneratedInvite(inviteText);
  };

  if (inMeeting && token) {
    return (
      <div className="h-[650px] w-full bg-[#111] rounded-xl overflow-hidden relative border border-white/10 flex flex-col shadow-2xl">
        {/* Top Bar for Room Name & Actions */}
        <div className="bg-black/50 border-b border-white/10 p-4 flex items-center justify-between z-50">
          <div className="flex items-center gap-4">
            <h2 className="text-white font-bold">Room: {roomName}</h2>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(roomName);
                toast.success('Room code copied! Send this to your team.');
              }}
              className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              Copy Code
            </button>
          </div>
          
          <button 
            onClick={() => {
              setInMeeting(false);
              setToken('');
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            Leave Meeting
          </button>
        </div>
        
        <div className="flex-1 w-full relative overflow-hidden bg-black">
          <LiveKitRoom
            video={true}
            audio={true}
            token={token}
            serverUrl={serverUrl}
            data-lk-theme="default"
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            onDisconnected={() => {
              setInMeeting(false);
              setToken('');
            }}
          >
            <MyVideoConference />
            <RoomAudioRenderer />
          </LiveKitRoom>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-6">Meet</h1>
        
        <div className="flex flex-col md:flex-row items-center gap-4">
          <button 
            onClick={createMeetingLink}
            className="w-full md:w-auto px-8 py-4 bg-[#5458B3] hover:bg-[#4a4d9e] text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-3"
          >
            <LinkIcon size={20} />
            Create a meeting link
          </button>
          
          <button 
            onClick={openSchedule}
            className="w-full md:w-auto px-8 py-4 bg-[#2A2B2D] border border-[#3E3F42] hover:bg-[#343538] text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-3"
          >
            <Calendar size={20} className="text-pink-400" />
            Schedule a meeting
          </button>
          
          <button 
            onClick={openJoin}
            className="w-full md:w-auto px-8 py-4 bg-[#2A2B2D] border border-[#3E3F42] hover:bg-[#343538] text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-3"
          >
            <Hash size={20} className="text-blue-400" />
            Join with a meeting ID
          </button>
        </div>
        
        {showJoinInput && (
          <div className="mt-6 p-6 bg-[#1A1C1E] border border-white/5 rounded-xl max-w-md animate-in slide-in-from-top-4 fade-in duration-200">
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
        {showSchedule && (
          <div className="mt-6 p-6 bg-[#1A1C1E] border border-white/5 rounded-xl max-w-lg animate-in slide-in-from-top-4 fade-in duration-200">
            <h3 className="text-white font-medium mb-4">Schedule a Meeting</h3>
            
            {!generatedInvite ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Meeting Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Weekly Sync"
                    value={scheduleTitle}
                    onChange={(e) => setScheduleTitle(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#5458B3]"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm text-gray-400 mb-1">Date</label>
                    <input 
                      type="date" 
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#5458B3]"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-gray-400 mb-1">Time</label>
                    <input 
                      type="time" 
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#5458B3]"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>
                </div>
                <button 
                  onClick={handleGenerateInvite}
                  className="w-full py-3 bg-[#5458B3] hover:bg-[#4a4d9e] text-white font-medium rounded-lg transition-colors mt-2"
                >
                  Generate Invitation
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-black/40 border border-white/10 p-4 rounded-lg">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">
                    {generatedInvite}
                  </pre>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(generatedInvite);
                      toast.success('Invitation copied to clipboard!');
                    }}
                    className="flex-1 py-2.5 bg-[#5458B3] hover:bg-[#4a4d9e] text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    Copy to Clipboard
                  </button>
                  <button 
                    onClick={() => {
                      setGeneratedInvite('');
                      setScheduleTitle('');
                      setScheduleDate('');
                      setScheduleTime('');
                      setShowSchedule(false);
                    }}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MyVideoConference() {
  const [showChat, setShowChat] = useState(false);
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );
  
  return (
    <div className="flex flex-row h-full w-full relative">
      <div className="flex flex-col flex-1 h-full w-full">
        <div className="flex-1 p-2 w-full h-full overflow-hidden">
          <GridLayout tracks={tracks} style={{ height: '100%' }}>
            <ParticipantTile />
          </GridLayout>
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

  const toggleMic = () => {
    if (localParticipant) {
      localParticipant.setMicrophoneEnabled(!isMicOn);
      setIsMicOn(!isMicOn);
    }
  };

  const toggleCam = () => {
    if (localParticipant) {
      localParticipant.setCameraEnabled(!isCamOn);
      setIsCamOn(!isCamOn);
    }
  };

  const toggleScreen = () => {
    if (localParticipant) {
      localParticipant.setScreenShareEnabled(!isScreenOn);
      setIsScreenOn(!isScreenOn);
    }
  };

  return (
    <div className="flex items-center justify-center gap-4">
      <button 
        onClick={toggleMic}
        className={`p-4 rounded-full flex items-center justify-center transition-colors ${
          isMicOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
        title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
      >
        {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
      </button>

      <button 
        onClick={toggleCam}
        className={`p-4 rounded-full flex items-center justify-center transition-colors ${
          isCamOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
        title={isCamOn ? "Turn off Camera" : "Turn on Camera"}
      >
        {isCamOn ? <Camera size={24} /> : <CameraOff size={24} />}
      </button>

      <button 
        onClick={toggleScreen}
        className={`p-4 rounded-full flex items-center justify-center transition-colors ${
          isScreenOn ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
        }`}
        title="Share Screen"
      >
        <MonitorUp size={24} />
      </button>
      
      <button 
        onClick={onToggleChat}
        className={`p-4 rounded-full flex items-center justify-center transition-colors ${
          isChatOpen ? 'bg-purple-500 hover:bg-purple-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
        }`}
        title="Toggle Chat"
      >
        <MessageSquare size={24} />
      </button>
    </div>
  );
}
