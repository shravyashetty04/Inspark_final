import { ArrowRight, Play, Sparkles, Star, Globe } from 'lucide-react';

export default function Hero() {
  return (
    <section style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      background: '#0C0E2B',
      overflow: 'hidden',
      paddingTop: '100px',
      paddingBottom: '60px',
    }}>
      {/* Background glows */}
      <div style={{
        position: 'absolute', top: '-10%', right: '-5%',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)',
        filter: 'blur(55px)', pointerEvents: 'none', zIndex: 2,
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', left: '-5%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(217,70,239,0.15) 0%, transparent 70%)',
        filter: 'blur(55px)', pointerEvents: 'none', zIndex: 2,
      }} />

      {/* Stars */}
      <div className="stars-container">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className={`star star-${i + 1}`} />
        ))}
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 3, width: '100%' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div>
            <div
              className="fade-in-up"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '6px 16px', borderRadius: '20px',
                background: 'rgba(192, 132, 252, 0.1)',
                border: '1px solid rgba(192, 132, 252, 0.25)',
                marginBottom: '28px', cursor: 'pointer',
              }}
            >
              <Sparkles size={15} color="#e879f9" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>Introducing inSpark AI Growth Engine</span>
              <span style={{
                background: 'linear-gradient(135deg, #e879f9, #9333EA)',
                color: '#FFF', padding: '2px 10px', borderRadius: '10px',
                fontSize: '11px', fontWeight: 800, letterSpacing: '0.5px',
              }}>NEW</span>
            </div>

            <h1
              className="fade-in-up text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 tracking-tight"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Transforming Ideas into{' '}
              <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 400, color: '#e879f9' }}>Websites</span>,
              {' '}
              <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 400, color: '#e879f9' }}>Apps</span>
              {' '}& Digital Growth
            </h1>

            <p className="fade-in-up" style={{
              fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.7,
              maxWidth: '560px', marginBottom: '36px',
            }}>
              At InSpark Technologies, we help businesses establish a strong digital presence through innovative website development, mobile app development, digital marketing, branding, and custom software solutions. Our mission is to deliver high-quality, scalable, and result-driven digital solutions that help businesses grow faster.
            </p>

            <div className="fade-in-up" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <a href="#contact" style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                padding: '14px 30px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #7C3AED, #9333EA)',
                color: '#fff', fontSize: '15px', fontWeight: 700, textDecoration: 'none',
                boxShadow: '0 8px 30px rgba(124,58,237,0.4)',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Get Started <ArrowRight size={18} />
              </a>
              <a href="#pricing" style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                padding: '14px 30px', borderRadius: '12px',
                background: 'rgba(124,58,237,0.12)', color: '#e2e8f0',
                border: '1px solid rgba(167,139,250,0.25)',
                fontSize: '15px', fontWeight: 700, textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(124,58,237,0.2)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(124,58,237,0.12)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.25)'; }}
              >
                <Play size={16} /> View Pricing
              </a>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'flex', gap: '24px', marginTop: '40px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1,2,3,4,5].map(i => <Star key={i} size={16} color="#fbbf24" fill="#fbbf24" />)}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#cbd5e1' }}>420+ five-star projects</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={16} color="#7c3aed" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#cbd5e1' }}>Clients in 12+ countries</span>
              </div>
            </div>
          </div>

          {/* Right Content - Abstract visual */}
          <div className="hero-visual fade-in relative mt-12 lg:mt-0">
            <div className="dashboard-mock" style={{ animation: 'float 6s ease-in-out infinite' }}>
              <div style={{ background: '#1e1b4b', borderRadius: '14px', overflow: 'hidden' }}>
                {/* Top bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }} />
                  <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '8px' }}>inspark-dashboard</span>
                </div>
                {/* Content */}
                <div style={{ padding: '20px' }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {[
                      { label: 'Revenue', value: '₹4.2L', change: '+28%', color: '#22c55e' },
                      { label: 'Visitors', value: '12.4K', change: '+15%', color: '#a78bfa' },
                      { label: 'Conversions', value: '8.7%', change: '+3.2%', color: '#e879f9' },
                      { label: 'Avg Load', value: '0.4s', change: '-12%', color: '#3b82f6' },
                    ].map((stat) => (
                      <div key={stat.label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '14px' }}>
                        <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>{stat.label}</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>{stat.value}</div>
                        <div style={{ fontSize: '10px', color: stat.color, fontWeight: 700 }}>{stat.change}</div>
                      </div>
                    ))}
                  </div>
                  {/* Chart mock */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '16px', height: '140px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '12px' }}>Growth Analytics</div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '80px' }}>
                      {[40, 55, 35, 70, 50, 85, 60, 90, 75, 95, 80, 100].map((h, i) => (
                        <div key={i} style={{
                          flex: 1, height: `${h}%`, borderRadius: '4px 4px 0 0',
                          background: `linear-gradient(180deg, #a78bfa, #7C3AED)`,
                          opacity: 0.6 + (h / 200),
                        }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
