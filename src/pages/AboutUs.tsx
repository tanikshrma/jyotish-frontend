import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TrustBadges } from "@/components/TrustBadges";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Award, BookOpen, Shield, Heart, Star, Users, SunMedium } from "lucide-react";
import { FinalCTA } from "@/components/FinalCTA";
import { BookingModal } from "@/components/BookingModal";
import { SEO } from "@/components/SEO";

const AboutUs = () => {
  return (
    <div className="relative min-h-screen bg-background">
      <SEO 
        title="About Us - JyotishNow | Dr. Sandeep Sawhney" 
        description="Learn about JyotishNow and Dr. Sandeep Sawhney's 10+ years of experience in Vedic Astrology, Numerology, and Vastu."
      />
      {/* Global Pattern Overlay */}
      <div 
        className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at center, #f5c178 1.5px, transparent 1.5px)`,
          backgroundSize: `24px 24px`
        }}
      />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow">
          {/* Hero Section */}
          <section className="relative overflow-hidden bg-primary text-primary-foreground min-h-[100svh] flex items-center pt-24 pb-14">
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-[url('https://vibe.filesafe.space/1782888190245745251/attachments/b7bc601f-ee5d-473f-873d-5d3ad9cf3af7.png')] bg-cover bg-[position:80%_center] md:bg-right"></div>
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
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-sm font-semibold mb-8 backdrop-blur-sm shadow-[0_4px_10px_-2px_rgba(0,0,0,0.1)] pt-[10px] pb-[10px] pl-[15px] pr-[15px] rounded-md">
                  <SunMedium className="lucide lucide-star fill-white text-white w-[18px] h-[17px]" />
                  <span className="font-light">India's Most Trusted Vedic Astrologer</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-serif leading-tight mb-6 text-white">
                  About <span className="text-secondary">JyotishNow</span>
                </h1>
                
                <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl leading-relaxed">
                  Rooted in a 51+ years legacy of authentic Indian astrology, JyotishNow is built on research, ethics, and responsibility. We guide individuals toward a better future with precise Vedic calculations and spiritual wisdom.
                </p>

                <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
                  <Button asChild size="lg" className="bg-white hover:bg-white/90 text-black text-lg px-8 h-14 shadow-[0_8px_20px_-6px_rgba(255,255,255,0.3)] transition-all duration-300 ease-out hover:-translate-y-1 w-full sm:w-auto">
                    <a href="#story">Read Our Story</a>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Meet The Expert */}
          <section id="story" className="py-24 bg-[#FFF8F0] relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-secondary/10 to-transparent z-0"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl z-0"></div>
            
            <div className="container mx-auto px-4 max-w-[1300px] relative z-10">
              <div className="flex flex-col lg:flex-row items-center gap-16 xl:gap-24">
                <div className="w-full lg:w-1/2">
                  <div className="relative max-w-md mx-auto lg:max-w-none">
                    {/* Decorative frame */}
                    <div className="absolute inset-0 border-2 border-secondary/40 rounded-2xl translate-x-4 translate-y-4 lg:translate-x-6 lg:translate-y-6 z-0"></div>
                    <div className="absolute inset-0 bg-white rounded-2xl shadow-xl z-0"></div>
                    
                    <div className="relative z-10 p-2 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                      <img 
                        src="https://vibe.filesafe.space/1782888190245745251/attachments/bb04e9ad-4df5-45a2-b9e1-777b70d984e1.jpg" 
                        alt="Dr. Sandeep Sawhney" 
                        className="w-full h-auto object-cover rounded-xl"
                        loading="lazy"
                      />
                    </div>
                    
                    {/* Floating Badge */}
                    <div className="absolute -bottom-6 -left-6 lg:-left-8 z-20 bg-white p-5 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-secondary/20 flex items-center gap-5">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-secondary to-[#E8B25A] flex items-center justify-center text-white shadow-inner">
                        <Award className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="font-serif font-bold text-2xl text-primary">10+ Years</p>
                        <p className="text-sm font-medium text-black/60 uppercase tracking-wider">Experience</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="w-full lg:w-1/2 space-y-8 mt-12 lg:mt-0">
                  <div>
                    <h2 className="text-4xl lg:text-5xl font-bold font-serif mb-6 text-black leading-tight">
                      Meet <span className="text-primary block mt-2">Dr. Sandeep Sawhney</span>
                    </h2>
                    <p className="text-black/70 leading-relaxed text-lg">
                      Dr. Sandeep Sawhney is a highly respected Vedic Astrologer, Numerologist, and Vastu Expert. With over a decade of profound experience in occult sciences, he has transformed the lives of thousands of individuals across the globe.
                    </p>
                  </div>
                  
                  <div className="space-y-6 bg-white p-8 rounded-2xl border border-secondary/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <div className="flex items-start gap-5">
                      <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-black text-xl mb-2">Deep Vedic Knowledge</h4>
                        <p className="text-black/70 leading-relaxed">Expertise in Parashari Astrology, Lal Kitab, and KP System to provide highly accurate predictions.</p>
                      </div>
                    </div>
                    
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
                    
                    <div className="flex items-start gap-5">
                      <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
                        <Heart className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-black text-xl mb-2">Compassionate Guidance</h4>
                        <p className="text-black/70 leading-relaxed">Providing practical and easy-to-follow remedies that bring peace, prosperity, and success.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 flex flex-col sm:flex-row gap-6 items-center">
                    <BookingModal>
                      <Button size="lg" className="w-full sm:w-auto h-14 px-8 bg-gradient-to-r from-primary to-[#96161B] hover:from-[#96161B] hover:to-primary text-white shadow-[0_8px_20px_-6px_rgba(122,8,8,0.4)] transition-all duration-300 hover:-translate-y-1 text-lg font-medium rounded-xl">
                        Book a Consultation
                      </Button>
                    </BookingModal>
                    
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                        <Users className="w-6 h-6 text-secondary" />
                      </div>
                      <div>
                        <p className="font-bold text-black text-lg">10,000+</p>
                        <p className="text-sm text-black/60">Happy Clients</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Mission & Vision */}
          <section className="py-20 bg-muted/50">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white border border-border/40 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 group h-full flex flex-col">
                  <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Star className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold mb-4 text-foreground">Our Mission</h3>
                  <p className="text-foreground/70 leading-relaxed">
                    To demystify Vedic Astrology and make its profound wisdom accessible to everyone. We strive to provide genuine, logical, and highly accurate astrological guidance that empowers individuals to make informed life choices and overcome challenges with confidence.
                  </p>
                </div>
                
                <div className="bg-white border border-border/40 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 group h-full flex flex-col">
                  <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-6 text-secondary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Shield className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold mb-4 text-foreground">Our Vision</h3>
                  <p className="text-foreground/70 leading-relaxed">
                    To be the most trusted and reliable platform for authentic Vedic Astrology globally. We envision a world where ancient astrological wisdom harmoniously blends with modern life, helping people achieve spiritual growth, mental peace, and material success.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Why Choose Us */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#1a1a1a]">
                  Why Choose <span className="text-primary">JyotishNow?</span>
                </h2>
                <p className="text-black/80 text-lg">
                  We stand apart through our commitment to authenticity, accuracy, and ethical astrological practices.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: Shield,
                    title: "100% Authentic",
                    desc: "Our predictions are based strictly on ancient Vedic principles and classical texts, ensuring pure and unadulterated guidance."
                  },
                  {
                    icon: Users,
                    title: "Personalized Approach",
                    desc: "Every consultation is unique. We deeply analyze your specific birth chart to provide tailored solutions for your exact life situations."
                  },
                  {
                    icon: Heart,
                    title: "Ethical Remedies",
                    desc: "We suggest simple, practical, and highly effective remedies without promoting fear or expensive, unnecessary rituals."
                  }
                ].map((feature, i) => (
                  <div key={i} className="bg-white border border-border/40 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 group text-center h-full flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <feature.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-serif font-bold mb-3 text-foreground">{feature.title}</h3>
                    <p className="text-foreground/70 leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <TrustBadges />
          
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
    </div>
  );
};

export default AboutUs;
