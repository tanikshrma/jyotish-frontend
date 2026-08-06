import { FC } from "react";
import { Link } from "react-router-dom";

const zodiacSigns = [
  { id: "aries", name: "ARIES", symbol: "♈", image: "https://vibe.filesafe.space/1782888190245745251/attachments/94c5c0a6-a80c-4d0c-bc85-b33ebace0c3e.png" },
  { id: "taurus", name: "TAURUS", symbol: "♉", image: "https://vibe.filesafe.space/1782888190245745251/attachments/c6307ea6-2ae0-42ae-b79f-63340d67edda.png" },
  { id: "gemini", name: "GEMINI", symbol: "♊", image: "https://vibe.filesafe.space/1782888190245745251/attachments/ee1bf341-f985-4844-94a5-71a57821f1e0.png" },
  { id: "cancer", name: "CANCER", symbol: "♋", image: "https://vibe.filesafe.space/1782888190245745251/attachments/88b9c066-bc00-498b-9dc8-1e11ae72a5b4.png" },
  { id: "leo", name: "LEO", symbol: "♌", image: "https://vibe.filesafe.space/1782888190245745251/attachments/625294bb-6bdb-49b7-8ace-59d0ba1532a8.png" },
  { id: "virgo", name: "VIRGO", symbol: "♍", image: "https://vibe.filesafe.space/1782888190245745251/attachments/844d790f-7c15-446d-b2c9-406f014860e0.png" },
  { id: "libra", name: "LIBRA", symbol: "♎", image: "https://vibe.filesafe.space/1782888190245745251/attachments/51d80fdf-175e-4f81-a61b-62d6952642d7.png" },
  { id: "scorpio", name: "SCORPIO", symbol: "♏", image: "https://vibe.filesafe.space/1782888190245745251/attachments/df78d918-4d54-4030-867e-9be48304a97a.png" },
  { id: "sagittarius", name: "SAGITTARIUS", symbol: "♐", image: "https://vibe.filesafe.space/1782888190245745251/attachments/deb2202c-e0ea-4b66-be28-a8ded4f0576f.png" },
  { id: "capricorn", name: "CAPRICORN", symbol: "♑", image: "https://vibe.filesafe.space/1782888190245745251/attachments/12d5091a-9a55-4de3-8f11-32da5989cdfd.png" },
  { id: "aquarius", name: "AQUARIUS", symbol: "♒", image: "https://vibe.filesafe.space/1782888190245745251/attachments/a7610d83-c044-43b2-adab-6968487f4f68.png" },
  { id: "pisces", name: "PISCES", symbol: "♓", image: "https://vibe.filesafe.space/1782888190245745251/attachments/35b76b15-fe74-4b2d-b07f-fee6654f0007.png" }
];

export const Zodiac: FC = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-[#1a1a1a]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,90,20,0.15)_0,transparent_50%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-16 space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
            Know What Your Zodiac Sign Says About You
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Click on the Rashi to know about your Personality, Traits, Life Predictions, and Remedies!
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 md:gap-10 max-w-6xl mx-auto">
          {zodiacSigns.map((sign) => (
            <Link 
              to={`/zodiac/${sign.id}`}
              onClick={() => window.scrollTo(0, 0)}
              key={sign.name} 
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="relative w-32 h-32 md:w-36 md:h-36 mb-6 flex items-center justify-center transition-all duration-500 group-hover:-translate-y-2">
                {/* Background decorative circle */}
                <div className="absolute inset-0 bg-white/5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/10 backdrop-blur-md group-hover:bg-primary/20 transition-all duration-500"></div>
                
                {/* Spinning dashed ring on hover */}
                <div className="absolute inset-2 rounded-full border border-dashed border-secondary/20 group-hover:border-secondary/60 group-hover:rotate-180 transition-all duration-1000"></div>
                
                {sign.image ? (
                  <img 
                    src={sign.image} 
                    alt={sign.name}
                    loading="lazy"
                    className="w-20 h-20 md:w-24 md:h-24 object-contain relative z-10 transition-transform duration-500 group-hover:scale-110 drop-shadow-sm"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full flex items-center justify-center relative z-10">
                    <span className="text-4xl text-primary font-serif leading-none">
                      {sign.symbol}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-white font-bold text-sm md:text-base tracking-widest uppercase group-hover:text-secondary transition-colors duration-300">
                {sign.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
