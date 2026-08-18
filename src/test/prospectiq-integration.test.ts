import { describe, it, expect } from "vitest";
import { 
  SERVICE_TO_CALENDAR, 
  SERVICE_TO_INTEREST, 
  PIQ_FIELDS, 
  calendarForService,
  serviceInterestFor,
  toIsoDate
} from "../../shared/prospectiq-schema";
import { toE164 } from "@/lib/validation";
import { ASTRO_ENDPOINTS, isPaidEndpoint } from "../../shared/astro-catalog";

describe("ProspectIQ CRM Schema and Integration Mapping", () => {
  it("maps all canonical services to dedicated calendar IDs", () => {
    expect(calendarForService("consultation-call")).toBe("EJ8nazswCDPvy9hOMIef");
    expect(calendarForService("matchmaking-consultation")).toBe("CsQSF9Jj4lgrsgUcUX4A");
    expect(calendarForService("couple-consultation")).toBe("CsQSF9Jj4lgrsgUcUX4A");
    expect(calendarForService("vastu-consultancy")).toBe("a7Dh1KSYvqUx20Sz7QHL");
    expect(calendarForService("career-guidance")).toBe("nuxprER9d0Nq1o798pO7");
    expect(calendarForService("annual-horoscope")).toBe("RqMmAZTbpjpXKhGXZXgv");
  });

  it("maps services to CRM service interests", () => {
    expect(serviceInterestFor("consultation-call")).toBe("Complete Horoscope Analysis");
    expect(serviceInterestFor("vastu-consultancy")).toBe("Vastu Consultancy");
    expect(serviceInterestFor("matchmaking-consultation")).toBe("Matchmaking Consultation");
    expect(serviceInterestFor("career-guidance")).toBe("Career Guidance");
  });

  it("formats Indian and International phones to E.164 standard for CRM", () => {
    expect(toE164("9876543210", "IN")).toBe("+919876543210");
    expect(toE164("2015550123", "US")).toBe("+12015550123");
    expect(toE164("81234567", "SG")).toBe("+6581234567");
  });

  it("formats dates to ISO format yyyy-MM-dd", () => {
    expect(toIsoDate("15/08/1995")).toBe("1995-08-15");
    expect(toIsoDate("1995-08-15")).toBe("1995-08-15");
    expect(toIsoDate("15-08-1995")).toBe("1995-08-15");
  });

  it("verifies required ProspectIQ custom field IDs are registered", () => {
    expect(PIQ_FIELDS.birthDate).toBe("ySqd27s8qaBDeCD1N7pN");
    expect(PIQ_FIELDS.timeOfBirth).toBe("d28HWH923lPhtZDgLT8r");
    expect(PIQ_FIELDS.placeOfBirth).toBe("CKzDAXRRce1Ga6CYGWjx");
    expect(PIQ_FIELDS.serviceInterest).toBe("xPJtBp6LRTUeRcnl1VkY");
    expect(PIQ_FIELDS.partnerDateOfBirth).toBe("159uAMvzRqx5jgGeaa2R");
    expect(PIQ_FIELDS.partnerTimeOfBirth).toBe("UDpjZTZGkvpa3GKoZ06L");
    expect(PIQ_FIELDS.partnerPlaceOfBirth).toBe("3LOVToGAmfTU554UMGYL");
  });
});

describe("Vedic Astro API Endpoint Catalogue and Free/Paid Split", () => {
  it("marks core kundli and chart calculation as free tier", () => {
    expect(isPaidEndpoint("planet-details")).toBe(false);
    expect(isPaidEndpoint("panchang")).toBe(false);
    expect(isPaidEndpoint("divisional-charts")).toBe(false);
    expect(isPaidEndpoint("chart-image")).toBe(false);
    expect(isPaidEndpoint("maha-dasha")).toBe(false);
    expect(isPaidEndpoint("mangal-dosh")).toBe(false);
    expect(isPaidEndpoint("kaalsarp-dosh")).toBe(false);
  });

  it("marks full PDF render exports as paid tier", () => {
    expect(isPaidEndpoint("pdf-horoscope")).toBe(true);
    expect(isPaidEndpoint("pdf-matching")).toBe(true);
  });

  it("contains all necessary parameters for planet-details", () => {
    const endpoint = ASTRO_ENDPOINTS["planet-details"];
    expect(endpoint.params).toContain("dob");
    expect(endpoint.params).toContain("tob");
    expect(endpoint.params).toContain("lat");
    expect(endpoint.params).toContain("lon");
    expect(endpoint.params).toContain("tz");
  });
});
