import { useState } from 'react';
import { faqs } from '../data';
import { ChevronDown, Search } from 'lucide-react';

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [search, setSearch] = useState('');

  const filtered = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section id="faq" style={{ padding: '100px 0', background: '#f8fafc' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ display: 'inline-block', fontSize: '13px', color: '#7C3AED', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>FAQ</span>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800, color: '#0f172a' }}>
            Frequently Asked{' '}
            <span style={{ background: 'linear-gradient(135deg, #7C3AED, #d946ef)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Questions</span>
          </h2>
          <p style={{ marginTop: '12px', fontSize: '1rem', color: '#475569' }}>Everything you need to know about working with inSpark.</p>
        </div>

        <div style={{ maxWidth: '600px', margin: '0 auto 48px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '14px 20px 14px 48px', fontSize: '14px',
              borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff',
              outline: 'none', transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#a78bfa')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
          />
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((faq, i) => (
            <div key={i} className="faq-item" style={{ background: '#fff' }}>
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                style={{
                  width: '100%', padding: '20px 24px', display: 'flex',
                  alignItems: 'center', justifyContent: 'space-between',
                  background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div>
                  <span style={{
                    display: 'inline-block', fontSize: '10px', fontWeight: 700,
                    color: '#7C3AED', background: '#f3e8ff', padding: '2px 8px',
                    borderRadius: '8px', marginBottom: '6px',
                  }}>{faq.category}</span>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{faq.question}</div>
                </div>
                <ChevronDown
                  size={20}
                  color="#7C3AED"
                  style={{
                    flexShrink: 0, marginLeft: '16px',
                    transform: openIdx === i ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease',
                  }}
                />
              </button>
              <div style={{
                maxHeight: openIdx === i ? '300px' : '0',
                overflow: 'hidden',
                transition: 'max-height 0.3s ease',
              }}>
                <p style={{ padding: '0 24px 20px', fontSize: '0.9rem', color: '#475569', lineHeight: 1.7 }}>
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>No questions found. Try a different search.</p>
          )}
        </div>
      </div>
    </section>
  );
}
