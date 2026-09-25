import { describe, expect, it } from "vitest";
import { durationText, initialDuration, playlistEditorSchema, playlistNameSchema, secondsOf, toPlaylistBody } from "./playlist-schema";

const item = (duration: string) => ({ assetId: "a1", name: "Slide", type: "IMAGE" as const, thumbnailUrl: null, duration });

describe("playlist rules", () => {
  it("names are 2–120 characters and trimmed", () => {
    expect(playlistNameSchema.safeParse({ name: "  " }).success).toBe(false);
    expect(playlistNameSchema.safeParse({ name: "A" }).success).toBe(false);
    expect(playlistNameSchema.parse({ name: "  Summer  " }).name).toBe("Summer");
    expect(playlistNameSchema.safeParse({ name: "x".repeat(121) }).success).toBe(false);
  });

  it("durations are whole seconds from 1 to 3600", () => {
    const ok = (v: string) => durationText().safeParse(v).success;
    expect(ok("1")).toBe(true);
    expect(ok("3600")).toBe(true);
    expect(ok("0")).toBe(false);
    expect(ok("3601")).toBe(false);
    expect(ok("")).toBe(false);
    expect(ok("2.5")).toBe(false);
  });

  it("reports the invalid row and builds the API body from valid rows", () => {
    const bad = playlistEditorSchema.safeParse({ name: "Promo", items: [item("10"), item("0")] });
    expect(bad.success).toBe(false);
    expect(bad.error?.issues[0].path).toEqual(["items", 1, "duration"]);
    const good = playlistEditorSchema.parse({ name: " Promo ", items: [item("10"), item("3600")] });
    expect(toPlaylistBody(good)).toEqual({ name: "Promo", items: [{ assetId: "a1", durationSec: 10 }, { assetId: "a1", durationSec: 3600 }] });
  });

  it("starts videos at their length (capped) and others at 10 s; totals ignore half-typed values", () => {
    expect(initialDuration({ type: "VIDEO", durationSec: 42.4 })).toBe("42");
    expect(initialDuration({ type: "VIDEO", durationSec: 7200 })).toBe("3600");
    expect(initialDuration({ type: "IMAGE" })).toBe("10");
    expect(secondsOf("15")).toBe(15);
    expect(secondsOf("")).toBe(0);
    expect(secondsOf("9999")).toBe(0);
  });
});
