import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle2, Home, Building2, Factory, MonitorSmartphone, ArrowRight, Star, SunMedium } from "lucide-react";
import { FinalCTA } from "@/components/FinalCTA";
import { BookingModal } from "@/components/BookingModal";
import { RazorpayButton } from "@/components/RazorpayButton";
import { formatINR, getPriceInRupees } from "../../shared/pricing";
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";

const VastuConsultancy = () => {
  return (
    <div className="relative min-h-screen bg-background">
      <SEO 
        title="Vastu Consultancy - JyotishNow" 
        description="Harmonize your home and workplace with expert Vastu consultancy from Dr. Sandeep Sawhney. Attract peace, prosperity, and success."
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
              <div className="absolute inset-0 bg-[url('https://vibe.filesafe.space/1782888190245745251/attachments/3c08f20c-1838-44bd-bbf6-259c9dca84fb.png')] bg-cover bg-[position:80%_center] md:bg-right"></div>
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
                  <span className="font-light">Expert Vastu Consultancy</span>
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-serif leading-tight mb-6 text-white"
                >
                  Harmonize Your Space for <span className="text-secondary">Health, Wealth & Happiness</span>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-lg md:text-xl text-white/90 mb-8 max-w-xl leading-relaxed"
                >
                  Transform your home or workspace with authentic Vastu Shastra principles. Get personalized, scientific, and non-destructive remedies to invite positive energy and prosperity into your life.
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-4 sm:gap-5 mb-8 w-full sm:w-auto"
                >
                  <BookingModal defaultService="vastu-consultancy">
                    <Button size="lg" className="bg-white hover:bg-white/90 text-black text-lg px-8 h-14 shadow-[0_8px_20px_-6px_rgba(255,255,255,0.3)] transition-all duration-300 ease-out hover:-translate-y-1 w-full sm:w-auto">
                      Book Vastu Consultation
                    </Button>
                  </BookingModal>
                  <Button 
                    onClick={() => {
                      const el = document.getElementById('what-is-vastu');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    size="lg" 
                    variant="outline" 
                    className="w-full sm:w-auto text-lg px-8 h-14 border-2 border-white/20 text-white hover:bg-white hover:text-black bg-black/20 backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-1 shadow-sm"
                  >
                    Learn More
                  </Button>
                </motion.div>
              </div>
            </div>
          </section>

          {/* What is Vastu Section */}
          <section id="what-is-vastu" className="py-24 bg-background">
            <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/5 rounded-3xl transform rotate-3 scale-105 z-0"></div>
                <img 
                  src="https://vibe.filesafe.space/1782888190245745251/attachments/e3c7a86d-dfb0-40e1-8b14-e14c6a580043.jpg" 
                  alt="Vastu Shastra Overview" 
                  className="relative z-10 w-full h-auto object-cover shadow-xl border border-border/50 rounded-3xl"
                />
              </div>
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-5xl font-bold font-serif text-black">
                    What is <span className="text-primary">Vastu Shastra?</span>
                  </h2>
                  <p className="text-lg text-black/80 leading-relaxed">
                    Vastu Shastra is the ancient Indian science of architecture and design that guides the spatial arrangement and orientation of buildings. It harmonizes the five elements of nature—Earth, Water, Fire, Air, and Space—with the cosmic energies to create a balanced and prosperous living environment.
                  </p>
                  <p className="text-lg text-black/80 leading-relaxed">
                    A Vastu-compliant space attracts positive vibrations, enhances well-being, supports financial growth, and brings peace of mind to its occupants. Our expert Vastu consultancy provides logical, scientific, and easy-to-implement solutions to correct energy imbalances in your property.
                  </p>
                  
                  <div className="pt-6">
                    <BookingModal defaultService="vastu-consultancy">
                      <Button size="lg" className="bg-[#1a1a1a] hover:bg-primary text-white text-lg px-8 h-14 shadow-[0_8px_20px_-6px_rgba(26,26,26,0.4)] transition-all duration-300 ease-out hover:-translate-y-1">
                        Get Your Space Audited
                      </Button>
                    </BookingModal>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Our Vastu Services */}
          <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#1a1a1a]">
                  Our <span className="text-primary">Vastu Services</span>
                </h2>
                <p className="text-black/80 text-lg">
                  We offer comprehensive Vastu consultancy for all types of properties to ensure a harmonious flow of energy.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    icon: Home,
                    title: "Residential Vastu",
                    desc: "Harmonize your home to bring peace, health, and prosperity for your family."
                  },
                  {
                    icon: Building2,
                    title: "Commercial Vastu",
                    desc: "Optimize your office or shop layout for business growth and financial stability."
                  },
                  {
                    icon: Factory,
                    title: "Industrial Vastu",
                    desc: "Enhance productivity and minimize losses in your factory or manufacturing unit."
                  },
                  {
                    icon: MonitorSmartphone,
                    title: "Online Vastu",
                    desc: "Get expert Vastu guidance globally through detailed floor plan analysis."
                  }
                ].map((service, i) => (
                  <div key={i} className="bg-white border border-border/40 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 group h-full flex flex-col">
                    <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors text-primary group-hover:text-white">
                      <service.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-[#1a1a1a]">{service.title}</h3>
                    <p className="text-black/70 leading-relaxed mb-6">{service.desc}</p>
                    <BookingModal defaultService="vastu-consultancy">
                      <button className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
                        Know More <ArrowRight className="w-4 h-4" />
                      </button>
                    </BookingModal>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Vastu Consultation Charges */}
          <section className="py-24 bg-secondary/5">
            <div className="container mx-auto px-4 max-w-5xl">
              <div className="text-center mb-14">
                <h2 className="text-4xl md:text-5xl font-bold font-serif mb-4 text-[#1a1a1a]">
                  Consultation <span className="text-primary">Charges</span>
                </h2>
                <p className="text-black/70 max-w-2xl mx-auto text-lg">
                  Choose the consultation that suits your needs. Every session is one-on-one with our expert Vastu consultant.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Online Discussion */}
                <div className="bg-white border border-border/40 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.05)] flex flex-col">
                  <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center mb-5 text-primary">
                    <MonitorSmartphone className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold font-serif mb-2 text-[#1a1a1a]">Online Discussion</h3>
                  <p className="text-black/70 mb-6 flex-grow">
                    Detailed Vastu analysis and remedies over a virtual consultation, based on your floor plan and directions.
                  </p>
                  <div className="text-3xl font-bold text-primary mb-6">
                    {formatINR(getPriceInRupees("vastu-consultancy", "online") ?? 0)}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <RazorpayButton
                      service="vastu-consultancy"
                      variant="online"
                      description="Vastu Consultancy — Online Discussion"
                      className="w-full sm:flex-1 h-12 px-6 rounded-xl text-base"
                    />
                    <BookingModal defaultService="vastu-consultancy">
                      <Button variant="outline" className="w-full sm:w-auto h-12 px-6 rounded-xl">
                        Book a Slot
                      </Button>
                    </BookingModal>
                  </div>
                </div>

                {/* On-Site Visit */}
                <div className="bg-white border-2 border-primary/30 rounded-2xl p-8 shadow-[0_12px_40px_-12px_rgba(122,8,8,0.18)] flex flex-col relative">
                  <span className="absolute top-5 right-5 bg-secondary text-primary text-xs font-bold px-3 py-1 rounded-full">
                    Most Detailed
                  </span>
                  <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center mb-5 text-primary">
                    <Home className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold font-serif mb-2 text-[#1a1a1a]">On-Site Visit</h3>
                  <p className="text-black/70 mb-6 flex-grow">
                    A personal visit to your property for a complete on-ground Vastu assessment and tailored remedies.
                  </p>
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-primary">
                      {formatINR(getPriceInRupees("vastu-consultancy", "site-visit") ?? 0)}
                    </div>
                    <p className="text-sm text-black/60 mt-1">+ travelling expenses (billed as per location)</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <RazorpayButton
                      service="vastu-consultancy"
                      variant="site-visit"
                      description="Vastu Consultancy — On-Site Visit"
                      className="w-full sm:flex-1 h-12 px-6 rounded-xl text-base"
                    />
                    <BookingModal defaultService="vastu-consultancy">
                      <Button variant="outline" className="w-full sm:w-auto h-12 px-6 rounded-xl">
                        Book a Slot
                      </Button>
                    </BookingModal>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Why Choose Our Vastu Consultancy */}
          <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
              <div className="flex flex-col lg:flex-row items-center gap-16">
                <div className="w-full lg:w-1/2 space-y-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a]">
                    Why Choose Our <span className="text-primary">Vastu Consultancy?</span>
                  </h2>
                  <p className="text-black/80 text-lg leading-relaxed">
                    We combine ancient wisdom with practical modern solutions to create balanced environments without the need for structural changes.
                  </p>
                  
                  <div className="space-y-6">
                    {[
                      {
                        title: "No Demolition Remedies",
                        desc: "We use colors, mirrors, crystals, and simple objects to correct Vastu doshas without breaking walls."
                      },
                      {
                        title: "Scientific & Logical Approach",
                        desc: "Our recommendations are based on energy mapping, magnetic fields, and solar directions."
                      },
                      {
                        title: "Personalized Solutions",
                        desc: "Remedies are customized based on the specific floor plan and the astrological charts of the occupants."
                      },
                      {
                        title: "Detailed Vastu Report",
                        desc: "Receive a comprehensive report with marked zones, identified flaws, and clear actionable remedies."
                      }
                    ].map((feature, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-bold text-[#1a1a1a] text-lg mb-1">{feature.title}</h4>
                          <p className="text-black/70">{feature.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="w-full lg:w-1/2">
                  <div className="grid grid-cols-2 gap-4">
                    <img 
                      src="https://vibe.filesafe.space/1782888190245745251/attachments/77956078-44eb-4614-b739-2e2a0163a965.jpg" 
                      alt="Vastu Consultation" 
                      className="w-full h-48 md:h-64 object-cover rounded-2xl shadow-md"
                    />
                    <img 
                      src="https://vibe.filesafe.space/1782888190245745251/attachments/dbbc8465-5800-416f-aa6e-63638814e396.jpg" 
                      alt="Vastu Remedies" 
                      className="w-full h-48 md:h-64 object-cover rounded-2xl shadow-md mt-8"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works */}
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
                  A simple, seamless process to transform the energy of your space and bring harmony to your life.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 relative max-w-5xl mx-auto">
                {[
                  { title: "Share Floor Plan", desc: "Provide the to-scale floor plan of your property along with accurate directional compass degrees." },
                  { title: "Expert Analysis", desc: "Our Vastu experts thoroughly analyze the plan, map the 16 zones, and identify energy imbalances." },
                  { title: "Remedies & Report", desc: "Receive a detailed consultation and a customized report with practical, non-destructive remedies." }
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

          {/* Final CTA */}
          <FinalCTA 
            title="Ready to Harmonize Your Space?"
            description="Book a Vastu consultation today and unlock the doors to health, wealth, and prosperity with expert guidance."
            primaryBtnText="Book Vastu Consultation"
            primaryBtnLink="/get-consultation"
            secondaryBtnText="Contact Us"
          />
          
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default VastuConsultancy;
