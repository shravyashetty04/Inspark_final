import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react';
import '@livekit/components-styles';

export type CallType = 'audio' | 'video';

export interface CallDetails {
  channelId: string;
  callerId: string;
  callerName: string;
  type: CallType;
  isMeeting?: boolean;
  roomName?: string;
}

interface CallContextType {
  incomingCall: CallDetails | null;
  activeCall: CallDetails | null;
  callToken: string | null;
  startCall: (channelId: string, type: CallType, memberIds: string[], channelName: string) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  joinMeeting: (roomName: string) => Promise<void>;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

class RingtoneGenerator {
  private ctx: AudioContext | null = null;
  private intervalId: any = null;
  private isPlaying = false;

  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const playRing = () => {
      if (!this.isPlaying || !this.ctx) return;
      
      const now = this.ctx.currentTime;
      
      // Teams-like melody: F4 (349Hz), Bb4 (466Hz), D5 (587Hz), F5 (698Hz)
      const notes = [349.23, 466.16, 587.33, 698.46];
      const duration = 0.15; // fast pluck
      const gap = 0.05;
      
      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        
        osc.type = 'sine'; // Sine wave for a marimba/bell-like purity
        osc.frequency.value = freq;
        
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        
        const startTime = now + i * (duration + gap);
        
        // Envelope: sudden attack, exponential decay (plucky)
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.8, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    };

    playRing();
    this.intervalId = setInterval(playRing, 2500);
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export function CallProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  const [incomingCall, setIncomingCall] = useState<CallDetails | null>(null);
  const [activeCall, setActiveCall] = useState<CallDetails | null>(null);
  const [callToken, setCallToken] = useState<string | null>(null);
  
  const ringtoneRef = useRef<RingtoneGenerator | null>(null);
  const signalingChannelRef = useRef<any>(null);

  // Initialize ringtone
  useEffect(() => {
    ringtoneRef.current = new RingtoneGenerator();
    return () => {
      if (ringtoneRef.current) {
        ringtoneRef.current.stop();
        ringtoneRef.current = null;
      }
    };
  }, []);

  // Listen for incoming calls via global Supabase Broadcast
  useEffect(() => {
    if (!profile) return;

    const channel = supabase.channel('global-signaling');
    signalingChannelRef.current = channel;

    channel
      .on('broadcast', { event: 'incoming-call' }, (payload) => {
        const { targetUserIds, ...details } = payload.payload;
        // If we are one of the targets, and not already in a call
        if (targetUserIds && targetUserIds.includes(profile.id)) {
          if (!activeCall && !incomingCall) {
            setIncomingCall(details as CallDetails);
            ringtoneRef.current?.play();
          }
        }
      })
      .on('broadcast', { event: 'call-ended' }, (payload) => {
        const { channelId, targetUserIds } = payload.payload;
        if (targetUserIds && targetUserIds.includes(profile.id)) {
          if (incomingCall?.channelId === channelId) {
            setIncomingCall(null);
            ringtoneRef.current?.stop();
            toast('Call missed', { icon: '📵' });
          }
        }
      })
      .subscribe((status) => {
        console.log('Global signaling channel status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
      signalingChannelRef.current = null;
    };
  }, [profile, activeCall, incomingCall]);

  const fetchToken = async (roomName: string, participantName: string) => {
    const response = await fetch('/api/meetings/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomName, participantName })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get token');
    return data.token;
  };

  const startCall = async (channelId: string, type: CallType, memberIds: string[], channelName: string) => {
    if (!profile) return;
    
    try {
      // Get token for myself
      const token = await fetchToken(`chat-${channelId}`, profile.full_name || profile.email);
      setCallToken(token);
      setActiveCall({ channelId, callerId: profile.id, callerName: channelName, type });
      
      // Ring others
      const otherMembers = memberIds.filter(id => id !== profile.id);
      
      if (otherMembers.length > 0 && signalingChannelRef.current) {
        await signalingChannelRef.current.send({
          type: 'broadcast',
          event: 'incoming-call',
          payload: {
            targetUserIds: otherMembers,
            channelId,
            callerId: profile.id,
            callerName: profile.full_name,
            type
          }
        });
      }
    } catch (error: any) {
      toast.error('Failed to start call: ' + error.message);
    }
  };

  const acceptCall = async () => {
    if (!incomingCall || !profile) return;
    try {
      const token = await fetchToken(`chat-${incomingCall.channelId}`, profile.full_name || profile.email);
      setCallToken(token);
      setActiveCall(incomingCall);
      setIncomingCall(null);
      
      ringtoneRef.current?.stop();
      
      // Navigate to chat page to show the active call
      navigate('/portal/chat', { state: { channelId: incomingCall.channelId } });
    } catch (error: any) {
      toast.error('Failed to join call: ' + error.message);
      setIncomingCall(null);
    }
  };

  const rejectCall = () => {
    setIncomingCall(null);
    ringtoneRef.current?.stop();
  };

  const endCall = async () => {
    if (activeCall && profile) {
      // Optional: Broadcast call-ended to stop ringing on other end if they haven't picked up yet
      // This is complex for groups, but for DMs it's useful. We'll skip for simplicity, 
      // or we can just send it to the channel.
    }
    setActiveCall(null);
    setCallToken(null);
  };

  const joinMeeting = async (roomName: string) => {
    if (!profile) return;
    try {
      const token = await fetchToken(roomName, profile.full_name || profile.email);
      setCallToken(token);
      setActiveCall({
        channelId: roomName,
        callerId: profile.id,
        callerName: roomName,
        type: 'video',
        isMeeting: true,
        roomName: roomName
      });
      navigate(`/portal/meetings?room=${roomName}`);
    } catch (error: any) {
      toast.error('Failed to join meeting: ' + error.message);
    }
  };

  const serverUrl = import.meta.env.VITE_LIVEKIT_URL;

  return (
    <CallContext.Provider value={{ incomingCall, activeCall, callToken, startCall, acceptCall, rejectCall, endCall, joinMeeting }}>
      <LiveKitRoom
        video={activeCall?.type === 'video'}
        audio={true}
        token={callToken || ''}
        serverUrl={serverUrl}
        connect={!!callToken}
        style={{ display: 'contents' }}
        onDisconnected={() => {
          setActiveCall(null);
          setCallToken(null);
        }}
      >
        <RoomAudioRenderer />
        {children}
      </LiveKitRoom>
    </CallContext.Provider>
  );
}

export const useCall = () => {
  const context = useContext(CallContext);
  if (context === undefined) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};
