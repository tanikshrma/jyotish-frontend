import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "node:crypto";
import { readJsonBody, readJsonResponse, requirePost } from "./_razorpay.js";
import { createJob, isStale, readJob, updateJob, type DeliveredPdf } from "./_jobs.js";
import {
  BRAND,
  emailReport,
  fetchWhenReady,
  jobResponse,
  safeName,
  uploadToProspectIQ,
} from "./kundli-pdf.js";

/**
 * POST /api/matchmaking-pdf
 *
 * Paid Ashtakoot matchmaking report, rendered by VedicAstro's
 * `pdf/matching-queue`. Same delivery contract as the kundli export:
 *
 *   1. verify the Razorpay signature,
 *   2. create a job and return 202 immediately,
 *   3. render, re-host on the Prospect IQ CDN and email in the background.
 *
 * Returning immediately matters here for the same reason it does for the
 * kundli bundle: the render takes far longer than Cloudflare's 100s ceiling
 * would allow, and a timeout after payment loses the order.
 *
 * Progress is polled through the shared /api/kundli-pdf-status endpoint, since
 * both report types share one job store.
 */

const BASE_URL = "https://api.vedicastroapi.com/v3-json";
const API_KEY = process.env.VEDICASTRO_API_KEY;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const REPORT_NAME = "Kundli Matching Report";

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

/** Both charts are required — a match cannot be computed from one. */
const REQUIRED = [
  "boy_name", "boy_dob", "boy_tob", "boy_lat", "boy_lon", "boy_tz",
  "girl_name", "girl_dob", "girl_tob", "girl_lat", "girl_lon", "girl_tz",
] as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requirePost(req, res)) return;

  if (!API_KEY) {
    console.error("VEDICASTRO_API_KEY is not configured");
    return res.status(500).json({ error: "Astrology service not configured" });
  }

  const body = readJsonBody(req);

  if (!paymentIsValid(body)) {
    return res.status(402).json({ error: "Valid payment required for the matching report" });
  }

  const missing = REQUIRED.filter((k) => !body[k] && body[k] !== 0);
  if (missing.length) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
  }

  const paymentId = String(body.razorpay_payment_id ?? "");
  const orderId = String(body.razorpay_order_id ?? "");

  // Idempotent per payment: a refresh or retry returns the same job rather
  // than regenerating and spending another PDF credit.
  const existing = await readJob(paymentId);
  if (existing && !isStale(existing)) {
    return res.status(existing.status === "pending" ? 202 : 200).json(jobResponse(existing));
  }

  const job = await createJob(paymentId, orderId, "matchmaking-pdf", REPORT_NAME);
  res.status(202).json(jobResponse(job));

  // --- background work, deliberately not awaited ---------------------------
  void (async () => {
    try {
      const params = new URLSearchParams({
        api_key: API_KEY,
        boy_name: String(body.boy_name),
        boy_dob: String(body.boy_dob),
        boy_tob: String(body.boy_tob),
        boy_lat: String(body.boy_lat),
        boy_lon: String(body.boy_lon),
        boy_tz: String(body.boy_tz),
        boy_pob: String(body.boy_pob ?? ""),
        girl_name: String(body.girl_name),
        girl_dob: String(body.girl_dob),
        girl_tob: String(body.girl_tob),
        girl_lat: String(body.girl_lat),
        girl_lon: String(body.girl_lon),
        girl_tz: String(body.girl_tz),
        girl_pob: String(body.girl_pob ?? ""),
        lang: String(body.lang ?? "en"),
        style: String(body.style ?? "north"),
        color: String(body.color ?? "140"),
        ...BRAND,
      });

      const queued = await fetch(`${BASE_URL}/pdf/matching-queue?${params}`);
      const data = await readJsonResponse(queued);
      const status = Number(data.status ?? queued.status);

      if (status === 402) {
        console.error("[matchmaking-pdf] VedicAstro out of credits");
        await updateJob(paymentId, {
          status: "failed",
          error: String(data.response ?? "subscription exhausted"),
          code: "UPSTREAM_CREDITS",
        });
        return;
      }
      if (status >= 400 || typeof data.response !== "string") {
        console.error("[matchmaking-pdf] generation failed", status, data.response);
        await updateJob(paymentId, {
          status: "failed",
          error: String(data.response ?? "Could not generate the report"),
        });
        return;
      }
      if (typeof data.remaining_pdf_calls === "number") {
        console.log(`[matchmaking-pdf] ${data.remaining_pdf_calls} matching PDF calls remaining`);
      }

      // The upstream link is only valid for ~2 hours and its S3 path contains
      // spaces, both handled by fetchWhenReady.
      const rendered = await fetchWhenReady(String(data.response));
      if (!rendered) {
        await updateJob(paymentId, {
          status: "failed",
          error: "Report generated but could not be retrieved",
        });
        return;
      }
      const bytes = Buffer.from(await rendered.arrayBuffer());

      const fileName = `JyotishNow_Kundli_Matching_${safeName(String(body.boy_name))}_${safeName(String(body.girl_name))}.pdf`;
      const stored = await uploadToProspectIQ(bytes, fileName);
      if (!stored) {
        await updateJob(paymentId, {
          status: "failed",
          error: "Report generated but could not be stored",
          code: "STORAGE_FAILED",
        });
        return;
      }

      const pdfs: DeliveredPdf[] = [{ name: REPORT_NAME, url: stored.url, fileName }];
      const emailed = await emailReport(
        String(body.email ?? ""),
        `${body.boy_name} & ${body.girl_name}`,
        REPORT_NAME,
        pdfs,
      );

      await updateJob(paymentId, { status: "ready", pdfs, emailed });
      console.log(`[matchmaking-pdf] job ready for ${paymentId} (emailed=${emailed})`);
    } catch (error) {
      console.error("[matchmaking-pdf] background generation failed", error);
      await updateJob(paymentId, {
        status: "failed",
        error: "Report generation failed",
      }).catch(() => {});
    }
  })();
}
