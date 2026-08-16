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
      <div style="font-family: Arial, sans-serif; background-color: #fdfbf7; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e6d5b8; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #7A0808, #5A0606); padding: 25px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-family: serif; font-size: 26px;">JyotishNow</h1>
            <p style="margin: 5px 0 0; color: #f5c27a; font-size: 13px; font-weight: bold; text-transform: uppercase;">Official Payment Receipt</p>
          </div>
          <div style="padding: 25px; color: #333333; line-height: 1.6;">
            <h2 style="color: #7A0808; font-family: serif; margin-top: 0;">Payment Successful ✅</h2>
            <p>Thank you for choosing <strong>JyotishNow</strong>. Here is your payment receipt:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
              <tr style="border-bottom: 1px solid #eeeeee;">
                <td style="padding: 10px 0; color: #666666;">Service:</td>
                <td style="padding: 10px 0; font-weight: bold; text-align: right; color: #7A0808;">${serviceName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #eeeeee;">
                <td style="padding: 10px 0; color: #666666;">Amount Paid:</td>
                <td style="padding: 10px 0; font-weight: bold; text-align: right; color: #2e7d32; font-size: 16px;">${amountStr}</td>
              </tr>
              <tr style="border-bottom: 1px solid #eeeeee;">
                <td style="padding: 10px 0; color: #666666;">Payment ID:</td>
                <td style="padding: 10px 0; font-weight: bold; text-align: right; font-family: monospace;">${paymentId}</td>
              </tr>
              <tr style="border-bottom: 1px solid #eeeeee;">
                <td style="padding: 10px 0; color: #666666;">Order ID:</td>
                <td style="padding: 10px 0; font-weight: bold; text-align: right; font-family: monospace;">${orderId}</td>
              </tr>
              <tr style="border-bottom: 1px solid #eeeeee;">
                <td style="padding: 10px 0; color: #666666;">Customer Name:</td>
                <td style="padding: 10px 0; font-weight: bold; text-align: right;">${customerName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #eeeeee;">
                <td style="padding: 10px 0; color: #666666;">Customer Email:</td>
                <td style="padding: 10px 0; font-weight: bold; text-align: right;">${customerEmail || 'N/A'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #eeeeee;">
                <td style="padding: 10px 0; color: #666666;">Customer Phone:</td>
                <td style="padding: 10px 0; font-weight: bold; text-align: right;">${customerPhone || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #666666;">Status:</td>
                <td style="padding: 10px 0; font-weight: bold; text-align: right; color: #2e7d32;">CONFIRMED & PAID</td>
              </tr>
            </table>
          </div>
        </div>
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
