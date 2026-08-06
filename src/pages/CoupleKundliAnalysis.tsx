import { ReportTemplate } from "@/components/ReportTemplate";
import { CalculatorForm } from "@/components/CalculatorForm";
import { Heart, Target, Shield, Zap, Star, Users } from "lucide-react";

const CoupleKundliAnalysis = () => {
  return (
    <ReportTemplate
      title="Couple Kundli"
      highlightedTitle="Analysis"
      description="Deepen your relationship by understanding the astrological dynamics between you and your partner. Perfect for married or committed couples."
      heroImage=""
      heroBgImage="https://vibe.filesafe.space/1782888190245745251/attachments/47f81405-bf4d-4943-8023-91bad5d11cf3.png"
      whatIsIt={{
        title: "What is",
        highlightedTitle: "Couple Kundli Analysis?",
        description: "An advanced astrological reading that explores the strengths, challenges, and karmic connections within an existing relationship.",
        points: [
          { title: "Relationship Dynamics", desc: "Understand emotional and mental alignment.", icon: Heart },
          { title: "Conflict Resolution", desc: "Astrological reasons for disagreements.", icon: Shield },
          { title: "Future Together", desc: "Predictions for joint wealth and family.", icon: Target }
        ],
        image: "https://vibe.filesafe.space/1782888190245745251/attachments/09570eb6-ddf9-458a-8481-aef851b11652.png"
      }}
      benefits={[
        { title: "Better Understanding", desc: "Know your partner's core nature.", icon: Users },
        { title: "Improve Communication", desc: "Bridge astrological gaps.", icon: Zap },
        { title: "Strengthen Bond", desc: "Remedies to enhance love.", icon: Heart },
        { title: "Joint Prosperity", desc: "Align goals for mutual success.", icon: Star }
      ]}
      faqs={[
        { q: "What details do I need to provide?", a: "Exact date, time, and place of birth for both partners." },
        { q: "Is this only for married couples?", a: "No, it is highly beneficial for any committed relationship." }
      ]}
      calculatorForm={<CalculatorForm type="love" title="Free Love Calculator" />}
    />
  );
};

export default CoupleKundliAnalysis;
