import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "node:crypto";
import {
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET as RZP_SECRET,
  readJsonBody,
  readJsonResponse,
  requirePost,
} from "./_razorpay.js";
import {
  getKundliPdfTier,
  type KundliPdfTier,
  type KundliPdfType,
} from "../shared/pricing.js";
import { RUN_INLINE, createJob, isStale, readJob, updateJob, type DeliveredPdf } from "./_jobs.js";
import { recordPaymentInCrm } from "./_crm.js";
import { getPriceInRupees } from "../shared/pricing.js";

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

export const BRAND = {
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

export const safeName = (name: string) =>
  (name || "Kundli").replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 60);

/** Uploads the PDF to Prospect IQ and returns its permanent CDN URL. */
export const uploadToProspectIQ = async (
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

    // Bounded, with one retry: a stalled upload must not hang a paid order.
    let response: Response | null = null;
    for (let attempt = 1; attempt <= 2 && !response; attempt++) {
      try {
        response = await fetch(
          `${PIQ_BASE}/medias/upload-file?altId=${PIQ_LOCATION}&altType=location`,
          { method: "POST", headers: piqHeaders(), body: form, signal: AbortSignal.timeout(UPLOAD_TIMEOUT_MS) },
        );
      } catch (error) {
        console.error(`[kundli-pdf] media upload attempt ${attempt} failed: ${(error as Error).name}`);
      }
    }
    if (!response) return null;
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

const esc = (s: string) =>
  String(s).replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string,
  );

/** One delivered PDF: its friendly report name + permanent CDN link. */

/** A delivered report plus its size, which decides whether it can be attached. */
export type EmailPdf = DeliveredPdf & { sizeBytes?: number };

/**
 * Raw bytes of PDF we attach to one email. Attachments grow ~37% once
 * base64-encoded, and the send is accepted by Prospect IQ but silently dropped
 * downstream when the message is too big: a single 19.9 MB Premium Kundli
 * (~27 MB encoded) arrived, while the Complete Bundle's 19.9 + 6.2 MB (~36 MB
 * encoded) never did. 20 MB raw stays at the size we have seen delivered.
 * Anything that doesn't fit still reaches the customer via its download link.
 */
export const ATTACH_BUDGET_BYTES = 20 * 1024 * 1024;

/** Which PDFs to attach: smallest first, while the total stays in budget. */
export const pickAttachments = (
  pdfs: EmailPdf[],
  budget = ATTACH_BUDGET_BYTES,
): Set<string> => {
  const picked = new Set<string>();
  let used = 0;
  for (const p of [...pdfs].sort((a, b) => (a.sizeBytes ?? 0) - (b.sizeBytes ?? 0))) {
    const n = p.sizeBytes ?? 0;
    if (used + n <= budget) {
      picked.add(p.url);
      used += n;
    }
  }
  return picked;
};

/** A premium branded HTML email listing every report, each with its own link. */
const buildEmailHtml = (
  customerName: string,
  tierName: string,
  pdfs: DeliveredPdf[],
  attached: Set<string>,
): string => {
  const rows = pdfs
    .map(
      (p) => `
      <tr>
        <td style="padding:14px 18px;border:1px solid #efe3cf;border-radius:12px;background:#fffdf9">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="font-family:Georgia,serif;font-size:15px;color:#3a2412;font-weight:bold">📜 ${esc(p.name)}${attached.has(p.url) ? ' <span style="font:600 11px Arial;color:#8a7c68">· attached</span>' : ""}</td>
            <td align="right">
              <a href="${esc(p.url)}" style="background:#7A0808;color:#fff;text-decoration:none;padding:9px 16px;border-radius:8px;font:bold 13px Arial,sans-serif;display:inline-block">Download</a>
            </td>
          </tr></table>
        </td>
      </tr>
      <tr><td style="height:10px"></td></tr>`,
    )
    .join("");

  return `
  <div style="margin:0;padding:0;background:#f3ead9">
    <div style="max-width:600px;margin:0 auto;padding:28px 16px">
      <div style="background:#ffffff;border:1px solid #e6d5b8;border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(122,8,8,0.08)">
        <div style="background:linear-gradient(135deg,#7A0808,#a31414);padding:34px 24px;text-align:center">
          <div style="font:26px Georgia,serif;color:#fff;letter-spacing:.5px">JyotishNow</div>
          <div style="margin-top:8px;color:#f5c27a;font:600 11px Arial;letter-spacing:2px;text-transform:uppercase">${esc(tierName)}</div>
        </div>
        <div style="padding:28px 26px;color:#4a3b2c;font:15px/1.65 Arial,sans-serif">
          <p style="margin:0 0 6px">Namaste ${esc(customerName)},</p>
          <p style="margin:0 0 20px">Your personalised Vedic report is ready and yours to keep forever. ${
            attached.size === pdfs.length
              ? pdfs.length > 1
                ? "Both PDFs are attached and linked below:"
                : "Your PDF is attached and linked below:"
              : attached.size > 0
                ? "Download your reports below — the smaller one is also attached. Larger files are too big for email, so use the button."
                : "Download your report below — it is too large to attach to an email, so use the button."
          }</p>
          <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
          <p style="margin:22px 0 0;font-size:13px;color:#8a7c68">Tip: the download links never expire — save this email.${attached.size ? " Anything marked attached is also on this message." : ""}</p>
          <div style="margin:26px 0 6px;border-top:1px solid #efe3cf"></div>
          <p style="margin:14px 0 0">With warm regards,<br><strong style="color:#7A0808">${esc(BRAND.company_name)}</strong><br><span style="font-size:13px;color:#8a7c68">${esc(BRAND.website)} · ${esc(BRAND.phone)}</span></p>
        </div>
      </div>
      <p style="text-align:center;color:#a9997f;font:11px Arial;margin:16px 0 0">© ${esc(BRAND.company_name)} · ${esc(BRAND.address)}</p>
    </div>
  </div>`;
};

/**
 * Emails all delivered reports (with the PDFs attached) via Prospect IQ
 * Conversations. Returns false on any failure — email is best-effort, the
 * customer already has the download links from the API response.
 */
export const emailReport = async (
  to: string,
  customerName: string,
  tierName: string,
  pdfs: EmailPdf[],
): Promise<boolean> => {
  if (!PIQ_TOKEN || !PIQ_LOCATION || !to || pdfs.length === 0) return false;
  try {
    const headers = { ...piqHeaders(), "Content-Type": "application/json" };
    const attached = pickAttachments(pdfs);
    const mb = (n: number) => (n / 1048576).toFixed(1);
    console.log(
      `[email] ${pdfs.length} report(s), attaching ${attached.size}: ` +
        pdfs.map((p) => `${p.name} ${mb(p.sizeBytes ?? 0)}MB${attached.has(p.url) ? "" : " (link only)"}`).join(", "),
    );

    // A conversation message needs a contact to attach to.
    const upsert = await fetch(`${PIQ_BASE}/contacts/upsert`, {
      method: "POST",
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
      headers,
      body: JSON.stringify({
        locationId: PIQ_LOCATION,
        email: to,
        name: customerName,
        tags: ["Paid: Kundli PDF", `Kundli: ${tierName}`, "Kundli PDF Delivered"],
      }),
    });
    const contact = await readJsonResponse(upsert);
    const contactId = contact?.contact?.id ?? contact?.id;
    if (!contactId) {
      console.error("[kundli-pdf] could not resolve contact for email");
      return false;
    }

    const send = await fetch(`${PIQ_BASE}/conversations/messages`, {
      method: "POST",
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
      headers,
      body: JSON.stringify({
        type: "Email",
        contactId,
        subject: `Your JyotishNow ${tierName} 🪔`,
        html: buildEmailHtml(customerName, tierName, pdfs, attached),
        emailFrom: PIQ_FROM,
        ...(attached.size ? { attachments: pdfs.filter((p) => attached.has(p.url)).map((p) => p.url) } : {}),
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

const PDF_TYPE_NAME: Record<KundliPdfType, string> = {
  small: "Essential Kundli",
  medium: "Detailed Kundli",
  large: "Premium Kundli",
  prediction: "Life Predictions",
};

/**
 * Reads the Razorpay order's `notes.variant` — the tier the customer ACTUALLY
 * paid for. Binding generation to this (not a client-supplied field) stops a
 * ₹99 purchase from requesting the ₹499 bundle. Returns null if the lookup
 * can't run (e.g. local dev without live keys), in which case the handler
 * falls back to the client's requested tier.
 */
const getOrderVariant = async (orderId: string): Promise<string | null> => {
  if (!RAZORPAY_KEY_ID || !RZP_SECRET || !orderId) return null;
  try {
    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RZP_SECRET}`).toString("base64");
    const r = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
      headers: { Authorization: `Basic ${auth}` },
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });
    if (!r.ok) return null;
    const order = await readJsonResponse(r);
    const v = order?.notes?.variant;
    return typeof v === "string" && v ? v : null;
  } catch (error) {
    console.error("[kundli-pdf] order lookup failed", error);
    return null;
  }
};

type GenOk = {
  ok: true;
  url: string;
  fileId: string;
  fileName: string;
  sizeBytes: number;
  pdfType: KundliPdfType;
};
type GenErr = { ok: false; status: number; error: string; detail?: string; code?: string };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * VedicAstro's `pdf/horoscope-queue` returns an S3 URL immediately but uploads
 * the file a few seconds later (a small report is instant; a large one can take
 * 15-25s). Until then S3 answers 403/404. So poll the URL until it's really
 * there. The upstream link expires in ~2h, so this window is safe.
 */
/**
 * Every upstream call is time-boxed. Without this a single stalled S3
 * transfer hung a paid Complete Bundle indefinitely: the job sat "pending"
 * with one socket open to the PDF bucket and nothing was ever logged. Node's
 * own fetch timeouts don't help when a transfer trickles rather than dies.
 */
export const READY_CHECK_TIMEOUT_MS = 15_000;
export const DOWNLOAD_TIMEOUT_MS = 60_000;
export const DOWNLOAD_ATTEMPTS = 3;
export const API_TIMEOUT_MS = 30_000;
export const UPLOAD_TIMEOUT_MS = 90_000;

export const downloadWhenReady = async (
  url: string,
  maxWaitMs = 90_000,
): Promise<Buffer | null> => {
  const safeUrl = encodeURI(url); // the path can contain spaces ("Sun Aug 23 2026")

  // 1. Wait for the object to exist. A 1-byte ranged GET keeps each check tiny
  //    (and works with a GET-signed URL, unlike HEAD); its body is always
  //    released so a not-yet-ready check can't leave a socket open.
  const start = Date.now();
  let delay = 1500;
  for (;;) {
    try {
      const probe = await fetch(safeUrl, {
        headers: { Range: "bytes=0-0" },
        signal: AbortSignal.timeout(READY_CHECK_TIMEOUT_MS),
      });
      await probe.body?.cancel();
      if (probe.ok) break;
    } catch {
      /* timed out or reset — treat as not ready yet */
    }
    if (Date.now() - start > maxWaitMs) return null;
    await sleep(delay);
    delay = Math.min(delay + 1000, 5000);
  }

  // 2. Download it, each attempt bounded so a stall retries on a fresh
  //    connection instead of hanging the job.
  for (let attempt = 1; attempt <= DOWNLOAD_ATTEMPTS; attempt++) {
    try {
      const file = await fetch(safeUrl, { signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS) });
      if (file.ok) return Buffer.from(await file.arrayBuffer());
      await file.body?.cancel();
      console.error(`[pdf] download attempt ${attempt} got HTTP ${file.status}`);
    } catch (error) {
      console.error(`[pdf] download attempt ${attempt} failed: ${(error as Error).name}`);
    }
  }
  return null;
};

/** Generates ONE VedicAstro PDF and re-hosts it permanently on Prospect IQ. */
const generatePdf = async (
  pdfType: KundliPdfType,
  body: Record<string, unknown>,
): Promise<GenOk | GenErr> => {
  const params = new URLSearchParams({
    api_key: API_KEY as string,
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

  const t0 = Date.now();
  const at = () => `${((Date.now() - t0) / 1000).toFixed(1)}s`;
  const queued = await fetch(`${BASE_URL}/pdf/horoscope-queue?${params}`, {
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  });
  const data = await readJsonResponse(queued);
  const status = Number(data.status ?? queued.status);

  if (status === 402) {
    console.error("[kundli-pdf] VedicAstro out of credits");
    return {
      ok: false,
      status: 502,
      error: "Astrology service unavailable",
      detail: String(data.response ?? "subscription exhausted"),
      code: "UPSTREAM_CREDITS",
    };
  }
  if (status >= 400 || typeof data.response !== "string") {
    console.error("[kundli-pdf] generation failed", pdfType, status, data.response);
    return {
      ok: false,
      status: 502,
      error: "Could not generate the report",
      detail: String(data.response ?? status),
    };
  }
  if (typeof data.remaining_calls === "number") {
    console.log(`[kundli-pdf] ${data.remaining_calls} upstream calls remaining`);
  }

  // The queue endpoint is async — wait for the S3 file, then download it.
  const bytes = await downloadWhenReady(data.response as string);
  if (!bytes) {
    console.error(`[kundli-pdf] ${pdfType}: never retrieved (gave up at ${at()})`);
    return { ok: false, status: 502, error: "Report generated but could not be retrieved" };
  }
  console.log(`[kundli-pdf] ${pdfType}: downloaded ${(bytes.length / 1048576).toFixed(1)}MB at ${at()}`);
  const fileName = `JyotishNow_${PDF_TYPE_NAME[pdfType].replace(/\s+/g, "_")}_${safeName(String(body.name))}.pdf`;

  const stored = await uploadToProspectIQ(bytes, fileName);
  if (!stored) {
    console.error(`[kundli-pdf] ${pdfType}: could not be stored (gave up at ${at()})`);
    return {
      ok: false,
      status: 502,
      error: "Report generated but could not be stored",
      code: "STORAGE_FAILED",
    };
  }
  console.log(`[kundli-pdf] ${pdfType}: stored at ${at()}`);
  return { ok: true, url: stored.url, fileId: stored.fileId, fileName, sizeBytes: bytes.length, pdfType };
};

/** Wire format shared by the POST and the status endpoint. */
export const jobResponse = (job: {
  id: string; status: string; tier?: string; tierName?: string;
  pdfs: { name: string; url: string; fileName?: string }[];
  emailed: boolean; error?: string; code?: string;
}) => ({
  ok: job.status !== "failed",
  jobId: job.id,
  status: job.status,
  tier: job.tier ?? null,
  tierName: job.tierName ?? null,
  downloadUrls: job.pdfs,
  // Back-compat single fields for the first report.
  downloadUrl: job.pdfs[0]?.url ?? null,
  fileName: job.pdfs[0]?.fileName ?? null,
  emailed: job.emailed,
  error: job.error,
  code: job.code,
});

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

  // Resolve WHICH reports to generate. Prefer the paid tier from the Razorpay
  // order notes (authoritative); fall back to the client's requested tier /
  // pdf_type only when the order lookup can't run.
  const paidVariant = await getOrderVariant(String(body.razorpay_order_id ?? ""));
  let tier: KundliPdfTier | null = paidVariant ? getKundliPdfTier(paidVariant) : null;
  if (!tier) {
    const requested = String(body.variant ?? "");
    tier = getKundliPdfTier(requested);
  }

  let pdfTypes: KundliPdfType[];
  let tierName: string;
  if (tier) {
    pdfTypes = tier.pdfTypes;
    tierName = tier.name;
  } else {
    // Legacy single-type path.
    const pdfType = String(body.pdf_type ?? "large");
    if (!PDF_TYPES.includes(pdfType as (typeof PDF_TYPES)[number])) {
      return res.status(400).json({ error: `pdf_type must be one of: ${PDF_TYPES.join(", ")}` });
    }
    pdfTypes = [pdfType as KundliPdfType];
    tierName = PDF_TYPE_NAME[pdfType as KundliPdfType] ?? "Kundli Report";
  }

  const paymentId = String(body.razorpay_payment_id ?? "");
  const orderId = String(body.razorpay_order_id ?? "");

  // Delivery is idempotent per payment: a refresh, a retry, or a second tab
  // gets the same job rather than regenerating and burning another credit.
  const existing = await readJob(paymentId);
  if (existing && !isStale(existing)) {
    return res.status(existing.status === "pending" ? 202 : 200).json(jobResponse(existing));
  }

  const job = await createJob(paymentId, orderId, tier?.variant ?? paidVariant ?? undefined, tierName);

  // Reflect the sale in Prospect IQ regardless of how generation goes — the
  // customer has already paid.
  const paidRupees = getPriceInRupees("kundli-pdf", tier?.variant ?? paidVariant ?? "default") ?? 0;
  void recordPaymentInCrm({
    email: String(body.email ?? ""),
    phone: String(body.phone ?? ""),
    name: String(body.name ?? ""),
    service: "kundli-pdf",
    serviceLabel: tierName,
    amountRupees: paidRupees,
    paymentId,
    orderId,
  });

  // Render, download, re-host and email. A Complete Bundle takes 60-120s.
  const deliver = async () => {
    try {
      // Reports render in parallel so total time ≈ the slowest single report.
      const settled = await Promise.all(pdfTypes.map((pt) => generatePdf(pt, body)));
      const results = settled.filter((r): r is GenOk => r.ok);

      settled
        .filter((r) => !r.ok)
        .forEach((r) => console.error("[kundli-pdf] a bundle report failed", (r as GenErr).error));

      if (results.length === 0) {
        const firstErr = settled.find((r) => !r.ok) as GenErr | undefined;
        await updateJob(paymentId, {
          status: "failed",
          error: firstErr?.detail ?? firstErr?.error ?? "Could not generate the report",
          code: firstErr?.code,
        });
        return;
      }

      const pdfs: DeliveredPdf[] = results.map((r) => ({
        name: PDF_TYPE_NAME[r.pdfType],
        url: r.url,
        fileName: r.fileName,
      }));

      const emailed = await emailReport(
        String(body.email ?? ""),
        String(body.name),
        tierName,
        results.map((r) => ({
          name: PDF_TYPE_NAME[r.pdfType],
          url: r.url,
          fileName: r.fileName,
          sizeBytes: r.sizeBytes,
        })),
      );

      await updateJob(paymentId, { status: "ready", pdfs, emailed });
      console.log(`[kundli-pdf] job ready for ${paymentId} (${pdfs.length} pdf(s), emailed=${emailed})`);
    } catch (error) {
      console.error("[kundli-pdf] background generation failed", error);
      await updateJob(paymentId, {
        status: "failed",
        error: "Report generation failed",
      }).catch(() => {});
    }
  };

  // On Vercel the instance is frozen the moment it responds, so background
  // work never finishes: do it inside the request and send the final result —
  // the browser skips its poll loop when the reply is not "pending".
  if (RUN_INLINE) {
    await deliver();
    const done = (await readJob(paymentId)) ?? job;
    return res.status(200).json(jobResponse(done));
  }

  // On a long-lived server, respond NOW: Cloudflare kills anything past 100s,
  // which previously lost the order after the customer had already paid. The
  // browser polls /api/kundli-pdf-status instead; the email goes out regardless.
  res.status(202).json(jobResponse(job));
  void deliver();
}
