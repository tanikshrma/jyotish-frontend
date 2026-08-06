import { ReportTemplate } from "@/components/ReportTemplate";
import { CalculatorForm } from "@/components/CalculatorForm";
import { Heart, Users, Shield, Zap, Star, CheckCircle } from "lucide-react";

const MatchmakingConsultation = () => {
  return (
    <ReportTemplate
      title="Matchmaking Consultation"
      highlightedTitle="Report"
      description="Ensure a harmonious and prosperous marital life with our expert Kundli Milan and compatibility analysis based on traditional Ashtakoot Milan."
      heroImage="https://vibe.filesafe.space/1782888190245745251/attachments/35ef5d4e-20f5-493d-a3cd-28065329907a.png"
      heroBgImage="https://vibe.filesafe.space/1782888190245745251/attachments/47f81405-bf4d-4943-8023-91bad5d11cf3.png"
      whatIsIt={{
        title: "What is",
        highlightedTitle: "Matchmaking Consultation?",
        description: "A detailed comparison of two birth charts using the Ashtakoot Milan system to evaluate marital compatibility, emotional harmony, and future prosperity.",
        points: [
          { title: "Ashtakoot Guna Milan", desc: "Traditional 36-point matching covering 8 vital aspects of life.", icon: CheckCircle },
          { title: "Dosha Analysis", desc: "Detailed check for Manglik, Bhakoot, and Nadi Doshas.", icon: Shield },
          { title: "Emotional Harmony", desc: "Assessing mental compatibility and mutual understanding.", icon: Heart }
        ],
        image: "https://vibe.filesafe.space/1782888190245745251/attachments/4993962a-b4da-4338-beb4-2e8a3c5ec27c.png"
      }}
      benefits={[
        { title: "Relationship Harmony", desc: "Deep insights into mutual compatibility and temperament.", icon: Heart },
        { title: "Conflict Resolution", desc: "Identify potential areas of friction and ways to overcome them.", icon: Shield },
        { title: "Family Prosperity", desc: "Assess financial growth and familial bond after marriage.", icon: Users },
        { title: "Vedic Remedies", desc: "Effective solutions and remedies for any identified doshas.", icon: Star }
      ]}
      faqs={[
        { q: "What is Ashtakoot Guna Milan?", a: "It is a Vedic system that matches 8 different aspects of the bride and groom's personalities, resulting in a score out of 36." },
        { q: "Is a high Guna score enough for a good marriage?", a: "While a high score is favorable, a complete analysis including Manglik Dosha and planetary positions is recommended for a final decision." },
        { q: "What details are required for matchmaking?", a: "Exact date, time, and place of birth for both individuals are essential for an accurate analysis." },
        { q: "What happens if Nadi Dosha is found?", a: "Nadi Dosha is considered significant in Vedic astrology. However, there are specific cancellations and remedies that can mitigate its effects." }
      ]}
      calculatorForm={<CalculatorForm type="matchmaking" title="Premium Kundli Matching Report" />}
    />
  );
};

export default MatchmakingConsultation;
