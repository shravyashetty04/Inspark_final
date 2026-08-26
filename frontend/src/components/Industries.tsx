import { industries, processSteps } from '../data';

export default function Industries() {
  return (
    <>
      {/* Industries */}
      <section id="industries" style={{ padding: '100px 0', background: '#0C0E2B', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 30% 50%, rgba(124,58,237,0.15) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{ display: 'inline-block', fontSize: '13px', color: '#c084fc', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px', background: 'rgba(192,132,252,0.12)', padding: '4px 16px', borderRadius: '20px', border: '1px solid rgba(192,132,252,0.25)' }}>Industries We Serve</span>
            <h2 style={{ color: '#fff', fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800 }}>
              Tailored Solutions for{' '}
              <span className="gradient-text">Every Industry</span>
            </h2>
            <p style={{ marginTop: '12px', fontSize: '1rem', color: '#94a3b8', maxWidth: '600px', margin: '12px auto 0' }}>
              We've delivered high-impact digital products across 12+ industries, each with domain-specific architecture and growth strategies.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {industries.map((ind) => (
              <div key={ind.name} className="industry-card" style={{
                padding: '28px', background: 'rgba(22,18,52,0.6)',
                backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(167,139,250,0.15)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '14px',
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(217,70,239,0.2))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <ind.icon size={24} color="#c084fc" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>{ind.name}</h3>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#e879f9', letterSpacing: '1px' }}>{ind.stat}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {ind.solutions.map((s) => (
                    <span key={s} style={{
                      fontSize: '11px', fontWeight: 600, color: '#cbd5e1',
                      background: 'rgba(255,255,255,0.06)', padding: '5px 12px', borderRadius: '16px',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="process" style={{ padding: '100px 0', background: '#fff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span style={{ display: 'inline-block', fontSize: '13px', color: '#7C3AED', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>How We Work</span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800, color: '#0f172a' }}>Our Proven 6-Step Process</h2>
            <p style={{ marginTop: '12px', fontSize: '1rem', color: '#475569', maxWidth: '600px', margin: '12px auto 0' }}>
              A transparent, battle-tested workflow that ensures predictable delivery and fast execution with zero surprises. Deliver fast without compromising quality.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
            {processSteps.map((step) => (
              <div key={step.num} style={{
                padding: '28px', borderRadius: '20px', background: '#fff',
                border: '1px solid #e2e8f0', position: 'relative',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#a78bfa'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(124,58,237,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '14px',
                    background: 'linear-gradient(135deg, #f3e8ff, #fdf4ff)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <step.icon size={24} color="#5B21B6" />
                  </div>
                  <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#e2e8f0' }}>{step.num}</span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>{step.title}</h3>
                <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
