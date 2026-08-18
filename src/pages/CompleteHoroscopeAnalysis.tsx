import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Star, Target, Heart, Shield, Zap, Compass, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { zodiacSigns, horoscopeCategories } from "@/data/horoscopeData";
import { ReportTemplate } from "@/components/ReportTemplate";

const getRealTimeDate = (category: string) => {
  const today = new Date();
  if (category === "daily") {
    return today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } else if (category === "weekly") {
    const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
    const lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    return `${firstDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${lastDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  } else if (category === "monthly") {
    return today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } else if (category === "yearly") {
    return today.getFullYear().toString();
  }
  return "";
};

const CompleteHoroscopeAnalysis = () => {
  const [activeCategory, setActiveCategory] = useState("daily");

  return (
    <ReportTemplate
      title="Complete Horoscope"
      highlightedTitle="Analysis"
      defaultService="complete-horoscope"
      titleClassName="flex flex-col md:whitespace-nowrap md:text-[2.5rem] lg:text-[3.2rem] xl:text-[4rem]"
      description="A deep dive into your entire life journey. Uncover the hidden patterns of your destiny with our most comprehensive astrological reading."
      heroImage="https://vibe.filesafe.space/1782888190245745251/attachments/2c263412-76e8-4748-b833-8e9250b5ad61.png"
      heroBgImage="https://vibe.filesafe.space/1782888190245745251/attachments/5a02c8e1-f682-4d91-b6be-90728fbcc134.png"
      whatIsIt={{
        title: "What is the",
        highlightedTitle: "Complete Horoscope Analysis?",
        description: "A 360-degree review of your birth chart covering all 12 houses, planetary strengths, dashas, and long-term predictions.",
        points: [
          { title: "Full Chart Reading", desc: "Detailed analysis of your Kundli.", icon: Compass },
          { title: "Life Predictions", desc: "Forecasts for all major life areas.", icon: Target },
          { title: "Karmic Insights", desc: "Understanding your soul's purpose.", icon: Star }
        ],
        image: "https://vibe.filesafe.space/1782888190245745251/attachments/163d5ff0-5812-4e9d-b4af-69669a6a2fe7.jpg"
      }}
      hideHowItWorks={true}
      faqs={[
        { q: "What does this analysis cover?", a: "It covers every major aspect of your life including career, health, relationships, and spiritual growth based on your natal chart." },
        { q: "Is this different from a basic Kundli?", a: "Yes, this is a highly detailed, comprehensive reading that goes far beyond basic planetary positions." },
        { q: "How long is the report?", a: "The Complete Horoscope Analysis is our most extensive report, typically spanning 40-50 pages of deep astrological insights." }
      ]}
    >
      {/* Predictions Section */}
      <section id="predictions" className="py-24 bg-[#FFFDF9] relative border-t border-secondary/20">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://vibe.filesafe.space/1782888190245745251/assets/9b28bd02-75c8-4ecb-ae83-b9ae0e279fe3.png')] bg-repeat"></div>
        
        <div className="container mx-auto px-4 relative z-10 max-w-[1300px]">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-serif mb-6 text-primary">
              Explore Horoscope Prediction
            </h2>
            <p className="text-lg text-foreground/80">
              Select your timeframe and zodiac sign to read your personalized astrological forecast.
            </p>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-4 mb-16 w-full">
            {horoscopeCategories.map((category) => {
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-2 sm:gap-3 px-4 py-3 sm:px-6 sm:py-4 rounded-xl border transition-all duration-300 w-full sm:w-auto justify-center sm:justify-start ${
                    isActive 
                      ? "bg-white border-primary shadow-[0_4px_20px_-5px_rgba(122,8,8,0.3)]" 
                      : "bg-white border-secondary/20 hover:border-primary/50 hover:shadow-sm"
                  }`}
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/5 flex items-center justify-center p-1 overflow-hidden shrink-0">
                    <img src="https://vibe.filesafe.space/1782888190245745251/attachments/f9de88df-e19b-4d72-9477-0a56045ae5ca.webp" alt="Zodiac" className="w-full h-full object-cover" />
                  </div>
                  <span className={`font-medium text-sm sm:text-base ${isActive ? "text-primary" : "text-foreground/80"}`}>
                    {category.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Zodiac Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            <AnimatePresence mode="wait">
              {zodiacSigns.map((sign, index) => (
                <motion.div
                  key={`${activeCategory}-${sign.name}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group"
                >
                  <div className="bg-white rounded-[24px] p-6 border border-secondary/20 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(122,8,8,0.1)] transition-all duration-500 hover:-translate-y-2 relative overflow-hidden flex flex-col items-center text-center h-full">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                    
                    <div className="w-24 h-24 mb-6 relative">
                      <div className="absolute inset-0 bg-secondary/20 rounded-full blur-xl group-hover:bg-secondary/40 transition-colors duration-500 opacity-0 group-hover:opacity-100"></div>
                      <img 
                        src={sign.icon} 
                        alt={sign.name} 
                        className="w-full h-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    
                    <h3 className="text-2xl font-bold font-serif text-primary mb-2">{sign.name}</h3>
                    <div className="flex flex-col items-center gap-1 mb-4">
                      <span className="text-sm text-secondary font-medium bg-secondary/10 px-3 py-1 rounded-full">
                        {getRealTimeDate(activeCategory)}
                      </span>
                    </div>
                    
                    <p className="text-foreground/70 text-sm mb-6 line-clamp-2">
                      Read your {activeCategory} prediction for {sign.name} to uncover what the stars have in store.
                    </p>
                    
                    <Link 
                      to={
                        activeCategory === 'daily' ? '/daily-horoscope' :
                        activeCategory === 'weekly' ? '/weekly-horoscope' :
                        activeCategory === 'yearly' ? '/yearly-horoscope-report' :
                        `/zodiac/${sign.name.toLowerCase()}?timeframe=${activeCategory}`
                      } 
                      state={{ selectedSign: sign.id }}
                      onClick={() => window.scrollTo(0, 0)}
                      className="mt-auto w-full"
                    >
                      <Button 
                        variant="outline" 
                        className="w-full rounded-xl border-secondary/30 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 group/btn"
                      >
                        Read Horoscope
                        <ArrowRight className="w-4 h-4 ml-2 transform group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Benefits of this Report */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground pt-32 pb-14">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://vibe.filesafe.space/1782888190245745251/assets/9b28bd02-75c8-4ecb-ae83-b9ae0e279fe3.png')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-primary"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-serif mb-6 text-white">
              Benefits of <span className="text-secondary">this Report</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Self-Discovery", desc: "Understand your true potential.", icon: Zap },
              { title: "Life Path", desc: "Clarity on your life's direction.", icon: Compass },
              { title: "Karmic Understanding", desc: "Decode past life influences.", icon: Heart },
              { title: "Future Preparedness", desc: "Anticipate challenges and opportunities.", icon: Shield }
            ].map((benefit, index) => (
              <div key={index} className="group relative bg-white/5 border border-white/10 backdrop-blur-md p-8 text-center rounded-2xl hover:bg-white/10 hover:border-secondary/30 shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-2xl" />
                <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-secondary transition-all duration-300">
                  <benefit.icon className="w-8 h-8 text-secondary group-hover:text-secondary-foreground transition-colors" />
                </div>
                <h3 className="font-bold text-xl text-white group-hover:text-secondary transition-colors mb-3">{benefit.title}</h3>
                <p className="text-white/70 text-sm">{benefit.desc}</p>
              </div>
            ))}
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
              Getting your personalized report is quick, easy, and completely digital.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative max-w-5xl mx-auto">
            {[
              { title: "Submit Details", desc: "Provide accurate details for analysis." },
              { title: "Expert Analysis", desc: "Our astrologers analyze your chart." },
              { title: "Receive Report", desc: "Get your personalized PDF report via email." }
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

      {/* Benefits Section */}
      <section className="py-24 bg-white border-t border-secondary/20">
        <div className="container mx-auto px-4 max-w-[1300px]">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-serif mb-6 text-primary">
              Why Read Your Horoscope?
            </h2>
            <p className="text-lg text-foreground/80">
              Cosmic guidance can help you navigate life's challenges and seize new opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Love & Relationships", icon: Heart, desc: "Understand romantic compatibility and relationship dynamics." },
              { title: "Career & Business", icon: Briefcase, desc: "Find the right time for professional moves and investments." },
              { title: "Life Guidance", icon: Star, desc: "Gain clarity on your life path and spiritual journey." },
              { title: "Personal Energy", icon: Zap, desc: "Align your actions with favorable planetary periods." }
            ].map((benefit, i) => (
              <div key={i} className="bg-[#FFFDF9] p-8 rounded-[24px] border border-secondary/20 hover:border-secondary/50 transition-colors text-center group">
                <div className="w-16 h-16 mx-auto bg-primary/5 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <benefit.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold font-serif text-primary mb-3">{benefit.title}</h3>
                <p className="text-foreground/70">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </ReportTemplate>
  );
};

export default CompleteHoroscopeAnalysis;
