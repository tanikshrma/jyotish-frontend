import { ReportTemplate } from "@/components/ReportTemplate";
import { CalculatorForm } from "@/components/CalculatorForm";
import { Target, Briefcase, TrendingUp, Shield, Zap, Star } from "lucide-react";

const CareerGuidance = () => {
  return (
    <ReportTemplate
      title="Career"
      highlightedTitle="Guidance"
      description="Unlock your professional potential. Discover the career paths most aligned with your astrological strengths and planetary dashas."
      heroBgImage="https://vibe.filesafe.space/1782888190245745251/attachments/3cc87c32-c314-46a6-852f-e7c110866a00.png"
      heroImage=""
      whatIsIt={{
        title: "What is",
        highlightedTitle: "Astrological Career Guidance?",
        description: "A specialized reading focusing on your 10th house, professional significators, and upcoming periods to guide your career choices.",
        points: [
          { title: "Ideal Professions", desc: "Careers suited to your birth chart.", icon: Briefcase },
          { title: "Job vs Business", desc: "Which path will bring more success?", icon: Target },
          { title: "Timing of Success", desc: "When to expect promotions or changes.", icon: TrendingUp }
        ],
        image: "https://vibe.filesafe.space/1782888190245745251/attachments/980b231e-044d-4123-bacd-c458b85aa907.png"
      }}
      benefits={[
        { title: "Clarity of Purpose", desc: "Find a fulfilling career path.", icon: Target },
        { title: "Strategic Moves", desc: "Know when to switch jobs.", icon: Zap },
        { title: "Overcome Obstacles", desc: "Remedies for workplace issues.", icon: Shield },
        { title: "Financial Growth", desc: "Maximize your earning potential.", icon: Star }
      ]}
      faqs={[
        { q: "What details do I need to provide?", a: "Your exact date, time, and place of birth." },
        { q: "Can it help if I am currently unemployed?", a: "Yes, it can identify the astrological reasons and suggest remedies and favorable timelines." }
      ]}
      calculatorForm={<CalculatorForm type="career" title="Career Guidance Report" />}
    />
  );
};

export default CareerGuidance;
