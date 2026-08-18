/**
 * Canonical price list, shared by the browser and the order endpoint.
 *
 * This is the single source of truth: the page renders prices from here and
 * /api/create-order charges from here. The browser sends a service + variant
 * key, never an amount, so a tampered request cannot change what is charged.
 *
 * Contains no secrets — safe to bundle into the client.
 */

export type ServiceId =
  | "consultation-call"
  | "couple-consultation"
  | "face-to-face"
  | "baby-muhurat"
  | "matchmaking-consultation"
  | "gemstone-analysis"
  | "career-guidance"
  | "vastu-consultancy"
  | "annual-horoscope"
  | "lalkitab-consultation"
  | "complete-horoscope"
  | "kundli-pdf";

export type Service = {
  label: string;
  /** Variant key -> price in whole rupees. "default" for single-price services. */
  variants: Record<string, number>;
};

export const SERVICES: Record<ServiceId, Service> = {
  "kundli-pdf": {
    label: "Full Kundli PDF Report Download",
    variants: {
      default: 299,
      "report-only": 299,
      "report-consultation": 1100,
    },
  },
  "consultation-call": {
    label: "Personal Consultation Call",
    variants: {
      "30 Min|Audio": 2599,
      "30 Min|Video": 2999,
      "1 Hour|Audio": 4599,
      "1 Hour|Video": 4999,
      default: 2999,
    },
  },
  "couple-consultation": {
    label: "Couple Consultation",
    variants: {
      "30 Min|Audio": 4599,
      "30 Min|Video": 4999,
      "1 Hour|Audio": 7599,
      "1 Hour|Video": 7999,
      default: 4999,
    },
  },
  "face-to-face": {
    label: "Face to Face Consultation",
    variants: { default: 21000 },
  },
  "baby-muhurat": {
    label: "Baby Birth Muhurat",
    variants: { default: 11000 },
  },
  "matchmaking-consultation": {
    label: "Matchmaking Consultation",
    variants: { default: 2999 },
  },
  "gemstone-analysis": {
    label: "Gemstone Analysis",
    variants: { default: 2999 },
  },
  "career-guidance": {
    label: "Career Guidance Consultation",
    variants: { default: 3999 },
  },
  "vastu-consultancy": {
    label: "Vastu Consultancy",
    variants: {
      "Residential": 11000,
      "Commercial": 21000,
      default: 11000,
    },
  },
  "annual-horoscope": {
    label: "Annual Horoscope Analysis",
    variants: {
      "Audio Call": 4599,
      "Video Call": 4999,
      default: 4999,
    },
  },
  "lalkitab-consultation": {
    label: "Lal Kitab Consultation",
    variants: { default: 3999 },
  },
  "complete-horoscope": {
    label: "Complete Horoscope Analysis",
    variants: {
      "Audio Call": 4599,
      "Video Call": 4999,
      default: 4999,
    },
  },
};

export const DEFAULT_VARIANT = "default";

/** Returns the price in rupees, or null when the service/variant is unknown. */
export const getPriceInRupees = (
  service: string,
  variant: string = DEFAULT_VARIANT,
): number | null => {
  const entry = SERVICES[service as ServiceId];
  if (!entry) return null;
  const price = entry.variants[variant];
  return typeof price === "number" ? price : null;
};

export const getServiceLabel = (service: string): string | null =>
  SERVICES[service as ServiceId]?.label ?? null;

export const formatINR = (rupees: number) =>
  `₹${rupees.toLocaleString("en-IN")}`;
