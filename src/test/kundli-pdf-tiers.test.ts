import { describe, it, expect } from "vitest";
import {
  KUNDLI_PDF_TIERS,
  getKundliPdfTier,
  getPriceInRupees,
  SERVICES,
  type KundliPdfType,
} from "../../shared/pricing";

const VALID_PDF_TYPES: KundliPdfType[] = ["small", "medium", "large", "prediction"];

/**
 * The five Kundli PDF tiers drive both the storefront (prices shown) and the
 * server (which VedicAstro report each purchase generates). These guard that
 * the tier → price → pdf_type mapping stays correct, so a customer always gets
 * exactly the report they paid for.
 */
describe("Kundli PDF tiers + pricing", () => {
  it("exposes exactly five tiers, each priced and mapped", () => {
    expect(KUNDLI_PDF_TIERS).toHaveLength(5);
    for (const tier of KUNDLI_PDF_TIERS) {
      const price = getPriceInRupees("kundli-pdf", tier.variant);
      expect(price, `price for ${tier.variant}`).toBeGreaterThan(0);
      expect(tier.pdfTypes.length, `${tier.variant} pdfTypes`).toBeGreaterThan(0);
      for (const t of tier.pdfTypes) {
        expect(VALID_PDF_TYPES, `${tier.variant} → ${t}`).toContain(t);
      }
      expect(tier.name.length).toBeGreaterThan(0);
      expect(tier.features.length).toBeGreaterThan(0);
    }
  });

  it("prices match the agreed ladder", () => {
    expect(getPriceInRupees("kundli-pdf", "essential")).toBe(99);
    expect(getPriceInRupees("kundli-pdf", "detailed")).toBe(199);
    expect(getPriceInRupees("kundli-pdf", "premium")).toBe(299);
    expect(getPriceInRupees("kundli-pdf", "predictions")).toBe(349);
    expect(getPriceInRupees("kundli-pdf", "complete")).toBe(499);
  });

  it("maps each tier to the correct VedicAstro report(s)", () => {
    expect(getKundliPdfTier("essential")?.pdfTypes).toEqual(["small"]);
    expect(getKundliPdfTier("detailed")?.pdfTypes).toEqual(["medium"]);
    expect(getKundliPdfTier("premium")?.pdfTypes).toEqual(["large"]);
    expect(getKundliPdfTier("predictions")?.pdfTypes).toEqual(["prediction"]);
    // The bundle produces two reports.
    expect(getKundliPdfTier("complete")?.pdfTypes).toEqual(["large", "prediction"]);
  });

  it("returns null for an unknown tier", () => {
    expect(getKundliPdfTier("free")).toBeNull();
    expect(getKundliPdfTier("")).toBeNull();
  });

  it("keeps every tier variant present in the shared price list", () => {
    const variants = SERVICES["kundli-pdf"].variants;
    for (const tier of KUNDLI_PDF_TIERS) {
      expect(variants, `variants has ${tier.variant}`).toHaveProperty(tier.variant);
    }
  });

  it("prices increase from Essential up to Complete", () => {
    const ordered = ["essential", "detailed", "premium", "predictions", "complete"];
    const prices = ordered.map((v) => getPriceInRupees("kundli-pdf", v) ?? 0);
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i], `${ordered[i]} > ${ordered[i - 1]}`).toBeGreaterThan(prices[i - 1]);
    }
  });
});

/**
 * Live end-to-end check that the topped-up VedicAstro plan actually produces a
 * real PDF for every report type, and that the async S3 link becomes fetchable
 * (the bug that made the app fall back to a blank browser print). Skipped by
 * default — run with:  RUN_PDF_E2E=1 VEDICASTRO_API_KEY=... npx vitest run kundli-pdf-tiers
 */
const LIVE = process.env.RUN_PDF_E2E === "1" && !!process.env.VEDICASTRO_API_KEY;
const liveIt = LIVE ? it : it.skip;

async function fetchWhenReady(url: string, maxWaitMs = 90_000): Promise<Response | null> {
  const safe = encodeURI(url);
  const start = Date.now();
  let delay = 1500;
  let last: Response | null = null;
  while (Date.now() - start < maxWaitMs) {
    last = await fetch(safe);
    if (last.ok) return last;
    await new Promise((r) => setTimeout(r, delay));
    delay = Math.min(delay + 1000, 5000);
  }
  return null;
}

describe("VedicAstro PDF generation (live, gated)", () => {
  const key = process.env.VEDICASTRO_API_KEY;
  const params = (pdf_type: string) =>
    new URLSearchParams({
      api_key: key ?? "",
      name: "Test Native",
      dob: "15/08/1995",
      tob: "10:30",
      lat: "28.6139",
      lon: "77.2090",
      tz: "5.5",
      pob: "Delhi",
      lang: "en",
      style: "north",
      color: "140",
      pdf_type,
    });

  for (const pdf_type of ["small", "prediction", "large"]) {
    liveIt(
      `generates a real PDF for pdf_type=${pdf_type}`,
      async () => {
        const r = await fetch(
          `https://api.vedicastroapi.com/v3-json/pdf/horoscope-queue?${params(pdf_type)}`,
        );
        const data = await r.json();
        expect(Number(data.status)).toBeLessThan(400);
        expect(typeof data.response).toBe("string");

        const file = await fetchWhenReady(String(data.response));
        expect(file, `PDF for ${pdf_type} became available`).not.toBeNull();
        expect(file!.headers.get("content-type")).toContain("pdf");
        const bytes = Buffer.from(await file!.arrayBuffer());
        // A real report is many KB — a blank/placeholder would be tiny.
        expect(bytes.length).toBeGreaterThan(50_000);
        // PDF magic number.
        expect(bytes.subarray(0, 4).toString("latin1")).toBe("%PDF");
      },
      120_000,
    );
  }
});
