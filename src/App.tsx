import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BabyNameReport from "./pages/BabyNameReport";
import LalKitabReport from "./pages/LalKitabReport";
import KundliMatching from "./pages/KundliMatching";
import AboutUs from "./pages/AboutUs";
import VastuConsultancy from "./pages/VastuConsultancy";
import GetConsultation from "./pages/GetConsultation";
import ContactUs from "./pages/ContactUs";
import YearlyHoroscope from "./pages/YearlyHoroscope";
import WeeklyHoroscope from "./pages/WeeklyHoroscope";
import DailyHoroscope from "./pages/DailyHoroscope";
import KalSarpDoshaReport from "./pages/KalSarpDoshaReport";
import SadeSatiReport from "./pages/SadeSatiReport";
import LandingRoute from "./pages/landing/LandingRoute";
import CompleteHoroscopeAnalysis from "./pages/CompleteHoroscopeAnalysis";
import MatchmakingConsultation from "./pages/MatchmakingConsultation";
import CoupleKundliAnalysis from "./pages/CoupleKundliAnalysis";
import CareerGuidance from "./pages/CareerGuidance";
import ZodiacSign from "./pages/ZodiacSign";
import FreeKundliCalculator from "./pages/FreeKundliCalculator";
import { Preloader } from "./components/Preloader";
import { WhatsAppButton } from "./components/WhatsAppButton";
import { trackPageView } from "./lib/tracking";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return;
    }
    window.scrollTo(0, 0);
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 50);
  }, [pathname, hash]);

  return null;
};

/**
 * Reports each in-app navigation to Prospect IQ's External Tracking script,
 * which only records the first page it loads on. The first view is left to
 * the script itself so it isn't counted twice.
 */
const TrackPageViews = () => {
  const { pathname, search } = useLocation();
  const previous = useRef<string | null>(null);

  useEffect(() => {
    const here = `${pathname}${search}`;
    const from = previous.current;
    previous.current = here;
    if (from === null || from === here) return;
    // Give the new page a moment to set its document.title.
    const t = setTimeout(() => trackPageView(`${window.location.origin}${from}`), 300);
    return () => clearTimeout(t);
  }, [pathname, search]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Preloader />
      <Sonner position="top-center" richColors />
      <WhatsAppButton />
      <BrowserRouter>
        <ScrollToTop />
        <TrackPageViews />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/baby-name-report" element={<BabyNameReport />} />
          <Route path="/lal-kitab-report" element={<LalKitabReport />} />
          <Route path="/kundli-matching" element={<KundliMatching />} />
          <Route path="/vastu-consultancy" element={<VastuConsultancy />} />
          <Route path="/get-consultation" element={<GetConsultation />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/yearly-horoscope-report" element={<YearlyHoroscope />} />
          <Route path="/weekly-horoscope" element={<WeeklyHoroscope />} />
          <Route path="/daily-horoscope" element={<DailyHoroscope />} />
          <Route path="/kal-sarp-manglik-dosha-report" element={<KalSarpDoshaReport />} />
          <Route path="/sade-sati-report" element={<SadeSatiReport />} />
          <Route path="/complete-horoscope-analysis" element={<CompleteHoroscopeAnalysis />} />
          <Route path="/matchmaking-consultation" element={<MatchmakingConsultation />} />
          <Route path="/couple-kundli-analysis" element={<CoupleKundliAnalysis />} />
          <Route path="/career-guidance" element={<CareerGuidance />} />
          <Route path="/zodiac/:sign" element={<ZodiacSign />} />
          <Route path="/free-kundli" element={<FreeKundliCalculator />} />
          <Route path="/horoscope" element={<CompleteHoroscopeAnalysis />} />
          {/* Standalone ad landing pages (career/vastu/marriage) for subdomains. */}
          <Route path="/lp/:topic" element={<LandingRoute />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
