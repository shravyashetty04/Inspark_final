import { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useCall } from './CallContext';
import { useLocation } from 'react-router-dom';
import { supabase, ChatChannel, ChatMessage, EmployeeProfile } from '../lib/supabase';
import { X, Users, Search, Send, Plus, MessageSquare, Phone, Video, Mic, MicOff, Camera, CameraOff, MonitorUp, Loader2 } from 'lucide-react';
import { LiveKitRoom, GridLayout, ParticipantTile, RoomAudioRenderer, useTracks, useLocalParticipant, FocusLayout } from '@livekit/components-react';
import { Track } from 'livekit-client';
import '@livekit/components-styles';
import toast from 'react-hot-toast';

// Helper to format time
const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function ChatPage() {
  const { profile } = useAuth();
  const [channels, setChannels] = useState<(ChatChannel & { other_user?: EmployeeProfile })[]>([]);
  const [activeChannel, setActiveChannel] = useState<(ChatChannel & { other_user?: EmployeeProfile }) | null>(null);
  const [messages, setMessages] = useState<(ChatMessage & { sender?: EmployeeProfile })[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState<EmployeeProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'channels' | 'new_dm' | 'new_group'>('channels');
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<EmployeeProfile[]>([]);
  const location = useLocation();
  
  // Call State from Context
  const { activeCall, callToken, startCall, endCall } = useCall();
  const serverUrl = import.meta.env.VITE_LIVEKIT_URL;
  
  // Local state for initiating a call to show spinner
  const [callInitiating, setCallInitiating] = useState<boolean>(false);
  const [initiatingType, setInitiatingType] = useState<'audio'|'video'|null>(null);
  const [showChatInCall, setShowChatInCall] = useState(false);

  const handleCall = async (type: 'audio' | 'video') => {
    if (!activeChannel || !profile) return;
    setCallInitiating(true);
    setInitiatingType(type);
    try {
      const { data } = await supabase.from('chat_members').select('employee_id').eq('channel_id', activeChannel.id);
      const memberIds = data?.map(d => d.employee_id) || [];
      const channelName = activeChannel.type === 'direct' ? profile.full_name || 'Colleague' : activeChannel.name || 'Group Chat';
      
      await startCall(activeChannel.id, type, memberIds, channelName);
    } finally {
      setCallInitiating(false);
      setInitiatingType(null);
    }
  };
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeChannel) {
      scrollToBottom();
    }
  }, [messages, activeChannel]);

  useEffect(() => {
    if (profile) {
      loadChannels();
      loadUsers();
    }
  }, [profile]);

  // Auto-select channel if navigating from incoming call or active call exists
  useEffect(() => {
    if (channels.length > 0) {
      const targetChannelId = location.state?.channelId || activeCall?.channelId;
      if (targetChannelId && (!activeChannel || activeChannel.id !== targetChannelId)) {
        const chan = channels.find(c => c.id === targetChannelId);
        if (chan) {
          setActiveChannel(chan);
        }
      }
    }
  }, [channels, location.state, activeCall, activeChannel]);

  useEffect(() => {
    if (activeChannel && profile) {
      loadMessages(activeChannel.id);
      
      // Subscribe to new messages
      const subscription = supabase
        .channel(`public:chat_messages:channel_id=eq.${activeChannel.id}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages',
          filter: `channel_id=eq.${activeChannel.id}`
        }, (payload) => {
          const newMsg = payload.new as ChatMessage;
          // Fetch sender details
          supabase.from('employee_profiles').select('*').eq('id', newMsg.sender_id).single()
            .then(({ data }) => {
              if (data) {
                setMessages(prev => [...prev, { ...newMsg, sender: data as EmployeeProfile }]);
              } else {
                setMessages(prev => [...prev, newMsg]);
              }
            });
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [activeChannel, profile]);

  const loadChannels = async () => {
    if (!profile) return;
    
    // Get channels where user is a member
    const { data: memberChannels, error: memberError } = await supabase
      .from('chat_members')
      .select('channel_id')
      .eq('employee_id', profile.id);

    if (memberError) {
      console.error('Error fetching member channels:', memberError);
      return;
    }

    if (!memberChannels || memberChannels.length === 0) {
      setChannels([]);
      return;
    }

    const channelIds = memberChannels.map(mc => mc.channel_id);

    // Get channel details
    const { data: channelsData, error: channelsError } = await supabase
      .from('chat_channels')
      .select('*')
      .in('id', channelIds)
      .order('created_at', { ascending: false });

    if (channelsError) {
      console.error('Error fetching channels:', channelsError);
      return;
    }

    // For direct messages, figure out who the other user is
    const enrichedChannels = await Promise.all(channelsData.map(async (channel) => {
      if (channel.type === 'direct') {
        const { data: otherMember } = await supabase
          .from('chat_members')
          .select('employee_id')
          .eq('channel_id', channel.id)
          .neq('employee_id', profile.id)
          .single();
          
        if (otherMember) {
          const { data: userProfile } = await supabase
            .from('employee_profiles')
            .select('*')
            .eq('id', otherMember.employee_id)
            .single();
          
          return { ...channel, other_user: userProfile as EmployeeProfile };
        }
      }
      return channel;
    }));

    // Deduplicate DMs (keep newest)
    const uniqueChannels = [];
    const dmUserIds = new Set<string>();

    for (const channel of enrichedChannels) {
      if (channel.type === 'direct' && channel.other_user) {
        if (!dmUserIds.has(channel.other_user.id)) {
          dmUserIds.add(channel.other_user.id);
          uniqueChannels.push(channel);
        }
      } else {
        uniqueChannels.push(channel);
      }
    }

    setChannels(uniqueChannels as any);
  };

  const loadUsers = async () => {
    if (!profile) return;
    const { data, error } = await supabase
      .from('employee_profiles')
      .select('*')
      .neq('id', profile.id)
      .order('full_name');
      
    if (data && !error) {
      setUsers(data);
    }
  };

  const loadMessages = async (channelId: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        sender:employee_profiles(*)
      `)
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true });

    if (data && !error) {
      // Supabase join syntax gives an array or single object for sender. Handle it.
      const formatted = data.map(msg => ({
        ...msg,
        sender: Array.isArray(msg.sender) ? msg.sender[0] : msg.sender
      }));
      setMessages(formatted as any);
    }
  };

  const startDirectMessage = async (otherUser: EmployeeProfile) => {
    if (!profile) return;
    
    // Check if DM already exists
    const existingChannel = channels.find(c => c.type === 'direct' && c.other_user?.id === otherUser.id);
    
    if (existingChannel) {
      setActiveChannel(existingChannel);
      setView('channels');
      return;
    }

    // Create new channel
    const { data: channelData, error: channelError } = await supabase
      .from('chat_channels')
      .insert({ type: 'direct', created_by: profile.id })
      .select()
      .single();

    if (channelError || !channelData) {
      toast.error('Failed to create chat');
      return;
    }

    // Add members
    await supabase.from('chat_members').insert([
      { channel_id: channelData.id, employee_id: profile.id },
      { channel_id: channelData.id, employee_id: otherUser.id }
    ]);

    await loadChannels();
    const newChan = { ...channelData, other_user: otherUser };
    setActiveChannel(newChan);
    setView('channels');
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChannel || !profile) return;

    const content = newMessage;
    setNewMessage(''); // optimistic clear

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        channel_id: activeChannel.id,
        sender_id: profile.id,
        content: content
      });

    if (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setNewMessage(content); // revert
    }
  };

  // The local joinCall function is no longer needed since we use handleCall which calls startCall in context.

  const renderChatContent = () => (
    <>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, idx) => {
          const isMe = profile && msg.sender_id === profile.id;
          const showHeader = idx === 0 || messages[idx-1].sender_id !== msg.sender_id;
          
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              {showHeader && (
                <div className="text-xs text-gray-500 mb-1 ml-1 mr-1">
                  {isMe ? 'You' : msg.sender?.full_name} • {formatTime(msg.created_at)}
                </div>
              )}
              <div className={`px-5 py-3 rounded-2xl max-w-[75%] text-[15px] ${
                isMe 
                  ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white rounded-br-sm' 
                  : 'bg-white/10 text-gray-200 rounded-bl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <div className="p-4 bg-[#11122a] border-t border-white/10">
        <form onSubmit={sendMessage} className="relative flex items-center max-w-4xl mx-auto">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Message..."
            className="w-full bg-white/5 border border-white/10 text-white rounded-full pl-5 pr-14 py-3 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all text-[14px]"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="absolute right-1.5 p-2 text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 transition-colors rounded-full"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </>
  );

  const createGroup = async () => {
    if (!profile || !groupName.trim() || selectedUsers.length === 0) return;

    // Create group channel
    const { data: channelData, error: channelError } = await supabase
      .from('chat_channels')
      .insert({ type: 'group', name: groupName.trim(), created_by: profile.id })
      .select()
      .single();

    if (channelError || !channelData) {
      toast.error('Failed to create group');
      return;
    }

    // Add members (creator + selected)
    const membersToInsert = [
      { channel_id: channelData.id, employee_id: profile.id },
      ...selectedUsers.map(u => ({ channel_id: channelData.id, employee_id: u.id }))
    ];

    const { error: membersError } = await supabase.from('chat_members').insert(membersToInsert);
    
    if (membersError) {
      toast.error('Failed to add members');
      return;
    }

    await loadChannels();
    setActiveChannel(channelData);
    setView('channels');
    setGroupName('');
    setSelectedUsers([]);
  };

  const toggleUserSelection = (user: EmployeeProfile) => {
    if (selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const filteredUsers = users.filter(u => u.full_name.toLowerCase().includes(searchQuery.toLowerCase()));

  // If not logged in, don't show page
  if (!profile) return null;

  return (
    <div className="h-[calc(100vh-8rem)] bg-[#1a1b3b] border border-white/10 rounded-2xl shadow-2xl flex overflow-hidden">
      
      {/* Sidebar / Channels List */}
      <div className={`w-80 border-r border-white/10 flex flex-col ${activeChannel ? 'hidden md:flex' : 'flex'}`}>
        <div className="bg-[#11122a] p-4 border-b border-white/10 flex items-center justify-between">
          <div className="font-semibold text-white text-lg">Messages</div>
        </div>

        {view === 'channels' ? (
          <>
            <div className="p-4 border-b border-white/5 flex gap-2">
              <button 
                onClick={() => setView('new_dm')}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white text-sm py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Plus size={16} /> Chat
              </button>
              <button 
                onClick={() => { setView('new_group'); setSelectedUsers([]); setGroupName(''); setSearchQuery(''); }}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white text-sm py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Users size={16} /> Group
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {channels.length === 0 ? (
                <div className="text-center text-gray-500 mt-10 text-sm">
                  No conversations yet.<br/>Start a new Chat or Group!
                </div>
              ) : (
                channels.map(channel => (
                  <button
                    key={channel.id}
                    onClick={() => setActiveChannel(channel)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${activeChannel?.id === channel.id ? 'bg-white/10' : 'hover:bg-white/5'}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500/20 to-pink-500/20 flex items-center justify-center text-purple-300 font-medium">
                      {channel.type === 'direct' ? channel.other_user?.full_name.charAt(0) : <Users size={18} />}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="text-white text-sm font-medium truncate">
                        {channel.type === 'direct' ? channel.other_user?.full_name : channel.name}
                      </div>
                      <div className="text-gray-500 text-xs truncate">
                        {channel.type === 'direct' ? channel.other_user?.department || 'Employee' : 'Group'}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        ) : view === 'new_dm' ? (
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-white/5 flex gap-2 items-center">
              <button onClick={() => setView('channels')} className="text-gray-400 hover:text-white">
                ←
              </button>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text"
                  placeholder="Search team..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {filteredUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => startDirectMessage(user)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-white font-medium">
                    {user.full_name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">{user.full_name}</div>
                    <div className="text-gray-500 text-xs">{user.department || user.role}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : view === 'new_group' ? (
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-white/5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <button onClick={() => setView('channels')} className="text-gray-400 hover:text-white">
                  ←
                </button>
                <div className="font-medium text-white">Create Group</div>
              </div>
              <input 
                type="text"
                placeholder="Group Name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text"
                  placeholder="Search users to add..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedUsers.map(u => (
                    <span key={u.id} className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-md flex items-center gap-1">
                      {u.full_name}
                      <button onClick={() => toggleUserSelection(u)}><X size={12} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {filteredUsers.map(user => {
                const isSelected = selectedUsers.find(u => u.id === user.id);
                return (
                  <button
                    key={user.id}
                    onClick={() => toggleUserSelection(user)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors text-left ${isSelected ? 'bg-purple-500/10 border border-purple-500/30' : 'hover:bg-white/5 border border-transparent'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-white font-medium">
                        {user.full_name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">{user.full_name}</div>
                        <div className="text-gray-500 text-xs">{user.department || user.role}</div>
                      </div>
                    </div>
                    {isSelected && <div className="w-4 h-4 rounded-full bg-purple-500 mr-2" />}
                  </button>
                );
              })}
            </div>
            <div className="p-4 border-t border-white/5">
              <button 
                onClick={createGroup}
                disabled={!groupName.trim() || selectedUsers.length === 0}
                className="w-full bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Group
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-[#0C0E2B]/50 ${!activeChannel ? 'hidden md:flex' : 'flex'}`}>
        {activeChannel ? (
          <>
            {/* Active Chat Header */}
            <div className="bg-[#11122a] p-4 flex items-center justify-between border-b border-white/10 h-[69px]">
              <div className="flex items-center">
                <button 
                  onClick={() => setActiveChannel(null)} 
                  className="md:hidden text-gray-400 hover:text-white mr-3"
                >
                  ←
                </button>
                <div className="font-semibold text-white text-lg">
                  {activeChannel.type === 'direct' ? activeChannel.other_user?.full_name : activeChannel.name}
                </div>
              </div>
              
              {/* Call Buttons */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleCall('audio')}
                  disabled={callInitiating || !!activeCall}
                  className="p-2 text-gray-400 hover:text-purple-400 bg-white/5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                  title="Audio Call"
                >
                  {callInitiating && initiatingType === 'audio' ? <Loader2 size={18} className="animate-spin" /> : <Phone size={18} />}
                </button>
                <button 
                  onClick={() => handleCall('video')}
                  disabled={callInitiating || !!activeCall}
                  className="p-2 text-gray-400 hover:text-purple-400 bg-white/5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                  title="Video Call"
                >
                  {callInitiating && initiatingType === 'video' ? <Loader2 size={18} className="animate-spin" /> : <Video size={18} />}
                </button>
              </div>
            </div>

            {activeCall?.channelId === activeChannel.id && callToken ? (
              <div className="flex-1 flex flex-row overflow-hidden border-b border-white/10 relative">
                <div className="flex-1 w-full bg-black relative flex flex-col">
                  <div className="absolute top-4 right-4 z-50">
                    <button 
                      onClick={endCall}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-lg"
                    >
                      End Call
                    </button>
                  </div>
                  <LiveKitRoom
                    video={activeCall.type === 'video'}
                    audio={true}
                    token={callToken}
                    serverUrl={serverUrl}
                    data-lk-theme="default"
                    style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                    onDisconnected={endCall}
                  >
                    <ChatVideoConference 
                      initialVideo={activeCall.type === 'video'} 
                      onToggleChat={() => setShowChatInCall(!showChatInCall)}
                      isChatOpen={showChatInCall}
                    />
                    <RoomAudioRenderer />
                  </LiveKitRoom>
                </div>
                {showChatInCall && (
                  <div className="w-80 md:w-96 flex flex-col bg-[#0C0E2B]/95 backdrop-blur-md border-l border-white/10 h-full absolute right-0 top-0 bottom-0 z-40 md:relative">
                    <div className="p-3 border-b border-white/10 flex justify-between items-center md:hidden">
                      <span className="text-white font-medium">Chat</span>
                      <button onClick={() => setShowChatInCall(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
                    </div>
                    {renderChatContent()}
                  </div>
                )}
              </div>
            ) : (
              renderChatContent()
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 flex-col gap-4">
            <MessageSquare size={48} className="text-gray-700" />
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
function ChatVideoConference({ initialVideo, onToggleChat, isChatOpen }: { initialVideo: boolean, onToggleChat: () => void, isChatOpen: boolean }) {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );
  
  const screenShareTrack = tracks.find(t => t.source === Track.Source.ScreenShare);

  return (
    <div className="flex flex-col h-full w-full">
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
        <ChatControlBar initialVideo={initialVideo} onToggleChat={onToggleChat} isChatOpen={isChatOpen} />
      </div>
    </div>
  );
}

function ChatControlBar({ initialVideo, onToggleChat, isChatOpen }: { initialVideo: boolean, onToggleChat: () => void, isChatOpen: boolean }) {
  const { localParticipant } = useLocalParticipant();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(initialVideo);
  const [isScreenOn, setIsScreenOn] = useState(false);

  // Initialize camera state based on call type
  useEffect(() => {
    if (localParticipant) {
      localParticipant.setCameraEnabled(initialVideo);
    }
  }, [localParticipant, initialVideo]);

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
        className={`p-3 rounded-full flex items-center justify-center transition-colors ${
          isMicOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
      >
        {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
      </button>

      <button 
        onClick={toggleCam}
        className={`p-3 rounded-full flex items-center justify-center transition-colors ${
          isCamOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
      >
        {isCamOn ? <Camera size={20} /> : <CameraOff size={20} />}
      </button>

      <button 
        onClick={toggleScreen}
        className={`p-3 rounded-full flex items-center justify-center transition-colors ${
          isScreenOn ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
        }`}
        title="Share Screen"
      >
        <MonitorUp size={20} />
      </button>

      {/* Chat Toggle Button */}
      <button 
        onClick={onToggleChat}
        className={`p-3 rounded-full flex items-center justify-center transition-colors ${
          isChatOpen ? 'bg-purple-500 hover:bg-purple-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
        }`}
        title="Toggle Chat"
      >
        <MessageSquare size={20} />
      </button>
    </div>
  );
}
