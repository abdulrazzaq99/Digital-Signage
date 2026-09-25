import { describe, expect, it } from "vitest";
import { maskEmailsIn, metaText, redact, REDACTED } from "./redact";

describe("activity meta redaction", () => {
  it("hides secret-looking keys at any depth", () => {
    expect(redact({ password: "hunter2", nested: { apiKey: "abc", refreshToken: "t", clientSecret: "s", credentials: ["x"] }, name: "ok" })).toEqual({ password: REDACTED, nested: { apiKey: REDACTED, refreshToken: REDACTED, clientSecret: REDACTED, credentials: REDACTED }, name: "ok" });
  });

  it("masks emails inside strings", () => {
    expect(maskEmailsIn("Invited sarah.mitchell@acmecorp.com to Acme")).toBe("Invited s***@acmecorp.com to Acme");
    expect(redact({ to: ["a.b@x.io", "c@y.com"] })).toEqual({ to: ["a***@x.io", "c***@y.com"] });
  });

  it("renders values as text", () => {
    expect(metaText("token", "abc")).toBe(REDACTED);
    expect(metaText("screens", ["a", "b"])).toBe("a, b");
    expect(metaText("changes", { email: "jo@x.com", password: "p" })).toBe(`{"email":"j***@x.com","password":"${REDACTED}"}`);
    expect(metaText("count", 3)).toBe("3");
    expect(metaText("none", null)).toBe("—");
  });
});
