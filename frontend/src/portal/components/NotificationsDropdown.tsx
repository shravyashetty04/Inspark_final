import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { supabase, Notification } from '../../lib/supabase';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

export default function NotificationsDropdown() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!profile) return;
    loadNotifications();

    const sub = supabase
      .channel('notifications_channel')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications', 
        filter: `user_id=eq.${profile.id}` 
      }, () => {
        loadNotifications();
      })
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [profile]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  };

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleNotificationClick = (n: Notification) => {
    markAsRead(n.id);
    setIsOpen(false);
    
    if (n.type === 'new_message' && n.related_channel_id) {
      navigate('/portal/chat', { state: { channelId: n.related_channel_id } });
    } else if ((n.type === 'meeting_invite' || n.type === 'meeting_reminder') && n.related_meeting_id) {
      navigate('/portal/meetings');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-full transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#1a1b3b]"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#1A1C1E] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="p-4 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-white font-medium">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-[#5458B3] bg-[#5458B3]/10 px-2 py-1 rounded-full">{unreadCount} new</span>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                No notifications yet.
              </div>
            ) : (
              notifications.map(n => (
                <div 
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${!n.is_read ? 'bg-white/[0.02]' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm ${!n.is_read ? 'text-white font-medium' : 'text-gray-300'}`}>{n.title}</span>
                    {!n.is_read && <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0"></span>}
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-gray-500 mt-2">{new Date(n.created_at).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
