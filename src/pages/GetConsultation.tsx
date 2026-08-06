import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Phone, Video, CheckCircle2, Clock, MapPin, Sparkles, Calendar, Users, Star, Shield, ArrowRight, SunMedium } from "lucide-react";
import { Link } from "react-router-dom";
import { FinalCTA } from "@/components/FinalCTA";
import { BookingModal } from "@/components/BookingModal";
import { RazorpayButton } from "@/components/RazorpayButton";
import { formatINR, getPriceInRupees } from "../../shared/pricing";
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const consultationServices = [
  {
    subtitle: "Personalized Guidance for a Better Future",
    title: "Complete Horoscope Analysis",
    whatYouGet: [
      "Detailed Chart Analysis – Understand how planetary positions influence your life.",
      "Personalized Predictions – Get accurate insights based on your birth chart.",
      "Remedial Solutions – Receive powerful remedies to overcome obstacles.",
      "Career & Relationship Guidance – Clarity on job prospects, business, and love life.",
    ],
    pricing: [
      "Video Call: ₹4,999 – A face-to-face session for a personalized experience.",
      "Audio Call: ₹4,599 – A detailed discussion with precise predictions.",
    ],
    theme: "light",
  },
  {
    subtitle: "Your Personalized Yearly Forecast",
    title: "Annual Horoscope Analysis",
    whatYouGet: [
      "Month-by-Month Predictions – Know what's in store for your career, relationships, and finances.",
      "Major Planetary Transits – Understand how upcoming celestial movements will impact you.",
      "Favorable & Challenging Periods – Be prepared for opportunities and obstacles.",
      "Effective Remedies – Get personalized astrological solutions for a smooth year ahead.",
    ],
    pricing: [
      "Video Call: ₹4,999 – A face-to-face session for a personalized experience.",
      "Audio Call: ₹4,599 – A detailed discussion with precise predictions.",
    ],
    theme: "dark",
  },
  {
    subtitle: "Find Your Perfect Life Partner",
    title: "Matchmaking Consultation",
    whatYouGet: [
      "Kundali Matching – Analyze Guna Milan, planetary influences, and compatibility scores.",
      "Relationship Harmony – Identify strengths and challenges in the partnership.",
      "Dosha Analysis – Check for Mangal Dosha, Kaal Sarp Dosha, and other astrological imbalances.",
      "Remedial Solutions – Receive effective astrological remedies for a happy and successful marriage.",
    ],
    pricing: [
      "Service Fee: ₹2,999",
      "Consultation Mode: Personalized one-on-one session with detailed insights.",
    ],
    theme: "light",
  },
  {
    subtitle: "Unlock the Power of the Right Gemstone",
    title: "Gemstone Analysis",
    whatYouGet: [
      "Personalized Gemstone Recommendation – Find the most suitable stone for career, health, wealth, and relationships.",
      "Authenticity & Effectiveness – Ensure you wear a gemstone that truly works for you.",
      "Correct Wearing Method – Learn the right metal, finger, and day for wearing your gemstone.",
      "Remedy for Planetary Imbalances – Strengthen beneficial planets and minimize negative effects.",
    ],
    pricing: [
      "Service Fee: ₹2,999",
      "Consultation Mode: One-on-one expert session with a precise gemstone suggestion.",
    ],
    theme: "dark",
  },
  {
    subtitle: "Shape Your Future with Astrology",
    title: "Career Guidance",
    whatYouGet: [
      "Best Career Path Selection – Find the most suitable profession based on your birth chart.",
      "Job Stability & Growth – Identify favorable periods for promotions, job changes, and success.",
      "Business vs. Job Analysis – Get clarity on whether you should pursue a job or start a business.",
      "Remedies for Career Success – Overcome obstacles with powerful astrological solutions.",
    ],
    pricing: [
      "Service Fee: ₹3,999",
      "Consultation Mode: One-on-one session with personalized guidance.",
    ],
    theme: "light",
  },
  {
    subtitle: "Harmonize Your Space with Positive Energy",
    title: "Vastu Consultancy",
    whatYouGet: [
      "Complete Vastu Analysis – Assess the energy balance of your home, office, or shop.",
      "Personalized Remedies – Get simple yet effective solutions without major structural changes.",
      "Wealth & Prosperity Enhancement – Improve financial growth and career stability.",
      "Health & Relationship Harmony – Ensure a peaceful and positive environment.",
    ],
    pricing: [
      "Online Consultation: ₹49,999 – Virtual Vastu assessment and remedies.",
      "On-Site Visit: ₹99,999 plus traveling expenses.",
    ],
    theme: "dark",
  },
  {
    subtitle: "Your Personalized Astrological Roadmap",
    title: "Yearly Horoscope",
    whatYouGet: [
      "12-Month Forecast – Know what the year holds for your career, relationships, finances, and health.",
      "Major Planetary Transits – Understand how cosmic movements will impact your life.",
      "Favorable & Challenging Periods – Plan ahead with confidence.",
      "Powerful Remedies – Astrological solutions to overcome hurdles.",
    ],
    pricing: [
      "Service Fee: ₹3,999",
      "Consultation Mode: One-on-one expert session with a precise gemstone suggestion.",
    ],
    theme: "light",
  },
];

const GetConsultation = () => {
  const [consultationType1, setConsultationType1] = useState<'Audio' | 'Video'>('Audio');
  const [consultationDuration1, setConsultationDuration1] = useState<'30 Min' | '1 Hour'>('30 Min');

  const [consultationType2, setConsultationType2] = useState<'Audio' | 'Video'>('Audio');
  const [consultationDuration2, setConsultationDuration2] = useState<'30 Min' | '1 Hour'>('30 Min');

  // Prices live in shared/pricing.ts and are re-derived server-side when the
  // order is created, so what is shown and what is charged cannot drift.
  const variant1 = `${consultationDuration1}|${consultationType1}`;
  const variant2 = `${consultationDuration2}|${consultationType2}`;

  const getPrice1 = () => getPriceInRupees('consultation-call', variant1) ?? 0;
  const getPrice2 = () => getPriceInRupees('couple-consultation', variant2) ?? 0;

  const FACE_TO_FACE_PRICE = getPriceInRupees('face-to-face') ?? 0;
  const BABY_MUHURAT_PRICE = getPriceInRupees('baby-muhurat') ?? 0;

  const getPillClass = (isActive: boolean) => {
    return isActive
      ? "px-3 py-1 bg-primary text-white text-[11px] rounded-full cursor-pointer transition-colors border border-primary"
      : "px-3 py-1 bg-transparent text-primary text-[11px] rounded-full border border-primary cursor-pointer hover:bg-primary/10 transition-colors";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO 
        title="Book Astrology Consultation - JyotishNow" 
        description="Book a personalized Vedic astrology consultation with Dr. Sandeep Sawhney. Get expert guidance on career, marriage, health, and wealth."
      />
      <Header />
      
      <main className="flex-grow">
        <section className="relative overflow-hidden bg-primary text-primary-foreground min-h-[100svh] flex items-center pt-24 pb-14">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[url('https://vibe.filesafe.space/1782888190245745251/attachments/f3defd31-d7c0-40f3-8666-e2147b315018.png')] bg-cover bg-[position:80%_center] md:bg-right"></div>
            {/* Linear Gradient Overlay */}
            <div 
              className="absolute inset-0" 
              style={{ 
                background: 'linear-gradient(to right, #780808 0%, rgba(120, 8, 8, 0.8) 30%, rgba(120, 8, 8, 0.6) 50%, rgba(120, 8, 8, 0.3) 75%, transparent 100%)' 
              }}
            ></div>
            {/* Radial Glow */}
            <div 
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(circle at 35% 50%, rgba(120, 8, 8, 0.5) 0%, transparent 60%)'
              }}
            ></div>
          </div>
          
          <div className="container mx-auto px-4 max-w-[1300px] relative z-10">
            <div className="flex flex-col items-start justify-center text-left max-w-2xl">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-sm font-semibold mb-8 backdrop-blur-sm shadow-[0_4px_10px_-2px_rgba(0,0,0,0.1)] pt-[10px] pb-[10px] pl-[15px] pr-[15px] rounded-md"
              >
                <SunMedium className="lucide lucide-star fill-white text-white w-[18px] h-[17px]" />
                <span className="font-light">One Meaningful Conversation</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-serif leading-tight mb-6 text-white"
              >
                Understand Your Destiny <span className="text-secondary">Clearly</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg md:text-xl text-white/90 mb-8 max-w-xl leading-relaxed"
              >
                Speak directly with <strong className="text-white">Dr. Sandeep Sawhney</strong> — Founder of <strong className="text-white">JyotishNow</strong>, Trusted Astrologer & Vastu Consultant. Highly Confidential, Practical Guidance, and Life-Changing Insights.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 sm:gap-5 w-full sm:w-auto"
              >
                <BookingModal>
                  <Button size="lg" className="bg-white hover:bg-white/90 text-black text-lg px-8 h-14 shadow-[0_8px_20px_-6px_rgba(255,255,255,0.3)] transition-all duration-300 ease-out hover:-translate-y-1 w-full sm:w-auto">
                    Book Call Now
                  </Button>
                </BookingModal>
                <BookingModal>
                  <Button size="lg" variant="outline" className="text-lg px-8 h-14 border-2 border-white/20 text-white hover:bg-white hover:text-black bg-black/20 backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-1 shadow-sm w-full sm:w-auto">
                    Face-to-Face Consultation
                  </Button>
                </BookingModal>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-background relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://vibe.filesafe.space/1782888190245745251/assets/9b28bd02-75c8-4ecb-ae83-b9ae0e279fe3.png')] bg-cover bg-center opacity-5 mix-blend-overlay"></div>
          <div className="container mx-auto px-4 max-w-6xl relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative order-2 lg:order-1">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-[2rem] transform -rotate-3"></div>
                <img 
                  src="https://vibe.filesafe.space/1782888190245745251/attachments/54dc622f-31e9-4110-bde5-9b57ac0ce1f3.jpg" 
                  alt="Consultation Session" 
                  className="relative z-10 w-full h-auto rounded-3xl shadow-2xl object-cover aspect-[4/5]"
                />
              </div>
              <div className="space-y-8 order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Trusted by 25,000+ Clients</span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-serif font-bold text-foreground leading-tight">
                  Find the Clarity You Seek, <span className="text-primary">One Consultation Away.</span>
                </h2>
                <div className="space-y-6 text-lg text-foreground/70 leading-relaxed font-light">
                  <p>
                    <strong className="text-foreground font-medium">Dr. Sandeep Sawhney</strong> is a respected Vedic astrologer and Vastu expert, known for guiding over 25,000 individuals toward clarity, balance, and success. Blending deep astrological knowledge with intuition and compassion, he delivers practical, result-oriented solutions.
                  </p>
                  <p>
                    With expertise in planetary yogas, Mahadasha cycles, karmic alignment, and Vastu energies, his consultations are personalised and transformative—helping clients overcome personal, professional, and spiritual challenges.
                  </p>
                </div>
                <div className="pt-4 flex gap-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-3xl font-bold text-primary font-serif">10+</span>
                    <span className="text-xs text-foreground/60 uppercase tracking-wider font-semibold">Years Exp.</span>
                  </div>
                  <div className="w-px bg-border"></div>
                  <div className="flex flex-col gap-1">
                    <span className="text-3xl font-bold text-primary font-serif">25k+</span>
                    <span className="text-xs text-foreground/60 uppercase tracking-wider font-semibold">Clients</span>
                  </div>
                  <div className="w-px bg-border"></div>
                  <div className="flex flex-col gap-1">
                    <span className="text-3xl font-bold text-primary font-serif">50+</span>
                    <span className="text-xs text-foreground/60 uppercase tracking-wider font-semibold">Countries</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 relative z-10 bg-background overflow-hidden">
          {/* Background textures */}
          <div className="absolute inset-0 bg-[url('https://vibe.filesafe.space/1782888190245745251/assets/9b28bd02-75c8-4ecb-ae83-b9ae0e279fe3.png')] bg-cover bg-center opacity-5 mix-blend-overlay"></div>

          <div className="container mx-auto px-4 max-w-7xl relative z-10">
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto mb-16 space-y-4"
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground">
                Choose the One <span className="text-primary">That Fits You Best</span>
              </h2>

              <p className="text-lg md:text-xl text-foreground/70 font-light leading-relaxed max-w-2xl mx-auto">
                Sometimes, one call to the right person can change everything.
              </p>
            </motion.div>

            {/* Grid Layout */}
            <div className="flex flex-col xl:flex-row gap-8 mb-8">
              {/* Left Column - Small Cards */}
              <div className="flex flex-col gap-8 w-full xl:w-5/12">
                
                {/* Small Card 1 */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="bg-white border border-border/40 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-primary/20 hover:-translate-y-1 transition-all duration-500 flex flex-col h-full p-6 md:p-8"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border border-primary/20">
                      <img src="https://vibe.filesafe.space/1782888190245745251/attachments/9045c8d0-c8d3-4310-aa9d-ea95b999bd8b.png" alt="Dr. Sandeep" className="w-full h-full object-cover bg-primary/5" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-foreground">Consultation Call</h3>
                  </div>
                  
                  <p className="text-foreground/70 text-sm mb-6">Ideal for individuals seeking clarity and solutions.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div>
                      <span className="text-xs text-foreground/70 mb-2 block">Mode:</span>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-primary text-white text-[11px] rounded-full border border-primary">Normal</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-foreground/70 mb-2 block">Duration:</span>
                      <div className="flex gap-2">
                        <span onClick={() => setConsultationDuration1('30 Min')} className={getPillClass(consultationDuration1 === '30 Min')}>30 Min</span>
                        <span onClick={() => setConsultationDuration1('1 Hour')} className={getPillClass(consultationDuration1 === '1 Hour')}>1 Hour</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-foreground/70 mb-2 block">Consultation Type:</span>
                      <div className="flex gap-2">
                        <span onClick={() => setConsultationType1('Audio')} className={getPillClass(consultationType1 === 'Audio')}>Audio</span>
                        <span onClick={() => setConsultationType1('Video')} className={getPillClass(consultationType1 === 'Video')}>Video</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-8 flex-grow">
                    <span className="text-base font-bold text-foreground mb-3 block">Includes:</span>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3 text-sm text-foreground/70">
                        <div className="w-1.5 h-1.5 bg-primary rotate-45 shrink-0 mt-1.5" />
                        In-depth chart-based life analysis
                      </li>
                      <li className="flex items-start gap-3 text-sm text-foreground/70">
                        <div className="w-1.5 h-1.5 bg-primary rotate-45 shrink-0 mt-1.5" />
                        Clear direction for career, health, and personal growth
                      </li>
                      <li className="flex items-start gap-3 text-sm text-foreground/70">
                        <div className="w-1.5 h-1.5 bg-primary rotate-45 shrink-0 mt-1.5" />
                        Remedies aligned with your planetary blueprint
                      </li>
                    </ul>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between mt-auto pt-6 border-t border-primary/20 gap-4">
                    <div className="text-lg font-bold text-foreground w-full sm:w-auto text-center sm:text-left">Price: {formatINR(getPrice1())}</div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <RazorpayButton
                        service="consultation-call"
                        variant={variant1}
                        description={`Consultation Call — ${consultationDuration1} ${consultationType1}`}
                        notes={{
                          duration: consultationDuration1,
                          mode: consultationType1,
                        }}
                        className="w-full sm:w-auto h-10 px-8 rounded-md text-sm"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Small Card 2 */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-white border border-border/40 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-primary/20 hover:-translate-y-1 transition-all duration-500 flex flex-col h-full p-6 md:p-8"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border border-primary/20 flex items-center justify-center bg-primary/5">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-foreground">Couple Consultation</h3>
                  </div>
                  
                  <p className="text-foreground/70 text-sm mb-6">Perfect for those navigating relationships or marriage decisions.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div>
                      <span className="text-xs text-foreground/70 mb-2 block">Mode:</span>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-primary text-white text-[11px] rounded-full border border-primary">Normal</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-foreground/70 mb-2 block">Duration:</span>
                      <div className="flex gap-2">
                        <span onClick={() => setConsultationDuration2('30 Min')} className={getPillClass(consultationDuration2 === '30 Min')}>30 Min</span>
                        <span onClick={() => setConsultationDuration2('1 Hour')} className={getPillClass(consultationDuration2 === '1 Hour')}>1 Hour</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-foreground/70 mb-2 block">Consultation Type:</span>
                      <div className="flex gap-2">
                        <span onClick={() => setConsultationType2('Audio')} className={getPillClass(consultationType2 === 'Audio')}>Audio</span>
                        <span onClick={() => setConsultationType2('Video')} className={getPillClass(consultationType2 === 'Video')}>Video</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-8 flex-grow">
                    <span className="text-base font-bold text-foreground mb-3 block">Includes:</span>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3 text-sm text-foreground/70">
                        <div className="w-1.5 h-1.5 bg-primary rotate-45 shrink-0 mt-1.5" />
                        Compatibility and karmic alignment insights
                      </li>
                      <li className="flex items-start gap-3 text-sm text-foreground/70">
                        <div className="w-1.5 h-1.5 bg-primary rotate-45 shrink-0 mt-1.5" />
                        Clarity on love, marriage, or partnership challenges
                      </li>
                      <li className="flex items-start gap-3 text-sm text-foreground/70">
                        <div className="w-1.5 h-1.5 bg-primary rotate-45 shrink-0 mt-1.5" />
                        Remedies tailored to both partners' charts
                      </li>
                    </ul>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between mt-auto pt-6 border-t border-primary/20 gap-4">
                    <div className="text-lg font-bold text-foreground w-full sm:w-auto text-center sm:text-left">Price: {formatINR(getPrice2())}</div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <RazorpayButton
                        service="couple-consultation"
                        variant={variant2}
                        description={`Couple Consultation — ${consultationDuration2} ${consultationType2}`}
                        notes={{
                          duration: consultationDuration2,
                          mode: consultationType2,
                        }}
                        className="w-full sm:w-auto h-10 px-8 rounded-md text-sm"
                      />
                    </div>
                  </div>
                </motion.div>

              </div>

              {/* Right Column - Large Card */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="w-full xl:w-7/12 bg-white border border-border/40 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-primary/20 hover:-translate-y-1 transition-all duration-500 flex flex-col p-3"
              >
                <div className="relative h-72 sm:h-96 lg:h-[400px] w-full overflow-hidden shrink-0 rounded-t-[12px]">
                  <img 
                    src="https://vibe.filesafe.space/1782888190245745251/attachments/d82e5fbf-c860-46e6-852f-ffaca9ecc1b1.jpg" 
                    alt="Face to Face Consultation" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="p-6 md:p-8 flex flex-col flex-grow">
                  <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground text-center mb-2">Face to Face Consultation with Dr. Sandeep</h3>
                  <p className="text-foreground/70 text-sm md:text-base text-center mb-8 max-w-lg mx-auto">
                    This is not for everyone. It is only for those who truly want answers, direction, and powerful results in life.
                  </p>
                  
                  <div className="mb-8">
                    <span className="text-base font-bold text-foreground mb-4 block">What You Will Get:</span>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-foreground/70 text-sm md:text-base">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                        <span>Your kundli will be checked and explained in front of you</span>
                      </li>
                      <li className="flex items-start gap-3 text-foreground/70 text-sm md:text-base">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                        <span>One on one spiritual and astrological advice</span>
                      </li>
                      <li className="flex items-start gap-3 text-foreground/70 text-sm md:text-base">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                        <span>Remedies and energy solutions shared instantly</span>
                      </li>
                      <li className="flex items-start gap-3 text-foreground/70 text-sm md:text-base">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                        <span>You can ask anything that is troubling you</span>
                      </li>
                      <li className="flex items-start gap-3 text-foreground/70 text-sm md:text-base">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                        <span>Powerful insights you will not find anywhere else</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="mb-8">
                    <span className="text-sm font-bold uppercase tracking-wider text-foreground mb-4 block">CONSULTATION DETAILS:</span>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-foreground/70 font-medium">
                        <Clock className="w-5 h-5 text-primary" />
                        <span>1 Hour</span>
                      </div>
                      <div className="flex items-center gap-3 text-foreground/70 font-medium">
                        <MapPin className="w-5 h-5 text-primary" />
                        <span>In person (Delhi/NCR Office)</span>
                      </div>
                    </div>
                    <p className="text-xs text-foreground/70 mt-4 font-medium italic">Note : This consultation is only available in 1v1 Mode with 1 Hour duration.</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-auto pt-6 border-t border-primary/20">
                    <div className="w-full sm:w-auto text-center sm:text-left">
                      <span className="text-sm text-foreground/70 block mb-1">Price Starting from: (Incl GST)</span>
                      <div className="text-2xl font-bold text-foreground">{formatINR(FACE_TO_FACE_PRICE)}</div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <RazorpayButton
                        service="face-to-face"
                        description="Face to Face Consultation (1 Hour, Delhi/NCR Office)"
                        className="w-full sm:w-auto h-10 px-8 rounded-md text-sm"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Bottom Row - Full Width Card */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="w-full bg-white border border-border/40 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-primary/20 hover:-translate-y-1 transition-all duration-500 flex flex-col md:flex-row p-3"
            >
              <div className="w-full md:w-[35%] relative h-64 md:h-auto shrink-0 overflow-hidden rounded-[12px] md:rounded-r-none">
                <img 
                  src="https://vibe.filesafe.space/1782888190245745251/attachments/df89380d-945d-4167-89cf-1d97be074db1.jpg" 
                  alt="Baby Birth Muhurat" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-6 md:p-8 flex-grow flex flex-col">
                <h3 className="text-2xl font-serif font-bold text-foreground mb-2 text-center md:text-left">Baby Birth Muhurat Consultation</h3>
                <p className="text-foreground/70 text-sm font-medium mb-6 text-center md:text-left">Includes personalized report + muhurat options for your baby</p>
                
                <div className="mb-6">
                  <span className="text-base font-bold text-foreground mb-3 block">What You Will Get:</span>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3 text-sm text-foreground/70">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>3 highly auspicious birth muhurat options (aligned with doctor-approved window)</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-foreground/70">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>Deep planetary analysis for your baby's lifelong growth & protection</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-foreground/70">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>1-on-1 consultation with Dr. Sandeep</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-foreground/70">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>Personalized Baby Birth Muhurat Report (detailed PDF)</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mb-6">
                  <span className="text-sm font-bold uppercase tracking-wider text-foreground mb-3 block">CONSULTATION DETAILS:</span>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm text-foreground/70 font-medium">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>Duration: 30 Min</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-foreground/70 font-medium">
                      <Video className="w-4 h-4 text-primary" />
                      <span>Mode: Normal</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-auto pt-6 border-t border-primary/20">
                  <div className="w-full sm:w-auto text-center sm:text-left">
                    <span className="text-sm text-foreground/70 block mb-1">Price Starting from: (Incl GST)</span>
                    <div className="text-2xl font-bold text-foreground">{formatINR(BABY_MUHURAT_PRICE)}</div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <RazorpayButton
                      service="baby-muhurat"
                      description="Baby Birth Muhurat Consultation"
                      className="w-full sm:w-auto h-10 px-8 rounded-md text-sm"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </section>

        <FinalCTA 
          title="Ready to Transform Your Life?"
          description="Book a consultation today and unlock the doors to health, wealth, and prosperity with expert guidance."
          primaryBtnText="Book Consultation Now"
          primaryBtnLink="/get-consultation"
          secondaryBtnText="Contact Us"
        />
      </main>

      <Footer />
    </div>
  );
};

export default GetConsultation;