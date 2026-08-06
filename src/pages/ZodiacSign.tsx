import { useParams, Link, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FinalCTA } from "@/components/FinalCTA";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, Heart, Briefcase, Calendar, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { vedicAstroApi } from "@/lib/vedicAstroApi";
import { useQuery, keepPreviousData } from "@tanstack/react-query";


const zodiacData: Record<string, any> = {
  aries: { id: 1, name: "Aries", element: "Fire", ruler: "Mars", dates: "Mar 21 - Apr 19", traits: ["Courageous", "Determined", "Confident", "Enthusiastic"] },
  taurus: { id: 2, name: "Taurus", element: "Earth", ruler: "Venus", dates: "Apr 20 - May 20", traits: ["Reliable", "Patient", "Practical", "Devoted"] },
  gemini: { id: 3, name: "Gemini", element: "Air", ruler: "Mercury", dates: "May 21 - Jun 20", traits: ["Gentle", "Affectionate", "Curious", "Adaptable"] },
  cancer: { id: 4, name: "Cancer", element: "Water", ruler: "Moon", dates: "Jun 21 - Jul 22", traits: ["Tenacious", "Highly imaginative", "Loyal", "Emotional"] },
  leo: { id: 5, name: "Leo", element: "Fire", ruler: "Sun", dates: "Jul 23 - Aug 22", traits: ["Creative", "Passionate", "Generous", "Warm-hearted"] },
  virgo: { id: 6, name: "Virgo", element: "Earth", ruler: "Mercury", dates: "Aug 23 - Sep 22", traits: ["Loyal", "Analytical", "Kind", "Hardworking"] },
  libra: { id: 7, name: "Libra", element: "Air", ruler: "Venus", dates: "Sep 23 - Oct 22", traits: ["Cooperative", "Diplomatic", "Gracious", "Fair-minded"] },
  scorpio: { id: 8, name: "Scorpio", element: "Water", ruler: "Pluto, Mars", dates: "Oct 23 - Nov 21", traits: ["Resourceful", "Brave", "Passionate", "Stubborn"] },
  sagittarius: { id: 9, name: "Sagittarius", element: "Fire", ruler: "Jupiter", dates: "Nov 22 - Dec 21", traits: ["Generous", "Idealistic", "Great sense of humor"] },
  capricorn: { id: 10, name: "Capricorn", element: "Earth", ruler: "Saturn", dates: "Dec 22 - Jan 19", traits: ["Responsible", "Disciplined", "Self-control", "Good managers"] },
  aquarius: { id: 11, name: "Aquarius", element: "Air", ruler: "Uranus, Saturn", dates: "Jan 20 - Feb 18", traits: ["Progressive", "Original", "Independent", "Humanitarian"] },
  pisces: { id: 12, name: "Pisces", element: "Water", ruler: "Neptune, Jupiter", dates: "Feb 19 - Mar 20", traits: ["Compassionate", "Artistic", "Intuitive", "Gentle"] },
};

const ZodiacSign = () => {
  const { sign } = useParams<{ sign: string }>();
  const [searchParams] = useSearchParams();
  const timeframe = searchParams.get("timeframe") || "daily";
  const data = sign && zodiacData[sign.toLowerCase()];
  
  const todayDateStr = new Date().toLocaleDateString('en-GB');
  
  const { data: apiPrediction, isLoading: loadingDaily, isError, refetch } = useQuery({
    queryKey: ['horoscope', sign, timeframe, todayDateStr],
    queryFn: () => vedicAstroApi.getSunSignPrediction(data.name, timeframe as any),
    enabled: !!data,
    staleTime: 1000 * 60 * 60 * 24,
    placeholderData: keepPreviousData,
  });

  const reading = useMemo(() => {
    if (!apiPrediction || !apiPrediction.response) return null;
    if (apiPrediction.status && apiPrediction.status !== 200 && apiPrediction.status !== "success") return null;
    
    const res = apiPrediction.response;
    const pred = typeof res.prediction === 'object' && res.prediction !== null ? res.prediction : {};
    
    let overviewText = "";
    if (typeof res.bot_response === 'string' && res.bot_response.length > 10) {
      overviewText = res.bot_response;
    } else if (typeof res.prediction === 'string' && res.prediction.length > 10) {
      overviewText = res.prediction;
    } else {
      overviewText = "";
    }

    return {
      overview: overviewText,
      lucky_color: res.lucky_color || pred.lucky_color || "",
      lucky_number: res.lucky_number || pred.lucky_number || "",
      bot_response: overviewText
    };
  }, [apiPrediction]);


  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold font-serif text-primary mb-4">Sign Not Found</h1>
          <Link to="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <section className="relative overflow-hidden bg-primary text-primary-foreground pt-32 pb-14">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('https://vibe.filesafe.space/1782888190245745251/assets/9b28bd02-75c8-4ecb-ae83-b9ae0e279fe3.png')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-primary"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <Link to="/" className="inline-flex items-center text-white/80 hover:text-secondary mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            
            <div className="max-w-3xl">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-serif leading-tight mb-6 text-white">
                {data.name} <span className="text-secondary">Zodiac Sign</span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl leading-relaxed">
                Discover the deep personality traits, characteristics, and astrological secrets of {data.name}.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl border border-white/20">
                  <span className="text-white/60 text-sm block mb-1">Element</span>
                  <span className="text-white font-medium">{data.element}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl border border-white/20">
                  <span className="text-white/60 text-sm block mb-1">Ruling Planet</span>
                  <span className="text-white font-medium">{data.ruler}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl border border-white/20">
                  <span className="text-white/60 text-sm block mb-1">Dates</span>
                  <span className="text-secondary font-medium">{data.dates}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <h2 className="text-3xl font-serif text-primary mb-6">Personality Traits</h2>
                  <p className="text-foreground/70 mb-8 leading-relaxed">
                    People born under the sign of {data.name} are known for their unique approach to life. Governed by {data.ruler} and the {data.element} element, they possess a distinct set of characteristics that shape their destiny.
                  </p>
                  
                  <ul className="space-y-4">
                    {data.traits.map((trait: string, idx: number) => (
                      <li key={idx} className="flex items-center text-foreground/80 bg-white p-4 rounded-xl border border-black/5 shadow-sm">
                        <Star className="w-5 h-5 text-secondary mr-4 flex-shrink-0" />
                        <span className="font-medium">{trait}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-8">
                  <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10">
                    <Heart className="w-8 h-8 text-primary mb-4" />
                    <h3 className="text-xl font-serif text-primary mb-3">Love & Relationships</h3>
                    <p className="text-foreground/70 text-sm leading-relaxed">
                      In matters of the heart, {data.name} seeks profound connections. Their {data.element.toLowerCase()} nature makes them approach relationships with sincerity and passion.
                    </p>
                  </div>
                  
                  <div className="bg-secondary/10 p-8 rounded-3xl border border-secondary/20">
                    <Briefcase className="w-8 h-8 text-secondary mb-4" />
                    <h3 className="text-xl font-serif text-primary mb-3">Career & Money</h3>
                    <p className="text-foreground/70 text-sm leading-relaxed">
                      Professionally, {data.name} individuals thrive in environments where they can utilize their natural talents. They are driven and often find success through determination.
                    </p>
                  </div>
                  
                   {(loadingDaily || reading) && (
                    <div className="bg-gradient-to-br from-primary/10 to-transparent p-8 rounded-3xl border border-primary/20 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                      <Calendar className="w-8 h-8 text-primary mb-4 relative z-10" />
                      <h3 className="text-xl font-serif text-primary mb-3 relative z-10">
                        {timeframe === "weekly" ? "This Week's Horoscope" : timeframe === "monthly" ? "This Month's Horoscope" : timeframe === "yearly" ? "This Year's Horoscope" : "Today's Horoscope"}
                      </h3>
                      {loadingDaily ? (
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-5 h-5 text-primary animate-spin" />
                          <p className="text-foreground/70 text-sm leading-relaxed animate-pulse">Consulting the stars...</p>
                        </div>
                      ) : isError || !reading ? (
                        <div className="space-y-3 relative z-10">
                          <p className="text-red-600 text-sm">Failed to load prediction.</p>
                          <Button size="sm" variant="outline" onClick={() => refetch()} className="h-8 text-xs">Try Again</Button>
                        </div>
                      ) : (
                        <div className="space-y-4 relative z-10">
                          <p className="text-foreground/70 text-sm leading-relaxed">
                            {reading.overview}
                          </p>
                          {reading.lucky_color && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium text-primary">Lucky Color:</span>
                              <span className="text-foreground/80">{reading.lucky_color}</span>
                            </div>
                          )}
                          {reading.lucky_number && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium text-primary">Lucky Number:</span>
                              <span className="text-foreground/80">{reading.lucky_number}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <FinalCTA 
        title="Want a Deeper Analysis?"
        description={`Get a comprehensive reading of your ${data.name} birth chart from our expert astrologers.`}
        primaryBtnText="Get Your Free Kundli"
        primaryBtnLink="/#calculators"
        secondaryBtnText="Book Consultation"
        secondaryBtnLink="/get-consultation"
      />
      <Footer />
    </div>
  );
};

export default ZodiacSign;
