import { describe, it, expect } from "vitest";
import {
  digitsOnly,
  isValidEmail,
  isValidPhone,
  toE164,
  validateEmail,
  validatePhone,
} from "@/lib/validation";

describe("email validation", () => {
  it("rejects the cases reported as broken", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("notanemail")).toBe(false);
    expect(isValidEmail("no-at-sign.com")).toBe(false);
    expect(isValidEmail("missing@domain")).toBe(false);
    expect(isValidEmail("@example.com")).toBe(false);
    expect(isValidEmail("user@.com")).toBe(false);
    expect(isValidEmail("user@example.")).toBe(false);
    expect(isValidEmail("user name@example.com")).toBe(false);
    expect(isValidEmail("user@@example.com")).toBe(false);
    expect(isValidEmail("user@exam..ple.com")).toBe(false);
    expect(isValidEmail("user@example.c")).toBe(false);
  });

  it("accepts real addresses, including non-.com Indian domains", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("first.last+tag@gmail.com")).toBe(true);
    expect(isValidEmail("someone@jyotishnow.in")).toBe(true);
    expect(isValidEmail("sales@creativemonk.co.in")).toBe(true);
    expect(isValidEmail("  spaced@example.org  ")).toBe(true);
  });

  it("explains what is missing", () => {
    expect(validateEmail("nope")).toMatch(/'@'/);
    expect(validateEmail("user@nodot")).toMatch(/domain/);
  });
});

describe("phone validation — India (default)", () => {
  it("rejects letters, the original bug", () => {
    expect(isValidPhone("98abc43210", "IN")).toBe(false);
    expect(isValidPhone("abcdefghij", "IN")).toBe(false);
    expect(validatePhone("98abc43210", "IN")).toMatch(/only contain digits/);
  });

  it("enforces 10 digits", () => {
    expect(isValidPhone("98765", "IN")).toBe(false);
    expect(isValidPhone("98765432101", "IN")).toBe(false);
    expect(isValidPhone("9876543210", "IN")).toBe(true);
  });

  it("enforces the 6-9 leading digit rule for Indian mobiles", () => {
    expect(isValidPhone("1234567890", "IN")).toBe(false);
    expect(isValidPhone("5876543210", "IN")).toBe(false);
    expect(isValidPhone("6876543210", "IN")).toBe(true);
    expect(isValidPhone("9876543210", "IN")).toBe(true);
  });

  it("requires a value", () => {
    expect(validatePhone("", "IN")).toMatch(/required/);
  });
});

describe("phone validation — other countries", () => {
  it("applies each country's own length", () => {
    expect(isValidPhone("8123456", "SG")).toBe(false); // 7 digits
    expect(isValidPhone("81234567", "SG")).toBe(true); // 8 digits
    expect(isValidPhone("501234567", "AE")).toBe(true); // 9 digits
    expect(isValidPhone("5012345678", "AE")).toBe(false);
    expect(isValidPhone("13123456789", "CN")).toBe(true); // 11 digits
  });

  it("does not apply the Indian leading-digit rule elsewhere", () => {
    expect(isValidPhone("2015550123", "US")).toBe(true);
  });

  it("accepts a range where the country allows one", () => {
    expect(isValidPhone("123456789", "MY")).toBe(true);
    expect(isValidPhone("1234567890", "MY")).toBe(true);
    expect(isValidPhone("12345678", "MY")).toBe(false);
  });
});

describe("digit stripping and E.164", () => {
  it("strips formatting characters", () => {
    expect(digitsOnly("+91 98765-43210")).toBe("919876543210");
    expect(digitsOnly("(987) 654 3210")).toBe("9876543210");
    expect(digitsOnly("98abc43210")).toBe("9843210");
  });

  it("builds the CRM-ready international form", () => {
    expect(toE164("9876543210", "IN")).toBe("+919876543210");
    expect(toE164("98765 43210", "IN")).toBe("+919876543210");
    expect(toE164("2015550123", "US")).toBe("+12015550123");
    expect(toE164("81234567", "SG")).toBe("+6581234567");
  });
});
