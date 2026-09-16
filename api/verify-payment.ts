import type { VercelRequest, VercelResponse } from "@vercel/node";
import { hasCredentials, readJsonBody, requirePost } from "./_razorpay.js";
import { recordPaymentInCrm } from "./_crm.js";
import { TEST_TAG, fetchPaidOrder, isTestMode, signatureIsValid } from "./_payments.js";
import { ghlLocation, ghlToken, upsertContact } from "./_ghl.js";
import { formatINR, getServiceLabel } from "../shared/pricing.js";
import { ADDON_BASE_SERVICES, formatSlotIST } from "../shared/consultation.js";

/**
 * POST /api/verify-payment
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, customer?: { name, email, phone } }
 * Returns: { verified: true, payment_id, order_id, receiptDetails, ... }
 *
 * Confirms the payment with Razorpay and sends the receipt. What was bought and
 * what was paid come from the Razorpay order, never from the request body, so
 * a receipt can't be made to show a different product or amount.
 *
 * CRM: reports and consultations are recorded by the endpoints that fulfil
 * them (/api/kundli-pdf, /api/matchmaking-pdf, /api/book-consultation), each at
 * its own price — recording them here too would double-count the sale. Only
 * orders nothing else fulfils are recorded here.
 */

const PIQ_BASE = "https://services.leadconnectorhq.com";
const SUPPORT_EMAIL = "myjyotishnow@gmail.com";
const SUPPORT_PHONE = "+91 70155 44187";

const esc = (v: string) =>
  v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

const row = (label: string, value: string, style = "") => `
                <tr>
                  <td style="padding:6px 0;border-bottom:1px solid #f0f0f0;color:#777777;white-space:nowrap;vertical-align:top;">${label}</td>
                  <td style="padding:6px 0 6px 12px;border-bottom:1px solid #f0f0f0;text-align:right;${style}">${value}</td>
                </tr>`;

type Receipt = {
  items: { label: string; rupees: number }[];
  amountStr: string;
  paymentId: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  callTime: string | null;
  testMode: boolean;
};

const receiptHtml = (r: Receipt) => `
      <div style="margin:0;padding:12px;background:#fdfbf7;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;text-size-adjust:100%;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e6d5b8;border-radius:12px;border-collapse:separate;overflow:hidden;">
          <tr>
            <td style="background:#7A0808;padding:14px 16px;text-align:center;">
              <div style="font-family:Georgia,serif;font-size:20px;line-height:24px;color:#ffffff;font-weight:bold;">JyotishNow</div>
              <div style="font-size:10px;line-height:14px;color:#f5c27a;letter-spacing:.5px;text-transform:uppercase;margin-top:2px;">${r.testMode ? "TEST receipt · no money was charged" : "Official Payment Receipt"}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:16px;">
              <div style="font-size:15px;line-height:20px;color:#2e7d32;font-weight:bold;margin:0 0 4px;">Payment Successful</div>
              <div style="font-size:12px;line-height:17px;color:#555555;margin:0 0 12px;">Thank you for choosing JyotishNow. Here is your receipt.</div>

              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;font-size:12px;line-height:16px;">
                ${r.items.map((i) => row(esc(i.label), formatINR(i.rupees), "color:#7A0808;font-weight:bold;")).join("")}
                ${r.callTime ? row("Your call", esc(r.callTime), "font-weight:bold;") : ""}
                ${row("Amount Paid", esc(r.amountStr), "color:#2e7d32;font-weight:bold;font-size:14px;")}
                ${row("Payment ID", esc(r.paymentId), "font-family:monospace;font-size:11px;word-break:break-all;")}
                ${row("Order ID", esc(r.orderId), "font-family:monospace;font-size:11px;word-break:break-all;")}
                ${row("Name", esc(r.customerName))}
                ${row("Email", esc(r.customerEmail || "N/A"), "word-break:break-all;")}
                ${row("Phone", esc(r.customerPhone || "N/A"))}
                <tr>
                  <td style="padding:6px 0;color:#777777;white-space:nowrap;">Status</td>
                  <td style="padding:6px 0;text-align:right;color:#2e7d32;font-weight:bold;">CONFIRMED &amp; PAID</td>
                </tr>
              </table>

              <div style="margin-top:14px;padding-top:10px;border-top:1px solid #f0f0f0;font-size:11px;line-height:15px;color:#888888;text-align:center;">
                Dr. Sandeep Sawhney &middot; JyotishNow<br>
                ${SUPPORT_EMAIL} &middot; ${SUPPORT_PHONE}
              </div>
            </td>
          </tr>
        </table>
      </div>
    `;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requirePost(req, res)) return;

  try {
    if (!hasCredentials()) {
      console.error("Razorpay credentials are not configured");
      return res.status(500).json({ error: "Payment gateway not configured" });
    }

    const body = readJsonBody(req);
    const orderId = String(body.razorpay_order_id || "");
    const paymentId = String(body.razorpay_payment_id || "");
    const signature = String(body.razorpay_signature || "");

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({
        error: "razorpay_order_id, razorpay_payment_id and razorpay_signature are required",
      });
    }
    if (!signatureIsValid(orderId, paymentId, signature)) {
      console.warn("Razorpay signature mismatch for order", orderId);
      return res.status(400).json({ error: "Payment verification failed" });
    }

    // The signature is authentic; confirm the payment itself and read what
    // the order was for.
    const paid = await fetchPaidOrder(orderId, paymentId);
    if (paid.ok === false) {
      return res.status(paid.status).json({ error: paid.error, retryable: paid.retryable });
    }
    const { quote, notes, amountRupees } = paid.order;
    const testMode = isTestMode();

    const customer =
      body.customer && typeof body.customer === "object" ? (body.customer as Record<string, unknown>) : {};
    const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
    const customerName = str(customer.name || body.name, 100) || "Valued Client";
    const customerEmail = str(customer.email || body.email, 200);
    const customerPhone = str(customer.phone || body.phone, 20);

    const items = quote
      ? quote.lines.map((l) => ({ label: l.label, rupees: l.rupees }))
      : [{ label: (notes.service && getServiceLabel(notes.service)) || "JyotishNow Service", rupees: amountRupees }];
    const serviceName = items.map((i) => i.label).join(" + ");
    const amountStr = formatINR(amountRupees);
    const callTime = quote?.consultation && notes.slot ? formatSlotIST(notes.slot) : null;
    const receipt: Receipt = {
      items, amountStr, paymentId, orderId, customerName, customerEmail, customerPhone, callTime, testMode,
    };
    const subject = `${testMode ? "[TEST] " : ""}Receipt: ${serviceName} (${amountStr}) - JyotishNow`;
    const html = receiptHtml(receipt);

    const hasEmail = customerEmail.includes("@");
    let receiptSent = false;

    // 1. Receipt through Prospect IQ, on the customer's own contact record.
    const token = ghlToken();
    if (token && (hasEmail || customerPhone)) {
      try {
        const contactId = await upsertContact({
          name: customerName,
          email: hasEmail ? customerEmail : undefined,
          phone: customerPhone || undefined,
          tags: ["Paid Client", `Paid: ${serviceName}`, "Payment Receipt Sent", testMode ? TEST_TAG : ""],
        });

        if (contactId) {
          const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Version: "2021-07-28" };
          // Test payments don't text real phones.
          if (customerPhone && !testMode) {
            const text = `*JyotishNow Payment Receipt*\n*Service:* ${serviceName}\n*Amount Paid:* ${amountStr}\n${callTime ? `*Your call:* ${callTime}\n` : ""}*Payment ID:* ${paymentId}\n*Status:* CONFIRMED\n\nThank you for choosing JyotishNow (Dr. Sandeep Sawhney)! Support: ${SUPPORT_EMAIL} / ${SUPPORT_PHONE}.`;
            await fetch(`${PIQ_BASE}/conversations/messages`, {
              method: "POST",
              headers,
              body: JSON.stringify({ type: "SMS", contactId, message: text, locationId: ghlLocation() }),
              signal: AbortSignal.timeout(20_000),
            }).catch((e) => console.error("[verify-payment] SMS receipt failed", (e as Error).message));
          }
          if (hasEmail) {
            const sent = await fetch(`${PIQ_BASE}/conversations/messages`, {
              method: "POST",
              headers,
              body: JSON.stringify({
                type: "Email",
                contactId,
                // Same sender as the report email, so moving to a verified
                // domain is one env change rather than a hunt through the code.
                emailFrom: process.env.PROSPECTIQ_EMAIL_FROM || SUPPORT_EMAIL,
                subject,
                html,
                locationId: ghlLocation(),
              }),
              signal: AbortSignal.timeout(20_000),
            });
            receiptSent = sent.ok;
            if (!sent.ok) console.error("[verify-payment] email receipt failed", sent.status);
          }
        }
      } catch (err) {
        console.error("[verify-payment] Prospect IQ receipt failed", (err as Error).message);
      }
    }

    // 2. Admin copy (and a fallback customer copy) via Resend, if configured.
    const resendApiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL || "";
    const recipients = [adminEmail, !receiptSent && hasEmail ? customerEmail : ""].filter(Boolean);
    if (resendApiKey && recipients.length > 0) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from: "JyotishNow Receipts <onboarding@resend.dev>", to: recipients, subject, html }),
          signal: AbortSignal.timeout(20_000),
        });
      } catch (emailErr) {
        console.error("[verify-payment] Resend receipt failed", (emailErr as Error).message);
      }
    }

    // WhatsApp share links for the success screen.
    const waText = (title: string) =>
      encodeURIComponent(
        `*${title}*\n*Service:* ${serviceName}\n*Amount:* ${amountStr}\n${callTime ? `*Call:* ${callTime}\n` : ""}*Payment ID:* ${paymentId}\n*Order ID:* ${orderId}\n*Customer:* ${customerName}\n*Status:* PAID & CONFIRMED`,
      );
    const whatsappAdminUrl = `https://wa.me/917015544187?text=${waText("JyotishNow Payment Notification")}`;
    const digits = customerPhone.replace(/\D/g, "");
    const custPhone = digits.length === 10 ? `91${digits}` : digits;
    const whatsappCustomerUrl = custPhone
      ? `https://wa.me/${custPhone}?text=${waText("JyotishNow Payment Receipt")}`
      : whatsappAdminUrl;

    // Record the sale only where no fulfilment endpoint will.
    const fulfilledElsewhere =
      !!notes.service && (ADDON_BASE_SERVICES.has(notes.service) || !!quote?.consultation);
    if (!fulfilledElsewhere) {
      void recordPaymentInCrm({
        email: hasEmail ? customerEmail : undefined,
        phone: customerPhone || undefined,
        name: customerName,
        service: notes.service ?? undefined,
        serviceLabel: serviceName,
        amountRupees,
        paymentId,
        orderId,
      });
    }

    return res.status(200).json({
      verified: true,
      test_mode: testMode,
      order_id: orderId,
      payment_id: paymentId,
      whatsappAdminUrl,
      whatsappCustomerUrl,
      receiptDetails: {
        customerName,
        customerEmail,
        customerPhone,
        serviceName,
        amountStr,
        callTime,
        receiptSent,
      },
    });
  } catch (err: unknown) {
    console.error("[verify-payment Exception]", err);
    return res.status(500).json({ error: "Payment verification failed" });
  }
}
