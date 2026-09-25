import { describe, expect, it } from "vitest";
import { clampDigits, COUNTRIES, countryByCode, displayPhone, flagOf, formatNational, isValidPhone, splitPhone, toE164 } from "./phone";

describe("phone helpers", () => {
  it("lists every country with a flag and dialling code", () => {
    expect(COUNTRIES.length).toBeGreaterThan(200);
    expect(countryByCode("PK")).toMatchObject({ name: "Pakistan", dial: "+92", flag: "🇵🇰" });
    expect(countryByCode("GB")?.dial).toBe("+44");
    expect(flagOf("us")).toBe("🇺🇸");
  });

  it("builds E.164 from a country and national digits, dropping a trunk 0", () => {
    expect(toE164("PK", "03001234567")).toBe("+923001234567");
    expect(toE164("GB", "020 7946 0000")).toBe("+442079460000");
    expect(toE164("GB", "")).toBe("");
  });

  it("splits a stored number back into country and national digits", () => {
    expect(splitPhone("+923001234567", "GB")).toEqual({ country: "PK", national: "3001234567" });
    expect(splitPhone("", "AE")).toEqual({ country: "AE", national: "" });
    // An over-long paste keeps its country instead of being misread.
    expect(splitPhone("+1 (212) 555-0123 999", "GB")).toEqual({ country: "US", national: "2125550123" });
  });

  it("validates against the country's numbering plan", () => {
    expect(isValidPhone("+923001234567")).toBe(true);
    expect(isValidPhone("+447911123456")).toBe(true);
    // 07700 900xxx is Ofcom's reserved drama range: well-formed but not a real number.
    expect(isValidPhone("+447700900123")).toBe(false);
    expect(isValidPhone("+92300")).toBe(false);
    expect(isValidPhone("not a number")).toBe(false);
  });

  it("never lets a number grow past the country's longest length", () => {
    expect(clampDigits("US", "21255501234")).toBe("2125550123");
    expect(clampDigits("GB", "740012345678")).toBe("7400123456");
    expect(clampDigits("US", "212-555-0123")).toBe("2125550123");
    expect(formatNational("US", clampDigits("US", "21255501234"))).toBe("212 555 0123");
  });

  it("formats for typing and display", () => {
    expect(formatNational("PK", "3001234567")).toBe("300 1234567");
    expect(formatNational("PK", "03001234567")).toBe("0300 1234567");
    expect(formatNational("GB", "2079460000")).toBe("20 7946 0000");
    expect(formatNational("US", "2125550123")).toBe("212 555 0123");
    expect(displayPhone("+447400123456")).toBe("🇬🇧 +44 7400 123456");
    expect(displayPhone("+442079460000", false)).toBe("+44 20 7946 0000");
    expect(displayPhone(null)).toBe("—");
  });
});
