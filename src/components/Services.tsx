import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Link } from "react-router-dom";
import { 
  BookOpen, Calendar, Users, Compass, 
  CalendarDays, Gem, HeartHandshake, 
  BookMarked, Baby, Briefcase, ShieldAlert, Sparkles
} from "lucide-react";

const services = [
  {
    title: "Complete Horoscope Analysis",
    description: "Transform Uncertainty into Confidence with a Personalized Session.",
    icon: BookOpen,
    badge: "Popular",
    link: "/complete-horoscope-analysis",
  },
  {
    title: "Daily Horoscope Report",
    description: "Daily personalized guidance on life, love, career, health and finance.",
    icon: Calendar,
    badge: "Free",
    link: "/daily-horoscope",
  },
  {
    title: "Match Making Consultation",
    description: "Tailored Matchmaking Insights for Lifelong Compatibility.",
    icon: Users,
    badge: "Compatibility",
    link: "/matchmaking-consultation",
  },
  {
    title: "Vastu Consultancy",
    description: "Align Your Space, Elevate Your Energy for Prosperity & Peace.",
    icon: Compass,
    badge: "Vastu",
    link: "/vastu-consultancy",
  },
  {
    title: "Yearly Horoscope Report",
    description: "Your Customized Yearly Astrological Forecast & Major Transits.",
    icon: CalendarDays,
    badge: "Yearly",
    link: "/yearly-horoscope-report",
  },
  {
    title: "Gemstone Analysis",
    description: "Explore our diverse collection of astrological guidance gemstones.",
    icon: Gem,
    badge: "Gemstone",
    link: "https://manthancrystals.com/",
  },
  {
    title: "Couple Kundli Analysis",
    description: "Kundli Milan Horoscope Matching for Marriage & Harmony.",
    icon: HeartHandshake,
    badge: "Marriage",
    link: "/couple-kundli-analysis",
  },
  {
    title: "Lal Kitab Report",
    description: "Lal Kitab Insights for Career, Health, Wealth, and Relationships.",
    icon: BookMarked,
    badge: "Remedies",
    link: "/lal-kitab-report",
  },
  {
    title: "Baby Name Report",
    description: "Meaningful Names Based on Planetary Influence and Birth Chart.",
    icon: Baby,
    badge: "Newborn",
    link: "/baby-name-report",
  },
  {
    title: "Career Guidance",
    description: "Best Career Paths as Per Planetary Strength and Dasha Cycles.",
    icon: Briefcase,
    badge: "Career",
    link: "/career-guidance",
  },
  {
    title: "Kal Sarp & Manglik Dosha",
    description: "Kaal Sarp and Manglik Dosh remedies bring balance, success, and peace.",
    icon: ShieldAlert,
    badge: "Dosha Remedy",
    link: "/kal-sarp-manglik-dosha-report",
  },
];

export function Services() {
  return (
    <section id="services" className="py-24 bg-[#FFFDF9] relative overflow-hidden">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at center, #780808 1.5px, transparent 1.5px)`,
          backgroundSize: `24px 24px`
        }}
      />

      <div className="container mx-auto px-4 relative z-10 max-w-[1300px]">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span>Vedic Wisdom & Guidance</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-black">
            Our <span className="text-primary">Services</span>
          </h2>
          <p className="text-lg text-black/80 font-light">
            Choose the service that fits your needs and start your journey toward clarity, success, and spiritual balance.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card 
                key={index} 
                className="group relative overflow-hidden bg-white border border-[#E9DED3] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(120,8,8,0.15)] hover:border-primary/40 hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between"
              >
                {/* Top Glowing Gradient Bar */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-[#F5C27A] to-primary opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardContent className="p-8 flex flex-col items-center text-center h-full">
                  {/* Interactive Dual-Tone Icon Container */}
                  <div className="relative w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-primary/10 via-[#FFF8F0] to-[#F5C27A]/20 border border-primary/20 flex items-center justify-center group-hover:from-primary group-hover:to-[#5A0606] group-hover:border-primary group-hover:scale-110 transition-all duration-500 shadow-sm group-hover:shadow-[0_8px_25px_rgba(120,8,8,0.3)]">
                    <Icon className="w-10 h-10 text-primary group-hover:text-[#F5C27A] transition-colors duration-500 stroke-[1.75]" />
                  </div>

                  <h3 className="text-xl font-bold font-serif mb-3 text-black group-hover:text-primary transition-colors duration-300">
                    {service.title}
                  </h3>

                  <p className="text-black/70 text-sm mb-8 flex-grow leading-relaxed font-light">
                    {service.description}
                  </p>

                  <Button 
                    asChild 
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold h-12 rounded-xl shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-0.5"
                  >
                    <Link to={service.link} target={service.link.startsWith('http') ? '_blank' : undefined}>
                      Book Now
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}