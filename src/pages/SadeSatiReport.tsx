import { ReportTemplate } from "@/components/ReportTemplate";
import { CalculatorForm } from "@/components/CalculatorForm";
import { Shield, Target, Heart, Zap, Star, AlertCircle, Clock } from "lucide-react";

const SadeSatiReport = () => {
  return (
    <ReportTemplate
      title="Sade Sati"
      highlightedTitle="Report"
      description="Discover whether Saturn's seven-and-a-half year Sade Sati is active in your chart, which phase you are in, and the full lifetime timeline — calculated live from your birth details."
      heroImage="https://vibe.filesafe.space/1782888190245745251/attachments/49ebfb35-a0bd-43b2-815a-de767ea6a498.png"
      heroBgImage="https://vibe.filesafe.space/1782888190245745251/attachments/47f81405-bf4d-4943-8023-91bad5d11cf3.png"
      whatIsIt={{
        title: "What is",
        highlightedTitle: "Sade Sati?",
        description: "Sade Sati is the seven-and-a-half year period when Saturn transits the 12th, 1st and 2nd signs from your natal Moon. It unfolds in three phases (Rising, Peak and Setting), each bringing distinct lessons around discipline, patience and karmic growth.",
        points: [
          { title: "Current Status", desc: "Whether Sade Sati is active right now, and which phase.", icon: Clock },
          { title: "Lifetime Timeline", desc: "Every Sade Sati period across your life, with dates.", icon: Target },
          { title: "Guidance & Remedies", desc: "How to navigate each phase with Vedic remedies.", icon: Shield }
        ],
        image: "https://vibe.filesafe.space/1782888190245745251/attachments/393ebe2e-439e-4c0a-89cf-eec8b6b0b74e.webp"
      }}
      benefits={[
        { title: "Clarity", desc: "Know exactly where you stand with Saturn.", icon: Star },
        { title: "Preparedness", desc: "See challenging periods before they arrive.", icon: AlertCircle },
        { title: "Peace of Mind", desc: "Understand the purpose behind the pressure.", icon: Heart },
        { title: "Remedies", desc: "Practical steps to ease Saturn's effects.", icon: Zap }
      ]}
      faqs={[
        { q: "What details do I need to provide?", a: "Your exact date, time, and place of birth — Sade Sati is calculated from your natal Moon sign." },
        { q: "Does everyone go through Sade Sati?", a: "Yes. Saturn transits every sign, so Sade Sati recurs roughly every 27–30 years. This report shows your personal timeline." }
      ]}
      calculatorForm={<CalculatorForm type="sadesati" title="Free Sade Sati Checker" />}
    />
  );
};

export default SadeSatiReport;
