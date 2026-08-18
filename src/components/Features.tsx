import { Card, CardContent } from "./ui/card";
import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const calculators = [
  {
    title: "Lal Kitab Report",
    description: "Get your accurate Lal Kitab chart online to reveal secrets of your life and simple, effective remedies.",
    image: "https://vibe.filesafe.space/1782888190245745251/assets/b77606e3-2a58-4054-8ccd-77f8ca538c54.png",
    link: "/lal-kitab-report"
  },
  {
    title: "Sade Sati Report",
    description: "Find out if you are undergoing Shani Sade Sati or Dhaiya and its impact on your life.",
    image: "https://vibe.filesafe.space/1782888190245745251/assets/950968be-6d25-48cb-baac-8841116e5294.png",
    link: "/kal-sarp-manglik-dosha-report"
  },
  {
    title: "Kundli Report",
    description: "Generate your detailed Vedic birth chart with planetary positions, doshas, and life predictions.",
    image: "https://vibe.filesafe.space/1782888190245745251/assets/730a08c5-aca7-4ee2-a535-e36a11549caf.png",
    link: "/free-kundli"
  },
  {
    title: "Match Making Report",
    description: "Check compatibility with your partner using the traditional Ashta Koota Milan system.",
    image: "https://vibe.filesafe.space/1782888190245745251/assets/dcd8cb04-300e-4772-85b9-de1c62587323.png",
    link: "/kundli-matching"
  },
  {
    title: "Love Report",
    description: "Discover the astrological compatibility and love potential between you and your partner.",
    image: "https://vibe.filesafe.space/1782888190245745251/assets/516f1e0b-1ca3-4dc0-adf0-17cbf4b033cb.png",
    link: "/couple-kundli-analysis"
  },
  {
    title: "Baby Name Report",
    description: "Find the perfect, auspicious name for your newborn based on their birth Nakshatra and planetary alignment.",
    image: "https://vibe.filesafe.space/1782888190245745251/attachments/2fee7322-bf5e-46f1-aff5-308b694f7fba.jpg",
    link: "/baby-name-report"
  }
];

export function Features() {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10 max-w-[1300px]">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl md:text-5xl font-bold font-serif mb-4 text-primary">
            Free Calculator
          </h2>
          <p className="text-lg text-foreground/80">
            Explore the calculator everyone trusts for daily clarity and guidance
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 3000,
            }),
          ]}
          className="w-full relative"
        >
          <CarouselContent className="-ml-4">
            {calculators.map((calc, index) => (
              <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <Card onClick={() => navigate(calc.link)} className="bg-[#FFFDF9] border border-[#F5C27A] p-1.5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-500 group cursor-pointer h-full relative flex flex-col rounded-none text-left">
                  <div className="border border-[#F5C27A]/50 h-full flex flex-col relative overflow-hidden">
                    <div className="relative h-[240px] w-full overflow-hidden">
                      <img src={calc.image} alt={calc.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#FFFDF9] via-[#FFFDF9]/90 to-transparent"></div>
                    </div>
                    <CardContent className="p-5 pt-0 relative z-10 flex flex-col flex-grow bg-[#FFFDF9]">
                      <h3 className="text-xl font-semibold font-serif mb-2 text-primary">{calc.title}</h3>
                      <p className="text-foreground/80 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">{calc.description}</p>
                      <Button className="w-full bg-gradient-to-b from-[#FAD28C] to-[#F19D38] hover:opacity-90 text-black font-semibold rounded-sm shadow-sm transition-all duration-300 h-12 text-sm tracking-wide group/btn flex items-center justify-center gap-2">
                        TRY NOW FOR FREE
                        <span className="bg-black/10 rounded-full p-1 ml-1 transition-transform duration-300 group-hover/btn:translate-x-1.5 group-hover/btn:bg-black/20">
                          <ArrowRight className="w-3.5 h-3.5 text-black" />
                        </span>
                      </Button>
                    </CardContent>
                  </div>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden xl:flex -left-16 w-12 h-12 bg-[#FFFDF9] hover:bg-primary text-primary hover:text-secondary border-secondary shadow-md hover:shadow-lg hover:scale-110 transition-all duration-300" />
          <CarouselNext className="hidden xl:flex -right-16 w-12 h-12 bg-[#FFFDF9] hover:bg-primary text-primary hover:text-secondary border-secondary shadow-md hover:shadow-lg hover:scale-110 transition-all duration-300" />
        </Carousel>
      </div>
    </section>
  );
}
