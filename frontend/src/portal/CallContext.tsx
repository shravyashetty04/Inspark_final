import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export type CallType = 'audio' | 'video';

export interface CallDetails {
  channelId: string;
  callerId: string;
  callerName: string;
  type: CallType;
}

interface CallContextType {
  incomingCall: CallDetails | null;
  activeCall: CallDetails | null;
  callToken: string | null;
  startCall: (channelId: string, type: CallType, memberIds: string[], channelName: string) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
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
      
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.value = 440;
      
      osc2.type = 'sine';
      osc2.frequency.value = 480;

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      const now = this.ctx.currentTime;
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.5, now + 0.1);
      
      gain.gain.setValueAtTime(0.5, now + 1.9);
      gain.gain.linearRampToValueAtTime(0, now + 2.0);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 2.1);
      osc2.stop(now + 2.1);
    };

    playRing();
    this.intervalId = setInterval(playRing, 4000);
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

  return (
    <CallContext.Provider value={{ incomingCall, activeCall, callToken, startCall, acceptCall, rejectCall, endCall }}>
      {children}
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
