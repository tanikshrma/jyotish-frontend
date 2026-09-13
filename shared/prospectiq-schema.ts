/**
 * Real Prospect IQ (GoHighLevel v2) schema for location FTD8wmuYqCT7XoIpXJQG.
 *
 * Every id below was read from the live API
 * (GET /locations/{id}/customFields and GET /calendars/?locationId=),
 * not copied from the old Lovable account. Custom-field values only land in
 * the CRM when sent with the correct field id — a wrong or invented id is
 * accepted by the API and silently dropped, which is why birth details never
 * appeared on contacts.
 *
 * Contains no secrets — safe to bundle into the client.
 */

/** Contact custom fields, keyed by their real Prospect IQ field id. */
export const PIQ_FIELDS = {
  birthDate: "ySqd27s8qaBDeCD1N7pN", // DATE
  timeOfBirth: "d28HWH923lPhtZDgLT8r", // TEXT
  placeOfBirth: "CKzDAXRRce1Ga6CYGWjx", // TEXT
  rashi: "2vgzwzC7s8qMppQYJBC3", // SINGLE_OPTIONS
  serviceInterest: "xPJtBp6LRTUeRcnl1VkY", // SINGLE_OPTIONS
  reportType: "v6t3vzPek67tfmqvsbzQ", // SINGLE_OPTIONS
  primaryConcern: "AR7UGqvRnOVzMJdnBSMK", // SINGLE_OPTIONS
  leadSource: "Vu3puN76DXCUtpn0NhGk", // SINGLE_OPTIONS
  consultationType: "09IyIf8IEqsXvdGVGXz9", // TEXT
  consultationLanguage: "iEX58JoKK6ZKLb5E8vbQ", // SINGLE_OPTIONS
  consultationDate: "wFx1gStOIfKv0n8jocUt", // DATE
  preferredCallTime: "eok2Q5CJIuSXyiSh9K4k", // TEXT
  guidanceWanted: "B59ZL1TJWDKsrFP6joxq", // TEXT
  gemstoneRecommended: "m3pfEjRBg2YVAi54WlIm", // TEXT
  remedyGiven: "HZSmsvvE8Dv2Jw08wa62", // TEXT
  partnerDateOfBirth: "159uAMvzRqx5jgGeaa2R", // DATE
  partnerTimeOfBirth: "UDpjZTZGkvpa3GKoZ06L", // TEXT
  partnerPlaceOfBirth: "3LOVToGAmfTU554UMGYL", // TEXT
} as const;

/**
 * How each custom field is named and labelled on website forms, for Prospect
 * IQ's External Tracking script — it matches captured inputs to CRM fields by
 * input name and label. Names are the live field keys (minus the "contact."
 * prefix) and labels the live field names, both read from
 * GET /locations/{id}/customFields. Keep in step with PIQ_FIELDS.
 */
export const PIQ_FORM_FIELDS: Record<keyof typeof PIQ_FIELDS, { name: string; label: string }> = {
  birthDate: { name: "birth_date", label: "Birth Date" },
  timeOfBirth: { name: "time_of_birth", label: "Time of Birth" },
  placeOfBirth: { name: "place_of_birth", label: "Place of Birth" },
  rashi: { name: "rashi__moon_sign", label: "Rashi / Moon Sign" },
  serviceInterest: { name: "service_interest", label: "Service Interest" },
  reportType: { name: "report_type", label: "Report Type" },
  primaryConcern: { name: "primary_concern", label: "Primary Concern" },
  leadSource: { name: "lead_source", label: "Lead Source" },
  consultationType: { name: "consultation_type", label: "Consultation Type" },
  consultationLanguage: { name: "consultation_language", label: "Consultation Language" },
  consultationDate: { name: "consultation_date", label: "Consultation Date" },
  preferredCallTime: { name: "preferred_call_time", label: "Preferred Call Time" },
  guidanceWanted: { name: "what_would_you_like_guidance_on", label: "What would you like guidance on?" },
  gemstoneRecommended: { name: "gemstone_recommended", label: "Gemstone Recommended" },
  remedyGiven: { name: "remedy_given", label: "Remedy Given" },
  partnerDateOfBirth: { name: "partner_date_of_birth", label: "Partner Date of Birth" },
  partnerTimeOfBirth: { name: "partner_time_of_birth", label: "Partner Time of Birth" },
  partnerPlaceOfBirth: { name: "partner_place_of_birth", label: "Partner Place of Birth" },
};

/**
 * Allowed values for SINGLE_OPTIONS fields. Sending anything outside these
 * lists is rejected or dropped by Prospect IQ, so map to them exactly.
 */
export const PIQ_OPTIONS = {
  serviceInterest: [
    "Complete Horoscope Analysis",
    "Annual Horoscope Analysis",
    "Matchmaking Consultation",
    "Couple Kundli Analysis",
    "Career Guidance",
    "Vastu Consultancy",
    "Gemstone",
    "Report",
    "Course",
  ],
  reportType: [
    "Baby Name",
    "Lal Kitab",
    "Yearly Horoscope",
    "Monthly Horoscope",
    "Kal Sarp & Manglik Dosha",
    "Not Applicable",
  ],
  primaryConcern: [
    "Career",
    "Marriage/Relationship",
    "Finance/Business",
    "Health",
    "Education/Exams",
    "Property/Vastu",
    "General Guidance",
  ],
  leadSource: [
    "Website Form",
    "WhatsApp",
    "Meta Ad",
    "Google Ad",
    "YouTube",
    "Instagram",
    "Referral",
  ],
  consultationLanguage: ["Hindi", "English", "Punjabi"],
  rashi: [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
    "Unknown",
  ],
} as const;

/** Live calendars, by id. */
export const PIQ_CALENDARS = {
  matchmaking: "CsQSF9Jj4lgrsgUcUX4A",
  completeHoroscope: "EJ8nazswCDPvy9hOMIef",
  annualHoroscope: "RqMmAZTbpjpXKhGXZXgv",
  vastu: "a7Dh1KSYvqUx20Sz7QHL",
  career: "nuxprER9d0Nq1o798pO7",
} as const;

export const PIQ_DEFAULT_CALENDAR = PIQ_CALENDARS.completeHoroscope;

/** Maps a site service key onto the calendar that should hold the booking. */
export const SERVICE_TO_CALENDAR: Record<string, string> = {
  "kundli-pdf": PIQ_CALENDARS.completeHoroscope,
  "consultation-call": PIQ_CALENDARS.completeHoroscope,
  "complete-horoscope": PIQ_CALENDARS.completeHoroscope,
  "face-to-face": PIQ_CALENDARS.completeHoroscope,
  "baby-muhurat": PIQ_CALENDARS.completeHoroscope,
  "lalkitab-consultation": PIQ_CALENDARS.completeHoroscope,
  "gemstone-analysis": PIQ_CALENDARS.completeHoroscope,
  "couple-consultation": PIQ_CALENDARS.matchmaking,
  "matchmaking-consultation": PIQ_CALENDARS.matchmaking,
  "annual-horoscope": PIQ_CALENDARS.annualHoroscope,
  "vastu-consultancy": PIQ_CALENDARS.vastu,
  "career-guidance": PIQ_CALENDARS.career,
};

/** Maps a site service key onto the "Service Interest" picklist value. */
export const SERVICE_TO_INTEREST: Record<string, string> = {
  "kundli-pdf": "Complete Horoscope Analysis",
  "consultation-call": "Complete Horoscope Analysis",
  "complete-horoscope": "Complete Horoscope Analysis",
  "face-to-face": "Complete Horoscope Analysis",
  "annual-horoscope": "Annual Horoscope Analysis",
  "matchmaking-consultation": "Matchmaking Consultation",
  "couple-consultation": "Couple Kundli Analysis",
  "career-guidance": "Career Guidance",
  "vastu-consultancy": "Vastu Consultancy",
  "gemstone-analysis": "Gemstone",
  "baby-muhurat": "Report",
  "lalkitab-consultation": "Report",
  "baby-name": "Report",
  "kundli-calculator": "Complete Horoscope Analysis",
  // The calculators and the landing checkout send these exact keys; the fuzzy
  // lookup below found nothing for most of them, leaving the field blank.
  kundli: "Complete Horoscope Analysis",
  babyname: "Report",
  kaalsarp: "Report",
  sadesati: "Report",
  lalkitab: "Report",
  love: "Couple Kundli Analysis",
  matchmaking: "Matchmaking Consultation",
  career: "Career Guidance",
};

/** Maps a site service/report key onto the "Report Type" picklist value. */
export const SERVICE_TO_REPORT_TYPE: Record<string, string> = {
  // A kundli is not a yearly horoscope, and the picklist has no kundli option;
  // "Not Applicable" is honest until one is added in Prospect IQ.
  "kundli-pdf": "Not Applicable",
  kundli: "Not Applicable",
  babyname: "Baby Name",
  lalkitab: "Lal Kitab",
  sadesati: "Not Applicable",
  "baby-name": "Baby Name",
  "lalkitab-consultation": "Lal Kitab",
  "lal-kitab": "Lal Kitab",
  "annual-horoscope": "Yearly Horoscope",
  "yearly-horoscope": "Yearly Horoscope",
  "monthly-horoscope": "Monthly Horoscope",
  "kal-sarp": "Kal Sarp & Manglik Dosha",
  "kaalsarp": "Kal Sarp & Manglik Dosha",
};

export const calendarForService = (service?: string): string => {
  if (!service) return PIQ_DEFAULT_CALENDAR;
  const key = service.toLowerCase().trim();
  if (SERVICE_TO_CALENDAR[key]) return SERVICE_TO_CALENDAR[key];
  const hit = Object.keys(SERVICE_TO_CALENDAR).find(
    (k) => key.includes(k) || k.includes(key),
  );
  return hit ? SERVICE_TO_CALENDAR[hit] : PIQ_DEFAULT_CALENDAR;
};

export const serviceInterestFor = (service?: string): string | null => {
  if (!service) return null;
  const key = service.toLowerCase().trim();
  if (SERVICE_TO_INTEREST[key]) return SERVICE_TO_INTEREST[key];
  const hit = Object.keys(SERVICE_TO_INTEREST).find(
    (k) => key.includes(k) || k.includes(key),
  );
  return hit ? SERVICE_TO_INTEREST[hit] : null;
};

export const reportTypeFor = (service?: string): string | null => {
  if (!service) return null;
  const key = service.toLowerCase().trim();
  if (SERVICE_TO_REPORT_TYPE[key]) return SERVICE_TO_REPORT_TYPE[key];
  const hit = Object.keys(SERVICE_TO_REPORT_TYPE).find(
    (k) => key.includes(k) || k.includes(key),
  );
  return hit ? SERVICE_TO_REPORT_TYPE[hit] : null;
};

/** Prospect IQ DATE fields want ISO yyyy-mm-dd. Accepts dd/mm/yyyy too. */
export const toIsoDate = (value?: string): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const dmy = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime())
    ? null
    : parsed.toISOString().slice(0, 10);
};

/**
 * Opportunity pipelines used to reflect a completed website payment inside
 * Prospect IQ. Every paid checkout creates a "won" opportunity carrying the
 * amount as monetaryValue, so the sale shows on the CRM board, counts toward
 * pipeline revenue, and can trigger "stage changed" automations. (GHL's
 * Payments/orders ledger is not used — its create API requires internal
 * checkout fields like fingerprint/trackingId that only its own hosted
 * checkout supplies.)
 *
 * IDs read live from GET /opportunities/pipelines for location
 * FTD8wmuYqCT7XoIpXJQG.
 */
export const PIQ_PIPELINES = {
  reports: {
    pipelineId: "v4FiNQfeM4jSR8SsUf3s", // "Reports & Gemstones"
    paidStageId: "9faa3822-6304-4fa0-b3be-1febe0abdc9f", // "Paid"
  },
  consultations: {
    pipelineId: "VYLsVuKWWaGS7ZZAUQ1w", // "Consultation Bookings"
    paidStageId: "f84f43e0-ff72-4f32-a8e6-1da85a765c36", // "Payment Received"
  },
} as const;

/** Deliverable products (PDF reports + the gemstone analysis) land in the
 *  Reports pipeline. Everything else — the audio/video calls, the in-person
 *  sessions, muhurats and consultancies — is a booking and lands in the
 *  Consultation Bookings pipeline. Note: annual-horoscope, lalkitab and
 *  complete-horoscope are *calls*, not written reports, despite their names. */
const REPORT_SERVICES = new Set([
  "kundli-pdf",
  "matchmaking-pdf",
  "gemstone-analysis",
]);

export const pipelineForService = (service?: string) => {
  const key = (service ?? "").toLowerCase().trim();
  // The dedicated PDF endpoints pass the real service key (matched by the set);
  // the generic checkout passes a display label like "Gemstone Analysis", so we
  // also sniff the text for report/pdf/gemstone wording.
  const isReport = REPORT_SERVICES.has(key) || /pdf|\breport\b|gemstone/.test(key);
  return isReport ? PIQ_PIPELINES.reports : PIQ_PIPELINES.consultations;
};
