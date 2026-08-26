import { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Shield, RefreshCw, Sparkles, ChevronDown } from 'lucide-react';

type LegalPage = 'terms' | 'privacy' | 'refund';

const pages: Record<LegalPage, { title: string; icon: typeof FileText; date: string; sections: { heading: string; body: string }[] }> = {
  terms: {
    title: 'Terms & Conditions',
    icon: FileText,
    date: 'August 3, 2026',
    sections: [
      {
        heading: '1. Acceptance of Terms',
        body: 'By accessing or using the services provided by inSpark Technologies ("inSpark", "we", "us", or "our"), you agree to be bound by these Terms & Conditions. If you do not agree to these terms, please do not use our services. These terms apply to all visitors, clients, and users of our website and services.',
      },
      {
        heading: '2. Services Provided',
        body: 'inSpark offers website development, mobile app development, custom software development, digital marketing, branding & creative design, and cloud & IT solutions. The specific scope, deliverables, timeline, and pricing for each project will be defined in a separate proposal or agreement signed between inSpark and the client.',
      },
      {
        heading: '3. Project Scope & Deliverables',
        body: 'All project scopes are defined in the individual service agreement or proposal. Any changes or additions to the agreed scope will be treated as change requests and may incur additional charges and timeline adjustments. Deliverables will be provided as described in the proposal; features not explicitly mentioned are not included.',
      },
      {
        heading: '4. Payment Terms',
        body: 'Payment schedules are outlined in each project proposal. Typically, projects require an advance payment of 40-50% before work begins, with the remaining balance due upon milestone completion or project delivery. Payments are non-refundable once work has commenced, except as outlined in our Refund Policy. Late payments may result in project delays or suspension of services.',
      },
      {
        heading: '5. Client Responsibilities',
        body: 'The client agrees to provide timely access to necessary resources, content, feedback, and approvals. Delays caused by the client in providing materials or feedback may extend the project timeline. The client is responsible for the accuracy and legality of all content and materials provided to inSpark for use in the project.',
      },
      {
        heading: '6. Intellectual Property',
        body: 'Upon full payment, ownership of the final deliverables (source code, design files, and assets) transfers to the client, unless otherwise stated in the proposal. inSpark retains the right to use the project for portfolio and marketing purposes unless a non-disclosure agreement is in place. Third-party libraries, plugins, and tools used in the project remain under their respective licenses.',
      },
      {
        heading: '7. Confidentiality',
        body: 'Both parties agree to keep confidential any proprietary or sensitive information shared during the course of the project. This includes business strategies, technical details, customer data, and financial information. Confidentiality obligations survive the termination of any agreement.',
      },
      {
        heading: '8. Warranties & Disclaimers',
        body: 'inSpark warrants that services will be performed with reasonable skill and care. However, we do not guarantee specific business outcomes such as revenue, traffic, or search rankings. All services are provided "as is" and we are not liable for indirect, incidental, or consequential damages arising from the use of our deliverables.',
      },
      {
        heading: '9. Limitation of Liability',
        body: 'inSpark\'s total liability for any claim arising from our services shall not exceed the total amount paid by the client for the specific project giving rise to the claim. We are not liable for loss of profits, data loss, or business interruption beyond the scope of the project fees.',
      },
      {
        heading: '10. Termination',
        body: 'Either party may terminate the agreement with written notice if the other party breaches any material term and fails to cure the breach within 15 days. Upon termination, the client is responsible for payment of all work completed up to the termination date. Advance payments are non-refundable upon termination by the client.',
      },
      {
        heading: '11. Third-Party Services',
        body: 'Our projects may integrate third-party services such as hosting providers, payment gateways, APIs, and analytics tools. inSpark is not responsible for the availability, performance, or policies of these third-party services. The client is responsible for maintaining active subscriptions with third-party providers.',
      },
      {
        heading: '12. Modifications to Terms',
        body: 'inSpark reserves the right to modify these Terms & Conditions at any time. Changes will be posted on this page with an updated revision date. Continued use of our services after changes constitutes acceptance of the revised terms.',
      },
      {
        heading: '13. Governing Law',
        body: 'These terms are governed by the laws of India. Any disputes arising from these terms or our services shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka, India.',
      },
      {
        heading: '14. Contact Information',
        body: 'For questions about these Terms & Conditions, contact us at contact@insparktech.in or +91 63600 93015. Our office is located at 1st Floor, 80 Feet Rd, 2nd Block, Nagarbhavi 1st Stage, Chandra Layout, Bengaluru, Karnataka 560072.',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    icon: Shield,
    date: 'August 3, 2026',
    sections: [
      {
        heading: '1. Information We Collect',
        body: 'We collect information that you provide directly to us, including your name, email address, phone number, and project details when you submit an enquiry through our contact form, subscribe to our newsletter, or interact with our chatbot. We also collect technical data such as IP address, browser type, and usage data through cookies and analytics tools.',
      },
      {
        heading: '2. How We Use Your Information',
        body: 'We use the information we collect to: (a) respond to your enquiries and provide requested services; (b) send you project updates and communications; (c) send newsletter updates if you have subscribed; (d) improve our website, services, and user experience; (e) analyze website traffic and usage patterns; and (f) comply with legal obligations.',
      },
      {
        heading: '3. Information Sharing',
        body: 'We do not sell, trade, or rent your personal information to third parties. We may share your information with: (a) service providers who assist us in operating our business (such as email delivery and analytics); (b) legal authorities when required by law or to protect our rights. All third-party providers are bound by confidentiality obligations.',
      },
      {
        heading: '4. Cookies & Tracking Technologies',
        body: 'Our website uses cookies and similar technologies to enhance your browsing experience, analyze traffic, and remember your preferences. You can control cookies through your browser settings. Disabling cookies may affect some functionality of our website.',
      },
      {
        heading: '5. Data Security',
        body: 'We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. This includes encrypted data transmission, secure storage, and access controls. However, no method of transmission over the internet is 100% secure.',
      },
      {
        heading: '6. Data Retention',
        body: 'We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, resolve disputes, and enforce our agreements. You may request deletion of your data at any time, subject to legal and contractual retention requirements.',
      },
      {
        heading: '7. Your Rights',
        body: 'You have the right to: (a) access the personal information we hold about you; (b) request correction of inaccurate information; (c) request deletion of your personal data; (d) opt out of marketing communications at any time; (e) withdraw consent for data processing. To exercise these rights, contact us at contact@insparktech.in.',
      },
      {
        heading: '8. Chatbot Data',
        body: 'When you interact with our AI chatbot, we log the conversation to improve our services and understand client needs. This data is stored securely and is not shared with third parties. Conversations are linked to an anonymous session ID and do not contain personally identifiable information unless you voluntarily provide it.',
      },
      {
        heading: '9. Newsletter Subscriptions',
        body: 'When you subscribe to our newsletter, we store your email address and use it solely to send you updates, insights, and offers. You can unsubscribe at any time by clicking the unsubscribe link in any newsletter email or by contacting us directly.',
      },
      {
        heading: '10. Third-Party Links',
        body: 'Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these external sites. We encourage you to review the privacy policies of any third-party sites you visit.',
      },
      {
        heading: '11. Children\'s Privacy',
        body: 'Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us so we can promptly delete it.',
      },
      {
        heading: '12. Changes to This Policy',
        body: 'We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date. We encourage you to review this page periodically to stay informed about how we protect your information.',
      },
      {
        heading: '13. Contact Information',
        body: 'For questions or concerns about this Privacy Policy or your personal data, contact us at contact@insparktech.in or +91 63600 93015. Our office is located at 1st Floor, 80 Feet Rd, 2nd Block, Nagarbhavi 1st Stage, Chandra Layout, Bengaluru, Karnataka 560072.',
      },
    ],
  },
  refund: {
    title: 'Refund Policy',
    icon: RefreshCw,
    date: 'August 3, 2026',
    sections: [
      {
        heading: '1. General Refund Policy',
        body: 'At inSpark Technologies, we are committed to client satisfaction. This Refund Policy outlines the terms under which refunds may be issued for our services. Since our services involve custom development work, refund eligibility depends on the stage of the project and the work completed.',
      },
      {
        heading: '2. Advance Payment Refunds',
        body: 'Projects typically require an advance payment of 40-50% before work begins. Advance payments are refundable under the following conditions: (a) if the project has not yet started and you cancel within 48 hours of payment, you are eligible for a full refund; (b) if work has commenced, the advance payment covers the work completed and is non-refundable.',
      },
      {
        heading: '3. Milestone-Based Refunds',
        body: 'For projects with milestone-based payments, each milestone payment covers the work delivered for that specific milestone. Once a milestone is approved by the client, the payment for that milestone is non-refundable. If a milestone is not approved and work has been completed, the client may request revisions as per the agreed scope.',
      },
      {
        heading: '4. Digital Marketing Services',
        body: 'Digital marketing services (SEO, Google Ads, Meta Ads, social media management) are billed monthly. Monthly fees are non-refundable once the billing cycle has started. If you cancel mid-cycle, services will continue until the end of the paid cycle. Ad spend budgets are managed by the client and are not refundable through inSpark.',
      },
      {
        heading: '5. Subscription Services',
        body: 'For recurring subscription services such as maintenance plans or retainers, you may cancel at any time. Cancellation takes effect at the end of the current billing cycle. No partial refunds are issued for unused portions of a billing period. Prepaid annual plans may be refunded on a pro-rata basis for unused months, minus a 10% administrative fee.',
      },
      {
        heading: '6. Refund Request Process',
        body: 'To request a refund, email us at contact@insparktech.in with your project details, payment receipt, and reason for the request. Refund requests must be made within 15 days of the payment date. We will review your request and respond within 7 business days. Approved refunds will be processed to the original payment method within 10-15 business days.',
      },
      {
        heading: '7. Non-Refundable Items',
        body: 'The following are non-refundable: (a) third-party costs such as domain registrations, SSL certificates, hosting, and app store fees; (b) work already completed and delivered; (c) rush or expedited delivery fees; (d) consultation fees for advisory sessions; (e) any custom work that cannot be reused or resold.',
      },
      {
        heading: '8. Project Cancellation by Client',
        body: 'If you cancel a project after work has begun, you are responsible for payment of all work completed up to the cancellation date. Any advance payment will be applied toward the completed work. If the completed work value exceeds the advance payment, you will be billed for the difference. If the advance exceeds the work completed, the difference will be refunded within 15 business days.',
      },
      {
        heading: '9. Project Cancellation by inSpark',
        body: 'If inSpark cancels a project due to inability to deliver, technical infeasibility, or other valid reasons, you will receive a refund for all undelivered work. If work has been partially completed, you will receive the completed deliverables and a refund for the remaining balance.',
      },
      {
        heading: '10. Quality Disputes',
        body: 'If you are unsatisfied with the quality of delivered work, we offer revision rounds as specified in your project proposal. If quality issues remain unresolved after the agreed revision rounds, you may submit a formal complaint to contact@insparktech.in. We will investigate and work with you to reach a satisfactory resolution, which may include additional revisions, partial refund, or other remedies.',
      },
      {
        heading: '11. Chargebacks',
        body: 'We encourage you to contact us directly before initiating a chargeback with your bank or card provider. Chargebacks initiated without first contacting inSpark may delay resolution and could result in suspension of services. We are committed to resolving disputes fairly and promptly.',
      },
      {
        heading: '12. Changes to This Policy',
        body: 'We reserve the right to update this Refund Policy at any time. Changes will be posted on this page with an updated revision date. The policy in effect at the time of your payment will apply to your transaction.',
      },
      {
        heading: '13. Contact Information',
        body: 'For refund requests or questions about this policy, contact us at contact@insparktech.in or +91 63600 93015. Our office is located at 1st Floor, 80 Feet Rd, 2nd Block, Nagarbhavi 1st Stage, Chandra Layout, Bengaluru, Karnataka 560072.',
      },
    ],
  },
};

export default function Legal({ page }: { page: LegalPage }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const data = pages[page];

  useEffect(() => { window.scrollTo(0, 0); }, [page]);

  useEffect(() => {
    setExpanded(data.sections[0]?.heading ?? null);
  }, [page]);

  const goBack = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a14' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,10,20,0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(192,132,252,0.1)',
        padding: '16px 0',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={goBack} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#94a3b8', fontSize: '14px', fontWeight: 600,
          }}>
            <ArrowLeft size={18} /> Back to Home
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #7C3AED, #9333EA)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={16} color="#fff" />
            </div>
            <span style={{ fontSize: '16px', fontWeight: 900, color: '#fff' }}>
              in<span style={{ color: '#e879f9' }}>Spark</span>.in
            </span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div style={{
        padding: '60px 0 40px', textAlign: 'center', position: 'relative', overflow: 'hidden',
        background: 'radial-gradient(circle at 50% 0%, rgba(124,58,237,0.15) 0%, rgba(10,10,20,0) 60%)',
      }}>
        <div className="container">
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px', margin: '0 auto 20px',
            background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <data.icon size={28} color="#e879f9" />
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900, color: '#fff', marginBottom: '12px' }}>
            {data.title}
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Last updated: {data.date}</p>
        </div>
      </div>

      {/* Content */}
      <div className="container" style={{ paddingBottom: '80px', maxWidth: '800px' }}>
        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {(Object.keys(pages) as LegalPage[]).map((key) => {
            const p = pages[key];
            const isActive = key === page;
            return (
              <a
                key={key}
                href={`/${key === 'terms' ? 'terms' : key === 'privacy' ? 'privacy' : 'refund'}`}
                onClick={(e) => {
                  e.preventDefault();
                  window.history.pushState({}, '', `/${key}`);
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 18px', borderRadius: '10px',
                  border: isActive ? '1px solid #7C3AED' : '1px solid rgba(255,255,255,0.08)',
                  background: isActive ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.03)',
                  color: isActive ? '#e879f9' : '#94a3b8',
                  fontSize: '13px', fontWeight: 700, textDecoration: 'none',
                  transition: 'all 0.2s ease', cursor: 'pointer',
                }}
              >
                <p.icon size={15} /> {p.title}
              </a>
            );
          })}
        </div>

        {/* Sections (accordion) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.sections.map((section) => {
            const isOpen = expanded === section.heading;
            return (
              <div key={section.heading} style={{
                borderRadius: '14px', overflow: 'hidden',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <button
                  onClick={() => setExpanded(isOpen ? null : section.heading)}
                  style={{
                    width: '100%', padding: '18px 20px', textAlign: 'left',
                    background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>{section.heading}</span>
                  <ChevronDown size={18} color={isOpen ? '#e879f9' : '#64748b'} style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }} />
                </button>
                {isOpen && (
                  <div style={{ padding: '0 20px 20px' }}>
                    <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.7 }}>{section.body}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact banner */}
        <div style={{
          marginTop: '40px', padding: '28px', borderRadius: '16px',
          background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', textAlign: 'center',
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Questions about this policy?</h3>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '16px' }}>Our team is here to help. Reach out anytime.</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="mailto:contact@insparktech.in" style={{ fontSize: '14px', color: '#e879f9', fontWeight: 700, textDecoration: 'none' }}>contact@insparktech.in</a>
            <span style={{ color: '#334155' }}>|</span>
            <span style={{ fontSize: '14px', color: '#e879f9', fontWeight: 700 }}>+91 63600 93015</span>
          </div>
        </div>
      </div>
    </div>
  );
}
