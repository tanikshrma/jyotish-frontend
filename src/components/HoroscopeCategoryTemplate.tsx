import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  Briefcase, 
  Stethoscope, 
  Banknote, 
  GraduationCap, 
  Users, 
  Plane, 
  Star, 
  ChevronDown, 
  SunMedium,
  CheckCircle2,
  AlertCircle,
  Gem,
  Hash,
  Palette,
  Compass,
  Clock,
  Type,
  Globe2,
  Sparkles,
  ArrowRight,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { zodiacSigns, horoscopeFaqs, horoscopeCategories } from "@/data/horoscopeData";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FinalCTA } from "@/components/FinalCTA";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { vedicAstroApi } from "@/lib/vedicAstroApi";


interface HoroscopeCategoryTemplateProps {
  title: string;
  timeframe: string;
  category: "daily" | "weekly" | "monthly" | "yearly";
  description: string;
}

export const HoroscopeCategoryTemplate = ({ title, timeframe, category, description }: HoroscopeCategoryTemplateProps) => {
  const location = useLocation();
  const initialSignId = location.state?.selectedSign;
  const initialSign = zodiacSigns.find(s => s.id === initialSignId) || zodiacSigns[0];
  const [activeZodiac, setActiveZodiac] = useState(initialSign);
  const [language, setLanguage] = useState<"en" | "hi">("en");

  const todayDateStr = new Date().toLocaleDateString('en-GB');

  const { data: apiPrediction, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['horoscope', activeZodiac.id, category, language, todayDateStr],
    queryFn: () => {
      if (category === 'monthly') return Promise.resolve({ status: 'unavailable' });
      return vedicAstroApi.getSunSignPrediction(activeZodiac.name, category, language);
    },
    staleTime: category === 'daily' ? 1000 * 60 * 60 * 24 : // 24 hours
               category === 'weekly' ? 1000 * 60 * 60 * 24 * 7 : // 7 days
               category === 'yearly' ? 1000 * 60 * 60 * 24 * 365 : // 365 days
               1000 * 60 * 60 * 24,
    placeholderData: keepPreviousData,
  });

  const reading = useMemo(() => {
    if (category === 'monthly') {
      return {
        isUnavailable: true,
        overview: language === 'hi' ? "वास्तविक समय मासिक राशिफल वर्तमान में अनुपलब्ध है और जल्द ही उपलब्ध होगा।" : "Real-time Monthly Horoscope is currently unavailable and will be available soon.",
        love: "", career: "", finances: "", health: "", travel: "", family: "", education: "",
        luckyColor: "", luckyNumber: "", luckyDirection: "", luckyTime: "", luckyGemstone: "",
        remedy: "", advice: "", planetaryInfluence: "", positiveEnergy: "", challengingArea: "", auspiciousTime: ""
      };
    }

    if (!apiPrediction || !apiPrediction.response) return null;
    if (apiPrediction.status && apiPrediction.status !== 200 && apiPrediction.status !== "success") return null;
    
    const res = apiPrediction.response;
    
    // Sometimes response itself is a string
    if (typeof res === 'string') {
      return {
        overview: res,
        love: "", career: "", finances: "", health: "", travel: "", family: "", education: "",
        luckyColor: "", luckyNumber: "", luckyDirection: "", luckyTime: "", luckyGemstone: "",
        remedy: "", advice: "", planetaryInfluence: "", positiveEnergy: "", challengingArea: "", auspiciousTime: ""
      };
    }

    const pred = typeof res.prediction === 'object' && res.prediction !== null ? res.prediction : {};
    
    // Yearly specific handling for phases
    const phases = category === 'yearly' ? [
      { id: 'phase_1', title: language === 'hi' ? 'चरण 1' : 'Phase 1', data: res.phase_1 },
      { id: 'phase_2', title: language === 'hi' ? 'चरण 2' : 'Phase 2', data: res.phase_2 },
      { id: 'phase_3', title: language === 'hi' ? 'चरण 3' : 'Phase 3', data: res.phase_3 },
      { id: 'phase_4', title: language === 'hi' ? 'चरण 4' : 'Phase 4', data: res.phase_4 },
    ].filter(p => p.data) : [];

    // Extract overview text
    let overviewText = "";
    if (typeof res.bot_response === 'string' && res.bot_response.length > 10) {
      overviewText = res.bot_response;
    } else if (typeof res.prediction === 'string' && res.prediction.length > 10) {
      overviewText = res.prediction;
    } else if (category === 'yearly' && phases.length > 0) {
      overviewText = language === 'hi' ? "आपका वर्ष का विस्तृत विवरण नीचे दिया गया है।" : "Your detailed yearly prediction is divided into phases below.";
    } else {
      overviewText = "";
    }
      
    return {
      overview: overviewText,
      love: res.relationship || pred.relationship || pred.personal || pred.love || pred.relationships || "",
      career: res.career || pred.career || pred.profession || pred.business || "",
      finances: res.finances || pred.finances || pred.luck || pred.finance || pred.wealth || pred.money || "",
      health: res.health || pred.health || "",
      travel: res.travel || pred.travel || "",
      family: res.family || pred.family || "",
      education: res.education || pred.education || "",
      friends: res.friends || pred.friends || "",
      physique: res.physique || pred.physique || "",
      status: res.status || pred.status || "",
      zodiac: res.zodiac || pred.zodiac || "",
      totalScore: res.total_score || pred.total_score || "",
      luckyColor: res.lucky_color || pred.lucky_color || "",
      luckyColorCode: res.lucky_color_code || "",
      luckyNumber: res.lucky_number || pred.lucky_number || "",
      luckyDirection: res.lucky_direction || pred.lucky_direction || "",
      luckyTime: res.lucky_time || pred.lucky_time || "",
      luckyGemstone: res.lucky_gemstone || pred.lucky_gemstone || "",
      remedy: res.remedy || pred.remedy || "",
      advice: res.advice || pred.advice || "",
      planetaryInfluence: res.planetary_influence || pred.planetary_influence || "",
      positiveEnergy: res.positive_energy || pred.positive_energy || "",
      challengingArea: res.challenging_area || pred.challenging_area || "",
      auspiciousTime: res.auspicious_time || pred.auspicious_time || "",
      phases: phases.length > 0 ? phases : null
    };

  }, [apiPrediction]);

  // Ratings and Compatibility should only come from API
  const ratings = useMemo(() => {
    if (!reading || !reading.totalScore) return null;
    
    const score = parseInt(String(reading.totalScore));
    if (isNaN(score)) return null;

    return {
      [language === 'hi' ? "कुल स्कोर" : "Total Score"]: score
    };
  }, [reading, language]);

  const compatibility = useMemo(() => {
    // Only return if API provides it. Current VedicAstroAPI sun-sign doesn't provide specific signs 
    // but might provide a "Compatible Sign" text in some versions.
    // We strictly follow the rule: only from API.
    if (!reading || !reading.zodiac) return null;
    return null; // Hiding for now as it's not in the standard sun-sign response
  }, [reading]);

  useEffect(() => {
    if (location.state?.selectedSign) {
      const sign = zodiacSigns.find(s => s.id === location.state.selectedSign);
      if (sign) {
        setActiveZodiac(sign);
      }
    }
  }, [location.state?.selectedSign]);

  const handleZodiacChange = (sign: typeof zodiacSigns[0]) => {
    setActiveZodiac(sign);
  };


  const getRealTimeDate = () => {
    const today = new Date();
    const locale = language === 'hi' ? 'hi-IN' : 'en-US';
    
    if (category === "daily") {
      return today.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
    } else if (category === "weekly") {
      const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
      const lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 6));
      return `${firstDay.toLocaleDateString(locale, { month: 'short', day: 'numeric' })} - ${lastDay.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else if (category === "monthly") {
      return today.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
    } else if (category === "yearly") {
      return today.getFullYear().toString();
    }
    return "";
  };

  const getTranslatedTitle = () => {
    if (language === 'en') return title;
    if (title.includes("Daily Horoscope")) return "दैनिक राशिफल";
    if (title.includes("Weekly Horoscope")) return "साप्ताहिक राशिफल";
    if (title.includes("Monthly Horoscope")) return "मासिक राशिफल";
    if (title.includes("Yearly Horoscope")) return "वार्षिक राशिफल";
    return title;
  };

  const getTranslatedZodiac = (name: string) => {
    if (language === 'en') return name;
    const translations: Record<string, string> = {
      "Aries": "मेष", "Taurus": "वृषभ", "Gemini": "मिथुन", "Cancer": "कर्क",
      "Leo": "सिंह", "Virgo": "कन्या", "Libra": "तुला", "Scorpio": "वृश्चिक",
      "Sagittarius": "धनु", "Capricorn": "मकर", "Aquarius": "कुंभ", "Pisces": "मीन"
    };
    return translations[name] || name;
  };

  const getTranslatedDescription = () => {
    if (language === 'en') return description;
    if (description.toLowerCase().includes("daily")) return "सटीक दैनिक राशिफल और ज्योतिषीय मार्गदर्शन के साथ अपने दिन की बेहतर योजना बनाएं।";
    if (description.toLowerCase().includes("weekly")) return "सटीक साप्ताहिक राशिफल और ज्योतिषीय मार्गदर्शन के साथ अपने सप्ताह की बेहतर योजना बनाएं।";
    if (description.toLowerCase().includes("monthly")) return "सटीक मासिक राशिफल और ज्योतिषीय मार्गदर्शन के साथ अपने महीने की बेहतर योजना बनाएं।";
    if (description.toLowerCase().includes("yearly")) return "सटीक वार्षिक राशिफल और ज्योतिषीय मार्गदर्शन के साथ अपने वर्ष की बेहतर योजना बनाएं।";
    return description;
  };


  const ScoreCircle = ({ score, label }: { score: number, label: string }) => {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="relative w-24 h-24 sm:w-32 sm:h-32">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-secondary/20"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 40}
              initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
              animate={{ strokeDashoffset: (2 * Math.PI * 40) - (score / 100) * (2 * Math.PI * 40) }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="text-secondary"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl sm:text-3xl font-bold text-primary">{score}</span>
            <span className="text-[8px] sm:text-[10px] uppercase tracking-wider text-foreground/40 font-bold">/ 100</span>
          </div>
        </div>
        <span className="font-serif font-bold text-primary text-lg">{label}</span>
      </div>
    );
  };


  const contentSections = reading ? [
    { id: "overview", icon: Sparkles, title: language === 'hi' ? "संपूर्ण भविष्यवाणी" : "Overall Prediction", content: reading.overview },
    { id: "physique", icon: Users, title: language === 'hi' ? "शारीरिक स्थिति" : "Physique", content: reading.physique },
    { id: "status", icon: Sparkles, title: language === 'hi' ? "स्थिति" : "Status", content: reading.status },
    { id: "love", icon: Heart, title: language === 'hi' ? "प्रेम और संबंध" : "Love & Relationship", content: reading.love },
    { id: "career", icon: Briefcase, title: language === 'hi' ? "करियर" : "Career", content: reading.career },
    { id: "finance", icon: Banknote, title: language === 'hi' ? "वित्त" : "Finance", content: reading.finances },
    { id: "health", icon: Stethoscope, title: language === 'hi' ? "स्वास्थ्य" : "Health", content: reading.health },
    { id: "education", icon: GraduationCap, title: language === 'hi' ? "शिक्षा" : "Education", content: reading.education },
    { id: "family", icon: Users, title: language === 'hi' ? "परिवार" : "Family", content: reading.family },
    { id: "friends", icon: Users, title: language === 'hi' ? "मित्र" : "Friends", content: reading.friends },
    { id: "zodiac", icon: Sparkles, title: language === 'hi' ? "राशि" : "Zodiac", content: reading.zodiac },
    { id: "travel", icon: Plane, title: language === 'hi' ? "यात्रा" : "Travel", content: reading.travel },
    { id: "planetary", icon: SunMedium, title: language === 'hi' ? "आज का ग्रहीय प्रभाव" : "Today's Planetary Influence", content: reading.planetaryInfluence },
    { id: "positive", icon: Sparkles, title: language === 'hi' ? "सकारात्मक ऊर्जा" : "Positive Energy", content: reading.positiveEnergy },
    { id: "challenge", icon: AlertCircle, title: language === 'hi' ? "चुनौतीपूर्ण क्षेत्र" : "Challenging Area", content: reading.challengingArea },
    { id: "remedy", icon: CheckCircle2, title: language === 'hi' ? "आज का उपाय" : "Remedy of the Day", content: reading.remedy },
    { id: "auspicious", icon: Clock, title: language === 'hi' ? "शुभ समय" : "Auspicious Time", content: reading.auspiciousTime },
    { id: "avoid", icon: AlertCircle, title: language === 'hi' ? "इनसे बचें" : "Things to Avoid", content: reading.advice },
  ].filter(section => section.content && String(section.content).trim() !== "" && !/^\d+$/.test(String(section.content))) : [];

  const metaDescription = reading?.overview 
    ? `${getTranslatedZodiac(activeZodiac.name)} ${getTranslatedTitle()} for ${getRealTimeDate()}. ${String(reading.overview).substring(0, 160)}`
    : `Get your complete ${getTranslatedZodiac(activeZodiac.name)} ${getTranslatedTitle()} for ${getRealTimeDate()}.`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO 
        title={`${getTranslatedZodiac(activeZodiac.name)} ${getTranslatedTitle()} (${getRealTimeDate()}) — JyotishNow`}
        description={metaDescription}
        canonicalUrl={`https://jyotishnow.com/${category}-horoscope`}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": `${getTranslatedZodiac(activeZodiac.name)} ${getTranslatedTitle()} for ${getRealTimeDate()}`,
          "description": metaDescription,
          "datePublished": new Date().toISOString(),
          "author": {
            "@type": "Person",
            "name": "Dr. Sandeep Sawhney"
          },
          "publisher": {
            "@type": "Organization",
            "name": "JyotishNow"
          }
        }}
      />

      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-primary text-primary-foreground pt-32 pb-14">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('https://vibe.filesafe.space/1782888190245745251/assets/9b28bd02-75c8-4ecb-ae83-b9ae0e279fe3.png')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-primary"></div>
          </div>
          
          <div className="container relative z-10 mx-auto px-4 max-w-[1300px]">
            <div className="grid lg:grid-cols-2 gap-12 items-center lg:min-h-[600px]">
              <div className="text-center lg:text-left text-white max-w-2xl mx-auto lg:mx-0">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-serif leading-tight mb-6 text-white">
                  {getTranslatedZodiac(activeZodiac.name)} <span className="text-secondary">{getTranslatedTitle()}</span>
                </h1>
                <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl leading-relaxed">
                  {getTranslatedDescription()}
                </p>
                <div className="inline-flex items-center gap-3 px-6 py-3 border border-secondary/30 rounded-full bg-black/30 backdrop-blur-md shadow-[0_0_20px_rgba(245,194,122,0.15)]">
                  <Clock className="w-5 h-5 text-secondary" />
                  <span className="text-lg font-medium text-white tracking-wide">{getRealTimeDate()}</span>
                </div>
              </div>
              
              <div className="w-full max-w-3xl mx-auto lg:max-w-none relative">
                {/* Decorative spinning background matching Home page */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 mix-blend-screen -z-0">
                  <div className="absolute inset-0 rounded-full border border-white/10 animate-[spin_60s_linear_infinite]" />
                  <div className="absolute inset-4 rounded-full border border-white/20 animate-[spin_40s_linear_infinite_reverse]" />
                  <div className="absolute inset-12 rounded-full border border-white/5 animate-[spin_20s_linear_infinite]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img 
                      src="https://vibe.filesafe.space/1782888190245745251/attachments/bdce3955-db78-4df4-9c25-20f67525cda5.webp" 
                      alt="Kundli Chart" 
                      className="w-[95%] h-[95%] object-contain animate-[spin_60s_linear_infinite] opacity-50 contrast-125 brightness-150"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-4 xl:grid-cols-6 gap-x-2 sm:gap-x-4 gap-y-8 sm:gap-y-10 mb-8 sm:mb-12 relative z-10">
                  {zodiacSigns.map((sign) => (
                    <button
                      key={sign.name}
                      onClick={() => handleZodiacChange(sign)}
                      className="flex flex-col items-center group relative"
                    >
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center p-2 sm:p-3 mb-2 sm:mb-3 transition-all duration-500 relative z-10 ${
                        activeZodiac.name === sign.name 
                          ? "bg-gradient-to-br from-[#FFD700] via-[#F5C27A] to-[#FFA500] shadow-[0_0_30px_rgba(245,194,122,0.6)] sm:shadow-[0_0_50px_rgba(245,194,122,0.8)] scale-110 sm:scale-125 ring-2 sm:ring-4 ring-[#F5C27A]/50 ring-offset-2 sm:ring-offset-4 ring-offset-primary" 
                          : "bg-white/10 backdrop-blur-sm group-hover:bg-white/20 group-hover:scale-110 border border-white/10 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                      }`}>
                        {activeZodiac.name === sign.name && (
                          <div className="absolute inset-0 bg-[#F5C27A] blur-xl rounded-full animate-pulse -z-10 opacity-60"></div>
                        )}
                        <img src={sign.icon} alt={sign.name} className="w-full h-full object-contain relative z-10 drop-shadow-xl" />
                      </div>
                      <span className={`text-xs sm:text-sm md:text-base transition-all duration-300 ${
                        activeZodiac.name === sign.name 
                          ? "text-secondary font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] scale-110 mt-1 sm:mt-2" 
                          : "text-white/90 font-medium group-hover:text-white"
                      }`}>
                        {getTranslatedZodiac(sign.name)}
                      </span>
                    </button>
                  ))}
                </div>
                
                <div className="flex justify-center">
                  <div className="inline-flex rounded-xl border border-white/20 overflow-hidden bg-black/20 backdrop-blur-sm shadow-sm p-1">
                    <button 
                      onClick={() => setLanguage("en")}
                      className={`px-6 sm:px-8 py-2 sm:py-2.5 text-sm sm:text-base font-semibold rounded-lg transition-all duration-300 ${language === "en" ? "bg-white text-black shadow-[0_8px_20px_-6px_rgba(255,255,255,0.3)]" : "bg-transparent text-white hover:bg-white/10"}`}
                    >
                      English
                    </button>
                    <button 
                      onClick={() => setLanguage("hi")}
                      className={`px-6 sm:px-8 py-2 sm:py-2.5 text-sm sm:text-base font-semibold rounded-lg transition-all duration-300 ${language === "hi" ? "bg-white text-black shadow-[0_8px_20px_-6px_rgba(255,255,255,0.3)]" : "bg-transparent text-white hover:bg-white/10"}`}
                    >
                      हिन्दी
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Explore Horoscope Prediction */}
        <section className="py-8 bg-[#FFFDF9] border-b border-secondary/20">
          <div className="container mx-auto px-4 max-w-[1300px]">
            <div className="flex flex-col items-center">
              <h2 className="text-2xl md:text-3xl font-bold font-serif text-primary mb-8 text-center">
                {language === 'hi' ? "राशिफल भविष्यवाणियां देखें" : "Explore Horoscope Prediction"}
              </h2>
              <div className="flex flex-wrap justify-center gap-4 w-full">
                {horoscopeCategories.map((cat) => {
                  const isActive = category === cat.id;
                  const linkPath = cat.id === 'daily' ? '/daily-horoscope' : 
                                   cat.id === 'weekly' ? '/weekly-horoscope' :
                                   cat.id === 'monthly' ? '/monthly-horoscope-report' : 
                                   cat.id === 'yearly' ? '/yearly-horoscope-report' : '/horoscope';
                  return (
                    <Link 
                      key={cat.id} 
                      to={linkPath}
                      state={{ selectedSign: activeZodiac.id }}
                      onClick={() => window.scrollTo(0, 0)}
                      className={`flex items-center gap-2 sm:gap-3 px-4 py-3 sm:px-6 sm:py-4 rounded-xl border transition-all duration-300 w-full sm:w-auto justify-center sm:justify-start ${
                        isActive 
                          ? "bg-white border-primary shadow-[0_4px_20px_-5px_rgba(122,8,8,0.3)]" 
                          : "bg-white border-secondary/20 hover:border-primary/50 hover:shadow-sm"
                      }`}
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/5 flex items-center justify-center p-1 overflow-hidden shrink-0">
                        <img src="https://vibe.filesafe.space/1782888190245745251/attachments/f9de88df-e19b-4d72-9477-0a56045ae5ca.webp" alt="Zodiac" className="w-full h-full object-cover" />
                      </div>
                      <span className={`font-medium text-sm sm:text-base ${isActive ? "text-primary" : "text-foreground/80"}`}>
                        {language === 'hi' ? 
                          (cat.id === 'daily' ? 'दैनिक राशिफल' :
                           cat.id === 'weekly' ? 'साप्ताहिक राशिफल' :
                           cat.id === 'monthly' ? 'मासिक राशिफल' :
                           cat.id === 'yearly' ? 'वार्षिक राशिफल' : 'चीनी राशिफल') : cat.label}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Result Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-[1300px]">
            <div className="flex flex-col lg:flex-row gap-12">
              
              {/* Left Column: Content */}
              <div className="flex-1 space-y-12">
                <div className="text-center md:text-left border-b border-secondary/20 pb-8">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-primary mb-4">
                    {getTranslatedZodiac(activeZodiac.name)} {getTranslatedTitle()}
                  </h2>
                  <p className="text-xl text-foreground/60">({getRealTimeDate()})</p>
                </div>

                <div className="space-y-8 relative">
                  {isLoading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex items-center justify-center rounded-3xl min-h-[400px]">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        <p className="text-primary font-medium animate-pulse">
                          {language === 'hi' ? "सितारों से परामर्श कर रहे हैं..." : "Consulting the stars..."}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {(!isLoading && (!reading || isError)) && (
                    <div className="p-8 bg-red-50 border border-red-100 rounded-2xl text-center relative z-10">
                      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                      <p className="text-red-800 font-medium mb-2">
                        {language === 'hi' ? "भविष्यवाणी लोड करने में विफल।" : "Failed to load prediction."}
                      </p>
                      {(apiPrediction?.error || (error as any)?.message) && (
                        <p className="text-red-600 text-sm mb-4 bg-white/50 p-2 rounded border border-red-200">
                          {apiPrediction?.error || (error as any)?.message}
                        </p>
                      )}
                      <Button 
                        onClick={() => refetch()} 
                        variant="outline" 
                        className="border-red-200 text-red-700 hover:bg-red-100"
                      >
                        {language === 'hi' ? "पुनः प्रयास करें" : "Try Again"}
                      </Button>
                    </div>
                  )}

                  {reading?.phases && (
                    <div className="space-y-8">
                      {reading.phases.map((phase: any, idx: number) => (
                        <motion.div 
                          key={phase.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.1 }}
                          className="bg-secondary/5 rounded-2xl p-6 md:p-8 border border-secondary/30 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                <Sparkles className="w-6 h-6" />
                              </div>
                              <h3 className="text-2xl font-bold font-serif text-primary">{phase.title}</h3>
                            </div>
                            {phase.data.score && (
                              <div className="flex items-center gap-4">
                                <div className="relative w-12 h-12 sm:w-16 sm:h-16">
                                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 50 50">
                                    <circle cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-secondary/20" />
                                    <motion.circle
                                      cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="4" fill="transparent"
                                      strokeDasharray={2 * Math.PI * 20}
                                      initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                                      animate={{ strokeDashoffset: (2 * Math.PI * 20) - (parseInt(phase.data.score) / 100) * (2 * Math.PI * 20) }}
                                      transition={{ duration: 1, delay: 0.5 }}
                                      className="text-secondary"
                                    />
                                  </svg>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-[8px] sm:text-[10px] font-bold text-primary">{phase.data.score}%</span>
                                  </div>
                                </div>
                                <span className="text-xs sm:text-sm font-bold text-primary/60 uppercase tracking-wider">{language === 'hi' ? "स्कोर" : "Score"}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-foreground/80 leading-relaxed text-lg">
                            {phase.data.prediction}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {contentSections.map((section, idx) => (
                    <motion.div 
                      key={section.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: (reading?.phases?.length || 0) * 0.1 + idx * 0.1 }}
                      className="bg-[#FFFDF9] rounded-2xl p-6 md:p-8 border border-secondary/20 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary/5 text-primary flex items-center justify-center">
                          <section.icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold font-serif text-primary">{section.title}:</h3>
                      </div>
                      <p className="text-foreground/80 leading-relaxed text-lg">
                        {section.content}
                      </p>
                    </motion.div>
                  ))}
                </div>

              </div>

              {/* Right Column: Sidebar */}
              {category !== 'monthly' && (
                <div className="w-full lg:w-[400px] flex-shrink-0 space-y-8">
                
                {/* Score Cards */}
                {ratings && (
                  <div className="bg-[#FFFDF9] rounded-2xl p-8 border border-secondary/20 flex flex-col items-center justify-center text-center">
                    <h4 className="text-xl font-bold font-serif text-primary mb-8 flex items-center gap-2 self-start">
                      <Star className="w-5 h-5 text-secondary" />
                      {language === 'hi' ? "आज का स्कोर" : "Today's Score"}
                    </h4>
                    {Object.entries(ratings).map(([key, score]) => (
                      <ScoreCircle key={key} score={score} label={key} />
                    ))}
                  </div>
                )}

                {/* Lucky Information */}
                {reading && (reading.luckyColor || reading.luckyNumber || reading.luckyDirection || reading.luckyTime || reading.luckyGemstone) && (
                  <div className="bg-[#FFFDF9] rounded-2xl p-6 border border-secondary/20">
                    <h4 className="text-xl font-bold font-serif text-primary mb-6 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-secondary" />
                      {language === 'hi' ? "शुभ जानकारी" : "Lucky Information"}
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {reading.luckyColor && (
                        <div className="bg-white p-4 rounded-xl border border-secondary/10 text-center">
                          <Palette className="w-6 h-6 text-primary mx-auto mb-2" />
                          <p className="text-xs text-foreground/60 mb-1">{language === 'hi' ? "शुभ रंग" : "Lucky Colour"}</p>
                          <p className="font-semibold text-primary flex items-center justify-center gap-2">
                            {reading.luckyColor}
                            {reading.luckyColorCode && (
                              <span 
                                className="w-3 h-3 rounded-full border border-gray-200" 
                                style={{ backgroundColor: reading.luckyColorCode }}
                              />
                            )}
                          </p>
                        </div>
                      )}
                      {reading.luckyNumber && (
                        <div className="bg-white p-4 rounded-xl border border-secondary/10 text-center">
                          <Hash className="w-6 h-6 text-primary mx-auto mb-2" />
                          <p className="text-xs text-foreground/60 mb-1">{language === 'hi' ? "शुभ अंक" : "Lucky Number"}</p>
                          <p className="font-semibold text-primary">{reading.luckyNumber}</p>
                        </div>
                      )}
                      {reading.luckyDirection && (
                        <div className="bg-white p-4 rounded-xl border border-secondary/10 text-center">
                          <Compass className="w-6 h-6 text-primary mx-auto mb-2" />
                          <p className="text-xs text-foreground/60 mb-1">{language === 'hi' ? "शुभ दिशा" : "Lucky Direction"}</p>
                          <p className="font-semibold text-primary">{reading.luckyDirection}</p>
                        </div>
                      )}
                      {reading.luckyTime && (
                        <div className="bg-white p-4 rounded-xl border border-secondary/10 text-center">
                          <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                          <p className="text-xs text-foreground/60 mb-1">{language === 'hi' ? "शुभ समय" : "Lucky Time"}</p>
                          <p className="font-semibold text-primary text-sm">{reading.luckyTime}</p>
                        </div>
                      )}
                      {reading.luckyGemstone && (
                        <div className="bg-white p-4 rounded-xl border border-secondary/10 text-center col-span-2">
                          <Gem className="w-6 h-6 text-primary mx-auto mb-2" />
                          <p className="text-xs text-foreground/60 mb-1">{language === 'hi' ? "शुभ रत्न" : "Lucky Gemstone"}</p>
                          <p className="font-semibold text-primary">{reading.luckyGemstone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Compatibility */}
                {compatibility && (
                  <div className="bg-[#FFFDF9] rounded-2xl p-6 border border-secondary/20">
                    <h4 className="text-xl font-bold font-serif text-primary mb-6 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-secondary" />
                      {language === 'hi' ? "अनुकूलता" : "Compatibility"}
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-secondary/10">
                        <div>
                          <p className="text-xs text-foreground/60 mb-1">{language === 'hi' ? "सर्वश्रेष्ठ मिलान" : "Best Match"}</p>
                          <p className="font-semibold text-green-600">{getTranslatedZodiac(compatibility.best.name)}</p>
                        </div>
                        <img src={compatibility.best.icon} alt={compatibility.best.name} className="w-10 h-10" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-secondary/10">
                        <div>
                          <p className="text-xs text-foreground/60 mb-1">{language === 'hi' ? "अच्छा मिलान" : "Good Match"}</p>
                          <p className="font-semibold text-blue-600">{getTranslatedZodiac(compatibility.good.name)}</p>
                        </div>
                        <img src={compatibility.good.icon} alt={compatibility.good.name} className="w-10 h-10" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-secondary/10">
                        <div>
                          <p className="text-xs text-foreground/60 mb-1">{language === 'hi' ? "आज बचें" : "Avoid Today"}</p>
                          <p className="font-semibold text-red-600">{getTranslatedZodiac(compatibility.avoid.name)}</p>
                        </div>
                        <img src={compatibility.avoid.icon} alt={compatibility.avoid.name} className="w-10 h-10" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Related Horoscope Links */}
                <div className="bg-[#FFFDF9] rounded-2xl p-6 border border-secondary/20">
                  <h4 className="text-xl font-bold font-serif text-primary mb-6 border-b border-secondary/20 pb-4">
                    {language === 'hi' ? "संबंधित राशिफल" : "Related Horoscope"}
                  </h4>
                  <div className="flex flex-col gap-3">
                    {[
                      { label: language === 'hi' ? "आज का राशिफल" : "Today's Horoscope", path: "/daily-horoscope" },
                      { label: language === 'hi' ? "साप्ताहिक राशिफल" : "Weekly Horoscope", path: "/weekly-horoscope" },
                      { label: language === 'hi' ? "वार्षिक राशिफल" : "Yearly Horoscope", path: "/yearly-horoscope-report" }
                    ].map((item) => (
                      <Link key={item.label} to={item.path} state={{ selectedSign: activeZodiac.id }} onClick={() => window.scrollTo(0, 0)}>
                        <Button variant="outline" className="justify-between bg-white border-secondary/20 hover:bg-primary hover:text-white hover:border-primary w-full h-12">
                          {item.label} <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <FinalCTA 
          title={language === 'hi' ? "व्यक्तिगत मार्गदर्शन चाहिए?" : "Need Personal Guidance?"}
          description={language === 'hi' ? "हमारे विशेषज्ञ ज्योतिषियों से सटीक जीवन भविष्यवाणियां और उपाय प्राप्त करें। आज ही अपना परामर्श बुक करें।" : "Get accurate life predictions and remedies from our expert astrologers. Book your consultation today."}
          primaryBtnText={language === 'hi' ? "ज्योतिष परामर्श बुक करें" : "Book Astrology Consultation"}
        />

        {/* FAQ Section */}
        <section className="py-24 bg-[#FFF8F0]">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold font-serif mb-6 text-black">
                {language === 'hi' ? "अक्सर पूछे जाने वाले" : "Frequently Asked"} <span className="text-primary">{language === 'hi' ? "प्रश्न" : "Questions"}</span>
              </h2>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              {horoscopeFaqs.map((faq, index) => {
                const translatedQuestion = language === 'hi' ? [
                  "दैनिक राशिफल पढ़ना किस तरह से मदद करता है?",
                  "राशिफल के स्रोत के बारे में जानना क्यों महत्वपूर्ण है?",
                  "क्या राशिफल के अनुसार दिन की योजना बनाने से मेरे जीवन में कोई फर्क पड़ सकता है?",
                  "दैनिक राशिफल पढ़ते समय मुझे और क्या जानकारी जांचनी चाहिए?",
                  "अगर मेरे जीवन पर कोई नकारात्मक प्रभाव पड़े तो क्या होगा?",
                  "क्या मेरा दैनिक राशिफल देखने के लिए कोई शुल्क है?",
                  "दैनिक राशिफल कितना सटीक होता है?"
                ][index] : faq.question;
                
                const translatedAnswer = language === 'hi' ? [
                  "अपना दैनिक राशिफल पढ़ने से आपको ग्रहों की गतिविधियों और वे आपके मूड, निर्णयों और बातचीत को कैसे प्रभावित कर सकते हैं, इसके बारे में जानकारी देकर दिन की तैयारी करने में मदद मिलती है।",
                  "राशिफल की सटीकता काफी हद तक ज्योतिषी की विशेषज्ञता और इस्तेमाल की गई ज्योतिषीय प्रणाली पर निर्भर करती है। एक विश्वसनीय स्रोत यह सुनिश्चित करता है कि मार्गदर्शन प्रामाणिक गणनाओं पर आधारित है।",
                  "हां, अनुकूल ग्रहों के घंटों के साथ अपनी गतिविधियों को संरेखित करने से आपकी सफलता की संभावना बढ़ सकती है और आपको अनावश्यक संघर्षों या बाधाओं से बचने में मदद मिल सकती है।",
                  "अपनी सूर्य राशि के साथ-साथ, अपनी चंद्र राशि और लग्न की जांच करने से अधिक व्यापक और सटीक दैनिक पूर्वानुमान मिल सकता है।",
                  "ज्योतिष मार्गदर्शन प्रदान करता है, पूर्ण भाग्य नहीं। यदि एक चुनौतीपूर्ण अवधि की भविष्यवाणी की जाती है, तो यह सतर्क रहने की चेतावनी के रूप में कार्य करता है, और अक्सर नकारात्मक प्रभावों को कम करने के उपायों के साथ आता है।",
                  "नहीं, हमारे दैनिक राशिफल आपको ब्रह्मांडीय ज्ञान के साथ अपने दिन को नेविगेट करने में मदद करने के लिए पूरी तरह से मुफ्त प्रदान किए जाते हैं।",
                  "दैनिक राशिफल सूर्य राशियों के आधार पर सामान्य रुझान प्रदान करते हैं। अत्यधिक सटीक और व्यक्तिगत भविष्यवाणियों के लिए, एक संपूर्ण जन्म कुंडली विश्लेषण की सिफारिश की जाती है।"
                ][index] : faq.answer;

                return (
                  <AccordionItem key={index} value={`item-${index}`} className="border border-[#E9DED3] bg-white rounded-2xl mb-4 px-6 md:px-8 shadow-sm overflow-hidden text-left">
                    <AccordionTrigger className="text-left font-bold text-lg md:text-xl text-primary hover:no-underline py-5">
                      {translatedQuestion}
                    </AccordionTrigger>
                    <AccordionContent className="text-foreground/80 text-base md:text-lg leading-relaxed pb-6 text-left">
                      {translatedAnswer}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
            <div className="mt-12 text-center">
               <p className="text-[#4A2B1F] text-lg font-medium mb-4">{language === 'hi' ? "अभी भी प्रश्न हैं?" : "Still have questions?"}</p>
               <Button asChild className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full px-8 h-12 shadow-[0_8px_20px_-6px_rgba(37,211,102,0.4)] transition-all duration-300 hover:-translate-y-1">
                 <a href="https://wa.me/917015544187" target="_blank" rel="noopener noreferrer">
                   <svg className="w-5 h-5 mr-2 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                     <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                   </svg>
                   {language === 'hi' ? "WhatsApp पर जुड़ें" : "Connect on WhatsApp"}
                 </a>
               </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};
