import {
  Briefcase, Compass, HeartHandshake, TrendingUp, Clock, ShieldCheck,
  Sparkles, Gem, Home, Sun, Users, Star, type LucideIcon,
} from "lucide-react";

export type Benefit = { icon: LucideIcon; title: string; desc: string };
export type Testimonial = { quote: string; name: string; place: string };
export type Faq = { q: string; a: string };

export type LandingConfig = {
  slug: string;
  theme: string;
  accent: string;               // hex accent used for eyebrows / highlights
  badgeIcon: LucideIcon;
  badge: string;
  heroImage: string;
  h1a: string;
  h1b: string;                  // highlighted second line
  heroSub: string;
  heroBullets: string[];
  /** Prospect IQ routing */
  service: string;              // ServiceId used for serviceInterest mapping
  serviceInterest: string;      // exact SINGLE_OPTIONS value
  primaryConcern: string;       // exact SINGLE_OPTIONS value
  /**
   * The report sold at the top of the page, with the ₹999 call add-on:
   * "kundli" is the Premium Kundli PDF, "match" the Kundli Matching PDF.
   */
  report: "kundli" | "match";
  /** Consultation charges, mirroring the prices used across the website. */
  pricing: {
    /** ServiceId in shared/pricing.ts — also the BookingModal defaultService. */
    serviceId: string;
    options: { variant?: string; label: string; note?: string }[];
  };
  formTitle: string;
  formSub: string;
  cta: string;
  concernLabel: string;
  concerns: string[];
  benefitsTitle: string;
  benefits: Benefit[];
  testimonials: Testimonial[];
  faqs: Faq[];
};

export const LOGO = "https://vibe.filesafe.space/1782888190245745251/attachments/eeb5c854-e071-4e16-b563-90e6375205fb.png";
export const DOCTOR_PHOTO = "https://vibe.filesafe.space/1782888190245745251/attachments/bb04e9ad-4df5-45a2-b9e1-777b70d984e1.jpg";

export const CONTACT = {
  phone: "+91 70155 44187",
  phoneDigits: "917015544187",
  email: "myjyotishnow@gmail.com",
};

export const LANDING_CONFIGS: Record<string, LandingConfig> = {
  career: {
    slug: "career",
    theme: "Career & Business",
    accent: "#1F6F8B",
    badgeIcon: Briefcase,
    badge: "Career & Business Astrology",
    heroImage: "https://vibe.filesafe.space/1782888190245745251/attachments/3cc87c32-c314-46a6-852f-e7c110866a00.png",
    h1a: "Stuck in Your Career?",
    h1b: "The Stars Have the Answer.",
    heroSub: "Get a personalized Vedic reading from Dr. Sandeep Sawhney to find the career that truly fits your chart, the right time to switch jobs or start a business, and remedies to break through what's holding you back.",
    heroBullets: [
      "Discover the right field & role for your chart",
      "Know the best timing for a job change or new venture",
      "Remove planetary obstacles blocking your growth",
    ],
    report: "kundli",
    service: "career-guidance",
    serviceInterest: "Career Guidance",
    primaryConcern: "Career",
    pricing: { serviceId: "career-guidance", options: [{ label: "Career Guidance Consultation" }] },
    formTitle: "Get Your Career Kundli Report",
    formSub: "Your full 74-page Premium Kundli — career houses, dasha timing and remedies — in minutes. Add a call with Dr. Sandeep to go through it.",
    cta: "Get My Kundli",
    concernLabel: "What's your main career concern?",
    concerns: ["Job change / new opportunity", "Business growth & expansion", "Promotion / feeling stuck", "Career direction & confusion", "Foreign job / relocation", "Something else"],
    benefitsTitle: "What Your Career Reading Reveals",
    benefits: [
      { icon: TrendingUp, title: "Your Ideal Career Path", desc: "The fields, roles and industries your birth chart is naturally wired to succeed in." },
      { icon: Clock, title: "Right Timing", desc: "Favourable windows for a job switch, promotion, or launching a business." },
      { icon: ShieldCheck, title: "Obstacle Remedies", desc: "Simple, practical remedies to clear the planetary blocks stalling your growth." },
      { icon: Sparkles, title: "Wealth & Growth Yogas", desc: "The money-and-success combinations in your chart — and how to activate them." },
    ],
    testimonials: [
      { quote: "After 2 years stuck in the same role, Dr. Sandeep's timing advice helped me switch — I got a 40% hike within 3 months.", name: "Rahul M.", place: "Software Engineer, Bangalore" },
      { quote: "He told me exactly when to start my business. I waited for the window he gave and it's been profitable from month one.", name: "Priya S.", place: "Entrepreneur, Pune" },
    ],
    faqs: [
      { q: "What do I need to share?", a: "Just your date, time and place of birth — and your main career question. Nothing else." },
      { q: "What does it cost?", a: "The report is ₹299. Add a 15-minute call with Dr. Sandeep for ₹999 at checkout, or book a full consultation from ₹2,599 for 30 minutes — you choose your time from his live calendar before paying." },
      { q: "How does booking work?", a: "Choose a date and time from Dr. Sandeep's live calendar, pay securely, and your appointment is booked the moment the payment goes through." },
    ],
  },

  vastu: {
    slug: "vastu",
    theme: "Vastu Consultancy",
    accent: "#B8860B",
    badgeIcon: Compass,
    badge: "Expert Vastu Consultancy",
    heroImage: "https://vibe.filesafe.space/1782888190245745251/attachments/3c08f20c-1838-44bd-bbf6-259c9dca84fb.png",
    h1a: "Bad Luck at Home?",
    h1b: "It May Be Your Vastu.",
    heroSub: "Persistent money loss, health issues, tension or stalled growth are often caused by Vastu doshas in your home or workplace. Get a scientific, non-destructive Vastu analysis from Dr. Sandeep Sawhney — with remedies you can actually apply.",
    heroBullets: [
      "Pinpoint the exact Vastu doshas draining your space",
      "Practical remedies — no breaking or demolition",
      "Invite wealth, health & harmony back in",
    ],
    report: "kundli",
    service: "vastu-consultancy",
    serviceInterest: "Vastu Consultancy",
    primaryConcern: "Property/Vastu",
    pricing: { serviceId: "vastu-consultancy", options: [
      { variant: "online", label: "Online Discussion", note: "Virtual consultation from your floor plan" },
      { variant: "site-visit", label: "On-Site Visit", note: "+ travelling expenses (as per location)" },
    ] },
    formTitle: "Start With Your Kundli Report",
    formSub: "Your full 74-page Premium Kundli, including the 4th house of home and property. Add a call with Dr. Sandeep to discuss your space.",
    cta: "Get My Kundli",
    concernLabel: "What's troubling your space?",
    concerns: ["Financial loss / money not staying", "Health problems in the family", "Conflicts & lack of peace", "Career / business not growing", "Buying or building a new property", "Something else"],
    benefitsTitle: "What Your Vastu Consultation Covers",
    benefits: [
      { icon: Home, title: "Full Directional Analysis", desc: "Every zone of your home or office checked against authentic Vastu Shastra principles." },
      { icon: ShieldCheck, title: "No-Demolition Remedies", desc: "Practical fixes — colours, placement, symbols — without breaking a single wall." },
      { icon: Sun, title: "Energy Balance", desc: "Correct the flow of the five elements to invite positivity and prosperity." },
      { icon: TrendingUp, title: "Prosperity & Growth", desc: "Targeted corrections for wealth, career, relationships and health." },
    ],
    testimonials: [
      { quote: "We were losing money every month. After the Vastu changes Dr. Sandeep suggested, our shop's sales turned around in weeks.", name: "Anil G.", place: "Shop Owner, Delhi" },
      { quote: "No demolition, just simple placement changes — and the constant tension at home genuinely eased. Highly recommend.", name: "Sunita R.", place: "Homemaker, Jaipur" },
    ],
    faqs: [
      { q: "Do I need to break walls?", a: "No. Our remedies are practical and non-destructive — placement, colours and simple corrections you can do easily." },
      { q: "Can it be done online?", a: "Yes. Share your floor plan and directions and we can do a detailed online Vastu analysis." },
      { q: "What does it cost?", a: "The kundli report is ₹299, with an optional 15-minute call with Dr. Sandeep for ₹999. A full consultation starts at ₹2,599 for 30 minutes. For an on-site Vastu visit, message us on WhatsApp." },
    ],
  },

  marriage: {
    slug: "marriage",
    theme: "Marriage & Matchmaking",
    accent: "#C2185B",
    badgeIcon: HeartHandshake,
    badge: "Marriage & Matchmaking",
    heroImage: "https://vibe.filesafe.space/1782888190245745251/attachments/47f81405-bf4d-4943-8023-91bad5d11cf3.png",
    h1a: "Worried About Marriage?",
    h1b: "Let the Kundli Guide You.",
    heroSub: "Whether it's delays in marriage, doubts about compatibility, Manglik dosha, or trouble in an existing relationship — get clear answers from Dr. Sandeep Sawhney with authentic kundli matching and proven remedies.",
    heroBullets: [
      "Complete Guna Milan & compatibility analysis",
      "Manglik & dosha check with real remedies",
      "Remove delays and bring marital harmony",
    ],
    report: "match",
    service: "matchmaking-consultation",
    serviceInterest: "Matchmaking Consultation",
    primaryConcern: "Marriage/Relationship",
    pricing: { serviceId: "matchmaking-consultation", options: [{ label: "Matchmaking Consultation" }] },
    formTitle: "Get Your Kundli Matching Report",
    formSub: "All 36 gunas scored, Manglik check and both charts — in minutes. Add a call with Dr. Sandeep to go through the match.",
    cta: "Match Our Kundlis",
    concernLabel: "What would you like help with?",
    concerns: ["Delay in marriage", "Kundli matching for a proposal", "Manglik dosha concern", "Love marriage / family approval", "Problems in married life", "Something else"],
    benefitsTitle: "What Your Marriage Reading Reveals",
    benefits: [
      { icon: Users, title: "Kundli Compatibility", desc: "Full 36-guna Ashtakoot matching to see how well two charts truly align." },
      { icon: Clock, title: "Marriage Timing", desc: "The favourable periods in your chart for marriage — and why delays are happening." },
      { icon: ShieldCheck, title: "Manglik & Dosha Remedies", desc: "Clear checks for Manglik, Nadi and other doshas, with practical remedies." },
      { icon: Gem, title: "Harmony Guidance", desc: "Insights and remedies to ease conflict and strengthen married life." },
    ],
    testimonials: [
      { quote: "My marriage was getting delayed for years. Dr. Sandeep identified the dosha, suggested remedies, and I got engaged within months.", name: "Neha K.", place: "Lucknow" },
      { quote: "We did our kundli matching with him before saying yes. His honest, detailed analysis gave both families real peace of mind.", name: "Amit & Shreya", place: "Ahmedabad" },
    ],
    faqs: [
      { q: "What details do you need?", a: "Birth date, time and place — for one or both people if it's a matchmaking question." },
      { q: "Do you help with love marriages too?", a: "Yes. We guide on compatibility, timing and remedies for family approval and harmony." },
      { q: "What does it cost?", a: "The report is ₹299. Add a 15-minute call with Dr. Sandeep for ₹999 at checkout, or book a full consultation from ₹2,599 for 30 minutes — you choose your time from his live calendar before paying." },
    ],
  },
};
