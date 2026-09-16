// @vitest-environment node
import crypto from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CONSULTATION_ADDON,
  CONSULTATION_OPTIONS,
  isQuote,
  parseOrderNotes,
  quoteOrder,
  slotsNeeded,
} from "../../shared/consultation";
import { PIQ_CALENDARS } from "../../shared/prospectiq-schema";
import { bookableStarts, flattenSlotResponse, groupByIstDay } from "../lib/consultation";

/* ------------------------------------------------------------ quoting */

describe("quoteOrder", () => {
  it("prices a report with the ₹999 call add-on as one order", () => {
    const q = quoteOrder("kundli-pdf", "premium", [CONSULTATION_ADDON.key]);
    expect(isQuote(q)).toBe(true);
    if (!isQuote(q)) return;
    expect(q.totalRupees).toBe(299 + 999);
    expect(q.lines.map((l) => l.rupees)).toEqual([299, 999]);
    expect(q.consultation).toMatchObject({ minutes: 15, isAddon: true, rupees: 999, calendarId: PIQ_CALENDARS.completeHoroscope });
  });

  it("books a matching report's call into the matchmaking calendar", () => {
    const q = quoteOrder("matchmaking-pdf", "default", [CONSULTATION_ADDON.key]);
    expect(isQuote(q) && q.totalRupees).toBe(299 + 999);
    expect(isQuote(q) && q.consultation?.calendarId).toBe(PIQ_CALENDARS.matchmaking);
  });

  it("has no consultation on a report bought alone", () => {
    const q = quoteOrder("kundli-pdf", "complete");
    expect(isQuote(q) && q.consultation).toBeNull();
    expect(isQuote(q) && q.totalRupees).toBe(499);
  });

  it("refuses the add-on on its own, on a consultation, or unknown add-ons", () => {
    expect(isQuote(quoteOrder("consultation-addon", "15 Min|Audio"))).toBe(false);
    expect(isQuote(quoteOrder("consultation-call", "30 Min|Audio", [CONSULTATION_ADDON.key]))).toBe(false);
    expect(isQuote(quoteOrder("kundli-pdf", "premium", ["free-gemstone"]))).toBe(false);
  });

  it("prices standalone consultations exactly like the consultation call", () => {
    expect(CONSULTATION_OPTIONS.map((o) => [o.variant, o.rupees])).toEqual([
      ["30 Min|Audio", 2599],
      ["30 Min|Video", 2999],
      ["1 Hour|Audio", 4599],
      ["1 Hour|Video", 4999],
    ]);
    const hour = quoteOrder("consultation-call", "1 Hour|Video");
    expect(isQuote(hour) && hour.consultation).toMatchObject({ minutes: 60, mode: "Video", rupees: 4999, isAddon: false });
  });

  it("books other consultation services into their own calendars", () => {
    const career = quoteOrder("career-guidance");
    expect(isQuote(career) && career.consultation?.calendarId).toBe(PIQ_CALENDARS.career);
    const couple = quoteOrder("couple-consultation", "1 Hour|Audio");
    expect(isQuote(couple) && couple.consultation).toMatchObject({ minutes: 60, calendarId: PIQ_CALENDARS.matchmaking });
  });

  it("needs two back-to-back slots for an hour", () => {
    expect([15, 30, 60].map(slotsNeeded)).toEqual([1, 1, 2]);
  });
});

describe("parseOrderNotes", () => {
  it("reads what create-order wrote", () => {
    const n = parseOrderNotes(
      { service_key: "kundli-pdf", variant: "premium", addons: "consultation-15", slot: "2026-09-28T10:00:00+05:30" },
      () => null,
    );
    expect(n).toEqual({ service: "kundli-pdf", variant: "premium", addons: ["consultation-15"], slot: "2026-09-28T10:00:00+05:30" });
  });

  it("falls back to the label for older orders and drops a malformed slot", () => {
    const n = parseOrderNotes({ service: "Official Kundli Matching PDF Report", slot: "tomorrow" }, (l) =>
      l === "Official Kundli Matching PDF Report" ? "matchmaking-pdf" : null,
    );
    expect(n).toMatchObject({ service: "matchmaking-pdf", variant: "default", addons: [], slot: null });
  });
});

/* -------------------------------------------------------------- slots */

describe("bookable slots", () => {
  const now = Date.parse("2026-09-21T08:00:00+05:30");
  const slots = [
    "2026-09-21T09:00:00+05:30", // 1h ahead — too soon
    "2026-09-21T10:30:00+05:30",
    "2026-09-21T11:00:00+05:30",
    "2026-09-21T12:00:00+05:30", // 12:30 taken
    "2026-09-22T09:00:00+05:30",
  ];

  it("hides slots less than two hours away", () => {
    expect(bookableStarts(slots, 30, now)).not.toContain(slots[0]);
    expect(bookableStarts(slots, 30, now)).toHaveLength(4);
  });

  it("offers an hour only where the next slot is free too", () => {
    expect(bookableStarts(slots, 60, now)).toEqual(["2026-09-21T10:30:00+05:30"]);
  });

  it("reads Prospect IQ's free-slots shape and groups by IST day", () => {
    const flat = flattenSlotResponse({ "2026-09-21": { slots: slots.slice(1, 3) }, "2026-09-22": { slots: [slots[4]] }, traceId: "x" });
    expect(flat).toHaveLength(3);
    expect(groupByIstDay(flat).map((d) => [d.date, d.slots.length])).toEqual([["2026-09-21", 2], ["2026-09-22", 1]]);
  });
});

/* ------------------------------------------------- server: fulfilment */

const SECRET = "test_secret_for_unit_tests";
const sign = (orderId: string, paymentId: string) =>
  crypto.createHmac("sha256", SECRET).update(`${orderId}|${paymentId}`).digest("hex");

type Route = (url: string, init?: RequestInit) => Response | undefined;
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const mockRes = () => {
  const res: { statusCode: number; body: any; headers: Record<string, unknown> } & Record<string, any> = {
    statusCode: 0,
    body: undefined,
    headers: {},
  };
  res.status = (c: number) => ((res.statusCode = c), res);
  res.json = (b: unknown) => ((res.body = b), res);
  res.setHeader = (k: string, v: unknown) => ((res.headers[k] = v), res);
  return res;
};

describe("paid fulfilment endpoints", () => {
  let routes: Route[];
  let calls: { url: string; init?: RequestInit }[];

  beforeEach(async () => {
    vi.resetModules();
    process.env.RAZORPAY_KEY_ID = "rzp_test_unit";
    process.env.RAZORPAY_KEY_SECRET = SECRET;
    process.env.PROSPECTIQ_PRIVATE_TOKEN = "piq_unit";
    process.env.JOBS_DIR = (await import("node:fs")).mkdtempSync(
      (await import("node:path")).join((await import("node:os")).tmpdir(), "jn-jobs-"),
    );
    routes = [];
    calls = [];
    vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url: String(url), init });
      for (const r of routes) {
        const hit = r(String(url), init);
        if (hit) return hit;
      }
      return json({ error: "unmocked " + url }, 599);
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const razorpayOrder = (orderId: string, paymentId: string, notes: Record<string, string>, amount: number) => {
    routes.push((url) => (url.endsWith(`/payments/${paymentId}`) ? json({ id: paymentId, order_id: orderId, status: "captured" }) : undefined));
    routes.push((url) => (url.endsWith(`/orders/${orderId}`) ? json({ id: orderId, amount: amount * 100, notes }) : undefined));
  };

  const slot = new Date(Date.now() + 8 * 86_400_000).toISOString().replace(/\.\d+Z$/, "Z");

  it("refuses a report paid for with a consultation order", async () => {
    razorpayOrder("order_1", "pay_1", { service_key: "consultation-call", variant: "30 Min|Audio" }, 2599);
    const { paidReportOrder } = await import("../../api/_payments");
    const r = await paidReportOrder(
      { razorpay_order_id: "order_1", razorpay_payment_id: "pay_1", razorpay_signature: sign("order_1", "pay_1") },
      "matchmaking-pdf",
    );
    expect(r.ok).toBe(false);
  });

  it("refuses a forged signature before calling Razorpay", async () => {
    const { paidReportOrder } = await import("../../api/_payments");
    const r = await paidReportOrder(
      { razorpay_order_id: "order_1", razorpay_payment_id: "pay_1", razorpay_signature: "0".repeat(64) },
      "kundli-pdf",
    );
    expect(r).toMatchObject({ ok: false, status: 402 });
    expect(calls).toHaveLength(0);
  });

  it("books the paid slot once, and returns the same booking on retry", async () => {
    razorpayOrder("order_2", "pay_ABC", {
      service_key: "kundli-pdf", variant: "premium", addons: CONSULTATION_ADDON.key, slot,
    }, 1298);
    let created = 0;
    routes.push((url) => (url.includes("/contacts/upsert") ? json({ contact: { id: "c1" } }) : undefined));
    routes.push((url) => (url.includes("/contacts/c1/tags") ? json({}) : undefined));
    routes.push((url) => (url.includes("/contacts/c1/appointments")
      ? json({ events: created ? [{ id: "appt1", calendarId: PIQ_CALENDARS.completeHoroscope, startTime: slot, title: "x · ABC · TEST" }] : [] })
      : undefined));
    routes.push((url) => (url.includes("/free-slots")
      ? json({ [slot.slice(0, 10)]: { slots: [slot] } })
      : undefined));
    routes.push((url, init) => {
      if (!url.endsWith("/calendars/events/appointments")) return undefined;
      created++;
      const body = JSON.parse(String(init?.body));
      expect(body.startTime).toBe(slot);
      expect(Date.parse(body.endTime) - Date.parse(body.startTime)).toBe(30 * 60_000);
      expect(body.title).toContain("ABC");
      return json({ id: "appt1", calendarId: body.calendarId, startTime: body.startTime, endTime: body.endTime });
    });
    routes.push((url) => (url.includes("/opportunities") ? json({ opportunities: [] }) : undefined));

    const { default: handler } = await import("../../api/book-consultation");
    const body = {
      razorpay_order_id: "order_2",
      razorpay_payment_id: "pay_ABC",
      razorpay_signature: sign("order_2", "pay_ABC"),
      customer: { name: "Test Person", email: "myjyotishnow@gmail.com", phone: "+917015544187" },
      slot: "2030-01-01T10:00:00+05:30", // ignored: the order already holds a slot
    };
    const first = mockRes();
    await handler({ method: "POST", body } as any, first as any);
    expect(first.statusCode).toBe(200);
    expect(first.body.booking).toMatchObject({ appointmentId: "appt1", startTime: slot });

    const again = mockRes();
    await handler({ method: "POST", body } as any, again as any);
    expect(again.statusCode).toBe(200);
    expect(created).toBe(1);
  });

  it("does not book a payment that bought no consultation", async () => {
    razorpayOrder("order_3", "pay_3", { service_key: "kundli-pdf", variant: "premium" }, 299);
    const { default: handler } = await import("../../api/book-consultation");
    const res = mockRes();
    await handler(
      { method: "POST", body: { razorpay_order_id: "order_3", razorpay_payment_id: "pay_3", razorpay_signature: sign("order_3", "pay_3"), customer: { email: "a@b.co" } } } as any,
      res as any,
    );
    expect(res.statusCode).toBe(400);
    expect(res.body.code).toBe("NO_CONSULTATION");
  });

  it("reports a taken slot as SLOT_UNAVAILABLE without booking", async () => {
    razorpayOrder("order_4", "pay_4", { service_key: "consultation-call", variant: "1 Hour|Audio", slot }, 4599);
    routes.push((url) => (url.includes("/contacts/upsert") ? json({ contact: { id: "c4" } }) : undefined));
    routes.push((url) => (url.includes("/contacts/c4/") ? json({ events: [] }) : undefined));
    // Only the first half of the hour is free.
    routes.push((url) => (url.includes("/free-slots") ? json({ [slot.slice(0, 10)]: { slots: [slot] } }) : undefined));
    const { default: handler } = await import("../../api/book-consultation");
    const res = mockRes();
    await handler(
      { method: "POST", body: { razorpay_order_id: "order_4", razorpay_payment_id: "pay_4", razorpay_signature: sign("order_4", "pay_4"), customer: { email: "a@b.co" } } } as any,
      res as any,
    );
    expect(res.statusCode).toBe(409);
    expect(res.body.code).toBe("SLOT_UNAVAILABLE");
    expect(calls.some((c) => c.url.endsWith("/calendars/events/appointments"))).toBe(false);
  });

  it("create-order charges report + add-on and stamps the order notes", async () => {
    routes.push((url) => (url.includes("/free-slots") ? json({ [slot.slice(0, 10)]: { slots: [slot] } }) : undefined));
    const create = vi.fn(async (o: any) => ({ id: "order_new", amount: o.amount, currency: o.currency }));
    vi.doMock("razorpay", () => ({ default: vi.fn(() => ({ orders: { create } })) }));
    const { default: handler } = await import("../../api/create-order");
    const res = mockRes();
    await handler(
      {
        method: "POST",
        body: {
          service: "matchmaking-pdf",
          addons: [CONSULTATION_ADDON.key],
          slot,
          notes: { service_key: "consultation-call", couple: "A & B" },
        },
      } as any,
      res as any,
    );
    expect(res.statusCode).toBe(200);
    const order = create.mock.calls[0][0];
    expect(order.amount).toBe((299 + 999) * 100);
    // A client can't overwrite what was sold.
    expect(order.notes).toMatchObject({ service_key: "matchmaking-pdf", addons: CONSULTATION_ADDON.key, slot, couple: "A & B" });
  });

  it("create-order refuses a call without a slot", async () => {
    vi.doMock("razorpay", () => ({ default: vi.fn(() => ({ orders: { create: vi.fn() } })) }));
    const { default: handler } = await import("../../api/create-order");
    const res = mockRes();
    await handler({ method: "POST", body: { service: "kundli-pdf", variant: "premium", addons: [CONSULTATION_ADDON.key] } } as any, res as any);
    expect(res.statusCode).toBe(400);
    expect(res.body.code).toBe("SLOT_REQUIRED");
  });
});
