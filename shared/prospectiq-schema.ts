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
};

/** Maps a site service/report key onto the "Report Type" picklist value. */
export const SERVICE_TO_REPORT_TYPE: Record<string, string> = {
  "kundli-pdf": "Yearly Horoscope",
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
