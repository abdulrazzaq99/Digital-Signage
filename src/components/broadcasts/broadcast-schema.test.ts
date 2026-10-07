import { describe, expect, it } from "vitest";
import { missingForPush, pushSchema, toCreateBody } from "./broadcast-schema";

const base = { title: "Extra Gum", source: "upload" as const, templateId: "", displaySec: "10", start: "", end: "", audience: { kind: "all" as const } };
const issues = (v: object) => (pushSchema.safeParse({ ...base, ...v }).error?.issues ?? []).map((i) => `${i.path.join(".")}: ${i.message}`);

describe("push form", () => {
  it("accepts a picture for everyone, now", () => expect(issues({})).toEqual([]));
  it("checks seconds, template choice and dates", () => {
    expect(issues({ displaySec: "2" })).toEqual(["displaySec: Must be at least 3"]);
    expect(issues({ source: "template" })).toEqual(["templateId: Choose a template"]);
    expect(issues({ start: "2030-01-02T10:00", end: "2030-01-02T09:00" })).toEqual(["end: Must be after the start"]);
    expect(issues({ end: "2020-01-01T10:00" })).toContain("end: Must be in the future");
    expect(issues({ audience: { kind: "categories", categoryIds: [] } })).toEqual(["audience.categoryIds: Choose at least one category"]);
  });
  it("builds the body for a file or a template", () => {
    const v = pushSchema.parse({ ...base, end: "2030-01-02T10:00" });
    const body = toCreateBody(v, { fileKey: "head-office/broadcasts/a/x.mp4", videoSec: 12, name: "x.mp4" } as Parameters<typeof toCreateBody>[1]);
    expect(body).not.toHaveProperty("name");
    expect(body).toMatchObject({ title: "Extra Gum", fileKey: "head-office/broadcasts/a/x.mp4", videoSec: 12, displaySec: 10, audience: { kind: "all" }, endsAt: expect.any(String) });
    expect(toCreateBody(pushSchema.parse({ ...base, source: "template", templateId: "ct1" }), null)).toEqual({ title: "Extra Gum", templateId: "ct1", displaySec: 10, audience: { kind: "all" } });
  });
  it("says which template fields still need Head Office values", () => {
    expect(missingForPush({ fields: [{ key: "a", label: "Price", type: "text", required: true, locked: false }, { key: "b", label: "Title", type: "text", required: true, locked: false, default: "Gum" }] })).toEqual(["Price"]);
  });
});
