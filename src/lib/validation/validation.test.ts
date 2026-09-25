import { describe, expect, it } from "vitest";
import { z } from "zod";
import { email, endAfterStart, hexColour, intText, optionalPhone, optionalUrl, pairingCode, parseTags, password, passwordUsesEmail, phone, tagsText, text, timezone } from "./fields";
import { formatPhone, maskDecimal, maskEmail, maskHexColour, maskInteger, maskIp, maskKey, maskMiddle, maskPairingCode, maskPhone } from "./masks";

const valid = (s: z.ZodType, v: unknown) => s.safeParse(v).success;

describe("client field rules (mirror the API)", () => {
  it("text trims and bounds", () => {
    expect(text(5).parse("  hi ")).toBe("hi");
    expect(valid(text(5), "   ")).toBe(false);
    expect(valid(text(5), "toolong")).toBe(false);
  });

  it("email normalises and rejects bad addresses", () => {
    expect(email().parse(" A@B.Co ")).toBe("a@b.co");
    expect(valid(email(), "a@")).toBe(false);
  });

  it("phone accepts formatted numbers; optional allows blank", () => {
    expect(valid(phone(), "+44 20 7946 0000")).toBe(true);
    expect(valid(phone(), "12")).toBe(false);
    expect(valid(optionalPhone(), "")).toBe(true);
  });

  it("url only allows http(s)", () => {
    expect(valid(optionalUrl(), "https://acme.com")).toBe(true);
    expect(valid(optionalUrl(), "javascript:alert(1)")).toBe(false);
    expect(valid(optionalUrl(), "")).toBe(true);
  });

  it("colour, timezone, integers, pairing code", () => {
    expect(valid(hexColour(), "#1a73e8")).toBe(true);
    expect(valid(hexColour(), "blue")).toBe(false);
    expect(valid(timezone(), "Europe/London")).toBe(true);
    expect(valid(timezone(), "Mars/Base")).toBe(false);
    expect(valid(intText(1, 10), "5")).toBe(true);
    expect(valid(intText(1, 10), "5.5")).toBe(false);
    expect(valid(intText(1, 10), "11")).toBe(false);
    expect(pairingCode().parse("wb372d")).toBe("WB372D");
    expect(valid(pairingCode(), "WB37")).toBe(false);
  });

  it("tags are normalised and capped", () => {
    expect(parseTags(" Lobby, lobby ,VIP,, ")).toEqual(["lobby", "vip"]);
    expect(valid(tagsText(), Array.from({ length: 21 }, (_, i) => `t${i}`).join(","))).toBe(false);
  });

  it("password rule matches the API", () => {
    expect(valid(password(), "Signage-Blue-42")).toBe(true);
    for (const bad of ["short1", "noDigitsHere", "12345678", "admin1234"]) expect(valid(password(), bad)).toBe(false);
    expect(passwordUsesEmail("sarah2026x", "sarah@acme.com")).toBe(true);
  });

  it("endAfterStart puts the error on the end field", () => {
    const s = z.object({ start: z.string(), end: z.string() }).superRefine(endAfterStart("start", "end"));
    const r = s.safeParse({ start: "2026-10-02", end: "2026-10-01" });
    expect(r.error?.issues[0]?.path).toEqual(["end"]);
  });
});

describe("input masks", () => {
  it("restrict what can be typed", () => {
    expect(maskPhone("+44 (20) 7946-0000 ext")).toBe("+44 (20) 7946-0000 ");
    expect(maskPhone("abc")).toBe("");
    expect(maskPairingCode("wb-37 2d9x")).toBe("WB372D");
    expect(maskPairingCode("IO01")).toBe("");
    expect(maskInteger("0012a3")).toBe("123");
    expect(maskDecimal("12.345")).toBe("12.34");
    expect(maskDecimal(".5")).toBe("0.5");
    expect(maskHexColour("1A73E8ff")).toBe("#1a73e8");
    expect(maskKey("Now Price!")).toBe("now_price_");
  });

  it("hide sensitive values for display", () => {
    expect(maskEmail("sarah.mitchell@acmecorp.com")).toBe("s***@acmecorp.com");
    expect(maskMiddle("device-8f3a2b91c4d5e6f7")).toBe("devi…e6f7");
    expect(maskIp("192.168.1.101")).toBe("192.168.•.•");
    expect(formatPhone("+442079460000")).toBe("+44 20 7946 0000");
  });
});
