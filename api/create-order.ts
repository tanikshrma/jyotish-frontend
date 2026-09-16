import type { VercelRequest, VercelResponse } from "@vercel/node";
import Razorpay from "razorpay";
import {
  MIN_AMOUNT_PAISE,
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
  hasCredentials,
  readJsonBody,
  requirePost,
} from "./_razorpay.js";
import { DEFAULT_VARIANT, getServiceLabel } from "../shared/pricing.js";
import { NOTE, isQuote, isSlotString, quoteOrder } from "../shared/consultation.js";
import { slotIsBookable } from "./_ghl.js";

/**
 * POST /api/create-order
 * Body: {
 *   service: ServiceId, variant?: string,
 *   addons?: string[],          // e.g. ["consultation-15"]
 *   slot?: string,              // required when the order includes a call
 *   receipt?: string, notes?: object
 * }
 * Returns: { order_id, amount, currency, key_id, total_rupees }
 *
 * The amount is NEVER taken from the request. The client names a service,
 * variant and add-ons; the price comes from shared/pricing.ts on the server. A
 * tampered request can only ask for a different listed product, not a
 * different price.
 *
 * What was bought (service key, variant, add-ons, slot) is written into the
 * order notes AFTER the client's notes, so it can't be overwritten. The
 * fulfilment endpoints read it back from Razorpay rather than trusting the
 * browser.
 */

/** Client notes are informational only; keep them few and short. */
const MAX_CLIENT_NOTES = 6;
const MAX_NOTE_LENGTH = 200;
const RESERVED_NOTES = new Set<string>(["service", ...Object.values(NOTE)]);

const clientNotes = (raw: unknown): Record<string, string> => {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (Object.keys(out).length >= MAX_CLIENT_NOTES) break;
    if (RESERVED_NOTES.has(key) || !/^[a-z0-9_]{1,40}$/i.test(key)) continue;
    if (typeof value !== "string" && typeof value !== "number") continue;
    out[key] = String(value).slice(0, MAX_NOTE_LENGTH);
  }
  return out;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requirePost(req, res)) return;

  if (!hasCredentials()) {
    console.error("Razorpay credentials are not configured");
    return res.status(500).json({ error: "Payment gateway not configured" });
  }

  const body = readJsonBody(req);
  const service = typeof body.service === "string" ? body.service : "";
  const variant =
    typeof body.variant === "string" && body.variant ? body.variant : DEFAULT_VARIANT;
  const addons = Array.isArray(body.addons)
    ? body.addons.filter((a): a is string => typeof a === "string")
    : [];
  const currency = "INR";

  const quote = quoteOrder(service, variant, addons);
  if (!isQuote(quote)) {
    return res.status(400).json({ error: quote.error });
  }

  // A call is booked into a real slot, so check it before taking money for it.
  let slot = "";
  if (quote.consultation) {
    if (!isSlotString(body.slot)) {
      return res.status(400).json({ error: "Please pick a time for your consultation", code: "SLOT_REQUIRED" });
    }
    slot = body.slot;
    const check = await slotIsBookable(quote.consultation.calendarId, slot, quote.consultation.minutes);
    if (!check.ok) {
      const message =
        check.reason === "too-soon"
          ? "That time is too soon — please pick a slot at least 2 hours from now"
          : check.reason === "taken"
            ? "That slot was just taken — please pick another time"
            : "Could not check Dr. Sandeep's calendar right now — please try again";
      return res
        .status(check.reason === "unavailable" ? 503 : 409)
        .json({ error: message, code: check.reason === "unavailable" ? "CALENDAR_UNAVAILABLE" : "SLOT_UNAVAILABLE" });
    }
  }

  const amount = Math.round(quote.totalRupees * 100);

  // Guards against a mispriced catalogue entry reaching Razorpay.
  if (!Number.isInteger(amount) || amount < MIN_AMOUNT_PAISE) {
    console.error("Configured price is invalid for", service, variant, addons);
    return res.status(500).json({ error: "Service is mispriced" });
  }

  // Razorpay caps receipts at 40 characters.
  const receipt =
    typeof body.receipt === "string" && body.receipt
      ? body.receipt.slice(0, 40)
      : `rcpt_${Date.now()}`;

  try {
    const razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID as string,
      key_secret: RAZORPAY_KEY_SECRET as string,
    });

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt,
      notes: {
        ...clientNotes(body.notes),
        // Recorded server-side, last, so the dashboard and the fulfilment
        // endpoints see what was actually sold.
        service: (getServiceLabel(service) ?? service).slice(0, 200),
        [NOTE.serviceKey]: service,
        [NOTE.variant]: variant,
        [NOTE.total]: String(quote.totalRupees),
        ...(quote.addons.length ? { [NOTE.addons]: quote.addons.join(",") } : {}),
        ...(slot ? { [NOTE.slot]: slot } : {}),
      },
    });

    return res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      total_rupees: quote.totalRupees,
      // The key id is publishable — Checkout needs it in the browser.
      key_id: RAZORPAY_KEY_ID,
    });
  } catch (error: unknown) {
    const status = (error as { statusCode?: number })?.statusCode;
    const description = (error as { error?: { description?: string } })?.error?.description;

    console.error("Razorpay order creation failed", status, description);

    // Bad or revoked API keys come back as 401 from Razorpay.
    if (status === 401) {
      return res.status(401).json({ error: "Payment gateway authentication failed" });
    }

    return res.status(500).json({ error: "Could not create payment order" });
  }
}
