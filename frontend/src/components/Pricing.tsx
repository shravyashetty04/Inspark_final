import { useState } from 'react';
import { pricingData, additionalServices } from '../data';
import { Check, Star } from 'lucide-react';

export default function Pricing() {
  const [activeTab, setActiveTab] = useState(pricingData[0].id);
  const current = pricingData.find((p) => p.id === activeTab)!;

  return (
    <section id="pricing" style={{ padding: '100px 0', background: '#f8fafc' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{ display: 'inline-block', fontSize: '13px', color: '#7C3AED', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>Pricing Plans</span>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800, color: '#0f172a' }}>Transparent, Value-Driven Pricing</h2>
          <p style={{ marginTop: '12px', fontSize: '1rem', color: '#475569', maxWidth: '600px', margin: '12px auto 0' }}>Choose from our flexible packages designed to fit every budget and business size.</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '40px' }}>
          {pricingData.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              style={{
                padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.2s ease', border: '1px solid #e2e8f0',
                background: activeTab === cat.id ? 'linear-gradient(135deg, #7C3AED, #9333EA)' : '#fff',
                color: activeTab === cat.id ? '#fff' : '#475569',
                borderColor: activeTab === cat.id ? 'transparent' : '#e2e8f0',
                display: 'inline-flex', alignItems: 'center', gap: '6px',
              }}
            >
              <cat.icon size={16} /> {cat.category}
            </button>
          ))}
        </div>

        {/* Packages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {current.packages.map((pkg) => (
            <div key={pkg.name} style={{
              padding: '32px', borderRadius: '20px', background: '#fff',
              border: pkg.popular ? '2px solid #7C3AED' : '1px solid #e2e8f0',
              position: 'relative', transition: 'all 0.3s ease',
              boxShadow: pkg.popular ? '0 20px 40px rgba(124,58,237,0.15)' : 'none',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(124,58,237,0.12)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = pkg.popular ? '0 20px 40px rgba(124,58,237,0.15)' : 'none'; }}
            >
              {pkg.popular && (
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)' }}>
                  <span className="popular-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={10} fill="#fff" /> Most Popular
                  </span>
                </div>
              )}
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>{pkg.name}</h3>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#7C3AED', marginBottom: '8px' }}>{pkg.price}</div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px', minHeight: '40px' }}>{pkg.desc}</p>
              <div style={{ height: '1px', background: '#e2e8f0', marginBottom: '20px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {pkg.features.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={12} color="#7C3AED" strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: '0.875rem', color: '#334155' }}>{f}</span>
                  </div>
                ))}
              </div>
              <a href="#contact" style={{
                display: 'block', textAlign: 'center', padding: '12px', borderRadius: '10px',
                fontSize: '14px', fontWeight: 700, textDecoration: 'none',
                background: pkg.popular ? 'linear-gradient(135deg, #7C3AED, #9333EA)' : '#f3e8ff',
                color: pkg.popular ? '#fff' : '#7C3AED',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Get Started
              </a>
            </div>
          ))}
        </div>

        {/* Additional services */}
        <div style={{ marginTop: '56px', padding: '32px', borderRadius: '20px', background: '#fff', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '24px' }}>Additional Services</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {additionalServices.map((s) => (
              <span key={s} style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
                background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0',
              }}>
                <Check size={14} color="#7C3AED" /> {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
