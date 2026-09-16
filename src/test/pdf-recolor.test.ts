// @vitest-environment node
// Recolouring runs server-side on Node buffers; jsdom's Uint8Array realm trips pdf-lib.
import { describe, expect, it } from "vitest";
import { inflateSync } from "node:zlib";
import { PDFDocument, PDFName, PDFRawStream, rgb } from "pdf-lib";
import { brandMatchingPdf, recolorContent } from "../../shared/pdf-recolor";

/** Colour operators across every deflated content stream of a PDF. */
const colourOps = async (bytes: Uint8Array): Promise<string[]> => {
  const doc = await PDFDocument.load(bytes);
  const ops: string[] = [];
  for (const [, obj] of doc.context.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFRawStream)) continue;
    if (obj.dict.get(PDFName.of("Filter"))?.toString() !== "/FlateDecode") continue;
    try {
      const text = inflateSync(Buffer.from(obj.contents)).toString("latin1");
      ops.push(...(text.match(/[\d.]+ [\d.]+ [\d.]+ rg/g) ?? []));
    } catch {
      /* not a content stream */
    }
  }
  return ops;
};

const hex = (op: string) =>
  "#" + op.split(" ").slice(0, 3).map((v) => Math.round(Number(v) * 255).toString(16).padStart(2, "0")).join("");

describe("matching PDF recolour", () => {
  it("maps the template teal onto the horoscope red and its tint onto the horoscope tint", () => {
    const teal = recolorContent("0.0039 0.8157 0.6667 rg").text;
    const tint = recolorContent("0.8824 1 0.9765 rg").text;
    expect(hex(teal)).toBe("#d00101");
    expect(hex(tint)).toBe("#ffe1e1");
  });

  it("leaves greys, black and non-teal colours alone", () => {
    for (const op of ["0 0 0 rg", "0.2392 0.2667 0.3608 rg", "1 1 1 RG", "0.902 0.5882 0.9098 rg"]) {
      expect(recolorContent(op).changed).toBe(0);
    }
  });

  it("recolours a real PDF's drawing colours", async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([200, 200]);
    page.drawRectangle({ x: 10, y: 10, width: 50, height: 50, color: rgb(0.0039, 0.8157, 0.6667) });
    page.drawRectangle({ x: 80, y: 10, width: 50, height: 50, color: rgb(0, 0, 0) });
    const original = Buffer.from(await doc.save());

    const branded = await brandMatchingPdf(original);
    const hexes = (await colourOps(branded)).map(hex);
    expect(hexes).toContain("#d00101");
    expect(hexes).toContain("#000000");
    expect(hexes).not.toContain("#01d0aa");
  });

  it("returns the original bytes untouched when the file cannot be parsed", async () => {
    const junk = Buffer.from("not a pdf at all");
    expect(await brandMatchingPdf(junk)).toBe(junk);
  });
});
