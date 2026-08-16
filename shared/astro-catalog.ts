/**
 * VedicAstroAPI v3.4 endpoint catalogue and the free/paid split.
 *
 * Derived from the published Postman collection
 * (https://documenter.getpostman.com/view/16788527/VUjMq6ts). Only paths listed
 * here can be reached through /api/astro — an allow-list, so a tampered client
 * cannot call arbitrary upstream endpoints and burn plan credits.
 *
 * FREE  = rendered to the visitor in full, no payment required.
 * PAID  = costly deliverables gated behind a completed Razorpay payment.
 *
 * The PDF queue endpoints are the genuinely expensive ones (they render and
 * host a full report), so those are the paid tier. Everything needed to display
 * a complete kundli on screen stays free.
 */

export type AstroTier = "free" | "paid";

export type AstroEndpoint = {
  /** Path after /v3-json/ */
  path: string;
  tier: AstroTier;
  /** Query params forwarded from the client, beyond api_key. */
  params: string[];
  description: string;
};

const CHART_PARAMS = ["dob", "tob", "lat", "lon", "tz", "lang"];

export const ASTRO_ENDPOINTS: Record<string, AstroEndpoint> = {
  // ---------------------------------------------------------------- FREE ---
  // Core kundli — everything required to show the full chart on screen.
  "planet-details": { path: "horoscope/planet-details", tier: "free", params: CHART_PARAMS, description: "Planetary positions" },
  "planets-in-houses": { path: "horoscope/planets-in-houses", tier: "free", params: CHART_PARAMS, description: "Planets in houses" },
  "planetary-aspects": { path: "horoscope/planetary-aspects", tier: "free", params: [...CHART_PARAMS, "type"], description: "Aspects" },
  "ascendant-report": { path: "horoscope/ascendant-report", tier: "free", params: CHART_PARAMS, description: "Ascendant report" },
  "personal-characteristics": { path: "horoscope/personal-characteristics", tier: "free", params: CHART_PARAMS, description: "Personality" },
  "planet-report": { path: "horoscope/planet-report", tier: "free", params: [...CHART_PARAMS, "planet"], description: "Per-planet report" },
  "divisional-charts": { path: "horoscope/divisional-charts", tier: "free", params: [...CHART_PARAMS, "div", "response_type", "transit_date"], description: "Divisional charts (D1..D60)" },
  "chart-image": { path: "horoscope/chart-image", tier: "free", params: [...CHART_PARAMS, "div", "style", "color", "size", "font_size", "font_style", "stroke", "format", "colorful_planets", "show_degree", "transit_date"], description: "Rendered chart image" },
  "ashtakvarga": { path: "horoscope/ashtakvarga", tier: "free", params: [...CHART_PARAMS, "planet"], description: "Ashtakvarga" },
  "binnashtakvarga": { path: "horoscope/binnashtakvarga", tier: "free", params: [...CHART_PARAMS, "planet"], description: "Binnashtakvarga" },
  "ashtakvarga-chart-image": { path: "horoscope/ashtakvarga-chart-image", tier: "free", params: [...CHART_PARAMS, "planet", "style", "color", "size", "font_size", "format"], description: "Ashtakvarga chart image" },

  // Extended kundli detail.
  "extended-kundli-details": { path: "extended-horoscope/extended-kundli-details", tier: "free", params: CHART_PARAMS, description: "Extended kundli details" },
  "find-moon-sign": { path: "extended-horoscope/find-moon-sign", tier: "free", params: CHART_PARAMS, description: "Moon sign (Rashi)" },
  "find-sun-sign": { path: "extended-horoscope/find-sun-sign", tier: "free", params: CHART_PARAMS, description: "Sun sign" },
  "find-ascendant": { path: "extended-horoscope/find-ascendant", tier: "free", params: CHART_PARAMS, description: "Ascendant (Lagna)" },
  "current-sade-sati": { path: "extended-horoscope/current-sade-sati", tier: "free", params: CHART_PARAMS, description: "Current Sade Sati" },
  "sade-sati-table": { path: "extended-horoscope/sade-sati-table", tier: "free", params: CHART_PARAMS, description: "Sade Sati timeline" },
  "yoga-list": { path: "extended-horoscope/yoga-list", tier: "free", params: CHART_PARAMS, description: "Yogas present" },
  "shad-bala": { path: "extended-horoscope/shad-bala", tier: "free", params: CHART_PARAMS, description: "Shad Bala strengths" },
  "kp-houses": { path: "extended-horoscope/kp-houses", tier: "free", params: CHART_PARAMS, description: "KP houses" },
  "kp-planets": { path: "extended-horoscope/kp-planets", tier: "free", params: CHART_PARAMS, description: "KP planets" },
  "gem-suggestion": { path: "extended-horoscope/gem-suggestion", tier: "free", params: CHART_PARAMS, description: "Gemstone suggestion" },
  "rudraksh-suggestion": { path: "extended-horoscope/rudraksh-suggestion", tier: "free", params: CHART_PARAMS, description: "Rudraksh suggestion" },
  "numero-table": { path: "extended-horoscope/numero-table", tier: "free", params: [...CHART_PARAMS, "name"], description: "Numerology table" },
  "jaimini-karakas": { path: "extended-horoscope/jaimini-karakas", tier: "free", params: CHART_PARAMS, description: "Jaimini karakas" },
  "arutha-padas": { path: "extended-horoscope/arutha-padas", tier: "free", params: CHART_PARAMS, description: "Arutha padas" },
  "friendship": { path: "extended-horoscope/friendship", tier: "free", params: CHART_PARAMS, description: "Planetary friendship" },
  "varshapal-details": { path: "extended-horoscope/varshapal-details", tier: "free", params: CHART_PARAMS, description: "Varshapal" },

  // Dashas.
  "maha-dasha": { path: "dashas/maha-dasha", tier: "free", params: CHART_PARAMS, description: "Maha Dasha" },
  "maha-dasha-predictions": { path: "dashas/maha-dasha-predictions", tier: "free", params: CHART_PARAMS, description: "Maha Dasha predictions" },
  "antar-dasha": { path: "dashas/antar-dasha", tier: "free", params: CHART_PARAMS, description: "Antar Dasha" },
  "current-mahadasha": { path: "dashas/current-mahadasha", tier: "free", params: CHART_PARAMS, description: "Current Mahadasha" },
  "current-mahadasha-full": { path: "dashas/current-mahadasha-full", tier: "free", params: CHART_PARAMS, description: "Current Mahadasha (full)" },
  "yogini-dasha-main": { path: "dashas/yogini-dasha-main", tier: "free", params: CHART_PARAMS, description: "Yogini Dasha" },
  "char-dasha-current": { path: "dashas/char-dasha-current", tier: "free", params: CHART_PARAMS, description: "Char Dasha (current)" },

  // Doshas.
  "mangal-dosh": { path: "dosha/mangal-dosh", tier: "free", params: CHART_PARAMS, description: "Mangal Dosha" },
  "manglik-dosh": { path: "dosha/manglik-dosh", tier: "free", params: CHART_PARAMS, description: "Manglik Dosha" },
  "kaalsarp-dosh": { path: "dosha/kaalsarp-dosh", tier: "free", params: CHART_PARAMS, description: "Kaal Sarp Dosha" },
  "pitra-dosh": { path: "dosha/pitra-dosh", tier: "free", params: CHART_PARAMS, description: "Pitra Dosha" },
  "papasamaya": { path: "dosha/papasamaya", tier: "free", params: CHART_PARAMS, description: "Papasamaya" },

  // Panchang / predictions.
  "panchang": { path: "panchang/panchang", tier: "free", params: ["date", "tz", "lat", "lon", "time", "lang"], description: "Panchang" },
  "monthly-panchang": { path: "panchang/monthly-panchang", tier: "free", params: ["date", "tz", "lat", "lon", "time", "lang"], description: "Monthly panchang" },
  "choghadiya-muhurta": { path: "panchang/choghadiya-muhurta", tier: "free", params: ["date", "tz", "lat", "lon", "time", "lang"], description: "Choghadiya" },
  "hora-muhurta": { path: "panchang/hora-muhurta", tier: "free", params: ["date", "tz", "lat", "lon", "time", "lang"], description: "Hora" },
  "festivals": { path: "panchang/festivals", tier: "free", params: ["date", "tz", "lat", "lon", "lang"], description: "Festivals" },
  "daily-sun": { path: "prediction/daily-sun", tier: "free", params: ["zodiac", "date", "lang", "type", "split"], description: "Daily prediction" },
  "weekly-sun": { path: "prediction/weekly-sun", tier: "free", params: ["zodiac", "week", "lang", "type", "show_same"], description: "Weekly prediction" },
  "yearly": { path: "prediction/yearly", tier: "free", params: ["zodiac", "year", "lang"], description: "Yearly prediction" },
  "numerology": { path: "prediction/numerology", tier: "free", params: ["name", "date", "lang"], description: "Numerology" },

  // Matching.
  "ashtakoot": { path: "matching/ashtakoot", tier: "free", params: ["boy_dob", "boy_tob", "boy_tz", "boy_lat", "boy_lon", "girl_dob", "girl_tob", "girl_tz", "girl_lat", "girl_lon", "lang"], description: "Ashtakoot match" },
  "ashtakoot-with-astro-details": { path: "matching/ashtakoot-with-astro-details", tier: "free", params: ["boy_dob", "boy_tob", "boy_tz", "boy_lat", "boy_lon", "girl_dob", "girl_tob", "girl_tz", "girl_lat", "girl_lon", "lang"], description: "Ashtakoot + astro details" },
  "aggregate-match": { path: "matching/aggregate-match", tier: "free", params: ["boy_dob", "boy_tob", "boy_tz", "boy_lat", "boy_lon", "girl_dob", "girl_tob", "girl_tz", "girl_lat", "girl_lon", "lang"], description: "Aggregate match" },

  // Utilities.
  "gem-details": { path: "utilities/gem-details", tier: "free", params: ["gem", "lang"], description: "Gem details" },

  // ---------------------------------------------------------------- PAID ---
  // Rendered, downloadable reports. These are the expensive deliverables.
  "pdf-horoscope": { path: "pdf/horoscope-queue", tier: "paid", params: [...CHART_PARAMS, "name", "pob", "style", "color", "pdf_type", "company_name", "address", "website", "email", "phone"], description: "Full kundli PDF export" },
  "pdf-matching": { path: "pdf/matching-queue", tier: "paid", params: ["boy_dob", "boy_tob", "boy_tz", "boy_lat", "boy_lon", "boy_pob", "boy_name", "girl_dob", "girl_tob", "girl_tz", "girl_lat", "girl_lon", "girl_pob", "girl_name", "lang", "style", "color"], description: "Matchmaking PDF export" },
  "ai-12-month": { path: "horoscope/ai-12-month-prediction", tier: "paid", params: CHART_PARAMS, description: "AI 12-month prediction" },
};

export const isPaidEndpoint = (key: string): boolean =>
  ASTRO_ENDPOINTS[key]?.tier === "paid";

export const freeEndpointKeys = (): string[] =>
  Object.keys(ASTRO_ENDPOINTS).filter((k) => ASTRO_ENDPOINTS[k].tier === "free");

export const paidEndpointKeys = (): string[] =>
  Object.keys(ASTRO_ENDPOINTS).filter((k) => ASTRO_ENDPOINTS[k].tier === "paid");
