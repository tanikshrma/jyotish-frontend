import { describe, it, expect } from "vitest";
import { formatTypedDateInput, parseTypedDate } from "../components/FormDateInput";

describe("Date Input Keyboard Auto-formatting and Slashing", () => {
  it("formats digits incrementally with automatic slashes", () => {
    expect(formatTypedDateInput("3")).toBe("3");
    expect(formatTypedDateInput("30")).toBe("30");
    expect(formatTypedDateInput("300")).toBe("30/0");
    expect(formatTypedDateInput("3006")).toBe("30/06");
    expect(formatTypedDateInput("30062")).toBe("30/06/2");
    expect(formatTypedDateInput("300620")).toBe("30/06/20");
    expect(formatTypedDateInput("3006200")).toBe("30/06/200");
    expect(formatTypedDateInput("30062003")).toBe("30/06/2003");
  });

  it("handles user typing when first slash is already present", () => {
    expect(formatTypedDateInput("30/062")).toBe("30/06/2");
    expect(formatTypedDateInput("30/0620")).toBe("30/06/20");
    expect(formatTypedDateInput("30/06200")).toBe("30/06/200");
    expect(formatTypedDateInput("30/062003")).toBe("30/06/2003");
  });

  it("preserves explicit slashes typed by user", () => {
    expect(formatTypedDateInput("30/")).toBe("30/");
    expect(formatTypedDateInput("30/06/")).toBe("30/06/");
  });

  it("limits maximum length to 10 characters (DD/MM/YYYY)", () => {
    expect(formatTypedDateInput("300620039999")).toBe("30/06/2003");
  });

  it("correctly parses the auto-formatted date into Date object", () => {
    const parsed = parseTypedDate("30/06/2003");
    expect(parsed).toBeDefined();
    expect(parsed?.getDate()).toBe(30);
    expect(parsed?.getMonth()).toBe(5); // June (0-indexed)
    expect(parsed?.getFullYear()).toBe(2003);
  });
});
