import { describe, expect, it } from "vitest";
import { keyFromLabel, maskTemplateKey, templateSchema, toTemplateBody } from "./template-schema";

const field = { label: "Title", key: "title", type: "text" as const, required: true, max: "60" };
const base = { name: "Summer Sale", category: "Retail", orientation: "LANDSCAPE" as const, fields: [field] };
const issues = (v: object) => (templateSchema.safeParse({ ...base, ...v }).error?.issues ?? []).map((i) => `${i.path.join(".")}: ${i.message}`);

describe("template schema", () => {
  it("accepts a valid template", () => expect(issues({})).toEqual([]));

  it("requires unique slug keys", () => {
    expect(issues({ fields: [field, { ...field, label: "Other" }] })).toEqual(["fields.1.key: Keys must be unique"]);
    expect(issues({ fields: [{ ...field, key: "_bad_" }] })).toEqual(["fields.0.key: Use lower-case letters and numbers, with - or _ between words"]);
  });

  it("bounds labels, names, max and the field count", () => {
    expect(issues({ name: "A", fields: [{ ...field, label: "x".repeat(81), max: "2001" }] })).toEqual(["name: Must be at least 2 characters", "fields.0.label: Must be at most 80 characters", "fields.0.max: Must be at most 2000"]);
    expect(issues({ fields: Array.from({ length: 21 }, (_, i) => ({ ...field, key: `k${i}` })) })).toEqual(["fields: At most 20 fields"]);
    expect(issues({ fields: [] })).toEqual(["fields: Add at least one field"]);
  });

  it("omits max when blank or not a text field", () => {
    const body = toTemplateBody(templateSchema.parse({ ...base, fields: [{ ...field, max: "" }, { ...field, key: "bg", type: "color", max: "10" }] }));
    expect(body.fields).toEqual([{ key: "title", label: "Title", type: "text", required: true }, { key: "bg", label: "Title", type: "color", required: true }]);
  });

  it("derives keys from labels", () => {
    expect(keyFromLabel("Main Headline!")).toBe("main_headline");
    expect(maskTemplateKey("X".repeat(50))).toHaveLength(40);
  });
});
