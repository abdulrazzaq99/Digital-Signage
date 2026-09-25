"use client";
import { Button } from "@/components/ui/button";
import { applyApiError, Field, FormError, SubmitButton, useZodForm } from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/input";
import { useResetPassword } from "@/lib/api/hooks/auth";
import { ApiError } from "@/lib/api/client";
import { password } from "@/lib/validation/fields";
import { z } from "zod";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

/**
 * Landing page for emailed password links (forgot-password and user invites):
 * `/reset-password?token=…`. The mobile apps claim the same URL as a Universal / App Link.
 */
const resetSchema = z
  .object({ password: password(), confirm: z.string().min(1, "Required") })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords don't match" });

function ResetForm() {
  const token = useSearchParams().get("token") ?? "";
  const [done, setDone] = useState(false);
  const reset = useResetPassword();
  const form = useZodForm(resetSchema, { defaultValues: { password: "", confirm: "" } });
  const { register, formState } = form;
  const expired = reset.error instanceof ApiError && reset.error.code === "RESET_INVALID";
  const submit = form.handleSubmit(async (v) => {
    try {
      await reset.mutateAsync({ token, password: v.password });
      setDone(true);
    } catch (e) {
      if (!(e instanceof ApiError && e.code === "RESET_INVALID")) applyApiError(form, e);
    }
  });

  if (done) {
    return (
      <div className="space-y-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600"><CheckCircle2 className="h-5 w-5" /></div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Password saved</h1>
          <p className="mt-1.5 text-sm text-slate-500">You can now sign in with your new password. Any other signed-in devices have been signed out.</p>
        </div>
        <Button href="/login" size="lg" className="w-full">Sign In</Button>
      </div>
    );
  }

  if (!token || expired) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{token ? "This link has expired" : "This link is incomplete"}</h1>
          <p className="mt-1.5 text-sm text-slate-500">Password links can be used once. Reset links last an hour and invitation links last 7 days. Request a new link to continue.</p>
        </div>
        <Button href="/forgot-password" size="lg" className="w-full">Request a New Link</Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
      </Link>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Set your password</h1>
        <p className="mt-1.5 text-sm text-slate-500">Choose a password for your Digital Signage account.</p>
      </div>
      <FormError form={form} />
      <Field label="New password" required hint="At least 8 characters, with a letter and a number." error={formState.errors.password?.message}>
        <PasswordInput autoComplete="new-password" maxLength={128} {...register("password")} />
      </Field>
      <Field label="Confirm password" required error={formState.errors.confirm?.message}>
        <PasswordInput autoComplete="new-password" maxLength={128} {...register("confirm")} />
      </Field>
      <SubmitButton form={form} size="lg" className="w-full">Save Password</SubmitButton>
    </form>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetForm /></Suspense>;
}
