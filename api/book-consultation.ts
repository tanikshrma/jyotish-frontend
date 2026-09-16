import type { VercelRequest, VercelResponse } from "@vercel/node";
import { readJsonBody, requirePost } from "./_razorpay.js";
import { createJob, readJob, updateJob } from "./_jobs.js";
import { recordPaymentInCrm } from "./_crm.js";
import { TEST_TAG, fetchPaidOrder, isTestMode, signatureIsValid } from "./_payments.js";
import {
  contactAppointments,
  createAppointment,
  ghlToken,
  slotIsBookable,
  tagContact,
  upsertContact,
} from "./_ghl.js";
import { PIQ_FIELDS } from "../shared/prospectiq-schema.js";
import { addMinutes, formatSlotIST, isSlotString } from "../shared/consultation.js";

/**
 * POST /api/book-consultation
 * Body: {
 *   razorpay_order_id, razorpay_payment_id, razorpay_signature,
 *   customer: { name, email, phone },
 *   slot?: string   // only used to re-pick a time after SLOT_UNAVAILABLE
 * }
 *
 * Books the call a customer has paid for — either the ₹999 add-on bought with
 * a report, or a standalone consultation — into Dr. Sandeep Sawhney's Prospect
 * IQ calendar.
 *
 * Nothing about the booking is taken on trust from the browser: the payment is
 * confirmed with Razorpay, and the order notes (written by /api/create-order)
 * say whether a call was bought, which kind, and for which slot.
 *
 * Idempotent per payment: a retry returns the existing appointment instead of
 * booking a second one. That is checked in the job store and, because the job
 * store is not durable on Vercel, again against the contact's appointments in
 * Prospect IQ (each appointment title carries the payment id).
 *
 * Responses:
 *   200 { booked: true, booking }                      booked (or already was)
 *   409 { code: "SLOT_UNAVAILABLE", error }            pick another time and retry
 *   402 / 400                                          not a paid consultation
 *   502 / 503                                          retry later; payment is safe
 */

const MANUAL_TAG = "Consultation: needs manual scheduling";
const PAID_SLOT_LEAD_MINUTES = 15;

const jobKey = (paymentId: string) => `consult:${paymentId}`;

type Customer = { name: string; email: string; phone: string };

const readCustomer = (body: Record<string, unknown>): Customer => {
  const c = (body.customer && typeof body.customer === "object" ? body.customer : body) as Record<
    string,
    unknown
  >;
  const s = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  return { name: s(c.name, 100), email: s(c.email, 200), phone: s(c.phone, 20) };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requirePost(req, res)) return;

  const body = readJsonBody(req);
  const orderId = String(body.razorpay_order_id ?? "");
  const paymentId = String(body.razorpay_payment_id ?? "");
  const signature = String(body.razorpay_signature ?? "");

  if (!signatureIsValid(orderId, paymentId, signature)) {
    return res.status(402).json({ error: "Valid payment required to book a consultation" });
  }

  const paid = await fetchPaidOrder(orderId, paymentId);
  if (paid.ok === false) {
    return res.status(paid.status).json({ error: paid.error, retryable: paid.retryable });
  }
  const { quote, notes } = paid.order;
  const consultation = quote?.consultation;
  if (!quote || !consultation) {
    return res.status(400).json({ error: "This payment does not include a consultation", code: "NO_CONSULTATION" });
  }

  const customer = readCustomer(body);
  if (!customer.email && !customer.phone) {
    return res.status(400).json({ error: "An email or phone number is needed to confirm the booking" });
  }

  if (!ghlToken()) {
    console.error("[book-consultation] Prospect IQ token is not configured");
    return res.status(503).json({ error: "Booking is temporarily unavailable", retryable: true });
  }

  const key = jobKey(paymentId);
  const shortRef = paymentId.replace(/^pay_/, "");
  const reply = (booking: NonNullable<Awaited<ReturnType<typeof readJob>>>["booking"]) =>
    res.status(200).json({
      booked: true,
      test_mode: isTestMode(),
      booking: booking && { ...booking, when: formatSlotIST(booking.startTime) },
    });

  // 1. Already booked on this instance?
  const existing = await readJob(key);
  if (existing?.status === "ready" && existing.booking) return reply(existing.booking);

  // 2. Contact, carrying what was bought so the team sees it on the record.
  const tags = [
    "Consultation Booked",
    `Paid: ${consultation.label}`,
    consultation.isAddon ? "Consultation add-on" : "Consultation",
    isTestMode() ? TEST_TAG : "",
  ];
  const contactId = await upsertContact({
    ...customer,
    tags,
    customFields: [{ id: PIQ_FIELDS.consultationType, value: `${consultation.minutes} Min | ${consultation.mode}` }],
  });
  if (!contactId) {
    return res.status(502).json({ error: "Could not reach the booking calendar — please retry", retryable: true });
  }

  // 3. Already booked, as seen by Prospect IQ (survives cold starts).
  const appointments = await contactAppointments(contactId);
  const prior = appointments?.find(
    (a) => a.title?.includes(shortRef) && !/cancel/i.test(a.appointmentStatus ?? ""),
  );
  if (prior) {
    const booking = {
      appointmentId: prior.id,
      calendarId: prior.calendarId,
      startTime: prior.startTime,
      endTime: prior.endTime ?? addMinutes(prior.startTime, consultation.minutes),
      label: consultation.label,
    };
    if (!existing) await createJob(key, orderId, "consultation", consultation.label);
    await updateJob(key, { status: "ready", booking });
    return reply(booking);
  }

  // 4. Which time. The slot paid for is in the order notes; the browser may
  //    only choose a new one when there is none, or after that one was lost.
  const lostSlot = existing?.code === "SLOT_UNAVAILABLE";
  const slot =
    (lostSlot || !notes.slot) && isSlotString(body.slot) ? body.slot : notes.slot;
  if (!slot) {
    return res.status(409).json({ error: "Please pick a time for your consultation", code: "SLOT_UNAVAILABLE" });
  }

  if (!existing) await createJob(key, orderId, "consultation", consultation.label);

  const slotLost = async (detail: string) => {
    console.warn(`[book-consultation] slot unavailable for ${paymentId}: ${detail}`);
    await updateJob(key, { status: "failed", code: "SLOT_UNAVAILABLE", error: detail });
    await tagContact(contactId, [MANUAL_TAG]);
    return res.status(409).json({
      code: "SLOT_UNAVAILABLE",
      error:
        "That time is no longer available. Your payment is safe — please pick another slot, or our team will call you to schedule.",
    });
  };

  // The paid-for slot passed the 2-hour check at checkout; allow for the time
  // spent paying. A newly picked slot gets the full check.
  const lead = slot === notes.slot ? PAID_SLOT_LEAD_MINUTES : undefined;
  const check = await slotIsBookable(consultation.calendarId, slot, consultation.minutes, lead);
  if (!check.ok) {
    if (check.reason === "unavailable") {
      return res.status(503).json({ error: "Could not check the calendar right now — please retry", retryable: true });
    }
    return slotLost(check.reason);
  }

  // 5. Book it.
  const title = `${consultation.label} · ${customer.name || "Client"} · ${shortRef}${isTestMode() ? " · TEST" : ""}`;
  const endTime = addMinutes(slot, consultation.minutes);
  const created = await createAppointment({
    calendarId: consultation.calendarId,
    contactId,
    startTime: slot,
    endTime,
    title,
  });
  if (!created.ok) {
    console.error("[book-consultation] appointment create failed", created.status, created.detail);
    if (created.status >= 500) {
      return res.status(502).json({ error: "Could not book right now — please retry", retryable: true });
    }
    return slotLost(`create failed ${created.status}`);
  }

  const booking = {
    appointmentId: created.appointment.id,
    calendarId: consultation.calendarId,
    startTime: created.appointment.startTime,
    endTime: created.appointment.endTime ?? endTime,
    label: consultation.label,
  };
  await updateJob(key, { status: "ready", booking, code: undefined, error: undefined });

  // 6. Record the date on the contact and the sale in the consultations
  //    pipeline, at the server's price for the call. Neither blocks the reply.
  void upsertContact({
    ...customer,
    customFields: [
      { id: PIQ_FIELDS.consultationDate, value: slot.slice(0, 10) },
      { id: PIQ_FIELDS.preferredCallTime, value: formatSlotIST(slot) },
    ],
  });
  void recordPaymentInCrm({
    ...customer,
    service: "consultation-call",
    serviceLabel: consultation.label,
    amountRupees: consultation.rupees,
    paymentId,
    orderId,
    tags: ["Consultation Booked"],
  });

  console.log(`[book-consultation] booked ${booking.appointmentId} for ${paymentId}`);
  return reply(booking);
}
