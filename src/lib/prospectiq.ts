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
  service?: string;
  message?: string;
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
  if (!serviceKey) return "EJ8nazswCDPvy9hOMIef";
  const lower = serviceKey.toLowerCase().trim();
  for (const [key, calId] of Object.entries(PROSPECTIQ_SERVICE_CALENDARS)) {
    if (lower.includes(key) || key.includes(lower)) return calId;
  }
  return "EJ8nazswCDPvy9hOMIef";
}

export const submitProspectIQLead = async (lead: LeadData) => {
  try {
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
        tags: lead.tags || ["Website Lead", lead.service ? `Service: ${lead.service}` : "General Lead"],
        customFields: [
          ...(lead.dateOfBirth ? [{ id: "date_of_birth", value: lead.dateOfBirth }] : []),
          ...(lead.timeOfBirth ? [{ id: "time_of_birth", value: lead.timeOfBirth }] : []),
          ...(lead.placeOfBirth ? [{ id: "place_of_birth", value: lead.placeOfBirth }] : []),
          ...(lead.message ? [{ id: "message", value: lead.message }] : []),
        ],
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
