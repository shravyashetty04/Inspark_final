import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Clients from './components/Clients';
import Pricing from './components/Pricing';
import Industries from './components/Industries';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import Legal from './components/Legal';

export default function App() {
  const [route, setRoute] = useState(window.location.pathname);

  useEffect(() => {
    const onPop = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const isTerms = route === '/terms';
  const isPrivacy = route === '/privacy';
  const isRefund = route === '/refund';
  const isLegal = isTerms || isPrivacy || isRefund;

  useEffect(() => {
    document.body.style.background = isLegal ? '#0a0a14' : '#0C0E2B';
  }, [isLegal]);

  if (isTerms) return <Legal page="terms" />;
  if (isPrivacy) return <Legal page="privacy" />;
  if (isRefund) return <Legal page="refund" />;

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Clients />
        <Pricing />
        <Industries />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
}
