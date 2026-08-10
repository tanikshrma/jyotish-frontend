import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Link } from "react-router-dom";
import { 
  BookOpen, Calendar, Users, Compass, 
  CalendarDays, CalendarRange, Gem, HeartHandshake, 
  BookMarked, Baby, Briefcase, ShieldAlert 
} from "lucide-react";

const services = [
  {
    title: "Complete Horoscope Analysis",
    description: "Transform Uncertainty into Confidence with a Personalized Session.",
    icon: BookOpen,
    link: "/complete-horoscope-analysis",
  },
  {
    title: "Daily Horoscope Report",
    description: "Daily personalized guidance on life, love, career, health and finance.",
    icon: Calendar,
    link: "/daily-horoscope",
  },
  {
    title: "Match Making Consultation",
    description: "Tailored Matchmaking Insights for Lifelong Compatibility.",
    icon: Users,
    link: "/matchmaking-consultation",
  },
  {
    title: "Vastu Consultancy",
    description: "Align Your Space, Elevate Your Energy.",
    icon: Compass,
    link: "/vastu-consultancy",
  },
  {
    title: "Yearly Horoscope Report",
    description: "Your Customized Yearly Astrological Forecast",
    icon: CalendarDays,
    link: "/yearly-horoscope-report",
  },

  {
    title: "Gemstone Analysis",
    description: "Explore our diverse collection of astrological guidance gemstones.",
    icon: Gem,
    link: "https://manthancrystals.com/",
  },
  {
    title: "Couple Kundli Analysis",
    description: "Kundli Milan Horoscope Matching for Marriage",
    icon: HeartHandshake,
    link: "/couple-kundli-analysis",
  },
  {
    title: "Lal Kitab Report",
    description: "Lal Kitab Insights for Career, Health, Wealth, and Relationships",
    icon: BookMarked,
    link: "/lal-kitab-report",
  },
  {
    title: "Baby name Report",
    description: "Meaningful Names Based on Planetary Influence and Birth Chart",
    icon: Baby,
    link: "/baby-name-report",
  },
  {
    title: "Career Guidance",
    description: "Best Career Paths as Per Planetary Strength and Dasha",
    icon: Briefcase,
    link: "/career-guidance",
  },
  {
    title: "Kal Sarp & Manglik Dosha Report",
    description: "Kaal Sarp and Manglik Dosh remedies bring balance, success, and peace",
    icon: ShieldAlert,
    link: "/kal-sarp-manglik-dosha-report",
  },
];

export function Services() {
  return (
    <section id="services" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-serif mb-6 text-black">Our <span className="text-primary">Services</span></h2>
          <p className="text-lg text-black/80">
            Choose the service that fits your needs and start your journey toward clarity, success, and spiritual balance.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card key={index} className="group relative overflow-hidden bg-white border border-border/40 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-primary/20 hover:-translate-y-1 transition-all duration-500">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <CardContent className="p-8 flex flex-col items-center text-center h-full">
                <div className="w-16 h-16 mb-6 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-colors duration-500 shadow-sm">
                  <service.icon className="w-8 h-8 text-primary group-hover:text-white transition-colors duration-500" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold font-serif mb-4 text-black group-hover:text-primary transition-colors duration-300">{service.title}</h3>
                <p className="text-black/70 text-sm mb-8 flex-grow leading-relaxed">{service.description}</p>
                <Button asChild className="w-full bg-transparent border-2 border-black/10 text-black hover:bg-[#1a1a1a] hover:text-white hover:border-[#1a1a1a] transition-all duration-300 ease-out text-sm font-semibold h-12 shadow-none hover:shadow-md hover:-translate-y-0.5">
                  <Link to={service.link} target={service.link.startsWith('http') ? '_blank' : undefined}>Book Now</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}