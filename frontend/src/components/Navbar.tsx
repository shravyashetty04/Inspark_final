import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: '#about', label: 'About' },
  { href: '#clients', label: 'Clients' },
  { href: '#team', label: 'Team' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#industries', label: 'Industries' },
  { href: '#process', label: 'Process' },
  { href: '#testimonials', label: 'Reviews' },
  { href: '#faq', label: 'FAQ' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 50,
          padding: scrolled ? '10px 0' : '16px 0',
          background: scrolled ? 'rgba(12, 14, 43, 0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(192, 132, 252, 0.12)' : '1px solid transparent',
          transition: 'all 0.3s ease',
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          {/* Logo image */}
          <a href="#" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <img
              src="/logo.png"
              alt="inSpark.in — Innovate. Design. Inspire."
              style={{ height: '56px', width: 'auto', objectFit: 'contain', display: 'block', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}
            />
          </a>

          {/* Desktop nav links */}
          <div
            className="desktop-links"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, justifyContent: 'center' }}
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  if (link.isRoute) {
                    e.preventDefault();
                    window.history.pushState({}, '', link.href);
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }
                }}
                style={{
                  color: '#cbd5e1', textDecoration: 'none', fontSize: '13.5px', fontWeight: 600,
                  padding: '7px 11px', borderRadius: '8px',
                  transition: 'color 0.2s ease, background 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#e879f9';
                  e.currentTarget.style.background = 'rgba(232,121,249,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#cbd5e1';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <a
              href="#contact"
              className="desktop-links"
              style={{
                padding: '9px 22px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #7C3AED, #9333EA)',
                color: '#fff', fontSize: '13.5px', fontWeight: 700, textDecoration: 'none',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(124,58,237,0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Contact Us
            </a>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="mobile-toggle"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: '6px', display: 'none' }}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="mobile-menu">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ background: 'rgba(255,255,255,0.85)', borderRadius: '8px', padding: '3px 6px' }}>
              <img
                src="/WhatsApp_Image_2026-07-20_at_11.07.36_AM-removebg-preview.png"
                alt="inSpark"
                style={{ height: '48px', width: 'auto' }}
              />
            </div>
          </div>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                if (link.isRoute) {
                  e.preventDefault();
                  window.history.pushState({}, '', link.href);
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }
                setMobileOpen(false);
              }}
              style={{
                display: 'block', padding: '14px 0', color: '#cbd5e1',
                textDecoration: 'none', fontSize: '16px', fontWeight: 600,
                borderBottom: '1px solid rgba(192,132,252,0.1)',
              }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setMobileOpen(false)}
            style={{
              display: 'block', marginTop: '10px', padding: '14px', textAlign: 'center',
              borderRadius: '10px', background: 'linear-gradient(135deg, #7C3AED, #9333EA)',
              color: '#fff', fontWeight: 700, textDecoration: 'none',
            }}
          >
            Contact Us
          </a>
        </div>
      )}
    </>
  );
}
