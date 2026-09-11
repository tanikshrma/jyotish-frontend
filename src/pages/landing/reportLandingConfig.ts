import {
  BookOpen, Compass, Sparkles, Gem, ShieldCheck, Clock3, CalendarRange,
  HeartHandshake, Briefcase, Activity, Coins, Map, ScrollText, Star,
  type LucideIcon,
} from "lucide-react";
import { getPriceInRupees, getKundliPdfTier } from "../../../shared/pricing";

/**
 * Standalone, single-offer ad landing pages for the two paid Kundli PDF
 * reports — Premium (₹299) and the Complete Bundle (₹499).
 *
 * These are deliberately NOT the consultation landers in `landingConfig.tsx`:
 * those sell a booked call and route into Prospect IQ's calendar, whereas these
 * sell a downloadable product and go birth-details → Razorpay → PDF in one
 * page, with no header, footer or nav to leak traffic.
 *
 * Price and tier metadata are read from shared/pricing.ts rather than retyped,
 * so a price change there flows through to the page and to what is charged.
 */

export type ReportSection = { icon: LucideIcon; title: string; desc: string };
export type ReportFaq = { q: string; a: string };
export type ReportProof = { quote: string; name: string; place: string };

export type ReportLandingConfig = {
  slug: string;
  /** Pricing variant in SERVICES["kundli-pdf"] — also what gets charged. */
  variant: string;
  /** Display name, pulled from the tier so it always matches the PDF sent. */
  name: string;
  price: number;
  /** Struck-through anchor price. Marketing only — never charged. */
  compareAt: number;
  pages: string;
  /** How many separate PDFs land in their inbox. */
  pdfCount: number;
  /** Palette. `ink` is the hero ground, `gold` the accent on top of it. */
  theme: { ink: string; inkSoft: string; gold: string; glow: string };
  eyebrow: string;
  h1a: string;
  h1b: string;
  sub: string;
  /** Three short proof chips directly under the headline. */
  heroChips: string[];
  formTitle: string;
  formSub: string;
  cta: string;
  /** The "what's inside" grid — the heart of the page. */
  sectionsTitle: string;
  sectionsSub: string;
  sections: ReportSection[];
  /** Plain-language outcomes, shown as a checklist. */
  answers: string[];
  faqs: ReportFaq[];
  proof: ReportProof[];
  seoTitle: string;
  seoDesc: string;
};

export const REPORT_CONTACT = {
  phone: "+91 70155 44187",
  phoneDigits: "917015544187",
  email: "myjyotishnow@gmail.com",
};

export const LOGO =
  "https://vibe.filesafe.space/1782888190245745251/attachments/eeb5c854-e071-4e16-b563-90e6375205fb.png";

/**
 * PLACEHOLDER SOCIAL PROOF — replace with real, attributable customer reviews
 * before spending on traffic. Kept here (not inline) so they are trivial to
 * swap out in one place.
 */
const PREMIUM_PROOF: ReportProof[] = [
  {
    quote:
      "I've bought kundli PDFs before and they were four pages of generic text. This one actually read like someone had looked at my chart — the dasha timeline alone explained the last three years of my life.",
    name: "Ankita R.",
    place: "Delhi",
  },
  {
    quote:
      "Got it in my email within a few minutes of paying. The house-by-house section and the remedies were the parts I keep going back to.",
    name: "Vikram T.",
    place: "Pune",
  },
  {
    quote:
      "Sixty pages, properly laid out, and in plain language. Worth far more than what I paid for it.",
    name: "Shalini M.",
    place: "Bengaluru",
  },
];

const COMPLETE_PROOF: ReportProof[] = [
  {
    quote:
      "The predictions report is what sold me. Knowing which years are strong for career and which to stay patient through changed how I'm planning the next five years.",
    name: "Rohit S.",
    place: "Gurugram",
  },
  {
    quote:
      "Both PDFs arrived together in one email. Around a hundred pages between them — I printed the predictions one and keep it with me.",
    name: "Meenakshi P.",
    place: "Chennai",
  },
  {
    quote:
      "I bought the ₹299 one for my brother and the bundle for myself. The Life Predictions half is genuinely the better of the two.",
    name: "Arjun K.",
    place: "Mumbai",
  },
];

const PREMIUM_SECTIONS: ReportSection[] = [
  {
    icon: Compass,
    title: "Lagna, Navamsa & divisional charts",
    desc: "Your D1 and D9 charts plus the divisional set from D1 to D60, each drawn and labelled.",
  },
  {
    icon: Star,
    title: "Every planet, placed precisely",
    desc: "Exact positions with degrees, the nakshatra and pada each planet falls in, and its dignity.",
  },
  {
    icon: BookOpen,
    title: "House-by-house analysis",
    desc: "All twelve bhavas read individually — what each governs in your chart and who rules it.",
  },
  {
    icon: Activity,
    title: "Planetary strength & aspects",
    desc: "Shad Bala scoring shows which planets can actually deliver, and which aspects fall where.",
  },
  {
    icon: ScrollText,
    title: "Ashtakvarga scoring",
    desc: "Full Ashtakvarga and Binnashtakvarga tables — the point system behind every prediction.",
  },
  {
    icon: CalendarRange,
    title: "Vimshottari Dasha timeline",
    desc: "Your Mahadasha and Antardasha periods mapped out, so you can see what governs which years.",
  },
  {
    icon: Sparkles,
    title: "The yogas in your chart",
    desc: "Every raja yoga, dhana yoga and combination present — and what each one actually does.",
  },
  {
    icon: ShieldCheck,
    title: "Complete dosha analysis",
    desc: "Mangal, Manglik, Kaal Sarp and Pitra dosha checked properly, with severity, not just yes or no.",
  },
  {
    icon: Clock3,
    title: "Sade Sati status",
    desc: "Where you stand in Shani's cycle right now, with the full phase-by-phase table.",
  },
  {
    icon: Map,
    title: "KP & Jaimini layers",
    desc: "KP houses and planets, Jaimini karakas and Arudha padas — the detail most reports skip.",
  },
  {
    icon: Gem,
    title: "Gemstone & Rudraksha",
    desc: "Which stones and mukhi suit your chart specifically — not a generic list by sun sign.",
  },
  {
    icon: HeartHandshake,
    title: "Remedies you can actually do",
    desc: "Practical, prescribed remedies matched to the weak points the chart actually shows.",
  },
];

const PREDICTION_SECTIONS: ReportSection[] = [
  {
    icon: CalendarRange,
    title: "Dasha-wise life predictions",
    desc: "What each planetary period brings, read forward — the spine of the entire predictions report.",
  },
  {
    icon: Briefcase,
    title: "Career & profession",
    desc: "The direction your chart supports, and the windows where a move or a launch is favoured.",
  },
  {
    icon: Coins,
    title: "Wealth & finances",
    desc: "How money tends to arrive and leave in your chart, and which periods build versus drain.",
  },
  {
    icon: HeartHandshake,
    title: "Marriage & relationships",
    desc: "Timing, compatibility indicators and the patterns your seventh house keeps repeating.",
  },
  {
    icon: Activity,
    title: "Health & vitality",
    desc: "The areas your chart flags as sensitive, and the stretches worth being careful through.",
  },
  {
    icon: Clock3,
    title: "Timing of key events",
    desc: "The specific years and periods where the chart concentrates its major turning points.",
  },
];

const SHARED_FAQS: ReportFaq[] = [
  {
    q: "How soon do I get the report?",
    a: "Immediately. The moment your payment goes through, the report is generated from your birth details, opens in your browser, downloads to your device, and is emailed to you as an attachment. It usually takes under two minutes.",
  },
  {
    q: "What if I don't know my exact birth time?",
    a: "Use the closest time you have — a birth certificate, hospital record or what family remembers. Even fifteen minutes of accuracy is enough for the chart to be meaningful. An exact time only matters for the finest divisional readings.",
  },
  {
    q: "Is this generated by a computer or read by a person?",
    a: "The report is computed from your actual birth chart using classical Vedic calculations — the same ones an astrologer works from. It is not a template with your name inserted. Two different birth times produce two genuinely different reports.",
  },
  {
    q: "Do the download links expire?",
    a: "No. Your report is hosted permanently and the link keeps working, so you can come back to it years later. It is also in your email as an attachment.",
  },
  {
    q: "Is my payment secure?",
    a: "Yes. Payments run through Razorpay, India's most widely used gateway. We never see or store your card or UPI details.",
  },
  {
    q: "Can I get a consultation as well?",
    a: "Yes. Many people read the report first and then book a call to go through it. You can reach us on WhatsApp or call the number at the top of this page.",
  },
];

/** Small helper so price/name/pages never drift from shared/pricing.ts. */
const tierMeta = (variant: string) => {
  const tier = getKundliPdfTier(variant);
  return {
    name: tier?.name ?? "Kundli Report",
    pages: tier?.pages ?? "",
    price: getPriceInRupees("kundli-pdf", variant) ?? 0,
  };
};

const premium = tierMeta("premium");
const complete = tierMeta("complete");

export const REPORT_LANDING_CONFIGS: Record<string, ReportLandingConfig> = {
  "premium-kundli": {
    slug: "premium-kundli",
    variant: "premium",
    name: premium.name,
    price: premium.price,
    compareAt: 999,
    pages: premium.pages,
    pdfCount: 1,
    theme: {
      ink: "#3D0404",
      inkSoft: "#5A0606",
      gold: "#F5C27A",
      glow: "rgba(245,194,122,0.16)",
    },
    eyebrow: "Premium Kundli Report",
    h1a: "Your entire birth chart,",
    h1b: "read properly. 60 pages.",
    sub: "Not a four-page summary with your name pasted on top. This is your complete Vedic horoscope — every planet, every house, every dasha period and every yoga in your chart — computed from your exact birth details and delivered as a PDF in under two minutes.",
    heroChips: ["~60 pages", "Delivered in minutes", "Yours forever"],
    formTitle: "Get your Premium Kundli",
    formSub: "Enter your birth details exactly as they are. Everything is computed from them.",
    cta: "Get My Premium Kundli",
    sectionsTitle: "What's actually inside",
    sectionsSub:
      "Twelve sections, each computed from your chart — this is the full list, not a sample of it.",
    sections: PREMIUM_SECTIONS,
    answers: [
      "Which planetary period you are living through right now — and what it is for",
      "The houses carrying your strength, and the ones quietly costing you",
      "Whether Mangal, Kaal Sarp or Pitra dosha is present, and how serious it really is",
      "Where you stand in Sade Sati, and when it lifts",
      "The gemstone and Rudraksha suited to your chart, not your sun sign",
      "Remedies matched to what your chart actually shows",
    ],
    faqs: SHARED_FAQS,
    proof: PREMIUM_PROOF,
    seoTitle: "Premium Kundli Report — 60-Page Vedic Horoscope PDF | JyotishNow",
    seoDesc:
      "Your complete Vedic birth chart as a ~60 page PDF: divisional charts, house-by-house analysis, Ashtakvarga, dasha timeline, doshas and personalised remedies. Delivered in minutes.",
  },

  "complete-kundli": {
    slug: "complete-kundli",
    variant: "complete",
    name: complete.name,
    price: complete.price,
    compareAt: 1499,
    pages: complete.pages,
    pdfCount: 2,
    theme: {
      ink: "#140B2E",
      inkSoft: "#241357",
      gold: "#F2C879",
      glow: "rgba(242,200,121,0.18)",
    },
    eyebrow: "Complete Bundle · Two Reports",
    h1a: "Your chart read in full —",
    h1b: "and your future mapped.",
    sub: "Two complete reports, delivered together. The full 60-page Premium Kundli that reads your chart as it stands, plus a dedicated Life Predictions report that reads it forward — career, wealth, marriage, health and the timing of what's coming.",
    heroChips: ["2 PDFs · ~100 pages", "Delivered together", "Yours forever"],
    formTitle: "Get both reports",
    formSub: "Enter your birth details exactly as they are. Both reports are built from them.",
    cta: "Get Both My Reports",
    sectionsTitle: "Two reports, delivered together",
    sectionsSub:
      "The Premium Kundli reads your chart as it is. Life Predictions reads it forward. You get both.",
    sections: PREDICTION_SECTIONS,
    answers: [
      "Which years ahead are built for growth — and which are for holding steady",
      "What your chart says about career direction, and when to make the move",
      "How and when marriage is indicated in your chart",
      "The financial periods that build wealth, and the ones that quietly drain it",
      "Everything in the Premium report — charts, dashas, doshas, Ashtakvarga, remedies",
      "The specific years your chart concentrates its turning points in",
    ],
    faqs: SHARED_FAQS,
    proof: COMPLETE_PROOF,
    seoTitle: "Complete Kundli Bundle — 100-Page Vedic Report + Life Predictions | JyotishNow",
    seoDesc:
      "Two reports together: the full ~60 page Premium Kundli plus a dedicated Life Predictions report covering career, wealth, marriage, health and event timing. ~100 pages, delivered in minutes.",
  },
};

/** The Premium report's own sections, reused on the bundle page. */
export const PREMIUM_SECTION_LIST = PREMIUM_SECTIONS;
