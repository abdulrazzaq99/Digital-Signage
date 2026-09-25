/**
 * Company user create/edit form (portal Account → Users and admin Company → Users). Limits mirror
 * the API's `createUserBody` / `updateUserBody`.
 */
import { z } from "zod";
import type { Schemas, User } from "@/lib/api/types";
import { email, optionalPhone, optionalText, password, passwordUsesEmail, phoneDigits, text } from "@/lib/validation/fields";

export const userSchema = z
  .object({
    name: text(120, 2),
    email: email(),
    role: z.enum(["ADMIN", "EDITOR", "VIEWER"], { error: "Choose a role" }),
    title: optionalText(80),
    phone: optionalPhone(),
    /** Optional temporary password (create only): blank creates the user as invited. */
    password: z.union([z.literal(""), password()]),
    isActive: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.password && passwordUsesEmail(v.password, v.email)) ctx.addIssue({ code: "custom", path: ["password"], message: "Must not contain the user's email name" });
  });
export type UserFormValues = z.input<typeof userSchema>;
type Parsed = z.output<typeof userSchema>;

export const userDefaults = (u?: User): UserFormValues => ({
  name: u?.name ?? "",
  email: u?.email ?? "",
  role: u?.role ?? "EDITOR",
  title: u?.title ?? "",
  phone: u?.phone ?? "",
  password: "",
  isActive: u ? u.status !== "SUSPENDED" : true,
});

/** POST /users body: blank optionals are omitted, phone sent as digits. */
export function createUserBody(v: Parsed): Schemas["CreateUserBody"] {
  return {
    email: v.email,
    name: v.name,
    role: v.role,
    ...(v.title ? { title: v.title } : {}),
    ...(v.phone ? { phone: phoneDigits(v.phone) } : {}),
    ...(v.password ? { password: v.password } : {}),
  };
}

/** PATCH /users/:id body: blanks clear (null); your own role and status are never sent. */
export function updateUserBody(v: Parsed, isSelf: boolean): Schemas["UpdateUserBody"] {
  return {
    name: v.name,
    title: v.title || null,
    phone: v.phone ? phoneDigits(v.phone) : null,
    ...(isSelf ? {} : { role: v.role, isActive: v.isActive }),
  };
}
