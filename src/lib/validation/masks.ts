import { displayPhone } from "@/lib/phone";

/**
 * Input masks: pure string → string functions applied on every keystroke, so a field can only
 * ever hold characters its rule allows. Display masks at the bottom hide sensitive values.
 */

/** Phone: optional leading +, digits, spaces, brackets and dashes; single spaces; at most 20 chars. */
export const maskPhone = (v: string) => {
  const plus = v.trimStart().startsWith("+");
  const body = v.replace(/[^\d\s()-]/g, "").replace(/\s{2,}/g, " ").replace(/^\s+/, "");
  return ((plus ? "+" : "") + body).slice(0, 20);
};

/** Pairing code: upper-case, only the characters codes are made of (no I, O, 0, 1), 6 long. */
export const maskPairingCode = (v: string) => v.toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g, "").slice(0, 6);

/** Whole number: digits only, no leading zeros, at most `maxDigits`. */
export const maskInteger = (v: string, maxDigits = 9) => v.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, maxDigits);

/** Money / decimal: digits with one decimal point and at most `decimals` places. */
export const maskDecimal = (v: string, decimals = 2, maxDigits = 9) => {
  const [int = "", ...rest] = v.replace(/[^\d.]/g, "").split(".");
  const whole = int.replace(/^0+(?=\d)/, "").slice(0, maxDigits);
  return rest.length ? `${whole || "0"}.${rest.join("").slice(0, decimals)}` : whole;
};

/** Hex colour: always starts with #, hex digits only, at most 6 of them. */
export const maskHexColour = (v: string) => `#${v.replace(/[^0-9a-fA-F]/g, "").slice(0, 6)}`.toLowerCase();

/** Tags while typing: lower-case, letters/digits/spaces/dashes/commas only. */
export const maskTags = (v: string) => v.toLowerCase().replace(/[^\p{L}\p{N}\s,_-]/gu, "").replace(/,\s*,/g, ",");

/** Template field key: lower-case letters, digits and underscores. */
export const maskKey = (v: string) => v.toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_").slice(0, 60);

/** Collapses runs of spaces as the user types a name (leading/trailing trimmed on submit). */
export const maskName = (v: string) => v.replace(/\s{2,}/g, " ").replace(/^\s+/, "");

// ---- Display masks ----

/** s***@acmecorp.com */
export const maskEmail = (v: string | null | undefined) => (v ? v.replace(/^(.)[^@]*@/, "$1***@") : "—");

/** Long identifier → first 4 … last 4 (device ids, provider references). */
export const maskMiddle = (v: string | null | undefined, keep = 4) => (!v ? "—" : v.length <= keep * 2 + 1 ? v : `${v.slice(0, keep)}…${v.slice(-keep)}`);

/** 192.168.1.101 → 192.168.•.•; IPv6 keeps the first two groups. */
export const maskIp = (v: string | null | undefined) => {
  if (!v) return "—";
  if (v.includes(".")) return v.split(".").map((p, i) => (i < 2 ? p : "•")).join(".");
  return v.split(":").map((p, i) => (i < 2 ? p : "•")).join(":");
};

/** Stored number → "🇬🇧 +44 20 7946 0000", grouped by the country's own rules. */
export const formatPhone = (v: string | null | undefined) => displayPhone(v);
