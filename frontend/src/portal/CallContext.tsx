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

export function CallProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  const [incomingCall, setIncomingCall] = useState<CallDetails | null>(null);
  const [activeCall, setActiveCall] = useState<CallDetails | null>(null);
  const [callToken, setCallToken] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize ringtone
  useEffect(() => {
    audioRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/phone_ringing.ogg');
    audioRef.current.loop = true;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Listen for incoming calls via Supabase Broadcast
  useEffect(() => {
    if (!profile) return;

    const channel = supabase.channel(`user:${profile.id}`);

    channel
      .on('broadcast', { event: 'incoming-call' }, (payload) => {
        const details = payload.payload as CallDetails;
        // Don't ring if already in a call
        if (!activeCall && !incomingCall) {
          setIncomingCall(details);
          audioRef.current?.play().catch(e => console.log('Audio autoplay prevented:', e));
        }
      })
      .on('broadcast', { event: 'call-ended' }, (payload) => {
        const { channelId } = payload.payload;
        if (incomingCall?.channelId === channelId) {
          setIncomingCall(null);
          audioRef.current?.pause();
          if (audioRef.current) audioRef.current.currentTime = 0;
          toast('Call missed', { icon: '📵' });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
      for (const memberId of otherMembers) {
        await supabase.channel(`user:${memberId}`).send({
          type: 'broadcast',
          event: 'incoming-call',
          payload: {
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
      
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.currentTime = 0;
      
      // Navigate to chat page to show the active call
      navigate('/portal/chat', { state: { channelId: incomingCall.channelId } });
    } catch (error: any) {
      toast.error('Failed to join call: ' + error.message);
      setIncomingCall(null);
    }
  };

  const rejectCall = () => {
    setIncomingCall(null);
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
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
