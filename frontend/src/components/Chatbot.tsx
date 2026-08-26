import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Calendar } from 'lucide-react';
import { chatbotFlow, chatbotOptions } from '../data';

type Message = {
  sender: 'ai' | 'user';
  text: string;
  options?: string[];
  recommendation?: {
    title: string;
    tech: string[];
    timeline: string;
    roi: string;
  };
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: "👋 Hi! I'm inSpark AI Business Advisor. Tell me your top business goal, or select an option below:",
      options: chatbotOptions,
    },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>('');
  const hasLoggedRef = useRef(false);

  useEffect(() => {
    sessionIdRef.current = crypto.randomUUID();
  }, []);

  const logConversation = async (msgs: Message[]) => {
    if (hasLoggedRef.current || msgs.length <= 1) return;
    hasLoggedRef.current = true;
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/log-chatbot`;
      await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          messages: msgs.map((m) => ({ sender: m.sender, text: m.text, timestamp: new Date().toISOString() })),
        }),
      });
    } catch (err) {
      console.error('Chatbot log error:', err);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getResponse = (userText: string): Message => {
    for (const [key, val] of Object.entries(chatbotFlow)) {
      if (userText.includes(key)) {
        return { sender: 'ai', text: val.text, recommendation: val.recommendation };
      }
    }
    return {
      sender: 'ai',
      text: `Thank you for sharing: "${userText}". Our senior architect at inSpark will tailor a custom architecture blueprint for your exact goal. Would you like to schedule a free 30-minute consultation?`,
    };
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      const aiResponse = getResponse(text);
      setMessages((prev) => [...prev, aiResponse]);
    }, 600);
  };

  return (
    <>
      <button className="chatbot-fab" onClick={() => {
        if (isOpen) logConversation(messages);
        setIsOpen(!isOpen);
      }} aria-label="Chat with AI Advisor">
        {isOpen ? <X size={24} /> : <Bot size={26} />}
      </button>

      {isOpen && (
        <div className="chatbot-panel">
          {/* Header */}
          <div style={{
            padding: '16px 20px', background: 'linear-gradient(135deg, #7C3AED, #9333EA)',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={20} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: 0 }}>inSpark AI Business Advisor</h3>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} /> Online Now
              </span>
            </div>
            <button onClick={() => { logConversation(messages); setIsOpen(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}>
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map((msg, i) => (
              <div key={i}>
                <div style={{
                  display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                }}>
                  <div style={{
                    maxWidth: '85%', padding: '12px 16px', borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.sender === 'user' ? 'linear-gradient(135deg, #7C3AED, #9333EA)' : 'rgba(255,255,255,0.08)',
                    color: '#fff', fontSize: '13px', lineHeight: 1.5,
                    border: msg.sender === 'ai' ? '1px solid rgba(167,139,250,0.15)' : 'none',
                  }}>
                    {msg.text}
                  </div>
                </div>

                {/* Options */}
                {msg.options && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                    {msg.options.map((opt) => (
                      <button key={opt} onClick={() => handleSend(opt)} style={{
                        padding: '10px 14px', borderRadius: '10px', textAlign: 'left',
                        background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(167,139,250,0.2)',
                        color: '#e2e8f0', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(124,58,237,0.2)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.4)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(124,58,237,0.1)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.2)'; }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {/* Recommendation card */}
                {msg.recommendation && (
                  <div style={{
                    marginTop: '12px', padding: '16px', borderRadius: '14px',
                    background: 'rgba(22,18,52,0.8)', border: '1px solid rgba(167,139,250,0.2)',
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#c084fc', marginBottom: '10px' }}>
                      📋 {msg.recommendation.title}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                      {msg.recommendation.tech.map((t) => (
                        <span key={t} style={{
                          fontSize: '10px', fontWeight: 600, color: '#cbd5e1',
                          background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '10px',
                        }}>{t}</span>
                      ))}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                      <strong style={{ color: '#e2e8f0' }}>Timeline:</strong> {msg.recommendation.timeline}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                      <strong style={{ color: '#e2e8f0' }}>ROI:</strong> {msg.recommendation.roi}
                    </div>
                    <a href="#contact" onClick={() => { logConversation(messages); setIsOpen(false); }} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      marginTop: '12px', padding: '10px', borderRadius: '10px', textDecoration: 'none',
                      background: 'linear-gradient(135deg, #7C3AED, #9333EA)', color: '#fff',
                      fontSize: '12px', fontWeight: 700,
                    }}>
                      <Calendar size={14} /> Book Free Consultation
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: '16px', borderTop: '1px solid rgba(167,139,250,0.15)' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                placeholder="Type your message..."
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: '12px',
                  border: '1px solid rgba(167,139,250,0.2)', background: 'rgba(12,14,43,0.6)',
                  color: '#fff', fontSize: '13px', outline: 'none',
                }}
              />
              <button onClick={() => handleSend(input)} style={{
                width: '44px', height: '44px', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg, #7C3AED, #9333EA)', color: '#fff',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
