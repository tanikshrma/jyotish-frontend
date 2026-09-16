import { readJsonResponse } from "./_razorpay.js";
import { MIN_LEAD_MINUTES, SLOT_MINUTES, slotsNeeded } from "../shared/consultation.js";

/**
 * Server-side Prospect IQ (GoHighLevel v2) calls used by paid bookings.
 *
 * Appointments are only ever created from here, after a payment has been
 * verified with Razorpay. The public /api/prospectiq proxy no longer creates
 * appointments or opportunities, because anyone could call it.
 */

const BASE = "https://services.leadconnectorhq.com";
const TIMEOUT_MS = 20_000;
const DEFAULT_LOCATION_ID = "FTD8wmuYqCT7XoIpXJQG";
export const IST = "Asia/Kolkata";

export const ghlToken = () => process.env.PROSPECTIQ_PRIVATE_TOKEN || process.env.GHL_PRIVATE_TOKEN;
export const ghlLocation = () => process.env.PROSPECTIQ_LOCATION_ID || DEFAULT_LOCATION_ID;

const headers = () => ({
  Authorization: `Bearer ${ghlToken()}`,
  Version: "2021-07-28",
  "Content-Type": "application/json",
});

const call = (path: string, init: RequestInit = {}) =>
  fetch(`${BASE}${path}`, { ...init, headers: headers(), signal: AbortSignal.timeout(TIMEOUT_MS) });

export type ContactInput = {
  name?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  customFields?: { id: string; value: string }[];
};

/** Upserts a contact (matched on email/phone) and returns its id. */
export const upsertContact = async (c: ContactInput): Promise<string | null> => {
  if (!ghlToken() || (!c.email && !c.phone)) return null;
  try {
    const [firstName, ...rest] = (c.name ?? "").trim().split(/\s+/);
    const res = await call("/contacts/upsert", {
      method: "POST",
      body: JSON.stringify({
        locationId: ghlLocation(),
        ...(c.email ? { email: c.email } : {}),
        ...(c.phone ? { phone: c.phone } : {}),
        ...(c.name ? { name: c.name.trim(), firstName, lastName: rest.join(" ") } : {}),
        ...(c.customFields?.length ? { customFields: c.customFields } : {}),
      }),
    });
    const data = await readJsonResponse(res);
    if (!res.ok) {
      console.error("[ghl] contact upsert failed", res.status, JSON.stringify(data).slice(0, 300));
      return null;
    }
    const id: string | null = data?.contact?.id ?? data?.id ?? null;
    // Upsert can replace a contact's tags wholesale, which would strip tags set
    // by earlier purchases or workflows — so tags are added separately.
    if (id && c.tags?.length) await tagContact(id, c.tags);
    return id;
  } catch (error) {
    console.error("[ghl] contact upsert threw", (error as Error).message);
    return null;
  }
};

/** Epoch-ms start times of every free slot in a window, or null if unreadable. */
export const freeSlotStarts = async (
  calendarId: string,
  fromMs: number,
  toMs: number,
): Promise<Set<number> | null> => {
  if (!ghlToken()) return null;
  try {
    const q = new URLSearchParams({ startDate: String(fromMs), endDate: String(toMs), timezone: IST });
    const res = await call(`/calendars/${encodeURIComponent(calendarId)}/free-slots?${q}`);
    const data = await readJsonResponse(res);
    if (!res.ok) {
      console.error("[ghl] free-slots failed", res.status);
      return null;
    }
    const starts = new Set<number>();
    for (const [key, day] of Object.entries(data)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) continue;
      for (const slot of (day as { slots?: string[] })?.slots ?? []) {
        const ms = Date.parse(slot);
        if (!Number.isNaN(ms)) starts.add(ms);
      }
    }
    return starts;
  } catch (error) {
    console.error("[ghl] free-slots threw", (error as Error).message);
    return null;
  }
};

export type SlotCheck = { ok: true } | { ok: false; reason: "too-soon" | "taken" | "unavailable" };

/**
 * A call can be booked at `slot` if it is far enough ahead and every 30-minute
 * grid slot it occupies is still free — an hour needs two back-to-back slots.
 */
export const slotIsBookable = async (
  calendarId: string,
  slot: string,
  minutes: number,
  /** Checkout asks for 2 hours; booking a slot already paid for allows less. */
  minLeadMinutes: number = MIN_LEAD_MINUTES,
  nowMs: number = Date.now(),
): Promise<SlotCheck> => {
  const start = Date.parse(slot);
  if (Number.isNaN(start) || start < nowMs + minLeadMinutes * 60_000) {
    return { ok: false, reason: "too-soon" };
  }
  const free = await freeSlotStarts(calendarId, start - 12 * 3_600_000, start + 36 * 3_600_000);
  if (!free) return { ok: false, reason: "unavailable" };
  for (let i = 0; i < slotsNeeded(minutes); i++) {
    if (!free.has(start + i * SLOT_MINUTES * 60_000)) return { ok: false, reason: "taken" };
  }
  return { ok: true };
};

export type Appointment = {
  id: string;
  calendarId: string;
  startTime: string;
  endTime?: string;
  title?: string;
  appointmentStatus?: string;
};

/** A contact's appointments, used to make booking idempotent across retries. */
export const contactAppointments = async (contactId: string): Promise<Appointment[] | null> => {
  if (!ghlToken()) return null;
  try {
    const res = await call(`/contacts/${encodeURIComponent(contactId)}/appointments`);
    const data = await readJsonResponse(res);
    if (!res.ok) return null;
    return (data.events ?? data.appointments ?? []) as Appointment[];
  } catch {
    return null;
  }
};

export type CreateAppointmentResult =
  | { ok: true; appointment: Appointment }
  | { ok: false; status: number; detail: string };

export const createAppointment = async (a: {
  calendarId: string;
  contactId: string;
  startTime: string;
  endTime: string;
  title: string;
}): Promise<CreateAppointmentResult> => {
  try {
    const res = await call("/calendars/events/appointments", {
      method: "POST",
      body: JSON.stringify({
        calendarId: a.calendarId,
        locationId: ghlLocation(),
        contactId: a.contactId,
        startTime: a.startTime,
        endTime: a.endTime,
        title: a.title,
        appointmentStatus: "confirmed",
      }),
    });
    const data = await readJsonResponse(res);
    if (!res.ok) {
      return { ok: false, status: res.status, detail: JSON.stringify(data).slice(0, 300) };
    }
    const event = data.event ?? data;
    return {
      ok: true,
      appointment: {
        id: String(event.id),
        calendarId: String(event.calendarId ?? a.calendarId),
        startTime: String(event.startTime ?? a.startTime),
        endTime: String(event.endTime ?? a.endTime),
        title: event.title ?? a.title,
        appointmentStatus: event.appointmentStatus ?? "confirmed",
      },
    };
  } catch (error) {
    return { ok: false, status: 502, detail: (error as Error).message };
  }
};

/** Adds tags to an existing contact (e.g. to flag a booking for manual follow-up). */
export const tagContact = async (contactId: string, tags: string[]) => {
  if (!ghlToken() || !tags.length) return;
  try {
    await call(`/contacts/${encodeURIComponent(contactId)}/tags`, {
      method: "POST",
      body: JSON.stringify({ tags: [...new Set(tags.filter(Boolean))] }),
    });
  } catch (error) {
    console.error("[ghl] tagging failed", (error as Error).message);
  }
};
