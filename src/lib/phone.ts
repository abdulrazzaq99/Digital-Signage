/**
 * Phone numbers: one country list (flag, name, dialling code) and helpers built on libphonenumber-js,
 * so every phone field validates against the chosen country's real numbering rules and stores the
 * number in international E.164 form (+923001234567), which the API expects.
 */
import { AsYouType, getCountries, getCountryCallingCode, isValidPhoneNumber, parsePhoneNumberFromString, validatePhoneNumberLength, type CountryCode } from "libphonenumber-js";

export type { CountryCode };

export interface Country {
  code: CountryCode;
  name: string;
  dial: string;
  flag: string;
}

/** 🇵🇰 from "PK": each letter becomes its regional-indicator symbol. */
export const flagOf = (code: string) => String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));

const regionNames = typeof Intl.DisplayNames === "function" ? new Intl.DisplayNames(["en"], { type: "region" }) : null;

/** Every country libphonenumber knows, sorted by English name. */
export const COUNTRIES: Country[] = getCountries()
  .map((code) => ({ code, name: regionNames?.of(code) ?? code, dial: `+${getCountryCallingCode(code)}`, flag: flagOf(code) }))
  .sort((a, b) => a.name.localeCompare(b.name));

const BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c]));
export const countryByCode = (code: string | undefined) => (code ? BY_CODE.get(code as CountryCode) : undefined);

/** The browser's region (en-PK → PK) when it's a known country, else the fallback. */
export function defaultCountry(fallback: CountryCode = "GB"): CountryCode {
  if (typeof navigator === "undefined") return fallback;
  for (const tag of navigator.languages ?? [navigator.language]) {
    const region = tag?.split("-")[1]?.toUpperCase();
    if (region && BY_CODE.has(region as CountryCode)) return region as CountryCode;
  }
  return fallback;
}

/** Splits a stored E.164 number into its country and national digits for editing. */
export function splitPhone(e164: string | null | undefined, fallback: CountryCode): { country: CountryCode; national: string } {
  if (!e164) return { country: fallback, national: "" };
  const digits = e164.replace(/\D/g, "");
  if (e164.trim().startsWith("+")) {
    // An over-long paste (+1 212 555 0123 999) doesn't parse; drop trailing digits until the
    // country is recognised, so the code is never mistaken for part of the number.
    for (let n = digits.length; n >= 4; n--) {
      const parsed = parsePhoneNumberFromString(`+${digits.slice(0, n)}`);
      if (parsed?.country) return { country: parsed.country, national: parsed.nationalNumber };
    }
  }
  const parsed = parsePhoneNumberFromString(e164);
  if (parsed?.country) return { country: parsed.country, national: parsed.nationalNumber };
  return { country: fallback, national: digits };
}

/** Digits typed for a country → E.164 (+CC…), or "" when nothing was typed. A leading trunk 0 is dropped. */
export function toE164(country: CountryCode, national: string): string {
  const digits = national.replace(/\D/g, "");
  if (!digits) return "";
  const parsed = parsePhoneNumberFromString(digits, country);
  return parsed?.number ?? `+${getCountryCallingCode(country)}${digits.replace(/^0+/, "")}`;
}

/**
 * As-you-type grouping for the chosen country ("3001234567" → "300 1234567" for PK). Digits typed
 * with the trunk 0 use the national format; otherwise they're grouped as the international number
 * with the "+CC " prefix removed (the picker already shows the code).
 */
export function formatNational(country: CountryCode, digits: string): string {
  if (!digits) return "";
  if (digits.startsWith("0")) return new AsYouType(country).input(digits);
  const dial = getCountryCallingCode(country);
  return new AsYouType().input(`+${dial}${digits}`).replace(new RegExp(`^\\+${dial}\\s?`), "");
}

/**
 * Drops digits past the longest number the country's plan allows (10 for the US and UK), so typing
 * or pasting can't overflow the field or break its formatting. Countries with variable-length
 * numbers keep what their plan permits.
 */
export function clampDigits(country: CountryCode, digits: string): string {
  let d = digits.replace(/\D/g, "").slice(0, 17);
  while (d && validatePhoneNumberLength(d, country) === "TOO_LONG") d = d.slice(0, -1);
  return d;
}

/** True for a number that is valid in its country (E.164 input). */
export const isValidPhone = (e164: string) => {
  try {
    return isValidPhoneNumber(e164);
  } catch {
    return false;
  }
};

/** Stored number → "🇬🇧 +44 20 7946 0000" for display; unparseable values are shown as stored. */
export function displayPhone(value: string | null | undefined, withFlag = true): string {
  if (!value) return "—";
  const parsed = parsePhoneNumberFromString(value.startsWith("+") ? value : `+${value.replace(/^\+?/, "")}`);
  if (!parsed) return value;
  const text = parsed.formatInternational();
  return withFlag && parsed.country ? `${flagOf(parsed.country)} ${text}` : text;
}

/** "tel:" link target for a stored number. */
export const telHref = (value: string) => `tel:${value.replace(/[^\d+]/g, "")}`;
