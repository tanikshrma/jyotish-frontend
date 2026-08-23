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
  /** small | medium | large | prediction (singular — docs say otherwise) */
  pdf_type?: "small" | "medium" | "large" | "prediction";
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export type KundliPdfResult = {
  ok: true;
  /** Permanent Prospect IQ CDN URL — public and non-expiring. */
  downloadUrl: string;
  fileId: string;
  fileName: string;
  /** True when the report was emailed to the customer. */
  emailed: boolean;
  sizeBytes: number;
  pdfType: string;
};

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
export const deliverKundliPdf = async (
  input: KundliPdfRequest,
): Promise<KundliPdfResult> => {
  const response = await fetch("/api/kundli-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
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

  const result = (await response.json()) as KundliPdfResult;

  // 1. Save to the customer's machine.
  const link = document.createElement("a");
  link.href = result.downloadUrl;
  link.download = result.fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();

  // 2. Open it so they see it immediately. Popup blockers can stop this, which
  //    is why the download above happens first and the URL is also emailed.
  setTimeout(() => {
    window.open(result.downloadUrl, "_blank", "noopener");
  }, 400);

  return result;
};
