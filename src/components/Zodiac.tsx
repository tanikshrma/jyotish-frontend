import { FC } from "react";
import { Link } from "react-router-dom";

const zodiacSigns = [
  { id: "aries", name: "ARIES", hindiName: "मेष", symbol: "♈", image: "https://vibe.filesafe.space/1782888190245745251/attachments/94c5c0a6-a80c-4d0c-bc85-b33ebace0c3e.png" },
  { id: "taurus", name: "TAURUS", hindiName: "वृषभ", symbol: "♉", image: "https://vibe.filesafe.space/1782888190245745251/attachments/c6307ea6-2ae0-42ae-b79f-63340d67edda.png" },
  { id: "gemini", name: "GEMINI", hindiName: "मिथुन", symbol: "♊", image: "https://vibe.filesafe.space/1782888190245745251/attachments/ee1bf341-f985-4844-94a5-71a57821f1e0.png" },
  { id: "cancer", name: "CANCER", hindiName: "कर्क", symbol: "♋", image: "https://vibe.filesafe.space/1782888190245745251/attachments/88b9c066-bc00-498b-9dc8-1e11ae72a5b4.png" },
  { id: "leo", name: "LEO", hindiName: "सिंह", symbol: "♌", image: "https://vibe.filesafe.space/1782888190245745251/attachments/625294bb-6bdb-49b7-8ace-59d0ba1532a8.png" },
  { id: "virgo", name: "VIRGO", hindiName: "कन्या", symbol: "♍", image: "https://vibe.filesafe.space/1782888190245745251/attachments/844d790f-7c15-446d-b2c9-406f014860e0.png" },
  { id: "libra", name: "LIBRA", hindiName: "तुला", symbol: "♎", image: "https://vibe.filesafe.space/1782888190245745251/attachments/51d80fdf-175e-4f81-a61b-62d6952642d7.png" },
  { id: "scorpio", name: "SCORPIO", hindiName: "वृश्चिक", symbol: "♏", image: "https://vibe.filesafe.space/1782888190245745251/attachments/df78d918-4d54-4030-867e-9be48304a97a.png" },
  { id: "sagittarius", name: "SAGITTARIUS", hindiName: "धनु", symbol: "♐", image: "https://vibe.filesafe.space/1782888190245745251/attachments/deb2202c-e0ea-4b66-be28-a8ded4f0576f.png" },
  { id: "capricorn", name: "CAPRICORN", hindiName: "मकर", symbol: "♑", image: "https://vibe.filesafe.space/1782888190245745251/attachments/12d5091a-9a55-4de3-8f11-32da5989cdfd.png" },
  { id: "aquarius", name: "AQUARIUS", hindiName: "कुंभ", symbol: "♒", image: "https://vibe.filesafe.space/1782888190245745251/attachments/a7610d83-c044-43b2-adab-6968487f4f68.png" },
  { id: "pisces", name: "PISCES", hindiName: "मीन", symbol: "♓", image: "https://vibe.filesafe.space/1782888190245745251/attachments/35b76b15-fe74-4b2d-b07f-fee6654f0007.png" }
];

export const Zodiac: FC = () => {
  return (
    <section className="py-20 relative overflow-hidden bg-[#4A1C08]">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at center, #f5c178 1.5px, transparent 1.5px)`,
          backgroundSize: `24px 24px`
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        <div className="text-center max-w-4xl mx-auto mb-14 space-y-3">
          <h3 className="text-xl md:text-2xl font-medium text-white/90 tracking-wide">
            Shop According To Your
          </h3>
          <h2 className="text-3xl md:text-5xl font-bold font-serif text-white tracking-wide leading-tight">
            राशि चक्र • Zodiac Signs
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8 max-w-6xl mx-auto">
          {zodiacSigns.map((sign) => (
            <Link 
              to={`/zodiac/${sign.id}`}
              onClick={() => window.scrollTo(0, 0)}
              key={sign.name} 
              className="flex flex-col items-center group cursor-pointer text-center"
            >
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.25)] border-4 border-white/20 group-hover:scale-105 group-hover:shadow-[0_15px_30px_rgba(0,0,0,0.35)] transition-all duration-300 mb-4 overflow-hidden">
                {sign.image ? (
                  <img 
                    src={sign.image} 
                    alt={sign.name}
                    loading="lazy"
                    className="w-16 h-16 sm:w-20 sm:h-20 object-contain relative z-10 transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <span className="text-4xl text-[#4A1C08] font-serif leading-none">
                    {sign.symbol}
                  </span>
                )}
              </div>
              <span className="text-white font-bold text-sm md:text-base tracking-wider uppercase group-hover:text-[#f5c178] transition-colors duration-300">
                {sign.name} <span className="font-normal text-white/80">({sign.hindiName})</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
