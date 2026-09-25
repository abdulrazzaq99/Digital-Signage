/**
 * Client-side field rules. They mirror the API's `src/core/validation/fields.ts` so a form rejects
 * what the API would reject before the request is sent; the API stays the authority and its
 * field errors are mapped back onto the form (see `applyApiError`).
 *
 * Form values are strings (inputs), so optional fields accept "" and numbers are parsed from text.
 */
import { z } from "zod";
import { COMMON_PASSWORDS } from "./common-passwords";

/** Trimmed, required text between `min` and `max` characters. */
export const text = (max: number, min = 1) =>
  z
    .string()
    .trim()
    .min(min, min === 1 ? "Required" : `Must be at least ${min} characters`)
    .max(max, `Must be at most ${max} characters`);

/** Optional text: "" is allowed and left for the submit handler to drop. */
export const optionalText = (max: number) => z.string().trim().max(max, `Must be at most ${max} characters`);

export const email = () => z.string().trim().toLowerCase().min(1, "Required").max(254, "Must be at most 254 characters").pipe(z.email("Enter a valid email address"));
export const optionalEmail = () => z.union([z.literal(""), email()]);

const PHONE = /^(\+[1-9]\d{6,14}|0\d{6,14})$/;
/** Digits with an optional leading +, as the API stores it. */
export const phoneDigits = (v: string) => v.replace(/[\s\-().]/g, "");
export const phone = () =>
  z
    .string()
    .trim()
    .min(1, "Required")
    .max(40)
    .refine((v) => PHONE.test(phoneDigits(v)), "Enter a valid phone number, e.g. +44 20 7946 0000");
export const optionalPhone = () => z.union([z.literal(""), phone()]);

export const isHttpUrl = (v: string) => {
  try {
    const u = new URL(v);
    return (u.protocol === "http:" || u.protocol === "https:") && u.hostname.includes(".");
  } catch {
    return false;
  }
};
export const url = () => z.string().trim().min(1, "Required").max(2048).refine(isHttpUrl, "Enter a valid URL starting with https://");
export const optionalUrl = () => z.union([z.literal(""), url()]);
export const optionalDeepLink = () =>
  z.union([z.literal(""), z.string().trim().max(500).refine((v) => /^\/[\w\-./?=&%#]*$/.test(v) || isHttpUrl(v), "Enter an app path like /offers/123 or an https URL")]);

export const hexColour = () => z.string().trim().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Enter a colour like #1a73e8");

const ZONES = typeof Intl.supportedValuesOf === "function" ? new Set([...Intl.supportedValuesOf("timeZone"), "UTC", "Etc/UTC"]) : null;
export const TIME_ZONES = ZONES ? [...ZONES].sort() : ["UTC"];
export const timezone = () => z.string().trim().min(1, "Required").refine((v) => !ZONES || ZONES.has(v), "Choose a valid time zone, e.g. Europe/London");

/** Whole number typed into a text/number input. */
export const intText = (min: number, max: number, label = "Value") =>
  z
    .string()
    .trim()
    .min(1, "Required")
    .regex(/^-?\d+$/, `${label} must be a whole number`)
    .refine((v) => Number(v) >= min, `Must be at least ${min}`)
    .refine((v) => Number(v) <= max, `Must be at most ${max}`);

/** Whole number held as a number (steppers, sliders). */
export const int = (min: number, max: number) => z.number({ error: "Must be a number" }).int("Must be a whole number").min(min, `Must be at least ${min}`).max(max, `Must be at most ${max}`);

/** Comma-separated tags: trimmed, lower-cased, de-duplicated, each 1–40 chars, at most 20. */
export const parseTags = (v: string) => [...new Set(v.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean))];
export const tagsText = () =>
  z
    .string()
    .refine((v) => parseTags(v).every((t) => t.length <= 40), "Tags must be at most 40 characters each")
    .refine((v) => parseTags(v).length <= 20, "At most 20 tags");

/** `<input type="date">` / `datetime-local` value that must parse. */
export const dateInput = (required = true) => (required ? z.string().min(1, "Required") : z.string()).refine((v) => !v || !Number.isNaN(new Date(v).getTime()), "Enter a valid date");

/** Adds "Must be after the start" on `endKey` when both values are set and end <= start. */
export function endAfterStart<T extends Record<string, unknown>>(startKey: keyof T & string, endKey: keyof T & string, toTime: (v: unknown) => number = (v) => new Date(String(v)).getTime()) {
  return (v: T, ctx: z.RefinementCtx) => {
    const s = v[startKey];
    const e = v[endKey];
    if (s && e && toTime(e) <= toTime(s)) ctx.addIssue({ code: "custom", path: [endKey], message: "Must be after the start" });
  };
}

export const notInPast = (v: string) => !v || new Date(v).getTime() >= Date.now() - 60_000;

/** New password: same rule as the API (8–128, a letter and a number, not a common password). */
export const password = () =>
  z
    .string()
    .min(8, "Must be at least 8 characters")
    .max(128, "Must be at most 128 characters")
    .regex(/[A-Za-z]/, "Must include a letter")
    .regex(/\d/, "Must include a number")
    .refine((v) => !COMMON_PASSWORDS.has(v.toLowerCase()), "This password is too common. Choose something less predictable");

export const passwordInput = () => z.string().min(1, "Required").max(128, "Must be at most 128 characters");

export const passwordUsesEmail = (pw: string, userEmail: string | undefined) => {
  const name = userEmail?.split("@")[0]?.toLowerCase() ?? "";
  return name.length >= 3 && pw.toLowerCase().includes(name);
};

/** Pairing code shown on a screen: 6 characters, letters and digits. */
export const pairingCode = () => z.string().trim().toUpperCase().regex(/^[A-HJ-NP-Z2-9]{6}$/, "Enter the 6-character code shown on the screen");

/** "" → undefined, for optional fields the API wants omitted rather than blank. */
export const blankToUndefined = <T,>(v: T | "") => (v === "" ? undefined : v);
