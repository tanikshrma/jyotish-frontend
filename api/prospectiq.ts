import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Prospect IQ / GoHighLevel API v2 integration serverless route.
 * Handles server-to-server calls to https://services.leadconnectorhq.com securely.
 */

const BASE_URL = "https://services.leadconnectorhq.com";
const DEFAULT_LOCATION_ID = "FTD8wmuYqCT7XoIpXJQG";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST" && req.method !== "GET") {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.PROSPECTIQ_PRIVATE_TOKEN || process.env.GHL_PRIVATE_TOKEN;
  const locationId = process.env.PROSPECTIQ_LOCATION_ID || DEFAULT_LOCATION_ID;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Version": "2021-07-28",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const query = req.query || {};
  const action = body.action || query.action;

  try {
    switch (action) {
      case "upsert-contact": {
        const payload = {
          locationId: body.locationId || locationId,
          firstName: body.firstName || "",
          lastName: body.lastName || "",
          name: body.name || `${body.firstName || ""} ${body.lastName || ""}`.trim(),
          email: body.email || "",
          phone: body.phone || "",
          gender: body.gender || "",
          tags: body.tags || ["Jyotish Now Lead"],
          customFields: body.customFields || [],
        };

        if (!token) {
          console.warn("[ProspectIQ API] No PROSPECTIQ_PRIVATE_TOKEN set in environment. Returning mock success.");
          return res.status(200).json({
            success: true,
            mock: true,
            contact: { id: "mock_contact_" + Date.now(), ...payload },
          });
        }

        const response = await fetch(`${BASE_URL}/contacts/upsert`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok) {
          console.error("[ProspectIQ API] Contact Upsert Failed:", data);
          return res.status(response.status).json({ error: "Failed to upsert contact", details: data });
        }

        return res.status(200).json({ success: true, contact: data.contact || data });
      }

      case "get-calendar-slots": {
        const calendarId = body.calendarId || query.calendarId || process.env.PROSPECTIQ_CALENDAR_ID;
        const startDate = body.startDate || query.startDate;
        const endDate = body.endDate || query.endDate;
        const timezone = body.timezone || query.timezone || "Asia/Kolkata";

        if (!calendarId) {
          return res.status(400).json({ error: "calendarId is required" });
        }

        if (!token) {
          console.warn("[ProspectIQ API] No PROSPECTIQ_PRIVATE_TOKEN set. Returning mock calendar slots.");
          return res.status(200).json({
            mock: true,
            slots: generateMockSlots(startDate, endDate),
          });
        }

        const params = new URLSearchParams({
          startDate: String(startDate),
          endDate: String(endDate),
          timezone: String(timezone),
        });

        const response = await fetch(`${BASE_URL}/calendars/${calendarId}/free-slots?${params}`, {
          method: "GET",
          headers,
        });

        const data = await response.json();
        if (!response.ok) {
          console.error("[ProspectIQ API] Get Calendar Slots Failed:", data);
          return res.status(response.status).json({ error: "Failed to fetch calendar slots", details: data });
        }

        return res.status(200).json(data);
      }

      case "create-appointment": {
        const payload = {
          calendarId: body.calendarId || process.env.PROSPECTIQ_CALENDAR_ID,
          locationId: body.locationId || locationId,
          contactId: body.contactId,
          startTime: body.selectedSlot || body.startTime,
          endTime: body.endTime,
          title: body.title || "JyotishNow Consultation",
          appointmentStatus: body.appointmentStatus || "confirmed",
        };

        if (!token) {
          console.warn("[ProspectIQ API] No PROSPECTIQ_PRIVATE_TOKEN set. Returning mock appointment creation.");
          return res.status(200).json({
            success: true,
            mock: true,
            appointment: { id: "mock_appt_" + Date.now(), ...payload },
          });
        }

        const response = await fetch(`${BASE_URL}/calendars/events/appointments`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok) {
          console.error("[ProspectIQ API] Create Appointment Failed:", data);
          return res.status(response.status).json({ error: "Failed to create appointment", details: data });
        }

        return res.status(200).json({ success: true, appointment: data.event || data });
      }

      case "create-opportunity": {
        const payload = {
          pipelineId: body.pipelineId,
          pipelineStageId: body.pipelineStageId,
          locationId: body.locationId || locationId,
          name: body.name || "New Lead Opportunity",
          status: body.status || "open",
          contactId: body.contactId,
          monetaryValue: body.monetaryValue || 0,
        };

        if (!token) {
          return res.status(200).json({
            success: true,
            mock: true,
            opportunity: { id: "mock_opp_" + Date.now(), ...payload },
          });
        }

        const response = await fetch(`${BASE_URL}/opportunities/`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok) {
          return res.status(response.status).json({ error: "Failed to create opportunity", details: data });
        }

        return res.status(200).json({ success: true, opportunity: data.opportunity || data });
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (err: any) {
    console.error("[ProspectIQ API Handler Exception]", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}

function generateMockSlots(startMs?: string | number, endMs?: string | number) {
  const slots: Record<string, { slots: string[] }> = {};
  const base = startMs ? new Date(Number(startMs)) : new Date();
  for (let i = 0; i < 7; i++) {
    const day = new Date(base.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = day.toISOString().split("T")[0];
    slots[dateStr] = {
      slots: [
        `${dateStr}T10:00:00+05:30`,
        `${dateStr}T11:30:00+05:30`,
        `${dateStr}T14:00:00+05:30`,
        `${dateStr}T16:00:00+05:30`,
        `${dateStr}T18:00:00+05:30`,
      ],
    };
  }
  return slots;
}
