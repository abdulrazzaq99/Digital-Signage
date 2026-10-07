/**
 * Head Office push form, mirroring the API: title 2–120, a picture shows 3–600 seconds, an optional
 * date range whose end comes after its start, and who sees it. A template push needs a template.
 */
import { z } from "zod";
import { audienceField } from "@/components/targeting/audience";
import type { Schemas, Template } from "@/lib/api/types";
import { fromDateTimeInput } from "@/lib/format";
import { dateInput, intText, text } from "@/lib/validation/fields";

export const pushSchema = z
  .object({
    title: text(120, 2),
    source: z.enum(["upload", "template"]),
    templateId: z.string(),
    displaySec: intText(3, 600, "Seconds"),
    start: dateInput(false),
    end: dateInput(false),
    audience: audienceField(),
  })
  .superRefine((v, ctx) => {
    if (v.source === "template" && !v.templateId) ctx.addIssue({ code: "custom", path: ["templateId"], message: "Choose a template" });
    if (v.start && v.end && new Date(v.end) <= new Date(v.start)) ctx.addIssue({ code: "custom", path: ["end"], message: "Must be after the start" });
    if (v.end && new Date(v.end) <= new Date()) ctx.addIssue({ code: "custom", path: ["end"], message: "Must be in the future" });
  });
export type PushValues = z.input<typeof pushSchema>;

/** A template can be pushed straight to screens only if Head Office has given every required field a value. */
export const missingForPush = (t: Pick<Template, "fields">) => (t.fields ?? []).filter((f) => f.required && !f.locked && !f.default).map((f) => f.label);

export function toCreateBody(v: z.output<typeof pushSchema>, file: { fileKey: string; videoSec?: number; width?: number; height?: number } | null): Schemas["CreateBroadcastBody"] {
  return {
    title: v.title,
    // Only the upload's own fields: the dialog's file state carries more (its name) that the API refuses.
    ...(v.source === "template" ? { templateId: v.templateId } : file ? { fileKey: file.fileKey, ...(file.videoSec ? { videoSec: file.videoSec } : {}), ...(file.width ? { width: file.width } : {}), ...(file.height ? { height: file.height } : {}) } : {}),
    displaySec: Number(v.displaySec),
    audience: v.audience,
    ...(v.start ? { startsAt: fromDateTimeInput(v.start)! } : {}),
    ...(v.end ? { endsAt: fromDateTimeInput(v.end) } : {}),
  };
}
