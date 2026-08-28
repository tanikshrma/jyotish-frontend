/**
 * Standalone ad-landing-page generator for JyotishNow.
 *
 * Produces three fully self-contained HTML files (inline CSS + JS, no build
 * step, no external asset dependencies beyond Google Fonts) intended to live on
 * their own subdomains and receive paid-ad traffic:
 *
 *   career.html   → career.jyotishnow.com   (Career & Business astrology)
 *   vastu.html    → vastu.jyotishnow.com     (Vastu consultancy)
 *   marriage.html → marriage.jyotishnow.com  (Matchmaking / marriage)
 *
 * Each page captures a lead into Prospect IQ via the site's /api/prospectiq
 * endpoint (see API_BASE below). Regenerate after edits:  node landing/generate.mjs
 */

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT_DIR = dirname(fileURLToPath(import.meta.url));

// Where the lead-capture API lives. The landing pages post here cross-origin
// (the endpoint sends permissive CORS headers). Change this if the API is
// hosted elsewhere (e.g. https://api.jyotishnow.com).
const API_BASE = "https://jyotishnow.com";

// Prospect IQ custom-field ids (from shared/prospectiq-schema.ts).
const FIELDS = {
  serviceInterest: "xPJtBp6LRTUeRcnl1VkY",
  primaryConcern: "AR7UGqvRnOVzMJdnBSMK",
  leadSource: "Vu3puN76DXCUtpn0NhGk",
  guidanceWanted: "B59ZL1TJWDKsrFP6joxq",
};

const CONTACT = {
  phone: "+91 70155 44187",
  phoneDigits: "917015544187",
  email: "myjyotishnow@gmail.com",
};

// ---- SVG icon set (inline, currentColor) --------------------------------
const ICONS = {
  briefcase: '<path d="M20 7h-4V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Zm-6 0h-4V5h4Z"/>',
  compass: '<circle cx="12" cy="12" r="9"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88" fill="currentColor" stroke="none"/>',
  heart: '<path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/>',
  chart: '<path d="M3 3v18h18"/><path d="m7 14 4-4 3 3 5-6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  shield: '<path d="M12 2 4 5v6c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V5Z"/>',
  home: '<path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5 4 4M20 20l-1-1M19 5l1-1M4 20l1-1"/>',
  ring: '<circle cx="12" cy="14" r="6"/><path d="m9 5 3-3 3 3-1.5 3"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6"/><path d="M16 5.5a3 3 0 0 1 0 5.5M22 20c0-2.7-1.6-4.8-4-5.6"/>',
  spark: '<path d="M12 2 9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5Z"/>',
  phone: '<path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24 11.4 11.4 0 0 0 3.6.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .6 3.6 1 1 0 0 1-.24 1Z"/>',
  whatsapp: '<path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.5A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2s-1.4.2-4.2-1.1a9 9 0 0 1-3.6-3.6c-.3-.5-1-1.6-1-3s.7-2 1-2.3a1 1 0 0 1 .7-.3h.6c.2 0 .4 0 .6.5l.8 1.9c0 .2 0 .4-.1.6l-.4.5c-.2.2-.3.4-.1.7a7 7 0 0 0 3.2 2.8c.3.1.5.1.7-.1l.7-.8c.2-.2.4-.2.6-.1l1.8.9c.3.1.5.2.5.4s0 .9-.2 1.5Z" fill="currentColor" stroke="none"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  star: '<path d="m12 2 3 6.5 7 .9-5 4.9 1.2 7L12 18l-6.4 3.3L7 14.3l-5-4.9 7-.9Z" fill="currentColor" stroke="none"/>',
};
const icon = (name, cls = "") =>
  `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;

const stars = () => `<span class="stars">${icon("star")}${icon("star")}${icon("star")}${icon("star")}${icon("star")}</span>`;

// ---- Per-topic content --------------------------------------------------
const TOPICS = {
  career: {
    file: "career.html",
    accent: "#1F6F8B",
    theme: "Career & Business",
    title: "Career & Business Astrology · JyotishNow",
    metaDesc: "Confused about your career? Get a personalized Vedic career reading from Dr. Sandeep Sawhney — right path, best timing, and remedies to remove growth blockages.",
    badge: "Career & Business Astrology",
    heroIcon: "briefcase",
    h1: ["Stuck in Your Career?", "The Stars Have the Answer."],
    heroSub: "Get a personalized Vedic reading from Dr. Sandeep Sawhney to find the career that truly fits your chart, the right time to switch jobs or start a business, and remedies to break through what's holding you back.",
    heroBullets: ["Discover the right field & role for your chart", "Know the best timing for a job change or new venture", "Remove planetary obstacles blocking your growth"],
    serviceInterest: "Career Guidance",
    primaryConcern: "Career",
    formTitle: "Get Your Free Career Consultation",
    formSub: "Speak with Dr. Sandeep — only a few slots open each day.",
    concernLabel: "What's your main career concern?",
    concerns: ["Job change / new opportunity", "Business growth & expansion", "Promotion / feeling stuck", "Career direction & confusion", "Foreign job / relocation", "Something else"],
    cta: "Book My Free Consultation",
    benefitsTitle: "What Your Career Reading Reveals",
    benefits: [
      ["chart", "Your Ideal Career Path", "The fields, roles and industries your birth chart is naturally wired to succeed in."],
      ["clock", "Right Timing", "Favourable windows (dashas & transits) for a job switch, promotion, or launching a business."],
      ["shield", "Obstacle Remedies", "Simple, practical remedies to clear the planetary blocks stalling your growth."],
      ["spark", "Wealth & Growth Yogas", "The money-and-success combinations in your chart — and how to activate them."],
    ],
    testimonials: [
      ["After 2 years stuck in the same role, Dr. Sandeep's timing advice helped me switch — I got a 40% hike within 3 months.", "Rahul M.", "Software Engineer, Bangalore"],
      ["He told me exactly when to start my business. I waited for the window he gave and it's been profitable from month one.", "Priya S.", "Entrepreneur, Pune"],
    ],
    faqs: [
      ["What do I need to share?", "Just your date, time and place of birth — and your main career question. Nothing else."],
      ["Is the first consultation really free?", "Yes. Fill the form and our team calls you to understand your situation and give initial guidance at no cost."],
      ["How soon will I be contacted?", "Usually within a few working hours. For anything urgent, message us on WhatsApp."],
    ],
  },
  vastu: {
    file: "vastu.html",
    accent: "#B8860B",
    theme: "Vastu Consultancy",
    title: "Vastu Consultancy · JyotishNow",
    metaDesc: "Facing money, health or peace problems at home or work? Get a scientific Vastu consultation from Dr. Sandeep Sawhney — no demolition, practical remedies for prosperity.",
    badge: "Expert Vastu Consultancy",
    heroIcon: "compass",
    h1: ["Bad Luck at Home?", "It May Be Your Vastu."],
    heroSub: "Persistent money loss, health issues, tension or stalled growth are often caused by Vastu doshas in your home or workplace. Get a scientific, non-destructive Vastu analysis from Dr. Sandeep Sawhney — with remedies you can actually apply.",
    heroBullets: ["Pinpoint the exact Vastu doshas draining your space", "Practical remedies — no breaking or demolition", "Invite wealth, health & harmony back in"],
    serviceInterest: "Vastu Consultancy",
    primaryConcern: "Property/Vastu",
    formTitle: "Get Your Free Vastu Consultation",
    formSub: "Talk to our Vastu expert — limited slots each day.",
    concernLabel: "What's troubling your space?",
    concerns: ["Financial loss / money not staying", "Health problems in the family", "Conflicts & lack of peace", "Career / business not growing", "Buying or building a new property", "Something else"],
    cta: "Book My Free Vastu Check",
    benefitsTitle: "What Your Vastu Consultation Covers",
    benefits: [
      ["home", "Full Directional Analysis", "Every zone of your home or office checked against authentic Vastu Shastra principles."],
      ["shield", "No-Demolition Remedies", "Practical fixes — colours, placement, symbols — without breaking a single wall."],
      ["sun", "Energy Balance", "Correct the flow of the five elements to invite positivity and prosperity."],
      ["chart", "Prosperity & Growth", "Targeted corrections for wealth, career, relationships and health."],
    ],
    testimonials: [
      ["We were losing money every month. After the Vastu changes Dr. Sandeep suggested, our shop's sales turned around in weeks.", "Anil G.", "Shop Owner, Delhi"],
      ["No demolition, just simple placement changes — and the constant tension at home genuinely eased. Highly recommend.", "Sunita R.", "Homemaker, Jaipur"],
    ],
    faqs: [
      ["Do I need to break walls?", "No. Our remedies are practical and non-destructive — placement, colours and simple corrections you can do easily."],
      ["Can it be done online?", "Yes. Share your floor plan and directions and we can do a detailed online Vastu analysis."],
      ["Is the first consultation free?", "Yes — fill the form and our team will call you for an initial assessment at no cost."],
    ],
  },
  marriage: {
    file: "marriage.html",
    accent: "#C2185B",
    theme: "Marriage & Matchmaking",
    title: "Marriage & Matchmaking Astrology · JyotishNow",
    metaDesc: "Worried about marriage delays or compatibility? Get expert kundli matching and marriage guidance from Dr. Sandeep Sawhney — Guna Milan, Manglik & dosha remedies.",
    badge: "Marriage & Matchmaking",
    heroIcon: "heart",
    h1: ["Worried About Marriage?", "Let the Kundli Guide You."],
    heroSub: "Whether it's delays in marriage, doubts about compatibility, Manglik dosha, or trouble in an existing relationship — get clear answers from Dr. Sandeep Sawhney with authentic kundli matching and proven remedies.",
    heroBullets: ["Complete Guna Milan & compatibility analysis", "Manglik & dosha check with real remedies", "Remove delays and bring marital harmony"],
    serviceInterest: "Matchmaking Consultation",
    primaryConcern: "Marriage/Relationship",
    formTitle: "Get Your Free Marriage Consultation",
    formSub: "Speak with Dr. Sandeep — limited slots open daily.",
    concernLabel: "What would you like help with?",
    concerns: ["Delay in marriage", "Kundli matching for a proposal", "Manglik dosha concern", "Love marriage / family approval", "Problems in married life", "Something else"],
    cta: "Book My Free Consultation",
    benefitsTitle: "What Your Marriage Reading Reveals",
    benefits: [
      ["users", "Kundli Compatibility", "Full 36-guna Ashtakoot matching to see how well two charts truly align."],
      ["clock", "Marriage Timing", "The favourable periods in your chart for marriage — and why delays are happening."],
      ["shield", "Manglik & Dosha Remedies", "Clear checks for Manglik, Nadi and other doshas, with practical remedies."],
      ["heart", "Harmony Guidance", "Insights and remedies to ease conflict and strengthen married life."],
    ],
    testimonials: [
      ["My marriage was getting delayed for years. Dr. Sandeep identified the dosha, suggested remedies, and I got engaged within months.", "Neha K.", "Lucknow"],
      ["We did our kundli matching with him before saying yes. His honest, detailed analysis gave both families real peace of mind.", "Amit & Shreya", "Ahmedabad"],
    ],
    faqs: [
      ["What details do you need?", "Birth date, time and place — for one or both people if it's a matchmaking question."],
      ["Do you help with love marriages too?", "Yes. We guide on compatibility, timing and remedies for family approval and harmony."],
      ["Is the first consultation free?", "Yes — submit the form and our team will call you to understand your situation at no cost."],
    ],
  },
};

// ---- HTML template ------------------------------------------------------
const page = (t) => {
  const benefitCards = t.benefits.map(([ic, title, desc]) => `
        <div class="card benefit">
          <span class="benefit-ic">${icon(ic)}</span>
          <h3>${title}</h3>
          <p>${desc}</p>
        </div>`).join("");

  const testimonialCards = t.testimonials.map(([quote, name, place]) => `
        <figure class="card tcard">
          ${stars()}
          <blockquote>“${quote}”</blockquote>
          <figcaption><strong>${name}</strong><span>${place}</span></figcaption>
        </figure>`).join("");

  const faqItems = t.faqs.map(([q, a]) => `
        <details class="faq">
          <summary>${q}${icon("check", "faq-chevron")}</summary>
          <p>${a}</p>
        </details>`).join("");

  const concernOptions = t.concerns.map((c) => `<option value="${c}">${c}</option>`).join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${t.title}</title>
<meta name="description" content="${t.metaDesc}" />
<meta property="og:title" content="${t.title}" />
<meta property="og:description" content="${t.metaDesc}" />
<meta property="og:type" content="website" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
<style>
  :root{
    --maroon:#7A0808; --maroon-dark:#5A0606; --gold:#F5C27A; --gold-soft:#FBE8CE;
    --cream:#FFF9F0; --ink:#1a1a1a; --muted:#5b5b5b; --line:#eadfce;
    --accent:${t.accent};
    --shadow:0 20px 45px -22px rgba(122,8,8,.45);
  }
  *{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:var(--ink);background:var(--cream);line-height:1.6;-webkit-font-smoothing:antialiased}
  h1,h2,h3,.serif{font-family:"Playfair Display",Georgia,serif}
  img{max-width:100%}
  a{color:inherit;text-decoration:none}
  .wrap{width:min(1120px,92%);margin-inline:auto}
  .ic{width:1.25em;height:1.25em;flex:none}

  /* announcement + header */
  .topbar{background:var(--maroon-dark);color:#fff;font-size:.82rem;text-align:center;padding:.5rem 1rem}
  .topbar b{color:var(--gold)}
  header{position:sticky;top:0;z-index:40;background:rgba(255,249,240,.92);backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}
  .nav{display:flex;align-items:center;justify-content:space-between;padding:.7rem 0}
  .logo{display:flex;align-items:center;gap:.6rem;font-family:"Playfair Display",serif;font-weight:800;font-size:1.25rem;color:var(--maroon)}
  .logo small{display:block;font-family:Inter;font-weight:600;font-size:.6rem;letter-spacing:.18em;color:var(--muted);text-transform:uppercase}
  .logo-mark{width:38px;height:38px;border-radius:50%;background:radial-gradient(circle at 30% 30%,var(--gold),var(--maroon));display:grid;place-items:center;color:#fff}
  .call-btn{display:inline-flex;align-items:center;gap:.5rem;background:var(--maroon);color:#fff;padding:.55rem 1rem;border-radius:999px;font-weight:600;font-size:.9rem}
  .call-btn:hover{background:var(--maroon-dark)}

  /* hero */
  .hero{position:relative;background:
      radial-gradient(1200px 500px at 80% -10%,rgba(245,194,122,.18),transparent 60%),
      linear-gradient(160deg,var(--maroon) 0%,var(--maroon-dark) 60%,#3d0404 100%);
      color:#fff;overflow:hidden}
  .hero::before{content:"";position:absolute;inset:0;background-image:radial-gradient(circle,rgba(255,255,255,.06) 1px,transparent 1.4px);background-size:26px 26px;opacity:.5}
  .hero-grid{position:relative;display:grid;grid-template-columns:1.1fr .9fr;gap:3rem;align-items:center;padding:3.4rem 0 3.8rem}
  .badge{display:inline-flex;align-items:center;gap:.5rem;background:rgba(245,194,122,.16);border:1px solid rgba(245,194,122,.4);color:var(--gold);padding:.4rem .9rem;border-radius:999px;font-size:.78rem;font-weight:600;letter-spacing:.03em;margin-bottom:1.1rem}
  .hero h1{font-size:clamp(2.1rem,4.6vw,3.3rem);line-height:1.08;font-weight:800;margin-bottom:1rem}
  .hero h1 .accent{color:var(--gold)}
  .hero-sub{font-size:1.05rem;color:rgba(255,255,255,.86);max-width:38ch;margin-bottom:1.5rem}
  .hero-bullets{list-style:none;display:grid;gap:.7rem;margin-bottom:1.6rem}
  .hero-bullets li{display:flex;gap:.65rem;align-items:flex-start;font-weight:500}
  .hero-bullets .ic{color:var(--gold);margin-top:.15rem}
  .rating{display:flex;align-items:center;gap:.7rem;font-size:.9rem;color:rgba(255,255,255,.9)}
  .stars{display:inline-flex;color:var(--gold)}.stars .ic{width:1rem;height:1rem}

  /* form card */
  .lead-card{background:#fff;color:var(--ink);border-radius:20px;padding:1.6rem;box-shadow:var(--shadow);border:1px solid rgba(255,255,255,.5)}
  .lead-card h2{font-size:1.4rem;color:var(--maroon);line-height:1.15;margin-bottom:.25rem}
  .lead-card .form-sub{font-size:.9rem;color:var(--muted);margin-bottom:1.1rem}
  .field{margin-bottom:.8rem}
  .field label{display:block;font-size:.72rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);margin-bottom:.32rem}
  .field input,.field select{width:100%;height:48px;border:1px solid var(--line);border-radius:12px;padding:0 .9rem;font-size:1rem;font-family:inherit;background:#fff;color:var(--ink);transition:border-color .2s,box-shadow .2s}
  .field select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%237A0808' stroke-width='2'%3E%3Cpath d='m4 6 4 4 4-4'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 1rem center}
  .field input:focus,.field select:focus{outline:none;border-color:var(--maroon);box-shadow:0 0 0 3px rgba(122,8,8,.12)}
  .phone-row{display:flex;gap:.5rem}
  .phone-row .cc{width:78px;flex:none;display:flex;align-items:center;justify-content:center;border:1px solid var(--line);border-radius:12px;font-weight:600;background:var(--cream);color:var(--ink)}
  .submit{width:100%;height:52px;border:none;border-radius:12px;background:linear-gradient(180deg,var(--maroon),var(--maroon-dark));color:#fff;font-size:1.05rem;font-weight:700;font-family:inherit;cursor:pointer;box-shadow:var(--shadow);transition:transform .15s,filter .2s;margin-top:.4rem;display:inline-flex;align-items:center;justify-content:center;gap:.5rem}
  .submit:hover{transform:translateY(-1px);filter:brightness(1.06)}
  .submit:disabled{opacity:.7;cursor:not-allowed;transform:none}
  .form-note{font-size:.72rem;color:var(--muted);text-align:center;margin-top:.7rem;display:flex;align-items:center;justify-content:center;gap:.35rem}
  .form-err{background:#fdeaea;color:#a11;border:1px solid #f3c3c3;border-radius:10px;padding:.6rem .8rem;font-size:.85rem;margin-bottom:.8rem;display:none}
  .trust-strip{display:flex;gap:1rem;flex-wrap:wrap;margin-top:1rem;padding-top:1rem;border-top:1px solid var(--line);font-size:.72rem;color:var(--muted)}
  .trust-strip span{display:flex;align-items:center;gap:.35rem}.trust-strip .ic{width:1rem;height:1rem;color:var(--maroon)}

  /* stats bar */
  .stats{background:#fff;border-bottom:1px solid var(--line)}
  .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);text-align:center;padding:1.6rem 0}
  .stats .n{font-family:"Playfair Display",serif;font-size:1.7rem;font-weight:800;color:var(--maroon)}
  .stats .l{font-size:.78rem;color:var(--muted);letter-spacing:.02em}

  section{padding:3.4rem 0}
  .section-head{text-align:center;max-width:640px;margin:0 auto 2.2rem}
  .section-head .eyebrow{color:var(--accent);font-weight:700;font-size:.8rem;letter-spacing:.14em;text-transform:uppercase}
  .section-head h2{font-size:clamp(1.7rem,3.4vw,2.3rem);color:var(--ink);margin-top:.4rem}
  .grid{display:grid;gap:1.1rem}
  .g4{grid-template-columns:repeat(4,1fr)}
  .g2{grid-template-columns:repeat(2,1fr)}
  .g3{grid-template-columns:repeat(3,1fr)}
  .card{background:#fff;border:1px solid var(--line);border-radius:16px;padding:1.4rem}
  .benefit{transition:transform .2s,box-shadow .2s}
  .benefit:hover{transform:translateY(-3px);box-shadow:var(--shadow)}
  .benefit-ic{display:grid;place-items:center;width:48px;height:48px;border-radius:12px;background:var(--gold-soft);color:var(--maroon);margin-bottom:.9rem}
  .benefit-ic .ic{width:1.4rem;height:1.4rem}
  .benefit h3{font-size:1.05rem;margin-bottom:.35rem}
  .benefit p{font-size:.92rem;color:var(--muted)}

  /* steps */
  .steps{background:var(--gold-soft)}
  .step{position:relative;text-align:center;padding:1rem}
  .step .num{width:52px;height:52px;border-radius:50%;background:var(--maroon);color:#fff;display:grid;place-items:center;font-family:"Playfair Display",serif;font-size:1.3rem;font-weight:800;margin:0 auto .8rem}
  .step h3{font-size:1.05rem;margin-bottom:.3rem}
  .step p{font-size:.9rem;color:var(--muted)}

  .tcard blockquote{font-size:.98rem;color:#333;margin:.6rem 0 1rem;font-style:italic}
  .tcard figcaption{display:flex;flex-direction:column}
  .tcard figcaption strong{color:var(--maroon)}
  .tcard figcaption span{font-size:.82rem;color:var(--muted)}

  /* about */
  .about{background:var(--maroon);color:#fff}
  .about-grid{display:grid;grid-template-columns:auto 1fr;gap:2rem;align-items:center}
  .about .face{width:120px;height:120px;border-radius:50%;background:radial-gradient(circle at 30% 30%,var(--gold),var(--maroon-dark));display:grid;place-items:center;font-family:"Playfair Display",serif;font-size:2.4rem;font-weight:800;border:3px solid var(--gold)}
  .about h2{color:#fff;font-size:1.8rem}
  .about p{color:rgba(255,255,255,.85);margin-top:.6rem;max-width:60ch}
  .about .creds{display:flex;gap:1.4rem;flex-wrap:wrap;margin-top:1rem;font-size:.85rem}
  .about .creds b{color:var(--gold)}

  /* faq */
  .faq{background:#fff;border:1px solid var(--line);border-radius:12px;margin-bottom:.7rem;overflow:hidden}
  .faq summary{list-style:none;cursor:pointer;padding:1rem 1.2rem;font-weight:600;display:flex;align-items:center;justify-content:space-between;gap:1rem}
  .faq summary::-webkit-details-marker{display:none}
  .faq .faq-chevron{color:var(--maroon);transition:transform .2s}
  .faq[open] .faq-chevron{transform:rotate(90deg)}
  .faq p{padding:0 1.2rem 1.1rem;color:var(--muted);font-size:.92rem}

  /* final cta */
  .final{background:linear-gradient(160deg,var(--maroon),var(--maroon-dark));color:#fff;text-align:center}
  .final h2{color:#fff;font-size:clamp(1.7rem,3.6vw,2.4rem)}
  .final p{color:rgba(255,255,255,.85);margin:.6rem auto 1.4rem;max-width:52ch}
  .btn-gold{display:inline-flex;align-items:center;gap:.5rem;background:var(--gold);color:var(--maroon-dark);font-weight:700;padding:.9rem 1.8rem;border-radius:999px;font-size:1.05rem;box-shadow:var(--shadow)}
  .btn-gold:hover{filter:brightness(1.05);transform:translateY(-1px)}

  footer{background:#2a0808;color:rgba(255,255,255,.7);text-align:center;padding:2rem 0;font-size:.85rem}
  footer a{color:var(--gold)}
  .disclaimer{font-size:.72rem;color:rgba(255,255,255,.45);margin-top:.8rem;max-width:70ch;margin-inline:auto}

  /* sticky mobile bar */
  .mobile-bar{position:fixed;bottom:0;left:0;right:0;z-index:50;display:none;grid-template-columns:1fr 1fr;gap:.5rem;padding:.6rem;background:#fff;border-top:1px solid var(--line);box-shadow:0 -8px 24px rgba(0,0,0,.08)}
  .mobile-bar a{display:flex;align-items:center;justify-content:center;gap:.4rem;height:48px;border-radius:12px;font-weight:700}
  .mb-call{background:var(--maroon);color:#fff}
  .mb-wa{background:#25D366;color:#fff}

  /* thank-you overlay */
  .overlay{position:fixed;inset:0;z-index:60;background:rgba(20,4,4,.8);backdrop-filter:blur(4px);display:none;align-items:center;justify-content:center;padding:1.2rem}
  .overlay.show{display:flex}
  .thanks{background:#fff;border-radius:20px;padding:2.2rem;max-width:420px;text-align:center;box-shadow:var(--shadow)}
  .thanks .tick{width:66px;height:66px;border-radius:50%;background:#e8f6ec;color:#1a9c46;display:grid;place-items:center;margin:0 auto 1rem}
  .thanks .tick .ic{width:2rem;height:2rem}
  .thanks h3{font-size:1.5rem;color:var(--maroon);margin-bottom:.5rem}
  .thanks p{color:var(--muted);margin-bottom:1.3rem}
  .thanks .btn-gold{background:#25D366;color:#fff}

  @media(max-width:900px){
    .hero-grid{grid-template-columns:1fr;gap:1.8rem;padding:2.2rem 0 2.6rem}
    .g4{grid-template-columns:repeat(2,1fr)}
    .g3{grid-template-columns:1fr}
    .stats-grid{grid-template-columns:repeat(2,1fr);gap:1.2rem}
    .about-grid{grid-template-columns:1fr;text-align:center}
    .about .face{margin:0 auto}
    .about .creds{justify-content:center}
    .header-call{display:none}
    .mobile-bar{display:grid}
    body{padding-bottom:70px}
  }
  @media(max-width:520px){
    .g4,.g2{grid-template-columns:1fr}
    .phone-row .cc{width:70px}
  }
</style>
</head>
<body>
  <div class="topbar">📞 Free Consultation Today · <b>Dr. Sandeep Sawhney</b> · 25+ Years · 1,00,000+ Consultations</div>

  <header>
    <div class="wrap nav">
      <div class="logo"><span class="logo-mark">${icon("sun")}</span><span>JyotishNow<small>Dr. Sandeep</small></span></div>
      <a class="call-btn header-call" href="tel:${CONTACT.phoneDigits}">${icon("phone")} ${CONTACT.phone}</a>
    </div>
  </header>

  <!-- HERO -->
  <div class="hero">
    <div class="wrap hero-grid">
      <div class="hero-copy">
        <span class="badge">${icon(t.heroIcon)} ${t.badge}</span>
        <h1>${t.h1[0]}<br><span class="accent">${t.h1[1]}</span></h1>
        <p class="hero-sub">${t.heroSub}</p>
        <ul class="hero-bullets">
          ${t.heroBullets.map((b) => `<li>${icon("check")} <span>${b}</span></li>`).join("")}
        </ul>
        <div class="rating">${stars()} <span><b>4.9/5</b> from 3,200+ happy clients</span></div>
      </div>

      <!-- LEAD FORM -->
      <div class="lead-card" id="form">
        <h2>${t.formTitle}</h2>
        <p class="form-sub">${t.formSub}</p>
        <div class="form-err" id="formErr"></div>
        <form id="leadForm" novalidate>
          <div class="field">
            <label for="name">Full Name</label>
            <input id="name" name="name" type="text" placeholder="Your name" autocomplete="name" required />
          </div>
          <div class="field">
            <label for="phone">Phone / WhatsApp Number</label>
            <div class="phone-row">
              <span class="cc">+91</span>
              <input id="phone" name="phone" type="tel" inputmode="numeric" placeholder="10-digit number" autocomplete="tel" required />
            </div>
          </div>
          <div class="field">
            <label for="email">Email Address</label>
            <input id="email" name="email" type="email" placeholder="you@example.com" autocomplete="email" required />
          </div>
          <div class="field">
            <label for="concern">${t.concernLabel}</label>
            <select id="concern" name="concern" required>
              <option value="" disabled selected>Select one…</option>
              ${concernOptions}
            </select>
          </div>
          <button class="submit" type="submit" id="submitBtn">${t.cta} ${icon("spark")}</button>
          <p class="form-note">${icon("shield")} 100% private. We never share your details.</p>
        </form>
        <div class="trust-strip">
          <span>${icon("check")} Free first consultation</span>
          <span>${icon("check")} Reply within hours</span>
        </div>
      </div>
    </div>
  </div>

  <!-- STATS -->
  <div class="stats">
    <div class="wrap stats-grid">
      <div><div class="n">25+</div><div class="l">Years of Experience</div></div>
      <div><div class="n">1L+</div><div class="l">Consultations</div></div>
      <div><div class="n">4.9★</div><div class="l">Client Rating</div></div>
      <div><div class="n">15+</div><div class="l">Countries Served</div></div>
    </div>
  </div>

  <!-- BENEFITS -->
  <section>
    <div class="wrap">
      <div class="section-head">
        <span class="eyebrow">${t.theme}</span>
        <h2>${t.benefitsTitle}</h2>
      </div>
      <div class="grid g4">${benefitCards}</div>
    </div>
  </section>

  <!-- STEPS -->
  <section class="steps">
    <div class="wrap">
      <div class="section-head"><span class="eyebrow">Simple Process</span><h2>How It Works</h2></div>
      <div class="grid g3">
        <div class="step"><div class="num">1</div><h3>Share Your Details</h3><p>Fill the short form with your name, number and concern — takes 30 seconds.</p></div>
        <div class="step"><div class="num">2</div><h3>Talk to an Expert</h3><p>Our team calls you to understand your situation and Dr. Sandeep studies your chart.</p></div>
        <div class="step"><div class="num">3</div><h3>Get Clear Guidance</h3><p>Receive honest insights and practical remedies you can start applying right away.</p></div>
      </div>
    </div>
  </section>

  <!-- TESTIMONIALS -->
  <section>
    <div class="wrap">
      <div class="section-head"><span class="eyebrow">Real Stories</span><h2>What Our Clients Say</h2></div>
      <div class="grid g2">${testimonialCards}</div>
    </div>
  </section>

  <!-- ABOUT -->
  <section class="about">
    <div class="wrap about-grid">
      <div class="face">SS</div>
      <div>
        <h2>Dr. Sandeep Sawhney</h2>
        <p>One of India's most trusted Vedic astrologers, with over 25 years of experience guiding people across the world. Known for honest, practical and result-oriented guidance rooted in authentic Jyotish and remedies that actually fit modern life.</p>
        <div class="creds"><span><b>25+</b> Years</span><span><b>1,00,000+</b> Consultations</span><span><b>Featured</b> on leading platforms</span></div>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section>
    <div class="wrap" style="max-width:760px">
      <div class="section-head"><span class="eyebrow">Good to Know</span><h2>Frequently Asked</h2></div>
      ${faqItems}
    </div>
  </section>

  <!-- FINAL CTA -->
  <section class="final">
    <div class="wrap">
      <h2>Your Answers Are Just One Call Away</h2>
      <p>Don't stay stuck in doubt. Book your free consultation with Dr. Sandeep Sawhney today.</p>
      <a class="btn-gold" href="#form">${t.cta} ${icon("spark")}</a>
    </div>
  </section>

  <footer>
    <div class="wrap">
      <div class="logo" style="justify-content:center;color:var(--gold)"><span>JyotishNow · Dr. Sandeep Sawhney</span></div>
      <p style="margin-top:.6rem">📞 <a href="tel:${CONTACT.phoneDigits}">${CONTACT.phone}</a> &nbsp;·&nbsp; ✉️ <a href="mailto:${CONTACT.email}">${CONTACT.email}</a></p>
      <p class="disclaimer">Astrological guidance is for awareness and self-improvement and is not a substitute for professional medical, legal or financial advice. © JyotishNow. All rights reserved.</p>
    </div>
  </footer>

  <!-- STICKY MOBILE BAR -->
  <div class="mobile-bar">
    <a class="mb-call" href="tel:${CONTACT.phoneDigits}">${icon("phone")} Call Now</a>
    <a class="mb-wa" href="https://wa.me/${CONTACT.phoneDigits}?text=${encodeURIComponent("Hi, I'd like a free " + t.theme + " consultation.")}" target="_blank" rel="noopener">${icon("whatsapp")} WhatsApp</a>
  </div>

  <!-- THANK YOU OVERLAY -->
  <div class="overlay" id="overlay">
    <div class="thanks">
      <div class="tick">${icon("check")}</div>
      <h3>Thank You! 🙏</h3>
      <p>Your request has been received. Our team will call you shortly. For faster help, message us on WhatsApp now.</p>
      <a class="btn-gold" href="https://wa.me/${CONTACT.phoneDigits}?text=${encodeURIComponent("Hi, I just requested a free " + t.theme + " consultation.")}" target="_blank" rel="noopener">${icon("whatsapp")} Chat on WhatsApp</a>
    </div>
  </div>

<script>
(function(){
  var API_BASE = ${JSON.stringify(API_BASE)};
  var FIELDS = ${JSON.stringify(FIELDS)};
  var SERVICE_INTEREST = ${JSON.stringify(t.serviceInterest)};
  var PRIMARY_CONCERN = ${JSON.stringify(t.primaryConcern)};
  var THEME = ${JSON.stringify(t.theme)};

  // Attribution from the ad click (utm_* / gclid / fbclid).
  var qs = new URLSearchParams(location.search);
  function leadSource(){
    var s = (qs.get('utm_source')||'').toLowerCase();
    if (qs.get('gclid') || s.indexOf('google')>-1) return 'Google Ad';
    if (qs.get('fbclid') || s.indexOf('fb')>-1 || s.indexOf('meta')>-1 || s.indexOf('insta')>-1) return 'Meta Ad';
    return 'Meta Ad';
  }
  function utmTags(){
    var t=[]; ['utm_source','utm_medium','utm_campaign'].forEach(function(k){var v=qs.get(k); if(v) t.push(k.replace('utm_','')+':'+v);});
    return t;
  }

  var form = document.getElementById('leadForm');
  var btn = document.getElementById('submitBtn');
  var errBox = document.getElementById('formErr');
  var overlay = document.getElementById('overlay');
  var btnHTML = btn.innerHTML;

  function showErr(msg){ errBox.textContent = msg; errBox.style.display='block'; }
  function clearErr(){ errBox.style.display='none'; }

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    clearErr();
    var name = form.name.value.trim();
    var phone = form.phone.value.replace(/\\D/g,'');
    var email = form.email.value.trim();
    var concern = form.concern.value;
    if (!name){ return showErr('Please enter your name.'); }
    if (phone.length < 10){ return showErr('Please enter a valid 10-digit phone number.'); }
    if (!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(email)){ return showErr('Please enter a valid email address.'); }
    if (!concern){ return showErr('Please select what you need help with.'); }

    var parts = name.split(' ');
    var payload = {
      action: 'upsert-contact',
      firstName: parts[0],
      lastName: parts.slice(1).join(' '),
      name: name,
      email: email,
      phone: '+91' + phone,
      source: THEME + ' Landing Page',
      tags: [THEME + ' Ad Lead', 'Landing Page', 'Website Lead'].concat(utmTags()),
      customFields: [
        { id: FIELDS.serviceInterest, value: SERVICE_INTEREST },
        { id: FIELDS.primaryConcern, value: PRIMARY_CONCERN },
        { id: FIELDS.leadSource, value: leadSource() },
        { id: FIELDS.guidanceWanted, value: concern }
      ]
    };

    btn.disabled = true; btn.innerHTML = 'Sending…';
    try {
      var res = await fetch(API_BASE + '/api/prospectiq', {
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)
      });
      var data = await res.json().catch(function(){return {};});
      if (res.ok && (data.success || data.contact)) {
        form.reset();
        overlay.classList.add('show');
        if (window.gtag) window.gtag('event','generate_lead',{value:THEME});
        if (window.fbq) window.fbq('track','Lead');
      } else {
        throw new Error('bad response');
      }
    } catch (err) {
      showErr('Something went wrong. Please call us or tap WhatsApp below — we don\\'t want to miss you.');
    } finally {
      btn.disabled = false; btn.innerHTML = btnHTML;
    }
  });

  overlay.addEventListener('click', function(e){ if(e.target===overlay) overlay.classList.remove('show'); });
})();
</script>
</body>
</html>`;
};

for (const key of Object.keys(TOPICS)) {
  const t = TOPICS[key];
  const html = page(t);
  writeFileSync(join(OUT_DIR, t.file), html, "utf8");
  console.log(`wrote ${t.file}  (${(html.length / 1024).toFixed(1)} KB)`);
}
