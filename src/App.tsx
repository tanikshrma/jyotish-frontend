import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
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
import CompleteHoroscopeAnalysis from "./pages/CompleteHoroscopeAnalysis";
import MatchmakingConsultation from "./pages/MatchmakingConsultation";
import CoupleKundliAnalysis from "./pages/CoupleKundliAnalysis";
import CareerGuidance from "./pages/CareerGuidance";
import ZodiacSign from "./pages/ZodiacSign";
import FreeKundliCalculator from "./pages/FreeKundliCalculator";
import { Preloader } from "./components/Preloader";
import { WhatsAppButton } from "./components/WhatsAppButton";

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

const ScrollReveal = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-8");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const selector = "section h1, section h2, section h3, section p, section .grid > div, section form, section img, section .bg-card, section .rounded-2xl, section .rounded-3xl";
    const elements = Array.from(document.querySelectorAll(selector)).filter((el) => {
      let parent = el.parentElement;
      while (parent && parent.tagName !== 'SECTION') {
        if (parent.matches(selector)) {
          return false;
        }
        parent = parent.parentElement;
      }
      return true;
    });

    elements.forEach((el) => {
      el.classList.add("transition-all", "duration-1000", "ease-out", "opacity-0", "translate-y-8");
      // Add a slight delay to let the DOM settle
      setTimeout(() => observer.observe(el), 100);
    });

    return () => observer.disconnect();
  }, [pathname]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Preloader />
      <Toaster />
      <Sonner />
      <WhatsAppButton />
      <BrowserRouter>
        <ScrollToTop />
        <ScrollReveal />
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
          <Route path="/complete-horoscope-analysis" element={<CompleteHoroscopeAnalysis />} />
          <Route path="/matchmaking-consultation" element={<MatchmakingConsultation />} />
          <Route path="/couple-kundli-analysis" element={<CoupleKundliAnalysis />} />
          <Route path="/career-guidance" element={<CareerGuidance />} />
          <Route path="/zodiac/:sign" element={<ZodiacSign />} />
          <Route path="/free-kundli" element={<FreeKundliCalculator />} />
          <Route path="/horoscope" element={<CompleteHoroscopeAnalysis />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
