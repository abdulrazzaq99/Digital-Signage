import { describe, expect, it } from "vitest";
import { generalSchema, passwordChangeSchema, profileBody, profileDefaults, profileSchema } from "./account-schemas";

const issues = (r: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }) => Object.fromEntries((r.error?.issues ?? []).map((i) => [i.path.join("."), i.message] as const).reverse());

describe("password change", () => {
  const schema = passwordChangeSchema("sarah.mitchell@acmecorp.com");
  const ok = { currentPassword: "OldPass123", newPassword: "Brand-new-42", confirm: "Brand-new-42" };

  it("accepts a valid change", () => expect(schema.safeParse(ok).success).toBe(true));
  it("requires every field", () => {
    const e = issues(schema.safeParse({ currentPassword: "", newPassword: "", confirm: "" }));
    expect(e.currentPassword).toBe("Required");
    expect(e.newPassword).toMatch(/at least 8/);
    expect(e.confirm).toBe("Required");
  });
  it("applies the API rule to the new password", () => {
    expect(issues(schema.safeParse({ ...ok, newPassword: "abcdefgh", confirm: "abcdefgh" })).newPassword).toBe("Must include a number");
    expect(issues(schema.safeParse({ ...ok, newPassword: "password1", confirm: "password1" })).newPassword).toMatch(/too common/);
  });
  it("rejects reuse, the email name and a mismatched confirmation", () => {
    expect(issues(schema.safeParse({ ...ok, newPassword: "OldPass123", confirm: "OldPass123" })).newPassword).toMatch(/different/);
    expect(issues(schema.safeParse({ ...ok, newPassword: "Sarah.Mitchell9", confirm: "Sarah.Mitchell9" })).newPassword).toMatch(/email name/);
    expect(issues(schema.safeParse({ ...ok, confirm: "Brand-new-43" })).confirm).toBe("Passwords don't match");
  });
});

describe("profile", () => {
  it("bounds the name and validates the phone", () => {
    expect(issues(profileSchema.safeParse({ name: "A", title: "", phone: "" })).name).toMatch(/at least 2/);
    expect(issues(profileSchema.safeParse({ name: "Ann", title: "x".repeat(81), phone: "" })).title).toMatch(/at most 80/);
    expect(issues(profileSchema.safeParse({ name: "Ann", title: "", phone: "12" })).phone).toMatch(/valid phone/);
  });
  it("sends digits and clears blanks with null", () => {
    const v = profileSchema.parse({ name: "  Ann Lee ", title: " ", phone: "+44 20 7946 0000" });
    expect(profileBody(v)).toEqual({ name: "Ann Lee", title: null, phone: "+442079460000" });
  });
  it("loads a stored phone as E.164 for the phone field", () => expect(profileDefaults({ name: "A", phone: "+442079460000" }).phone).toBe("+442079460000"));
});

describe("general settings", () => {
  const ok = { platformName: "Signage Hub", supportEmail: "support@signagehub.io", timezone: "Europe/London", sessionTimeout: "60" };
  it("accepts defaults", () => expect(generalSchema.safeParse(ok).success).toBe(true));
  it("bounds the session timeout to 5–1440 whole minutes", () => {
    expect(issues(generalSchema.safeParse({ ...ok, sessionTimeout: "4" })).sessionTimeout).toMatch(/at least 5/);
    expect(issues(generalSchema.safeParse({ ...ok, sessionTimeout: "1441" })).sessionTimeout).toMatch(/at most 1440/);
    expect(issues(generalSchema.safeParse({ ...ok, sessionTimeout: "" })).sessionTimeout).toBe("Required");
  });
  it("rejects a bad email and zone", () => {
    const e = issues(generalSchema.safeParse({ ...ok, supportEmail: "nope", timezone: "Mars/Base" }));
    expect(e.supportEmail).toMatch(/valid email/);
    expect(e.timezone).toMatch(/time zone/);
  });
});
