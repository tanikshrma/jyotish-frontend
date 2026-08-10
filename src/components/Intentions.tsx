import { FC } from "react";
import { Link } from "react-router-dom";
import { Heart, ShieldCheck, Gem, Sparkles, Sun, Flame } from "lucide-react";

const intentions = [
  {
    id: "love",
    title: "LOVE",
    description: "Attract Harmony & Affection",
    icon: Heart,
    color: "#4A1C08",
    badgeBg: "bg-white",
  },
  {
    id: "health",
    title: "HEALTH",
    description: "Vitality & Inner Healing",
    icon: Flame,
    color: "#4A1C08",
    badgeBg: "bg-white",
  },
  {
    id: "courage",
    title: "COURAGE",
    description: "Overcome Fear & Obstacles",
    icon: ShieldCheck,
    color: "#4A1C08",
    badgeBg: "bg-white",
  },
  {
    id: "wealth",
    title: "WEALTH",
    description: "Abundance & Career Growth",
    icon: Gem,
    color: "#4A1C08",
    badgeBg: "bg-white",
  },
  {
    id: "peace",
    title: "PEACE",
    description: "Tranquility & Spiritual Balance",
    icon: Sun,
    color: "#4A1C08",
    badgeBg: "bg-white",
  },
  {
    id: "protection",
    title: "PROTECTION",
    description: "Shield Negative Energies",
    icon: Sparkles,
    color: "#4A1C08",
    badgeBg: "bg-white",
  },
];

export const Intentions: FC = () => {
  return (
    <section className="py-20 relative overflow-hidden bg-[#4A1C08]">
      {/* Subtle radial pattern overlay */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at center, #f5c178 1.5px, transparent 1.5px)`,
          backgroundSize: `24px 24px`
        }}
      />

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold font-serif text-white tracking-wide leading-tight">
            Rudraksha for Every Intention
          </h2>
          <p className="text-lg text-white/80 font-light max-w-2xl mx-auto">
            Choose divine Rudrakshas and astrological remedies aligned with your specific life goal.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 md:gap-8 justify-items-center">
          {intentions.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to="/get-consultation"
                className="flex flex-col items-center group cursor-pointer text-center"
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.25)] border-4 border-white/20 group-hover:scale-105 group-hover:shadow-[0_15px_30px_rgba(0,0,0,0.35)] transition-all duration-300 mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[#4A1C08]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
                  <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-[#4A1C08] group-hover:scale-110 transition-transform duration-300" strokeWidth={1.75} />
                </div>
                <span className="text-white font-bold text-base tracking-wider uppercase group-hover:text-[#f5c178] transition-colors duration-300">
                  {item.title}
                </span>
                <span className="text-white/70 text-xs mt-1 max-w-[130px] hidden sm:block">
                  {item.description}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
