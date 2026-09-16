/**
 * Browser side of paid consultations: reading Dr. Sandeep's free slots, paying
 * through Razorpay, and asking the server to book the call.
 *
 * The browser never creates an appointment itself. It picks a slot, the order
 * carries that slot, and /api/book-consultation books it after confirming the
 * payment with Razorpay.
 */
import { fetchProspectIQCalendarSlots } from "@/lib/prospectiq";
import { createOrder, loadRazorpayScript, type RazorpaySuccess } from "@/lib/razorpay";
import {
  MIN_LEAD_MINUTES,
  SLOT_MINUTES,
  slotsNeeded,
} from "../../shared/consultation";

export const IST_ZONE = "Asia/Kolkata";

/* ------------------------------------------------------------- slots */

/** How far ahead the picker looks. */
export const SLOT_WINDOW_DAYS = 21;

/** Free slot start times, grouped by IST date (YYYY-MM-DD), each list sorted. */
export type SlotDays = { date: string; slots: string[] }[];

const istDateKey = (ms: number) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: IST_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date(ms),
  );

/**
 * The starts a call of `minutes` can actually take: far enough ahead, and —
 * for an hour — with the following slot free too.
 */
export const bookableStarts = (slots: string[], minutes: number, nowMs = Date.now()): string[] => {
  const free = new Set(slots.map((s) => Date.parse(s)));
  const needed = slotsNeeded(minutes);
  return slots
    .filter((s) => {
      const start = Date.parse(s);
      if (Number.isNaN(start) || start < nowMs + MIN_LEAD_MINUTES * 60_000) return false;
      for (let i = 1; i < needed; i++) {
        if (!free.has(start + i * SLOT_MINUTES * 60_000)) return false;
      }
      return true;
    })
    .sort((a, b) => Date.parse(a) - Date.parse(b));
};

/** Pulls every slot string out of Prospect IQ's `{ "YYYY-MM-DD": { slots } }`. */
export const flattenSlotResponse = (raw: unknown): string[] => {
  if (!raw || typeof raw !== "object") return [];
  const source = (raw as { slots?: unknown }).slots;
  const map = (source && typeof source === "object" && !Array.isArray(source) ? source : raw) as Record<string, unknown>;
  const out: string[] = [];
  for (const [key, day] of Object.entries(map)) {
    if (!/^\d{4}-\d{1,2}-\d{1,2}/.test(key)) continue;
    const list = Array.isArray(day) ? day : (day as { slots?: unknown })?.slots;
    if (Array.isArray(list)) out.push(...list.map(String));
  }
  return out;
};

export const groupByIstDay = (slots: string[]): SlotDays => {
  const days = new Map<string, string[]>();
  for (const s of slots) {
    const key = istDateKey(Date.parse(s));
    days.set(key, [...(days.get(key) ?? []), s]);
  }
  return [...days.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, list]) => ({ date, slots: list }));
};

export const loadBookableDays = async (calendarId: string, minutes: number): Promise<SlotDays> => {
  const now = Date.now();
  const raw = await fetchProspectIQCalendarSlots(calendarId, now, now + SLOT_WINDOW_DAYS * 86_400_000, IST_ZONE);
  if (raw?.error) throw new Error(raw.error);
  return groupByIstDay(bookableStarts(flattenSlotResponse(raw), minutes, now));
};

export const formatSlotTime = (slot: string, timeZone = IST_ZONE) =>
  new Date(Date.parse(slot)).toLocaleTimeString("en-IN", { timeZone, hour: "numeric", minute: "2-digit", hour12: true });

export const formatDayChip = (date: string) => {
  const d = new Date(`${date}T12:00:00+05:30`);
  return {
    weekday: d.toLocaleDateString("en-IN", { timeZone: IST_ZONE, weekday: "short" }),
    day: d.toLocaleDateString("en-IN", { timeZone: IST_ZONE, day: "numeric" }),
    month: d.toLocaleDateString("en-IN", { timeZone: IST_ZONE, month: "short" }),
  };
};

/* ---------------------------------------------------------- checkout */

export class CheckoutError extends Error {
  readonly code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = "CheckoutError";
    this.code = code;
  }
}

/**
 * Creates the order and runs Razorpay Checkout. Resolves with the signed
 * payment; rejects with code DISMISSED when the customer closes checkout, or
 * with the server's code (e.g. SLOT_UNAVAILABLE) when the order is refused.
 * A failed attempt inside checkout is left to Razorpay, which lets them retry.
 */
export const payWithRazorpay = async (input: {
  service: string;
  variant?: string;
  addons?: string[];
  slot?: string | null;
  notes?: Record<string, string>;
  description: string;
  prefill: { name?: string; email?: string; contact?: string };
  themeColor?: string;
}): Promise<RazorpaySuccess & { amount: number }> => {
  await loadRazorpayScript();
  const order = await createOrder({
    service: input.service,
    variant: input.variant,
    addons: input.addons,
    slot: input.slot ?? undefined,
    notes: input.notes,
  });
  if (!window.Razorpay) throw new CheckoutError("Payment gateway unavailable");

  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay!({
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      name: "JyotishNow",
      description: input.description,
      order_id: order.order_id,
      prefill: input.prefill,
      theme: { color: input.themeColor ?? "#7A0808" },
      modal: { ondismiss: () => reject(new CheckoutError("Payment cancelled", "DISMISSED")) },
      handler: (resp) => resolve({ ...resp, amount: order.amount }),
    });
    checkout.open();
  });
};

/* ----------------------------------------------------------- booking */

export type BookedConsultation = {
  appointmentId: string;
  calendarId: string;
  startTime: string;
  endTime: string;
  label: string;
  /** "Mon, 21 Sep, 10:00 am IST" */
  when: string;
};

export class BookingError extends Error {
  readonly code?: string;
  readonly retryable: boolean;
  constructor(message: string, code?: string, retryable = false) {
    super(message);
    this.name = "BookingError";
    this.code = code;
    this.retryable = retryable;
  }
}

/**
 * Books the call paid for in this payment. Safe to call again with the same
 * payment — it returns the existing booking. Retries transient failures.
 */
export const bookConsultation = async (input: RazorpaySuccess & {
  customer: { name: string; email: string; phone: string };
  /** Only for re-picking a time after SLOT_UNAVAILABLE. */
  slot?: string;
}): Promise<BookedConsultation> => {
  let lastError: BookingError | null = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch("/api/book-consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.booked) return data.booking as BookedConsultation;
      lastError = new BookingError(
        data.error || "Could not book your consultation",
        data.code,
        Boolean(data.retryable) || res.status >= 500,
      );
    } catch {
      lastError = new BookingError("Network problem while booking", undefined, true);
    }
    if (!lastError.retryable) break;
    await new Promise((r) => setTimeout(r, attempt * 1500));
  }
  throw lastError!;
};
