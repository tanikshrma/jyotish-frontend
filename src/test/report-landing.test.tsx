import { describe, it, expect, beforeAll } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import App from "../App";
import { REPORT_LANDING_CONFIGS } from "../pages/landing/reportLandingConfig";
import { getPriceInRupees, getKundliPdfTier } from "../../shared/pricing";

beforeAll(() => {
  window.scrollTo = () => {};
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
});

describe("Kundli report landing pages", () => {
  it("prices and names come from shared/pricing, not hardcoded copy", () => {
    // If someone edits a price in shared/pricing.ts, the page must follow it —
    // otherwise the page advertises one number and Razorpay charges another.
    const premium = REPORT_LANDING_CONFIGS["premium-kundli"];
    const complete = REPORT_LANDING_CONFIGS["complete-kundli"];

    expect(premium.price).toBe(getPriceInRupees("kundli-pdf", "premium"));
    expect(premium.price).toBe(299);
    expect(complete.price).toBe(getPriceInRupees("kundli-pdf", "complete"));
    expect(complete.price).toBe(499);

    expect(premium.name).toBe(getKundliPdfTier("premium")?.name);
    expect(complete.name).toBe(getKundliPdfTier("complete")?.name);
  });

  it("every configured variant is a real, purchasable tier", () => {
    for (const config of Object.values(REPORT_LANDING_CONFIGS)) {
      expect(getKundliPdfTier(config.variant)).not.toBeNull();
      expect(getPriceInRupees("kundli-pdf", config.variant)).toBeGreaterThan(0);
    }
  });

  it("every lander shares one brand palette", () => {
    // Both pages sell the same product family under the same brand. A per-page
    // palette made them read as two different companies.
    const themes = Object.values(REPORT_LANDING_CONFIGS).map((c) => c.theme);
    for (const t of themes) expect(t).toBe(themes[0]);
  });

  it("the anchor price is above the real price on every page", () => {
    for (const config of Object.values(REPORT_LANDING_CONFIGS)) {
      expect(config.compareAt).toBeGreaterThan(config.price);
    }
  });

  it("renders /lp/premium-kundli without crashing", () => {
    window.history.pushState({}, "", "/lp/premium-kundli");
    const { container } = render(<App />);
    expect(container).toBeTruthy();
    expect(screen.getAllByText(/₹299/).length).toBeGreaterThan(0);
  });

  it("renders /lp/complete-kundli without crashing", () => {
    window.history.pushState({}, "", "/lp/complete-kundli");
    const { container } = render(<App />);
    expect(container).toBeTruthy();
    expect(screen.getAllByText(/₹499/).length).toBeGreaterThan(0);
  });

  it("still renders the consultation landers sharing the /lp/ namespace", () => {
    window.history.pushState({}, "", "/lp/career");
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });
});
