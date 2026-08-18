import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "node:crypto";
import { readJsonResponse } from "./_razorpay.js";
import { ASTRO_ENDPOINTS, isPaidEndpoint } from "../shared/astro-catalog.js";

/**
 * GET|POST /api/astro?endpoint=planet-details&dob=...&tob=...&lat=...&lon=...&tz=...
 *
 * Server-side proxy for VedicAstroAPI. Exists for three reasons:
 *
 *  1. The API key never reaches the browser. It used to be inlined in
 *     src/lib/vedicAstroApi.ts, visible to every visitor, who could then spend
 *     the plan's credits.
 *  2. `endpoint` is resolved through an allow-list (shared/astro-catalog.ts),
 *     so a tampered client cannot reach arbitrary upstream paths.
 *  3. Paid endpoints (PDF exports, AI predictions) require proof of a verified
 *     Razorpay payment, so the costly calls can't be triggered for free.
 */

const BASE_URL = "https://api.vedicastroapi.com/v3-json";
const API_KEY = process.env.VEDICASTRO_API_KEY;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

/**
 * Paid endpoints must carry a Razorpay order/payment/signature triple. It is
 * re-verified here rather than trusted, so a client cannot claim to have paid.
 */
const hasValidPayment = (body: Record<string, unknown>): boolean => {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const source: Record<string, unknown> = {
    ...(req.query ?? {}),
    ...(typeof req.body === "object" && req.body ? req.body : {}),
  };

  const key = String(source.endpoint ?? "");
  const definition = ASTRO_ENDPOINTS[key];

  if (!definition) {
    return res.status(400).json({
      error: "Unknown endpoint",
      available: Object.keys(ASTRO_ENDPOINTS),
    });
  }

  if (!API_KEY) {
    console.error("VEDICASTRO_API_KEY is not configured");
    return res.status(500).json({ error: "Astrology service not configured" });
  }

  if (isPaidEndpoint(key) && !hasValidPayment(source)) {
    return res.status(402).json({
      error: "This report requires payment",
      tier: "paid",
      endpoint: key,
    });
  }

  // Forward only the params this endpoint declares — nothing else reaches
  // upstream, so the api_key can never be overridden by the caller.
  const params = new URLSearchParams({ api_key: API_KEY });
  for (const name of definition.params) {
    const value = source[name];
    if (value !== undefined && value !== null && String(value) !== "") {
      params.set(name, String(value));
    }
  }
  if (!params.has("lang")) params.set("lang", "en");

  const url = `${BASE_URL}/${definition.path}?${params.toString()}`;

  try {
    const upstream = await fetch(url);
    const contentType = upstream.headers.get("content-type") ?? "";

    // chart-image can return a raw SVG string rather than JSON.
    if (!contentType.includes("application/json")) {
      const text = await upstream.text();
      res.setHeader("Content-Type", contentType || "text/plain");
      res.setHeader("Cache-Control", "public, s-maxage=3600");
      return res.status(upstream.status).send(text);
    }

    const data = await readJsonResponse(upstream);

    // VedicAstro answers 200 with an in-body status; surface real failures.
    const upstreamStatus = Number(data.status ?? upstream.status);
    if (upstreamStatus === 402) {
      console.error("[astro] VedicAstro out of credits:", data.response);
      return res.status(502).json({
        error: "Astrology service unavailable",
        detail: String(data.response ?? "subscription exhausted"),
        code: "UPSTREAM_CREDITS",
      });
    }
    if (upstreamStatus >= 400) {
      return res.status(502).json({
        error: "Astrology service error",
        detail: String(data.response ?? upstreamStatus),
      });
    }

    // Birth-chart results are immutable for a given input — cache hard so the
    // plan's credits are spent once per unique chart, not once per page view.
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=86400, stale-while-revalidate=604800",
    );
    return res.status(200).json(data);
  } catch (error) {
    console.error("[astro] request failed", error);
    return res.status(502).json({ error: "Astrology service request failed" });
  }
}
