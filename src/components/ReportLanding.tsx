import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Check, Star, Phone, ShieldCheck, Clock3, Users2, Globe, ArrowDown,
  FileText, Mail, CreditCard, Quote, Download,
} from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { ReportPurchaseForm } from "@/components/ReportPurchaseForm";
import { ReportPage, ReportStack } from "@/components/ReportMockup";
import {
  REPORT_CONTACT, LOGO, PREMIUM_SECTION_LIST, type ReportLandingConfig,
} from "@/pages/landing/reportLandingConfig";
import { formatINR } from "../../shared/pricing";

/* Cinzel ships in index.html — used for small-caps eyebrows only. */
const DISPLAY = "'Cinzel', 'Playfair Display', serif";

function Reveal({
  children, delay = 0, className = "",
}: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const Stars = ({ color }: { color: string }) => (
  <span className="inline-flex" style={{ color }} aria-label="5 out of 5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className="h-[15px] w-[15px] fill-current" />
    ))}
  </span>
);

/** Eyebrow label — small caps, letterspaced, gold rule either side. */
function Eyebrow({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span className="h-px w-8 sm:w-12" style={{ background: `${color}66` }} />
      <span
        className="whitespace-nowrap text-[10px] font-bold uppercase sm:text-[11px]"
        style={{ fontFamily: DISPLAY, color, letterSpacing: "0.26em" }}
      >
        {children}
      </span>
      <span className="h-px w-8 sm:w-12" style={{ background: `${color}66` }} />
    </div>
  );
}

/** Faint zodiac wheel behind the dark sections — depth without an asset. */
function ZodiacWheel({ color, className = "" }: { color: string; className?: string }) {
  const spokes = Array.from({ length: 12 }, (_, i) => (i * 360) / 12);
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden focusable="false">
      <g fill="none" stroke={color} strokeWidth="0.5">
        <circle cx="100" cy="100" r="99" />
        <circle cx="100" cy="100" r="82" />
        <circle cx="100" cy="100" r="58" />
        <circle cx="100" cy="100" r="34" />
        {spokes.map((a) => (
          <line
            key={a}
            x1="100" y1="100" x2="100" y2="1"
            transform={`rotate(${a} 100 100)`}
          />
        ))}
        <rect x="41" y="41" width="118" height="118" transform="rotate(45 100 100)" />
        <rect x="41" y="41" width="118" height="118" />
      </g>
    </svg>
  );
}

const STATS = [
  { icon: Clock3, n: "25+", l: "Years of practice" },
  { icon: Users2, n: "1L+", l: "Consultations" },
  { icon: Star, n: "4.9★", l: "Client rating" },
  { icon: Globe, n: "15+", l: "Countries served" },
];

const STEPS = [
  { icon: FileText, t: "Enter your birth details", d: "Your name, date, exact time and place of birth. That is everything the chart needs." },
  { icon: CreditCard, t: "Pay securely", d: "One payment through Razorpay. No subscription, no recurring charge, nothing hidden." },
  { icon: Mail, t: "Get it in minutes", d: "Your report opens, downloads and lands in your inbox — usually inside two minutes." },
];

export default function ReportLanding({ config }: { config: ReportLandingConfig }) {
  const c = config;
  const { ink, inkSoft, gold, glow } = c.theme;
  const formRef = useRef<HTMLDivElement>(null);
  const [showBar, setShowBar] = useState(false);

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
      ([entry]) => setShowBar(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.body.classList.toggle("report-buybar-open", showBar);
    return () => document.body.classList.remove("report-buybar-open");
  }, [showBar]);

  const scrollToForm = () =>
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const waHref = `https://wa.me/${REPORT_CONTACT.phoneDigits}?text=${encodeURIComponent(
    `Hi, I have a question about the ${c.name} (${formatINR(c.price)}).`,
  )}`;

  const isBundle = c.variant === "complete";
  /* The bundle's contents = predictions sections first, then the premium list. */
  const toc = isBundle ? [...c.sections, ...PREMIUM_SECTION_LIST] : c.sections;

  const darkBg = `linear-gradient(155deg, ${inkSoft} 0%, ${ink} 52%, #06030a 140%)`;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FFFCF7] font-sans text-foreground">
      {/* announcement */}
      <div className="px-4 py-2 text-center text-[12px] sm:text-[13px]" style={{ background: "#100A05", color: "rgba(255,255,255,.8)" }}>
        Trusted guidance from <b style={{ color: gold }}>Dr. Sandeep Sawhney</b>
        <span className="hidden sm:inline"> · 25+ years · 1,00,000+ consultations</span>
      </div>

      {/* header */}
      <header className="sticky top-0 z-40 border-b backdrop-blur-md" style={{ background: `${ink}f5`, borderColor: `${gold}2e` }}>
        <div className="mx-auto flex w-[92%] max-w-6xl items-center justify-between gap-3 py-2.5">
          <img src={LOGO} alt="JyotishNow" className="h-9 w-auto object-contain sm:h-12" />
          <div className="flex items-center gap-2">
            <a href={`tel:${REPORT_CONTACT.phoneDigits}`} className="hidden items-center gap-2 text-sm font-semibold sm:inline-flex" style={{ color: `${gold}` }}>
              <Phone className="h-4 w-4" /> {REPORT_CONTACT.phone}
            </a>
            <button
              onClick={scrollToForm}
              className="rounded-full px-4 py-2 text-[13px] font-bold shadow-lg transition-transform hover:scale-[1.03] sm:px-5 sm:text-sm"
              style={{ background: gold, color: ink }}
            >
              Get it · {formatINR(c.price)}
            </button>
          </div>
        </div>
      </header>

      {/* ================================================== HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: darkBg }} />
        <ZodiacWheel color={`${gold}1c`} className="pointer-events-none absolute -right-[18%] -top-[30%] h-[135%] w-auto opacity-70 lg:-right-[6%]" />
        <div className="pointer-events-none absolute -left-40 top-1/3 h-[26rem] w-[26rem] rounded-full blur-3xl" style={{ background: glow }} />
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 120%, transparent 40%, rgba(0,0,0,.5) 100%)" }} />

        <div className="relative z-10 mx-auto grid w-[92%] max-w-6xl items-center gap-9 py-10 sm:py-14 lg:grid-cols-[1fr_440px] lg:gap-14 lg:py-20">
          <div className="text-white">
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="flex justify-start"
            >
              <span className="flex items-center gap-2.5">
                <span className="h-px w-7" style={{ background: `${gold}88` }} />
                <span className="text-[10px] font-bold uppercase sm:text-[11px]" style={{ fontFamily: DISPLAY, color: gold, letterSpacing: "0.26em" }}>
                  {c.eyebrow}
                </span>
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}
              className="mt-4 font-serif font-bold leading-[1.04] tracking-[-0.01em]"
              /* index.css forces text-primary on headings — override inline. */
              style={{ fontSize: "clamp(2.1rem,5.4vw,3.6rem)", color: "#fff", textWrap: "balance" }}
            >
              {c.h1a} <span style={{ color: gold }}>{c.h1b}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/75 sm:text-[16.5px]"
            >
              {c.sub}
            </motion.p>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              {c.heroChips.map((chip) => (
                <span key={chip} className="inline-flex items-center gap-2 text-[13px] font-semibold text-white/90 sm:text-sm">
                  <Check className="h-4 w-4" style={{ color: gold }} strokeWidth={3} /> {chip}
                </span>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 border-t pt-6 text-sm text-white/75" style={{ borderColor: "rgba(255,255,255,.14)" }}>
              <Stars color={gold} />
              <span><b className="text-white">4.9/5</b> from 3,200+ readers</span>
              <span className="hidden opacity-40 sm:inline">·</span>
              <span className="hidden sm:inline">1,00,000+ consultations</span>
            </div>
          </div>

          <div ref={formRef} className="scroll-mt-24">
            <ReportPurchaseForm config={c} idPrefix="hero" />
          </div>
        </div>
      </section>

      {/* stats */}
      <div className="border-b bg-white" style={{ borderColor: "#EFE6D8" }}>
        <div className="mx-auto grid w-[92%] max-w-6xl grid-cols-2 gap-5 py-6 text-center md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.l} className="flex flex-col items-center">
              <s.icon className="mb-1 h-4 w-4" style={{ color: gold }} />
              <div className="font-serif text-xl font-extrabold sm:text-2xl" style={{ color: ink }}>{s.n}</div>
              <div className="text-[11px] text-muted-foreground sm:text-xs">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================ SEE THE PRODUCT */}
      <section className="relative overflow-hidden" style={{ background: "#FFF8ED" }}>
        <div className="mx-auto w-[92%] max-w-6xl py-14 sm:py-20">
          <Reveal>
            <Eyebrow color={`${ink}99`}>An actual page</Eyebrow>
            <h2 className="mt-3 text-center font-serif font-bold leading-tight" style={{ fontSize: "clamp(1.7rem,4.2vw,2.6rem)", color: ink }}>
              This is what lands in your inbox
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-[15px] leading-relaxed text-muted-foreground">
              Typeset, printable and built from your own chart — not a web page dressed up as a PDF.
            </p>
          </Reveal>

          <div className="mt-10 grid items-center gap-10 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-16">
            <Reveal>
              <ReportStack config={c} />
            </Reveal>

            <Reveal delay={0.1}>
              <ul className="space-y-6">
                {[
                  { t: "Your real chart, drawn properly", d: "North-Indian lagna chart with every planet in its house, plus the divisional set from D1 to D60." },
                  { t: "Exact positions, not vague summaries", d: "Every planet with its sign, degree and nakshatra — the same table an astrologer works from." },
                  { t: "Written in plain language", d: "Full paragraphs that explain what a placement means for you, not a glossary of Sanskrit terms." },
                  { t: "Yours to keep and print", d: `${c.pages}, delivered as ${c.pdfCount > 1 ? "PDFs" : "a PDF"} with download links that never expire.` },
                ].map((f) => (
                  <li key={f.t} className="flex gap-4">
                    <span className="mt-1 h-6 w-px shrink-0" style={{ background: gold }} />
                    <div>
                      <h3 className="font-serif text-[17px] font-bold leading-snug sm:text-lg" style={{ color: ink }}>{f.t}</h3>
                      <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">{f.d}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-7 text-[12px] italic text-muted-foreground">
                Sample page shown with an illustrative chart. Yours is generated from your own birth details.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =============================================== TABLE OF CONTENTS */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: darkBg }} />
        <ZodiacWheel color={`${gold}12`} className="pointer-events-none absolute -left-[22%] top-1/4 h-[110%] w-auto" />
        <div className="relative z-10 mx-auto w-[92%] max-w-5xl py-14 sm:py-20">
          <Reveal>
            <Eyebrow color={gold}>Contents</Eyebrow>
            <h2 className="mt-3 text-center font-serif font-bold leading-tight" style={{ fontSize: "clamp(1.7rem,4.2vw,2.6rem)", color: "#fff" }}>
              {c.sectionsTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-[15px] leading-relaxed text-white/65">
              {c.sectionsSub}
            </p>
          </Reveal>

          <div className="mt-10 grid gap-x-12 sm:mt-12 lg:grid-cols-2">
            {toc.map((s, i) => (
              <Reveal key={`${s.title}-${i}`} delay={Math.min(i, 6) * 0.03}>
                <div
                  className="flex items-baseline gap-4 border-b py-4 sm:gap-5 sm:py-5"
                  style={{ borderColor: "rgba(255,255,255,.11)" }}
                >
                  <span
                    className="shrink-0 font-serif text-[15px] font-bold tabular-nums sm:text-base"
                    style={{ color: `${gold}` }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-[16.5px] font-bold leading-snug text-white sm:text-[17.5px]">
                      {s.title}
                    </h3>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-white/55">{s.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="mt-12 text-center">
              <button
                onClick={scrollToForm}
                className="inline-flex items-center gap-2 rounded-full px-7 py-4 text-[15px] font-bold shadow-2xl transition-transform hover:scale-[1.02] sm:text-base"
                style={{ background: gold, color: ink }}
              >
                {c.cta} · {formatINR(c.price)} <ArrowDown className="h-4 w-4" />
              </button>
              <p className="mt-3 text-[12.5px] text-white/50">
                {c.pages} · delivered in minutes · yours forever
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================================================== QUESTIONS */}
      <section className="mx-auto w-[92%] max-w-3xl py-14 sm:py-20">
        <Reveal>
          <Eyebrow color={`${ink}99`}>The point of it</Eyebrow>
          <h2 className="mt-3 text-center font-serif font-bold leading-tight" style={{ fontSize: "clamp(1.7rem,4.2vw,2.6rem)", color: ink }}>
            What you'll finally know
          </h2>
        </Reveal>

        <ul className="mt-9 sm:mt-11">
          {c.answers.map((a, i) => (
            <Reveal key={a} delay={i * 0.05}>
              <li
                className="flex items-start gap-4 border-b py-5 sm:gap-5"
                style={{ borderColor: "#EDE3D3" }}
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45" style={{ background: gold }} />
                <span
                  className="font-serif text-[17px] leading-relaxed sm:text-[19px]"
                  style={{ color: `${ink}` }}
                >
                  {a}
                </span>
              </li>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* =================================================== STEPS */}
      <section className="border-y" style={{ background: "#FFF8ED", borderColor: "#EFE6D8" }}>
        <div className="mx-auto w-[92%] max-w-5xl py-14 sm:py-18">
          <Reveal>
            <Eyebrow color={`${ink}99`}>Three steps</Eyebrow>
            <h2 className="mt-3 text-center font-serif font-bold leading-tight" style={{ fontSize: "clamp(1.6rem,4vw,2.3rem)", color: ink }}>
              How it works
            </h2>
          </Reveal>
          <div className="mt-9 grid gap-6 sm:grid-cols-3 sm:gap-8">
            {STEPS.map((s, i) => (
              <Reveal key={s.t} delay={i * 0.08}>
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center gap-3 sm:justify-start">
                    <span className="grid h-11 w-11 place-items-center rounded-full border" style={{ borderColor: `${gold}`, color: ink }}>
                      <s.icon className="h-5 w-5" />
                    </span>
                    <span className="font-serif text-3xl font-extrabold" style={{ color: `${gold}` }}>{i + 1}</span>
                  </div>
                  <h3 className="mt-3.5 font-serif text-[17px] font-bold" style={{ color: ink }}>{s.t}</h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =================================================== PROOF */}
      <section className="mx-auto w-[92%] max-w-6xl py-14 sm:py-20">
        <Reveal>
          <Eyebrow color={`${ink}99`}>Readers</Eyebrow>
          <h2 className="mt-3 text-center font-serif font-bold leading-tight" style={{ fontSize: "clamp(1.6rem,4vw,2.3rem)", color: ink }}>
            What people say after reading it
          </h2>
        </Reveal>
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {c.proof.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.07}>
              <figure className="flex h-full flex-col rounded-sm border-t-2 bg-white p-6 shadow-sm" style={{ borderColor: gold }}>
                <Quote className="h-5 w-5 shrink-0" style={{ color: `${gold}` }} />
                <blockquote className="mt-3 flex-1 text-[14.5px] leading-relaxed text-foreground/80">
                  {p.quote}
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-2 text-[13px]">
                  <Stars color={gold} />
                  <span className="font-bold" style={{ color: ink }}>{p.name}</span>
                  <span className="text-muted-foreground">· {p.place}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===================================================== FAQ */}
      <section className="border-t" style={{ background: "#FFF8ED", borderColor: "#EFE6D8" }}>
        <div className="mx-auto w-[92%] max-w-3xl py-14 sm:py-20">
          <Reveal>
            <Eyebrow color={`${ink}99`}>Before you buy</Eyebrow>
            <h2 className="mt-3 text-center font-serif font-bold leading-tight" style={{ fontSize: "clamp(1.6rem,4vw,2.3rem)", color: ink }}>
              Questions, answered
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <Accordion type="single" collapsible className="mt-8">
              {c.faqs.map((f, i) => (
                <AccordionItem key={f.q} value={`faq-${i}`} className="border-b" style={{ borderColor: "#E8DCC8" }}>
                  <AccordionTrigger className="py-4 text-left text-[15.5px] font-semibold hover:no-underline" style={{ color: ink }}>
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-[14.5px] leading-relaxed text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-7 text-center text-[14px] text-muted-foreground">
              Still unsure?{" "}
              <a href={waHref} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-4" style={{ color: ink }}>
                Message us on WhatsApp
              </a>{" "}
              — we answer before you buy.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ================================================= FINAL CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: darkBg }} />
        <ZodiacWheel color={`${gold}14`} className="pointer-events-none absolute -left-[15%] -top-[20%] h-[140%] w-auto" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full blur-3xl" style={{ background: glow }} />

        <div className="relative z-10 mx-auto grid w-[92%] max-w-6xl items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1fr_440px] lg:gap-14">
          <div className="text-white">
            <span className="text-[10px] font-bold uppercase sm:text-[11px]" style={{ fontFamily: DISPLAY, color: gold, letterSpacing: "0.26em" }}>
              One payment · instant delivery
            </span>
            <h2 className="mt-4 font-serif font-bold leading-[1.08]" style={{ fontSize: "clamp(1.8rem,4.4vw,2.9rem)", color: "#fff" }}>
              Your chart is already written.
              <span className="block" style={{ color: gold }}>Read it properly.</span>
            </h2>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/70 sm:text-base">
              {c.pages} · computed from your exact birth details · in your inbox in minutes and yours to keep forever.
            </p>

            {/* price block — fills the column that was previously empty */}
            <div className="mt-7 flex flex-wrap items-end gap-x-4 gap-y-1">
              <span className="font-serif text-5xl font-extrabold sm:text-6xl" style={{ color: gold }}>
                {formatINR(c.price)}
              </span>
              <span className="pb-1.5 text-base text-white/45 line-through">{formatINR(c.compareAt)}</span>
              <span className="pb-1.5 text-[13px] font-semibold" style={{ color: gold }}>
                one time
              </span>
            </div>

            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { i: ShieldCheck, t: "Secured by Razorpay" },
                { i: Download, t: "Links that never expire" },
                { i: Mail, t: "Emailed to your inbox" },
                { i: Check, t: "No subscription, ever" },
              ].map((x) => (
                <li key={x.t} className="flex items-center gap-2.5 text-[14px] text-white/85">
                  <x.i className="h-4 w-4 shrink-0" style={{ color: gold }} /> {x.t}
                </li>
              ))}
            </ul>

            {/* small product reminder, desktop only */}
            <div className="mt-9 hidden max-w-[210px] lg:block">
              <ReportPage config={c} />
            </div>
          </div>

          <ReportPurchaseForm config={c} idPrefix="final" />
        </div>
      </section>

      {/* footer */}
      <footer className="px-4 pb-28 pt-9 text-center text-[12.5px] lg:pb-9" style={{ background: "#0C0704", color: "rgba(255,255,255,.6)" }}>
        <img src={LOGO} alt="JyotishNow" className="mx-auto mb-4 h-10 w-auto object-contain opacity-90" />
        <p>{REPORT_CONTACT.phone} · {REPORT_CONTACT.email}</p>
        <p className="mx-auto mt-3 max-w-xl text-[11.5px] leading-relaxed opacity-65">
          Astrological reports are provided for guidance and personal reflection. They are not
          a substitute for professional medical, legal or financial advice.
        </p>
        <p className="mt-4 text-[11.5px] opacity-55">© {new Date().getFullYear()} JyotishNow. All rights reserved.</p>
      </footer>

      {/* sticky mobile bar */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 border-t px-4 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2.5 transition-transform duration-300 lg:hidden ${
          showBar ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ background: `${ink}fa`, borderColor: `${gold}33` }}
      >
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1 leading-tight text-white">
            <div className="truncate text-[13px] font-semibold">{c.name}</div>
            <div className="text-[11px] text-white/60">{c.pages}</div>
          </div>
          <button
            onClick={scrollToForm}
            className="shrink-0 whitespace-nowrap rounded-full px-5 py-3 text-[14px] font-bold shadow-lg"
            style={{ background: gold, color: ink }}
          >
            Get it · {formatINR(c.price)}
          </button>
        </div>
      </div>
    </div>
  );
}
