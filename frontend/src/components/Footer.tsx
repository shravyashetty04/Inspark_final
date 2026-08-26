import { useState } from 'react';
import { Sparkles, Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, CheckCircle2 } from 'lucide-react';

const footerServices = [
  'Website Development', 'Mobile App Development', 'Custom Software Development',
  'Digital Marketing', 'Branding & Creative Design', 'Cloud & IT Solutions',
];

const footerExplore = ['Case Studies', 'About & Team', 'Process', 'Pricing', 'Industries', 'FAQ'];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/subscribe-newsletter`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), source: 'footer' }),
      });
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setStatus('done');
      setEmail('');
    } catch (err) {
      console.error('Newsletter subscribe error:', err);
      setStatus('error');
    }
  };

  return (
    <footer style={{ background: '#0C0E2B', borderTop: '1px solid rgba(192,132,252,0.1)', padding: '64px 0 32px' }}>
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #7C3AED, #9333EA)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={20} color="#fff" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>
                  in<span style={{ color: '#e879f9' }}>Spark</span>.in
                </span>
                <span style={{ fontSize: '8.5px', color: '#7C3AED', opacity: 0.9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Innovate. Design. Inspire.
                </span>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, marginBottom: '20px', maxWidth: '260px' }}>
              We help businesses establish a strong digital presence through innovative website development, mobile app development, digital marketing, branding, and custom software solutions.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, i) => (
                <a key={i} href="#" style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(167,139,250,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#c084fc', textDecoration: 'none', transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(124,58,237,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(124,58,237,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px', color: '#fff' }}>Services</h4>
            <div style={{ display: 'grid', gap: '12px', fontSize: '14px' }}>
              {footerServices.map((s) => (
                <a key={s} href="#services" style={{ color: '#64748b', textDecoration: 'none', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#c084fc')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}>{s}</a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px', color: '#fff' }}>Explore</h4>
            <div style={{ display: 'grid', gap: '12px', fontSize: '14px' }}>
              {footerExplore.map((e) => (
                <a key={e} href={`#${e.toLowerCase().replace(/[^a-z]/g, '')}`} style={{ color: '#64748b', textDecoration: 'none', transition: 'color 0.2s ease' }}
                onMouseEnter={(e2) => (e2.currentTarget.style.color = '#c084fc')}
                onMouseLeave={(e2) => (e2.currentTarget.style.color = '#64748b')}>{e}</a>
              ))}
            </div>
          </div>

          {/* Newsletter + Contact */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px', color: '#fff' }}>Stay Updated</h4>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, marginBottom: '16px' }}>
              Subscribe to our newsletter for the latest tech insights, tips, and special offers.
            </p>
            {status === 'done' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <CheckCircle2 size={18} color="#22c55e" />
                <span style={{ fontSize: '13px', color: '#22c55e', fontWeight: 600 }}>You're subscribed!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    disabled={status === 'loading'}
                    style={{
                      width: '100%', padding: '10px 12px 10px 36px', fontSize: '13px',
                      borderRadius: '10px', border: '1px solid rgba(167,139,250,0.2)',
                      background: 'rgba(12,14,43,0.6)', color: '#fff', outline: 'none',
                    }}
                  />
                </div>
                <button type="submit" disabled={status === 'loading'} style={{
                  padding: '10px 18px', borderRadius: '10px', border: 'none',
                  background: 'linear-gradient(135deg, #7C3AED, #9333EA)', color: '#fff',
                  fontSize: '13px', fontWeight: 700, cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                  opacity: status === 'loading' ? 0.7 : 1, whiteSpace: 'nowrap',
                }}>
                  {status === 'loading' ? '...' : 'Subscribe'}
                </button>
              </form>
            )}
            {status === 'error' && (
              <p style={{ fontSize: '12px', color: '#ef4444', marginBottom: '16px' }}>Something went wrong. Please try again.</p>
            )}
            <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: '#64748b' }}>
              <div>contact@insparktech.in</div>
              <div>+91 63600 93015</div>
            </div>
          </div>
        </div>

        <div style={{
          paddingTop: '32px', borderTop: '1px solid rgba(192,132,252,0.1)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px',
        }}>
          <p style={{ fontSize: '13px', color: '#64748b' }}>© 2026 inSpark Technologies. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="/terms" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/terms'); window.dispatchEvent(new PopStateEvent('popstate')); }} style={{ fontSize: '13px', color: '#64748b', textDecoration: 'none' }}>Terms & Conditions</a>
            <a href="/privacy" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/privacy'); window.dispatchEvent(new PopStateEvent('popstate')); }} style={{ fontSize: '13px', color: '#64748b', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="/refund" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/refund'); window.dispatchEvent(new PopStateEvent('popstate')); }} style={{ fontSize: '13px', color: '#64748b', textDecoration: 'none' }}>Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
