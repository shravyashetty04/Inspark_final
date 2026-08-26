import { ArrowRight, Sparkles } from 'lucide-react';

const clientLogos = [
  { src: '/clients/image.png', alt: 'Rithamaya' },
  { src: '/clients/image copy.png', alt: 'Prep Pouch' },
  { src: '/clients/image copy 2.png', alt: 'Doorplants' },
  { src: '/clients/image copy 3.png', alt: 'Wifly' },
  { src: '/clients/ChatGPT_Image_Aug_3,_2026,_07_56_57_PM.png', alt: 'Client brand' },
  { src: '/clients/ChatGPT_Image_Jul_28,_2026,_09_53_38_PM.png', alt: 'Client brand' },
];

export default function Clients() {
  const logos = [...clientLogos, ...clientLogos];

  return (
    <section id="clients" style={{
      padding: '88px 0',
      position: 'relative',
      overflow: 'hidden',
      background: '#0C0E2B',
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(circle at 50% 50%, rgba(14,165,233,0.1), transparent 58%)',
      }} />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            fontSize: '13px', color: '#67e8f9', fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: '2px',
            background: 'rgba(34,211,238,0.1)', padding: '5px 16px',
            borderRadius: '20px', border: '1px solid rgba(34,211,238,0.22)',
          }}>
            <Sparkles size={14} /> Our Clients
          </span>
          <h2 style={{
            color: '#fff', fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
            fontWeight: 800, marginTop: '16px',
          }}>
            Brands That <span style={{ color: '#67e8f9' }}>Trust inSpark</span>
          </h2>
          <p style={{
            margin: '12px auto 0', fontSize: '1rem', color: '#94a3b8',
            maxWidth: '600px', lineHeight: 1.6,
          }}>
            We help ambitious businesses turn bold ideas into memorable digital experiences.
          </p>
        </div>

        <div className="clients-marquee" aria-label="Our clients">
          <div className="clients-marquee-track">
            {logos.map((logo, index) => (
              <div className="client-logo-card" key={`${logo.src}-${index}`}>
                <img src={logo.src} alt={logo.alt} loading="lazy" />
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '34px' }}>
          <a href="#contact" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            color: '#67e8f9', textDecoration: 'none', fontSize: '14px', fontWeight: 800,
          }}>
            Build your next success story <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
