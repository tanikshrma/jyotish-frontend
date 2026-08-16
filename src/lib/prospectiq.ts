import {
  PIQ_FIELDS,
  calendarForService,
  reportTypeFor,
  serviceInterestFor,
  toIsoDate,
} from "../../shared/prospectiq-schema";

/**
 * Client-side helper module to communicate with /api/prospectiq
 * for Prospect IQ (GoHighLevel API v2) integrations.
 */

export interface LeadData {
  firstName: string;
  lastName?: string;
  name?: string;
  email: string;
  phone: string;
  gender?: string;
  dateOfBirth?: string;
  timeOfBirth?: string;
  placeOfBirth?: string;
  tags?: string[];
  /** Site service key, e.g. "consultation-call". Drives Service Interest + calendar. */
  service?: string;
  /** Human label shown in the CRM, e.g. "Consultation Call — 1 Hour Video". */
  serviceLabel?: string;
  message?: string;
  /** Consultation variant, e.g. "1 Hour | Video". */
  consultationType?: string;
  amountPaid?: string;
  rashi?: string;
  partnerDateOfBirth?: string;
  partnerTimeOfBirth?: string;
  partnerPlaceOfBirth?: string;
  /** Which page/form produced the lead — becomes a tag. */
  sourceForm?: string;
}

export interface BookingData extends LeadData {
  calendarId?: string;
  selectedSlot: string;
  timezone?: string;
}

export const PROSPECTIQ_SERVICE_CALENDARS: Record<string, string> = {
  "matchmaking-consultation": "CsQSF9Jj4lgrsgUcUX4A",
  "couple-consultation": "CsQSF9Jj4lgrsgUcUX4A",
  "matchmaking": "CsQSF9Jj4lgrsgUcUX4A",
  "complete-horoscope": "EJ8nazswCDPvy9hOMIef",
  "consultation-call": "EJ8nazswCDPvy9hOMIef",
  "annual-horoscope": "RqMmAZTbpjpXKhGXZXgv",
  "yearly": "RqMmAZTbpjpXKhGXZXgv",
  "vastu-consultancy": "a7Dh1KSYvqUx20Sz7QHL",
  "vastu": "a7Dh1KSYvqUx20Sz7QHL",
  "career-guidance": "nuxprER9d0Nq1o798pO7",
  "career": "nuxprER9d0Nq1o798pO7",
  "face-to-face": "EJ8nazswCDPvy9hOMIef",
  "baby-muhurat": "EJ8nazswCDPvy9hOMIef",
  "gemstone-analysis": "EJ8nazswCDPvy9hOMIef",
  "gemstone": "EJ8nazswCDPvy9hOMIef",
  "lalkitab-consultation": "EJ8nazswCDPvy9hOMIef"
};

export function getCalendarIdForService(serviceKey?: string): string {
  return calendarForService(serviceKey);
}

export const submitProspectIQLead = async (lead: LeadData) => {
  try {
    const interest = serviceInterestFor(lead.service);
    const reportType = reportTypeFor(lead.service);
    const birthIso = toIsoDate(lead.dateOfBirth);
    const partnerDobIso = toIsoDate(lead.partnerDateOfBirth);

    // Only send fields that have a value — empty strings overwrite good CRM data.
    const customFields = [
      birthIso && { id: PIQ_FIELDS.birthDate, value: birthIso },
      lead.timeOfBirth && { id: PIQ_FIELDS.timeOfBirth, value: lead.timeOfBirth },
      lead.placeOfBirth && { id: PIQ_FIELDS.placeOfBirth, value: lead.placeOfBirth },
      interest && { id: PIQ_FIELDS.serviceInterest, value: interest },
      reportType && { id: PIQ_FIELDS.reportType, value: reportType },
      lead.consultationType && { id: PIQ_FIELDS.consultationType, value: lead.consultationType },
      lead.rashi && { id: PIQ_FIELDS.rashi, value: lead.rashi },
      lead.message && { id: PIQ_FIELDS.guidanceWanted, value: lead.message },
      partnerDobIso && { id: PIQ_FIELDS.partnerDateOfBirth, value: partnerDobIso },
      lead.partnerTimeOfBirth && { id: PIQ_FIELDS.partnerTimeOfBirth, value: lead.partnerTimeOfBirth },
      lead.partnerPlaceOfBirth && { id: PIQ_FIELDS.partnerPlaceOfBirth, value: lead.partnerPlaceOfBirth },
      { id: PIQ_FIELDS.leadSource, value: "Website Form" },
    ].filter(Boolean);

    // Tags carry what the picklists can't express, so the CRM list is readable.
    const tags = lead.tags ?? [];
    const autoTags = [
      "Website Lead",
      lead.serviceLabel ? `Service: ${lead.serviceLabel}` : lead.service ? `Service: ${lead.service}` : null,
      lead.sourceForm ? `Form: ${lead.sourceForm}` : null,
      lead.amountPaid ? `Paid: ${lead.amountPaid}` : null,
    ].filter(Boolean) as string[];

    const res = await fetch("/api/prospectiq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "upsert-contact",
        firstName: lead.firstName,
        lastName: lead.lastName || "",
        name: lead.name || `${lead.firstName} ${lead.lastName || ""}`.trim(),
        email: lead.email,
        phone: lead.phone,
        gender: lead.gender || "",
        source: lead.sourceForm || "JyotishNow Website",
        tags: Array.from(new Set([...tags, ...autoTags])),
        customFields,
      }),
    });
    return await res.json();
  } catch (error) {
    console.error("[ProspectIQ submitLead error]", error);
    return { error: "Failed to connect to Prospect IQ server" };
  }
};

export const fetchProspectIQCalendarSlots = async (
  calendarId: string,
  startMs: number,
  endMs: number,
  timezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone
) => {
  try {
    const res = await fetch("/api/prospectiq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "get-calendar-slots",
        calendarId,
        startDate: startMs,
        endDate: endMs,
        timezone,
      }),
    });
    return await res.json();
  } catch (error) {
    console.error("[ProspectIQ fetchSlots error]", error);
    throw error;
  }
};

export const bookProspectIQAppointment = async (booking: BookingData) => {
  try {
    // 1. First ensure contact exists in Prospect IQ
    const contactResult = await submitProspectIQLead({
      ...booking,
      tags: [...(booking.tags || []), "Calendar Booking"],
    });

    const contactId = contactResult?.contact?.id;

    const targetCalendarId = booking.calendarId || getCalendarIdForService(booking.service);

    // 2. Create appointment
    const res = await fetch("/api/prospectiq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create-appointment",
        calendarId: targetCalendarId,
        contactId,
        selectedSlot: booking.selectedSlot,
        title: `Astrology Consultation - ${booking.firstName} ${booking.lastName || ""}`.trim(),
      }),
    });

    return await res.json();
  } catch (error) {
    console.error("[ProspectIQ bookAppointment error]", error);
    return { error: "Failed to create calendar appointment" };
  }
};
