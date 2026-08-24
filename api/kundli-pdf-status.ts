import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isStale, readJobById } from "./_jobs.js";
import { jobResponse } from "./kundli-pdf.js";

/**
 * GET /api/kundli-pdf-status?jobId=<32 hex>
 *
 * Polled by the browser while the report renders. Generation runs in the
 * background precisely so this request stays fast and never trips Cloudflare's
 * 100s ceiling.
 *
 * The job id is derived from the Razorpay payment id, so it is unguessable and
 * needs no session — the customer can reopen the page and still collect their
 * report.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const jobId = String(
    (req.query?.jobId as string) ??
      (typeof req.body === "object" && req.body
        ? (req.body as Record<string, unknown>).jobId
        : "") ??
      "",
  );

  const job = await readJobById(jobId);
  if (!job) {
    return res.status(404).json({ error: "Unknown job", status: "unknown" });
  }

  // A process restart mid-render leaves a job pending forever; surface that
  // rather than letting the browser poll indefinitely.
  if (isStale(job)) {
    return res.status(200).json({
      ...jobResponse(job),
      status: "failed",
      ok: false,
      error: "Report generation timed out. Our team has your payment and will send it manually.",
    });
  }

  res.setHeader("Cache-Control", "no-store");
  return res.status(job.status === "pending" ? 202 : 200).json(jobResponse(job));
}
