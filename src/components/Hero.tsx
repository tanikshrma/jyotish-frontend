import { Button } from "./ui/button";
import { ArrowRight, Star, SunMedium } from "lucide-react";
import { BookingModal } from "./BookingModal";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground pt-32 pb-14">
      {/* Decorative background elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('https://vibe.filesafe.space/1782888190245745251/assets/9b28bd02-75c8-4ecb-ae83-b9ae0e279fe3.png')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-primary"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-2xl">

            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-serif leading-tight mb-6 text-white">
              Your Kundli Knows You <span className="text-secondary">Better Than You Think</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl leading-relaxed">
              A powerful, personalized reading built to guide your biggest life decisions with confidence, clarity, and ancient wisdom.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5">
              <Button asChild size="lg" className="bg-white hover:bg-white/90 text-black text-lg px-8 h-14 shadow-[0_8px_20px_-6px_rgba(255,255,255,0.3)] transition-all duration-300 ease-out hover:-translate-y-1">
                <a href="#calculators">Show My Future <ArrowRight className="ml-2 w-5 h-5" /></a>
              </Button>
              <BookingModal>
                <Button variant="outline" className="text-lg px-8 h-14 border-2 border-white/20 text-white hover:bg-white hover:text-black bg-black/20 backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-1 shadow-sm">
                  Book a Consultation
                </Button>
              </BookingModal>
            </div>
          </div>

          <div className="relative lg:h-[600px] flex items-center justify-center lg:justify-end mt-12 lg:mt-0">
            {/* Abstract representation of a Kundli/Astrology chart */}
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

            {/* Person Image */}
            <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 w-[110%] sm:w-[95%] lg:w-[120%] max-w-[600px] lg:max-w-[650px] z-10 flex justify-center pointer-events-none">
              <img 
                src="https://vibe.filesafe.space/1782888190245745251/attachments/10fccb9e-201f-4c64-8d58-4da6241e87f2.png" 
                alt="Dr. Sandeep Sawhney" 
                className="w-full h-auto object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
