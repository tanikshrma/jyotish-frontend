import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { TrustBadges } from "@/components/TrustBadges";
import { Services } from "@/components/Services";
import { DiscoverBlueprint } from "@/components/DiscoverBlueprint";
import { LeadForm } from "@/components/LeadForm";
import { Features } from "@/components/Features";
import { VideoGuides } from "@/components/VideoGuides";
import { Testimonials } from "@/components/Testimonials";
import { Zodiac } from "@/components/Zodiac";
import { Footer } from "@/components/Footer";
import { FinalCTA } from "@/components/FinalCTA";
import { SEO } from "@/components/SEO";

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background">
      <SEO 
        title="JyotishNow — India's No.1 Vedic Astrologer" 
        description="Get personalized Kundli, expert astrology consultation, and accurate life predictions from Dr. Sandeep Sawhney. Transform your life with Vedic wisdom."
        keywords="Vedic Astrology, Kundli, Horoscope, Dr. Sandeep Sawhney, JyotishNow, Astrology Consultation"
      />
      {/* Global Pattern Overlay */}
      <div 
        className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at center, #f5c178 1.5px, transparent 1.5px)`,
          backgroundSize: `24px 24px`
        }}
      />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Hero />
          <Services />
          <TrustBadges />
          <DiscoverBlueprint />
          <LeadForm />
          <Features />
          <Zodiac />
          <VideoGuides />
          <Testimonials />
          <FinalCTA 
            title="Ready to Transform Your Life?"
            description="Book a consultation today and unlock the doors to health, wealth, and prosperity with expert guidance."
            primaryBtnText="Book Consultation Now"
            primaryBtnLink="/get-consultation"
            secondaryBtnText="Contact Us"
          />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Index;
