import { readJsonResponse } from "./_razorpay.js";
import { pipelineForService } from "../shared/prospectiq-schema.js";

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
const TOKEN = process.env.PROSPECTIQ_PRIVATE_TOKEN;
const LOCATION = process.env.PROSPECTIQ_LOCATION_ID;

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

export const recordPaymentInCrm = async (rec: PaymentRecord): Promise<boolean> => {
  if (!TOKEN || !LOCATION) return false;
  if (!rec.email && !rec.phone) return false; // need something to key the contact on

  try {
    // 1. Upsert the contact so the opportunity has someone to attach to.
    const upsert = await fetch(`${PIQ_BASE}/contacts/upsert`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        locationId: LOCATION,
        ...(rec.email ? { email: rec.email } : {}),
        ...(rec.phone ? { phone: rec.phone } : {}),
        name: rec.name || "Website Customer",
        tags: Array.from(
          new Set([
            "Paid Customer",
            rec.serviceLabel ? `Paid: ${rec.serviceLabel}` : null,
            ...(rec.tags ?? []),
          ].filter(Boolean) as string[]),
        ),
      }),
    });
    const contact = await readJsonResponse(upsert);
    const contactId = contact?.contact?.id ?? contact?.id;
    if (!contactId) {
      console.error("[crm] could not resolve contact for payment record");
      return false;
    }

    // 2. Create a won opportunity carrying the amount.
    const { pipelineId, paidStageId } = pipelineForService(rec.service);
    const label = rec.serviceLabel || rec.service || "Website Payment";
    const name = rec.paymentId ? `${label} · ${rec.paymentId}` : label;

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
