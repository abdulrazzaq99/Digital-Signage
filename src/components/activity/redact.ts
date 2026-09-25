/**
 * Activity `meta` is free-form JSON written by the API. Before it is shown, anything that looks like
 * a secret is hidden and email addresses are masked, however deeply they are nested.
 */
import { maskEmail } from "@/lib/validation/masks";

export const REDACTED = "••••••";
const SECRET_KEY = /pass(word|wd)?|token|secret|credential|key|authorization|cookie|otp/i;
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

export const isSecretKey = (k: string) => SECRET_KEY.test(k);
export const maskEmailsIn = (s: string) => s.replace(EMAIL, (m) => maskEmail(m));

/** A copy of `value` with secret-looking keys replaced and emails masked (depth-limited). */
export function redact(value: unknown, depth = 0): unknown {
  if (depth > 6) return "…";
  if (typeof value === "string") return maskEmailsIn(value);
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, isSecretKey(k) ? REDACTED : redact(v, depth + 1)]));
  return value;
}

/** One meta value as display text: redacted, arrays joined, objects as compact JSON. */
export function metaText(key: string, value: unknown): string {
  if (isSecretKey(key)) return REDACTED;
  const v = redact(value);
  if (v === null || v === undefined) return "—";
  if (Array.isArray(v)) return v.map((x) => (typeof x === "object" && x !== null ? JSON.stringify(x) : String(x))).join(", ");
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}
