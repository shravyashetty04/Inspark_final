import {
  Code2, Smartphone, Palette, Megaphone, Cloud, ShoppingCart,
  Shield, Clock, Users, Zap, Heart, Award, CheckCircle2,
  Search, PenTool, Rocket, TestTube, Rocket as Launch,
  Stethoscope, GraduationCap, Building2, ShoppingBag, Landmark,
  Factory, Plane, UtensilsCrossed, Store, Lightbulb, Globe,
  type LucideIcon,
} from 'lucide-react';

export type Service = {
  icon: LucideIcon;
  title: string;
  desc: string;
  features: string[];
  link: string;
};

export const services: Service[] = [
  {
    icon: Code2,
    title: 'Website Development',
    desc: 'Lightning-fast, SEO-optimized websites built with React, Next.js, and modern web technologies that convert visitors into customers.',
    features: ['React & Next.js', 'SEO Optimized', 'Responsive Design', 'CMS Integration'],
    link: '#contact',
  },
  {
    icon: Smartphone,
    title: 'Mobile App Development',
    desc: 'Cross-platform iOS and Android apps with native performance using Flutter and React Native for maximum reach and efficiency.',
    features: ['Flutter & React Native', 'iOS & Android', 'Push Notifications', 'App Store Deploy'],
    link: '#contact',
  },
  {
    icon: ShoppingCart,
    title: 'Custom Software Development',
    desc: 'Tailored business software, ERP dashboards, CRM systems, and custom API integrations designed to scale your operations.',
    features: ['ERP & CRM', 'Custom APIs', 'Cloud Infrastructure', 'Admin Panels'],
    link: '#contact',
  },
  {
    icon: Megaphone,
    title: 'Digital Marketing',
    desc: 'Data-driven marketing campaigns including SEO, Google Ads, Meta Ads, and social media to grow your traffic and revenue.',
    features: ['SEO Optimization', 'Google & Meta Ads', 'Social Media', 'Analytics Reports'],
    link: '#contact',
  },
  {
    icon: Palette,
    title: 'Branding & Creative Design',
    desc: 'Complete brand identity systems, logo design, UI/UX design, and motion graphics that set your brand apart from competitors.',
    features: ['Brand Identity', 'Logo & UI/UX', 'Figma Design System', 'Motion Graphics'],
    link: '#contact',
  },
  {
    icon: Cloud,
    title: 'Cloud & IT Solutions',
    desc: 'Cloud deployment, DevOps, server monitoring, security hardening, and 24/7 IT support to keep your business running smoothly.',
    features: ['Cloud Deployment', 'DevOps & CI/CD', 'SSL & Security', '24/7 Monitoring'],
    link: '#contact',
  },
];

export type WhyChooseItem = { icon: LucideIcon; title: string };

export const whyChooseItems: WhyChooseItem[] = [
  { icon: Users, title: 'Experienced Team' },
  { icon: Award, title: 'Affordable Pricing' },
  { icon: Clock, title: 'On-Time Delivery' },
  { icon: Zap, title: 'Latest Technologies' },
  { icon: Heart, title: 'Customer-Centric Approach' },
  { icon: Shield, title: 'Quality Assurance' },
];

export const teamRoles = [
  'Web Developers',
  'Mobile App Developers',
  'UI/UX Designers',
  'Digital Marketing Specialists',
  'Graphic Designers',
  'QA & Testing Engineers',
  'Project Managers',
  'Customer Support Team',
];

export type PricingCategory = {
  id: string;
  category: string;
  icon: LucideIcon;
  packages: {
    name: string;
    price: string;
    desc: string;
    popular: boolean;
    features: string[];
  }[];
};

export const pricingData: PricingCategory[] = [
  {
    id: 'website',
    category: 'Websites',
    icon: Code2,
    packages: [
      { name: 'Starter', price: '₹29,999', desc: 'Perfect for small projects and startups.', popular: false, features: ['5 Pages', 'Responsive Design', 'Basic UI/UX Design', 'Contact Form', 'WhatsApp Integration', 'Basic SEO Setup', '1 Month Maintenance'] },
      { name: 'Business', price: '₹49,999', desc: 'Ideal for growing businesses needing more power.', popular: true, features: ['15 Pages', 'Responsive Design', 'Advanced UI/UX Design', 'Admin Panel', 'Blog Section', 'Advanced SEO Setup', '3 Months Maintenance'] },
      { name: 'Premium', price: '₹69,999', desc: 'High-performance websites for established brands.', popular: false, features: ['Unlimited Pages', 'Responsive Design', 'Premium UI/UX Design', 'Admin Panel & Blog', 'Advanced SEO Setup', '6 Months Maintenance'] },
      { name: 'Enterprise', price: 'Custom', desc: 'Tailored solutions for large-scale operations.', popular: false, features: ['Custom Architecture', 'Dedicated Team', 'Advanced Integrations', 'Premium UI/UX', 'Performance Optimization', '12 Months Maintenance', 'Unlimited Revisions'] },
    ],
  },
  {
    id: 'ecommerce',
    category: 'E-Commerce',
    icon: ShoppingCart,
    packages: [
      { name: 'Starter', price: '₹29,999', desc: 'Launch your online store quickly and securely.', popular: false, features: ['Up to 30 Products', 'Payment Gateway', 'Shipping Integration', 'Basic Inventory', 'Coupons', 'GST Invoice', '2 Months Maintenance'] },
      { name: 'Business', price: '₹59,999', desc: 'Advanced features for scaling your sales.', popular: true, features: ['Up to 150 Products', 'Advanced Inventory', 'Payment Gateway', 'Shipping Integration', 'Coupon System', 'Analytics Dashboard', '4 Months Maintenance'] },
      { name: 'Premium', price: '₹99,999', desc: 'Enterprise-grade e-commerce platform.', popular: false, features: ['Unlimited Products', 'Advanced Inventory', 'Multi-vendor Support', 'Custom Integrations', 'Advanced Analytics', 'Dedicated Support', '12 Months Maintenance'] },
    ],
  },
  {
    id: 'mobile',
    category: 'Mobile Apps',
    icon: Smartphone,
    packages: [
      { name: 'Starter', price: '₹79,999', desc: 'Native Android app for your business.', popular: false, features: ['Android Native', 'Basic Admin Panel', 'API Integration', 'Push Notifications', '2 Months Maintenance'] },
      { name: 'Business', price: '₹1,49,999', desc: 'Cross-platform app with advanced features.', popular: true, features: ['Android + iOS', 'Admin Panel', 'Advanced API Integration', 'Push Notifications', 'Analytics', 'Source Code', '4 Months Maintenance'] },
      { name: 'Premium', price: '₹2,99,999', desc: 'Feature-rich native experiences for scale.', popular: false, features: ['Android + iOS Native', 'Premium Admin Panel', 'Advanced API Integration', 'Push Notifications & Analytics', 'Source Code', 'Dedicated Team', '6 Months Maintenance'] },
    ],
  },
  {
    id: 'school',
    category: 'School System',
    icon: GraduationCap,
    packages: [
      { name: 'Starter', price: '₹49,999', desc: 'Essential tools for school management.', popular: false, features: ['Student Management', 'Attendance Tracking', 'Basic Reports', 'Fee Management', '3 Months Maintenance'] },
      { name: 'Business', price: '₹99,999', desc: 'Complete digital transformation for schools.', popular: true, features: ['Student Management', 'Attendance & Fees', 'Complete Exam System', 'Parent Mobile App', 'Staff Management', 'Advanced Analytics'] },
    ],
  },
  {
    id: 'hospital',
    category: 'Hospital System',
    icon: Stethoscope,
    packages: [
      { name: 'Starter', price: '₹79,999', desc: 'Essential hospital management tools.', popular: false, features: ['Patient Records', 'Appointment Booking', 'Basic Billing', 'Staff Management', '3 Months Maintenance'] },
      { name: 'Business', price: '₹1,49,999', desc: 'Complete hospital management solution.', popular: true, features: ['Patient Records & Appointments', 'Advanced Billing', 'Pharmacy Management', 'Laboratory Integration', 'Doctor Panel', 'Patient Mobile App'] },
    ],
  },
  {
    id: 'crm',
    category: 'CRM Software',
    icon: Users,
    packages: [
      { name: 'Starter', price: '₹39,999', desc: 'Manage Leads. Boost Sales. Grow Faster.', popular: false, features: ['Sales Pipeline', 'Email Integration', 'Optional WhatsApp', 'Basic Reports'] },
      { name: 'Business', price: '₹89,999', desc: 'Advanced tools for growing sales teams.', popular: true, features: ['Sales Pipeline', 'Email Integration', 'WhatsApp Integration', 'Advanced Reports', 'Team Management', 'API Access'] },
    ],
  },
  {
    id: 'hrms',
    category: 'HRMS Software',
    icon: Users,
    packages: [
      { name: 'Starter', price: '₹39,999', desc: 'Essential HR management tools.', popular: false, features: ['Employee Management', 'Attendance Tracking', 'Basic Reports', '3 Months Maintenance'] },
      { name: 'Business', price: '₹89,999', desc: 'Scalable HR solution for enterprises.', popular: true, features: ['Employee Management', 'Attendance Tracking', 'Payroll Management', 'Leave Management', 'Recruitment', 'Performance Review'] },
    ],
  },
  {
    id: 'marketing',
    category: 'Digital Marketing',
    icon: Megaphone,
    packages: [
      { name: 'Starter', price: '₹15,000/month', desc: 'Drive Traffic. Generate Leads.', popular: false, features: ['SEO Optimization', 'Google Ads', 'Meta Ads', '12 Social Media Posts', 'Monthly Reports'] },
      { name: 'Growth', price: '₹30,000/month', desc: 'Accelerate your online presence.', popular: true, features: ['SEO Optimization', 'Google Ads', 'Meta Ads', '20 Social Media Posts', 'Weekly Reports'] },
      { name: 'Premium', price: '₹60,000/month', desc: 'Dominant market presence and growth.', popular: false, features: ['SEO Optimization', 'Google Ads', 'Meta Ads', '30 Social Media Posts', 'Live Dashboard'] },
    ],
  },
];

export const additionalServices = [
  'UI/UX Design', 'Logo Design', 'Branding', 'Domain Registration',
  'SSL Certificate', 'Email Setup', 'Cloud Deployment', 'API Development',
  'AI Chatbot Integration', 'Payment Gateway Integration', 'Website Maintenance', 'Content Writing',
];

export type Industry = {
  name: string;
  icon: LucideIcon;
  stat: string;
  solutions: string[];
};

export const industries: Industry[] = [
  { name: 'Healthcare', icon: Stethoscope, stat: 'HIPAA COMPLIANT', solutions: ['Telemedicine Apps', 'EHR Integrations', 'Patient Portals'] },
  { name: 'Education', icon: GraduationCap, stat: '90% HIGHER ENGAGEMENT', solutions: ['LMS Platforms', 'Virtual Classrooms', 'EdTech Apps'] },
  { name: 'Real Estate', icon: Building2, stat: '3X FASTER CLOSINGS', solutions: ['Property Portals', 'Virtual Tours 3D', 'CRM Systems'] },
  { name: 'E-commerce', icon: ShoppingBag, stat: 'SUB-SECOND LOADS', solutions: ['Shopify Plus', 'Custom Storefronts', 'Inventory Sync'] },
  { name: 'Finance', icon: Landmark, stat: 'BANK-GRADE SECURITY', solutions: ['Fintech Apps', 'Payment Gateways', 'Crypto Dashboards'] },
  { name: 'Manufacturing', icon: Factory, stat: 'AUTOMATED OPERATIONS', solutions: ['ERP Systems', 'Supply Chain APIs', 'IoT Dashboards'] },
  { name: 'Travel', icon: Plane, stat: 'SEAMLESS BOOKINGS', solutions: ['Booking Engines', 'Travel Guides', 'Loyalty Apps'] },
  { name: 'Restaurants', icon: UtensilsCrossed, stat: 'SEAMLESS ORDERING', solutions: ['Delivery Apps', 'POS Integrations', 'Digital Menus'] },
  { name: 'Retail', icon: Store, stat: 'OMNICHANNEL GROWTH', solutions: ['POS Systems', 'Loyalty Programs', 'E-commerce Sync'] },
  { name: 'Startups', icon: Lightbulb, stat: 'RAPID MVP LAUNCHES', solutions: ['Pitch Decks', 'MVP Development', 'Growth Hacking'] },
  { name: 'NGOs', icon: Globe, stat: 'MAXIMIZED IMPACT', solutions: ['Donation Platforms', 'Volunteer Portals', 'Awareness Sites'] },
  { name: 'Corporate', icon: Building2, stat: 'ENTERPRISE EFFICIENCY', solutions: ['Intranet Portals', 'B2B Platforms', 'Data Warehousing'] },
];

export type ProcessStep = {
  num: string;
  title: string;
  desc: string;
  icon: LucideIcon;
};

export const processSteps: ProcessStep[] = [
  { num: '01', title: 'Discovery', desc: 'We map out your business goals, target user personas, competitor analysis, and functional roadmap.', icon: Search },
  { num: '02', title: 'Planning', desc: 'Detailed system architecture mapping, milestone scheduling, resource planning, and technical scope definition.', icon: PenTool },
  { num: '03', title: 'Design', desc: 'Interactive Figma wireframes and high-fidelity mockups crafted for maximum conversion and user delight.', icon: Palette },
  { num: '04', title: 'Development', desc: 'Clean, maintainable code engineered with React, Next.js, Flutter, Node, and secure cloud infrastructure.', icon: Code2 },
  { num: '05', title: 'Testing', desc: 'Automated test suite execution, security vulnerability scans, multi-device testing, and acceptance checks.', icon: TestTube },
  { num: '06', title: 'Launch & Support', desc: 'Zero-downtime deployment, App Store publishing, search engine indexing, and continuous 24/7 monitoring.', icon: Rocket },
];

export type Stat = {
  metric: string;
  label: string;
  desc: string;
};

export const stats: Stat[] = [
  { metric: '250+', label: 'Digital Products Shipped', desc: 'Across 14+ Global Markets' },
  { metric: '99.4%', label: 'Client Satisfaction Rate', desc: 'Verified 5-Star Reviews' },
  { metric: '10x', label: 'Average Growth ROI', desc: 'Boost in Traffic & Revenue' },
  { metric: '4 Weeks', label: 'Fast-Track MVP Sprint', desc: 'Idea to Market Deployment' },
];

export type Testimonial = {
  name: string;
  role: string;
  company: string;
  comment: string;
  rating: number;
  projectType: string;
};

export const testimonials: Testimonial[] = [
  { name: 'Rajesh Kumar', role: 'Managing Director', company: 'E-commerce Brand', comment: 'InSpark built our website exactly as we envisioned. The team was professional, responsive, and delivered ahead of schedule. Our online sales doubled within three months!', rating: 5, projectType: 'Website Development' },
  { name: 'Priya Sharma', role: 'Founder & CEO', company: 'Growth Startup', comment: 'Our leads increased significantly after their digital marketing campaign. The team understood our vision and executed flawlessly. Highly recommend InSpark for any digital needs.', rating: 5, projectType: 'Digital Marketing' },
  { name: 'Amit Patel', role: 'CTO', company: 'TechFlow Solutions', comment: 'The mobile app they built for us is incredibly fast and user-friendly. InSpark\'s technical expertise is top-notch and their support team is always available.', rating: 5, projectType: 'Mobile App Development' },
  { name: 'Sneha Reddy', role: 'Operations Head', company: 'HealthCare Plus', comment: 'They developed a complete hospital management system that streamlined our entire operation. The system is robust, secure, and easy to use. Fantastic work!', rating: 5, projectType: 'Custom Software' },
  { name: 'Vikram Singh', role: 'Director', company: 'EduTech Academy', comment: 'InSpark transformed our school management with their digital solution. Parent engagement increased by 90% and our administrative workload reduced significantly.', rating: 5, projectType: 'School System' },
  { name: 'Ananya Gupta', role: 'Marketing Lead', company: 'RetailChain', comment: 'Their branding and UI/UX redesign gave our brand a premium feel. Customer feedback has been overwhelmingly positive. InSpark truly understands design.', rating: 5, projectType: 'Branding & Design' },
];

export type FAQ = {
  category: string;
  question: string;
  answer: string;
};

export const faqs: FAQ[] = [
  { category: 'Services', question: 'How long does website development take?', answer: 'Website development typically takes between 3 to 6 weeks depending on the complexity of the pages, custom animations, integrations, and content preparation. Simple landing pages can be shipped within 2 weeks, while custom SaaS platforms or portals may require 8+ weeks.' },
  { category: 'Support', question: 'Do you provide maintenance?', answer: 'Yes, we offer comprehensive post-launch maintenance packages. This includes 24/7 server monitoring, security updates, regular database backups, bug fixes, and minor adjustments to keep your digital products running smoothly.' },
  { category: 'Services', question: 'Can you redesign existing websites?', answer: 'Absolutely. We perform website redesigns to improve UI/UX, modernize visual design, accelerate page loading speed, and optimize mobile responsiveness. We ensure a seamless transition with zero downtime or SEO rank loss.' },
  { category: 'Growth', question: 'Do you provide SEO?', answer: 'Yes, we integrate technical SEO best practices into every website we build. We optimize page structures, schema markup, loading speeds, and responsiveness. We also execute dedicated SEO campaigns to grow your organic search traffic.' },
  { category: 'Services', question: 'Can you develop mobile apps?', answer: 'Yes, we build high-performance cross-platform mobile apps for iOS and Android using Flutter and React Native. This allows you to have a single codebase, lowering costs and delivery time while maintaining native performance.' },
  { category: 'Services', question: 'Do you offer custom software?', answer: 'Yes, we develop custom business software tailored to your specific workflows, including ERP dashboards, CRM systems, centralized database management panels, and custom API integration engines designed to scale operations.' },
];

export const contactServices = [
  'Website Development',
  'Mobile App Development',
  'Custom Software Development',
  'Digital Marketing',
  'Branding & Creative Design',
  'Cloud & IT Solutions',
];

export type ChatOption = {
  text: string;
  recommendation?: {
    title: string;
    tech: string[];
    timeline: string;
    roi: string;
  };
};

export const chatbotFlow: Record<string, ChatOption> = {
  'Mobile App': {
    text: 'Awesome choice! For cross-platform Mobile Apps with native 120fps feel, inSpark recommends our Flutter/React Native Tech Engine with Firebase & Node.js backend.',
    recommendation: {
      title: 'Mobile App Tech Stack',
      tech: ['Flutter / React Native', 'Node.js API', 'Firebase Auth', 'Stripe Payments'],
      timeline: '4 to 6 Weeks',
      roi: 'Estimated 35% higher user retention vs standard web view apps.',
    },
  },
  'SaaS / Web': {
    text: 'For web platforms requiring sub-second load speed & top SEO performance, inSpark leverages Next.js 15 with React Server Components and Tailwind CSS.',
    recommendation: {
      title: 'Fullstack Next.js Web Stack',
      tech: ['Next.js 15', 'React Server Components', 'Tailwind CSS', 'PostgreSQL'],
      timeline: '3 to 5 Weeks',
      roi: '99+ Google Lighthouse Speed Score & 4x faster indexing.',
    },
  },
  'AI': {
    text: 'AI Automation is our specialty! We build custom RAG bots connected to your knowledge base & CRM to resolve up to 80% of routine client queries automatically.',
    recommendation: {
      title: 'Enterprise AI Agent Workflow',
      tech: ['OpenAI GPT-4o API', 'LangChain', 'Pinecone Vector DB', 'Zapier Automation'],
      timeline: '2 to 4 Weeks',
      roi: 'Saves ~120 hours of manual support work per month.',
    },
  },
  'E-Commerce': {
    text: 'For high-scale E-Commerce, inSpark builds headless storefronts with Shopify Plus or custom Next.js commerce, achieving sub-second loads and 3x conversion lifts.',
    recommendation: {
      title: 'Headless E-Commerce Stack',
      tech: ['Shopify Plus / Medusa', 'Next.js Commerce', 'Stripe Checkout', 'Klaviyo'],
      timeline: '4 to 8 Weeks',
      roi: '3x conversion rate vs traditional Shopify themes.',
    },
  },
  'Brand': {
    text: 'A strong brand identity sets ambitious brands apart. We deliver complete Figma design systems, motion graphics, and distinctive brand guidelines.',
    recommendation: {
      title: 'Premium Brand & UI/UX System',
      tech: ['Figma Design System', 'Adobe Illustrator', 'Framer Micro-animations'],
      timeline: '2 to 3 Weeks',
      roi: 'Instant brand credibility & elevated premium market positioning.',
    },
  },
};

export const chatbotOptions = [
  '📱 Build an iOS & Android Mobile App',
  '🚀 Launch High-Converting SaaS / Web Platform',
  '🤖 Automate Customer Support & Sales with AI',
  '🛍️ Build/Upgrade High-Scale E-Commerce Store',
  '🎨 Complete Brand Identity & UI/UX Redesign',
];
