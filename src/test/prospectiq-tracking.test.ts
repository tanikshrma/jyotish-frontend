import { describe, it, expect } from "vitest";
import {
  PIQ_FIELDS,
  PIQ_FORM_FIELDS,
  PIQ_OPTIONS,
  serviceInterestFor,
  reportTypeFor,
} from "../../shared/prospectiq-schema";
import { leadFields, splitName } from "@/lib/prospectiq";

/** Every service key a live website form actually sends. */
const SITE_SERVICES = [
  // booking modal
  "consultation-call", "couple-consultation", "face-to-face", "baby-muhurat",
  "complete-horoscope", "annual-horoscope", "matchmaking-consultation",
  "gemstone-analysis", "career-guidance", "vastu-consultancy", "lalkitab-consultation",
  // report calculators
  "babyname", "career", "kaalsarp", "lalkitab", "love", "matchmaking", "sadesati",
  // free kundli calculator + the ₹299/₹499 landing checkout
  "kundli",
];

describe("Prospect IQ picklist mapping", () => {
  it("gives every site service a valid Service Interest — never blank", () => {
    for (const s of SITE_SERVICES) {
      expect(PIQ_OPTIONS.serviceInterest, s).toContain(serviceInterestFor(s));
    }
  });

  it("never sends a Report Type that Prospect IQ would reject", () => {
    for (const s of SITE_SERVICES) {
      const r = reportTypeFor(s);
      if (r !== null) expect(PIQ_OPTIONS.reportType, s).toContain(r);
    }
  });

  it("no longer files a Kundli as a Yearly Horoscope", () => {
    expect(reportTypeFor("kundli")).not.toBe("Yearly Horoscope");
    expect(reportTypeFor("kundli-pdf")).not.toBe("Yearly Horoscope");
  });

  it("files the Baby Name calculator under the Baby Name report type", () => {
    expect(reportTypeFor("babyname")).toBe("Baby Name");
  });

  it("names every custom field after its live Prospect IQ key", () => {
    expect(Object.keys(PIQ_FORM_FIELDS).sort()).toEqual(Object.keys(PIQ_FIELDS).sort());
    for (const f of Object.values(PIQ_FORM_FIELDS)) {
      expect(f.name).toMatch(/^[a-z0-9_]+$/);
      expect(f.label.length).toBeGreaterThan(0);
    }
  });
});

describe("leadFields — one mapping for the API and the tracking script", () => {
  const lead = {
    firstName: "Asha",
    lastName: "Rao",
    email: "asha@example.com",
    phone: "+919876543210",
    dateOfBirth: "05/08/1995",
    timeOfBirth: "14:30",
    placeOfBirth: "Chandigarh, India",
    service: "kundli",
  };

  it("sends the same custom-field values down both paths", () => {
    const { customFields, trackingFields } = leadFields(lead);
    const byId = Object.fromEntries(
      Object.entries(PIQ_FIELDS).map(([k, id]) => [id, k as keyof typeof PIQ_FIELDS]),
    );
    for (const cf of customFields) {
      const name = PIQ_FORM_FIELDS[byId[cf.id]].name;
      expect(trackingFields.find((t) => t.name === name)?.value, name).toBe(cf.value);
    }
  });

  it("sends dates as ISO so day and month can't be swapped", () => {
    const birth = leadFields(lead).trackingFields.find((t) => t.name === "birth_date");
    expect(birth?.value).toBe("1995-08-05");
  });

  it("always carries the identity fields the script matches contacts on", () => {
    const names = leadFields(lead).trackingFields.map((t) => t.name);
    expect(names).toEqual(expect.arrayContaining(["first_name", "email", "phone"]));
  });

  it("omits empty values so a blank never overwrites good CRM data", () => {
    const { customFields, trackingFields } = leadFields({ ...lead, lastName: "", timeOfBirth: "  " });
    expect(trackingFields.map((t) => t.name)).not.toContain("last_name");
    expect(trackingFields.map((t) => t.name)).not.toContain("time_of_birth");
    for (const f of trackingFields) expect(f.value.trim()).not.toBe("");
    for (const f of customFields) expect(String(f.value).trim()).not.toBe("");
  });

  it("splits a full name into first and last", () => {
    expect(splitName("  Asha  Devi Rao ")).toEqual({ firstName: "Asha", lastName: "Devi Rao" });
    expect(splitName("")).toEqual({ firstName: "", lastName: "" });
  });
});
