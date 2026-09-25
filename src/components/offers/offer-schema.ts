/**
 * Offer form rules, mirroring the API's offer schema: title 3–120, summary 10–300, description
 * 10–2000, instructions 5–2000, up to 50 "included" / "steps" lines of ≤200 characters each, a
 * contact with a 2–120 character name and optional role (≤80), email, phone and hours (≤120), and an
 * optional availability window whose end must fall after its start.
 */
import { z } from "zod";
import { dateInput, endAfterStart, optionalEmail, optionalPhone, optionalText, phoneDigits, text } from "@/lib/validation/fields";
import { fromDateInput } from "@/lib/format";
import type { Schemas } from "@/lib/api/types";

/** The API accepts exactly these categories. */
export const OFFER_CATEGORIES = ["Hardware", "Software", "Services", "Support", "Retail & Shopping", "Food & Beverage", "Travel & Hospitality", "Technology", "Health & Wellness"] as const satisfies readonly Schemas["CreateOfferBody"]["category"][];
export const MAX_LINES = 50;
export const MAX_LINE = 200;

/** Textarea → list: one entry per non-blank line, trimmed. */
export const toLines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

const linesText = () =>
  z.string().superRefine((v, ctx) => {
    const ls = toLines(v);
    if (ls.length > MAX_LINES) ctx.addIssue({ code: "custom", message: `At most ${MAX_LINES} lines (you have ${ls.length})` });
    const long = ls.findIndex((l) => l.length > MAX_LINE);
    if (long >= 0) ctx.addIssue({ code: "custom", message: `Line ${long + 1} is longer than ${MAX_LINE} characters` });
  });

const DATES = ["start", "end"];

export const offerSchema = z
  .object({
    title: text(120, 3),
    category: z.enum(OFFER_CATEGORIES, { error: "Choose a category" }),
    summary: text(300, 10),
    description: text(2000, 10),
    instructions: text(2000, 5),
    included: linesText(),
    steps: linesText(),
    contactName: text(120, 2),
    contactRole: optionalText(80),
    contactEmail: optionalEmail(),
    contactPhone: optionalPhone(),
    contactHours: optionalText(120),
    start: dateInput(false),
    end: dateInput(false),
  })
  // Checked as soon as both dates parse, even while other fields are still invalid.
  .superRefine(endAfterStart("start", "end"), { when: (p) => !p.issues.some((i) => DATES.includes(String(i.path?.[0]))) });

export type OfferFormValues = z.input<typeof offerSchema>;
export type OfferParsed = z.output<typeof offerSchema>;

/** API field names → form names, so server errors land on the right input. */
export const OFFER_API_FIELDS: Record<string, string> = {
  startsAt: "start", endsAt: "end",
  "contact.name": "contactName", "contact.role": "contactRole", "contact.email": "contactEmail", "contact.phone": "contactPhone", "contact.hours": "contactHours",
};

/**
 * Parsed form → API body. Blank optional contact fields are omitted and the phone is sent as digits.
 * Blank dates are omitted on create and sent as null on edit (clearing a stored date).
 */
export function toOfferBody(v: OfferParsed, editing: boolean): Schemas["CreateOfferBody"] {
  const contact: Schemas["CreateOfferBody"]["contact"] = { name: v.contactName };
  if (v.contactRole) contact.role = v.contactRole;
  if (v.contactEmail) contact.email = v.contactEmail;
  if (v.contactPhone) contact.phone = phoneDigits(v.contactPhone);
  if (v.contactHours) contact.hours = v.contactHours;
  const body: Schemas["CreateOfferBody"] = {
    title: v.title, category: v.category, summary: v.summary, description: v.description, instructions: v.instructions,
    included: toLines(v.included), steps: toLines(v.steps), contact,
  };
  if (v.start || editing) body.startsAt = fromDateInput(v.start);
  if (v.end || editing) body.endsAt = fromDateInput(v.end);
  return body;
}
