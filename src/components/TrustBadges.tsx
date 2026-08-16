import { Shield, Users, FileText, Globe, Star } from "lucide-react";

const badges = [
  {
    title: "10+",
    subtitle: "Years of Experience",
    icon: Shield,
  },
  {
    title: "100K+",
    subtitle: "Happy Clients",
    icon: Users,
  },
  {
    title: "1M+",
    subtitle: "Reports Generated",
    icon: FileText,
  },
  {
    title: "50+",
    subtitle: "Countries Served",
    icon: Globe,
  },
  {
    title: "4.9/5",
    subtitle: "Client Rating",
    icon: Star,
  },
];

export function TrustBadges() {
  return (
    <section className="py-16 md:py-20 bg-background relative z-10 border-t border-secondary/20">
      <div className="container mx-auto px-4 max-w-[1300px]">
        <div className="bg-gradient-to-br from-[#7A0808] via-[#630606] to-[#450303] rounded-3xl p-8 md:p-12 shadow-[0_20px_50px_-15px_rgba(122,8,8,0.45)] border border-[#F5C27A]/30 relative overflow-hidden">
          {/* Subtle background texture and radial glow */}
          <div className="absolute inset-0 bg-[url('https://vibe.filesafe.space/1782888190245745251/assets/9b28bd02-75c8-4ecb-ae83-b9ae0e279fe3.png')] bg-cover bg-center opacity-15 mix-blend-overlay pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/5 pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#F5C27A]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#F5C27A]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 text-center md:divide-x divide-white/15 relative z-10">
            {badges.map((badge, index) => (
              <div key={index} className={`flex flex-col items-center justify-center space-y-4 group ${index === 4 ? 'col-span-2 sm:col-span-1' : ''}`}>
                <div className="w-16 h-16 rounded-full border border-[#F5C27A]/40 flex items-center justify-center bg-white/10 backdrop-blur-sm shadow-inner group-hover:scale-110 group-hover:bg-[#F5C27A]/20 transition-all duration-300">
                  <badge.icon className="w-8 h-8 text-[#F5C27A] stroke-[1.75]" />
                </div>
                <div>
                  <h3 className="text-3xl lg:text-4xl font-serif font-bold text-white mb-1 tracking-tight">{badge.title}</h3>
                  <p className="text-xs lg:text-sm text-white/80 font-medium tracking-wide">{badge.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
