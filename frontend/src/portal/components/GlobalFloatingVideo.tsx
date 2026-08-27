import React from 'react';
import { useRemoteParticipants, ParticipantTile, useLocalParticipant } from '@livekit/components-react';
import { ExternalLink, Maximize2, PhoneOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function GlobalFloatingVideo({ activeCall, endCall }: { activeCall: any, endCall: () => void }) {
  const participants = useRemoteParticipants();
  const { localParticipant } = useLocalParticipant();
  // Priority: First remote participant > Local participant
  const targetParticipant = participants[0] || localParticipant;

  const handlePiP = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Find the video element rendered by LiveKit within this container
    const videoContainer = (e.target as HTMLElement).closest('.floating-video-container');
    const videoEl = videoContainer?.querySelector('video');
    
    if (videoEl) {
       try {
         if (document.pictureInPictureElement) {
           await document.exitPictureInPicture();
         } else {
           await videoEl.requestPictureInPicture();
           toast.success('Video popped out! You can now switch tabs or apps.');
         }
       } catch (error: any) {
         console.error('PiP failed', error);
         toast.error('Picture-in-Picture failed: ' + error.message);
       }
    } else {
       toast.error('No video feed available to pop out.');
    }
  };

  if (!targetParticipant) return null;

  const returnLink = activeCall.isMeeting ? `/portal/meetings?room=${activeCall.roomName}` : '/portal/chat';

  return (
    <div className="fixed bottom-6 right-6 w-80 h-48 bg-black rounded-xl overflow-hidden shadow-2xl z-[9999] border-2 border-indigo-500/50 floating-video-container group transition-transform hover:scale-105">
      <ParticipantTile participant={targetParticipant} style={{ width: '100%', height: '100%' }} />
      
      {/* Overlay Controls on Hover */}
      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4">
        <div className="text-white text-xs font-semibold mb-3 truncate w-full text-center">
          {activeCall.callerName}
        </div>
        
        <div className="flex flex-col gap-2 w-full">
          <Link 
            to={returnLink}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Maximize2 size={16} /> Return to Full Screen
          </Link>
          
          <button 
            onClick={handlePiP}
            className="w-full bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            title="Pop out video to show over other apps (Desktop PiP)"
          >
            <ExternalLink size={16} /> Pop Out (Desktop)
          </button>
          
          <button 
            onClick={(e) => { e.preventDefault(); endCall(); }}
            className="w-full mt-1 bg-red-500/80 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <PhoneOff size={16} /> End Call
          </button>
        </div>
      </div>
    </div>
  );
}
