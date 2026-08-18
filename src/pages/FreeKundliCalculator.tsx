import { KundliCalculator } from "@/components/KundliCalculator";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FinalCTA } from "@/components/FinalCTA";
import { Star, CheckCircle2, FileText, Compass, Heart, Briefcase, Stethoscope, Landmark, Sun, Moon, Sparkles, Clock, ShieldCheck, Users, BookOpen, ChevronDown, CalendarDays, Orbit, ScrollText, ArrowRight, SunMedium } from "lucide-react";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";

export default function FreeKundliCalculator() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO 
        title="Free Janam Kundli Calculator - JyotishNow" 
        description="Generate your free Kundli instantly. Get your comprehensive Vedic astrology chart, dosha analysis, and planetary positions."
      />
      <Header />
      
      <main className="flex-1">
        {/* Section 1: Premium Hero */}
        <section className="pt-32 pb-20 relative overflow-hidden bg-primary text-primary-foreground min-h-[90vh] flex items-center">
          <div className="absolute inset-0 z-0">
            <div 
              className="absolute inset-0 bg-cover bg-[position:80%_center] md:bg-right" 
              style={{ backgroundImage: `url('https://vibe.filesafe.space/1782888190245745251/attachments/47f81405-bf4d-4943-8023-91bad5d11cf3.png')` }}
            ></div>
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
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-sm font-semibold mb-8 backdrop-blur-sm shadow-[0_4px_10px_-2px_rgba(0,0,0,0.1)] pt-[10px] pb-[10px] pl-[15px] pr-[15px] rounded-md">
                  <SunMedium className="lucide lucide-star fill-white text-white w-[18px] h-[17px]" />
                  <span className="font-light">India's Most Trusted Astrology Platform</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-serif leading-tight mb-6 text-white">
                  Janam <span className="text-secondary">Kundli</span> Report
                </h1>
                
                <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Enter your birth details to instantly generate your comprehensive Vedic astrology chart, complete with dosha analysis, planetary positions, and predictions.
                </p>
                
                <div className="pt-6 flex justify-center lg:justify-start">
                  <Button 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="h-14 px-8 bg-white hover:bg-white/90 text-black font-bold rounded-xl shadow-[0_8px_20px_-6px_rgba(255,255,255,0.3)] transition-all duration-300 ease-out hover:-translate-y-1 text-lg w-full sm:w-auto"
                  >
                    Get Instant Report <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </div>
              
              {/* Right Content - Calculator */}
              <div className="w-full max-w-md mx-auto lg:max-w-none relative">
                <div className="absolute -inset-4 bg-secondary/20 blur-3xl rounded-full opacity-50"></div>
                <div className="relative z-10">

                  <KundliCalculator />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: What is Kundli? */}
        <section className="py-24 bg-muted relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-bold font-serif mb-6 text-black">
                  What is a <span className="text-primary">Kundli?</span>
                </h2>
                <p className="text-lg text-black/80 mb-4">
                  A Kundli (also known as a Birth Chart or Horoscope) is an astrological diagram representing the exact positions of celestial bodies at the precise moment of your birth. In Vedic astrology, it serves as a cosmic blueprint of your life.
                </p>
                <p className="text-lg text-black/80">
                  By analyzing your Kundli, expert astrologers can decode your personality, strengths, weaknesses, and the timeline of major life events including career milestones, marriage, health, and financial success.
                </p>
                <ul className="space-y-3 pt-4">
                  {[
                    "Discover your life purpose and true potential",
                    "Identify auspicious times for major decisions",
                    "Understand relationship dynamics and compatibility",
                    "Find remedies for planetary afflictions (Doshas)"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-secondary shrink-0 mt-0.5" />
                      <span className="text-foreground font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-secondary/20 blur-3xl rounded-full"></div>
                <img 
                  src="https://vibe.filesafe.space/1782888190245745251/attachments/db245bfd-a300-4ecf-8b11-5de8daeabef8.png" 
                  alt="Vedic Astrology Kundli Illustration" 
                  className="w-full h-auto max-w-md mx-auto relative z-10 drop-shadow-2xl hover:-translate-y-2 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: How Kundli Works */}
        <section className="py-24 bg-[#FFFDF9] relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at center, #F5C27A 1.5px, transparent 1.5px)`,
              backgroundSize: `24px 24px`
            }}
          />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl md:text-5xl font-bold font-serif mb-6 text-[#7A0808]">
                How It Works
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#F5C27A] to-transparent mx-auto mb-6" />
              <p className="text-lg text-gray-600">
                Start your astrology journey in four simple steps.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative max-w-6xl mx-auto">
              {[
                { title: "Fill Birth Details", desc: "Enter your accurate birth date, time and place." },
                { title: "Generate Kundli", desc: "Our AI instantly prepares your Vedic birth chart." },
                { title: "Get Expert Analysis", desc: "Receive detailed horoscope predictions and dosha analysis." },
                { title: "Receive Guidance", desc: "Book consultation and get personalized remedies." }
              ].map((step, i) => (
                <div key={i} className="relative flex flex-col items-center text-center group">
                  {/* Decorative connecting line with animated arrow */}
                  {i < 3 && (
                    <div className="hidden lg:block absolute top-12 left-[50%] w-[100%] h-[2px] z-0">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F5C27A]/50 to-transparent" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[#FFFDF9] rounded-full border border-[#F5C27A]/30">
                        <ArrowRight className="w-4 h-4 text-[#7A0808] animate-pulse" />
                      </div>
                    </div>
                  )}
                  {/* Step Number */}
                  <div className="w-24 h-24 rounded-full bg-[#FFFDF9] border-2 border-[#F5C27A]/30 flex items-center justify-center mb-8 relative z-10 group-hover:-translate-y-2 transition-all duration-500 shadow-xl group-hover:shadow-[#F5C27A]/20 group-hover:border-[#F5C27A]">
                    <div className="absolute inset-2 rounded-full border border-dashed border-[#F5C27A]/40 group-hover:border-[#F5C27A] transition-colors duration-500"></div>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#F5C27A]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <span className="text-3xl font-bold font-serif text-[#7A0808] group-hover:text-[#F5C27A] transition-colors duration-500">0{i+1}</span>
                  </div>
                  
                  {/* Content */}
                  <div className="bg-white w-full p-8 rounded-2xl border border-[#E9DED3] shadow-sm group-hover:shadow-lg transition-all duration-500 group-hover:border-[#F5C27A]/30 flex-1">
                    <h4 className="text-xl font-bold font-serif text-[#7A0808] mb-3">{step.title}</h4>
                    <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-16">
              <Button 
                asChild
                size="lg"
                className="group"
              >
                <Link to="/get-consultation">
                  Book Consultation
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Section 4: Premium Banner */}
        <section className="py-20 relative overflow-hidden bg-primary text-white text-center">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('https://vibe.filesafe.space/1782888190245745251/assets/9b28bd02-75c8-4ecb-ae83-b9ae0e279fe3.png')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold font-serif mb-6 drop-shadow-md transition-all duration-1000 ease-out opacity-100 translate-y-0 text-white">
              Unlock the Secrets of Your Destiny
            </h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto mb-10 font-light">
              Get an in-depth analysis of your life path, career, marriage, and wealth with our premium astrology reports.
            </p>
            <Button asChild size="lg" className="bg-white hover:bg-white/90 text-black text-lg px-8 h-14 shadow-[0_8px_20px_-6px_rgba(255,255,255,0.3)] transition-all duration-300 ease-out hover:-translate-y-1">
              <Link to="/complete-horoscope-analysis">
                Get Detailed Horoscope
              </Link>
            </Button>
          </div>
        </section>

        {/* Section 5: Feature Grid */}
        <section className="py-24 bg-muted relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold font-serif mb-6 text-black">
                What's Inside Your <span className="text-primary">Free Kundli?</span>
              </h2>
              <p className="text-lg text-black/80">
                Our free Kundli report provides a comprehensive overview of your astrological profile, covering every aspect of your life.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                { icon: Clock, title: "Instant Kundli", desc: "Get your detailed chart generated in seconds." },
                { icon: Compass, title: "Accurate Birth Chart", desc: "Precise Lagna and Navamsa charts based on Vedic rules." },
                { icon: Sun, title: "Planet Analysis", desc: "Detailed positions and states of all 9 planets." },
                { icon: Moon, title: "Nakshatra Details", desc: "Deep insights into your birth star and its lords." },
                { icon: Briefcase, title: "Career Insights", desc: "Discover the best professions suited for you." },
                { icon: Heart, title: "Marriage & Love", desc: "Understand your relationship compatibility and timing." },
                { icon: Stethoscope, title: "Health Overview", desc: "Identify potential health concerns and remedies." },
                { icon: Landmark, title: "Wealth & Finance", desc: "Analyze your financial prospects and yogas." },
                { icon: Sparkles, title: "Effective Remedies", desc: "Practical solutions for planetary afflictions." }
              ].map((feature, i) => (
                <div key={i} className="bg-white border border-border/40 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 group h-full">
                  <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary transition-colors duration-300">
                    <feature.icon className="w-6 h-6 text-primary group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h4 className="text-xl font-bold font-serif text-primary mb-2">{feature.title}</h4>
                  <p className="text-foreground/70">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 6: Why Choose Jyotish Now */}
        <section className="py-24 bg-primary text-white relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('https://vibe.filesafe.space/1782888190245745251/assets/9b28bd02-75c8-4ecb-ae83-b9ae0e279fe3.png')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1 grid grid-cols-2 gap-4">
                <div className="space-y-4 mt-8">
                  <div className="bg-white/10 p-6 rounded-2xl border border-white/20 text-center backdrop-blur-sm hover:bg-white/15 transition-all duration-300">
                    <h4 className="text-4xl font-bold text-secondary mb-2">20+</h4>
                    <p className="text-white font-medium">Years Experience</p>
                  </div>
                  <div className="bg-white/10 p-6 rounded-2xl border border-white/20 text-center backdrop-blur-sm hover:bg-white/15 transition-all duration-300">
                    <h4 className="text-4xl font-bold text-secondary mb-2">100K+</h4>
                    <p className="text-white font-medium">Happy Users</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/10 p-6 rounded-2xl border border-white/20 text-center backdrop-blur-sm hover:bg-white/15 transition-all duration-300">
                    <ShieldCheck className="w-12 h-12 text-secondary mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-white mb-2">Expert Predictions</h4>
                    <p className="text-white/80 text-sm">Highly accurate readings</p>
                  </div>
                  <div className="bg-white/10 p-6 rounded-2xl border border-white/20 text-center backdrop-blur-sm hover:bg-white/15 transition-all duration-300">
                    <BookOpen className="w-12 h-12 text-secondary mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-white mb-2">Vedic Knowledge</h4>
                    <p className="text-white/80 text-sm">Authentic ancient wisdom</p>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2 space-y-6">
                <h2 className="text-4xl md:text-5xl font-bold font-serif mb-6 text-white">
                  Why Choose <span className="text-secondary">Jyotish Now?</span>
                </h2>
                <p className="text-lg text-white/90 mb-4 font-light">
                  Under the expert guidance of Dr. Sandeep Sawhney, Jyotish Now has emerged as India's most trusted platform for authentic Vedic astrology. 
                </p>
                <p className="text-lg text-white/90 font-light">
                  We don't just generate charts; we provide profound insights that empower you to make informed life decisions. Our calculations are 100% accurate, based on traditional astrological principles combined with advanced algorithms.
                </p>
                <Link to="/about-us" className="inline-flex items-center text-secondary font-bold hover:underline mt-4 group">
                  Read our full story <ChevronDown className="w-4 h-4 ml-1 -rotate-90 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>






        {/* Section 10: FAQs */}
        <section className="py-24 bg-[#FFF8F0]">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold font-serif mb-6 text-black">
                Frequently Asked <span className="text-primary">Questions</span>
              </h2>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              {[
                { q: "Is this Kundli completely free?", a: "Yes, our basic Kundli generation is 100% free. You instantly receive a detailed chart and fundamental analysis without any hidden charges." },
                { q: "How accurate are the calculations?", a: "Our calculator uses advanced ephemeris data and authentic Vedic astrology algorithms to ensure pinpoint accuracy in planetary positions and dasha calculations." },
                { q: "What details do I need to generate my Kundli?", a: "You need your exact Date of Birth, Time of Birth, and Place of Birth to generate an accurate Kundli." },
                { q: "Can I download my Kundli?", a: "Yes, once your interactive Kundli book is generated, you have the option to download it as a premium PDF for future reference." },
                { q: "Is my personal data safe?", a: "Absolutely. We respect your privacy and do not share your birth details with any third parties. Your data is processed securely." }
              ].map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger>
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent>
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <div className="mt-12 text-center">
               <p className="text-[#4A2B1F] text-lg font-medium mb-4">Still have questions?</p>
               <Button asChild className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full px-8 h-12 shadow-[0_8px_20px_-6px_rgba(37,211,102,0.4)] transition-all duration-300 hover:-translate-y-1">
                 <a href="https://wa.me/917015544187" target="_blank" rel="noopener noreferrer">
                   <svg className="w-5 h-5 mr-2 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                     <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                   </svg>
                   Connect on WhatsApp
                 </a>
               </Button>
            </div>
          </div>
        </section>

        {/* Section 11: Final CTA */}
        <FinalCTA 
          title="Ready to Discover Your Destiny?"
          description="Generate your free Kundli now and unlock the cosmic blueprint of your life."
          primaryBtnText="Generate Your Free Kundli"
          primaryBtnLink="/free-kundli"
        />
      </main>
      
      <Footer />
    </div>
  );
}
