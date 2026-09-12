import { describe, it, expect } from "vitest";
import { pickAttachments, ATTACH_BUDGET_BYTES } from "../../api/kundli-pdf";

const MB = 1024 * 1024;

// Real sizes measured from delivered reports.
const premium = { name: "Premium Kundli", url: "u:premium", fileName: "p.pdf", sizeBytes: 19.87 * MB };
const predictions = { name: "Life Predictions", url: "u:pred", fileName: "l.pdf", sizeBytes: 6.24 * MB };

describe("report email attachments", () => {
  it("attaches a lone Premium Kundli — the size we have seen delivered", () => {
    expect([...pickAttachments([premium])]).toEqual(["u:premium"]);
  });

  it("never lets the Complete Bundle email exceed the budget", () => {
    // Both attached was ~36 MB encoded and silently never arrived.
    const picked = pickAttachments([premium, predictions]);
    expect(picked.has("u:pred")).toBe(true);
    expect(picked.has("u:premium")).toBe(false);
  });

  it("attaches nothing rather than send an oversized email", () => {
    const huge = { ...premium, url: "u:huge", sizeBytes: ATTACH_BUDGET_BYTES + 1 };
    expect(pickAttachments([huge]).size).toBe(0);
  });

  it("keeps small reports attached as before", () => {
    const small = { ...premium, url: "u:small", sizeBytes: 3.9 * MB };
    expect([...pickAttachments([small])]).toEqual(["u:small"]);
  });
});
