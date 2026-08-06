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
    <section className="py-12 bg-background relative z-10">
      <div className="container mx-auto px-4">
        <div className="bg-[#1a1a1a] rounded-3xl p-8 md:p-12 shadow-[0_20px_50px_-15px_rgba(26,26,26,0.3)] border border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50 pointer-events-none"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 text-center md:divide-x divide-border/20">
            {badges.map((badge, index) => (
              <div key={index} className={`flex flex-col items-center justify-center space-y-4 ${index === 4 ? 'col-span-2 sm:col-span-1' : ''}`}>
                <div className="w-16 h-16 rounded-full border border-[#f5c178]/30 flex items-center justify-center bg-[#f5c178]/5">
                  <badge.icon className="w-8 h-8 text-[#f5c178] stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{badge.title}</h3>
                  <p className="text-sm text-white/60">{badge.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
