import { describe, it, expect } from "vitest";
import { normalizeServiceKey, BOOKING_SERVICES } from "@/components/BookingModal";
import { SERVICES } from "../../shared/pricing";
import { SERVICE_TO_CALENDAR } from "../../shared/prospectiq-schema";

describe("BookingModal service selection and normalization", () => {
  it("normalizes canonical service IDs directly", () => {
    expect(normalizeServiceKey("consultation-call")).toBe("consultation-call");
    expect(normalizeServiceKey("couple-consultation")).toBe("couple-consultation");
    expect(normalizeServiceKey("face-to-face")).toBe("face-to-face");
    expect(normalizeServiceKey("baby-muhurat")).toBe("baby-muhurat");
    expect(normalizeServiceKey("complete-horoscope")).toBe("complete-horoscope");
    expect(normalizeServiceKey("annual-horoscope")).toBe("annual-horoscope");
    expect(normalizeServiceKey("matchmaking-consultation")).toBe("matchmaking-consultation");
    expect(normalizeServiceKey("gemstone-analysis")).toBe("gemstone-analysis");
    expect(normalizeServiceKey("career-guidance")).toBe("career-guidance");
    expect(normalizeServiceKey("vastu-consultancy")).toBe("vastu-consultancy");
    expect(normalizeServiceKey("lalkitab-consultation")).toBe("lalkitab-consultation");
  });

  it("normalizes human-readable names and partial strings to canonical service keys", () => {
    expect(normalizeServiceKey("Face to Face Consultation")).toBe("face-to-face");
    expect(normalizeServiceKey("Baby Birth Muhurat Consultation")).toBe("baby-muhurat");
    expect(normalizeServiceKey("Couple Consultation")).toBe("couple-consultation");
    expect(normalizeServiceKey("Personal Consultation Call")).toBe("consultation-call");
    expect(normalizeServiceKey("Vastu Consultancy")).toBe("vastu-consultancy");
    expect(normalizeServiceKey("Residential Vastu")).toBe("vastu-consultancy");
    expect(normalizeServiceKey("Commercial Vastu")).toBe("vastu-consultancy");
    expect(normalizeServiceKey("Career Guidance")).toBe("career-guidance");
    expect(normalizeServiceKey("Matchmaking Consultation")).toBe("matchmaking-consultation");
    expect(normalizeServiceKey("Lal Kitab")).toBe("lalkitab-consultation");
    expect(normalizeServiceKey("Gemstone Analysis")).toBe("gemstone-analysis");
    expect(normalizeServiceKey("Annual Horoscope Analysis")).toBe("annual-horoscope");
  });

  it("falls back to consultation-call when undefined or empty", () => {
    expect(normalizeServiceKey(undefined)).toBe("consultation-call");
    expect(normalizeServiceKey("")).toBe("consultation-call");
  });

  it("ensures every BOOKING_SERVICES option is defined in shared pricing and prospectiq schema", () => {
    for (const service of BOOKING_SERVICES) {
      expect(SERVICES[service.value as keyof typeof SERVICES]).toBeDefined();
      expect(SERVICE_TO_CALENDAR[service.value]).toBeDefined();
    }
  });
});
