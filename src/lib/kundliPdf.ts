/**
 * Paid kundli PDF delivery.
 *
 * /api/kundli-pdf renders the report through VedicAstro, re-hosts it on the
 * Prospect IQ media CDN (permanent, no expiry, no local storage needed) and
 * emails it to the customer with the PDF attached. The permanent URL comes
 * back here so the browser also downloads and opens it.
 */

export type KundliPdfRequest = {
  name: string;
  email?: string;
  dob: string; // DD/MM/YYYY
  tob: string; // HH:MM
  lat: number | string;
  lon: number | string;
  tz: number | string;
  pob?: string;
  lang?: string;
  style?: "north" | "south";
  /**
   * The paid report tier (essential | detailed | premium | predictions |
   * complete). The server binds generation to the tier actually paid for, so
   * this is authoritative. `pdf_type` remains for the legacy single path.
   */
  variant?: string;
  /** Legacy: small | medium | large | prediction (singular — docs say otherwise) */
  pdf_type?: "small" | "medium" | "large" | "prediction";
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export type DeliveredPdf = { name: string; url: string; fileName: string };

export class KundliPdfError extends Error {
  readonly code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = "KundliPdfError";
    this.code = code;
  }
}

/**
 * Generates, saves and emails the report, then downloads it and opens it in a
 * new tab. Returns the permanent URL so the UI can keep showing it.
 */
/** Opens a URL in a new tab via an anchor click — survives popup blockers far
 *  better than window.open() when called outside a user gesture. */
export const openInNewTab = (url: string): void => {
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  link.remove();
};

/** Forces a save. The `download` attribute does nothing cross-origin, so the
 *  file is fetched and re-offered from a same-origin blob URL. */
export const saveToDisk = async (url: string, fileName: string): Promise<void> => {
  try {
    const response = await fetch(url);
    if (!response.ok) return;
    const blobUrl = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);
  } catch {
    /* the tab above and the emailed copy remain */
  }
};

export type KundliPdfResult = {
  ok: boolean;
  jobId: string;
  status: "pending" | "ready" | "failed";
  tier: string | null;
  tierName: string | null;
  /** Every report produced (a bundle tier returns more than one). */
  downloadUrls: DeliveredPdf[];
  /** Permanent Prospect IQ CDN URL of the first report — public, non-expiring. */
  downloadUrl: string | null;
  fileName: string | null;
  /** True when the report(s) were emailed to the customer. */
  emailed: boolean;
  error?: string;
  code?: string;
};

/** How long to keep polling before giving up (the email still arrives). */
const POLL_TIMEOUT_MS = 5 * 60 * 1000;
const POLL_INTERVAL_MS = 3000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Starts generation and waits for it to finish.
 *
 * The server answers 202 immediately with a job id and renders in the
 * background: a Complete Bundle takes 60-120s, and Cloudflare terminates any
 * request past 100s, which previously lost the order after the customer had
 * already paid. Polling keeps every request short.
 *
 * `onProgress` is called while waiting so the UI can reassure the customer.
 */
export const deliverKundliPdf = async (
  input: KundliPdfRequest,
  onProgress?: (elapsedMs: number) => void,
): Promise<KundliPdfResult> => {
  const response = await fetch("/api/kundli-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok && response.status !== 202) {
    let message = "Could not generate your PDF";
    let code: string | undefined;
    try {
      const err = await response.json();
      message = err.detail || err.error || message;
      code = err.code;
    } catch {
      /* non-JSON error body */
    }
    throw new KundliPdfError(message, code);
  }

  let result = (await response.json()) as KundliPdfResult;

  // Poll until the background job finishes.
  const startedAt = Date.now();
  while (result.status === "pending") {
    if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
      throw new KundliPdfError(
        "Your report is taking longer than usual. We'll email it to you as soon as it's ready.",
        "TIMEOUT",
      );
    }
    await sleep(POLL_INTERVAL_MS);
    onProgress?.(Date.now() - startedAt);
    try {
      const poll = await fetch(`/api/kundli-pdf-status?jobId=${encodeURIComponent(result.jobId)}`);
      result = (await poll.json()) as KundliPdfResult;
    } catch {
      // A dropped poll is not fatal; try again on the next tick.
    }
  }

  if (result.status === "failed") {
    throw new KundliPdfError(result.error ?? "Could not generate your PDF", result.code);
  }

  const pdfs = result.downloadUrls?.length
    ? result.downloadUrls
    : result.downloadUrl
      ? [{ name: result.tierName ?? "Kundli", url: result.downloadUrl, fileName: result.fileName ?? "kundli.pdf" }]
      : [];

  // Open every report in a new tab, then save a copy.
  //
  // Two browser rules shape this:
  //  * window.open() outside a user gesture is popup-blocked, and this runs
  //    after an async payment. A programmatic anchor click with
  //    target="_blank" is honoured far more often.
  //  * The `download` attribute is IGNORED for cross-origin URLs, and the PDFs
  //    are served from the Prospect IQ CDN, so saving goes through a
  //    same-origin blob URL.
  pdfs.forEach((pdf) => {
    openInNewTab(pdf.url);
    void saveToDisk(pdf.url, pdf.fileName);
  });

  return result;
};
