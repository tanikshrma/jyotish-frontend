import { useParams } from "react-router-dom";
import AdLanding from "@/components/AdLanding";
import ReportLanding from "@/components/ReportLanding";
import { LANDING_CONFIGS } from "./landingConfig";
import { REPORT_LANDING_CONFIGS } from "./reportLandingConfig";
import NotFound from "@/pages/NotFound";

/**
 * Standalone ad landing pages, one per campaign topic, served at /lp/:topic.
 * They render without the site header/footer so they work as focused,
 * distraction-free ad destinations — and the whole build can be deployed to a
 * dedicated subdomain (career/vastu/marriage.jyotishnow.com) whose root rewrites
 * to the matching /lp/:topic route.
 *
 * Two kinds share the namespace:
 *  - report landers (premium-kundli, complete-kundli) sell a PDF and take the
 *    purchase on the page itself;
 *  - consultation landers (career, vastu, marriage) sell a booked call.
 * Report slugs are checked first; the two sets never overlap.
 */
export default function LandingRoute() {
  const { topic = "" } = useParams();

  const report = REPORT_LANDING_CONFIGS[topic];
  if (report) return <ReportLanding config={report} />;

  const config = LANDING_CONFIGS[topic];
  if (!config) return <NotFound />;
  return <AdLanding config={config} />;
}
