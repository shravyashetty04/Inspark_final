import { services, whyChooseItems, teamRoles, stats } from '../data';
import { Target, Eye, CheckCircle2 } from 'lucide-react';

export default function About() {
  return (
    <>
      {/* About section */}
      <section id="about" style={{
        padding: '100px 0', position: 'relative', overflow: 'hidden',
        background: '#0C0E2B', color: '#fff',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 50% 30%, rgba(122,34,167,0.25) 0%, rgba(12,14,43,0.85) 60%, #0C0E2B 100%)',
          pointerEvents: 'none', zIndex: 0,
        }} />
        <div className="stars-container">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className={`star star-${i + 1}`} />
          ))}
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 3 }}>
          <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center', marginBottom: '48px' }}>
            <span style={{
              display: 'inline-block', fontSize: '13px', color: '#c084fc', fontWeight: 800,
              textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px',
              background: 'rgba(192,132,252,0.12)', padding: '4px 16px', borderRadius: '20px',
              border: '1px solid rgba(192,132,252,0.25)',
            }}>About InSpark</span>
            <h2 style={{ color: '#fff', fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800, marginTop: '8px' }}>
              We Combine Strategy, Technology & Design to Create{' '}
              <span style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #e879f9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Impactful Experiences
              </span>
            </h2>
            <p style={{ marginTop: '16px', fontSize: '1rem', color: '#cbd5e1', lineHeight: 1.75 }}>
              InSpark is a technology and digital solutions company dedicated to helping startups, SMEs, and enterprises achieve their business goals through innovation and creativity. Whether it's developing a responsive website, building a mobile application, or executing a data-driven marketing campaign, our team delivers solutions that drive measurable results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {[
              { icon: Target, title: 'Our Mission', text: 'To empower businesses with innovative digital solutions that enhance growth, improve customer experiences, and create lasting value.' },
              { icon: Eye, title: 'Our Vision', text: "To become one of India's most trusted technology partners by delivering innovative, reliable, and future-ready digital solutions." },
            ].map((card) => (
              <div key={card.title} style={{
                padding: '28px', background: 'rgba(22,18,52,0.7)',
                backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid #332761', borderRadius: '20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '12px',
                    background: 'rgba(167,139,250,0.15)', color: '#c084fc',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <card.icon size={22} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>{card.title}</h3>
                </div>
                <p style={{ fontSize: '0.95rem', color: '#cbd5e1', lineHeight: 1.7, margin: 0 }}>{card.text}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center', padding: '24px', background: 'rgba(22,18,52,0.5)', borderRadius: '16px', border: '1px solid rgba(167,139,250,0.15)' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, background: 'linear-gradient(135deg, #a78bfa, #e879f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stat.metric}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>{stat.label}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services section */}
      <section id="services" style={{ padding: '100px 0', background: '#fff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span style={{ display: 'inline-block', fontSize: '13px', color: '#7C3AED', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>What We Do</span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800, color: '#0f172a' }}>Our Digital Services</h2>
            <p style={{ marginTop: '12px', fontSize: '1rem', color: '#475569', maxWidth: '600px', margin: '12px auto 0' }}>Comprehensive digital solutions to help your business grow, scale, and dominate your market.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.title} style={{
                padding: '32px', borderRadius: '20px', background: '#fff',
                border: '1px solid #e2e8f0', transition: 'all 0.3s ease',
                display: 'flex', flexDirection: 'column',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#a78bfa'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(124,58,237,0.1)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px',
                  background: 'linear-gradient(135deg, #f3e8ff, #fdf4ff)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px',
                }}>
                  <service.icon size={26} color="#7C3AED" />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>{service.title}</h3>
                <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, marginBottom: '16px', flex: 1 }}>{service.desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {service.features.map((f) => (
                    <span key={f} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      fontSize: '11px', fontWeight: 600, color: '#7C3AED',
                      background: '#f3e8ff', padding: '4px 10px', borderRadius: '20px',
                    }}>
                      <CheckCircle2 size={11} /> {f}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section style={{ padding: '100px 0', position: 'relative', overflow: 'hidden', backgroundColor: '#0C0E2B' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(124,58,237,0.2) 0%, rgba(12,14,43,0.9) 70%)',
          pointerEvents: 'none',
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{
              display: 'inline-block', fontSize: '13px', color: '#fff', fontWeight: 800,
              textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px',
              background: 'rgba(192,132,252,0.3)', padding: '4px 16px', borderRadius: '20px',
              border: '1px solid rgba(192,132,252,0.5)',
            }}>Why Choose Us</span>
            <h2 style={{ color: '#fff', fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800 }}>
              Partner with InSpark for{' '}
              <span className="gradient-text">Unmatched Quality</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {whyChooseItems.map((item) => (
              <div key={item.title} className="glass-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: 'rgba(167,139,250,0.15)', color: '#c084fc',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <item.icon size={20} />
                </div>
                <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc' }}>{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team section */}
      <section id="team" style={{
        padding: '100px 0', scrollMarginTop: '100px', position: 'relative', overflow: 'hidden',
        backgroundColor: '#0C0E2B',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 50% 30%, rgba(122,34,167,0.35) 0%, rgba(12,14,43,0.9) 60%, #0C0E2B 100%)',
          pointerEvents: 'none', zIndex: 0,
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center', marginBottom: '56px' }}>
            <span style={{
              display: 'inline-block', fontSize: '13px', color: '#c084fc', fontWeight: 800,
              textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px',
              background: 'rgba(192,132,252,0.12)', padding: '4px 16px', borderRadius: '20px',
              border: '1px solid rgba(192,132,252,0.25)',
            }}>Meet the Team</span>
            <h2 style={{ color: '#fff', fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800, marginTop: '8px' }}>
              The Experts Behind{' '}
              <span style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #e879f9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Every Success
              </span>
            </h2>
            <p style={{ marginTop: '16px', fontSize: '1rem', color: '#cbd5e1', lineHeight: 1.75 }}>
              Our success is driven by a passionate team of designers, developers, marketers, and strategists who work together to deliver exceptional digital solutions.
            </p>
          </div>

          {/* Team cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className={member.name === 'Chandana' ? 'team-card-slide-up' : undefined}
                style={{
                  borderRadius: '20px', overflow: 'hidden',
                  background: 'rgba(22,18,52,0.7)',
                  backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(167,139,250,0.15)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.borderColor = 'rgba(192,132,252,0.35)';
                  e.currentTarget.style.boxShadow = '0 20px 50px rgba(124,58,237,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(167,139,250,0.15)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Photo */}
                <div style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden' }}>
                  <img
                    src={member.photo}
                    alt={member.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
                  />
                  {/* Gradient overlay */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
                    background: 'linear-gradient(to top, rgba(12,14,43,0.85), transparent)',
                    pointerEvents: 'none',
                  }} />
                  {/* Department badge */}
                  <span style={{
                    position: 'absolute', top: '12px', right: '12px',
                    fontSize: '10px', fontWeight: 800, letterSpacing: '0.5px',
                    color: '#fff', background: 'linear-gradient(135deg, #7C3AED, #9333EA)',
                    padding: '4px 10px', borderRadius: '20px',
                  }}>
                    {member.dept}
                  </span>
                </div>
                {/* Info */}
                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
                    {member.name}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#c084fc', fontWeight: 600, marginBottom: '10px' }}>
                    {member.role}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.55, marginBottom: '16px' }}>
                    {member.bio}
                  </p>
                  {/* Skills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {member.skills.map((skill) => (
                      <span key={skill} style={{
                        fontSize: '10px', fontWeight: 600, color: '#a78bfa',
                        background: 'rgba(167,139,250,0.1)', padding: '3px 9px', borderRadius: '12px',
                        border: '1px solid rgba(167,139,250,0.2)',
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Roles strip */}
          <div style={{ marginTop: '56px', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '20px' }}>
              Also includes specialists in
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
              {teamRoles.map((role) => (
                <span key={role} style={{
                  background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)',
                  padding: '9px 18px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600,
                  color: '#e2e8f0', border: '1px solid rgba(167,139,250,0.2)',
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a78bfa', flexShrink: 0 }} />
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const teamMembers = [
  {
    name: 'Sharath Gowda',
    role: 'Founder & CEO',
    dept: 'Leadership',
    photo: '/WhatsApp_Image_2026-08-03_at_4.04.40_PM.jpeg',
    bio: 'Visionary entrepreneur leading inSpark with a passion for technology and innovation. Drives company strategy and client relationships.',
    skills: ['Leadership', 'Strategy', 'Business Dev'],
  },
  {
    name: 'Vidyashree',
    role: 'Sr App Developer',
    dept: 'Engineering',
    photo: '/Team/my_photo_(1).jpg.jpeg',
    bio: 'Senior application developer with deep expertise in building scalable mobile and web applications. Leads complex project architectures.',
    skills: ['React', 'Flutter', 'Node.js', 'Mobile Apps'],
  },
  {
    name: 'Chandana',
    role: 'Full Stack Developer',
    dept: 'Engineering',
    photo: '/Team/WhatsApp_Image_2026-08-13_at_12.20.26_PM.jpeg',
    bio: 'Full stack developer skilled in building end-to-end web applications. Handles both front-end interfaces and back-end APIs, delivering complete, production-ready solutions.',
    skills: ['React', 'Node.js', 'PostgreSQL', 'Tailwind'],
  },
  {
    name: 'Shravya Shetty',
    role: 'Jr Full Stack Developer',
    dept: 'Engineering',
    photo: '/shreya_shetty.webp',
    bio: 'Junior full stack developer building clean, responsive web applications. Eager to learn and passionate about delivering pixel-perfect front-end and reliable back-end solutions.',
    skills: ['React', 'JavaScript', 'Node.js', 'Tailwind'],
  },
  {
    name: 'Nachiket K R',
    role: 'Sr Full Stack Developer',
    dept: 'Engineering',
    photo: 'https://images.pexels.com/photos/7752846/pexels-photo-7752846.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop',
    bio: 'Senior full stack developer architecting robust, scalable web platforms. Leads end-to-end development from database design to polished user interfaces.',
    skills: ['Next.js', 'Node.js', 'TypeScript', 'AWS'],
  },
  {
    name: 'Surya',
    role: 'Digital Marketing Executive',
    dept: 'Marketing',
    photo: 'https://images.pexels.com/photos/5528969/pexels-photo-5528969.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop',
    bio: 'Digital marketing executive driving growth through data-driven campaigns. Manages SEO, Google Ads, and social media strategies to boost online visibility.',
    skills: ['SEO', 'Google Ads', 'Meta Ads', 'Analytics'],
  },
  {
    name: 'Naveen Kumar',
    role: 'Digital Marketing Executive',
    dept: 'Marketing',
    photo: 'https://images.pexels.com/photos/5308640/pexels-photo-5308640.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop',
    bio: 'Digital marketing executive specializing in performance marketing and lead generation. Runs targeted ad campaigns and optimizes funnels for maximum ROI.',
    skills: ['Performance Marketing', 'Google Ads', 'Funnel Optimization', 'Analytics'],
  },
  {
    name: 'Ranjitha',
    role: 'Social Media Content Creator',
    dept: 'Marketing',
    photo: '/ranjitha.webp',
    bio: 'Creative content creator crafting engaging social media posts, reels, and visual stories. Builds brand presence across Instagram, LinkedIn, and more.',
    skills: ['Content Strategy', 'Reels', 'Canva', 'Branding'],
  },
  {
    name: 'Kavya',
    role: 'Digital Marketing Manager',
    dept: 'Marketing',
    photo: 'https://images.pexels.com/photos/7752788/pexels-photo-7752788.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop',
    bio: 'Digital marketing manager leading overall strategy and campaign execution. Oversees SEO, paid media, and content teams to drive measurable business growth.',
    skills: ['Strategy', 'Team Leadership', 'Paid Media', 'ROI Analysis'],
  },
];
