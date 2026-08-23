import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "node:crypto";
import { readJsonBody, readJsonResponse, requirePost } from "./_razorpay.js";

/**
 * POST /api/kundli-pdf
 *
 * Delivers the paid kundli report so the customer keeps it permanently:
 *
 *   1. VedicAstro renders the PDF (its own link expires in ~2 hours);
 *   2. the file is uploaded to the Prospect IQ media library, which returns a
 *      permanent, public CDN URL — no local disk, so this works on Vercel and
 *      on a self-hosted server alike;
 *   3. Prospect IQ emails the customer with the PDF attached;
 *   4. the CDN URL is returned so the browser downloads and opens it too.
 *
 * The Razorpay signature is re-verified here, so the report cannot be obtained
 * by replaying the request without a real payment.
 */

const BASE_URL = "https://api.vedicastroapi.com/v3-json";
const PIQ_BASE = "https://services.leadconnectorhq.com";

const API_KEY = process.env.VEDICASTRO_API_KEY;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const PIQ_TOKEN = process.env.PROSPECTIQ_PRIVATE_TOKEN;
const PIQ_LOCATION = process.env.PROSPECTIQ_LOCATION_ID;
const PIQ_FROM = process.env.PROSPECTIQ_EMAIL_FROM || "myjyotishnow@gmail.com";

// NOTE: "prediction" is singular. VedicAstro's own Postman docs say
// "predictions", which the API rejects with 400 "Invalid PDF Size".
const PDF_TYPES = ["small", "medium", "large", "prediction"] as const;

const BRAND = {
  company_name: process.env.PDF_COMPANY_NAME || "JyotishNow",
  address: process.env.PDF_ADDRESS || "Dr. Sandeep Sawhney, Ambala, Haryana, India",
  website: process.env.PDF_WEBSITE || "www.jyotishnow.com",
  email: process.env.PDF_EMAIL || "myjyotishnow@gmail.com",
  phone: process.env.PDF_PHONE || "+91 7015544187",
};

const piqHeaders = () => ({
  Authorization: `Bearer ${PIQ_TOKEN}`,
  Version: "2021-07-28",
});

const paymentIsValid = (body: Record<string, unknown>): boolean => {
  const orderId = String(body.razorpay_order_id ?? "");
  const paymentId = String(body.razorpay_payment_id ?? "");
  const signature = String(body.razorpay_signature ?? "");
  if (!orderId || !paymentId || !signature || !RAZORPAY_KEY_SECRET) return false;
  const expected = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

const safeName = (name: string) =>
  (name || "Kundli").replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 60);

/** Uploads the PDF to Prospect IQ and returns its permanent CDN URL. */
const uploadToProspectIQ = async (
  bytes: Buffer,
  fileName: string,
): Promise<{ url: string; fileId: string } | null> => {
  if (!PIQ_TOKEN || !PIQ_LOCATION) return null;
  try {
    const form = new FormData();
    form.append(
      "file",
      new Blob([new Uint8Array(bytes)], { type: "application/pdf" }),
      fileName,
    );
    form.append("hosted", "false");
    form.append("name", fileName);

    const response = await fetch(
      `${PIQ_BASE}/medias/upload-file?altId=${PIQ_LOCATION}&altType=location`,
      { method: "POST", headers: piqHeaders(), body: form },
    );
    const data = await readJsonResponse(response);
    if (!response.ok || !data.url) {
      console.error("[kundli-pdf] media upload failed", response.status, data);
      return null;
    }
    return { url: String(data.url), fileId: String(data.fileId ?? "") };
  } catch (error) {
    console.error("[kundli-pdf] media upload threw", error);
    return null;
  }
};

/** Emails the report with the PDF attached, via Prospect IQ Conversations. */
const emailReport = async (
  to: string,
  customerName: string,
  pdfUrl: string,
): Promise<boolean> => {
  if (!PIQ_TOKEN || !PIQ_LOCATION || !to) return false;
  try {
    const headers = { ...piqHeaders(), "Content-Type": "application/json" };

    // A conversation message needs a contact to attach to.
    const upsert = await fetch(`${PIQ_BASE}/contacts/upsert`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        locationId: PIQ_LOCATION,
        email: to,
        name: customerName,
        tags: ["Paid: Kundli PDF", "Kundli PDF Delivered"],
      }),
    });
    const contact = await readJsonResponse(upsert);
    const contactId = contact?.contact?.id ?? contact?.id;
    if (!contactId) {
      console.error("[kundli-pdf] could not resolve contact for email");
      return false;
    }

    const html = `
      <div style="font-family:Arial,sans-serif;background:#fdfbf7;padding:24px">
        <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e6d5b8;border-radius:16px;overflow:hidden">
          <div style="background:#7A0808;padding:24px;text-align:center;color:#fff">
            <h1 style="margin:0;font-family:serif;font-size:24px">JyotishNow</h1>
            <p style="margin:6px 0 0;color:#f5c27a;font-size:12px;letter-spacing:1px;text-transform:uppercase">Your Kundli Report</p>
          </div>
          <div style="padding:24px;color:#333;line-height:1.6">
            <p>Namaste ${customerName},</p>
            <p>Your personalised Kundli report is attached to this email, and is yours to keep.</p>
            <p style="text-align:center;margin:28px 0">
              <a href="${pdfUrl}" style="background:#7A0808;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:bold;display:inline-block">Download your Kundli PDF</a>
            </p>
            <p style="font-size:13px;color:#666">If the button does not work, copy this link:<br>${pdfUrl}</p>
            <p style="margin-top:24px">With warm regards,<br><strong>Dr. Sandeep Sawhney</strong><br>JyotishNow</p>
          </div>
        </div>
      </div>`;

    const send = await fetch(`${PIQ_BASE}/conversations/messages`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        type: "Email",
        contactId,
        subject: "Your JyotishNow Kundli Report",
        html,
        emailFrom: PIQ_FROM,
        attachments: [pdfUrl],
      }),
    });
    if (!send.ok) {
      console.error("[kundli-pdf] email send failed", send.status, await send.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error("[kundli-pdf] email delivery threw", error);
    return false;
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requirePost(req, res)) return;

  if (!API_KEY) {
    console.error("VEDICASTRO_API_KEY is not configured");
    return res.status(500).json({ error: "Astrology service not configured" });
  }

  const body = readJsonBody(req);

  if (!paymentIsValid(body)) {
    return res.status(402).json({ error: "Valid payment required for PDF export" });
  }

  const missing = (["dob", "tob", "lat", "lon", "tz", "name"] as const).filter(
    (k) => !body[k] && body[k] !== 0,
  );
  if (missing.length) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
  }

  const pdfType = String(body.pdf_type ?? "large");
  if (!PDF_TYPES.includes(pdfType as (typeof PDF_TYPES)[number])) {
    return res.status(400).json({ error: `pdf_type must be one of: ${PDF_TYPES.join(", ")}` });
  }

  const params = new URLSearchParams({
    api_key: API_KEY,
    name: String(body.name),
    dob: String(body.dob),
    tob: String(body.tob),
    lat: String(body.lat),
    lon: String(body.lon),
    tz: String(body.tz),
    pob: String(body.pob ?? ""),
    lang: String(body.lang ?? "en"),
    style: String(body.style ?? "north"),
    color: String(body.color ?? "140"),
    pdf_type: pdfType,
    ...BRAND,
  });

  try {
    const queued = await fetch(`${BASE_URL}/pdf/horoscope-queue?${params}`);
    const data = await readJsonResponse(queued);
    const status = Number(data.status ?? queued.status);

    if (status === 402) {
      console.error("[kundli-pdf] VedicAstro out of credits");
      return res.status(502).json({
        error: "Astrology service unavailable",
        detail: String(data.response ?? "subscription exhausted"),
        code: "UPSTREAM_CREDITS",
      });
    }
    if (status >= 400 || typeof data.response !== "string") {
      console.error("[kundli-pdf] generation failed", status, data.response);
      return res.status(502).json({
        error: "Could not generate the report",
        detail: String(data.response ?? status),
      });
    }
    if (typeof data.remaining_calls === "number") {
      console.log(`[kundli-pdf] ${data.remaining_calls} upstream calls remaining`);
    }

    // Fetch before the upstream link expires.
    const file = await fetch(data.response as string);
    if (!file.ok) {
      return res.status(502).json({ error: "Report generated but could not be retrieved" });
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    const fileName = `JyotishNow_Kundli_${safeName(String(body.name))}.pdf`;

    // Re-host permanently on Prospect IQ's CDN.
    const stored = await uploadToProspectIQ(bytes, fileName);
    if (!stored) {
      return res.status(502).json({
        error: "Report generated but could not be stored",
        code: "STORAGE_FAILED",
      });
    }

    const emailed = await emailReport(
      String(body.email ?? ""),
      String(body.name),
      stored.url,
    );

    return res.status(200).json({
      ok: true,
      downloadUrl: stored.url,
      fileId: stored.fileId,
      fileName,
      emailed,
      sizeBytes: bytes.length,
      pdfType,
    });
  } catch (error) {
    console.error("[kundli-pdf] request failed", error);
    return res.status(502).json({ error: "Report generation failed" });
  }
}
