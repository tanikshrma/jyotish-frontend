import { useParams } from "react-router-dom";
import AdLanding from "@/components/AdLanding";
import { LANDING_CONFIGS } from "./landingConfig";
import NotFound from "@/pages/NotFound";

/**
 * Standalone ad landing pages, one per campaign topic, served at /lp/:topic.
 * They render without the site header/footer so they work as focused,
 * distraction-free ad destinations — and the whole build can be deployed to a
 * dedicated subdomain (career/vastu/marriage.jyotishnow.com) whose root rewrites
 * to the matching /lp/:topic route.
 */
export default function LandingRoute() {
  const { topic = "" } = useParams();
  const config = LANDING_CONFIGS[topic];
  if (!config) return <NotFound />;
  return <AdLanding config={config} />;
}
