import { describe, expect, it } from "vitest";
import { todayInput } from "@/lib/format";
import { campaignSchema, campaignWindow, formatOdds, prizeSchema, winOdds } from "./campaign-schema";

const addDays = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const prize = { name: "Gift card", value: "$50", quantity: "10", weight: "5" };
const base = { title: "Summer draw", description: "", start: addDays(1), end: addDays(10), maxAttempts: "3", requireOffersVisit: false, loseWeight: "50", activate: false, prizes: [prize] };
const issues = (r: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }) => (r.error?.issues ?? []).map((i) => `${i.path.join(".")}: ${i.message}`);

describe("campaign schema", () => {
  it("accepts a valid campaign", () => {
    expect(campaignSchema(false).safeParse(base).success).toBe(true);
  });

  it("enforces the API limits", () => {
    const r = campaignSchema(false).safeParse({ ...base, title: "ab", maxAttempts: "101", loseWeight: "1000001", description: "x".repeat(2001) });
    expect(issues(r)).toEqual(expect.arrayContaining(["title: Must be at least 3 characters", "maxAttempts: Must be at most 100", "loseWeight: Must be at most 1000000", "description: Must be at most 2000 characters"]));
  });

  it("requires at least one prize and at most 50", () => {
    expect(issues(campaignSchema(false).safeParse({ ...base, prizes: [] }))).toContain("prizes: Add at least one prize");
    expect(campaignSchema(false).safeParse({ ...base, prizes: Array(51).fill(prize) }).success).toBe(false);
  });

  it("rejects an end before the start (same day is fine) even while other fields are invalid", () => {
    expect(issues(campaignSchema(false).safeParse({ ...base, title: "", end: addDays(0) }))).toContain("end: Must be on or after the start date");
    expect(campaignSchema(false).safeParse({ ...base, end: base.start }).success).toBe(true);
  });

  it("rejects a past start on create, but lets an edit keep its original start", () => {
    const past = addDays(-3);
    expect(issues(campaignSchema(false).safeParse({ ...base, start: past }))).toContain("start: The start can't be in the past");
    expect(campaignSchema(true, past).safeParse({ ...base, start: past, loseWeight: "" }).success).toBe(true);
    expect(campaignSchema(true, past).safeParse({ ...base, start: addDays(-2), loseWeight: "" }).success).toBe(false);
  });

  it("allows a blank lose weight only when editing", () => {
    expect(campaignSchema(true).safeParse({ ...base, loseWeight: "" }).success).toBe(true);
    expect(campaignSchema(false).safeParse({ ...base, loseWeight: "" }).success).toBe(false);
  });
});

describe("prize schema", () => {
  it("bounds name, value, quantity and weight", () => {
    const r = prizeSchema.safeParse({ name: "x".repeat(81), value: "x".repeat(41), quantity: "0", weight: "1000001" });
    expect(issues(r)).toEqual(["name: Must be at most 80 characters", "value: Must be at most 40 characters", "quantity: Must be at least 1", "weight: Must be at most 1000000"]);
    expect(prizeSchema.safeParse({ name: "Watch", value: "", quantity: "1000000", weight: "1" }).success).toBe(true);
  });
});

describe("win odds", () => {
  it("is weight / (sum of in-stock weights + lose weight)", () => {
    const odds = winOdds([{ weight: 5 }, { weight: 15 }, { weight: 40 }], 40);
    expect(odds).toEqual([0.05, 0.15, 0.4]);
  });

  it("skips out-of-stock prizes like the server does", () => {
    expect(winOdds([{ weight: 10, inStock: false }, { weight: 10 }], 10)).toEqual([0, 0.5]);
  });

  it("is unknown when a weight or the lose weight is unknown", () => {
    expect(winOdds([{ weight: null }, { weight: 1 }], 10)).toEqual([null, null]);
    expect(winOdds([{ weight: 1 }], null)).toEqual([null]);
  });

  it("with lose weight 0 the prizes share every attempt", () => {
    expect(winOdds([{ weight: 1 }, { weight: 3 }], 0)).toEqual([0.25, 0.75]);
  });

  it("formats as a readable percentage", () => {
    expect(formatOdds(0.05)).toBe("5.0%");
    expect(formatOdds(0.4)).toBe("40%");
    expect(formatOdds(0.0004)).toBe("<0.1%");
    expect(formatOdds(0)).toBe("0%");
    expect(formatOdds(null)).toBe("—");
  });
});

describe("campaign window", () => {
  it("starts today's campaigns now and runs to the end of the end day", () => {
    const now = new Date();
    const { startsAt, endsAt } = campaignWindow(todayInput(), addDays(2), now);
    expect(new Date(startsAt).getTime()).toBeGreaterThanOrEqual(now.getTime());
    expect(new Date(endsAt).getHours()).toBe(23);
    expect(campaignWindow(addDays(1), addDays(2)).startsAt).toBe(new Date(`${addDays(1)}T00:00:00`).toISOString());
  });
});
