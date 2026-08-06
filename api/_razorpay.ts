import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Server-side Razorpay helpers. This module must never be imported from
 * anything under src/ — RAZORPAY_KEY_SECRET lives here and must stay on the
 * server.
 */

export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

/** Razorpay rejects anything under 1 INR. */
export const MIN_AMOUNT_PAISE = 100;

export type ApiError = { error: string };

/**
 * Returns true when both credentials are present. Missing credentials are a
 * deployment problem, not a client problem, so callers answer 500 — except
 * where Razorpay itself rejects them, which is a 401.
 */
export const hasCredentials = () =>
  Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);

/** Rejects anything but POST, so the endpoints can't be triggered by a link. */
export const requirePost = (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" } satisfies ApiError);
    return false;
  }
  return true;
};

/**
 * Vercel parses JSON bodies automatically, but a raw string arrives when the
 * content-type is missing. Normalise both shapes.
 */
export const readJsonBody = (req: VercelRequest): Record<string, unknown> => {
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return (req.body ?? {}) as Record<string, unknown>;
};
