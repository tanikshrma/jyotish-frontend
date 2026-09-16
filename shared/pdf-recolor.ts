import { inflateSync } from "node:zlib";
import { PDFDocument, PDFName, PDFRawStream, type PDFObject } from "pdf-lib";

/**
 * VedicAstro's MATCHING template ignores the `color` parameter — its accents
 * are a fixed teal (#01d0aa) no matter what is sent (verified on the live API
 * with 0, 360 and 140). The horoscope templates honour it, so they need none
 * of this.
 *
 * To keep every report JyotishNow red, the downloaded matching PDF is
 * recoloured before it is stored and emailed: fill/stroke colours in the
 * teal-to-cyan family have their hue rotated so the template's teal lands on
 * the same red the horoscope reports use (#d00101), with saturation and
 * lightness kept — so its light tint becomes the horoscope tint (#ffe1e1) and
 * its cyan accent becomes orange. Photos and other images are not touched.
 */

/** Hue of the template's teal accent; it maps to hue 0 (red). */
const TEMPLATE_HUE = 169;
/** Only this hue band is rotated — the template's teal and cyan accents. */
const BAND = { from: 150, to: 205, minSaturation: 0.25 };

type Rgb = [number, number, number];

const rgbToHsl = ([r, g, b]: Rgb): [number, number, number] => {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h =
    max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
};

const hslToRgb = (h: number, s: number, l: number): Rgb => {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
};

/** Rewrites the teal-family `r g b rg` / `r g b RG` operators in one content stream. */
export const recolorContent = (content: string): { text: string; changed: number } => {
  let changed = 0;
  const text = content.replace(
    /(\d*\.?\d+)\s+(\d*\.?\d+)\s+(\d*\.?\d+)\s+(rg|RG)\b/g,
    (match, R: string, G: string, B: string, op: string) => {
      const rgb = [R, G, B].map(Number) as Rgb;
      if (rgb.some((v) => Number.isNaN(v) || v > 1)) return match;
      const [h, s, l] = rgbToHsl(rgb);
      if (s < BAND.minSaturation || h < BAND.from || h > BAND.to) return match;
      const [r, g, b] = hslToRgb((h - TEMPLATE_HUE + 360) % 360, s, l);
      changed++;
      return `${r.toFixed(4)} ${g.toFixed(4)} ${b.toFixed(4)} ${op}`;
    },
  );
  return { text, changed };
};

/**
 * Recolours a VedicAstro matching PDF to the JyotishNow palette.
 *
 * Never throws: a customer has already paid, so if anything goes wrong the
 * original, correctly generated report is returned unchanged and delivery
 * carries on.
 */
export const brandMatchingPdf = async (original: Buffer): Promise<Buffer> => {
  try {
    const doc = await PDFDocument.load(original, { updateMetadata: false });
    const ctx = doc.context;
    let total = 0;

    for (const [ref, obj] of ctx.enumerateIndirectObjects()) {
      if (!(obj instanceof PDFRawStream)) continue;
      const dict = obj.dict;
      if (dict.get(PDFName.of("Subtype"))?.toString() === "/Image") continue;
      if (dict.get(PDFName.of("Filter"))?.toString() !== "/FlateDecode") continue;

      let content: string;
      try {
        content = inflateSync(Buffer.from(obj.contents)).toString("latin1");
      } catch {
        continue; // not a plain deflated stream (fonts, etc.)
      }
      const { text, changed } = recolorContent(content);
      if (!changed) continue;

      const entries: Record<string, PDFObject> = {};
      for (const [key, value] of dict.entries()) {
        const name = key.toString().slice(1);
        if (name !== "Filter" && name !== "Length" && name !== "DecodeParms") entries[name] = value;
      }
      ctx.assign(ref, ctx.flateStream(Buffer.from(text, "latin1"), entries));
      total += changed;
    }

    if (!total) return original;
    return Buffer.from(await doc.save({ useObjectStreams: false }));
  } catch (error) {
    console.error("[pdf-recolor] left report unbranded:", (error as Error).message);
    return original;
  }
};
