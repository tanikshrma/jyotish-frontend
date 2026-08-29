import { ReportTemplate } from "@/components/ReportTemplate";
import { CalculatorForm } from "@/components/CalculatorForm";
import { Heart, Users, Star, BookOpen, ShieldCheck, Zap, Coins, Activity } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function KundliMatching() {
  return (
    <>
      <SEO 
        title="Kundli Matching - JyotishNow" 
        description="Ensure a harmonious marriage with detailed Kundli matching and compatibility analysis based on ancient Vedic principles."
      />
      <ReportTemplate
      title="Matchmaking Consultation"
      highlightedTitle="Report"
      description="Ensure a harmonious and prosperous married life with our detailed Ashta Koota Milan and Dosha analysis based on ancient Vedic astrology."
      heroImage="https://vibe.filesafe.space/1782888190245745251/assets/0c329c4a-21f4-447a-96b6-655c9071bbe8.jpg"
      heroBgImage="https://vibe.filesafe.space/1782888190245745251/attachments/47f81405-bf4d-4943-8023-91bad5d11cf3.png"
      whatIsIt={{
        title: "What is",
        highlightedTitle: "Kundli Matching?",
        description: "Kundli Matching, or Guna Milan, is the ancient Vedic practice of analyzing the compatibility between two individuals before marriage to ensure a blissful union.",
        points: [
          { title: "Ashta Koota Milan", desc: "Detailed analysis of 36 Gunas for mental and physical compatibility.", icon: Heart },
          { title: "Manglik Dosha Check", desc: "Identification of Manglik Dosha and its remedies.", icon: ShieldCheck },
          { title: "Longevity & Health", desc: "Assessment of health and longevity of both partners.", icon: Activity },
        ],
        image: "/images/couple-kundli.webp"
      }}
      benefits={[
        { icon: Heart, title: "Relationship Harmony", desc: "Understand mutual compatibility and emotional connection." },
        { icon: ShieldCheck, title: "Dosha Remedies", desc: "Get practical remedies for any astrological mismatches." },
        { icon: Users, title: "Family Peace", desc: "Ensure a peaceful and prosperous family life." },
        { icon: Star, title: "Future Prosperity", desc: "Analyze financial and career growth after marriage." },
      ]}
      faqs={[
        { q: "What is Guna Milan?", a: "Guna Milan is a system of matching 36 points (Gunas) between the bride and groom. A minimum of 18 points is considered favorable for marriage." },
        { q: "What if we have Manglik Dosha?", a: "Having a Manglik Dosha is common. Our report provides simple and effective remedies to nullify its effects." },
        { q: "Do I need accurate birth time for both?", a: "Yes, accurate birth details for both individuals are required for a precise compatibility analysis." },
      ]}
      calculatorForm={<CalculatorForm type="matchmaking" title="Matchmaking Consultation Report" />}
    />
    </>
  );
}
