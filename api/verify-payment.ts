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

  const customer = (body.customer && typeof body.customer === "object") ? body.customer : {};
  const customerName = customer.name || body.name || "Valued Client";
  const customerEmail = customer.email || body.email || "";
  const customerPhone = customer.phone || body.phone || "";
  const serviceName = body.service || "Astrology Consultation";
  const amountStr = body.amount ? `₹${body.amount}` : "Paid";

  const adminEmail = "myjyotishnow@gmail.com";
  const adminPhone = "+917015544187";

  // 1. Send Email Receipt via Resend / API to Admin & Customer
  const resendApiKey = process.env.RESEND_API_KEY;
  const emailRecipients = [adminEmail];
  if (customerEmail && customerEmail.includes("@")) {
    emailRecipients.push(customerEmail);
  }

  const htmlEmailContent = `
    <div style="font-family: Arial, sans-serif; background-color: #fdfbf7; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e6d5b8; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #7A0808, #5A0606); padding: 25px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-family: serif; font-size: 26px;">JyotishNow</h1>
          <p style="margin: 5px 0 0; color: #f5c27a; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Official Payment Receipt & Confirmation</p>
        </div>
        
        <div style="padding: 25px; color: #333333; line-height: 1.6;">
          <h2 style="color: #7A0808; font-family: serif; margin-top: 0;">Payment Successful ✅</h2>
          <p>Thank you for choosing <strong>JyotishNow</strong>. Here is the complete payment receipt:</p>
          
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
          
          <div style="background: #FFFDF9; border: 1px solid #f5c27a; padding: 15px; border-radius: 10px; margin-top: 20px; font-size: 13px; color: #555555;">
            <p style="margin: 0;"><strong>Need Assistance?</strong> Email: <a href="mailto:${adminEmail}" style="color: #7A0808;">${adminEmail}</a> | Phone/WhatsApp: <a href="https://wa.me/917015544187" style="color: #7A0808;">${adminPhone}</a></p>
          </div>
        </div>
        
        <div style="background: #f8f5f0; padding: 15px; text-align: center; font-size: 12px; color: #888888;">
          &copy; ${new Date().getFullYear()} JyotishNow (Dr. Sandeep Sawhney). All rights reserved.
        </div>
      </div>
    </div>
  `;

  if (resendApiKey) {
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
      console.log("✅ Email receipt sent to:", emailRecipients);
    } catch (emailErr) {
      console.error("Failed to send email receipt via Resend:", emailErr);
    }
  }

  // 2. Sync Payment & Lead details to ProspectIQ CRM with Admin & Customer Notification Tags
  if (token) {
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
          email: customerEmail || "paid@jyotishnow.com",
          phone: customerPhone || "+917015544187",
          name: customerName,
          tags: [
            "Paid Client",
            `Paid: ${serviceName}`,
            `Payment Receipt Sent`,
            `Admin Copy Sent (${adminEmail})`
          ],
          customFields: [
            { id: "payment_id", value: paymentId },
            { id: "order_id", value: orderId },
            { id: "amount_paid", value: amountStr },
          ],
        }),
      });
    } catch (err) {
      console.error("[ProspectIQ Sync Error on Payment]", err);
    }
  }

  // 3. Format WhatsApp receipt URLs for admin and customer
  const adminWaText = encodeURIComponent(`*JyotishNow Payment Notification* 🔔\n--------------------------------\n*Service:* ${serviceName}\n*Amount:* ${amountStr}\n*Payment ID:* ${paymentId}\n*Order ID:* ${orderId}\n*Customer:* ${customerName}\n*Email:* ${customerEmail || 'N/A'}\n*Phone:* ${customerPhone || 'N/A'}\n*Status:* PAID & CONFIRMED ✅`);
  const whatsappAdminUrl = `https://wa.me/917015544187?text=${adminWaText}`;

  const cleanCustomerPhone = customerPhone.replace(/\D/g, "");
  const targetCustPhone = cleanCustomerPhone.length === 10 ? `91${cleanCustomerPhone}` : cleanCustomerPhone;
  const custWaText = encodeURIComponent(`*JyotishNow Payment Receipt* 📜\n--------------------------------\n*Service:* ${serviceName}\n*Amount Paid:* ${amountStr}\n*Payment ID:* ${paymentId}\n*Customer Name:* ${customerName}\n*Status:* CONFIRMED ✅\n\nThank you for choosing JyotishNow (Dr. Sandeep Sawhney)! For support, contact us at ${adminEmail} or ${adminPhone}.`);
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
}
