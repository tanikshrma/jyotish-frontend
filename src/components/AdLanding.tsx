import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Phone, MessageCircle, Check, Star, Sparkles, ShieldCheck, ArrowRight,
  Loader2, PartyPopper, Award, Globe, Users2, Clock3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PIQ_FIELDS } from "../../shared/prospectiq-schema";
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
  { n: "1", t: "Share Your Details", d: "Fill the short form with your name, number and concern — it takes 30 seconds." },
  { n: "2", t: "Talk to an Expert", d: "Our team calls you to understand your situation and Dr. Sandeep studies your chart." },
  { n: "3", t: "Get Clear Guidance", d: "Receive honest insights and practical remedies you can start applying right away." },
];

function leadSourceFromUrl(): string {
  const qs = new URLSearchParams(window.location.search);
  const s = (qs.get("utm_source") || "").toLowerCase();
  if (qs.get("gclid") || s.includes("google")) return "Google Ad";
  if (qs.get("fbclid") || s.includes("fb") || s.includes("meta") || s.includes("insta")) return "Meta Ad";
  return "Meta Ad";
}
function utmTags(): string[] {
  const qs = new URLSearchParams(window.location.search);
  return ["utm_source", "utm_medium", "utm_campaign"]
    .map((k) => { const v = qs.get(k); return v ? `${k.replace("utm_", "")}:${v}` : null; })
    .filter(Boolean) as string[];
}

export default function AdLanding({ config }: { config: LandingConfig }) {
  const c = config;
  const Badge = c.badgeIcon;
  const [form, setForm] = useState({ name: "", phone: "", email: "", concern: "" });
  const [errors, setErrors] = useState<{ name?: string; phone?: string; email?: string; concern?: string }>({});
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => { document.title = `${c.theme} · JyotishNow`; }, [c.theme]);

  const scrollToForm = () => document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth", block: "center" });

  const validate = () => {
    const e: typeof errors = {};
    const name = form.name.trim();
    const phone = form.phone.replace(/\D/g, "");
    const email = form.email.trim();
    if (!name) e.name = "Please enter your name.";
    else if (name.length < 2) e.name = "That name looks too short.";
    else if (!/[a-zA-Zऀ-ॿ]/.test(name)) e.name = "Please enter a valid name.";
    if (!phone) e.phone = "Phone number is required.";
    else if (!/^[6-9]\d{9}$/.test(phone)) e.phone = "Enter a valid 10-digit Indian mobile number.";
    if (!email) e.email = "Email is required.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) e.email = "Enter a valid email address.";
    if (!form.concern) e.concern = "Please select an option.";
    return e;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    const phone = form.phone.replace(/\D/g, "");
    const parts = form.name.trim().split(/\s+/);
    setLoading(true);
    try {
      const res = await fetch("/api/prospectiq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert-contact",
          firstName: parts[0],
          lastName: parts.slice(1).join(" "),
          name: form.name.trim(),
          email: form.email.trim(),
          phone: "+91" + phone,
          source: `${c.theme} Landing Page`,
          tags: [`${c.theme} Ad Lead`, "Landing Page", "Website Lead", ...utmTags()],
          customFields: [
            { id: PIQ_FIELDS.serviceInterest, value: c.serviceInterest },
            { id: PIQ_FIELDS.primaryConcern, value: c.primaryConcern },
            { id: PIQ_FIELDS.leadSource, value: leadSourceFromUrl() },
            { id: PIQ_FIELDS.guidanceWanted, value: form.concern },
          ],
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.success || data.contact)) {
        setForm({ name: "", phone: "", email: "", concern: "" });
        setDone(true);
        // fire ad-pixel conversion events if present
        (window as any).gtag?.("event", "generate_lead", { value: c.theme });
        (window as any).fbq?.("track", "Lead");
      } else {
        throw new Error("bad response");
      }
    } catch {
      setErr("Something went wrong. Please call us or tap WhatsApp — we don't want to miss you.");
    } finally {
      setLoading(false);
    }
  };

  const waHref = `https://wa.me/${CONTACT.phoneDigits}?text=${encodeURIComponent(`Hi, I'd like a free ${c.theme} consultation.`)}`;

  const set = (patch: Partial<typeof form>, clear?: keyof typeof errors) => {
    setForm((f) => ({ ...f, ...patch }));
    if (clear) setErrors((e) => ({ ...e, [clear]: undefined }));
  };
  const fieldCls = (hasErr?: string) =>
    `w-full h-12 rounded-xl border bg-white px-4 text-[15px] text-foreground outline-none transition focus:ring-2 ${
      hasErr ? "border-red-400 focus:border-red-500 focus:ring-red-500/15" : "border-border focus:border-primary focus:ring-primary/15"
    }`;
  const errText = (m?: string) => (m ? <p className="mt-1 text-[12px] text-red-600">{m}</p> : null);

  return (
    <div className="font-sans text-foreground bg-[#FFF9F0] min-h-screen">
      {/* announcement */}
      <div className="bg-[#5A0606] text-white text-center text-[13px] py-2 px-4">
        <span className="opacity-90">Free Consultation Today · </span>
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

          {/* LEAD FORM */}
          <motion.div
            id="lead-form"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6, delay: .1 }}
            className="bg-white text-foreground rounded-3xl p-6 shadow-[0_30px_60px_-25px_rgba(122,8,8,.55)] border border-white/60">
            <h2 className="font-serif text-2xl text-primary leading-tight">{c.formTitle}</h2>
            <p className="text-sm text-muted-foreground mt-1 mb-4">{c.formSub}</p>
            {err && <div className="mb-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">{err}</div>}
            <form onSubmit={submit} className="space-y-3" noValidate>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">Full Name</label>
                <input className={fieldCls(errors.name)} placeholder="Your name" autoComplete="name" aria-invalid={!!errors.name}
                  value={form.name} onChange={(e) => set({ name: e.target.value }, "name")} />
                {errText(errors.name)}
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">Phone / WhatsApp</label>
                <div className="flex gap-2">
                  <span className={`grid place-items-center w-16 flex-none rounded-xl border font-semibold bg-[#FFF9F0] ${errors.phone ? "border-red-400" : "border-border"}`}>+91</span>
                  <input className={fieldCls(errors.phone)} type="tel" inputMode="numeric" maxLength={10} placeholder="10-digit number" autoComplete="tel" aria-invalid={!!errors.phone}
                    value={form.phone} onChange={(e) => set({ phone: e.target.value.replace(/\D/g, "").slice(0, 10) }, "phone")} />
                </div>
                {errText(errors.phone)}
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">Email Address</label>
                <input className={fieldCls(errors.email)} type="email" placeholder="you@example.com" autoComplete="email" aria-invalid={!!errors.email}
                  value={form.email} onChange={(e) => set({ email: e.target.value }, "email")} />
                {errText(errors.email)}
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">{c.concernLabel}</label>
                <select className={`${fieldCls(errors.concern)} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 fill=%22none%22 stroke=%22%237A0808%22 stroke-width=%222%22><path d=%22m4 6 4 4 4-4%22/></svg>')] bg-no-repeat bg-[right_1rem_center] ${form.concern ? "" : "text-muted-foreground"}`}
                  value={form.concern} onChange={(e) => set({ concern: e.target.value }, "concern")}>
                  <option value="" disabled>Select one…</option>
                  {c.concerns.map((x) => <option key={x} value={x} className="text-foreground">{x}</option>)}
                </select>
                {errText(errors.concern)}
              </div>
              <Button type="submit" disabled={loading}
                className="w-full h-auto py-3.5 rounded-xl text-base font-bold text-white bg-gradient-to-b from-primary to-[#5A0606] hover:from-[#5A0606] hover:to-[#3d0404] shadow-lg">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending…</> : <>{c.cta} <Sparkles className="w-4 h-4" /></>}
              </Button>
              <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" /> 100% private. We never share your details.
              </p>
            </form>
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

      {/* STEPS */}
      <section className="py-16 bg-secondary/15">
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
      <section className="py-16">
        <div className="mx-auto w-[92%] max-w-6xl">
          <Reveal className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-[.14em]" style={{ color: c.accent }}>Real Stories</p>
            <h2 className="font-serif text-3xl md:text-4xl mt-2">What Our Clients Say</h2>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-2">
            {c.testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.08}>
                <figure className="h-full bg-white rounded-2xl border border-[#eadfce] p-6">
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
            <h2 className="font-serif text-3xl md:text-4xl text-white">Your Answers Are Just One Call Away</h2>
            <p className="text-white/85 mt-3 mb-6 max-w-xl mx-auto">Don't stay stuck in doubt. Book your free consultation with Dr. Sandeep Sawhney today.</p>
            <Button onClick={scrollToForm} className="h-auto py-3.5 px-8 rounded-full text-base font-bold bg-secondary text-[#5A0606] hover:bg-secondary hover:brightness-105 shadow-lg">
              {c.cta} <ArrowRight className="w-4 h-4" />
            </Button>
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
        <a href={`tel:${CONTACT.phoneDigits}`} className="flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-white font-bold"><Phone className="w-4 h-4" /> Call Now</a>
        <a href={waHref} target="_blank" rel="noopener" className="flex items-center justify-center gap-2 h-12 rounded-xl bg-[#25D366] text-white font-bold"><MessageCircle className="w-4 h-4" /> WhatsApp</a>
      </div>
      <div className="h-16 md:hidden" />

      {/* THANK YOU */}
      <Dialog open={done} onOpenChange={setDone}>
        <DialogContent className="max-w-sm text-center rounded-3xl">
          <div className="mx-auto grid place-items-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-2"><PartyPopper className="w-8 h-8" /></div>
          <h3 className="font-serif text-2xl text-primary">Thank You!</h3>
          <p className="text-muted-foreground">Your request has been received. Our team will call you shortly. For faster help, message us on WhatsApp now.</p>
          <a href={waHref} target="_blank" rel="noopener" className="inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-[#25D366] text-white font-bold mt-1">
            <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
          </a>
        </DialogContent>
      </Dialog>
    </div>
  );
}
