import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api/client";
import { isPairingCodeError, pairCodeSchema, screenSchema, toPairBody, toUpdateBody } from "./screen-form";

const screen = { name: "Lobby", location: "Floor 1", orientation: "LANDSCAPE" as const, tags: ["lobby"], groups: [{ id: "g1", name: "Main" }] };

describe("screen form", () => {
  it("validates name, location, tags and the pairing code", () => {
    const bad = screenSchema.safeParse({ name: "A", location: "x".repeat(121), groupId: "", orientation: "LANDSCAPE", tags: "x".repeat(41) });
    expect(bad.success).toBe(false);
    expect(bad.error?.issues.map((i) => i.path[0]).sort()).toEqual(["location", "name", "tags"]);
    expect(pairCodeSchema.safeParse({ code: "A7K9QX" }).success).toBe(true);
    expect(pairCodeSchema.safeParse({ code: "A7K9Q" }).success).toBe(false);
    expect(pairCodeSchema.safeParse({ code: "A7K9Q0" }).success).toBe(false); // 0 is not in the code alphabet
  });

  it("pair body omits blank optional fields and parses tags", () => {
    const v = screenSchema.parse({ name: " Lobby ", location: "  ", groupId: "", orientation: "PORTRAIT", tags: "Lobby, lobby, main" });
    expect(toPairBody("A7K9QX", v)).toEqual({ code: "A7K9QX", name: "Lobby", orientation: "PORTRAIT", tags: ["lobby", "main"] });
  });

  it("update body sends only changes, and null to clear location or group", () => {
    const same = screenSchema.parse({ name: "Lobby", location: "Floor 1", groupId: "g1", orientation: "LANDSCAPE", tags: "lobby" });
    expect(toUpdateBody(screen, same)).toEqual({});
    const cleared = screenSchema.parse({ name: "Lobby 2", location: "", groupId: "", orientation: "LANDSCAPE", tags: "" });
    expect(toUpdateBody(screen, cleared)).toEqual({ name: "Lobby 2", location: null, groupId: null, tags: [] });
  });

  it("recognises pairing-code failures", () => {
    expect(isPairingCodeError(new ApiError(400, "PAIRING_CODE_EXPIRED", "x"))).toBe(true);
    expect(isPairingCodeError(new ApiError(400, "VALIDATION_ERROR", "x"))).toBe(false);
  });
});
