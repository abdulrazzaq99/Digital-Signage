/**
 * Template definition rules, mirroring the API: name 2–120, category 2–60, 1–20 fields, each with a
 * label ≤80 and a unique slug key ≤40 (lower-case letters, digits, `-`/`_` between them). A text
 * field's `max` is 1–2000 characters, or blank for no limit (then omitted from the body).
 */
import { z } from "zod";
import { intText, text } from "@/lib/validation/fields";
import { maskKey } from "@/lib/validation/masks";
import type { Schemas } from "@/lib/api/types";

export const MAX_FIELDS = 20;
export const KEY_MAX = 40;
export const TEMPLATE_CATEGORIES = ["Retail", "Corporate", "Food & Beverage", "Event", "Hotel", "Announcement", "Travel", "Promotional"];
const SLUG = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/;

/** Key while typing: maskKey's character rules, capped at the API's 40. */
export const maskTemplateKey = (v: string) => maskKey(v).slice(0, KEY_MAX);
/** Label → suggested key: "Main Headline!" → "main_headline". */
export const keyFromLabel = (v: string) => maskTemplateKey(v).replace(/^_+|_+$/g, "");

export const templateBasicsSchema = z.object({
  name: text(120, 2),
  category: text(60, 2),
  orientation: z.enum(["LANDSCAPE", "PORTRAIT"]),
});

const fieldSchema = z.object({
  label: text(80),
  key: z.string().trim().min(1, "Required").max(KEY_MAX, `Must be at most ${KEY_MAX} characters`).regex(SLUG, "Use lower-case letters and numbers, with - or _ between words"),
  type: z.enum(["text", "image", "color"]),
  required: z.boolean(),
  max: z.string(),
}).superRefine((f, ctx) => {
  // Only text fields have a length limit; blank means none.
  if (f.type !== "text" || f.max.trim() === "") return;
  const r = intText(1, 2000, "Max length").safeParse(f.max);
  if (!r.success) ctx.addIssue({ code: "custom", path: ["max"], message: r.error.issues[0]?.message ?? "Invalid" });
});

export const templateSchema = templateBasicsSchema.extend({
  fields: z
    .array(fieldSchema)
    .min(1, "Add at least one field")
    .max(MAX_FIELDS, `At most ${MAX_FIELDS} fields`)
    .superRefine((fields, ctx) => {
      const seen = new Map<string, number>();
      fields.forEach((f, i) => {
        const k = f.key.trim();
        if (!k) return;
        if (seen.has(k)) ctx.addIssue({ code: "custom", path: [i, "key"], message: "Keys must be unique" });
        else seen.set(k, i);
      });
    }),
});
export type TemplateFormValues = z.input<typeof templateSchema>;

/** Parsed form → API body: `max` only for text fields with a limit. */
export function toTemplateBody(v: z.output<typeof templateSchema>): Schemas["CreateTemplateBody"] {
  return {
    name: v.name,
    category: v.category,
    orientation: v.orientation,
    fields: v.fields.map((f) => ({ key: f.key, label: f.label, type: f.type, required: f.required, ...(f.type === "text" && f.max.trim() !== "" ? { max: Number(f.max) } : {}) })),
  };
}
