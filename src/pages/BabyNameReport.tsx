import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FinalCTA } from "@/components/FinalCTA";
import { BookingModal } from "@/components/BookingModal";
import { CalculatorForm } from "@/components/CalculatorForm";

import { 
  Baby, SunMedium, FileText, CheckCircle2, Award, 
  Clock, Heart, Download, BookOpen, Sparkles,
  Sun, Moon, Compass, Hash, Palette, Zap,
  UserCheck, Infinity, ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

const BabyNameReport = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-grow">
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
                  <span className="font-light">Vedic Astrology Service</span>
                </div>
                
<h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-serif leading-tight mb-6 text-white">
                  Baby Name <span className="text-secondary">Report</span>
                </h1>
                
                <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Give your child a meaningful, lucky, and spiritually aligned name based on Vedic Astrology, Nakshatra, Rashi, Birth Details, and Numerology.
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
                  <CalculatorForm type="babyname" title="Free Baby Name Generator" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WHAT IS BABY NAME REPORT */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/5 rounded-3xl transform rotate-3 scale-105 z-0"></div>
                <img 
                  src="https://vibe.filesafe.space/1782888190245745251/attachments/14b6cb69-0c2c-46cf-974d-6637a749f8a9.png" 
                  alt="Baby Name Report Overview" 
                  className="relative z-10 w-full h-auto object-cover shadow-xl border border-border/50 rounded-3xl"
                />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl md:text-5xl font-bold font-serif text-black">What is a <span className="text-primary">Baby Name Report?</span></h2>
                <p className="text-lg text-black/80 leading-relaxed">
                  The Baby Name Report is a personalized astrology report that helps parents choose a meaningful, lucky, and spiritually aligned name for their child using Vedic Astrology and Numerology.
                </p>
                <p className="text-lg text-black/80 leading-relaxed">
                  The report is prepared by expert astrologers after carefully analyzing:
                </p>
                <ul className="grid sm:grid-cols-2 gap-4 mt-6">
                  {['Date of Birth', 'Time of Birth', 'Place of Birth', 'Janma Nakshatra', 'Moon Sign (Rashi)', 'Numerology', 'Planetary Positions'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-black/90 font-medium">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="pt-6">
                  <BookingModal>
                    <Button size="lg" className="bg-[#1a1a1a] hover:bg-primary text-white text-lg px-8 h-14 shadow-[0_8px_20px_-6px_rgba(26,26,26,0.4)] transition-all duration-300 ease-out hover:-translate-y-1">
                      Order Now
                    </Button>
                  </BookingModal>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WHAT YOU WILL RECEIVE */}
        <section className="py-24 bg-muted">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-bold font-serif mb-6 text-black">What You Will <span className="text-primary">Receive</span></h2>
              <p className="text-lg text-black/80">A comprehensive, beautifully designed PDF report containing everything you need to choose the perfect name.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[
                { title: "Lucky Starting Letters", icon: FileText },
                { title: "Personalized Suggestions", icon: Sparkles },
                { title: "Sanskrit Names", icon: BookOpen },
                { title: "Modern Names", icon: SunMedium },
                { title: "Name Meaning", icon: Heart },
                { title: "Lucky Numerology Number", icon: Hash },
                { title: "Nakshatra Analysis", icon: Sun },
                { title: "Rashi Guidance", icon: Moon },
                { title: "Planetary Influence", icon: Compass },
                { title: "Lucky Colors", icon: Palette },
                { title: "Lucky Numbers", icon: Hash },
                { title: "Positive Energy Analysis", icon: Zap },
              ].map((item, i) => (
                <Card key={i} className="group hover:-translate-y-2 transition-transform duration-300 border border-border/30 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] bg-white">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-2xl bg-secondary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors text-black">{item.title}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* WHY CHOOSE JYOTISHNOW */}
        <section className="py-24 bg-background relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-muted/50 to-transparent pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-bold font-serif mb-6 text-black">Why Choose <span className="text-primary">JyotishNow</span></h2>
              <p className="text-lg text-black/80">Trusted by thousands of parents worldwide for accurate and meaningful baby names.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Expert Astrologers", icon: Award },
                { title: "100% Personalized Analysis", icon: UserCheck },
                { title: "Authentic Vedic Astrology", icon: Compass },
                { title: "Numerology Based Naming", icon: Hash },
                { title: "Beautiful PDF Report", icon: FileText },
                { title: "Fast Digital Delivery", icon: Zap },
                { title: "Easy to Understand", icon: BookOpen },
                { title: "Lifetime Report Access", icon: Infinity }
              ].map((feature, i) => (
                <div key={i} className="group relative flex flex-col items-center text-center gap-4 p-8 bg-white border border-border/40 hover:border-primary/20 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                  <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300 relative z-10">
                    <feature.icon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-bold text-lg text-black relative z-10">{feature.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHO SHOULD BUY THIS REPORT */}
        <section className="relative overflow-hidden bg-primary text-primary-foreground pt-32 pb-14">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('https://vibe.filesafe.space/1782888190245745251/assets/9b28bd02-75c8-4ecb-ae83-b9ae0e279fe3.png')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-primary"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-bold font-serif mb-6 text-white">Who Should Buy <span className="text-secondary">This Report?</span></h2>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Expecting Parents", icon: Heart },
                { title: "New Parents", icon: Baby },
                { title: "Families Choosing Baby Names", icon: BookOpen },
                { title: "Naming Ceremony Preparation", icon: Sparkles }
              ].map((audience, i) => (
                <div key={i} className="group relative bg-white/5 border border-white/10 backdrop-blur-md p-8 text-center rounded-2xl hover:bg-white/10 hover:border-secondary/30 shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-2xl" />
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-secondary transition-all duration-300">
                    <audience.icon className="w-8 h-8 text-secondary group-hover:text-secondary-foreground transition-colors" />
                  </div>
                  <h3 className="font-bold text-xl text-white group-hover:text-secondary transition-colors">{audience.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
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
                Get your personalized report in three simple steps.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative max-w-5xl mx-auto">
              {[
                { title: "Submit Birth Details", desc: "Fill your baby's birth details including date, time, and place of birth." },
                { title: "Expert Analysis", desc: "Expert astrologers prepare your personalized report." },
                { title: "Receive Your Report", desc: "Receive a professionally designed PDF Baby Name Report directly on your email." }
              ].map((step, i) => (
                <div key={i} className="relative flex flex-col items-center text-center group">
                  {/* Decorative connecting line with animated arrow */}
                  {i < 2 && (
                    <div className="hidden md:block absolute top-12 left-[50%] w-[100%] h-[2px] z-0">
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
          </div>
        </section>

        {/* BENEFITS SECTION */}
        <section className="relative overflow-hidden bg-primary text-primary-foreground pt-32 pb-14">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('https://vibe.filesafe.space/1782888190245745251/assets/9b28bd02-75c8-4ecb-ae83-b9ae0e279fe3.png')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-primary"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-bold font-serif mb-6 text-white">Benefits of the <span className="text-secondary">Report</span></h2>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Choose names aligned with Nakshatra", icon: Moon },
                { title: "Positive name vibrations", icon: Sparkles },
                { title: "Better numerology compatibility", icon: Hash },
                { title: "Traditional & modern name options", icon: BookOpen },
                { title: "Easy naming decision", icon: CheckCircle2 },
                { title: "Spiritual guidance", icon: Compass },
                { title: "Meaningful names", icon: Heart },
                { title: "Lucky initials", icon: SunMedium }
              ].map((benefit, i) => (
                <div key={i} className="group relative bg-white/5 border border-white/10 backdrop-blur-md p-8 text-center rounded-2xl hover:bg-white/10 hover:border-secondary/30 shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-2xl" />
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-secondary transition-all duration-300">
                    <benefit.icon className="w-8 h-8 text-secondary group-hover:text-secondary-foreground transition-colors" />
                  </div>
                  <h3 className="font-bold text-lg text-white group-hover:text-secondary transition-colors">{benefit.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* FINAL CTA */}
        <FinalCTA 
          title="Give Your Child the Perfect Start with the Right Name"
          description="Receive a personalized Baby Name Report prepared by experienced astrologers using Vedic Astrology and Numerology."
          primaryBtnText="Order Baby Name Report"
          secondaryBtnText="Talk to an Astrologer"
          secondaryBtnLink="/get-consultation"
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default BabyNameReport;