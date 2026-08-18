import { Link } from "react-router-dom";
import { KundliCalculator } from "./KundliCalculator";

export function LeadForm() {
  return (
    <section id="calculators" className="py-32 relative overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url('https://vibe.filesafe.space/1782888190245745251/attachments/f4cac884-7e69-4986-9b6c-fcde0bc82f1e.png')" }}>
      <div className="absolute inset-0"></div>
      
      {/* Premium Decorative Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(245,193,120,0.15)_0,transparent_50%)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(245,193,120,0.1)_0,transparent_50%)] pointer-events-none" />
      </div>

      {/* Half Chakra Background */}
      <div className="absolute top-0 left-0 w-full md:w-[50%] h-full opacity-10 pointer-events-none mix-blend-overlay">
        <img 
          src="https://vibe.filesafe.space/1782888190245745251/attachments/93462fd7-bde7-4bef-90a3-4cb0c8e29387.webp" 
          alt="Chakra Overlay" 
          loading="lazy"
          className="w-full h-full object-cover object-left"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div>
            <h2 className="text-4xl md:text-6xl font-bold font-serif mb-6 leading-tight text-white">
              Get Your Free <span className="text-secondary">Kundli</span>
            </h2>
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-lg leading-relaxed font-light">
              Get clear insights into your life, career, relationships, and future with your personalized Kundli. Discover what the stars have aligned for you.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 mt-12 mb-12 lg:mb-0">
              <div className="flex-1 relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-transparent rounded-2xl blur-md transition-all duration-500 group-hover:blur-xl opacity-0 group-hover:opacity-100"></div>
                <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl flex flex-col gap-2 transition-all duration-500 hover:border-secondary/40 hover:bg-black/50 hover:-translate-y-1">
                  <span className="text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-secondary to-white font-bold drop-shadow-sm">100%</span>
                  <span className="text-xs md:text-sm font-medium text-white/70 uppercase tracking-[0.2em] leading-relaxed">Accurate Vedic<br/>Calculations</span>
                </div>
              </div>
              <div className="flex-1 relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-transparent rounded-2xl blur-md transition-all duration-500 group-hover:blur-xl opacity-0 group-hover:opacity-100"></div>
                <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl flex flex-col gap-2 transition-all duration-500 hover:border-secondary/40 hover:bg-black/50 hover:-translate-y-1">
                  <span className="text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-secondary to-white font-bold drop-shadow-sm">1M+</span>
                  <span className="text-xs md:text-sm font-medium text-white/70 uppercase tracking-[0.2em] leading-relaxed">Kundlis<br/>Generated</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-20">
            <KundliCalculator />
          </div>
        </div>
      </div>
    </section>
  );
}
