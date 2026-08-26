import { testimonials } from '../data';
import { Star, Quote } from 'lucide-react';

export default function Testimonials() {
  return (
    <section id="testimonials" style={{
      padding: '100px 0', position: 'relative', overflow: 'hidden',
      background: '#0C0E2B',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 50% 0%, rgba(122,34,167,0.2) 0%, rgba(12,14,43,0) 60%)',
        pointerEvents: 'none',
      }} />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span style={{ display: 'inline-block', fontSize: '13px', color: '#c084fc', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px', background: 'rgba(192,132,252,0.12)', padding: '4px 16px', borderRadius: '20px', border: '1px solid rgba(192,132,252,0.25)' }}>Client Testimonials</span>
          <h2 style={{ color: '#fff', fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800 }}>
            What Our{' '}
            <span className="gradient-text">Clients Say</span>
          </h2>
          <p style={{ marginTop: '12px', fontSize: '1rem', color: '#94a3b8', maxWidth: '600px', margin: '12px auto 0' }}>
            See what founders, CTOs, and product leaders say about collaborating with inSpark.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {testimonials.map((t) => (
            <div key={t.name} style={{
              padding: '32px', borderRadius: '20px',
              background: 'rgba(22,18,52,0.6)',
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(167,139,250,0.15)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(192,132,252,0.3)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(167,139,250,0.15)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={16} color="#fbbf24" fill="#fbbf24" />
                  ))}
                </div>
                <Quote size={28} color="rgba(167,139,250,0.3)" />
              </div>
              <p style={{ fontSize: '0.95rem', color: '#e2e8f0', lineHeight: 1.7, marginBottom: '20px' }}>"{t.comment}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7C3AED, #9333EA)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: '16px',
                }}>
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{t.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{t.role}, {t.company}</div>
                </div>
                <span style={{
                  marginLeft: 'auto', fontSize: '10px', fontWeight: 700,
                  color: '#c084fc', background: 'rgba(192,132,252,0.1)',
                  padding: '4px 10px', borderRadius: '12px',
                }}>
                  {t.projectType}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
