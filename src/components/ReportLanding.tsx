import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check, X, Star, Phone, ShieldCheck, Clock3, Users2, Globe, ArrowRight,
  FileText, Mail, CreditCard, Download, MessageCircle, Zap, BadgeCheck,
  Lock, RefreshCw, ZoomIn,
} from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ReportPurchaseForm } from "@/components/ReportPurchaseForm";
import { ReportPage } from "@/components/ReportMockup";
import {
  REPORT_CONTACT, LOGO, PREMIUM_SECTION_LIST, type ReportLandingConfig,
} from "@/pages/landing/reportLandingConfig";
import { formatINR } from "../../shared/pricing";

/* ------------------------------------------------------------ countdown */

/**
 * Today's offer, ending at local midnight.
 *
 * Deliberately tied to a real clock rather than a per-visit timer that resets
 * on refresh: it only stays honest if the price genuinely changes when the day
 * does. Drop this bar rather than fake it.
 */
function useMidnightCountdown() {
  const [left, setLeft] = useState(() => msToMidnight());
  useEffect(() => {
    const t = setInterval(() => setLeft(msToMidnight()), 1000);
    return () => clearInterval(t);
  }, []);
  const total = Math.max(0, Math.floor(left / 1000));
  return {
    h: String(Math.floor(total / 3600)).padStart(2, "0"),
    m: String(Math.floor((total % 3600) / 60)).padStart(2, "0"),
    s: String(total % 60).padStart(2, "0"),
  };
}
function msToMidnight() {
  const now = new Date();
  const mid = new Date(now);
  mid.setHours(24, 0, 0, 0);
  return mid.getTime() - now.getTime();
}

/* --------------------------------------------------------------- bits */

const Stars = ({ n = 5, className = "" }: { n?: number; className?: string }) => (
  <span className={`inline-flex text-[#F5A524] ${className}`} aria-label={`${n} out of 5`}>
    {Array.from({ length: n }).map((_, i) => (
      <Star key={i} className="h-[15px] w-[15px] fill-current" />
    ))}
  </span>
);

/** Initials chip used in the review wall instead of invented photographs. */
function Avatar({ name, color }: { name: string; color: string }) {
  const initials = name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <span
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[13px] font-bold"
      style={{ background: `${color}1a`, color }}
    >
      {initials}
    </span>
  );
}

const STATS = [
  { icon: Clock3, n: "25+", l: "Years of practice" },
  { icon: Users2, n: "1L+", l: "Consultations" },
  { icon: Star, n: "4.9★", l: "Client rating" },
  { icon: Globe, n: "15+", l: "Countries served" },
];

const STEPS = [
  { icon: FileText, t: "Enter your birth details", d: "Name, date, time and place of birth. That's all the chart needs." },
  { icon: CreditCard, t: "Pay by UPI or card", d: "One payment through Razorpay. No subscription, nothing recurring." },
  { icon: Mail, t: "Report lands in minutes", d: "It opens, downloads and arrives in your inbox — usually under two minutes." },
];

/** The three spreads shown as samples — genuinely different pages, not one repeated. */
const SAMPLE_PAGES = [
  { page: "chart", label: "Charts & planetary positions" },
  { page: "houses", label: "House-by-house analysis" },
  { page: "dasha", label: "Dasha timeline & Ashtakvarga" },
] as const;

/* One rhythm and one type scale for every band, rather than the same clamp()
   and padding values retyped at each section. */
const SECTION_PAD = "py-14 sm:py-20";
const H2_CLASS =
  "text-center font-serif font-extrabold leading-tight text-[clamp(1.65rem,4vw,2.4rem)]";
const SUB_CLASS =
  "mx-auto mt-3 max-w-2xl text-center text-[15px] leading-relaxed text-[#5B504A]";
/** Keyboard focus ring for the hand-rolled (non-<Button>) CTAs. */
const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7A0808]";

/* --------------------------------------------------------------- page */

export default function ReportLanding({ config }: { config: ReportLandingConfig }) {
  const c = config;
  const { ink, cta, ctaDark, tint, band, gold } = c.theme;
  const formRef = useRef<HTMLDivElement>(null);
  const [showBar, setShowBar] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { h, m, s } = useMidnightCountdown();

  const savePct = useMemo(
    () => Math.round(((c.compareAt - c.price) / c.compareAt) * 100),
    [c.compareAt, c.price],
  );
  const ctaGradient = `linear-gradient(180deg, ${cta} 0%, ${ctaDark} 100%)`;

  useEffect(() => {
    document.title = c.seoTitle;
    const meta = document.querySelector('meta[name="description"]');
    const prev = meta?.getAttribute("content") ?? null;
    meta?.setAttribute("content", c.seoDesc);
    return () => { if (meta && prev !== null) meta.setAttribute("content", prev); };
  }, [c.seoTitle, c.seoDesc]);

  useEffect(() => {
    const el = formRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setShowBar(!e.isIntersecting && e.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.body.classList.toggle("report-buybar-open", showBar);
    return () => document.body.classList.remove("report-buybar-open");
  }, [showBar]);

  /* Sticky header gains a shadow once the page moves. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const waHref = `https://wa.me/${REPORT_CONTACT.phoneDigits}?text=${encodeURIComponent(
    `Hi, I have a question about the ${c.name} (${formatINR(c.price)}).`,
  )}`;

  /**
   * The bundle carries both reports' sections. Grouped when the config says how
   * to split them, so the page shows "Life Predictions" and "Premium Kundli"
   * rather than one 18-card wall.
   */
  const isBundle = c.variant === "complete";
  const sectionGroups = c.sectionGroups ?? [
    { title: "", note: "", sections: isBundle ? [...c.sections, ...PREMIUM_SECTION_LIST] : c.sections },
  ];
  const totalSections = sectionGroups.reduce((n, g) => n + g.sections.length, 0);
  /** Phones get the first few of each group; the rest is one tap away. */
  const MOBILE_PER_GROUP = 4;
  const [showAllSections, setShowAllSections] = useState(false);
  const hiddenOnMobile = sectionGroups.reduce(
    (n, g) => n + Math.max(0, g.sections.length - MOBILE_PER_GROUP),
    0,
  );
  const [zoom, setZoom] = useState<(typeof SAMPLE_PAGES)[number] | null>(null);

  const BigCta = ({ label, className = "" }: { label: string; className?: string }) => (
    <button
      onClick={scrollToForm}
      className={`group inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-[16px] font-extrabold text-white shadow-lg transition-transform hover:scale-[1.015] active:scale-[0.99] sm:text-[17px] ${FOCUS_RING} ${className}`}
      style={{ background: ctaGradient, boxShadow: `0 12px 28px -10px ${cta}` }}
    >
      {label}
      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
    </button>
  );

  return (
        /* overflow-x-CLIP, not hidden: `hidden` makes this a scroll container and
       silently breaks `position: sticky` on the header. `clip` contains
       overflow without that side effect. */
    <div className="min-h-screen overflow-x-clip bg-white font-sans text-[#2A2320]">
      {/* ------------------------------------------------ urgency bar */}
      <div
        className="px-3 py-2 text-center text-[12px] font-semibold text-white sm:text-[13px]"
        style={{ background: `linear-gradient(rgba(0,0,0,.42), rgba(0,0,0,.42)), ${ink}` }}
      >
        <span className="opacity-90">Today's price {formatINR(c.price)} — </span>
        <span style={{ color: "#FFD27A" }}>{savePct}% off</span>
        <span className="opacity-90"> · ends in </span>
        <span className="tabular-nums font-bold" style={{ color: "#FFD27A" }}>{h}:{m}:{s}</span>
      </div>

      {/* ---------------------------------------------------- header */}
      <header
        className="sticky top-0 z-40 transition-shadow duration-300"
        style={{
          background: ink,
          borderBottom: `1px solid ${gold}59`,
          boxShadow: scrolled ? "0 10px 26px -14px rgba(0,0,0,.65)" : "none",
        }}
      >
        <div className="mx-auto flex w-[92%] max-w-6xl items-center justify-between gap-3 py-2.5">
          <img src={LOGO} alt="JyotishNow" className="h-9 w-auto object-contain sm:h-11" />
          <div className="flex items-center gap-4">
            <a
              href={`tel:${REPORT_CONTACT.phoneDigits}`}
              className="hidden items-center gap-2 text-[13.5px] font-bold text-white transition-opacity hover:opacity-85 sm:inline-flex"
            >
              <Phone className="h-4 w-4" style={{ color: gold }} /> {REPORT_CONTACT.phone}
            </a>
            <button
              onClick={scrollToForm}
              className={`rounded-lg px-4 py-2.5 text-[13px] font-extrabold text-white shadow-md transition-transform hover:scale-[1.03] sm:px-5 sm:text-[14px] ${FOCUS_RING} focus-visible:ring-offset-[#7A0808]`}
              style={{ background: ctaGradient }}
            >
              Get it · {formatINR(c.price)}
            </button>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------ hero */}
      <section className="relative" style={{ background: `linear-gradient(180deg, ${tint} 0%, #FFFFFF 100%)` }}>
        {/* Three grid children, explicitly placed: on phones they stack as
            headline → form → proof, so the price and the first field are
            reachable without scrolling past a paragraph and a photo. On desktop
            the two pitch blocks stack in column 1 and the form rides column 2. */}
        <div className="mx-auto grid w-[92%] max-w-6xl items-start gap-8 py-7 sm:py-12 lg:grid-cols-[1fr_520px] lg:gap-14 lg:py-14">
          {/* pitch — headline */}
          <div className="lg:col-start-1 lg:row-start-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wide text-white sm:px-3 sm:py-1.5 sm:text-[11.5px]"
                style={{ background: ink }}
              >
                {c.eyebrow}
              </span>
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-[#E4D9C4] bg-white px-2.5 py-1 text-[10.5px] font-bold sm:px-3 sm:py-1.5 sm:text-[12px]"
                style={{ color: ink }}
              >
                <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5" style={{ color: cta }} /> Delivered in minutes
              </span>
            </div>

            <h1
              className="mt-4 font-serif font-extrabold leading-[1.06] tracking-tight sm:mt-5"
              style={{ fontSize: "clamp(1.95rem,5.2vw,3.4rem)", color: ink, textWrap: "balance" }}
            >
              {c.h1a} <span style={{ color: cta }}>{c.h1b}</span>
            </h1>

            <p className="mt-3.5 max-w-xl text-[15px] leading-relaxed text-[#5B504A] sm:mt-4 sm:text-[17px]">
              {c.sub}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 sm:mt-5">
              <Stars />
              <span className="text-[14px] font-semibold" style={{ color: ink }}>4.9/5</span>
              <span className="text-[14px] text-[#6B605A]">from 3,200+ readers</span>
            </div>
          </div>

          {/* offer + form */}
          <div className="lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-24">
            <div ref={formRef} className="scroll-mt-24">
              <ReportPurchaseForm config={c} idPrefix="hero" />
            </div>

            {/* payment + trust rail */}
            <div className="mt-4 rounded-xl border border-[#EFE4D3] bg-white p-4">
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[12px] font-bold text-[#6B605A]">
                <span>UPI</span><span className="text-[#DCD2C4]">|</span>
                <span>Cards</span><span className="text-[#DCD2C4]">|</span>
                <span>Net Banking</span><span className="text-[#DCD2C4]">|</span>
                <span>Wallets</span>
              </div>
              <div className="mt-3 flex items-center justify-center gap-2 border-t border-[#F2E8D8] pt-3 text-[12px] text-[#6B605A]">
                <Lock className="h-3.5 w-3.5" style={{ color: ink }} /> Secured by Razorpay · we never see your card
              </div>
            </div>
          </div>

          {/* what it answers + the product shot — below the form on phones */}
          <div className="lg:col-start-1 lg:row-start-2">
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {c.answers.slice(0, 4).map((a) => (
                <li key={a} className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#16A34A]">
                    <Check className="h-3 w-3 text-white" strokeWidth={3.5} />
                  </span>
                  <span className="text-[14px] leading-snug text-[#3D3531]">{a}</span>
                </li>
              ))}
            </ul>

            <figure className="mt-6 overflow-hidden rounded-2xl border border-[#F0E4D2] shadow-sm">
              <img
                src={c.photo}
                alt={`A printed ${c.name} report`}
                fetchPriority="high"
                className="h-auto max-h-[230px] w-full object-cover sm:max-h-none"
              />
              <figcaption className="border-t border-[#F5EADB] bg-white px-4 py-2.5 text-center text-[12px] font-semibold text-[#6B605A]">
                {c.pages} · delivered as a PDF you can print, keep or forward
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------- trust strip */}
      <div className="border-y" style={{ background: tint, borderColor: band }}>
        <div className="mx-auto grid w-[92%] max-w-6xl grid-cols-2 gap-4 py-6 sm:grid-cols-4">
          {[
            { i: Zap, t: "Instant delivery", d: "Under 2 minutes" },
            { i: Mail, t: "Emailed to you", d: "PDF attachment" },
            { i: Download, t: "Never expires", d: "Yours forever" },
            { i: RefreshCw, t: "Full refund", d: "If it doesn't arrive" },
          ].map((x) => (
            <div key={x.t} className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white shadow-sm">
                <x.i className="h-[18px] w-[18px]" style={{ color: cta }} />
              </span>
              <div className="min-w-0">
                <div className="truncate text-[13.5px] font-extrabold" style={{ color: ink }}>{x.t}</div>
                <div className="truncate text-[12px] text-[#6B605A]">{x.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------ comparison */}
      <section className={`mx-auto w-[92%] max-w-4xl ${SECTION_PAD}`}>
        <h2 className={H2_CLASS} style={{ color: ink }}>
          You've already tried the free ones
        </h2>
        <p className={SUB_CLASS}>
          Here is exactly what changes when a real chart is computed properly.
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl border border-[#EFE4D3] shadow-sm">
          <div className="grid grid-cols-[1.1fr_0.9fr_1.1fr] text-[12px] font-extrabold uppercase tracking-wide sm:text-[13px]">
            <div className="bg-[#F7F1E7] px-3 py-3.5 text-[#6B605A] sm:px-5" />
            <div className="bg-[#F7F1E7] px-2 py-3.5 text-center text-[#8A7C72] sm:px-4">Free apps</div>
            <div className="px-2 py-3.5 text-center text-white sm:px-4" style={{ background: ink }}>{c.name}</div>
          </div>
          {c.compare.map((row, i) => (
            <div
              key={row.label}
              className="grid grid-cols-[1.1fr_0.9fr_1.1fr] border-t border-[#F0E7DA] text-[13px] sm:text-[14px]"
              style={{ background: i % 2 ? "#FFFDF9" : "#FFFFFF" }}
            >
              <div className="px-3 py-3.5 font-bold text-[#3D3531] sm:px-5">{row.label}</div>
              <div className="flex items-center justify-center gap-1.5 px-2 py-3.5 text-center text-[#8A7C72] sm:px-4">
                {row.free === false ? (
                  <><X className="h-4 w-4 shrink-0 text-[#C74B4B]" strokeWidth={3} /><span className="hidden sm:inline">Not included</span></>
                ) : (
                  <span>{row.free}</span>
                )}
              </div>
              <div className="flex items-start gap-1.5 px-2 py-3.5 font-semibold sm:px-4" style={{ background: `${tint}99`, color: ink }}>
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" strokeWidth={3} />
                <span>{row.paid}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <div className="w-full max-w-sm">
            <BigCta label={`${c.cta} · ${formatINR(c.price)}`} />
          </div>
        </div>
      </section>

      {/* --------------------------------------------- sample pages */}
      <section className="border-y" style={{ background: tint, borderColor: band }}>
        <div className={`mx-auto w-[92%] max-w-6xl ${SECTION_PAD}`}>
          <h2 className={H2_CLASS} style={{ color: ink }}>
            See a real page before you buy
          </h2>
          <p className={SUB_CLASS}>
            Typeset and printable — not a web page dressed up as a PDF. Tap any page to read it full size.
          </p>

          {/* Three genuinely different spreads. Phones get a snap scroller —
              two of the three used to be display:none there, so most visitors
              only ever saw one. */}
          <div className="-mx-[4%] mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[4%] pb-3 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0">
            {SAMPLE_PAGES.map((sp) => (
              <button
                key={sp.page}
                type="button"
                onClick={() => setZoom(sp)}
                aria-label={`Enlarge sample page: ${sp.label}`}
                className={`group w-[76%] shrink-0 snap-center rounded-lg text-left sm:w-auto ${FOCUS_RING}`}
              >
                <div className="relative overflow-hidden rounded-[8px] transition-transform duration-300 group-hover:-translate-y-1">
                  <ReportPage config={c} page={sp.page} />
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-gradient-to-t from-black/60 via-black/25 to-transparent py-3 text-[11.5px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    <ZoomIn className="h-3.5 w-3.5" /> Read it full size
                  </span>
                </div>
                <p className="mt-3 text-center text-[12.5px] font-bold" style={{ color: ink }}>
                  {sp.label}
                </p>
              </button>
            ))}
          </div>
          <p className="mt-5 text-center text-[12.5px] italic text-[#8A7C72]">
            Sample pages shown with an illustrative chart. Yours is generated from your own birth details.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------- what's in */}
      <section className={`mx-auto w-[92%] max-w-6xl ${SECTION_PAD}`}>
        <h2 className={H2_CLASS} style={{ color: ink }}>
          {c.sectionsTitle}
        </h2>
        <p className={SUB_CLASS}>{c.sectionsSub}</p>

        {sectionGroups.map((g, gi) => (
          <div key={g.title || gi} className={gi === 0 ? "mt-8" : "mt-10"}>
            {g.title && (
              <div className="mb-4 flex items-center gap-3">
                <h3 className="shrink-0 font-serif text-[17px] font-extrabold" style={{ color: ink }}>
                  {g.title}
                </h3>
                <span className="shrink-0 rounded-full border border-[#E9DCC7] bg-[#FFFBF3] px-2.5 py-1 text-[11.5px] font-bold text-[#6B605A]">
                  {g.note}
                </span>
                <span className="h-px flex-1" style={{ background: band }} aria-hidden />
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {g.sections.map((sec, i) => (
                <div
                  key={sec.title}
                  className={`${
                    !showAllSections && i >= MOBILE_PER_GROUP ? "hidden sm:flex" : "flex"
                  } gap-3 rounded-xl border border-[#EFE4D3] bg-white p-4 shadow-sm transition-shadow hover:shadow-md`}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg" style={{ background: `${cta}17` }}>
                    <sec.icon className="h-[18px] w-[18px]" style={{ color: cta }} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-serif text-[15.5px] font-bold leading-snug" style={{ color: ink }}>{sec.title}</h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-[#6B605A]">{sec.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Phones start with the first few of each group — the bundle lists 18. */}
        {hiddenOnMobile > 0 && (
          <button
            type="button"
            onClick={() => setShowAllSections((v) => !v)}
            className={`mt-5 w-full rounded-xl border-2 bg-white py-3 text-[14px] font-extrabold sm:hidden ${FOCUS_RING}`}
            style={{ borderColor: band, color: ink }}
          >
            {showAllSections ? "Show fewer sections" : `Show all ${totalSections} sections`}
          </button>
        )}
      </section>

      {/* ------------------------------------------------ review wall */}
      <section className="border-y" style={{ background: tint, borderColor: band }}>
        <div className={`mx-auto w-[92%] max-w-6xl ${SECTION_PAD}`}>
          <div className="text-center">
            <Stars className="justify-center" />
            <h2 className={`mt-2 ${H2_CLASS}`} style={{ color: ink }}>
              4.9 out of 5 from 3,200+ readers
            </h2>
          </div>

          <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {c.proof.map((p) => (
              <figure key={p.name} className="flex h-full flex-col rounded-xl border border-[#EFE4D3] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <Avatar name={p.name} color={ink} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-[14px] font-extrabold" style={{ color: ink }}>{p.name}</span>
                      <BadgeCheck className="h-4 w-4 shrink-0 text-[#16A34A]" />
                    </div>
                    <div className="truncate text-[12px] text-[#8A7C72]">{p.place}</div>
                  </div>
                </div>
                <Stars className="mt-3" />
                <blockquote className="mt-2 flex-1 text-[13.5px] leading-relaxed text-[#4A423D]">{p.quote}</blockquote>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- steps */}
      <section className={`mx-auto w-[92%] max-w-5xl ${SECTION_PAD}`}>
        <h2 className={H2_CLASS} style={{ color: ink }}>
          How it works
        </h2>
        <div className="mt-9 grid gap-6 sm:grid-cols-3">
          {STEPS.map((st, i) => (
            <div key={st.t} className="relative rounded-xl border border-[#EFE4D3] bg-white p-5 text-center shadow-sm sm:text-left">
              <span
                className="absolute -top-3 left-1/2 grid h-7 w-7 -translate-x-1/2 place-items-center rounded-full text-[13px] font-extrabold text-white sm:left-5 sm:translate-x-0"
                style={{ background: ctaGradient }}
              >
                {i + 1}
              </span>
              <st.icon className="mx-auto mt-3 h-6 w-6 sm:mx-0" style={{ color: cta }} />
              <h3 className="mt-3 font-serif text-[16.5px] font-bold" style={{ color: ink }}>{st.t}</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#6B605A]">{st.d}</p>
            </div>
          ))}
        </div>

      </section>

      {/* ------------------------------------------------------ faq */}
      <section className="border-y" style={{ background: tint, borderColor: band }}>
        <div className={`mx-auto w-[92%] max-w-3xl ${SECTION_PAD}`}>
          <h2 className={H2_CLASS} style={{ color: ink }}>
            Questions, answered
          </h2>
          <Accordion type="single" collapsible className="mt-8 space-y-2.5">
            {c.faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`faq-${i}`} className="overflow-hidden rounded-xl border border-[#EFE4D3] bg-white px-4 sm:px-5">
                <AccordionTrigger className="py-4 text-left text-[15px] font-bold hover:no-underline" style={{ color: ink }}>
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-[14px] leading-relaxed text-[#5B504A]">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <p className="mt-6 text-center text-[14px] text-[#5B504A]">
            Still unsure?{" "}
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="font-bold underline underline-offset-4" style={{ color: ink }}>
              Message us on WhatsApp
            </a>{" "}
            — a person answers.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------ final offer */}
      <section className="mx-auto w-[92%] max-w-6xl py-12 sm:py-16">
        <div className="grid items-start gap-9 lg:grid-cols-[1fr_520px] lg:gap-14">
          <div>
            <h2 className="font-serif font-extrabold leading-[1.08]" style={{ fontSize: "clamp(1.8rem,4.4vw,2.8rem)", color: ink }}>
              Your chart is already written.
              <span className="block" style={{ color: cta }}>Read it properly.</span>
            </h2>

            <div className="mt-6 rounded-2xl border-2 p-5 sm:p-6" style={{ borderColor: band, background: tint }}>
              <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
                <span className="font-serif text-5xl font-extrabold leading-none" style={{ color: ink }}>{formatINR(c.price)}</span>
                <span className="pb-1 text-lg text-[#9A8C82] line-through">{formatINR(c.compareAt)}</span>
                <span className="mb-1 rounded-md bg-[#16A34A] px-2 py-1 text-[12px] font-extrabold text-white">SAVE {savePct}%</span>
              </div>
              <p className="mt-2 text-[13.5px] font-semibold" style={{ color: ink }}>
                {c.pages} · one-time payment · ends in <span className="tabular-nums">{h}:{m}:{s}</span>
              </p>

              <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {[
                  { i: ShieldCheck, t: "Secured by Razorpay" },
                  { i: Download, t: "Links never expire" },
                  { i: Mail, t: "Emailed to your inbox" },
                  { i: Check, t: "No subscription, ever" },
                ].map((x) => (
                  <li key={x.t} className="flex items-center gap-2 text-[13.5px] font-semibold text-[#3D3531]">
                    <x.i className="h-4 w-4 shrink-0" style={{ color: cta }} /> {x.t}
                  </li>
                ))}
              </ul>

              <div className="mt-5">
                <BigCta label={`${c.cta} · ${formatINR(c.price)}`} />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
              <Stars />
              <span className="text-[14px] text-[#5B504A]"><b style={{ color: ink }}>4.9/5</b> from 3,200+ readers</span>
            </div>

            {/* The guarantee sits beside the price, where the hesitation is —
                and it fills the column that used to run short next to the form. */}
            <div className="mt-6 flex items-start gap-4 rounded-2xl border border-[#EFE4D3] bg-white p-5 shadow-sm">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#16A34A]/10">
                <ShieldCheck className="h-6 w-6" style={{ color: "#16A34A" }} />
              </span>
              <div>
                <h3 className="font-serif text-[16.5px] font-bold" style={{ color: ink }}>Our guarantee</h3>
                <p className="mt-1 text-[13.5px] leading-relaxed text-[#5B504A]">{c.guarantee}</p>
              </div>
            </div>
          </div>

          <ReportPurchaseForm config={c} idPrefix="final" />
        </div>
      </section>

      {/* --------------------------------------------------- footer */}
      <footer className="border-t border-[#EDE2D0] bg-[#FBF6EE] pb-28 lg:pb-0">
        <div className="mx-auto grid w-[92%] max-w-6xl gap-8 py-11 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <span className="inline-flex items-center rounded-lg px-3 py-2" style={{ background: ink }}>
              <img src={LOGO} alt="JyotishNow" className="h-9 w-auto object-contain" />
            </span>
            <p className="mt-4 max-w-sm text-[13.5px] leading-relaxed text-[#5B504A]">
              Vedic astrology reports computed from your real birth chart, under the guidance of
              Dr. Sandeep Sawhney — 25+ years of practice and over a lakh consultations.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:max-w-xs">
              {STATS.slice(0, 4).map((st) => (
                <div key={st.l}>
                  <div className="font-serif text-xl font-extrabold" style={{ color: ink }}>{st.n}</div>
                  <div className="text-[11.5px] text-[#6B605A]">{st.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[12px] font-extrabold uppercase tracking-wider" style={{ color: ink }}>Get in touch</h3>
            <ul className="mt-4 space-y-3 text-[13.5px] text-[#5B504A]">
              <li><a href={`tel:${REPORT_CONTACT.phoneDigits}`} className="inline-flex items-center gap-2.5 hover:text-[#2A2320]"><Phone className="h-4 w-4" style={{ color: cta }} /> {REPORT_CONTACT.phone}</a></li>
              <li><a href={`mailto:${REPORT_CONTACT.email}`} className="inline-flex items-center gap-2.5 break-all hover:text-[#2A2320]"><Mail className="h-4 w-4 shrink-0" style={{ color: cta }} /> {REPORT_CONTACT.email}</a></li>
              <li><a href={waHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 hover:text-[#2A2320]"><MessageCircle className="h-4 w-4" style={{ color: cta }} /> Chat on WhatsApp</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[12px] font-extrabold uppercase tracking-wider" style={{ color: ink }}>This report</h3>
            <ul className="mt-4 space-y-3 text-[13.5px] text-[#5B504A]">
              {[
                { i: FileText, t: c.pages },
                { i: Mail, t: "Emailed as a PDF" },
                { i: Download, t: "Links never expire" },
                { i: ShieldCheck, t: "Secured by Razorpay" },
              ].map((x) => (
                <li key={x.t} className="flex items-center gap-2.5"><x.i className="h-4 w-4 shrink-0" style={{ color: cta }} /> {x.t}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[#EDE2D0]">
          <div className="mx-auto flex w-[92%] max-w-6xl flex-col gap-2 py-5 text-[11.5px] leading-relaxed text-[#8A7C72] sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl">
              Astrological reports are provided for guidance and personal reflection. They are not a
              substitute for professional medical, legal or financial advice.
            </p>
            <p className="shrink-0">© {new Date().getFullYear()} JyotishNow</p>
          </div>
        </div>
      </footer>

      {/* --------------------------------------------- sticky mobile */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 border-t border-[#EDE2D0] bg-white px-4 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-8px_24px_-12px_rgba(0,0,0,.25)] transition-transform duration-300 lg:hidden ${
          showBar ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1 leading-tight">
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-xl font-extrabold" style={{ color: ink }}>{formatINR(c.price)}</span>
              <span className="text-[12px] text-[#9A8C82] line-through">{formatINR(c.compareAt)}</span>
            </div>
            <div className="truncate text-[11px] tabular-nums text-[#6B605A]">Ends in {h}:{m}:{s}</div>
          </div>
          <button
            onClick={scrollToForm}
            className={`shrink-0 whitespace-nowrap rounded-lg px-5 py-3 text-[14px] font-extrabold text-white shadow-md ${FOCUS_RING}`}
            style={{ background: ctaGradient }}
          >
            Get my report
          </button>
        </div>
      </div>

      {/* ------------------------------------------- sample page zoom */}
      <Dialog open={!!zoom} onOpenChange={(open) => !open && setZoom(null)}>
        <DialogContent className="max-w-[min(94vw,540px)] border-none bg-transparent p-0 shadow-none">
          {zoom && (
            <>
              <DialogTitle className="sr-only">{zoom.label}</DialogTitle>
              <ReportPage config={c} page={zoom.page} />
              <p className="mt-3 text-center text-[13px] font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
                {zoom.label}
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
