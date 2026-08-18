import { ArrowRight, Star, Compass, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { BookingModal } from "./BookingModal";

export function DiscoverBlueprint() {
  return (
    <section className="py-24 bg-[#FFFDF9] relative overflow-hidden border-y border-secondary/20">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://vibe.filesafe.space/meta/1782888190245745251/mandala-bg.png')] bg-repeat opacity-[0.03] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* Content Section */}
          <div className="w-full lg:w-1/2 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-primary font-medium mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-sm uppercase tracking-wider font-bold">Premium Vedic Astrology</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif mb-6 text-foreground leading-[1.15]">
              Discover Your Life's <br className="hidden lg:block"/>
              Blueprint with <span className="text-primary italic">Expert Astrology</span>
            </h2>
            
            <div className="space-y-6 text-lg text-foreground/80 leading-relaxed mb-8">
              <p>
                <strong className="text-primary font-semibold">Astrology</strong> is a timeless science, and our deep mastery of planetary movements and celestial patterns allows us to provide you with incredibly accurate and personal guidance. Think of your <strong className="text-primary font-semibold">birth chart</strong> as a unique cosmic fingerprint that holds the secrets to your strengths, challenges, and ultimate path.
              </p>
              <p>
                Going beyond daily horoscopes, we specialize in the ancient wisdom of <strong className="text-primary font-semibold">Vedic astrology</strong>. This sophisticated system offers profound answers by analyzing your precise <strong className="text-primary font-semibold">Kundli</strong>, along with planetary transits and dashas.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 mb-10">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-secondary/20 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-1">Accurate Predictions</h4>
                  <p className="text-sm text-foreground/70 leading-snug">Based on precise planetary alignments</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-secondary/20 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                  <Compass className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-1">Life Guidance</h4>
                  <p className="text-sm text-foreground/70 leading-snug">Clear direction for career and relationships</p>
                </div>
              </div>
            </div>
            
            <BookingModal defaultService="consultation-call">
              <Button className="h-14 px-8 text-lg rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-[0_8px_20px_-6px_rgba(122,8,8,0.4)] transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
                <span className="relative z-10 flex items-center">
                  Get Your Consultation 
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              </Button>
            </BookingModal>
          </div>

          {/* Video Section */}
          <div className="w-full lg:w-1/2 order-1 lg:order-2 relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-secondary/40 to-primary/20 rounded-[2.5rem] blur-2xl opacity-60"></div>
            <div className="relative p-3 bg-white/60 backdrop-blur-sm rounded-[2.5rem] border border-white shadow-2xl">
              <div className="aspect-video w-full rounded-[2rem] overflow-hidden shadow-inner bg-black relative group">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/nJ4JNLE5sS0?rel=0"
                  title="Discover Your Life's Blueprint"
                  loading="lazy"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="w-full h-full object-cover relative z-0"
                ></iframe>
              </div>
            </div>
            
            {/* Floating badge */}
            <div className="absolute -bottom-5 left-3 sm:-bottom-8 sm:-left-6 lg:-left-8 z-10 bg-white/95 backdrop-blur-sm p-3 sm:p-4 rounded-2xl shadow-xl border border-secondary/20 flex items-center gap-3 sm:gap-4 animate-bounce" style={{ animationDuration: '4s' }}>
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                <span className="text-2xl sm:text-3xl">🕉️</span>
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-primary">Vedic Wisdom</p>
                <p className="text-xs sm:text-sm text-foreground/60 font-medium">Ancient Knowledge</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
