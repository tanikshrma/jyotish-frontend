import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "node:crypto";
import {
  RAZORPAY_KEY_SECRET,
  hasCredentials,
  readJsonBody,
  requirePost,
} from "./_razorpay.js";

/**
 * POST /api/verify-payment
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 * Returns: { verified: true, payment_id, order_id } on a signature match.
 *
 * Razorpay signs `order_id|payment_id` with HMAC-SHA256 keyed by the API
 * secret. A mismatch means the client fabricated or tampered with the result:
 * answer 400 and treat the payment as unpaid.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requirePost(req, res)) return;

  if (!hasCredentials()) {
    console.error("Razorpay credentials are not configured");
    return res.status(500).json({ error: "Payment gateway not configured" });
  }

  const body = readJsonBody(req);
  const orderId = body.razorpay_order_id;
  const paymentId = body.razorpay_payment_id;
  const signature = body.razorpay_signature;

  if (
    typeof orderId !== "string" ||
    typeof paymentId !== "string" ||
    typeof signature !== "string" ||
    !orderId ||
    !paymentId ||
    !signature
  ) {
    return res.status(400).json({
      error:
        "razorpay_order_id, razorpay_payment_id and razorpay_signature are required",
    });
  }

  const expected = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET as string)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  // Compare in constant time. timingSafeEqual throws on a length mismatch, so
  // guard on length first — a wrong length is already a failed match.
  const expectedBuf = Buffer.from(expected, "utf8");
  const receivedBuf = Buffer.from(signature, "utf8");
  const verified =
    expectedBuf.length === receivedBuf.length &&
    crypto.timingSafeEqual(expectedBuf, receivedBuf);

  if (!verified) {
    console.warn("Razorpay signature mismatch for order", orderId);
    return res.status(400).json({ error: "Payment verification failed" });
  }

  // Payment is authentic. Hook order fulfilment & Prospect IQ CRM sync here.
  const token = process.env.PROSPECTIQ_PRIVATE_TOKEN || process.env.GHL_PRIVATE_TOKEN;
  const locationId = process.env.PROSPECTIQ_LOCATION_ID || "FTD8wmuYqCT7XoIpXJQG";

  if (token && body.customer && typeof body.customer === "object") {
    const customer = body.customer as Record<string, string>;
    try {
      await fetch("https://services.leadconnectorhq.com/contacts/upsert", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Version": "2021-07-28",
        },
        body: JSON.stringify({
          locationId,
          email: customer.email || "",
          phone: customer.phone || "",
          name: customer.name || "",
          tags: ["Paid Client", `Paid: ${body.service || "Consultation"}`],
          customFields: [
            { id: "payment_id", value: paymentId },
            { id: "order_id", value: orderId },
          ],
        }),
      });
    } catch (err) {
      console.error("[ProspectIQ Sync Error on Payment]", err);
    }
  }

  return res.status(200).json({
    verified: true,
    order_id: orderId,
    payment_id: paymentId,
  });
}
