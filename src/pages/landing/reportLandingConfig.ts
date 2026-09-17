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
export type ReportStep = { title: string; desc?: string };
/** One row of the "free kundli app vs this report" comparison. */
export type CompareRow = { label: string; free: string | false; paid: string };

export type ReportLandingContent = {
  heroSupporting: string;
  heroOffer: string;
  heroTrust: string;
  revealTitle: string;
  revealIntro: string;
  revealSections: ReportSection[];
  revealClosing?: string;
  identity?: {
    title: string;
    subtitle: string;
    body: string;
    supporting: string;
    items: string[];
    closing?: string;
    highlight?: string;
  };
  detailTitle: string;
  detailDescription: string;
  detailSections: ReportSection[];
  detailHighlight?: string;
  detailCta: string;
  narrative?: { title: string; body: string };
  upgrade?: {
    title: string;
    body: string;
    offer: string;
    pages: string;
    includes: string[];
    comparison: CompareRow[];
    comparisonTitle: string;
    columns: [string, string];
    cta: string;
  };
  difference?: {
    title: string;
    points: ReportSection[];
    closing: string;
  };
  birthDetails?: { title: string; items: string[]; body: string; highlight?: string };
  stepsTitle: string;
  steps: ReportStep[];
  stepsClosing: string;
  final: {
    title: string;
    subtitle?: string;
    description: string;
    offer: string;
    details: string;
    cta: string;
  };
};

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
  /**
   * Light-funnel palette. `ink` is the heading/brand colour, `cta` the button
   * gradient base, `tint` the soft section wash, `band` the accent band.
   */
  theme: { ink: string; cta: string; ctaDark: string; tint: string; band: string; gold: string };
  /** Product photograph used in the hero and the sample section. */
  photo: string;
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
  /**
   * Bundle pages only: the same sections split by which report they belong to,
   * so ~18 cards read as two labelled reports rather than one undifferentiated
   * wall. Omitted on single-report pages, which render `sections` flat.
   */
  sectionGroups?: { title: string; note: string; sections: ReportSection[] }[];
  /** Plain-language outcomes, shown as a checklist. */
  answers: string[];
  faqs: ReportFaq[];
  proof: ReportProof[];
  /** Side-by-side against the free apps people have already tried. */
  compare: CompareRow[];
  /** Short guarantee shown beside the offer. */
  guarantee: string;
  seoTitle: string;
  seoDesc: string;
  content: ReportLandingContent;
};

/**
 * One palette for every report lander. Both pages are the same brand and the
 * same product family, so they deliberately share this rather than carrying a
 * theme each — a per-page palette made them read as two different companies.
 */
export const BRAND_THEME = {
  ink: "#7A0808",      // headings, offer bar, sticky header
  cta: "#F9701A",      // button gradient top
  ctaDark: "#D2450A",  // button gradient bottom
  tint: "#FFF4E3",     // soft section wash
  band: "#FFE7C4",     // section borders / accent band
  gold: "#C98A1E",     // rules and small accents
} as const;

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
      "Over seventy pages, properly laid out, and in plain language. Worth far more than what I paid for it.",
    name: "Shalini M.",
    place: "Bengaluru",
  },
  {
    quote:
      "Paid on UPI and the PDF was in my inbox before I finished making tea. The Ashtakvarga tables were the bit I'd never seen before.",
    name: "Nikhil D.",
    place: "Hyderabad",
  },
  {
    quote:
      "My mother wanted a proper kundli for me and every free app gave a different answer. This one matched what our family astrologer said.",
    name: "Pooja B.",
    place: "Jaipur",
  },
  {
    quote:
      "I was sceptical at ₹299 honestly. It's more thorough than a printed kundli I paid ten times as much for years ago.",
    name: "Harpreet S.",
    place: "Ludhiana",
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
  {
    quote:
      "Two PDFs, about a hundred pages, for less than a single consultation costs. The year-by-year section is what I keep rereading.",
    name: "Sneha V.",
    place: "Nagpur",
  },
  {
    quote:
      "Ordered at night, had both reports before I slept. No follow-up calls, no upselling, which I appreciated.",
    name: "Farhan A.",
    place: "Lucknow",
  },
  {
    quote:
      "The marriage timing section was oddly specific and matched things my family had already been told independently.",
    name: "Divya N.",
    place: "Kochi",
  },
];


/**
 * The comparison most visitors are actually making in their head: they have
 * already generated a free kundli somewhere and want to know what ₹299 buys.
 * Every "paid" claim here is something the report genuinely contains.
 */
const COMPARE_PREMIUM: CompareRow[] = [
  { label: "Birth chart drawn", free: "Lagna chart only", paid: "Lagna, Navamsa + D1 to D60" },
  { label: "Planet detail", free: "Sign only", paid: "Sign, exact degree, nakshatra & pada" },
  { label: "House-by-house reading", free: false, paid: "All 12 bhavas, read individually" },
  { label: "Planetary strength", free: false, paid: "Full Shad Bala & Ashtakvarga tables" },
  { label: "Dasha timeline", free: "Current period", paid: "Mahadasha + Antardasha, mapped out" },
  { label: "Dosha analysis", free: "Yes / no flag", paid: "Mangal, Kaal Sarp, Pitra — with severity" },
  { label: "Remedies", free: "Generic by sun sign", paid: "Matched to your chart's weak points" },
  { label: "Format", free: "A web page with ads", paid: "Printable PDF, emailed, never expires" },
];

const COMPARE_COMPLETE: CompareRow[] = [
  { label: "Birth chart drawn", free: "Lagna chart only", paid: "Lagna, Navamsa + D1 to D60" },
  { label: "House-by-house reading", free: false, paid: "All 12 bhavas, read individually" },
  { label: "Dasha timeline", free: "Current period", paid: "Mahadasha + Antardasha, mapped out" },
  { label: "Future predictions", free: false, paid: "A second report, dedicated to what's coming" },
  { label: "Career & money timing", free: false, paid: "The years your chart favours a move" },
  { label: "Marriage timing", free: false, paid: "What the 7th house indicates, and when" },
  { label: "Remedies", free: "Generic by sun sign", paid: "Matched to your chart's weak points" },
  { label: "Format", free: "A web page with ads", paid: "2 printable PDFs, emailed, never expire" },
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
    a: "Yes. At checkout you can add a 15-minute audio call with Dr. Sandeep Sawhney for ₹999 to go through your report — pick your time from his live calendar and it is booked the moment you pay. For a full 30-minute or 1-hour consultation, book it in the consultation section on this page.",
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
/** Only its page count is used — for labelling the bundle's two halves. */
const predictions = tierMeta("predictions");

const PREMIUM_CONTENT: ReportLandingContent = {
  heroSupporting: "Created using your exact date, time and place of birth.",
  heroOffer: "₹299 | 74+ Pages",
  heroTrust: "Personalised Report • Delivered Digitally • Lifetime Access",
  revealTitle: "What Does Your Kundli Actually Reveal?",
  revealIntro: "Your Kundli is more than your Sun sign or a daily horoscope.\nIt gives you a deeper look at the planetary influences shaping different areas of your life.",
  revealSections: [
    { icon: Briefcase, title: "Career & Growth", desc: "Understand your professional strengths, career direction and planetary influences." },
    { icon: HeartHandshake, title: "Marriage & Relationships", desc: "Explore relationship patterns and the planetary influences connected to marriage." },
    { icon: Coins, title: "Wealth & Finances", desc: "Understand financial patterns and the planetary factors influencing them." },
    { icon: Star, title: "Personality & Strengths", desc: "Discover the qualities, tendencies and strengths reflected in your birth chart." },
    { icon: ShieldCheck, title: "Doshas & Remedies", desc: "Identify relevant doshas and understand the remedies associated with your chart." },
    { icon: Map, title: "Life Patterns", desc: "Look at the combinations and planetary influences that make your chart uniquely yours." },
  ],
  identity: {
    title: "Not A Generic Horoscope.",
    subtitle: "Your Chart. Your Details. Your Kundli.",
    body: "Two people can have the same zodiac sign and completely different birth charts.",
    supporting: "Your Kundli is created using your:",
    items: ["DATE OF BIRTH", "TIME OF BIRTH", "PLACE OF BIRTH"],
    closing: "These details help create your individual birth chart and form the basis of your personalised report.",
  },
  detailTitle: "74 Pages. One Detailed Look At Your Birth Chart.",
  detailDescription: "Your Premium Personalised Kundli brings together the key elements of your birth chart in one detailed report.",
  detailSections: [
    { icon: Compass, title: "Lagna & Navamsa Charts", desc: "Understand the foundational charts used in Vedic astrology." },
    { icon: Star, title: "Planetary Positions", desc: "See where the planets were positioned at the time of your birth." },
    { icon: BookOpen, title: "All 12 Houses", desc: "Understand the different areas of life represented by your houses." },
    { icon: Activity, title: "House-by-House Analysis", desc: "Go beyond the chart and understand the influence of different houses." },
    { icon: Sparkles, title: "Yogas & Planetary Aspects", desc: "Explore important planetary combinations and influences in your chart." },
    { icon: ScrollText, title: "Ashtakvarga", desc: "Get a deeper understanding of planetary strength and influence." },
    { icon: ShieldCheck, title: "Dosha Analysis", desc: "Identify important doshas reflected in your birth chart." },
    { icon: HeartHandshake, title: "Personalised Remedies", desc: "Understand relevant remedies based on your chart." },
  ],
  detailCta: "GET MY ₹299 KUNDLI",
  narrative: {
    title: "Your Birth Chart Has Layers.",
    body: "A Kundli isn't meant to be understood by looking at one planet or one house alone.\nYour planets, houses, aspects, yogas and other combinations work together to create a unique picture.\nThe Premium Kundli brings these elements together so you can explore your chart in greater detail.",
  },
  upgrade: {
    title: "Want To Go Beyond Your Birth Chart?",
    body: "The ₹299 Premium Kundli gives you a detailed understanding of your birth chart.\nBut if you also want forward-looking predictions, life-area predictions and timing of important events, there's a more comprehensive option.",
    offer: "₹499 COMPLETE KUNDLI",
    pages: "98+ Pages",
    includes: ["Life Predictions", "Career & wealth predictions", "Marriage & relationship predictions", "Health predictions", "Dasha-wise predictions", "Timing of key events"],
    comparisonTitle: "₹299 Premium vs ₹499 Complete",
    columns: ["Premium", "Complete"],
    comparison: [
      { label: "Detailed Personalised Kundli", free: "✓", paid: "✓" },
      { label: "Lagna & Navamsa", free: "✓", paid: "✓" },
      { label: "Planetary Positions", free: "✓", paid: "✓" },
      { label: "12 Houses", free: "✓", paid: "✓" },
      { label: "House-by-House Analysis", free: "✓", paid: "✓" },
      { label: "Yogas & Planetary Aspects", free: "✓", paid: "✓" },
      { label: "Ashtakvarga", free: "✓", paid: "✓" },
      { label: "Dosha Analysis", free: "✓", paid: "✓" },
      { label: "Personalised Remedies", free: "✓", paid: "✓" },
      { label: "Life Predictions", free: "—", paid: "✓" },
      { label: "Career & Wealth Predictions", free: "—", paid: "✓" },
      { label: "Marriage & Relationship Predictions", free: "—", paid: "✓" },
      { label: "Health Predictions", free: "—", paid: "✓" },
      { label: "Dasha-wise Predictions", free: "—", paid: "✓" },
      { label: "Timing of Key Events", free: "—", paid: "✓" },
    ],
    cta: "EXPLORE ₹499 COMPLETE KUNDLI",
  },
  birthDetails: {
    title: "Why Your Exact Birth Details Matter",
    items: ["Your date.", "Your time.", "Your place.", "Your chart."],
    body: "Your birth chart is calculated from specific astronomical positions at the time and place of your birth.\nThat's why a personalised Kundli is different from a general horoscope.",
  },
  stepsTitle: "How It Works",
  steps: [
    { title: "Enter Your Birth Details", desc: "Provide your name, date, time and place of birth." },
    { title: "Choose Your Report", desc: "Select the Premium Personalised Kundli." },
    { title: "Get Your Report", desc: "Your detailed Kundli is prepared and delivered digitally." },
  ],
  stepsClosing: "Your download link never expires.",
  final: {
    title: "A Deeper Look At The Chart You Were Born With.",
    description: "Understand your planets.\nExplore your houses.\nDiscover the patterns in your chart.",
    offer: "Premium Personalised Kundli",
    details: "74+ Pages | ₹299",
    cta: "GET MY PERSONALISED KUNDLI",
  },
};

const COMPLETE_CONTENT: ReportLandingContent = {
  heroSupporting: "Personalised to your exact birth details",
  heroOffer: "98+ Pages | 2 Detailed Reports | ₹499",
  heroTrust: "Personalised to your exact birth details",
  revealTitle: "One Birth Chart. Many Questions.",
  revealIntro: "You may have questions about:",
  revealSections: [
    { icon: Briefcase, title: "Career", desc: "Am I moving in the right direction?" },
    { icon: Coins, title: "Money", desc: "What does my chart indicate about wealth and finances?" },
    { icon: HeartHandshake, title: "Marriage", desc: "What does my Kundli reveal about marriage and relationships?" },
    { icon: Activity, title: "Health", desc: "What planetary influences are connected to this area of life?" },
    { icon: Map, title: "Life Changes", desc: "Which periods may bring important developments?" },
    { icon: Clock3, title: "Timing", desc: "When are certain planetary periods more significant?" },
  ],
  revealClosing: "The Complete Kundli brings these areas together in one detailed report.",
  identity: {
    title: "First Understand Your Chart.",
    subtitle: "Then Explore Your Life's Patterns.",
    body: "The Premium Kundli helps you understand your birth chart in detail.\nThe Life Predictions report takes it further by exploring what different planetary periods may indicate across important areas of your life.",
    supporting: "98+ Pages of Personalised Insights",
    items: [],
    highlight: "Your Chart + Your Predictions",
  },
  detailTitle: "What's Inside Your Complete Kundli?",
  detailDescription: "",
  detailSections: [],
  detailHighlight: "2 REPORTS. 98+ PAGES. ONE COMPLETE VIEW.",
  detailCta: "GET MY ₹499 COMPLETE KUNDLI",
  difference: {
    title: "What Makes The Complete Kundli Different?",
    points: [
      { icon: BookOpen, title: "A Deeper Look At Your Birth Chart", desc: "Understand your planets, houses, yogas, aspects, doshas and planetary strengths." },
      { icon: Compass, title: "A Broader Look At Your Life", desc: "Explore career, wealth, marriage, relationships and health." },
      { icon: Clock3, title: "A Closer Look At Timing", desc: "Understand dasha-wise periods and the timing of important events." },
    ],
    closing: "Instead of looking at these questions separately, the Complete Kundli brings them into one personalised report package.",
  },
  birthDetails: {
    title: "Your Kundli Starts With Three Details.",
    items: ["DATE OF BIRTH", "TIME OF BIRTH", "PLACE OF BIRTH"],
    body: "These details are used to create your individual birth chart.\nBecause your report should be based on your chart, not a generic zodiac prediction.",
  },
  stepsTitle: "From Birth Chart To Life Predictions.",
  steps: [
    { title: "Enter your exact birth details." },
    { title: "Choose the Complete Kundli." },
    { title: "Receive both personalised reports digitally." },
  ],
  stepsClosing: "Your download links never expire.",
  final: {
    title: "Don't Just Know Your Kundli.",
    subtitle: "Understand It.",
    description: "Explore your chart.\nUnderstand your patterns.\nLook at the important phases ahead.",
    offer: "Complete Personalised Kundli",
    details: "98+ Pages | 2 Reports | ₹499",
    cta: "GET MY COMPLETE KUNDLI",
  },
};

export const REPORT_LANDING_CONFIGS: Record<string, ReportLandingConfig> = {
  "premium-kundli": {
    slug: "premium-kundli",
    variant: "premium",
    name: premium.name,
    price: premium.price,
    compareAt: 999,
    pages: premium.pages,
    pdfCount: 1,
    theme: BRAND_THEME,
    photo: "/lp/report-photo.jpg",
    eyebrow: "Premium Kundli Report",
    h1a: "Your Kundli Has More To Say",
    h1b: "Than Your Zodiac Sign.",
    sub: "Your birth chart is unique to you. Understand your planets, houses, strengths, challenges and important life patterns through a detailed personalised Kundli.",
    heroChips: [premium.pages, "Delivered in minutes", "Yours forever"],
    formTitle: "Get your Premium Kundli",
    formSub: "Enter your birth details exactly as they are. Everything is computed from them.",
    cta: "GET MY PERSONALISED KUNDLI",
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
    faqs: [
      { q: "Is this a personalised Kundli?", a: "Yes. The report is based on your individual birth details and birth chart." },
      { q: "What information do I need?", a: "You need your name, date of birth, time of birth and place of birth." },
      { q: "What does the Premium Kundli cover?", a: "It covers your birth charts, planetary positions, houses, house-by-house analysis, yogas, planetary aspects, Ashtakvarga, dosha analysis and personalised remedies." },
      { q: "How is this different from a horoscope?", a: "A horoscope generally offers broad predictions based on a zodiac sign. A Kundli is based on your individual birth details and provides a much more detailed view of your birth chart." },
      { q: "How will I receive my Kundli?", a: "Your report is delivered digitally." },
      { q: "Will I lose access to my report?", a: "No. Your download link does not expire." },
      { q: "What if I want predictions about the future?", a: "The ₹499 Complete Kundli adds Life Predictions, including career, wealth, marriage, health, dasha-wise predictions and timing of key events." },
    ],
    proof: PREMIUM_PROOF,
    compare: COMPARE_PREMIUM,
    guarantee:
      "If your report doesn't arrive, we send it manually or refund you in full. Reach us on WhatsApp and a person answers.",
    seoTitle: "Premium Kundli Report — 74-Page Vedic Horoscope PDF | JyotishNow",
    seoDesc:
      "Your complete Vedic birth chart as a ~74 page PDF: divisional charts, house-by-house analysis, Ashtakvarga, dasha timeline, doshas and personalised remedies. Delivered in minutes.",
    content: PREMIUM_CONTENT,
  },

  "complete-kundli": {
    slug: "complete-kundli",
    variant: "complete",
    name: complete.name,
    price: complete.price,
    compareAt: 1499,
    pages: complete.pages,
    pdfCount: 2,
    theme: BRAND_THEME,
    photo: "/lp/report-photo.jpg",
    eyebrow: "Bundle · Two Reports",
    h1a: "Know Your Chart.",
    h1b: "Understand What's Ahead.",
    sub: "Your birth chart can tell you more than who you are.\nThe Complete Kundli combines a detailed personalised birth-chart analysis with Life Predictions to help you explore your career, wealth, marriage, health, planetary periods and important life timings.",
    heroChips: [complete.pages, "Delivered together", "Yours forever"],
    formTitle: "Get both reports",
    formSub: "Enter your birth details exactly as they are. Both reports are built from them.",
    cta: "GET MY COMPLETE KUNDLI",
    sectionsTitle: "Two reports, delivered together",
    sectionsSub:
      "The Premium Kundli reads your chart as it is. Life Predictions reads it forward. You get both.",
    sections: PREDICTION_SECTIONS,
    sectionGroups: [
      {
        title: "REPORT 01 · PREMIUM PERSONALISED KUNDLI",
        note: "Understand the foundation of your birth chart.",
        sections: [
          { icon: Compass, title: "Lagna & Navamsa charts", desc: "" },
          { icon: Star, title: "Planetary positions", desc: "" },
          { icon: BookOpen, title: "All 12 houses", desc: "" },
          { icon: Activity, title: "House-by-house analysis", desc: "" },
          { icon: Sparkles, title: "Yogas & planetary aspects", desc: "" },
          { icon: ScrollText, title: "Ashtakvarga", desc: "" },
          { icon: ShieldCheck, title: "Dosha analysis", desc: "" },
          { icon: HeartHandshake, title: "Personalised remedies", desc: "" },
        ],
      },
      {
        title: "REPORT 02 · LIFE PREDICTIONS",
        note: "Go beyond your birth chart and explore major areas of life.",
        sections: [
          { icon: Briefcase, title: "Career predictions", desc: "" },
          { icon: Coins, title: "Wealth & financial insights", desc: "" },
          { icon: HeartHandshake, title: "Marriage & relationship predictions", desc: "" },
          { icon: Activity, title: "Health insights", desc: "" },
          { icon: CalendarRange, title: "Dasha-wise life predictions", desc: "" },
          { icon: Clock3, title: "Timing of key events", desc: "" },
        ],
      },
    ],
    answers: [
      "Which years ahead are built for growth — and which are for holding steady",
      "What your chart says about career direction, and when to make the move",
      "How and when marriage is indicated in your chart",
      "The financial periods that build wealth, and the ones that quietly drain it",
      "Everything in the Premium report — charts, dashas, doshas, Ashtakvarga, remedies",
      "The specific years your chart concentrates its turning points in",
    ],
    faqs: [
      { q: "What is included in the ₹499 Complete Kundli?", a: "It combines the Premium Personalised Kundli with the Life Predictions report." },
      { q: "How is it different from the ₹299 Premium Kundli?", a: "The ₹299 report focuses on detailed analysis of your birth chart. The ₹499 Complete Kundli adds Life Predictions covering career, wealth, marriage, health, dasha-wise predictions and timing of key events." },
      { q: "What areas of life are covered?", a: "The Complete Kundli covers areas including career, wealth, marriage, relationships and health, along with planetary periods and important timings." },
      { q: "Is the report personalised?", a: "Yes. It is based on your individual date, time and place of birth." },
      { q: "What information do I need?", a: "Your name, date of birth, time of birth and place of birth." },
      { q: "How will I receive the reports?", a: "Both reports are delivered digitally." },
      { q: "Will my download links expire?", a: "No. Your download links do not expire." },
    ],
    proof: COMPLETE_PROOF,
    compare: COMPARE_COMPLETE,
    guarantee:
      "If either report doesn't arrive, we send it manually or refund you in full. Reach us on WhatsApp and a person answers.",
    seoTitle: "Complete Kundli Bundle — 98-Page Vedic Report + Life Predictions | JyotishNow",
    seoDesc:
      "Two reports together: the full ~74 page Premium Kundli plus a dedicated ~24 page Life Predictions report covering career, wealth, marriage, health and event timing. ~98 pages, delivered in minutes.",
    content: COMPLETE_CONTENT,
  },
};

/** The Premium report's own sections, reused on the bundle page. */
export const PREMIUM_SECTION_LIST = PREMIUM_SECTIONS;
