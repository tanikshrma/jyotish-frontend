import { ReportTemplate } from "@/components/ReportTemplate";
import { CalculatorForm } from "@/components/CalculatorForm";
import { Shield, Target, Heart, Zap, Star, AlertCircle } from "lucide-react";

const KalSarpDoshaReport = () => {
  return (
    <ReportTemplate
      title="Kal Sarp & Manglik"
      highlightedTitle="Dosha Report"
      description="Understand the impact of major astrological doshas in your chart and discover powerful remedies to mitigate their effects."
      heroImage="https://vibe.filesafe.space/1782888190245745251/attachments/49ebfb35-a0bd-43b2-815a-de767ea6a498.png"
      heroBgImage="https://vibe.filesafe.space/1782888190245745251/attachments/47f81405-bf4d-4943-8023-91bad5d11cf3.png"
      whatIsIt={{
        title: "What is the",
        highlightedTitle: "Dosha Report?",
        description: "An in-depth analysis of Kal Sarp Dosha, Manglik Dosha, and other significant planetary afflictions in your birth chart.",
        points: [
          { title: "Dosha Identification", desc: "Clear explanation of presence and severity.", icon: AlertCircle },
          { title: "Life Impact", desc: "How it affects your marriage and career.", icon: Target },
          { title: "Effective Remedies", desc: "Vedic solutions and rituals.", icon: Shield }
        ],
        image: "https://vibe.filesafe.space/1782888190245745251/attachments/393ebe2e-439e-4c0a-89cf-eec8b6b0b74e.webp"
      }}
      benefits={[
        { title: "Clarity", desc: "Understand the root cause of delays.", icon: Star },
        { title: "Peace of Mind", desc: "Alleviate fears and anxieties.", icon: Heart },
        { title: "Custom Remedies", desc: "Specific pujas and gemstone advice.", icon: Zap },
        { title: "Protection", desc: "Safeguard your future.", icon: Shield }
      ]}
      faqs={[
        { q: "What details do I need to provide?", a: "Your exact date, time, and place of birth." },
        { q: "Are the remedies difficult to perform?", a: "We provide practical, easy-to-follow remedies suitable for modern lifestyles." }
      ]}
      calculatorForm={<CalculatorForm type="kaalsarp" title="Free Kaal Sarp & Manglik Dosha Checker" />}
    />
  );
};

export default KalSarpDoshaReport;
