/**
 * Company create/edit form. Limits mirror the API's `createCompanyBody` / `updateCompanyBody` and the
 * licence body (screen limit 1–10,000 whole screens).
 */
import { z } from "zod";
import type { Company, Schemas } from "@/lib/api/types";
import { intText, optionalPhone, optionalText, optionalUrl, phoneDigits, text, timezone } from "@/lib/validation/fields";

export const COMPANY_STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;
export const LICENSE_STATE_VALUES = ["ACTIVE", "SUSPENDED", "DISABLED", "EXPIRED"] as const;
export const SCREEN_LIMIT_MAX = 10_000;

export const screenLimit = () => intText(1, SCREEN_LIMIT_MAX, "Screen limit");

export const companySchema = z.object({
  name: text(120, 2),
  status: z.enum(COMPANY_STATUSES, { error: "Choose a status" }),
  plan: optionalText(60),
  website: optionalUrl(),
  industry: optionalText(80),
  phone: optionalPhone(),
  timezone: timezone(),
  screenLimit: screenLimit(),
  licenseState: z.enum(LICENSE_STATE_VALUES, { error: "Choose a licence status" }),
});
export type CompanyFormValues = z.input<typeof companySchema>;
type Parsed = z.output<typeof companySchema>;

export const companyDefaults = (c?: Company | null): CompanyFormValues => ({
  name: c?.name ?? "",
  status: c?.status ?? "ACTIVE",
  plan: c?.plan ?? "",
  website: c?.website ?? "",
  industry: c?.industry ?? "",
  phone: c?.phone ?? "",
  timezone: c?.timezone ?? "UTC",
  screenLimit: String(c?.license?.screenLimit ?? 10),
  licenseState: c?.license?.state ?? "ACTIVE",
});

/** POST /companies: blank optionals are omitted, phone sent as digits, limit as a number. */
export function createCompanyBody(v: Parsed): Schemas["CreateCompanyBody"] {
  return {
    name: v.name,
    status: v.status,
    timezone: v.timezone,
    screenLimit: Number(v.screenLimit),
    licenseState: v.licenseState,
    ...(v.plan ? { plan: v.plan } : {}),
    ...(v.website ? { website: v.website } : {}),
    ...(v.industry ? { industry: v.industry } : {}),
    ...(v.phone ? { phone: phoneDigits(v.phone) } : {}),
  };
}

/** PATCH /companies/:id: a cleared optional is sent as null so the stored value is removed. */
export function updateCompanyBody(v: Parsed): Schemas["UpdateCompanyBody"] {
  return {
    name: v.name,
    status: v.status,
    timezone: v.timezone,
    plan: v.plan || null,
    website: v.website || null,
    industry: v.industry || null,
    phone: v.phone ? phoneDigits(v.phone) : null,
  };
}

/** Type-the-name confirmation for deleting a company (exact name, surrounding spaces ignored). */
export const deleteCompanySchema = (companyName: string) =>
  z.object({ confirm: z.string().refine((v) => v.trim() === companyName.trim(), "Type the company name exactly as shown") });
