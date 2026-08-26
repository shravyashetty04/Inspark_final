import { useState } from 'react';
import { contactServices } from '../data';
import { Send, CheckCircle2, Mail, Phone, MapPin, Calendar } from 'lucide-react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('Mobile App Development');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-enquiry`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, phone, service, message }),
      });
      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setSubmitted(true);
    } catch (err) {
      console.error('Enquiry submission error:', err);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" style={{
      padding: '90px 0', position: 'relative', overflow: 'hidden',
      backgroundColor: '#0C0E2B',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 50% 0%, rgba(122,34,167,0.25) 0%, rgba(12,14,43,0) 60%)',
        pointerEvents: 'none',
      }} />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px', color: '#c084fc', background: 'rgba(192,132,252,0.12)', padding: '4px 16px', borderRadius: '20px', border: '1px solid rgba(192,132,252,0.25)' }}>
            Ready to Grow Your Business?
          </span>
          <h2 style={{ color: '#fff', fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800 }}>
            Let's Build Something{' '}
            <span className="gradient-text">Extraordinary</span>
          </h2>
          <p style={{ color: '#94a3b8', marginTop: '12px', fontSize: '1rem', maxWidth: '600px', margin: '12px auto 0' }}>
            Have a new project, an existing application that needs upgrading, or an AI workflow you want to automate? Let's talk.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[900px] mx-auto">
          {/* Contact info */}
          <div>
            <h3 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '16px', color: '#fff' }}>Get in Touch with inSpark</h3>
            <p style={{ color: '#A0A0A0', fontSize: '15px', lineHeight: 1.6, marginBottom: '36px' }}>
              Have a new project, an existing application that needs upgrading, or an AI workflow you want to automate? Our team is ready to help you build something extraordinary.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { icon: Mail, label: 'Email Us', value: 'contact@insparktech.in' },
                { icon: Phone, label: 'Call Us', value: '+91 63600 93015' },
                { icon: MapPin, label: 'Visit Us', value: '1st Floor, 80 Feet Rd, 2nd Block, Nagarbhavi 1st Stage, Chandra Layout, Bengaluru, Karnataka 560072' },
                { icon: Calendar, label: 'Book a Call', value: 'Free 30-min consultation' },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: 'rgba(124,58,237,0.15)', color: '#c084fc',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <item.icon size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>{item.label}</div>
                    <div style={{ fontSize: '15px', color: '#fff', fontWeight: 700 }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div style={{
            padding: '32px', borderRadius: '20px',
            background: 'rgba(22,18,52,0.7)',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid #332761',
          }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: 'rgba(34,197,94,0.15)', margin: '0 auto 20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CheckCircle2 size={32} color="#22c55e" />
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>Enquiry Received!</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '24px' }}>
                  Your project enquiry for <strong style={{ color: '#c084fc' }}>{service}</strong> has been received by inSpark. Our technical director will reach out to <strong style={{ color: '#c084fc' }}>{email}</strong> shortly with a detailed proposal and call schedule.
                </p>
                <button onClick={() => { setSubmitted(false); setName(''); setEmail(''); setPhone(''); setMessage(''); }} style={{
                  padding: '10px 24px', borderRadius: '10px', border: '1px solid rgba(167,139,250,0.3)',
                  background: 'rgba(124,58,237,0.1)', color: '#c084fc', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                }}>
                  Send Another Enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px', color: '#E2E8F0' }}>Full Name</label>
                    <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px', color: '#E2E8F0' }}>Phone</label>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 63600 93015" style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px', color: '#E2E8F0' }}>Email Address</label>
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@company.com" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px', color: '#E2E8F0' }}>Service Required</label>
                  <select value={service} onChange={(e) => setService(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    {contactServices.map((s) => (
                      <option key={s} value={s} style={{ color: '#0f172a' }}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px', color: '#E2E8F0' }}>Project Overview / Requirements</label>
                  <textarea required rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us briefly about your goals, reference apps, target audience, or desired launch date..." style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <button type="submit" disabled={loading} style={{
                  padding: '14px', borderRadius: '12px', border: 'none',
                  background: 'linear-gradient(135deg, #7C3AED, #9333EA)',
                  color: '#fff', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  opacity: loading ? 0.7 : 1, transition: 'transform 0.2s ease',
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  {loading ? 'Sending...' : <>Send Enquiry <Send size={16} /></>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  fontSize: '14px',
  borderRadius: '10px',
  border: '1px solid rgba(167,139,250,0.2)',
  background: 'rgba(12,14,43,0.6)',
  color: '#fff',
  outline: 'none',
  transition: 'border-color 0.2s ease',
};
