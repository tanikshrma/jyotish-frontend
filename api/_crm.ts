import { readJsonResponse } from "./_razorpay.js";
import { pipelineForService } from "../shared/prospectiq-schema.js";
import { TEST_TAG, isTestMode } from "./_payments.js";
import { upsertContact } from "./_ghl.js";

/**
 * Records a completed payment in Prospect IQ so the sale is visible in the CRM.
 *
 * Upserts the contact, then creates a "won" opportunity in the pipeline that
 * matches the service, at its paid stage, with the amount as monetaryValue —
 * or, for a returning customer who already has one there, adds the amount to
 * it. Each payment is also written as a note on the contact.
 * This is how website payments (which go through our own Razorpay checkout,
 * not GHL's) show up inside Prospect IQ: on the pipeline board, in revenue
 * reporting, and as a trigger for "stage changed → paid" automations.
 *
 * Fire-and-forget by contract: it never throws to the caller, because the
 * customer's payment has already succeeded and CRM sync must never block or
 * fail their receipt/delivery.
 */

const PIQ_BASE = "https://services.leadconnectorhq.com";
const TOKEN = process.env.PROSPECTIQ_PRIVATE_TOKEN || process.env.GHL_PRIVATE_TOKEN;
const LOCATION = process.env.PROSPECTIQ_LOCATION_ID || "FTD8wmuYqCT7XoIpXJQG";

export type PaymentRecord = {
  email?: string;
  phone?: string;
  name?: string;
  /** Service key, e.g. "kundli-pdf" — decides which pipeline the sale lands in. */
  service?: string;
  /** Human label shown as the opportunity name, e.g. "Kundli PDF — Essential". */
  serviceLabel?: string;
  amountRupees?: number;
  paymentId?: string;
  orderId?: string;
  tags?: string[];
};

const headers = () => ({
  Authorization: `Bearer ${TOKEN}`,
  Version: "2021-07-28",
  "Content-Type": "application/json",
});

const piq = async (path: string, init: RequestInit = {}) => {
  const res = await fetch(`${PIQ_BASE}${path}`, {
    ...init,
    headers: headers(),
    signal: AbortSignal.timeout(15_000),
  });
  return { ok: res.ok, status: res.status, data: await readJsonResponse(res) };
};

/** Every payment leaves a note on the contact: an audit trail, and the dedupe key. */
const noteFor = (rec: PaymentRecord, label: string) =>
  `Payment received: ${label} — ₹${Number(rec.amountRupees) || 0}` +
  `\nRazorpay payment ${rec.paymentId ?? "n/a"} · order ${rec.orderId ?? "n/a"}` +
  (isTestMode() ? "\nTEST — Razorpay test mode, no money moved" : "");

const alreadyRecorded = async (contactId: string, paymentId: string, label: string, name: string) => {
  try {
    const [notes, opps] = await Promise.all([
      piq(`/contacts/${encodeURIComponent(contactId)}/notes`),
      // Sales recorded before notes existed are found by their opportunity name.
      piq(`/opportunities/search?${new URLSearchParams({ location_id: String(LOCATION), q: paymentId, limit: "20" })}`),
    ]);
    const inNotes = ((notes.data.notes ?? []) as { body?: string }[]).some(
      (n) => n.body?.includes(paymentId) && n.body.includes(label),
    );
    const inOpps = ((opps.data.opportunities ?? []) as { name?: string }[]).some((o) => o.name === name);
    return inNotes || inOpps; // a failed lookup reads as "not recorded": prefer recording to missing a sale
  } catch {
    return false;
  }
};

export const recordPaymentInCrm = async (rec: PaymentRecord): Promise<boolean> => {
  if (!TOKEN || !LOCATION) return false;
  if (!rec.email && !rec.phone) return false; // need something to key the contact on

  try {
    // 1. Upsert the contact so the opportunity has someone to attach to.
    const contactId = await upsertContact({
      email: rec.email,
      phone: rec.phone,
      name: rec.name || "Website Customer",
      tags: [
        "Paid Customer",
        rec.serviceLabel ? `Paid: ${rec.serviceLabel}` : "",
        ...(rec.tags ?? []),
        // Test-mode sales are tagged so they can be told apart and cleaned up.
        isTestMode() ? TEST_TAG : "",
      ],
    });
    if (!contactId) {
      console.error("[crm] could not resolve contact for payment record");
      return false;
    }

    // 2. Create a won opportunity carrying the amount.
    const { pipelineId, paidStageId } = pipelineForService(rec.service);
    const label = rec.serviceLabel || rec.service || "Website Payment";
    const name = rec.paymentId ? `${label} · ${rec.paymentId}` : label;

    // Once per payment and product: a retried delivery, a refresh or a second
    // tab must not record the same sale twice.
    if (rec.paymentId && (await alreadyRecorded(contactId, rec.paymentId, label, name))) {
      console.log(`[crm] already recorded: ${name}`);
      return true;
    }

    const amount = Number(rec.amountRupees) || 0;
    const created = await piq("/opportunities/", {
      method: "POST",
      body: JSON.stringify({
        locationId: LOCATION,
        pipelineId,
        pipelineStageId: paidStageId,
        contactId,
        name,
        status: "won",
        monetaryValue: amount,
      }),
    });

    if (!created.ok) {
      // The location allows one opportunity per contact per pipeline, so a
      // repeat customer's next purchase is added to the deal they already have.
      const existingId = created.data?.meta?.existingId;
      if (created.data?.code !== "OPPORTUNITY_NO_DUPLICATE" || !existingId) {
        console.error("[crm] opportunity create failed", created.status, JSON.stringify(created.data).slice(0, 300));
        return false;
      }
      const current = await piq(`/opportunities/${encodeURIComponent(existingId)}`);
      const previous = Number(current.data?.opportunity?.monetaryValue) || 0;
      const updated = await piq(`/opportunities/${encodeURIComponent(existingId)}`, {
        method: "PUT",
        body: JSON.stringify({
          pipelineId,
          pipelineStageId: paidStageId,
          status: "won",
          monetaryValue: previous + amount,
        }),
      });
      if (!updated.ok) {
        console.error("[crm] opportunity update failed", updated.status, JSON.stringify(updated.data).slice(0, 300));
        return false;
      }
      console.log(`[crm] added ₹${amount} to existing opportunity ${existingId} (now ₹${previous + amount})`);
    }

    await piq(`/contacts/${encodeURIComponent(contactId)}/notes`, {
      method: "POST",
      body: JSON.stringify({ body: noteFor(rec, label) }),
    }).catch(() => undefined);

    console.log(`[crm] payment recorded: ${label} ₹${rec.amountRupees} for contact ${contactId}`);
    return true;
  } catch (error) {
    console.error("[crm] recordPaymentInCrm threw", error);
    return false;
  }
};
