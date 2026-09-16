import { describe, expect, it } from "vitest";
import { ApiError } from "./api/client";
import { errorMessage, fmtClock, formatBytes, formatDuration, label, timeAgo } from "./format";

describe("format", () => {
  it("labels enums", () => {
    expect(label("ONLINE")).toBe("Online");
    expect(label("TEMPLATE_INSTANCE")).toBe("Template Instance");
    expect(label(null)).toBe("—");
  });
  it("formats bytes and durations", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(2_500_000)).toBe("2.4 MB");
    expect(formatDuration(90)).toBe("1m 30s");
    expect(formatDuration(15)).toBe("15s");
    expect(fmtClock(90)).toBe("01:30");
  });
  it("formats relative time", () => {
    expect(timeAgo(null)).toBe("Never");
    expect(timeAgo(new Date(Date.now() - 10_000).toISOString())).toBe("Just now");
    expect(timeAgo(new Date(Date.now() - 120_000).toISOString())).toBe("2 min ago");
    expect(timeAgo(new Date(Date.now() - 3 * 3_600_000).toISOString())).toBe("3 hours ago");
  });
  it("gives friendly copy for known codes and falls back to the message", () => {
    expect(errorMessage(new ApiError(409, "LICENSE_LIMIT_REACHED", "x"))).toMatch(/licence/i);
    expect(errorMessage(new ApiError(400, "SOMETHING_ELSE", "Custom message"))).toBe("Custom message");
    expect(errorMessage(new Error("boom"))).toBe("boom");
    expect(errorMessage("weird")).toBe("Something went wrong.");
  });
});
