import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "node:crypto";
import {
  RAZORPAY_KEY_SECRET,
  hasCredentials,
  readJsonBody,
  requirePost,
  readJsonResponse,
} from "./_razorpay.js";

/**
 * POST /api/verify-payment
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, customer?: { name, email, phone }, service?, amount? }
 * Returns: { verified: true, payment_id, order_id } on a signature match.
 */
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

    const secret = String(RAZORPAY_KEY_SECRET || "");
    if (!secret) {
      return res.status(500).json({ error: "Razorpay secret key missing" });
    }

    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const expectedBuf = Buffer.from(expected, "utf8");
    const receivedBuf = Buffer.from(signature, "utf8");
    const verified =
      expectedBuf.length === receivedBuf.length &&
      crypto.timingSafeEqual(expectedBuf, receivedBuf);

    if (!verified) {
      console.warn("Razorpay signature mismatch for order", orderId);
      return res.status(400).json({ error: "Payment verification failed" });
    }

    // Payment is authentic. Hook order fulfillment & Prospect IQ CRM sync here.
    const token = process.env.PROSPECTIQ_PRIVATE_TOKEN || process.env.GHL_PRIVATE_TOKEN;
    const locationId = process.env.PROSPECTIQ_LOCATION_ID || "FTD8wmuYqCT7XoIpXJQG";

    const customer = (body.customer && typeof body.customer === "object") ? (body.customer as Record<string, unknown>) : {};
    const customerName = String(customer.name || body.name || "Valued Client");
    const customerEmail = String(customer.email || body.email || "");
    const customerPhone = String(customer.phone || body.phone || "");
    const host = (req.headers && req.headers.host) ? String(req.headers.host) : "";
    const isLocalDev = process.env.NODE_ENV !== "production" || host.includes("localhost") || host.includes("127.0.0.1");

    const adminEmail = process.env.ADMIN_EMAIL || (isLocalDev ? "" : "myjyotishnow@gmail.com");
    const adminPhone = process.env.ADMIN_PHONE || (isLocalDev ? "" : "+917015544187");

    const serviceName = String(body.service || "Astrology Consultation");
    const rawAmount = body.amount ? String(body.amount) : "";
    const amountStr = rawAmount ? (rawAmount.startsWith("₹") ? rawAmount : `₹${rawAmount}`) : "Paid";

    const htmlEmailContent = `
      <div style="margin:0;padding:12px;background:#fdfbf7;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;text-size-adjust:100%;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e6d5b8;border-radius:12px;border-collapse:separate;overflow:hidden;">
          <tr>
            <td style="background:#7A0808;padding:14px 16px;text-align:center;">
              <div style="font-family:Georgia,serif;font-size:20px;line-height:24px;color:#ffffff;font-weight:bold;">JyotishNow</div>
              <div style="font-size:10px;line-height:14px;color:#f5c27a;letter-spacing:.5px;text-transform:uppercase;margin-top:2px;">Official Payment Receipt</div>
            </td>
          </tr>
          <tr>
            <td style="padding:16px;">
              <div style="font-size:15px;line-height:20px;color:#2e7d32;font-weight:bold;margin:0 0 4px;">Payment Successful</div>
              <div style="font-size:12px;line-height:17px;color:#555555;margin:0 0 12px;">Thank you for choosing JyotishNow. Here is your receipt.</div>

              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;font-size:12px;line-height:16px;">
                <tr>
                  <td style="padding:6px 0;border-bottom:1px solid #f0f0f0;color:#777777;white-space:nowrap;">Service</td>
                  <td style="padding:6px 0;border-bottom:1px solid #f0f0f0;text-align:right;color:#7A0808;font-weight:bold;">${serviceName}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;border-bottom:1px solid #f0f0f0;color:#777777;white-space:nowrap;">Amount Paid</td>
                  <td style="padding:6px 0;border-bottom:1px solid #f0f0f0;text-align:right;color:#2e7d32;font-weight:bold;font-size:14px;">${amountStr}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;border-bottom:1px solid #f0f0f0;color:#777777;white-space:nowrap;">Payment ID</td>
                  <td style="padding:6px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-family:monospace;font-size:11px;word-break:break-all;">${paymentId}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;border-bottom:1px solid #f0f0f0;color:#777777;white-space:nowrap;">Order ID</td>
                  <td style="padding:6px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-family:monospace;font-size:11px;word-break:break-all;">${orderId}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;border-bottom:1px solid #f0f0f0;color:#777777;white-space:nowrap;">Name</td>
                  <td style="padding:6px 0;border-bottom:1px solid #f0f0f0;text-align:right;">${customerName}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;border-bottom:1px solid #f0f0f0;color:#777777;white-space:nowrap;">Email</td>
                  <td style="padding:6px 0;border-bottom:1px solid #f0f0f0;text-align:right;word-break:break-all;">${customerEmail || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;border-bottom:1px solid #f0f0f0;color:#777777;white-space:nowrap;">Phone</td>
                  <td style="padding:6px 0;border-bottom:1px solid #f0f0f0;text-align:right;">${customerPhone || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#777777;white-space:nowrap;">Status</td>
                  <td style="padding:6px 0;text-align:right;color:#2e7d32;font-weight:bold;">CONFIRMED &amp; PAID</td>
                </tr>
              </table>

              <div style="margin-top:14px;padding-top:10px;border-top:1px solid #f0f0f0;font-size:11px;line-height:15px;color:#888888;text-align:center;">
                Dr. Sandeep Sawhney &middot; JyotishNow<br>
                myjyotishnow@gmail.com &middot; +91 7015544187
              </div>
            </td>
          </tr>
        </table>
      </div>
    `;

    // 1. Sync Contact & Trigger ProspectIQ Direct Email / SMS / WhatsApp Dispatch
    if (token) {
      try {
        const pHeaders = {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Version": "2021-07-28",
        };

        const contactRes = await fetch("https://services.leadconnectorhq.com/contacts/upsert", {
          method: "POST",
          headers: pHeaders,
          body: JSON.stringify({
            locationId,
            email: customerEmail || "paid@jyotishnow.com",
            phone: customerPhone || "+917015544187",
            name: customerName,
            tags: [
              "Paid Client",
              `Paid: ${serviceName}`,
              "Trigger WhatsApp Receipt",
              "Payment Receipt Sent",
              adminEmail ? `Admin Copy Sent (${adminEmail})` : "Local Dev Test"
            ],
            customFields: [
              { id: "payment_id", value: paymentId },
              { id: "order_id", value: orderId },
              { id: "amount_paid", value: amountStr },
            ],
          }),
        });

        const contactData = await readJsonResponse(contactRes);
        const contactId = contactData?.contact?.id || contactData?.id;

        if (contactId) {
          // Send Direct SMS/WhatsApp receipt via ProspectIQ Conversation API
          const textMessage = `*JyotishNow Payment Receipt* 📜\n--------------------------------\n*Service:* ${serviceName}\n*Amount Paid:* ${amountStr}\n*Payment ID:* ${paymentId}\n*Customer Name:* ${customerName}\n*Status:* CONFIRMED ✅\n\nThank you for choosing JyotishNow (Dr. Sandeep Sawhney)! For support, contact us at myjyotishnow@gmail.com or +91-7015544187.`;

          await fetch("https://services.leadconnectorhq.com/conversations/messages", {
            method: "POST",
            headers: pHeaders,
            body: JSON.stringify({
              type: "SMS",
              contactId,
              message: textMessage,
              locationId,
            }),
          });
          console.log("✅ Direct SMS/WhatsApp message queued via ProspectIQ for contact:", contactId);

          // Send Direct Email receipt via ProspectIQ Conversation API
          if (customerEmail && customerEmail.includes("@")) {
            await fetch("https://services.leadconnectorhq.com/conversations/messages", {
              method: "POST",
              headers: pHeaders,
              body: JSON.stringify({
                type: "Email",
                contactId,
                emailFrom: "myjyotishnow@gmail.com",
                subject: `Receipt: ${serviceName} (${amountStr}) - JyotishNow`,
                html: htmlEmailContent,
                locationId,
              }),
            });
            console.log("✅ Direct Email receipt queued via ProspectIQ for contact:", contactId);
          }
        }
      } catch (err) {
        console.error("[ProspectIQ Messaging Error on Payment]", err);
      }
    }

    // 2. Send Email Receipt via Resend API if RESEND_API_KEY is configured
    const resendApiKey = process.env.RESEND_API_KEY;
    const emailRecipients: string[] = [];
    if (adminEmail) emailRecipients.push(adminEmail);
    if (customerEmail && customerEmail.includes("@")) {
      emailRecipients.push(customerEmail);
    }

    if (resendApiKey && emailRecipients.length > 0) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "JyotishNow Receipts <onboarding@resend.dev>",
            to: emailRecipients,
            subject: `Receipt: ${serviceName} (${amountStr}) - JyotishNow`,
            html: htmlEmailContent,
          }),
        });
        console.log("✅ Email receipt sent via Resend to:", emailRecipients);
      } catch (emailErr) {
        console.error("Failed to send email receipt via Resend:", emailErr);
      }
    }

    // Format WhatsApp receipt URLs
    const adminWaText = encodeURIComponent(`*JyotishNow Payment Notification* 🔔\n--------------------------------\n*Service:* ${serviceName}\n*Amount:* ${amountStr}\n*Payment ID:* ${paymentId}\n*Order ID:* ${orderId}\n*Customer:* ${customerName}\n*Email:* ${customerEmail || 'N/A'}\n*Phone:* ${customerPhone || 'N/A'}\n*Status:* PAID & CONFIRMED ✅`);
    const whatsappAdminUrl = `https://wa.me/917015544187?text=${adminWaText}`;

    const cleanCustomerPhone = customerPhone.replace(/\D/g, "");
    const targetCustPhone = cleanCustomerPhone.length === 10 ? `91${cleanCustomerPhone}` : cleanCustomerPhone;
    const custWaText = encodeURIComponent(`*JyotishNow Payment Receipt* 📜\n--------------------------------\n*Service:* ${serviceName}\n*Amount Paid:* ${amountStr}\n*Payment ID:* ${paymentId}\n*Customer Name:* ${customerName}\n*Status:* CONFIRMED ✅\n\nThank you for choosing JyotishNow (Dr. Sandeep Sawhney)! For support, contact us at myjyotishnow@gmail.com or +91-7015544187.`);
    const whatsappCustomerUrl = targetCustPhone ? `https://wa.me/${targetCustPhone}?text=${custWaText}` : whatsappAdminUrl;

    return res.status(200).json({
      verified: true,
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
        adminEmail,
        adminPhone
      }
    });
  } catch (err: any) {
    console.error("[verify-payment Exception]", err);
    return res.status(500).json({
      error: "Payment verification failed",
      details: err?.message || String(err)
    });
  }
}
