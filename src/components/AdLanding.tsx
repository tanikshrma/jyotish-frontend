import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Phone, MessageCircle, Check, Star, ShieldCheck, ArrowRight,
  Award, Globe, Users2, Clock3, CalendarDays, CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { BookingModal } from "@/components/BookingModal";
import { formatINR, getPriceInRupees } from "../../shared/pricing";
import { LOGO, DOCTOR_PHOTO, CONTACT, type LandingConfig } from "@/pages/landing/landingConfig";

/* Fade-up as the element scrolls into view */
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const Stars = ({ className = "" }: { className?: string }) => (
  <span className={`inline-flex text-secondary ${className}`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className="w-4 h-4 fill-current" />
    ))}
  </span>
);

const STATS = [
  { icon: Clock3, n: "25+", l: "Years of Experience" },
  { icon: Users2, n: "1L+", l: "Consultations" },
  { icon: Star, n: "4.9★", l: "Client Rating" },
  { icon: Globe, n: "15+", l: "Countries Served" },
];

const STEPS = [
  { n: "1", t: "Pick Your Slot", d: "Choose a date and time that suits you from the live appointment calendar." },
  { n: "2", t: "Confirm & Pay", d: "Share your details and pay securely — your appointment is confirmed instantly." },
  { n: "3", t: "Get Clear Guidance", d: "Talk to Dr. Sandeep and receive honest insights and practical remedies." },
];

export default function AdLanding({ config }: { config: LandingConfig }) {
  const c = config;
  const Badge = c.badgeIcon;

  useEffect(() => { document.title = `${c.theme} · JyotishNow`; }, [c.theme]);

  const priceOf = (variant?: string) =>
    getPriceInRupees(c.pricing.serviceId, variant ?? "default") ?? 0;
  const prices = c.pricing.options.map((o) => priceOf(o.variant));
  const fromPrice = Math.min(...prices);
  const multi = c.pricing.options.length > 1;

  const waHref = `https://wa.me/${CONTACT.phoneDigits}?text=${encodeURIComponent(`Hi, I'd like to book a ${c.theme} consultation.`)}`;
  const scrollToCharges = () => document.getElementById("charges")?.scrollIntoView({ behavior: "smooth", block: "center" });

  return (
    <div className="font-sans text-foreground bg-[#FFF9F0] min-h-screen">
      {/* announcement */}
      <div className="bg-[#5A0606] text-white text-center text-[13px] py-2 px-4">
        <span className="opacity-90">Book a consultation with </span>
        <b className="text-secondary">Dr. Sandeep Sawhney</b>
        <span className="opacity-90"> · 25+ Years · 1,00,000+ Consultations</span>
      </div>

      {/* header — dark so the gold logo reads clearly */}
      <header className="sticky top-0 z-40 bg-primary/95 backdrop-blur-md border-b border-secondary/20 shadow-sm">
        <div className="mx-auto w-[92%] max-w-6xl flex items-center justify-between py-2.5">
          <img src={LOGO} alt="JyotishNow — Dr. Sandeep Sawhney" className="h-12 lg:h-16 w-auto object-contain drop-shadow" />
          <a href={`tel:${CONTACT.phoneDigits}`} className="hidden sm:inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-[#5A0606] text-sm font-bold hover:brightness-105 transition shadow">
            <Phone className="w-4 h-4" /> {CONTACT.phone}
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#5A0606] to-[#3d0404]" />
        <img src={c.heroImage} alt="" aria-hidden className="absolute right-0 top-0 h-full w-[45%] object-cover opacity-30 hidden lg:block" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#5A0606] via-primary/85 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,.06)_1px,transparent_1.4px)] [background-size:26px_26px] opacity-40" />
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full border border-secondary/20" />
        <div aria-hidden className="pointer-events-none absolute right-10 top-24 h-64 w-64 rounded-full border border-secondary/10" />

        <div className="relative z-10 mx-auto w-[92%] max-w-6xl grid lg:grid-cols-[1.1fr_.9fr] gap-8 lg:gap-12 items-center py-12 lg:py-16">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }}
              className="inline-flex items-center gap-2 rounded-full bg-secondary/15 border border-secondary/40 text-secondary px-4 py-1.5 text-[13px] font-semibold mb-5">
              <Badge className="w-4 h-4" /> {c.badge}
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6, delay: .05 }}
              className="font-serif font-extrabold leading-[1.08] text-4xl md:text-5xl mb-4 text-white [text-shadow:0_2px_18px_rgba(0,0,0,.35)]">
              <span className="text-white">{c.h1a}</span><br /><span className="text-secondary">{c.h1b}</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .6, delay: .15 }}
              className="text-white/85 text-[17px] max-w-xl mb-6">{c.heroSub}</motion.p>
            <ul className="grid gap-2.5 mb-6">
              {c.heroBullets.map((b, i) => (
                <motion.li key={i}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .5, delay: .2 + i * .08 }}
                  className="flex items-start gap-2.5 font-medium">
                  <span className="mt-0.5 grid place-items-center h-5 w-5 rounded-full bg-secondary text-primary flex-none"><Check className="w-3.5 h-3.5" strokeWidth={3} /></span>
                  <span>{b}</span>
                </motion.li>
              ))}
            </ul>
            <div className="flex items-center gap-3 text-white/90 text-sm">
              <Stars /> <span><b>4.9/5</b> from 3,200+ happy clients</span>
            </div>
          </div>

          {/* BOOKING CARD */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6, delay: .1 }}
            className="bg-white text-foreground rounded-3xl p-6 shadow-[0_30px_60px_-25px_rgba(122,8,8,.55)] border border-white/60">
            <h2 className="font-serif text-2xl text-primary leading-tight">{c.formTitle}</h2>
            <p className="text-sm text-muted-foreground mt-1 mb-5">{c.formSub}</p>

            <div className="rounded-2xl border border-secondary/40 bg-secondary/10 px-5 py-4 mb-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Consultation Charges</p>
              <p className="font-serif text-3xl font-extrabold text-primary leading-tight mt-0.5">
                {multi && <span className="text-base font-sans font-semibold text-muted-foreground mr-1">from</span>}
                {formatINR(fromPrice)}
              </p>
              {multi && (
                <p className="text-xs text-muted-foreground mt-1">
                  {c.pricing.options.map((o, i) => (
                    <span key={o.label}>{i > 0 && " · "}{o.label}: <b className="text-foreground">{formatINR(priceOf(o.variant))}</b></span>
                  ))}
                </p>
              )}
            </div>

            <BookingModal defaultService={c.pricing.serviceId}>
              <Button className="w-full h-auto py-3.5 rounded-xl text-base font-bold text-white bg-gradient-to-b from-primary to-[#5A0606] hover:from-[#5A0606] hover:to-[#3d0404] shadow-lg">
                {c.cta} <CalendarDays className="w-4 h-4" />
              </Button>
            </BookingModal>

            <ul className="mt-4 space-y-2 text-[13px] text-muted-foreground">
              <li className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-primary" /> Pick your slot from the live calendar</li>
              <li className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary" /> Secure payment · instant confirmation</li>
              <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> 100% private. We never share your details.</li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <div className="bg-white border-b border-[#eadfce]">
        <div className="mx-auto w-[92%] max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-6 py-7 text-center">
          {STATS.map((s) => (
            <div key={s.l} className="flex flex-col items-center">
              <s.icon className="w-5 h-5 text-secondary mb-1.5" />
              <div className="font-serif text-2xl font-extrabold text-primary">{s.n}</div>
              <div className="text-xs text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* BENEFITS */}
      <section className="py-16">
        <div className="mx-auto w-[92%] max-w-6xl">
          <Reveal className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-bold uppercase tracking-[.14em]" style={{ color: c.accent }}>{c.theme}</p>
            <h2 className="font-serif text-3xl md:text-4xl mt-2 text-foreground">{c.benefitsTitle}</h2>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {c.benefits.map((b, i) => (
              <Reveal key={b.title} delay={i * 0.08}>
                <div className="h-full bg-white rounded-2xl border border-[#eadfce] p-6 transition hover:-translate-y-1 hover:shadow-[0_24px_45px_-24px_rgba(122,8,8,.45)]">
                  <div className="grid place-items-center h-12 w-12 rounded-xl bg-secondary/20 text-primary mb-4"><b.icon className="w-6 h-6" /></div>
                  <h3 className="font-serif text-lg mb-1.5">{b.title}</h3>
                  <p className="text-sm text-muted-foreground">{b.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CONSULTATION CHARGES */}
      <section id="charges" className="py-16 bg-secondary/10">
        <div className="mx-auto w-[92%] max-w-5xl">
          <Reveal className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-bold uppercase tracking-[.14em]" style={{ color: c.accent }}>Transparent Pricing</p>
            <h2 className="font-serif text-3xl md:text-4xl mt-2">Consultation Charges</h2>
            <p className="text-muted-foreground mt-3">Choose your slot from the live calendar and confirm your appointment — every session is one-on-one with our expert.</p>
          </Reveal>

          <div className={`grid gap-6 ${multi ? "md:grid-cols-2" : "max-w-md mx-auto"}`}>
            {c.pricing.options.map((o, i) => (
              <Reveal key={o.label} delay={i * 0.08}>
                <div className="h-full bg-white rounded-2xl border border-[#eadfce] p-7 flex flex-col shadow-sm">
                  <h3 className="font-serif text-2xl text-[#1a1a1a] mb-1">{o.label}</h3>
                  {o.note && <p className="text-sm text-muted-foreground mb-4">{o.note}</p>}
                  <div className="font-serif text-4xl font-extrabold text-primary mb-1">{formatINR(priceOf(o.variant))}</div>
                  <p className="text-xs text-muted-foreground mb-6">One-on-one consultation with Dr. Sandeep Sawhney</p>
                  <ul className="space-y-2 text-sm text-foreground/80 mb-6 flex-grow">
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 flex-none" /> Personalised chart analysis</li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 flex-none" /> Practical, easy-to-follow remedies</li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 flex-none" /> Book your preferred date &amp; time</li>
                  </ul>
                  <BookingModal defaultService={c.pricing.serviceId} consultationVariant={o.variant}>
                    <Button className="w-full h-auto py-3.5 rounded-xl text-base font-bold text-white bg-gradient-to-b from-primary to-[#5A0606] hover:from-[#5A0606] hover:to-[#3d0404] shadow-lg">
                      Book Appointment <CalendarDays className="w-4 h-4" />
                    </Button>
                  </BookingModal>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="py-16">
        <div className="mx-auto w-[92%] max-w-6xl">
          <Reveal className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-[.14em] text-primary/70">Simple Process</p>
            <h2 className="font-serif text-3xl md:text-4xl mt-2">How It Works</h2>
          </Reveal>
          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.1} className="text-center">
                <div className="mx-auto grid place-items-center h-14 w-14 rounded-full bg-primary text-white font-serif text-xl font-extrabold mb-4">{s.n}</div>
                <h3 className="font-serif text-lg mb-1">{s.t}</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">{s.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 bg-white">
        <div className="mx-auto w-[92%] max-w-6xl">
          <Reveal className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-[.14em]" style={{ color: c.accent }}>Real Stories</p>
            <h2 className="font-serif text-3xl md:text-4xl mt-2">What Our Clients Say</h2>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-2">
            {c.testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.08}>
                <figure className="h-full bg-[#FFF9F0] rounded-2xl border border-[#eadfce] p-6">
                  <Stars className="mb-3" />
                  <blockquote className="text-[15px] italic text-foreground/80 mb-4">“{t.quote}”</blockquote>
                  <figcaption className="flex items-center gap-3">
                    <span className="grid place-items-center h-10 w-10 rounded-full bg-primary/10 text-primary font-bold">{t.name[0]}</span>
                    <span><strong className="block text-primary text-sm">{t.name}</strong><span className="text-xs text-muted-foreground">{t.place}</span></span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="py-16 bg-primary text-white">
        <div className="mx-auto w-[92%] max-w-6xl grid md:grid-cols-[auto_1fr] gap-8 items-center">
          <Reveal className="mx-auto">
            <div className="h-40 w-40 rounded-full overflow-hidden border-4 border-secondary shadow-2xl bg-white">
              <img src={DOCTOR_PHOTO} alt="Dr. Sandeep Sawhney" className="h-full w-full object-cover object-top" />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-serif text-3xl text-white">Dr. Sandeep Sawhney</h2>
            <p className="text-white/85 mt-2 max-w-2xl">One of India's most trusted Vedic astrologers, with over 25 years of experience guiding people across the world. Known for honest, practical and result-oriented guidance rooted in authentic Jyotish — with remedies that actually fit modern life.</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm">
              <span className="flex items-center gap-2"><Award className="w-4 h-4 text-secondary" /> <b className="text-secondary">25+</b> Years</span>
              <span className="flex items-center gap-2"><Users2 className="w-4 h-4 text-secondary" /> <b className="text-secondary">1,00,000+</b> Consultations</span>
              <span className="flex items-center gap-2"><Star className="w-4 h-4 text-secondary fill-current" /> <b className="text-secondary">4.9</b> Rating</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="mx-auto w-[92%] max-w-3xl">
          <Reveal className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-[.14em]" style={{ color: c.accent }}>Good to Know</p>
            <h2 className="font-serif text-3xl md:text-4xl mt-2">Frequently Asked</h2>
          </Reveal>
          <Reveal>
            <Accordion type="single" collapsible className="space-y-3">
              {c.faqs.map((f, i) => (
                <AccordionItem key={i} value={`i${i}`} className="bg-white rounded-xl border border-[#eadfce] px-5">
                  <AccordionTrigger className="text-left font-semibold hover:no-underline">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 bg-gradient-to-br from-primary to-[#5A0606] text-white text-center">
        <div className="mx-auto w-[92%] max-w-3xl">
          <Reveal>
            <h2 className="font-serif text-3xl md:text-4xl text-white">Your Answers Are Just One Session Away</h2>
            <p className="text-white/85 mt-3 mb-6 max-w-xl mx-auto">Book your consultation with Dr. Sandeep Sawhney — pick a slot from the calendar and get clarity.</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <BookingModal defaultService={c.pricing.serviceId}>
                <Button className="h-auto py-3.5 px-8 rounded-full text-base font-bold bg-secondary text-[#5A0606] hover:bg-secondary hover:brightness-105 shadow-lg">
                  {c.cta} <CalendarDays className="w-4 h-4" />
                </Button>
              </BookingModal>
              <Button onClick={scrollToCharges} variant="outline" className="h-auto py-3.5 px-8 rounded-full text-base font-bold bg-transparent border-2 border-secondary/60 text-secondary hover:bg-secondary hover:text-[#5A0606]">
                View Charges <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#2a0808] text-white/70 text-center py-8">
        <div className="mx-auto w-[92%] max-w-6xl">
          <img src={LOGO} alt="JyotishNow" className="h-12 w-auto object-contain mx-auto mb-3 brightness-0 invert opacity-90" />
          <p className="text-sm">
            <a href={`tel:${CONTACT.phoneDigits}`} className="text-secondary">{CONTACT.phone}</a>
            <span className="mx-2 opacity-40">·</span>
            <a href={`mailto:${CONTACT.email}`} className="text-secondary">{CONTACT.email}</a>
          </p>
          <p className="text-[11px] text-white/40 mt-3 max-w-2xl mx-auto">Astrological guidance is for awareness and self-improvement and is not a substitute for professional medical, legal or financial advice. © JyotishNow. All rights reserved.</p>
        </div>
      </footer>

      {/* STICKY MOBILE BAR */}
      <div className="fixed bottom-0 inset-x-0 z-50 grid grid-cols-2 gap-2 p-2.5 bg-white border-t border-[#eadfce] shadow-[0_-8px_24px_rgba(0,0,0,.08)] md:hidden">
        <BookingModal defaultService={c.pricing.serviceId}>
          <button className="flex items-center justify-center gap-2 h-12 w-full rounded-xl bg-primary text-white font-bold"><CalendarDays className="w-4 h-4" /> Book Now</button>
        </BookingModal>
        <a href={waHref} target="_blank" rel="noopener" className="flex items-center justify-center gap-2 h-12 rounded-xl bg-[#25D366] text-white font-bold"><MessageCircle className="w-4 h-4" /> WhatsApp</a>
      </div>
      <div className="h-16 md:hidden" />
    </div>
  );
}
