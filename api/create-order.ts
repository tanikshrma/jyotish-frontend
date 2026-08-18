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
import {
  DEFAULT_VARIANT,
  getPriceInRupees,
  getServiceLabel,
} from "../shared/pricing.js";

/**
 * POST /api/create-order
 * Body: { service: ServiceId, variant?: string, receipt?: string, notes?: object }
 * Returns: { order_id, amount, currency, key_id }
 *
 * The amount is NEVER taken from the request. The client names a service and
 * variant; the price comes from shared/pricing.ts on the server. A tampered
 * request can only ask for a different listed service, not a different price.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requirePost(req, res)) return;

  if (!hasCredentials()) {
    console.error("Razorpay credentials are not configured");
    return res.status(500).json({ error: "Payment gateway not configured" });
  }

  const body = readJsonBody(req);
  const service = typeof body.service === "string" ? body.service : "";
  const variant =
    typeof body.variant === "string" && body.variant
      ? body.variant
      : DEFAULT_VARIANT;
  const currency = "INR";

  const rupees = getPriceInRupees(service, variant);
  if (rupees === null) {
    return res.status(400).json({ error: "Unknown service or variant" });
  }

  const amount = Math.round(rupees * 100);

  // Guards against a mispriced catalogue entry reaching Razorpay.
  if (!Number.isInteger(amount) || amount < MIN_AMOUNT_PAISE) {
    console.error("Configured price is invalid for", service, variant);
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
        ...((body.notes as Record<string, string>) ?? {}),
        // Recorded server-side so the dashboard shows what was actually sold.
        service: getServiceLabel(service) ?? service,
        variant,
      },
    });

    return res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      // The key id is publishable — Checkout needs it in the browser.
      key_id: RAZORPAY_KEY_ID,
    });
  } catch (error: unknown) {
    const status = (error as { statusCode?: number })?.statusCode;
    const description = (error as { error?: { description?: string } })?.error
      ?.description;

    console.error("Razorpay order creation failed", status, description);

    // Bad or revoked API keys come back as 401 from Razorpay.
    if (status === 401) {
      return res.status(401).json({ error: "Payment gateway authentication failed" });
    }

    return res.status(500).json({ error: "Could not create payment order" });
  }
}
