import { describe, expect, it } from "vitest";
import { offerSchema, toOfferBody } from "./offer-schema";

const base = { title: "Summer sale", category: "Hardware", summary: "Up to 40% off displays", description: "A long enough description.", instructions: "Quote code SUMMER", included: "", steps: "", contactName: "Jane Doe", contactRole: "", contactEmail: "", contactPhone: "", contactHours: "", start: "", end: "" };
const issues = (v: object) => (offerSchema.safeParse({ ...base, ...v }).error?.issues ?? []).map((i) => `${i.path.join(".")}: ${i.message}`);

describe("offer schema", () => {
  it("accepts a minimal offer", () => {
    expect(issues({})).toEqual([]);
  });

  it("rejects an end date that isn't after the start", () => {
    expect(issues({ start: "2030-05-10", end: "2030-05-01" })).toEqual(["end: Must be after the start"]);
    expect(issues({ start: "2030-05-10", end: "2030-05-10" })).toEqual(["end: Must be after the start"]);
    expect(issues({ start: "2030-05-01", end: "2030-05-10" })).toEqual([]);
    expect(issues({ end: "2030-05-10" })).toEqual([]);
  });

  it("checks the date range even while other fields are invalid", () => {
    expect(issues({ title: "", start: "2030-05-10", end: "2030-05-01" })).toContain("end: Must be after the start");
  });

  it("bounds the text fields", () => {
    expect(issues({ description: "x".repeat(2001), instructions: "x".repeat(2001), summary: "x".repeat(301), contactName: "J" })).toEqual([
      "summary: Must be at most 300 characters",
      "description: Must be at most 2000 characters",
      "instructions: Must be at most 2000 characters",
      "contactName: Must be at least 2 characters",
    ]);
  });

  it("limits included/steps to 50 lines of 200 characters", () => {
    expect(issues({ included: Array(51).fill("item").join("\n") })).toEqual(["included: At most 50 lines (you have 51)"]);
    expect(issues({ steps: `ok\n${"x".repeat(201)}` })).toEqual(["steps: Line 2 is longer than 200 characters"]);
  });

  it("validates contact email and phone", () => {
    expect(issues({ contactEmail: "nope", contactPhone: "12" })).toEqual(["contactEmail: Enter a valid email address", "contactPhone: Enter a valid phone number, e.g. +44 20 7946 0000"]);
  });
});

describe("offer body", () => {
  it("omits blank optional contact fields and dates on create, sends phone digits", () => {
    const v = offerSchema.parse({ ...base, contactPhone: "+44 20 7946 0000", included: " a \n\n b " });
    const body = toOfferBody(v, false);
    expect(body.contact).toEqual({ name: "Jane Doe", phone: "+442079460000" });
    expect(body.included).toEqual(["a", "b"]);
    expect("startsAt" in body).toBe(false);
    expect("endsAt" in body).toBe(false);
  });

  it("clears dates with null on edit", () => {
    const body = toOfferBody(offerSchema.parse(base), true);
    expect(body.startsAt).toBeNull();
    expect(body.endsAt).toBeNull();
  });
});
