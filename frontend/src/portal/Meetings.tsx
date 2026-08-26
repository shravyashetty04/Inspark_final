import React, { useState } from 'react';
import { LiveKitRoom, GridLayout, ParticipantTile, RoomAudioRenderer, useTracks, useLocalParticipant } from '@livekit/components-react';
import { Track } from 'livekit-client';
import '@livekit/components-styles';
import { Video, ArrowRight, UserPlus, Loader2, Mic, MicOff, Camera, CameraOff, MonitorUp, PhoneOff } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Meeting Rooms</h1>
        <p className="text-slate-400">Join a scheduled meeting or start an instant huddle securely via LiveKit.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Start Instant Meeting */}
        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl flex flex-col hover:bg-white/10 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-6">
            <Video className="text-emerald-400" size={24} />
          </div>
          <h2 className="text-xl font-bold text-white mb-3">Instant Huddle</h2>
          <p className="text-slate-400 mb-8 flex-1">Start a secure, randomized video meeting directly in the portal.</p>
          <button 
            onClick={startRandomMeeting}
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Start New Meeting'}
          </button>
        </div>

        {/* Join Meeting */}
        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl flex flex-col hover:bg-white/10 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-6">
            <UserPlus className="text-indigo-400" size={24} />
          </div>
          <h2 className="text-xl font-bold text-white mb-3">Join a Room</h2>
          <p className="text-slate-400 mb-8 flex-1">Have a room name? Enter it below to jump straight into the call.</p>
          
          <form onSubmit={handleJoinSubmit} className="flex gap-3 mt-auto">
            <input 
              type="text" 
              placeholder="e.g. InSpark-Daily-Standup"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-indigo-500"
            />
            <button 
              type="submit"
              disabled={!roomName.trim() || loading}
              className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Join <ArrowRight size={18} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function MyVideoConference() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );
  
  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 p-2 w-full h-full overflow-hidden">
        <GridLayout tracks={tracks} style={{ height: '100%' }}>
          <ParticipantTile />
        </GridLayout>
      </div>
      <div className="shrink-0 bg-[#0B0D21] py-4 border-t border-white/10 z-50">
        <CustomControlBar />
      </div>
    </div>
  );
}

function CustomControlBar() {
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
    </div>
  );
}
