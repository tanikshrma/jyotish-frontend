import crypto from "node:crypto";
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, readJsonResponse } from "./_razorpay.js";
import { SERVICES } from "../shared/pricing.js";
import {
  isQuote,
  parseOrderNotes,
  quoteOrder,
  type OrderNotes,
  type Quote,
} from "../shared/consultation.js";

/**
 * What a payment actually bought, confirmed with Razorpay rather than taken
 * from the browser.
 *
 * A valid checkout signature only proves that *some* payment happened for an
 * order id. Every fulfilment endpoint (reports, bookings, receipts) must also
 * know WHAT that order was for — otherwise a ₹99 payment could claim the ₹499
 * bundle, or any payment could claim a consultation. That comes from the order
 * notes written by /api/create-order, read back here from Razorpay's API.
 */

/** Test-mode keys never move real money; records made with them are tagged. */
export const isTestMode = () => String(RAZORPAY_KEY_ID ?? "").startsWith("rzp_test_");
export const TEST_TAG = "TEST - Razorpay test mode";

export const signatureIsValid = (orderId: string, paymentId: string, signature: string) => {
  if (!orderId || !paymentId || !signature || !RAZORPAY_KEY_SECRET) return false;
  const expected = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

/** Orders created before `service_key` existed carry only the display label. */
export const serviceForLabel = (label: string): string | null =>
  Object.entries(SERVICES).find(([, s]) => s.label === label)?.[0] ?? null;

export type PaidOrder = {
  orderId: string;
  paymentId: string;
  /** What Razorpay actually charged. */
  amountRupees: number;
  paymentStatus: string;
  notes: OrderNotes;
  /** The order re-priced from its notes; null if the notes name nothing sellable. */
  quote: Quote | null;
};

export type PaidOrderResult =
  | { ok: true; order: PaidOrder }
  | { ok: false; status: number; error: string; retryable: boolean };

const RZP_API = "https://api.razorpay.com/v1";
const RZP_TIMEOUT_MS = 15_000;

const rzpGet = (path: string) =>
  fetch(`${RZP_API}${path}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64")}`,
    },
    signal: AbortSignal.timeout(RZP_TIMEOUT_MS),
  });

/**
 * Confirms a payment is real, belongs to the order, has gone through, and
 * returns what the order was for. Callers must check the signature first.
 */
export const fetchPaidOrder = async (
  orderId: string,
  paymentId: string,
): Promise<PaidOrderResult> => {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    return { ok: false, status: 500, error: "Payment gateway not configured", retryable: false };
  }
  try {
    const [paymentRes, orderRes] = await Promise.all([
      rzpGet(`/payments/${encodeURIComponent(paymentId)}`),
      rzpGet(`/orders/${encodeURIComponent(orderId)}`),
    ]);
    if (!paymentRes.ok || !orderRes.ok) {
      const status = !paymentRes.ok ? paymentRes.status : orderRes.status;
      const missing = status === 400 || status === 404;
      return {
        ok: false,
        status: missing ? 402 : 502,
        error: missing ? "Payment not found" : "Could not confirm the payment with Razorpay",
        retryable: !missing,
      };
    }

    const payment = await readJsonResponse(paymentRes);
    const order = await readJsonResponse(orderRes);

    if (payment.order_id !== orderId) {
      return { ok: false, status: 402, error: "Payment does not belong to this order", retryable: false };
    }
    // "authorized" is paid-but-not-yet-captured (manual capture accounts).
    if (payment.status !== "captured" && payment.status !== "authorized") {
      return {
        ok: false,
        status: 402,
        error: `Payment is ${payment.status ?? "not complete"}`,
        retryable: payment.status === "created",
      };
    }

    const notes = parseOrderNotes(order.notes, serviceForLabel);
    const priced = notes.service ? quoteOrder(notes.service, notes.variant, notes.addons) : null;
    const quote = priced && isQuote(priced) ? priced : null;
    const amountRupees = Number(order.amount) / 100;

    if (quote && Math.abs(quote.totalRupees - amountRupees) > 0.5) {
      // Prices changed after the order was placed. What was paid stands; the
      // notes still say what was bought, so fulfil it and flag it in the logs.
      console.warn(
        `[payments] order ${orderId} paid ₹${amountRupees} but now prices at ₹${quote.totalRupees}`,
      );
    }

    return {
      ok: true,
      order: {
        orderId,
        paymentId,
        amountRupees,
        paymentStatus: String(payment.status),
        notes,
        quote,
      },
    };
  } catch (error) {
    console.error("[payments] Razorpay lookup failed", (error as Error).message);
    return { ok: false, status: 502, error: "Could not confirm the payment with Razorpay", retryable: true };
  }
};

/**
 * Report endpoints only want to generate a report paid for in THIS order.
 *
 * Dry run: with PDF_DRY_RUN=1 and test-mode keys, the endpoint goes through
 * the whole paid flow but skips the render, so checkout can be tested without
 * spending report credits. Live keys ignore it, so it can never short-change a
 * real customer.
 */
/** PDF_DRY_RUN=1 covers every report; a list (e.g. "kundli-pdf") only those. */
const dryRunCovers = (service: string) => {
  const v = (process.env.PDF_DRY_RUN ?? "").trim();
  return v === "1" || v.split(",").map((s) => s.trim()).includes(service);
};

export type PaidReport =
  | { ok: true; order: PaidOrder; dryRun: boolean }
  | { ok: false; status: number; error: string; retryable: boolean };

export const paidReportOrder = async (
  body: Record<string, unknown>,
  service: string,
): Promise<PaidReport> => {
  const orderId = String(body.razorpay_order_id ?? "");
  const paymentId = String(body.razorpay_payment_id ?? "");
  if (!signatureIsValid(orderId, paymentId, String(body.razorpay_signature ?? ""))) {
    return { ok: false, status: 402, error: "Valid payment required for this report", retryable: false };
  }
  const paid = await fetchPaidOrder(orderId, paymentId);
  if (paid.ok === false) return { ok: false, status: paid.status, error: paid.error, retryable: paid.retryable };
  if (paid.order.notes.service !== service) {
    console.warn(`[payments] order ${orderId} was for ${paid.order.notes.service}, not ${service}`);
    return { ok: false, status: 402, error: "This payment was not for this report", retryable: false };
  }
  return { ok: true, order: paid.order, dryRun: isTestMode() && dryRunCovers(service) };
};
