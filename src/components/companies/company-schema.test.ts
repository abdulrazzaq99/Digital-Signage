import { describe, expect, it } from "vitest";
import { companyDefaults, companySchema, createCompanyBody, deleteCompanySchema, updateCompanyBody } from "./company-schema";

const issues = (r: { error?: { issues: { path: PropertyKey[]; message: string }[] } }) => Object.fromEntries((r.error?.issues ?? []).map((i) => [i.path.join("."), i.message] as const).reverse());
const base = { ...companyDefaults(), name: "QA Retail" };

describe("company form", () => {
  it("accepts the defaults with a name", () => expect(companySchema.safeParse(base).success).toBe(true));
  it("bounds name, url, phone and screen limit", () => {
    const e = issues(companySchema.safeParse({ ...base, name: "A", website: "javascript:alert(1)", phone: "12", screenLimit: "0" }));
    expect(e.name).toMatch(/at least 2/);
    expect(e.website).toMatch(/valid URL/);
    expect(e.phone).toMatch(/valid phone/);
    expect(e.screenLimit).toMatch(/at least 1/);
    expect(issues(companySchema.safeParse({ ...base, screenLimit: "10001" })).screenLimit).toMatch(/at most 10000/);
    expect(issues(companySchema.safeParse({ ...base, screenLimit: "2.5" })).screenLimit).toMatch(/whole number/);
    expect(issues(companySchema.safeParse({ ...base, industry: "x".repeat(81), plan: "x".repeat(61) }))).toMatchObject({ industry: expect.stringMatching(/80/), plan: expect.stringMatching(/60/) });
  });
  it("create omits blank optionals and sends numbers/digits", () => {
    const body = createCompanyBody(companySchema.parse({ ...base, phone: "+44 20 7946 0000", screenLimit: "25" }));
    expect(body).toEqual({ name: "QA Retail", status: "ACTIVE", timezone: "UTC", screenLimit: 25, licenseState: "ACTIVE", phone: "+442079460000" });
  });
  it("update clears blanks with null", () => {
    const body = updateCompanyBody(companySchema.parse({ ...base, website: "https://qa.example.com" }));
    expect(body).toEqual({ name: "QA Retail", status: "ACTIVE", timezone: "UTC", plan: null, website: "https://qa.example.com", industry: null, phone: null });
  });
  it("delete requires the exact company name", () => {
    const s = deleteCompanySchema("Acme Retail");
    expect(s.safeParse({ confirm: " Acme Retail " }).success).toBe(true);
    expect(s.safeParse({ confirm: "acme retail" }).success).toBe(false);
    expect(s.safeParse({ confirm: "" }).success).toBe(false);
  });
});
