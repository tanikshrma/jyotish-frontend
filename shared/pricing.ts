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
  | "kundli-pdf"
  | "matchmaking-pdf";

export type Service = {
  label: string;
  /** Variant key -> price in whole rupees. "default" for single-price services. */
  variants: Record<string, number>;
};

export const SERVICES: Record<ServiceId, Service> = {
  "matchmaking-pdf": {
    label: "Official Kundli Matching PDF Report",
    // Single Ashtakoot report (~23 pages) from VedicAstro's matching-queue.
    variants: { default: 299 },
  },
  "kundli-pdf": {
    label: "Full Kundli PDF Report Download",
    variants: {
      // Five selectable report tiers (see KUNDLI_PDF_TIERS below).
      essential: 99,
      detailed: 199,
      premium: 299,
      predictions: 349,
      complete: 499,
      // Back-compat with the old single-price flow.
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

/**
 * The five selectable Kundli PDF report tiers, each mapping to one (or more)
 * VedicAstro `pdf_type` reports. This is the single source of truth shared by
 * the browser (renders the options + prices) and the server (`/api/kundli-pdf`
 * binds the requested report to the tier that was actually paid for, so a
 * cheaper purchase can't unlock a pricier report).
 */
export type KundliPdfType = "small" | "medium" | "large" | "prediction";

export type KundliPdfTier = {
  /** Pricing variant key — must exist in SERVICES["kundli-pdf"].variants. */
  variant: string;
  name: string;
  tagline: string;
  /** One or more VedicAstro reports generated + emailed for this tier. */
  pdfTypes: KundliPdfType[];
  pages: string;
  features: string[];
  badge?: string;
};

export const KUNDLI_PDF_TIERS: KundliPdfTier[] = [
  {
    variant: "essential",
    name: "Essential Kundli",
    tagline: "The core birth chart, beautifully presented.",
    pdfTypes: ["small"],
    pages: "~15 pages",
    features: [
      "Lagna & Navamsa charts",
      "Planetary positions",
      "Basic dosha check",
    ],
  },
  {
    variant: "detailed",
    name: "Detailed Kundli",
    tagline: "A fuller reading with dashas and yogas.",
    pdfTypes: ["medium"],
    pages: "~30 pages",
    features: [
      "Everything in Essential",
      "Vimshottari Mahadasha timeline",
      "Yogas & planetary aspects",
    ],
  },
  {
    variant: "premium",
    name: "Premium Kundli",
    tagline: "Our most popular full lifetime report.",
    pdfTypes: ["large"],
    pages: "~60 pages",
    badge: "Most popular",
    features: [
      "Everything in Detailed",
      "House-by-house analysis",
      "Ashtakvarga & remedies",
    ],
  },
  {
    variant: "predictions",
    name: "Life Predictions",
    tagline: "Forward-looking predictions across life areas.",
    pdfTypes: ["prediction"],
    pages: "~40 pages",
    features: [
      "Career, wealth, marriage & health",
      "Dasha-wise life predictions",
      "Timing of key events",
    ],
  },
  {
    variant: "complete",
    name: "Complete Bundle",
    tagline: "Premium report + Life Predictions together.",
    pdfTypes: ["large", "prediction"],
    pages: "2 PDFs · ~100 pages",
    badge: "Best value",
    features: [
      "Premium Kundli (full report)",
      "Life Predictions report",
      "Both delivered & emailed together",
    ],
  },
];

export const getKundliPdfTier = (variant: string): KundliPdfTier | null =>
  KUNDLI_PDF_TIERS.find((t) => t.variant === variant) ?? null;

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
