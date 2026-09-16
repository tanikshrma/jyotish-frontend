/**
 * What an order contains, shared by the browser and the payment endpoints.
 *
 * An order is one priced product (a report, or a standalone consultation) plus
 * optional add-ons. The only add-on today is a 15-minute audio call with
 * Dr. Sandeep Sawhney, sold alongside a report. /api/create-order prices the
 * whole order from here and writes its contents into the Razorpay order notes;
 * the fulfilment endpoints read those notes back — never the browser — to
 * decide what was actually paid for.
 *
 * Contains no secrets — safe to bundle into the client.
 */
import { DEFAULT_VARIANT, formatINR, getPriceInRupees, getServiceLabel } from "./pricing.js";
import { PIQ_CALENDARS, SERVICE_TO_CALENDAR } from "./prospectiq-schema.js";

/* ------------------------------------------------------------ catalogue */

/** The ₹999 add-on: a 15-minute audio call, only with a report. */
export const CONSULTATION_ADDON = {
  key: "consultation-15",
  service: "consultation-addon",
  variant: "15 Min|Audio",
  minutes: 15,
  mode: "Audio",
} as const;

export const ADDON_KEYS: readonly string[] = [CONSULTATION_ADDON.key];

/** Reports a consultation add-on may be attached to. */
export const ADDON_BASE_SERVICES = new Set(["kundli-pdf", "matchmaking-pdf"]);

/** The standalone, full-price consultation with Dr. Sandeep Sawhney. */
export const CONSULTATION_SERVICE = "consultation-call";

export type ConsultationOption = {
  variant: string;
  minutes: 30 | 60;
  mode: "Audio" | "Video";
  label: string;
  rupees: number;
};

const OPTION_ROWS: [string, 30 | 60, "Audio" | "Video", string][] = [
  ["30 Min|Audio", 30, "Audio", "30 min · Audio call"],
  ["30 Min|Video", 30, "Video", "30 min · Video call"],
  ["1 Hour|Audio", 60, "Audio", "1 hour · Audio call"],
  ["1 Hour|Video", 60, "Video", "1 hour · Video call"],
];

/** Duration × mode choices for the standalone call, priced from pricing.ts. */
export const CONSULTATION_OPTIONS: ConsultationOption[] = OPTION_ROWS.map(
  ([variant, minutes, mode, label]) => ({
    variant,
    minutes,
    mode,
    label,
    rupees: getPriceInRupees(CONSULTATION_SERVICE, variant) ?? 0,
  }),
);

/* ------------------------------------------------------------- slots */

/** Dr. Sandeep's calendars are a 30-minute grid, one appointment per slot. */
export const SLOT_MINUTES = 30;
/** No booking closer than this to the call, so he can prepare. */
export const MIN_LEAD_MINUTES = 120;

/** Grid slots a call occupies: 15 and 30 min take one, an hour takes two. */
export const slotsNeeded = (minutes: number) => Math.max(1, Math.ceil(minutes / SLOT_MINUTES));

/** A slot as Prospect IQ returns it, e.g. 2026-09-21T10:00:00+05:30. */
export const isSlotString = (value: unknown): value is string =>
  typeof value === "string" &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/.test(value) &&
  !Number.isNaN(Date.parse(value));

export const addMinutes = (slot: string, minutes: number) =>
  new Date(Date.parse(slot) + minutes * 60_000).toISOString();

/** "Mon, 21 Sep, 10:00 am IST" — how a booked time reads on every surface. */
export const formatSlotIST = (slot: string) =>
  new Date(Date.parse(slot)).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }) + " IST";

/* ------------------------------------------------------------- quotes */

export type OrderLine = { service: string; variant: string; label: string; rupees: number };

export type ConsultationBooking = {
  minutes: number;
  mode: string;
  label: string;
  calendarId: string;
  /** Price of the call itself, recorded on its own CRM opportunity. */
  rupees: number;
  /** True for the report add-on, false for a standalone call. */
  isAddon: boolean;
};

export type Quote = {
  service: string;
  variant: string;
  addons: string[];
  lines: OrderLine[];
  totalRupees: number;
  /** Set when the order includes a call that must be booked. */
  consultation: ConsultationBooking | null;
};

/** The calendar a consultation lands in: couples' calls go to matchmaking. */
const calendarForBase = (service: string) =>
  service === "matchmaking-pdf" ? PIQ_CALENDARS.matchmaking : PIQ_CALENDARS.completeHoroscope;

const standaloneOption = (variant: string) =>
  CONSULTATION_OPTIONS.find((o) => o.variant === variant) ??
  // `default` is priced as the 30-min video call, so book it as that.
  (variant === DEFAULT_VARIANT ? CONSULTATION_OPTIONS[1] : undefined);

/**
 * Every consultation the site sells is a paid call booked into one of Dr.
 * Sandeep's calendars. The durations are read from the variant ("1 Hour|Video",
 * "Audio Call"); single-price services hold one 30-minute slot, which is how
 * they have always been booked.
 */
const BOOKED_SERVICES = new Set(
  Object.keys(SERVICE_TO_CALENDAR).filter((s) => !ADDON_BASE_SERVICES.has(s)),
);

const otherConsultation = (service: string, variant: string, rupees: number): ConsultationBooking => {
  const minutes = /1\s*hour/i.test(variant) ? 60 : 30;
  const mode = /video/i.test(variant)
    ? "Video"
    : /audio/i.test(variant)
      ? "Audio"
      : service === "face-to-face" || variant === "site-visit"
        ? "In person"
        : "Call";
  return {
    minutes,
    mode,
    label: `${getServiceLabel(service) ?? "Consultation"} with Dr. Sandeep Sawhney`,
    calendarId: SERVICE_TO_CALENDAR[service],
    rupees,
    isAddon: false,
  };
};

/**
 * Prices an order. Returns an error for anything that cannot be sold: an
 * unknown product, an unknown add-on, or an add-on on a product that doesn't
 * offer it.
 */
export const quoteOrder = (
  service: string,
  variant: string = DEFAULT_VARIANT,
  addons: string[] = [],
): Quote | { error: string } => {
  if (service === CONSULTATION_ADDON.service) {
    return { error: "This add-on is only available with a report" };
  }
  const base = getPriceInRupees(service, variant);
  if (base === null) return { error: "Unknown service or variant" };

  const unique = [...new Set(addons.filter(Boolean))];
  for (const key of unique) {
    if (!ADDON_KEYS.includes(key)) return { error: `Unknown add-on: ${key}` };
    if (!ADDON_BASE_SERVICES.has(service)) {
      return { error: "This add-on is only available with a report" };
    }
  }

  const lines: OrderLine[] = [
    { service, variant, label: getServiceLabel(service) ?? service, rupees: base },
  ];
  let consultation: ConsultationBooking | null = null;

  if (service === CONSULTATION_SERVICE) {
    const opt = standaloneOption(variant);
    if (!opt) return { error: "Unknown consultation option" };
    consultation = {
      minutes: opt.minutes,
      mode: opt.mode,
      label: `${opt.minutes === 60 ? "1-hour" : "30-min"} ${opt.mode} Consultation with Dr. Sandeep Sawhney`,
      calendarId: PIQ_CALENDARS.completeHoroscope,
      rupees: base,
      isAddon: false,
    };
  } else if (BOOKED_SERVICES.has(service)) {
    consultation = otherConsultation(service, variant, base);
  }

  if (unique.includes(CONSULTATION_ADDON.key)) {
    const rupees = getPriceInRupees(CONSULTATION_ADDON.service, CONSULTATION_ADDON.variant);
    if (rupees === null) return { error: "Add-on is not priced" };
    const label = getServiceLabel(CONSULTATION_ADDON.service) ?? "Consultation";
    lines.push({
      service: CONSULTATION_ADDON.service,
      variant: CONSULTATION_ADDON.variant,
      label,
      rupees,
    });
    consultation = {
      minutes: CONSULTATION_ADDON.minutes,
      mode: CONSULTATION_ADDON.mode,
      label,
      calendarId: calendarForBase(service),
      rupees,
      isAddon: true,
    };
  }

  return {
    service,
    variant,
    addons: unique,
    lines,
    totalRupees: lines.reduce((sum, l) => sum + l.rupees, 0),
    consultation,
  };
};

export const isQuote = (q: Quote | { error: string }): q is Quote => !("error" in q);

export const describeQuote = (q: Quote) =>
  q.lines.map((l) => `${l.label} (${formatINR(l.rupees)})`).join(" + ");

/* -------------------------------------------------------- order notes */

/**
 * Keys /api/create-order writes into the Razorpay order notes. They are set
 * server-side after any client notes, so the browser can't forge them.
 */
export const NOTE = {
  serviceKey: "service_key",
  variant: "variant",
  addons: "addons",
  slot: "slot",
  total: "total_rupees",
} as const;

export type OrderNotes = {
  service: string | null;
  variant: string;
  addons: string[];
  slot: string | null;
};

/**
 * Reads what an order was for. Orders created before `service_key` existed
 * only carry the service's display label, so it is matched back to a key.
 */
export const parseOrderNotes = (
  notes: Record<string, unknown> | null | undefined,
  labelToService: (label: string) => string | null,
): OrderNotes => {
  const n = notes ?? {};
  const str = (k: string) => (typeof n[k] === "string" ? (n[k] as string) : "");
  const service = str(NOTE.serviceKey) || labelToService(str("service")) || null;
  return {
    service,
    variant: str(NOTE.variant) || DEFAULT_VARIANT,
    addons: str(NOTE.addons)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    slot: isSlotString(str(NOTE.slot)) ? str(NOTE.slot) : null,
  };
};
