import { describe, expect, it } from "vitest";
import { createUserBody, updateUserBody, userDefaults, userSchema } from "./user-schema";

const issues = (r: { error?: { issues: { path: PropertyKey[]; message: string }[] } }) => Object.fromEntries((r.error?.issues ?? []).map((i) => [i.path.join("."), i.message] as const).reverse());
const base = { ...userDefaults(), name: "QA Person", email: "qa.person@example.com" };

describe("user form", () => {
  it("requires name and a valid email", () => {
    const e = issues(userSchema.safeParse(userDefaults()));
    expect(e.name).toMatch(/at least 2/);
    expect(e.email).toBe("Required");
    expect(issues(userSchema.safeParse({ ...base, email: "qa@" })).email).toMatch(/valid email/);
  });
  it("password is optional but must follow the rule when given", () => {
    expect(userSchema.safeParse(base).success).toBe(true);
    expect(issues(userSchema.safeParse({ ...base, password: "short1" })).password).toMatch(/at least 8/);
    expect(issues(userSchema.safeParse({ ...base, password: "qa.person123" })).password).toMatch(/email name/);
  });
  it("create omits blanks; update clears with null and never sends own role/status", () => {
    const v = userSchema.parse({ ...base, email: " QA.Person@Example.com ", phone: "020 7946 0000" });
    expect(createUserBody(v)).toEqual({ email: "qa.person@example.com", name: "QA Person", role: "EDITOR", phone: "02079460000" });
    expect(updateUserBody(v, false)).toEqual({ name: "QA Person", title: null, phone: "02079460000", role: "EDITOR", isActive: true });
    expect(updateUserBody(v, true)).toEqual({ name: "QA Person", title: null, phone: "02079460000" });
  });
});
