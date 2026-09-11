import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Check, Star, Phone, ShieldCheck, Clock3, Users2, Globe, ArrowDown,
  FileText, Mail, CreditCard, Sparkles, Quote,
} from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { ReportPurchaseForm } from "@/components/ReportPurchaseForm";
import {
  REPORT_CONTACT, LOGO, PREMIUM_SECTION_LIST, type ReportLandingConfig,
} from "@/pages/landing/reportLandingConfig";
import { formatINR } from "../../shared/pricing";

/* ---------------------------------------------------------------- motion */

function Reveal({
  children, delay = 0, className = "",
}: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
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
      <Star key={i} className="h-4 w-4 fill-current" />
    ))}
  </span>
);

/* ------------------------------------------------ north indian chart svg */

/** A north-Indian kundli diamond, drawn rather than loaded — keeps the page
 *  asset-free and crisp at any size. Decorative only. */
function KundliChart({ stroke, className = "" }: { stroke: string; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden focusable="false">
      <g fill="none" stroke={stroke} strokeWidth="1" vectorEffect="non-scaling-stroke">
        <rect x="1" y="1" width="98" height="98" />
        <path d="M1 1 L99 99 M99 1 L1 99" />
        <path d="M50 1 L1 50 L50 99 L99 50 Z" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------- report mockup */

/** A fanned stack of report pages, composed in CSS — the "show the product"
 *  hero visual. Purely decorative, hidden from assistive tech. */
function ReportMockup({ config }: { config: ReportLandingConfig }) {
  const { ink, gold } = config.theme;
  const pages = config.pdfCount > 1 ? [2, 1, 0] : [1, 0];

  return (
    <div aria-hidden className="relative mx-auto w-full max-w-[320px] sm:max-w-[380px]">
      <div className="relative aspect-[3/4]">
        {pages.map((i) => {
          const isTop = i === 0;
          return (
            <div
              key={i}
              className="absolute inset-0 overflow-hidden rounded-lg border shadow-2xl"
              style={{
                background: isTop ? "#FFFCF6" : "#F4EDE1",
                borderColor: `${gold}66`,
                transform: `translate(${i * 5.5}%, ${i * -3.5}%) rotate(${i * 3.2}deg)`,
                zIndex: 10 - i,
                opacity: isTop ? 1 : 0.96,
              }}
            >
              {isTop && (
                <div className="flex h-full flex-col p-[7%]">
                  {/* masthead */}
                  <div className="flex items-center justify-between border-b pb-[4%]" style={{ borderColor: `${gold}88` }}>
                    <span className="font-serif text-[clamp(9px,2.6vw,13px)] font-bold" style={{ color: ink }}>
                      JyotishNow
                    </span>
                    <span className="text-[clamp(5px,1.5vw,7px)] font-semibold uppercase tracking-[0.18em]" style={{ color: `${ink}99` }}>
                      {config.name}
                    </span>
                  </div>

                  {/* chart + legend */}
                  <div className="mt-[5%] flex gap-[5%]">
                    <KundliChart stroke={`${ink}cc`} className="h-auto w-[46%]" />
                    <div className="flex-1 space-y-[7%] pt-[2%]">
                      {[92, 78, 86, 64, 88, 72].map((w, k) => (
                        <div key={k} className="h-[5px] rounded-full sm:h-[6px]" style={{ width: `${w}%`, background: k % 3 === 0 ? `${gold}` : `${ink}22` }} />
                      ))}
                    </div>
                  </div>

                  {/* section heading */}
                  <div className="mt-[7%] h-[7px] w-[52%] rounded-full sm:h-[9px]" style={{ background: `${ink}bb` }} />

                  {/* body lines */}
                  <div className="mt-[5%] flex-1 space-y-[3.4%]">
                    {[100, 96, 99, 90, 97, 84, 100, 93, 88, 96, 70].map((w, k) => (
                      <div key={k} className="h-[3.5px] rounded-full sm:h-[4px]" style={{ width: `${w}%`, background: `${ink}1a` }} />
                    ))}
                  </div>

                  {/* dasha strip */}
                  <div className="mt-[4%] grid grid-cols-4 gap-[3%]">
                    {[0, 1, 2, 3].map((k) => (
                      <div key={k} className="rounded-[3px] px-[6%] py-[9%]" style={{ background: k === 1 ? `${gold}55` : `${ink}0f` }}>
                        <div className="h-[3px] w-full rounded-full" style={{ background: `${ink}44` }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* page-count badge */}
      <div
        className="absolute -bottom-3 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-2 text-[12px] font-bold shadow-xl sm:text-[13px]"
        style={{ background: gold, color: ink }}
      >
        {config.pages}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- the page */

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

  /* Sticky mobile bar appears once the hero form has scrolled past. */
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

  /* Keep the floating WhatsApp widget from sitting under the sticky buy bar. */
  useEffect(() => {
    document.body.classList.toggle("report-buybar-open", showBar);
    return () => document.body.classList.remove("report-buybar-open");
  }, [showBar]);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const waHref = `https://wa.me/${REPORT_CONTACT.phoneDigits}?text=${encodeURIComponent(
    `Hi, I have a question about the ${c.name} (${formatINR(c.price)}).`,
  )}`;

  /* The bundle page shows the prediction sections first, then the full
     Premium list underneath — it genuinely includes both reports. */
  const showsPremiumList = c.variant === "complete";

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FFFCF7] font-sans text-foreground">
      {/* ------------------------------------------------ announcement */}
      <div className="px-4 py-2 text-center text-[12px] sm:text-[13px]" style={{ background: ink, color: "#fff" }}>
        <span className="opacity-85">Trusted guidance from </span>
        <b style={{ color: gold }}>Dr. Sandeep Sawhney</b>
        <span className="hidden opacity-85 sm:inline"> · 25+ years · 1,00,000+ consultations</span>
      </div>

      {/* ----------------------------------------------------- header */}
      <header className="sticky top-0 z-40 border-b backdrop-blur-md" style={{ background: `${ink}f2`, borderColor: `${gold}33` }}>
        <div className="mx-auto flex w-[92%] max-w-6xl items-center justify-between gap-3 py-2.5">
          <img src={LOGO} alt="JyotishNow" className="h-10 w-auto object-contain sm:h-12" />
          <div className="flex items-center gap-2">
            <a
              href={`tel:${REPORT_CONTACT.phoneDigits}`}
              className="hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-bold sm:inline-flex"
              style={{ background: `${gold}1f`, color: gold }}
            >
              <Phone className="h-4 w-4" /> {REPORT_CONTACT.phone}
            </a>
            <button
              onClick={scrollToForm}
              className="rounded-full px-4 py-2 text-[13px] font-bold shadow sm:text-sm"
              style={{ background: gold, color: ink }}
            >
              Get it · {formatINR(c.price)}
            </button>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------- hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(150deg, ${inkSoft} 0%, ${ink} 55%, #000 160%)` }} />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `radial-gradient(circle, ${gold}40 1px, transparent 1.4px)`,
            backgroundSize: "28px 28px",
          }}
        />
        <div className="pointer-events-none absolute -right-32 -top-40 h-[28rem] w-[28rem] rounded-full blur-3xl" style={{ background: glow }} />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full blur-3xl" style={{ background: glow }} />

        <div className="relative z-10 mx-auto grid w-[92%] max-w-6xl items-start gap-10 py-10 sm:py-14 lg:grid-cols-[1.02fr_.98fr] lg:gap-12 lg:py-16">
          {/* pitch */}
          <div className="text-white">
            <motion.span
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12px] font-semibold sm:text-[13px]"
              style={{ borderColor: `${gold}66`, background: `${gold}1a`, color: gold }}
            >
              <Sparkles className="h-3.5 w-3.5" /> {c.eyebrow}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}
              className="mt-5 font-serif font-extrabold leading-[1.06] tracking-tight"
              /* index.css forces text-primary onto every heading — override it
                 inline, or the first line renders maroon on maroon. */
              style={{ fontSize: "clamp(2rem,6.2vw,3.35rem)", color: "#fff", textWrap: "balance" }}
            >
              <span className="block">{c.h1a}</span>
              <span className="block" style={{ color: gold }}>{c.h1b}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/80 sm:text-[17px]"
            >
              {c.sub}
            </motion.p>

            <div className="mt-6 flex flex-wrap gap-2">
              {c.heroChips.map((chip) => (
                <span
                  key={chip}
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold sm:text-[13px]"
                  style={{ borderColor: `${gold}44`, background: "rgba(255,255,255,.06)", color: "#fff" }}
                >
                  <Check className="h-3.5 w-3.5" style={{ color: gold }} strokeWidth={3} /> {chip}
                </span>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-white/85">
              <Stars color={gold} />
              <span><b>4.9/5</b> from 3,200+ readers</span>
            </div>

            {/* mockup sits under the pitch on desktop, above the form on mobile */}
            <div className="mt-10 hidden lg:block">
              <ReportMockup config={c} />
            </div>
          </div>

          {/* form */}
          <div className="lg:sticky lg:top-24">
            <div className="mb-8 lg:hidden">
              <ReportMockup config={c} />
            </div>
            <div ref={formRef} className="scroll-mt-24">
              <ReportPurchaseForm config={c} idPrefix="hero" />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ stats */}
      <div className="border-b bg-white" style={{ borderColor: "#EFE6D8" }}>
        <div className="mx-auto grid w-[92%] max-w-6xl grid-cols-2 gap-5 py-7 text-center md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.l} className="flex flex-col items-center">
              <s.icon className="mb-1.5 h-5 w-5" style={{ color: gold }} />
              <div className="font-serif text-xl font-extrabold sm:text-2xl" style={{ color: ink }}>{s.n}</div>
              <div className="text-[11px] text-muted-foreground sm:text-xs">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------------------------------------------- answers */}
      <section className="mx-auto w-[92%] max-w-5xl py-14 sm:py-20">
        <Reveal>
          <h2 className="text-center font-serif font-bold leading-tight" style={{ fontSize: "clamp(1.6rem,4.2vw,2.5rem)", color: ink }}>
            What you'll finally know
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-[15px] text-muted-foreground sm:text-base">
            Most people come to their chart with the same handful of questions. These are the ones this report settles.
          </p>
        </Reveal>

        <div className="mt-9 grid gap-3 sm:mt-11 sm:grid-cols-2">
          {c.answers.map((a, i) => (
            <Reveal key={a} delay={i * 0.05}>
              <div className="flex h-full items-start gap-3 rounded-2xl border bg-white p-4 sm:p-5" style={{ borderColor: "#EFE6D8" }}>
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full" style={{ background: `${gold}33` }}>
                  <Check className="h-3.5 w-3.5" style={{ color: ink }} strokeWidth={3} />
                </span>
                <span className="text-[14px] leading-relaxed text-foreground/85 sm:text-[15px]">{a}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------- sections */}
      <section className="border-y" style={{ background: "#FFF8ED", borderColor: "#EFE6D8" }}>
        <div className="mx-auto w-[92%] max-w-6xl py-14 sm:py-20">
          <Reveal>
            <div className="text-center">
              <span className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: `${ink}aa` }}>
                Inside the report
              </span>
              <h2 className="mt-2 font-serif font-bold leading-tight" style={{ fontSize: "clamp(1.6rem,4.2vw,2.5rem)", color: ink }}>
                {c.sectionsTitle}
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-[15px] text-muted-foreground sm:text-base">
                {c.sectionsSub}
              </p>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {c.sections.map((s, i) => (
              <Reveal key={s.title} delay={(i % 3) * 0.06}>
                <div className="flex h-full flex-col rounded-2xl border bg-white p-5 transition-shadow hover:shadow-lg" style={{ borderColor: "#EFE6D8" }}>
                  <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: `${gold}2e` }}>
                    <s.icon className="h-5 w-5" style={{ color: ink }} />
                  </span>
                  <h3 className="mt-3.5 font-serif text-[17px] font-bold leading-snug" style={{ color: ink }}>{s.title}</h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {showsPremiumList && (
            <div className="mt-14">
              <Reveal>
                <div className="text-center">
                  <span className="text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: `${ink}aa` }}>
                    Report two of two
                  </span>
                  <h3 className="mt-2 font-serif font-bold leading-tight" style={{ fontSize: "clamp(1.35rem,3.4vw,2rem)", color: ink }}>
                    Plus the complete Premium Kundli
                  </h3>
                  <p className="mx-auto mt-2.5 max-w-2xl text-[15px] text-muted-foreground">
                    The full ~60 page chart reading is included in this bundle, in its entirety.
                  </p>
                </div>
              </Reveal>
              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {PREMIUM_SECTION_LIST.map((s, i) => (
                  <Reveal key={s.title} delay={(i % 3) * 0.04}>
                    <div className="flex h-full items-start gap-2.5 rounded-xl border bg-white/70 p-3.5" style={{ borderColor: "#EFE6D8" }}>
                      <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: gold }} strokeWidth={3} />
                      <div>
                        <div className="text-[14px] font-semibold" style={{ color: ink }}>{s.title}</div>
                        <p className="mt-0.5 text-[12.5px] leading-snug text-muted-foreground">{s.desc}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          <Reveal>
            <div className="mt-11 text-center">
              <button
                onClick={scrollToForm}
                className="inline-flex items-center gap-2 rounded-full px-7 py-4 text-[15px] font-bold text-white shadow-xl transition-transform hover:scale-[1.02] sm:text-base"
                style={{ background: ink }}
              >
                {c.cta} · {formatINR(c.price)} <ArrowDown className="h-4 w-4" />
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------- steps */}
      <section className="mx-auto w-[92%] max-w-5xl py-14 sm:py-20">
        <Reveal>
          <h2 className="text-center font-serif font-bold leading-tight" style={{ fontSize: "clamp(1.6rem,4.2vw,2.5rem)", color: ink }}>
            How it works
          </h2>
        </Reveal>
        <div className="mt-9 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.t} delay={i * 0.08}>
              <div className="relative h-full rounded-2xl border bg-white p-5 sm:p-6" style={{ borderColor: "#EFE6D8" }}>
                <span className="absolute right-4 top-3 font-serif text-4xl font-extrabold" style={{ color: `${gold}55` }}>
                  {i + 1}
                </span>
                <s.icon className="h-6 w-6" style={{ color: ink }} />
                <h3 className="mt-3 font-serif text-[17px] font-bold" style={{ color: ink }}>{s.t}</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------- proof */}
      <section className="border-y" style={{ background: "#FFF8ED", borderColor: "#EFE6D8" }}>
        <div className="mx-auto w-[92%] max-w-6xl py-14 sm:py-20">
          <Reveal>
            <h2 className="text-center font-serif font-bold leading-tight" style={{ fontSize: "clamp(1.6rem,4.2vw,2.5rem)", color: ink }}>
              What readers say
            </h2>
          </Reveal>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {c.proof.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.07}>
                <figure className="flex h-full flex-col rounded-2xl border bg-white p-5 sm:p-6" style={{ borderColor: "#EFE6D8" }}>
                  <Quote className="h-6 w-6 shrink-0" style={{ color: `${gold}` }} />
                  <blockquote className="mt-3 flex-1 text-[14px] leading-relaxed text-foreground/85">
                    {p.quote}
                  </blockquote>
                  <figcaption className="mt-4 border-t pt-3.5 text-[13px]" style={{ borderColor: "#EFE6D8" }}>
                    <span className="font-bold" style={{ color: ink }}>{p.name}</span>
                    <span className="text-muted-foreground"> · {p.place}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- faq */}
      <section className="mx-auto w-[92%] max-w-3xl py-14 sm:py-20">
        <Reveal>
          <h2 className="text-center font-serif font-bold leading-tight" style={{ fontSize: "clamp(1.6rem,4.2vw,2.5rem)", color: ink }}>
            Questions, answered
          </h2>
        </Reveal>
        <Reveal delay={0.05}>
          <Accordion type="single" collapsible className="mt-8 space-y-3">
            {c.faqs.map((f, i) => (
              <AccordionItem
                key={f.q}
                value={`faq-${i}`}
                className="overflow-hidden rounded-2xl border bg-white px-4 sm:px-5"
                style={{ borderColor: "#EFE6D8" }}
              >
                <AccordionTrigger className="py-4 text-left text-[15px] font-semibold hover:no-underline" style={{ color: ink }}>
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-[14px] leading-relaxed text-muted-foreground">
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
      </section>

      {/* --------------------------------------------------- final cta */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(150deg, ${inkSoft} 0%, ${ink} 60%, #000 170%)` }} />
        <div
          className="absolute inset-0 opacity-30"
          style={{ backgroundImage: `radial-gradient(circle, ${gold}40 1px, transparent 1.4px)`, backgroundSize: "28px 28px" }}
        />
        <div className="relative z-10 mx-auto grid w-[92%] max-w-5xl items-center gap-10 py-14 sm:py-20 lg:grid-cols-2">
          <div className="text-white">
            <h2 className="font-serif font-extrabold leading-[1.1]" style={{ fontSize: "clamp(1.75rem,4.6vw,2.75rem)", color: "#fff" }}>
              Your chart is already written.
              <span className="block" style={{ color: gold }}>Read it properly.</span>
            </h2>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/80 sm:text-base">
              {c.pages} · computed from your exact birth details · delivered to your inbox in minutes and yours to keep forever.
            </p>
            <ul className="mt-6 space-y-2.5">
              {["One payment. No subscription.", "Download links that never expire.", "Your details are never shared or sold."].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-[14px] text-white/90 sm:text-[15px]">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" style={{ color: gold }} /> {t}
                </li>
              ))}
            </ul>
          </div>
          <ReportPurchaseForm config={c} idPrefix="final" />
        </div>
      </section>

      {/* ------------------------------------------------------ footer */}
      {/* pb clears the sticky mobile buy bar so the last line is never hidden */}
      <footer className="px-4 pb-28 pt-9 text-center text-[12.5px] lg:pb-9" style={{ background: "#120C06", color: "rgba(255,255,255,.66)" }}>
        <img src={LOGO} alt="JyotishNow" className="mx-auto mb-4 h-10 w-auto object-contain opacity-90" />
        <p className="mx-auto max-w-lg leading-relaxed">
          {REPORT_CONTACT.phone} · {REPORT_CONTACT.email}
        </p>
        <p className="mx-auto mt-3 max-w-xl text-[11.5px] leading-relaxed opacity-70">
          Astrological reports are provided for guidance and personal reflection. They are not a
          substitute for professional medical, legal or financial advice.
        </p>
        <p className="mt-4 text-[11.5px] opacity-60">
          © {new Date().getFullYear()} JyotishNow. All rights reserved.
        </p>
      </footer>

      {/* ------------------------------------------- sticky mobile bar */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 border-t px-4 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2.5 transition-transform duration-300 lg:hidden ${
          showBar ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ background: `${ink}fa`, borderColor: `${gold}33` }}
      >
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1 leading-tight text-white">
            <div className="truncate text-[13px] font-semibold">{c.name}</div>
            <div className="text-[11px] text-white/65">{c.pages}</div>
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
