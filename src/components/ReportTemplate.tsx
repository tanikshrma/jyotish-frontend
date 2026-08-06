import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Star, Check, SunMedium } from "lucide-react";
import { Link } from "react-router-dom";
import { FinalCTA } from "@/components/FinalCTA";
import { BookingModal } from "@/components/BookingModal";
import { SEO } from "@/components/SEO";

interface ReportTemplateProps {
  title: string;
  highlightedTitle: string;
  titleClassName?: string;
  description: string;
  heroImage: string;
  heroBgImage?: string;
  heroImageClassName?: string;
  whatIsIt: {
    title: string;
    highlightedTitle: string;
    description: string;
    points: { title: string; desc: string; icon: React.ElementType }[];
    image: string;
  };
  benefits?: { icon: React.ElementType; title: string; desc: string }[];
  hideHowItWorks?: boolean;
  faqs: { q: string; a: string }[];
  calculatorForm?: React.ReactNode;
  children?: React.ReactNode;
}

export function ReportTemplate({
  title,
  highlightedTitle,
  titleClassName,
  description,
  heroImage,
  heroBgImage,
  heroImageClassName,
  whatIsIt,
  benefits,
  hideHowItWorks,
  faqs,
  calculatorForm,
  children
}: ReportTemplateProps) {
  return (
    <div className="relative min-h-screen bg-background">
      <SEO 
        title={`${title} ${highlightedTitle} - JyotishNow`} 
        description={description}
      />
      <Header />
      
      <main className="flex-grow">
        {/* 1. Hero Section */}
        {heroBgImage ? (
          <section className="relative overflow-hidden bg-primary text-primary-foreground min-h-[100svh] flex items-center pt-24 pb-14">
            <div className="absolute inset-0 z-0">
              <div 
                className="absolute inset-0 bg-cover bg-[position:80%_center] md:bg-right" 
                style={{ backgroundImage: `url('${heroBgImage}')` }}
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
            
            <div className="container mx-auto px-4 max-w-[1300px] relative z-10">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-sm font-semibold mb-8 backdrop-blur-sm shadow-[0_4px_10px_-2px_rgba(0,0,0,0.1)] pt-[10px] pb-[10px] pl-[15px] pr-[15px] rounded-md">
                    <SunMedium className="lucide lucide-star fill-white text-white w-[18px] h-[17px]" />
                    <span className="font-light">Premium Astrology Report</span>
                  </div>
                  
                  <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-serif leading-tight mb-6 text-white ${titleClassName || ''}`}>
                    {title} <span className="text-secondary">{highlightedTitle}</span>
                  </h1>
                  
                  <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                    {description}
                  </p>
                  
                  <div className="pt-6 flex flex-col sm:flex-row justify-center lg:justify-start gap-4 sm:gap-5 w-full max-w-xs mx-auto sm:max-w-none">
                    {calculatorForm ? (
                      <Button 
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="h-14 px-8 bg-white hover:bg-white/90 text-black font-bold rounded-xl shadow-[0_8px_20px_-6px_rgba(255,255,255,0.3)] transition-all duration-300 ease-out hover:-translate-y-1 text-lg w-full sm:w-auto"
                      >
                        Get Instant Report <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    ) : (
                      <>
                        <BookingModal>
                          <Button size="lg" className="bg-white hover:bg-white/90 text-black text-lg px-8 h-14 shadow-[0_8px_20px_-6px_rgba(255,255,255,0.3)] transition-all duration-300 ease-out hover:-translate-y-1 w-full sm:w-auto">
                            Get Your Report <ArrowRight className="ml-2 w-5 h-5" />
                          </Button>
                        </BookingModal>
                        <Button 
                          onClick={() => {
                            const el = document.getElementById('what-is-it');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          size="lg" 
                          variant="outline" 
                          className="w-full sm:w-auto text-lg px-8 h-14 border-2 border-white/20 text-white hover:bg-white hover:text-black bg-black/20 backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-1 shadow-sm"
                        >
                          Learn More
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {calculatorForm && (
                  <div className="w-full max-w-md mx-auto lg:max-w-none relative">
                    <div className="absolute -inset-4 bg-secondary/20 blur-3xl rounded-full opacity-50"></div>
                    <div className="relative z-10">
                      {calculatorForm}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : (
          <section className="pt-32 pb-20 relative overflow-hidden bg-primary text-primary-foreground min-h-[90vh] flex items-center">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[url('https://vibe.filesafe.space/1782888190245745251/assets/9b28bd02-75c8-4ecb-ae83-b9ae0e279fe3.png')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-primary"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-sm font-semibold mb-8 backdrop-blur-sm shadow-[0_4px_10px_-2px_rgba(0,0,0,0.1)] pt-[10px] pb-[10px] pl-[15px] pr-[15px] rounded-md">
                    <SunMedium className="lucide lucide-star fill-white text-white w-[18px] h-[17px]" />
                    <span className="font-light">Premium Astrology Report</span>
                  </div>
                  
                  <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-serif leading-tight mb-6 text-white ${titleClassName || ''}`}>
                    {title} <span className="text-secondary">{highlightedTitle}</span>
                  </h1>
                  
                  <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                    {description}
                  </p>
                  
                  <div className="pt-6 flex flex-col sm:flex-row justify-center lg:justify-start gap-4 sm:gap-5 w-full max-w-xs mx-auto sm:max-w-none">
                    {calculatorForm ? (
                      <Button 
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="h-14 px-8 bg-white hover:bg-white/90 text-black font-bold rounded-xl shadow-[0_8px_20px_-6px_rgba(255,255,255,0.3)] transition-all duration-300 ease-out hover:-translate-y-1 text-lg w-full sm:w-auto"
                      >
                        Get Instant Report <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    ) : (
                      <>
                        <BookingModal>
                          <Button size="lg" className="bg-white hover:bg-white/90 text-black text-lg px-8 h-14 shadow-[0_8px_20px_-6px_rgba(255,255,255,0.3)] transition-all duration-300 ease-out hover:-translate-y-1 w-full sm:w-auto">
                            Get Your Report <ArrowRight className="ml-2 w-5 h-5" />
                          </Button>
                        </BookingModal>
                        <Button 
                          onClick={() => {
                            const el = document.getElementById('what-is-it');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          size="lg" 
                          variant="outline" 
                          className="w-full sm:w-auto text-lg px-8 h-14 border-2 border-white/20 text-white hover:bg-white hover:text-black bg-black/20 backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-1 shadow-sm"
                        >
                          Learn More
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="relative lg:h-[600px] flex items-center justify-center lg:justify-end mt-12 lg:mt-0">
                  {calculatorForm ? (
                    <div className="w-full max-w-md mx-auto lg:max-w-none relative">
                      <div className="absolute -inset-4 bg-secondary/20 blur-3xl rounded-full opacity-50"></div>
                      <div className="relative z-10">
                        {calculatorForm}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="relative w-[115%] lg:w-[130%] max-w-[600px] lg:max-w-[750px] aspect-square flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border border-white/10 animate-[spin_60s_linear_infinite]" />
                        <div className="absolute inset-4 rounded-full border border-white/20 animate-[spin_40s_linear_infinite_reverse]" />
                        <div className="absolute inset-12 rounded-full border border-white/5 animate-[spin_20s_linear_infinite]" />
                        
                        <div className="absolute inset-0 flex items-center justify-center">
                          <img 
                            src="https://vibe.filesafe.space/1782888190245745251/attachments/bdce3955-db78-4df4-9c25-20f67525cda5.webp" 
                            alt="Kundli Chart" 
                            className="w-[95%] h-[95%] object-contain animate-[spin_60s_linear_infinite] opacity-50 contrast-125 brightness-150"
                          />
                        </div>
                      </div>

                      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] sm:w-[70%] lg:w-[80%] max-w-[450px] z-10 flex justify-center pointer-events-none ${heroImageClassName || ''}`}>
                        <img 
                          src={heroImage} 
                          alt="Report" 
                          className="w-full h-auto object-contain drop-shadow-2xl"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}



        {/* 2. What is it? */}
        <section id="what-is-it" className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold font-serif mb-6 text-black">
                  {whatIsIt.title} <span className="text-primary">{whatIsIt.highlightedTitle}</span>
                </h2>
                <p className="text-lg text-black/80 mb-8 leading-relaxed">
                  {whatIsIt.description}
                </p>
                
                <div className="space-y-6">
                  {whatIsIt.points.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-black mb-2">{item.title}</h4>
                        <p className="text-black/70">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-primary/5 rounded-3xl transform rotate-3 scale-105"></div>
                <img 
                  src={whatIsIt.image} 
                  alt="Knowledge" 
                  className="relative rounded-3xl shadow-xl w-full object-cover aspect-[4/3]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 3. Who Can Benefit? */}
        {benefits && benefits.length > 0 && (
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
                {benefits.map((benefit, index) => (
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
        )}

        {/* 6. How It Works */}
        {!hideHowItWorks && (
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
        )}

        {children}


        {/* 10. Frequently Asked Questions */}
        <section className="py-24 bg-[#FFF8F0]">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold font-serif mb-6 text-black">
                Frequently Asked <span className="text-primary">Questions</span>
              </h2>
            </div>

            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
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

        {/* 11. Final CTA */}
        <FinalCTA 
          title="Ready to Discover What Your Future Holds?"
          description="Get your personalized report today and start applying simple, effective remedies to transform your life."
          primaryBtnText="Order Your Report"
          secondaryBtnText="Contact Us"
        />

      </main>
      <Footer />
    </div>
  );
}
