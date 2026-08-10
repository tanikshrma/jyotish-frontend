import { Card, CardContent } from "./ui/card";
import { Star, Quote, BadgeCheck } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";

const testimonials = [
  {
    name: "Meenal Arora",
    content: "I was facing severe health issues and constant emotional breakdowns. Doctors had no clear answers. That’s when I turned to JyotishNow. Dr. Sandeep analyzed my chart and pointed out a major Rahu–Moon affliction. He suggested a healing mantra, daily spiritual discipline, and a gemstone to wear. Within a few weeks, my sleep improved and so did my mental stability. For the first time in years, I felt understood. He gave me timelines to watch out for and explained everything in detail. His knowledge of nakshatras and graha dasha is incredibly deep. He was honest, direct, but always kind. His remedies were aligned with my faith and were practical. Now my health is stable, and I feel spiritually alive again. My trust in astrology and in life has been restored. Dr. Sandeep is truly among the top five astrologers in India. He gave me light in the darkest phase of my life. I am deeply grateful to JyotishNow.",
  },
  {
    name: "Vikas Rathi",
    content: "When I couldn’t crack competitive exams after multiple attempts, I lost confidence. A friend suggested I try astrological consultation from Dr. Sandeep. He told me about planetary obstructions in my chart and a wrong timing I had been choosing. He asked me to delay my next attempt and prepare during a stronger Mercury–Jupiter phase. With specific remedies and a routine he suggested, I felt more focused and calm. The results? I finally cleared the exam I had been failing for three years. His guidance was 100% accurate and based on clear astrological logic. I never imagined astrology could be this precise and empowering. His recommendations were simple yet so powerful. His reading style is professional and respectful.",
  },
  {
    name: "Tarun Malhotra",
    content: "I started experiencing strange delays in all areas of my life: job, marriage, finances. Despite working hard, nothing was moving forward. Dr. Sandeep at JyotishNow was my last resort. In our first session, he pinpointed my Saturn–Ketu issues. He broke down the impact of the dasha I was going through. What shocked me was how detailed and accurate his reading was. His remedies were powerful and slowly began showing effects. Within 5 months, I got a promotion I was waiting for. Marriage talks also started progressing positively. He also helped me through a critical surgery phase. JyotishNow gave me clarity when nothing else could. Dr. Sandeep’s predictions are so precise, it feels unreal. He is deeply knowledgeable and extremely grounded.",
  },
  {
    name: "Priya Mehta",
    content: "I was going through one of the most confusing phases of my life, both personally and professionally. Someone recommended Dr. Sandeep from JyotishNow, and I can confidently say it was a turning point. His reading of my birth chart was incredibly accurate. He explained the planetary positions with so much clarity and gave me practical, doable remedies. Within weeks of following his advice, I noticed a shift in my mental peace. Career opportunities that had stalled started moving again. He’s not just an astrologer, but a true life guide. Dr. Sandeep is among the top astrologers in India for a reason. His depth of knowledge is unmatched. I now consult him before every major decision. Whether it was choosing my wedding date or finalizing a home deal, his guidance has been spot on. The gemstone recommendation he gave me was another game-changer. It helped balance my emotions and brought much-needed positivity. His spiritual approach blended with scientific reasoning makes him unique. JyotishNow is a blessing for those who are lost or stuck.",
  },
  {
    name: "Rajeev Khanna",
    content: "Astrology was something I was always skeptical about, until I met Dr. Sandeep. A friend told me how his predictions were life-altering, so I gave it a try. To my surprise, everything he said during our first session matched my past perfectly. He described my nature, my struggles, and even my relationship dynamics so accurately. But the best part? He gave me real, doable solutions and not fear-based predictions. From simple pujas to wearing a recommended gemstone, everything he guided me through brought visible results. My business, which was stuck for 8 months, saw sudden growth. Dr. Sandeep does not treat you like a client, instead he treats you like his family. His humility and calm energy are rare. JyotishNow is not just another astrology site, in fact it’s a platform that genuinely uplifts people. His readings are a mix of ancient wisdom and practical insight. Now my whole family consults him. There is no decision we take without his astrological input. He truly deserves his place among the top five astrologers in India.",
  },
  {
    name: "Neha Bansal",
    content: "After two failed relationships and constant anxiety about my future, I reached out to Dr. Sandeep. His analysis of my horoscope brought tears to my eyes—it was as if he had read my soul. He calmly explained the reasons behind the emotional turmoil I was facing. He suggested mantras, daily rituals, and a specific gemstone. Within three months, I felt lighter, stronger, and more in control of my life. Most importantly, I understood myself better. His compassion made me feel heard and safe. Dr. Sandeep isn’t just a top astrologer—he’s a spiritual healer. His approach is kind, yet deeply scientific. What amazed me was how precise his timeline predictions were. Everything unfolded exactly as he said. JyotishNow gave me hope when I had none. He even helped me choose the perfect date for starting my business. My energy, finances, and mental health have all improved. I’ve recommended him to all my friends now. India is blessed to have an astrologer like Dr. Sandeep. He's not just top 5—he's the most genuine one out there. May many more find light through him.",
  },
  {
    name: "Ankit Deshmukh",
    content: "I never believed in astrology until I faced a sudden business collapse. My life turned upside down in just six months with losses, stress, and no clarity. A client of mine recommended JyotishNow and Dr. Sandeep. From the first call, I felt a shift in energy. He diagnosed the planetary doshas in my chart with precision. What shocked me was how clearly, he outlined my past events and turning points. He provided remedies that were realistic and easy to follow. From pujas to shifting my office and wearing a gemstone, everything helped. Slowly, my business started growing. Dr. Sandeep guided me on a spiritual and practical level. He never made unrealistic promises, but his wisdom was spot on. Now I consult him before every key decision and he has that rare combination of deep Vedic knowledge and modern communication. JyotishNow is now a permanent bookmark in my life. If you’re facing any life issue, I strongly suggest you talk to him once. It could change your entire path.",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-[#FFFDF9] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at center, #F5C27A 1.5px, transparent 1.5px)`,
          backgroundSize: `24px 24px`
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10 max-w-[1300px]">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-serif mb-6 text-black">
            Happy Client <span className="text-primary">Testimonials</span>
          </h2>
          <p className="text-black/80 max-w-4xl mx-auto text-lg">
            Discover how our expert guidance has helped thousands find clarity, purpose, and peace in their lives.
          </p>
        </div>

        <div className="relative w-full mx-auto pt-4 pb-16 md:px-12">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4 md:-ml-8 py-8">
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="pl-4 md:pl-8 md:basis-1/2 lg:basis-1/2">
                  <Card className="h-full bg-white border border-[#E9DED3] shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-2xl relative z-10 hover:z-20 hover:-translate-y-1.5 hover:shadow-[0_12px_30px_rgba(120,8,8,0.1)] hover:border-[#F5C27A]/60 transition-all duration-500 overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#F5C27A]/10 to-transparent rounded-bl-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardContent className="p-8 md:p-10 relative h-full flex flex-col">
                      <Quote className="absolute top-8 right-8 w-16 h-16 text-[#F5C27A]/10 group-hover:text-[#F5C27A]/20 transition-colors duration-500" />
                      
                      <div className="flex items-center gap-4 mb-6 relative z-10">
                        <div className="w-14 h-14 rounded-full bg-[#FFFDF9] border border-[#F5C27A]/30 flex items-center justify-center text-primary font-bold text-xl shrink-0 group-hover:bg-gradient-to-br group-hover:from-[#F5C27A] group-hover:to-[#E8B25A] group-hover:text-white group-hover:border-transparent transition-all duration-500 shadow-sm">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-black flex items-center gap-2">
                            {testimonial.name}
                            <BadgeCheck className="w-5 h-5 text-[#F5C27A]" />
                          </h4>
                          <div className="flex gap-1 text-[#F5C27A] mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className="w-4 h-4 fill-current" />
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm leading-relaxed relative z-10 flex-grow text-left">
                        "{testimonial.content}"
                      </p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-4 md:-left-6 bg-white text-primary border-[#E9DED3] shadow-sm hover:bg-[#F5C27A] hover:text-white hover:border-transparent transition-all duration-300 h-12 w-12 rounded-full" />
            <CarouselNext className="hidden md:flex -right-4 md:-right-6 bg-white text-primary border-[#E9DED3] shadow-sm hover:bg-[#F5C27A] hover:text-white hover:border-transparent transition-all duration-300 h-12 w-12 rounded-full" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
