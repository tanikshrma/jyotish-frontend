import { useEffect, useRef, useState } from "react";
import {
  ArrowRight, BadgeCheck, CalendarHeart, Check, Clock3, CreditCard, FileText, Globe, HeartHandshake,
  Lock, Mail, MessageCircle, Phone, ShieldAlert, ShieldCheck, Sparkles, Star, Users2, Zap,
} from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { MatchPurchaseForm } from "@/components/MatchPurchaseForm";
import { ConsultationSection } from "@/components/consultation/ConsultationSection";
import { BRAND_THEME, LOGO, REPORT_CONTACT } from "@/pages/landing/reportLandingConfig";
import { formatINR, getPriceInRupees } from "../../shared/pricing";
import { CONSULTATION_ADDON, quoteOrder, isQuote } from "../../shared/consultation";

/**
 * /lp/kundli-matching — the Ashtakoot matching report (₹299) sold on its own
 * page, with the ₹999 call with Dr. Sandeep as an add-on at checkout and a full
 * consultation further down for couples who want to talk first.
 */

const PRICE = getPriceInRupees("matchmaking-pdf") ?? 0;
const COMPARE_AT = 999;
const ADDON = (() => {
  const q = quoteOrder("matchmaking-pdf", undefined, [CONSULTATION_ADDON.key]);
  return isQuote(q) && q.consultation ? q.consultation.rupees : 0;
})();

const KOOTAS = [
  { n: "Varna", pts: 1, d: "Spiritual and working temperament — how the two of you approach duty." },
  { n: "Vashya", pts: 2, d: "Mutual attraction and the natural balance of influence between you." },
  { n: "Tara", pts: 3, d: "Birth-star compatibility — wellbeing and fortune in the marriage." },
  { n: "Yoni", pts: 4, d: "Physical and intimate compatibility, read from the nakshatras." },
  { n: "Graha Maitri", pts: 5, d: "Friendship between your Moon-sign lords — the mental wavelength." },
  { n: "Gana", pts: 6, d: "Deva, Manushya or Rakshasa nature — how temperaments meet." },
  { n: "Bhakoot", pts: 7, d: "Moon-sign relationship — family welfare, finances and growth." },
  { n: "Nadi", pts: 8, d: "The most weighted koota — health and progeny, and Nadi dosha." },
];

const INSIDE = [
  { icon: HeartHandshake, t: "36-guna Ashtakoot score", d: "Every koota scored individually, with the total and what it means." },
  { icon: ShieldAlert, t: "Manglik dosha check", d: "Mangal dosha for both charts, and whether it cancels between you." },
  { icon: Sparkles, t: "Both birth charts", d: "Lagna and Moon charts with planetary positions for each partner." },
  { icon: CalendarHeart, t: "Nakshatra & rashi details", d: "Each partner's nakshatra, charan, rashi and their lords." },
  { icon: FileText, t: "Plain-language conclusion", d: "What the match indicates overall — not just a number." },
  { icon: ShieldCheck, t: "Dosha remedies", d: "Where a dosha is present, the classical remedies suggested for it." },
];

const FAQS = [
  { q: "What details do I need?", a: "Name, date of birth, time of birth and place of birth for both the boy and the girl. The closest birth time you know is fine." },
  { q: "How soon do I get the report?", a: "Within a couple of minutes of paying. It opens in your browser, downloads, and is emailed to you. The link never expires." },
  { q: "What is the ₹999 add-on?", a: `A 15-minute audio call with Dr. Sandeep Sawhney to go through your match — scores, doshas, and what to do about them. You pick the time at checkout from his live calendar, and it is booked the moment your payment goes through.` },
  { q: "Is a low guna score a reason to say no?", a: "Not on its own. The score is one part of compatibility; doshas can cancel, and the full charts matter. That is exactly what the consultation is for." },
  { q: "Is my payment secure?", a: "Yes. Payments go through Razorpay, India's most widely used gateway. We never see or store your card or UPI details." },
];

const STEPS = [
  { icon: Users2, t: "Enter both charts", d: "Birth date, time and place for the boy and the girl." },
  { icon: CreditCard, t: "Pay once", d: `${formatINR(PRICE)} by UPI or card — add the call with Dr. Sandeep if you like.` },
  { icon: Mail, t: "Report in minutes", d: "It downloads and lands in your inbox. Your call is booked instantly." },
];

const STATS = [
  { icon: Clock3, n: "25+", l: "Years of practice" },
  { icon: Users2, n: "1L+", l: "Consultations" },
  { icon: Star, n: "4.9★", l: "Client rating" },
  { icon: Globe, n: "15+", l: "Countries served" },
];

const SECTION_PAD = "py-14 sm:py-20";
const H2 = "text-center font-serif font-extrabold leading-tight text-[clamp(1.65rem,4vw,2.4rem)]";
const SUB = "mx-auto mt-3 max-w-2xl text-center text-[15px] leading-relaxed text-[#5B504A]";

export default function MatchLanding() {
  const { ink, cta, ctaDark, tint, band, gold } = BRAND_THEME;
  const formRef = useRef<HTMLDivElement>(null);
  const [showBar, setShowBar] = useState(false);
  const ctaGradient = `linear-gradient(180deg, ${cta} 0%, ${ctaDark} 100%)`;

  useEffect(() => {
    document.title = "Kundli Matching Report — 36 Guna Milan PDF | JyotishNow";
    const meta = document.querySelector('meta[name="description"]');
    const prev = meta?.getAttribute("content") ?? null;
    meta?.setAttribute(
      "content",
      "Ashtakoot kundli matching for marriage: all 8 kootas scored out of 36, Manglik dosha check and both birth charts, as a PDF in minutes. Add a call with Dr. Sandeep Sawhney.",
    );
    return () => { if (meta && prev !== null) meta.setAttribute("content", prev); };
  }, []);

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

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const waHref = `https://wa.me/${REPORT_CONTACT.phoneDigits}?text=${encodeURIComponent(
    `Hi, I have a question about the Kundli Matching report (${formatINR(PRICE)}).`,
  )}`;

  return (
    <div className="min-h-screen overflow-x-clip bg-white font-sans text-[#2A2320]">
      <header className="sticky top-0 z-40" style={{ background: ink, borderBottom: `1px solid ${gold}59` }}>
        <div className="mx-auto flex w-[92%] max-w-6xl items-center justify-between gap-3 py-2.5">
          <img src={LOGO} alt="JyotishNow" className="h-9 w-auto object-contain sm:h-11" />
          <div className="flex items-center gap-4">
            <a href={`tel:${REPORT_CONTACT.phoneDigits}`} className="hidden items-center gap-2 text-[13.5px] font-bold text-white sm:inline-flex">
              <Phone className="h-4 w-4" style={{ color: gold }} /> {REPORT_CONTACT.phone}
            </a>
            <button onClick={scrollToForm} className="rounded-lg px-4 py-2.5 text-[13px] font-extrabold text-white shadow-md sm:px-5 sm:text-[14px]" style={{ background: ctaGradient }}>
              Match now · {formatINR(PRICE)}
            </button>
          </div>
        </div>
      </header>

      {/* hero */}
      <section style={{ background: `linear-gradient(180deg, ${tint} 0%, #FFFFFF 100%)` }}>
        <div className="mx-auto grid w-[92%] max-w-6xl items-start gap-8 py-7 sm:py-12 lg:grid-cols-[1fr_520px] lg:gap-14 lg:py-14">
          <div className="lg:col-start-1 lg:row-start-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full px-3 py-1.5 text-[11.5px] font-extrabold uppercase tracking-wide text-white" style={{ background: ink }}>
                Kundli Matching Report
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E4D9C4] bg-white px-3 py-1.5 text-[12px] font-bold" style={{ color: ink }}>
                <Zap className="h-3.5 w-3.5" style={{ color: cta }} /> Delivered in minutes
              </span>
            </div>
            <h1 className="mt-5 font-serif font-extrabold leading-[1.06] tracking-tight" style={{ fontSize: "clamp(1.95rem,5.2vw,3.4rem)", color: ink, textWrap: "balance" }}>
              Before you say yes, <span style={{ color: cta }}>match the kundlis properly.</span>
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[#5B504A] sm:text-[17px]">
              All eight Ashtakoot kootas scored out of 36, a Manglik check for both partners, and both birth charts — computed from exact birth details and delivered as a PDF. Want it explained? Add a 15-minute call with Dr. Sandeep Sawhney for {formatINR(ADDON)}.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="inline-flex text-[#F5A524]">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-[15px] w-[15px] fill-current" />)}</span>
              <span className="text-[14px] font-semibold" style={{ color: ink }}>4.9/5</span>
              <span className="text-[14px] text-[#6B605A]">from families across India</span>
            </div>
          </div>

          <div className="lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-24">
            <div ref={formRef} className="scroll-mt-24">
              <MatchPurchaseForm theme={BRAND_THEME} source="kundli-matching" idPrefix="hero" compareAt={COMPARE_AT} />
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-[#EFE4D3] bg-white p-3 text-[12px] text-[#6B605A]">
              <Lock className="h-3.5 w-3.5" style={{ color: ink }} /> UPI · Cards · Net Banking — secured by Razorpay
            </div>
          </div>

          <div className="lg:col-start-1 lg:row-start-2">
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {[
                "How many of the 36 gunas you share — koota by koota",
                "Whether Manglik dosha is present, and if it cancels",
                "Nadi and Bhakoot dosha, the two that matter most",
                "A clear conclusion you can share with both families",
              ].map((a) => (
                <li key={a} className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#16A34A]">
                    <Check className="h-3 w-3 text-white" strokeWidth={3.5} />
                  </span>
                  <span className="text-[14px] leading-snug text-[#3D3531]">{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* koota table */}
      <section className="border-y" style={{ background: tint, borderColor: band }}>
        <div className={`mx-auto w-[92%] max-w-5xl ${SECTION_PAD}`}>
          <h2 className={H2} style={{ color: ink }}>The 36 gunas, scored one by one</h2>
          <p className={SUB}>Ashtakoot matching reads eight aspects of compatibility. Your report scores each of them for your two charts.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {KOOTAS.map((k) => (
              <div key={k.n} className="flex items-start gap-3 rounded-xl border border-[#EFE4D3] bg-white p-4 shadow-sm">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg font-serif text-lg font-extrabold text-white" style={{ background: ctaGradient }}>
                  {k.pts}
                </span>
                <div className="min-w-0">
                  <h3 className="font-serif text-[15.5px] font-bold" style={{ color: ink }}>{k.n} <span className="text-[12px] font-semibold text-[#8A7C72]">· {k.pts} {k.pts === 1 ? "point" : "points"}</span></h3>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-[#6B605A]">{k.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* inside */}
      <section className={`mx-auto w-[92%] max-w-6xl ${SECTION_PAD}`}>
        <h2 className={H2} style={{ color: ink }}>What's inside the report</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {INSIDE.map((x) => (
            <div key={x.t} className="flex gap-3 rounded-xl border border-[#EFE4D3] bg-white p-4 shadow-sm">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg" style={{ background: `${cta}17` }}>
                <x.icon className="h-[18px] w-[18px]" style={{ color: cta }} />
              </span>
              <div className="min-w-0">
                <h3 className="font-serif text-[15.5px] font-bold leading-snug" style={{ color: ink }}>{x.t}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-[#6B605A]">{x.d}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-8 max-w-sm">
          <button onClick={scrollToForm} className="group inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-[16px] font-extrabold text-white shadow-lg" style={{ background: ctaGradient }}>
            Get the match report · {formatINR(PRICE)} <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* steps */}
      <section className="border-y" style={{ background: tint, borderColor: band }}>
        <div className={`mx-auto w-[92%] max-w-5xl ${SECTION_PAD}`}>
          <h2 className={H2} style={{ color: ink }}>How it works</h2>
          <div className="mt-9 grid gap-6 sm:grid-cols-3">
            {STEPS.map((st, i) => (
              <div key={st.t} className="relative rounded-xl border border-[#EFE4D3] bg-white p-5 text-center shadow-sm sm:text-left">
                <span className="absolute -top-3 left-1/2 grid h-7 w-7 -translate-x-1/2 place-items-center rounded-full text-[13px] font-extrabold text-white sm:left-5 sm:translate-x-0" style={{ background: ctaGradient }}>{i + 1}</span>
                <st.icon className="mx-auto mt-3 h-6 w-6 sm:mx-0" style={{ color: cta }} />
                <h3 className="mt-3 font-serif text-[16.5px] font-bold" style={{ color: ink }}>{st.t}</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#6B605A]">{st.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ConsultationSection
        theme={BRAND_THEME}
        source="kundli-matching"
        title="Discuss the match with Dr. Sandeep"
        sub="For a proposal you're unsure about, a delay in marriage, or doshas that need remedies — a one-to-one consultation on both charts."
      />

      {/* faq */}
      <section className={`mx-auto w-[92%] max-w-3xl ${SECTION_PAD}`}>
        <h2 className={H2} style={{ color: ink }}>Questions, answered</h2>
        <Accordion type="single" collapsible className="mt-8 space-y-2.5">
          {FAQS.map((f, i) => (
            <AccordionItem key={f.q} value={`faq-${i}`} className="overflow-hidden rounded-xl border border-[#EFE4D3] bg-white px-4 sm:px-5">
              <AccordionTrigger className="py-4 text-left text-[15px] font-bold hover:no-underline" style={{ color: ink }}>{f.q}</AccordionTrigger>
              <AccordionContent className="pb-4 text-[14px] leading-relaxed text-[#5B504A]">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <p className="mt-6 text-center text-[14px] text-[#5B504A]">
          Still unsure? <a href={waHref} target="_blank" rel="noopener noreferrer" className="font-bold underline underline-offset-4" style={{ color: ink }}>Message us on WhatsApp</a> — a person answers.
        </p>
      </section>

      <footer className="border-t border-[#EDE2D0] bg-[#FBF6EE] pb-28 lg:pb-0">
        <div className="mx-auto grid w-[92%] max-w-6xl gap-8 py-11 sm:grid-cols-2">
          <div>
            <span className="inline-flex items-center rounded-lg px-3 py-2" style={{ background: ink }}>
              <img src={LOGO} alt="JyotishNow" className="h-9 w-auto object-contain" />
            </span>
            <p className="mt-4 max-w-sm text-[13.5px] leading-relaxed text-[#5B504A]">
              Vedic astrology under the guidance of Dr. Sandeep Sawhney — 25+ years of practice and over a lakh consultations.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:max-w-xs">
              {STATS.map((st) => (
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
              <li><a href={`tel:${REPORT_CONTACT.phoneDigits}`} className="inline-flex items-center gap-2.5"><Phone className="h-4 w-4" style={{ color: cta }} /> {REPORT_CONTACT.phone}</a></li>
              <li><a href={`mailto:${REPORT_CONTACT.email}`} className="inline-flex items-center gap-2.5 break-all"><Mail className="h-4 w-4 shrink-0" style={{ color: cta }} /> {REPORT_CONTACT.email}</a></li>
              <li><a href={waHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5"><MessageCircle className="h-4 w-4" style={{ color: cta }} /> Chat on WhatsApp</a></li>
              <li className="inline-flex items-center gap-2.5"><BadgeCheck className="h-4 w-4" style={{ color: cta }} /> Secured by Razorpay</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#EDE2D0]">
          <div className="mx-auto flex w-[92%] max-w-6xl flex-col gap-2 py-5 text-[11.5px] text-[#8A7C72] sm:flex-row sm:justify-between">
            <p className="max-w-2xl">Astrological reports are provided for guidance and personal reflection. They are not a substitute for professional medical, legal or financial advice.</p>
            <p className="shrink-0">© {new Date().getFullYear()} JyotishNow</p>
          </div>
        </div>
      </footer>

      <div className={`fixed inset-x-0 bottom-0 z-50 border-t border-[#EDE2D0] bg-white px-4 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-8px_24px_-12px_rgba(0,0,0,.25)] transition-transform duration-300 lg:hidden ${showBar ? "translate-y-0" : "translate-y-full"}`}>
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1 leading-tight">
            <span className="font-serif text-xl font-extrabold" style={{ color: ink }}>{formatINR(PRICE)}</span>
            <span className="ml-1.5 text-[12px] text-[#9A8C82] line-through">{formatINR(COMPARE_AT)}</span>
            <div className="truncate text-[11px] text-[#6B605A]">Kundli matching · 36 gunas</div>
          </div>
          <button onClick={scrollToForm} className="shrink-0 rounded-lg px-5 py-3 text-[14px] font-extrabold text-white shadow-md" style={{ background: ctaGradient }}>
            Match now
          </button>
        </div>
      </div>
    </div>
  );
}
