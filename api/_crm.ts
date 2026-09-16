import { readJsonResponse } from "./_razorpay.js";
import { pipelineForService } from "../shared/prospectiq-schema.js";
import { TEST_TAG, isTestMode } from "./_payments.js";
import { upsertContact } from "./_ghl.js";

/**
 * Records a completed payment in Prospect IQ so the sale is visible in the CRM.
 *
 * Upserts the contact, then creates a "won" opportunity in the pipeline that
 * matches the service, at its paid stage, with the amount as monetaryValue.
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

const opportunityExists = async (name: string, paymentId: string): Promise<boolean> => {
  try {
    const q = new URLSearchParams({ location_id: String(LOCATION), q: paymentId, limit: "20" });
    const res = await fetch(`${PIQ_BASE}/opportunities/search?${q}`, {
      headers: headers(),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return false; // can't tell — prefer recording to missing a sale
    const data = await readJsonResponse(res);
    return ((data.opportunities ?? []) as { name?: string }[]).some((o) => o.name === name);
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
    if (rec.paymentId && (await opportunityExists(name, rec.paymentId))) {
      console.log(`[crm] opportunity already recorded: ${name}`);
      return true;
    }

    const opp = await fetch(`${PIQ_BASE}/opportunities/`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        locationId: LOCATION,
        pipelineId,
        pipelineStageId: paidStageId,
        contactId,
        name,
        status: "won",
        monetaryValue: Number(rec.amountRupees) || 0,
      }),
    });
    if (!opp.ok) {
      console.error("[crm] opportunity create failed", opp.status, await opp.text());
      return false;
    }
    console.log(`[crm] payment recorded: ${label} ₹${rec.amountRupees} for contact ${contactId}`);
    return true;
  } catch (error) {
    console.error("[crm] recordPaymentInCrm threw", error);
    return false;
  }
};
