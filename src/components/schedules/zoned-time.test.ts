import { describe, expect, it } from "vitest";
import { formatInZone, nowIn, scheduleInstants, scheduleSchema, zonedToInstant } from "./zoned-time";

describe("zonedToInstant", () => {
  it("reads the wall-clock time in the chosen zone, not the browser's", () => {
    expect(zonedToInstant("2030-01-15", "09:00", "Europe/London")!.toISOString()).toBe("2030-01-15T09:00:00.000Z");
    expect(zonedToInstant("2030-07-15", "09:00", "Europe/London")!.toISOString()).toBe("2030-07-15T08:00:00.000Z");
    expect(zonedToInstant("2030-07-15", "09:00", "America/New_York")!.toISOString()).toBe("2030-07-15T13:00:00.000Z");
    expect(zonedToInstant("2030-01-15", "09:00", "Asia/Karachi")!.toISOString()).toBe("2030-01-15T04:00:00.000Z");
    expect(zonedToInstant("2030-01-15", "09:00", "Asia/Kolkata")!.toISOString()).toBe("2030-01-15T03:30:00.000Z");
  });

  it("handles the days the clocks change", () => {
    // London springs forward at 01:00 UTC on 31 Mar 2030 and falls back at 01:00 UTC on 27 Oct 2030.
    expect(zonedToInstant("2030-03-31", "03:00", "Europe/London")!.toISOString()).toBe("2030-03-31T02:00:00.000Z");
    expect(zonedToInstant("2030-03-31", "00:30", "Europe/London")!.toISOString()).toBe("2030-03-31T00:30:00.000Z");
    expect(zonedToInstant("2030-10-27", "12:00", "Europe/London")!.toISOString()).toBe("2030-10-27T12:00:00.000Z");
  });

  it("round-trips through formatInZone", () => {
    const iso = zonedToInstant("2030-07-15", "09:30", "Australia/Sydney")!.toISOString();
    expect(formatInZone(iso, "Australia/Sydney")).toContain("09:30");
  });

  it("rejects malformed input", () => {
    expect(zonedToInstant("", "09:00", "UTC")).toBeNull();
    expect(zonedToInstant("2030-01-15", "9am", "UTC")).toBeNull();
  });
});

describe("schedule schema", () => {
  const now = Date.parse("2030-06-01T12:00:00Z");
  const schema = scheduleSchema(() => now);
  const issues = (v: object) => (schema.safeParse({ startDate: "2030-06-02", startTime: "09:00", endDate: "", endTime: "", timezone: "Europe/London", ...v }).error?.issues ?? []).map((i) => `${i.path.join(".")}: ${i.message}`);

  it("accepts an open-ended future schedule", () => {
    expect(issues({})).toEqual([]);
  });

  it("rejects a start in the past, judged in the chosen zone", () => {
    // 12:30 in London on 1 Jun is 11:30 UTC, before "now" (12:00 UTC).
    expect(issues({ startDate: "2030-06-01", startTime: "12:30" })).toEqual(["startTime: The start can't be in the past"]);
    // 12:30 in New York is 16:30 UTC, still ahead.
    expect(issues({ startDate: "2030-06-01", startTime: "12:30", timezone: "America/New_York" })).toEqual([]);
    expect(issues({ startDate: "2030-05-30" })).toEqual(["startDate: The start can't be in the past"]);
  });

  it("requires the end after the start", () => {
    expect(issues({ endDate: "2030-06-02", endTime: "08:00" })).toEqual(["endTime: Must be after the start"]);
    expect(issues({ endDate: "2030-06-01" })).toEqual(["endDate: Must be after the start"]);
    expect(issues({ endDate: "2030-06-02", endTime: "17:00" })).toEqual([]);
  });

  it("needs an end date when an end time is given, and a valid zone", () => {
    expect(issues({ endTime: "17:00" })).toEqual(["endDate: Add an end date, or clear the end time"]);
    expect(issues({ timezone: "Mars/Olympus" })).toEqual(["timezone: Choose a valid time zone, e.g. Europe/London"]);
  });

  it("builds instants in the chosen zone; a blank end time ends the day", () => {
    const v = schema.parse({ startDate: "2030-06-02", startTime: "09:00", endDate: "2030-06-03", endTime: "", timezone: "Europe/London" });
    expect(scheduleInstants(v)).toEqual({ startsAt: "2030-06-02T08:00:00.000Z", endsAt: "2030-06-03T22:59:00.000Z", timezone: "Europe/London" });
    expect(scheduleInstants({ ...v, endDate: "" }).endsAt).toBeNull();
  });

  it("nowIn gives the wall-clock date in a zone", () => {
    expect(nowIn("Pacific/Kiritimati", Date.parse("2030-06-01T12:00:00Z"))).toEqual({ date: "2030-06-02", time: "02:00" });
  });
});
