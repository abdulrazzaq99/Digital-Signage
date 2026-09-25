/**
 * Schemas shared by the admin Settings page and the portal Account page: the signed-in user's
 * profile and the change-password form. Limits mirror the API (`users.schemas.ts`, `auth.schemas.ts`).
 */
import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { applyApiError } from "@/components/ui/form";
import { ApiError } from "@/lib/api/client";
import { email, intText, optionalPhone, optionalText, password, passwordInput, passwordUsesEmail, phoneDigits, text, timezone } from "@/lib/validation/fields";

export const profileSchema = z.object({ name: text(120, 2), title: optionalText(80), phone: optionalPhone() });
export type ProfileValues = z.input<typeof profileSchema>;

/** Form defaults from the signed-in user (stored phones are digits; show them grouped). */
export const profileDefaults = (u: { name?: string | null; title?: string | null; phone?: string | null } | null | undefined): ProfileValues => ({
  name: u?.name ?? "",
  title: u?.title ?? "",
  phone: u?.phone ?? "",
});

/** PATCH /users/me body: blanks clear the stored value (null), phones are sent as digits. */
export const profileBody = (v: z.output<typeof profileSchema>) => ({ name: v.name, title: v.title || null, phone: v.phone ? phoneDigits(v.phone) : null });

/** Current / new / confirm, with the API's password rule plus the checks only the client can make. */
export const passwordChangeSchema = (userEmail?: string | null) =>
  z
    .object({ currentPassword: passwordInput(), newPassword: password(), confirm: z.string().min(1, "Required") })
    .superRefine((v, ctx) => {
      if (v.newPassword === v.currentPassword) ctx.addIssue({ code: "custom", path: ["newPassword"], message: "Must be different from your current password" });
      else if (passwordUsesEmail(v.newPassword, userEmail ?? undefined)) ctx.addIssue({ code: "custom", path: ["newPassword"], message: "Must not contain your email name" });
      if (v.confirm !== v.newPassword) ctx.addIssue({ code: "custom", path: ["confirm"], message: "Passwords don't match" });
    });
export type PasswordChangeValues = z.input<ReturnType<typeof passwordChangeSchema>>;
export const passwordChangeDefaults: PasswordChangeValues = { currentPassword: "", newPassword: "", confirm: "" };

export const PASSWORD_HINT = "8–128 characters, with a letter and a number. Avoid common passwords.";

/** Wrong current password goes under "Current password"; rule failures under "New password"; the rest on the form. */
export function applyPasswordError(form: UseFormReturn<PasswordChangeValues, unknown, PasswordChangeValues>, e: unknown) {
  if (e instanceof ApiError && e.code === "PASSWORD_MISMATCH") {
    form.setError("currentPassword", { type: "server", message: "Current password is incorrect" });
    form.setFocus("currentPassword");
    return;
  }
  applyApiError(form, e);
}

/** Platform settings (admin Settings → General): validated like any form, but no API stores them yet. */
export const generalSchema = z.object({ platformName: text(120, 2), supportEmail: email(), timezone: timezone(), sessionTimeout: intText(5, 1440, "Session timeout") });
