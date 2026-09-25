/**
 * Scratch & Win campaign form rules. Limits mirror the API's campaign schema: title 3–120,
 * description ≤2000, 1–100 attempts per user, lose weight 0–1,000,000, and per prize a name ≤80,
 * value ≤40, quantity 1–1,000,000 and draw weight 1–1,000,000; at most 50 prizes.
 */
import { z } from "zod";
import { dateInput, intText, optionalText, text } from "@/lib/validation/fields";
import { todayInput } from "@/lib/format";

export const MAX_PRIZES = 50;

export const prizeSchema = z.object({
  name: text(80),
  value: optionalText(40),
  quantity: intText(1, 1_000_000, "Quantity"),
  weight: intText(1, 1_000_000, "Weight"),
});
export type PrizeValues = z.input<typeof prizeSchema>;

/** A prize row in the form: existing prizes keep their id; `weight` is "" when the server hasn't told us. */
const prizeRow = z.object({ id: z.string().optional(), name: z.string(), value: z.string(), quantity: z.string(), weight: z.string(), remaining: z.number().optional(), awarded: z.number().optional() });
export type PrizeRow = z.input<typeof prizeRow>;

const DATES = ["start", "end"];

/**
 * `editing` relaxes two rules: a running campaign's start may be in the past, and the lose weight
 * may be left blank to keep the stored value (the API doesn't return it).
 */
export function campaignSchema(editing: boolean, initialStart = "") {
  return z
    .object({
      title: text(120, 3),
      description: optionalText(2000),
      start: dateInput().refine((v) => editing ? v === initialStart || v >= todayInput() : v >= todayInput(), "The start can't be in the past"),
      end: dateInput(),
      maxAttempts: intText(1, 100, "Attempts"),
      requireOffersVisit: z.boolean(),
      loseWeight: editing ? z.union([z.literal(""), intText(0, 1_000_000, "Lose weight")]) : intText(0, 1_000_000, "Lose weight"),
      activate: z.boolean(),
      prizes: z.array(prizeRow).min(1, "Add at least one prize").max(MAX_PRIZES, `At most ${MAX_PRIZES} prizes`),
    })
    .superRefine(
      (v, ctx) => {
        // Date inputs: the campaign runs to the end of the end day, so the same day is allowed.
        if (v.start && v.end && v.end < v.start) ctx.addIssue({ code: "custom", path: ["end"], message: "Must be on or after the start date" });
      },
      // Check the range as soon as the dates themselves are valid, even while other steps are incomplete.
      { when: (p) => !p.issues.some((i) => DATES.includes(String(i.path?.[0]))) },
    );
}
export type CampaignValues = z.input<ReturnType<typeof campaignSchema>>;

/**
 * Chance of each prize on one attempt: its weight over (all in-stock prize weights + lose weight).
 * The server draws the same way, skipping prizes that are out of stock. `null` when a weight is unknown.
 */
export function winOdds(prizes: { weight: number | null; inStock?: boolean }[], loseWeight: number | null): (number | null)[] {
  if (loseWeight === null || prizes.some((p) => p.inStock !== false && p.weight === null)) return prizes.map(() => null);
  const total = loseWeight + prizes.reduce((a, p) => a + (p.inStock === false ? 0 : p.weight ?? 0), 0);
  return prizes.map((p) => (p.inStock === false || total <= 0 ? 0 : (p.weight ?? 0) / total));
}

/** 0.0512 → "5.1%", tiny non-zero chances → "<0.1%". */
export const formatOdds = (p: number | null) => (p === null ? "—" : p === 0 ? "0%" : p < 0.001 ? "<0.1%" : `${(p * 100).toFixed(p < 0.1 ? 1 : 0)}%`);

/** Date input values → the API's instants: a start of today means "now" (the API rejects past starts); the end is the end of that day. */
export function campaignWindow(start: string, end: string, now = new Date()) {
  const startsAt = start === todayInput() ? new Date(now.getTime() + 5_000).toISOString() : new Date(`${start}T00:00:00`).toISOString();
  const endsAt = new Date(`${end}T23:59:59`).toISOString();
  return { startsAt, endsAt };
}
